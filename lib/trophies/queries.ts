import { createClient } from "@/lib/supabase/server";
import { TROPHIES, type TrophyDef } from "./registry";
import { getUserInsignias, countUnlocked } from "@/lib/insignias/queries";
import { getActiveJamboree } from "@/lib/games/queries";

export interface TrophyWithProgress {
  def: TrophyDef;
  /** Current progress value (not clamped — UI clamps for display). */
  progress: number;
  /** Convenience copy of `def.target`. */
  target: number;
  /** True when progress >= target. */
  unlocked: boolean;
  /**
   * ISO date string para el "Conseguido · …" — solo se calcula cuando el
   * trofeo está desbloqueado y tenemos un evento que lo respalde (la sesión
   * o `daily_play` que cruzó el umbral). `null` si está bloqueado o no
   * pudimos resolver una fecha exacta.
   */
  achievedAt: string | null;
}

function defOf(slug: string): TrophyDef {
  const def = TROPHIES.find((t) => t.slug === slug);
  if (!def) throw new Error(`Unknown trophy: ${slug}`);
  return def;
}

/**
 * Calcula el estado de todos los trofeos para `userId`. Cada trofeo se mide
 * sobre las tablas existentes (`profiles`, `game_sessions`, `daily_plays`,
 * `jamboree_scores`) + RPCs `get_user_stats` / `get_user_streak`, de modo
 * que no requiere una tabla dedicada.
 *
 * Devuelve los trofeos en el orden del registry.
 */
