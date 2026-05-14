"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GAMES } from "@/lib/games/registry";

export interface DailyPick {
  teamId: string;
  pickDate: string;
  gameKey: string;
  pickedBy: string;
  pickedByUsername: string;
  pickedByName: string | null;
  pickedAt: string;
}

/**
 * Lee los game_keys que la patrulla ya tuvo asignados durante la temporada activa.
 * Se usa para excluirlos de la ruleta (no se repite el mismo juego en la semana).
 */
export async function getWeeklyPickedKeys(
  teamId: string,
  jamboreeId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_picks")
    .select("game_key")
    .eq("team_id", teamId)
    .eq("jamboree_id", jamboreeId);
  if (!data) return new Set();
  return new Set(data.map((r) => (r as { game_key: string }).game_key));
}

/** Lee el pick de hoy para la patrulla del usuario. null = nadie ha disparado la ruleta. */
export async function getDailyPick(teamId: string): Promise<DailyPick | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_daily_pick", {
    p_team_id: teamId,
  });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    teamId: row.team_id as string,
    pickDate: row.pick_date as string,
    gameKey: row.game_key as string,
    pickedBy: row.picked_by as string,
    pickedByUsername: row.picked_by_username as string,
    pickedByName: (row.picked_by_name as string | null) ?? null,
    pickedAt: row.picked_at as string,
  };
}

export interface SpinDailyPickResult {
  ok: boolean;
  error?: string;
  first?: boolean;
  bonusAwarded?: number;
  pick?: DailyPick;
}

/**
 * Intenta reclamar el pick del día para `teamId` con `gameKey`.
 * - Si nadie ha elegido aún hoy: inserta y devuelve `first: true` con +10 puntos.
 * - Si otro miembro ya eligió: devuelve `first: false` con el pick real.
 */
export async function spinDailyPick(
  teamId: string,
  gameKey: string,
): Promise<SpinDailyPickResult> {
  const liveGame = GAMES.find(
    (g) => g.key === gameKey && g.status === "live" && g.route,
  );
  if (!liveGame) {
    return { ok: false, error: "invalid_game" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "unauthenticated" };
  }

  // Defense in depth: bloquear repeticiones de juego dentro del jamboree.
  const { data: jamboree } = await supabase.rpc("ensure_active_jamboree");
  const jamRow = Array.isArray(jamboree) ? jamboree[0] : jamboree;
  if (jamRow?.id) {
    const { data: prior } = await supabase
      .from("daily_picks")
      .select("game_key")
      .eq("team_id", teamId)
      .eq("jamboree_id", jamRow.id);
    const usedKeys = new Set((prior ?? []).map((r) => (r as { game_key: string }).game_key));
    if (usedKeys.has(gameKey)) {
      return { ok: false, error: "game_already_played_this_week" };
    }
  }

  const { data, error } = await supabase.rpc("claim_daily_pick", {
    p_team_id: teamId,
    p_game_key: gameKey,
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { ok: false, error: "no_row" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/play");
  revalidatePath("/leaderboard");
  revalidatePath("/leaderboard/patrulla");

  return {
    ok: true,
    first: row.first as boolean,
    bonusAwarded: (row.bonus_awarded as number) ?? 0,
    pick: {
      teamId: row.team_id as string,
      pickDate: row.pick_date as string,
      gameKey: row.game_key as string,
      pickedBy: row.picked_by as string,
      pickedByUsername: row.picked_by_username as string,
      pickedByName: (row.picked_by_name as string | null) ?? null,
      pickedAt: row.picked_at as string,
    },
  };
}
