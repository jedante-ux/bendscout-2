import { createClient } from "@/lib/supabase/server";
import type { Team, Profile } from "@/types/database";

export interface TeamWithMembers extends Team {
  members: Array<
    Pick<Profile, "id" | "username" | "display_name" | "avatar_url" | "xp" | "rank">
    & { role: "owner" | "captain" | "member"; joined_at: string }
  >;
}

/**
 * Returns the user's current team (first match) or null.
 * Users can technically be in multiple, but the product treats one as primary.
 */
export async function getUserTeam(userId: string): Promise<Team | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("teams (*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  // Supabase types the nested select as either an object or array.
  const team = (data as { teams: Team | Team[] | null }).teams;
  if (!team) return null;
  if (Array.isArray(team)) return team[0] ?? null;
  return team;
}

/** Returns the team + its members (joined to profiles), or null. */
export async function getTeamWithMembers(
  teamId: string,
): Promise<TeamWithMembers | null> {
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .maybeSingle();

  if (!team) return null;

  const { data: rows } = await supabase
    .from("team_members")
    .select(
      `role, joined_at, profiles!inner ( id, username, display_name, avatar_url, xp, rank )`,
    )
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true });

  const members = (rows ?? []).map((r) => {
    const p = (r as unknown as { profiles: Profile | Profile[] }).profiles;
    const profile = Array.isArray(p) ? p[0] : p;
    return {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      xp: profile.xp,
      rank: profile.rank,
      role: (r as { role: "owner" | "captain" | "member" }).role,
      joined_at: (r as { joined_at: string }).joined_at,
    };
  });

  return { ...(team as Team), members };
}

export interface PatrolLeaderboardEntry {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "owner" | "captain" | "member";
  joinedAt: string;
  weeklyPoints: number;
  playsCount: number;
  lastPlayedAt: string | null;
  xp: number;
  level: number;
  isElectorToday: boolean;
  rankPosition: number;
}

/**
 * Leaderboard privado de una patrulla: ranking de SUS miembros (no entre patrullas).
 * Incluye miembros con 0 puntos (que no han jugado esta semana) al final.
 */
export async function getPatrolLeaderboard(
  teamId: string,
  jamboreeId: string | null,
  todayElectorId: string | null = null,
): Promise<PatrolLeaderboardEntry[]> {
  const supabase = await createClient();

  type RosterRow = {
    role: "owner" | "captain" | "member";
    joined_at: string;
    profiles:
      | { id: string; username: string; display_name: string | null; avatar_url: string | null; xp: number; rank: number }
      | { id: string; username: string; display_name: string | null; avatar_url: string | null; xp: number; rank: number }[];
  };

  const { data: roster } = await supabase
    .from("team_members")
    .select(
      `role, joined_at, profiles!inner ( id, username, display_name, avatar_url, xp, rank )`,
    )
    .eq("team_id", teamId)
    .returns<RosterRow[]>();

  const memberRows = (roster ?? []).map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      userId: p.id,
      username: p.username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      role: r.role,
      joinedAt: r.joined_at,
      xp: p.xp,
      level: p.rank,
    };
  });

  // Map userId -> jamboree_scores row (si existe).
  const scoresMap = new Map<
    string,
    { total_points: number; plays_count: number; last_played_at: string | null }
  >();

  if (jamboreeId && memberRows.length > 0) {
    const { data: scores } = await supabase
      .from("jamboree_scores")
      .select("user_id, total_points, plays_count, last_played_at")
      .eq("jamboree_id", jamboreeId)
      .in(
        "user_id",
        memberRows.map((m) => m.userId),
      );

    for (const s of scores ?? []) {
      scoresMap.set((s as { user_id: string }).user_id, {
        total_points: (s as { total_points: number }).total_points,
        plays_count: (s as { plays_count: number }).plays_count,
        last_played_at:
          ((s as { last_played_at: string | null }).last_played_at) ?? null,
      });
    }
  }

  const merged = memberRows.map((m) => ({
    ...m,
    weeklyPoints: scoresMap.get(m.userId)?.total_points ?? 0,
    playsCount: scoresMap.get(m.userId)?.plays_count ?? 0,
    lastPlayedAt: scoresMap.get(m.userId)?.last_played_at ?? null,
    isElectorToday: !!todayElectorId && todayElectorId === m.userId,
  }));

  merged.sort((a, b) => {
    if (b.weeklyPoints !== a.weeklyPoints) return b.weeklyPoints - a.weeklyPoints;
    if (b.xp !== a.xp) return b.xp - a.xp;
    return a.username.localeCompare(b.username);
  });

  return merged.map((m, i) => ({ ...m, rankPosition: i + 1 }));
}

export interface TeamSummary extends Team {
  memberCount: number;
}

/** All teams in the system with member counts. Used on /onboarding/team. */
export async function listTeamsWithCounts(): Promise<TeamSummary[]> {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: true });

  if (!teams) return [];

  // Count members in one query
  const { data: counts } = await supabase
    .from("team_members")
    .select("team_id");

  const countMap = new Map<string, number>();
  (counts ?? []).forEach((row) => {
    const teamId = (row as { team_id: string }).team_id;
    countMap.set(teamId, (countMap.get(teamId) ?? 0) + 1);
  });

  return teams.map((t) => ({
    ...(t as Team),
    memberCount: countMap.get((t as Team).id) ?? 0,
  }));
}
