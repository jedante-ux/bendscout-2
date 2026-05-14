import { createClient } from "@/lib/supabase/server";
import { MISSIONS, type MissionDef } from "./registry";
import { getActiveJamboree } from "@/lib/games/queries";

export interface MissionWithProgress extends MissionDef {
  /** Current progress value (count, xp, %, pts) — capped at `target`. */
  progress: number;
  /** True when progress >= target. */
  completed: boolean;
}

function getMission(slug: string): MissionDef {
  const m = MISSIONS.find((x) => x.slug === slug);
  if (!m) throw new Error(`Unknown mission: ${slug}`);
  return m;
}

/**
 * Returns the full mission set, each annotated with the current user's
 * progress. Progress is clamped to `[0, target]`.
 */
export async function getActiveMissions(
  userId: string,
): Promise<MissionWithProgress[]> {
  const supabase = await createClient();

  // --- Individual missions ---------------------------------------------
  const exploradorPromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed")
    .eq("attempt_kind", "scoring");

  const coleccionistaPromise = supabase
    .from("game_sessions")
    .select("game_key")
    .eq("user_id", userId)
    .eq("status", "completed");

  const rachaPromise = supabase.rpc("get_user_streak", { p_user_id: userId });

  const veteranoPromise = supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .maybeSingle();

  // --- Team prerequisites ----------------------------------------------
  // Need user's team (first joined) for both team missions.
  const userTeamPromise = supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const todayPromise = supabase.rpc("user_local_today", { p_user_id: userId });
  const activeJamboreePromise = getActiveJamboree();

  const [
    explorador,
    coleccionista,
    racha,
    veterano,
    userTeam,
    todayRes,
    activeJamboree,
  ] = await Promise.all([
    exploradorPromise,
    coleccionistaPromise,
    rachaPromise,
    veteranoPromise,
    userTeamPromise,
    todayPromise,
    activeJamboreePromise,
  ]);

  // ---- explorador-digital ---------------------------------------------
  const exploradorProgress = explorador.count ?? 0;

  // ---- coleccionista --------------------------------------------------
  const distinctGames = new Set<string>();
  (coleccionista.data ?? []).forEach((row) => {
    const key = (row as { game_key: string }).game_key;
    if (key) distinctGames.add(key);
  });
  const coleccionistaProgress = distinctGames.size;

  // ---- racha-ganadora -------------------------------------------------
  const rachaProgress =
    typeof racha.data === "number"
      ? racha.data
      : Number(racha.data ?? 0) || 0;

  // ---- veterano -------------------------------------------------------
  const veteranoProgress = (veterano.data as { xp: number } | null)?.xp ?? 0;

  // ---- aullido-coordinado (team) --------------------------------------
  const teamId = (userTeam.data as { team_id: string } | null)?.team_id ?? null;
  let aullidoProgress = 0;
  if (teamId) {
    const today = todayRes.data as string | null;

    // Members of the team
    const { data: members } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", teamId);

    const memberIds = (members ?? []).map(
      (r) => (r as { user_id: string }).user_id,
    );
    const teamSize = memberIds.length;

    if (teamSize > 0 && today) {
      const { data: plays } = await supabase
        .from("daily_plays")
        .select("user_id")
        .eq("local_play_date", today)
        .in("user_id", memberIds);

      const played = new Set<string>();
      (plays ?? []).forEach((p) =>
        played.add((p as { user_id: string }).user_id),
      );
      aullidoProgress = Math.round((played.size / teamSize) * 100);
    }
  }

  // ---- patrulla-en-racha (team) ---------------------------------------
  let patrullaProgress = 0;
  if (teamId && activeJamboree) {
    const { data: teamScore } = await supabase
      .from("jamboree_team_scores")
      .select("total_points")
      .eq("team_id", teamId)
      .eq("jamboree_id", activeJamboree.id)
      .maybeSingle();
    patrullaProgress =
      (teamScore as { total_points: number } | null)?.total_points ?? 0;
  }

  const raw: Record<string, number> = {
    "explorador-digital": exploradorProgress,
    coleccionista: coleccionistaProgress,
    "racha-ganadora": rachaProgress,
    veterano: veteranoProgress,
    "aullido-coordinado": aullidoProgress,
    "patrulla-en-racha": patrullaProgress,
  };

  return MISSIONS.map((m) => {
    const def = getMission(m.slug);
    const progress = Math.max(0, Math.min(def.target, raw[m.slug] ?? 0));
    return {
      ...def,
      progress,
      completed: progress >= def.target,
    };
  });
}
