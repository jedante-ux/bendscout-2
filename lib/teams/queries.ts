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