export async function getUserTrophies(
  userId: string,
): Promise<TrophyWithProgress[]> {
  const supabase = await createClient();

  // ---------- consultas base en paralelo --------------------------------
  const statsPromise = supabase.rpc("get_user_stats", { p_user_id: userId });

  // Total completed scoring sessions (primer-paso).
  const scoringCompletedPromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed")
    .eq("attempt_kind", "scoring");

  // Earliest completed session (primer-paso achievedAt + veloz-del-bosque).
  const firstSessionPromise = supabase
    .from("game_sessions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Primera sesión rápida (< 30 s) — veloz-del-bosque.
  const fastSessionPromise = supabase
    .from("game_sessions")
    .select("created_at, duration_ms")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gt("duration_ms", 0)
    .lt("duration_ms", 30_000)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // First team join (aullido).
  const firstTeamPromise = supabase
    .from("team_members")
    .select("team_id, joined_at")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Sesiones de law-shuffle completadas (maestro-de-la-ley).
  const lawShufflePromise = supabase
    .from("game_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("game_key", "law-shuffle")
    .eq("status", "completed");

  // 10ª sesión de law-shuffle para fechar el trofeo.
  const lawShuffleNthPromise = supabase
    .from("game_sessions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("game_key", "law-shuffle")
    .eq("status", "completed")
    .order("created_at", { ascending: true })
    .range(9, 9)
    .maybeSingle();

  // Juegos distintos jugados (cartografo).
  const distinctGamesPromise = supabase
    .from("game_sessions")
    .select("game_key, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  // Máximo score en una partida (puntuacion-perfecta).
  const topScorePromise = supabase
    .from("game_sessions")
    .select("score, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Última sesión (para fechar trofeos basados en XP/level/streak/insignias).
  const lastSessionPromise = supabase
    .from("game_sessions")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const [
    statsRes,
    scoringCompletedRes,
    firstSessionRes,
    fastSessionRes,
    firstTeamRes,
    lawShuffleRes,
    lawShuffleNthRes,
    distinctGamesRes,
    topScoreRes,
    lastSessionRes,
    insignias,
    activeJamboree,
  ] = await Promise.all([
    statsPromise,
    scoringCompletedPromise,
    firstSessionPromise,
    fastSessionPromise,
    firstTeamPromise,
    lawShufflePromise,
    lawShuffleNthPromise,
    distinctGamesPromise,
    topScorePromise,
    lastSessionPromise,
    getUserInsignias(userId),
    getActiveJamboree(),
  ]);

  // ---------- desempaquetar ---------------------------------------------
  const statsRow = Array.isArray(statsRes.data)
    ? (statsRes.data[0] as
        | { xp: number; level: number; streak_days: number }
        | undefined)
    : (statsRes.data as
        | { xp: number; level: number; streak_days: number }
        | undefined);
  const xp = statsRow?.xp ?? 0;
  const level = statsRow?.level ?? 1;
  const streakDays = statsRow?.streak_days ?? 0;

  const scoringCompleted = scoringCompletedRes.count ?? 0;
  const firstSessionAt =
    (firstSessionRes.data as { created_at: string } | null)?.created_at ?? null;
  const lastSessionAt =
    (lastSessionRes.data as { created_at: string } | null)?.created_at ?? null;
  const fastSession = fastSessionRes.data as {
    created_at: string;
    duration_ms: number;
  } | null;

  const firstTeam = firstTeamRes.data as {
    team_id: string;
    joined_at: string;
  } | null;

  const lawShuffleCount = lawShuffleRes.count ?? 0;
  const lawShuffleNthAt =
    (lawShuffleNthRes.data as { created_at: string } | null)?.created_at ??
    null;

  const distinctGames = new Set<string>();
  let cartografoAt: string | null = null;
  for (const row of (distinctGamesRes.data ?? []) as {
    game_key: string;
    created_at: string;
  }[]) {
    if (!distinctGames.has(row.game_key)) {
      distinctGames.add(row.game_key);
      if (distinctGames.size === 4 && cartografoAt === null) {
        cartografoAt = row.created_at;
      }
    }
  }

  const topScore =
    (topScoreRes.data as { score: number; created_at: string } | null) ?? null;

  const insigniasUnlocked = countUnlocked(insignias);

  // ---------- top-jamboree / top-patrulla -------------------------------
  // Necesitamos saber si este usuario es #1 del jamboree activo
  // (overall) o #1 dentro de su patrulla.
  let isJamboreeTop = false;
  let isTeamTop = false;
  let jamboreeUpdatedAt: string | null = null;

  if (activeJamboree) {
    const { data: topUserRow } = await supabase
      .from("jamboree_scores")
      .select("user_id, total_points, last_played_at")
      .eq("jamboree_id", activeJamboree.id)
      .order("total_points", { ascending: false })
      .limit(1)
      .maybeSingle();

    const topUser = topUserRow as
      | { user_id: string; total_points: number; last_played_at: string | null }
      | null;
    if (topUser && topUser.user_id === userId && topUser.total_points > 0) {
      isJamboreeTop = true;
      jamboreeUpdatedAt = topUser.last_played_at;
    }

    // Top en patrulla — solo si pertenece a una.
    if (firstTeam) {
      const { data: teamTopRow } = await supabase
        .from("jamboree_scores")
        .select("user_id, total_points, last_played_at")
        .eq("jamboree_id", activeJamboree.id)
        .eq("team_id", firstTeam.team_id)
        .order("total_points", { ascending: false })
        .limit(1)
        .maybeSingle();
      const teamTop = teamTopRow as
        | {
            user_id: string;
            total_points: number;
            last_played_at: string | null;
          }
        | null;
      if (teamTop && teamTop.user_id === userId && teamTop.total_points > 0) {
        isTeamTop = true;
        // Reutiliza jamboreeUpdatedAt si ya lo tenemos, sino del registro de patrulla.
        jamboreeUpdatedAt = jamboreeUpdatedAt ?? teamTop.last_played_at;
      }
    }
  }

  // ---------- ensamblar resultado ---------------------------------------
  const progressBySlug: Record<
    string,
    { progress: number; achievedAt: string | null }
  > = {
    "primer-paso": {
      progress: scoringCompleted,
      achievedAt: firstSessionAt,
    },
    aullido: {
      progress: firstTeam ? 1 : 0,
      achievedAt: firstTeam?.joined_at ?? null,
    },
    "veloz-del-bosque": {
      progress: fastSession ? 1 : 0,
      achievedAt: fastSession?.created_at ?? null,
    },
    "maestro-de-la-ley": {
      progress: lawShuffleCount,
      achievedAt: lawShuffleCount >= 10 ? lawShuffleNthAt : null,
    },
    coleccionista: {
      progress: insigniasUnlocked,
      achievedAt: insigniasUnlocked >= 10 ? lastSessionAt : null,
    },
    cartografo: {
      progress: distinctGames.size,
      achievedAt: cartografoAt,
    },
    "llama-eterna": {
      progress: streakDays,
      achievedAt: streakDays >= 5 ? lastSessionAt : null,
    },
    "top-patrulla": {
      progress: isTeamTop ? 1 : 0,
      achievedAt: isTeamTop ? jamboreeUpdatedAt : null,
    },
    "sabio-scout": {
      progress: xp,
      achievedAt: xp >= 5000 ? lastSessionAt : null,
    },
    "leyenda-scout": {
      progress: level,
      achievedAt: level >= 10 ? lastSessionAt : null,
    },
    "top-jamboree": {
      progress: isJamboreeTop ? 1 : 0,
      achievedAt: isJamboreeTop ? jamboreeUpdatedAt : null,
    },
    "puntuacion-perfecta": {
      progress: topScore?.score ?? 0,
      achievedAt: (topScore?.score ?? 0) >= 300 ? topScore?.created_at ?? null : null,
    },
  };

  return TROPHIES.map((d) => {
    const p = progressBySlug[d.slug] ?? { progress: 0, achievedAt: null };
    const unlocked = p.progress >= d.target;
    return {
      def: defOf(d.slug),
      progress: p.progress,
      target: d.target,
      unlocked,
      achievedAt: unlocked ? p.achievedAt : null,
    };
  });
}

/** Total de trofeos desbloqueados. */
export function countUnlockedTrophies(rows: TrophyWithProgress[]): number {
  return rows.filter((r) => r.unlocked).length;
}
