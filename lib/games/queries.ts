import { createClient } from "@/lib/supabase/server";
import type { Jamboree } from "@/types/database";

export interface UserStats {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  streakDays: number;
  weeklyPoints: number;
  weeklyPlays: number;
}

/** Stats agregados del usuario (XP lifetime, nivel, racha, jamboree actual). */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_user_stats", {
    p_user_id: userId,
  });
  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    xp: row.xp as number,
    level: row.level as number,
    xpIntoLevel: row.xp_into_level as number,
    xpToNext: row.xp_to_next as number,
    streakDays: row.streak_days as number,
    weeklyPoints: row.weekly_points as number,
    weeklyPlays: row.weekly_plays as number,
  };
}

export interface RecentSession {
  id: string;
  game_key: string;
  category: string;
  difficulty: string;
  score: number;
  attempt_kind: "practice" | "scoring";
  attempt_no: 1 | 2;
  status: "in_progress" | "completed" | "abandoned";
  created_at: string;
}

/** Últimas sesiones de un usuario (para el feed "Actividad reciente"). */
export async function getRecentSessions(
  userId: string,
  limit = 10,
): Promise<RecentSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_sessions")
    .select(
      "id, game_key, category, difficulty, score, attempt_kind, attempt_no, status, created_at",
    )
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as RecentSession[];
}

/** Jamboree activo (temporada semanal). */
export async function getActiveJamboree(): Promise<Jamboree | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jamborees")
    .select("*")
    .eq("is_active", true)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Jamboree) ?? null;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  team_id: string | null;
  team_name: string | null;
  team_color: string | null;
  total_points: number;
  plays_count: number;
  rank_position: number;
}

/** Top scouts del jamboree activo. */
export async function getJamboreeLeaderboard(
  jamboreeId: string,
  limit = 20,
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jamboree_scores")
    .select(
      `
      user_id,
      team_id,
      total_points,
      plays_count,
      profiles!inner ( username, display_name, avatar_url ),
      teams ( name, color )
    `,
    )
    .eq("jamboree_id", jamboreeId)
    .order("total_points", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row, i) => {
    const profile = (row as { profiles: { username: string; display_name: string | null; avatar_url: string | null } | { username: string; display_name: string | null; avatar_url: string | null }[] }).profiles;
    const p = Array.isArray(profile) ? profile[0] : profile;
    const team = (row as { teams: { name: string; color: string | null } | { name: string; color: string | null }[] | null }).teams;
    const t = team ? (Array.isArray(team) ? team[0] : team) : null;
    return {
      user_id: (row as { user_id: string }).user_id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      team_id: (row as { team_id: string | null }).team_id,
      team_name: t?.name ?? null,
      team_color: t?.color ?? null,
      total_points: (row as { total_points: number }).total_points,
      plays_count: (row as { plays_count: number }).plays_count,
      rank_position: i + 1,
    };
  });
}

export interface TeamLeaderboardEntry {
  team_id: string;
  name: string;
  slug: string;
  color: string | null;
  emblem: string | null;
  avatar_url: string | null;
  total_points: number;
  members_active: number;
  rank_position: number;
}

/** Top patrullas del jamboree activo. */
export async function getTeamLeaderboard(
  jamboreeId: string,
  limit = 20,
): Promise<TeamLeaderboardEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jamboree_team_scores")
    .select(
      `
      team_id,
      total_points,
      members_active,
      teams!inner ( name, slug, color, emblem, avatar_url )
    `,
    )
    .eq("jamboree_id", jamboreeId)
    .order("total_points", { ascending: false })
    .limit(limit);

  type TeamShape = {
    name: string;
    slug: string;
    color: string | null;
    emblem: string | null;
    avatar_url: string | null;
  };

  return (data ?? []).map((row, i) => {
    const team = (row as { teams: TeamShape | TeamShape[] }).teams;
    const t = Array.isArray(team) ? team[0] : team;
    return {
      team_id: (row as { team_id: string }).team_id,
      name: t.name,
      slug: t.slug,
      color: t.color,
      emblem: t.emblem,
      avatar_url: t.avatar_url,
      total_points: (row as { total_points: number }).total_points,
      members_active: (row as { members_active: number }).members_active,
      rank_position: i + 1,
    };
  });
}
