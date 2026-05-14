import { createClient } from "@/lib/supabase/server";
import { INSIGNIAS, getInsignia, type InsigniaDef } from "./registry";

export interface InsigniaWithProgress {
  def: InsigniaDef;
  /** Current progress value (not clamped — UI clamps for display). */
  progress: number;
  /** Convenience copy of `def.target`. */
  target: number;
  /** True when `progress >= target`. */
  unlocked: boolean;
}

function mustGet(slug: string): InsigniaDef {
  const def = getInsignia(slug);
  if (!def) throw new Error(`Unknown insignia: ${slug}`);
  return def;
}

/**
 * Compute every insignia's unlock status for the given user. Progress is
 * derived on read from `profiles` + `game_sessions` (+ streak RPC) so we
 * don't need a dedicated table for the MVP.
 *
 * Returns the insignias in the same order as the registry.
 */
export async function getUserInsignias(
  userId: string,
): Promise<InsigniaWithProgress[]> {
  const supabase = await createClient();

  // Profile row (xp + rank).
  const profilePromise = supabase
    .from("profiles")
    .select("xp, rank")
    .eq("id", userId)
    .maybeSingle();

  // Total scoring sessions completed (naturalista).
  const scoringCompletedPromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed")
    .eq("attempt_kind", "scoring");

  // Total completed sessions across all attempt kinds (campista).
  const allCompletedPromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  // Distinct game keys touched (cartografo).
  const distinctGamesPromise = supabase
    .from("game_sessions")
    .select("game_key")
    .eq("user_id", userId);

  // Per-game completion counts.
  const knotRushPromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("game_key", "knot-rush")
    .eq("status", "completed");

  const firstResponsePromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("game_key", "first-response")
    .eq("status", "completed");

  const trailSignsPromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("game_key", "trail-signs")
    .eq("status", "completed");

  // Current streak.
  const streakPromise = supabase.rpc("get_user_streak", { p_user_id: userId });

  const [
    profileRes,
    scoringCompletedRes,
    allCompletedRes,
    distinctGamesRes,
    knotRushRes,
    firstResponseRes,
    trailSignsRes,
    streakRes,
  ] = await Promise.all([
    profilePromise,
    scoringCompletedPromise,
    allCompletedPromise,
    distinctGamesPromise,
    knotRushPromise,
    firstResponsePromise,
    trailSignsPromise,
    streakPromise,
  ]);

  const xp = (profileRes.data?.xp as number | undefined) ?? 0;
  const rank = (profileRes.data?.rank as number | undefined) ?? 1;
  const scoringCompleted = scoringCompletedRes.count ?? 0;
  const allCompleted = allCompletedRes.count ?? 0;
  const distinctGames = new Set(
    ((distinctGamesRes.data ?? []) as { game_key: string }[]).map(
      (r) => r.game_key,
    ),
  ).size;
  const knotRushCount = knotRushRes.count ?? 0;
  const firstResponseCount = firstResponseRes.count ?? 0;
  const trailSignsCount = trailSignsRes.count ?? 0;
  const streakDays =
    typeof streakRes.data === "number" ? (streakRes.data as number) : 0;

  const progressBySlug: Record<string, number> = {
    naturalista: scoringCompleted,
    guardian: xp,
    pionero: Math.min(rank, 3),
    explorador: rank,
    "llama-eterna": streakDays,
    cartografo: distinctGames,
    "maestro-de-nudos": knotRushCount,
    campista: allCompleted,
    "buen-samaritano": firstResponseCount,
    brujula: trailSignsCount,
    // Requires reviewing past jamboree positions — deferred for MVP.
    "top-3-semanal": 0,
    "sabio-scout": xp,
  };

  return INSIGNIAS.map((def) => {
    const progress = progressBySlug[def.slug] ?? 0;
    return {
      def: mustGet(def.slug),
      progress,
      target: def.target,
      unlocked: progress >= def.target,
    };
  });
}

/** Number of unlocked insignias in the given list. */
export function countUnlocked(insignias: InsigniaWithProgress[]): number {
  return insignias.filter((i) => i.unlocked).length;
}
