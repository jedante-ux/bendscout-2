"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  AttemptKind,
  FinishAttemptResult,
  StartAttemptResult,
} from "@/types/database";

/**
 * Inicia un intento para el usuario actual en `gameKey`.
 *
 * El RPC `start_attempt` decide qué intento toca (práctica / scoring #1 / #2)
 * y crea la fila `game_sessions` en estado `in_progress`. Si el usuario
 * ya jugó otro minijuego hoy o si agotó los intentos del actual, devuelve
 * `blocked: true` con la razón.
 */
export async function startAttempt(
  gameKey: string,
): Promise<StartAttemptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { blocked: true, reason: "unauthenticated", jamboreeId: null };
  }

  const { data, error } = await supabase.rpc("start_attempt", {
    p_game_key: gameKey,
  });
  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error("start_attempt returned no row");
  }

  if (row.blocked) {
    return {
      blocked: true,
      reason: row.reason as "already_played_other_game" | "attempts_exhausted",
      jamboreeId: row.jamboree_id ?? null,
    };
  }

  return {
    blocked: false,
    sessionId: row.session_id,
    attemptKind: row.attempt_kind as AttemptKind,
    attemptNo: row.attempt_no as 1 | 2,
    jamboreeId: row.jamboree_id,
  };
}

/**
 * Cierra un intento. El RPC `finish_attempt` actualiza la sesión a
 * `completed`, recalcula `daily_plays` y aplica el delta atómicamente a
 * `jamboree_scores` + `jamboree_team_scores` (best-of-2 + práctica + MVP).
 */
export async function finishAttempt(
  sessionId: string,
  score: number,
  durationMs: number,
): Promise<FinishAttemptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("finish_attempt", {
    p_session_id: sessionId,
    p_score: Math.max(0, Math.floor(score)),
    p_duration_ms: Math.max(0, Math.floor(durationMs)),
  });
  if (error) throw new Error(error.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("finish_attempt returned no row");

  return {
    dayTotal: row.day_total,
    weeklyTotal: row.weekly_total,
    teamWeekly: row.team_weekly,
    attemptKind: row.attempt_kind as AttemptKind,
    attemptNo: row.attempt_no as 1 | 2,
  };
}
