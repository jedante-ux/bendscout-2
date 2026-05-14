"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  AttemptKind,
  FinishAttemptResult,
  StartAttemptResult,
} from "@/types/database";

export interface GameDayStatus {
  authenticated: boolean;
  practiceDone: boolean;
  attempt1Score: number | null;
  attempt2Score: number | null;
  scoringAttemptsUsed: 0 | 1 | 2;
  scoringAttemptsRemaining: 0 | 1 | 2;
  bestScore: number;
  dayTotal: number;
  /** Otro minijuego ya jugado hoy bloquea este. */
  blockedByOtherGame: string | null;
}

/**
 * Lee el estado del día para `gameKey` sin mutar nada. Usado por la pantalla
 * de intro para mostrar el contador de intentos antes de iniciar.
 */
export async function getGameDayStatus(
  gameKey: string,
): Promise<GameDayStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const defaults: GameDayStatus = {
    authenticated: false,
    practiceDone: false,
    attempt1Score: null,
    attempt2Score: null,
    scoringAttemptsUsed: 0,
    scoringAttemptsRemaining: 2,
    bestScore: 0,
    dayTotal: 0,
    blockedByOtherGame: null,
  };

  if (!user) return defaults;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const tz = (profile?.timezone as string | undefined) ?? "UTC";

  const localDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const { data } = await supabase
    .from("daily_plays")
    .select(
      "game_key, practice_done, attempt_1_score, attempt_2_score, best_score, day_total",
    )
    .eq("user_id", user.id)
    .eq("local_play_date", localDateStr)
    .maybeSingle();

  if (!data) {
    return { ...defaults, authenticated: true };
  }

  const blockedByOtherGame =
    data.game_key && data.game_key !== gameKey ? (data.game_key as string) : null;

  const a1Used = data.attempt_1_score !== null;
  const a2Used = data.attempt_2_score !== null;
  const used = ((a1Used ? 1 : 0) + (a2Used ? 1 : 0)) as 0 | 1 | 2;
  const remaining = (2 - used) as 0 | 1 | 2;

  return {
    authenticated: true,
    practiceDone: data.practice_done ?? false,
    attempt1Score: (data.attempt_1_score as number | null) ?? null,
    attempt2Score: (data.attempt_2_score as number | null) ?? null,
    scoringAttemptsUsed: used,
    scoringAttemptsRemaining: remaining,
    bestScore: (data.best_score as number) ?? 0,
    dayTotal: (data.day_total as number) ?? 0,
    blockedByOtherGame,
  };
}

export interface GameScoreEntry {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  teamId: string | null;
  teamName: string | null;
  teamColor: string | null;
  bestScore: number;
  attemptKind: "practice" | "scoring";
  attemptNo: 1 | 2;
  lastAt: string;
  isMe: boolean;
}

/**
 * Top scores del día para `gameKey` — limitado por RLS a:
 *   - sesiones del usuario actual
 *   - sesiones de miembros de sus patrullas
 * Devuelve un row por usuario con su mejor puntaje del día (cualquier kind).
 */
export async function getGameTodayScores(
  gameKey: string,
  limit = 8,
): Promise<GameScoreEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const tz = (profile?.timezone as string | undefined) ?? "UTC";
  const localDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  type Row = {
    user_id: string;
    team_id: string | null;
    score: number;
    attempt_kind: "practice" | "scoring";
    attempt_no: 1 | 2;
    created_at: string;
    profiles:
      | { username: string; display_name: string | null; avatar_url: string | null }
      | { username: string; display_name: string | null; avatar_url: string | null }[]
      | null;
    teams:
      | { name: string; color: string | null }
      | { name: string; color: string | null }[]
      | null;
  };

  const { data, error } = await supabase
    .from("game_sessions")
    .select(
      `
      user_id, team_id, score, attempt_kind, attempt_no, created_at,
      profiles:profiles!user_id ( username, display_name, avatar_url ),
      teams ( name, color )
    `,
    )
    .eq("game_key", gameKey)
    .eq("local_play_date", localDateStr)
    .eq("status", "completed")
    .order("score", { ascending: false })
    .returns<Row[]>();

  if (error || !data) return [];

  // Quedarse con el mejor row por usuario.
  const byUser = new Map<string, Row>();
  for (const row of data) {
    const existing = byUser.get(row.user_id);
    if (!existing || row.score > existing.score) byUser.set(row.user_id, row);
  }

  const entries: GameScoreEntry[] = [...byUser.values()].map((row) => {
    const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const t = Array.isArray(row.teams) ? row.teams[0] : row.teams;
    return {
      userId: row.user_id,
      username: p?.username ?? "scout",
      displayName: p?.display_name ?? null,
      avatarUrl: p?.avatar_url ?? null,
      teamId: row.team_id,
      teamName: t?.name ?? null,
      teamColor: t?.color ?? null,
      bestScore: row.score,
      attemptKind: row.attempt_kind,
      attemptNo: row.attempt_no,
      lastAt: row.created_at,
      isMe: row.user_id === user.id,
    };
  });

  entries.sort((a, b) => b.bestScore - a.bestScore);
  return entries.slice(0, limit);
}

export interface MyGameHistoryEntry {
  sessionId: string;
  score: number;
  attemptKind: "practice" | "scoring";
  attemptNo: 1 | 2;
  durationMs: number;
  createdAt: string;
  localPlayDate: string | null;
}

/** Historial reciente del usuario para `gameKey` (sesiones completadas). */
export async function getMyGameHistory(
  gameKey: string,
  limit = 5,
): Promise<MyGameHistoryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("game_sessions")
    .select(
      "id, score, attempt_kind, attempt_no, duration_ms, created_at, local_play_date",
    )
    .eq("user_id", user.id)
    .eq("game_key", gameKey)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    sessionId: row.id as string,
    score: row.score as number,
    attemptKind: row.attempt_kind as "practice" | "scoring",
    attemptNo: row.attempt_no as 1 | 2,
    durationMs: row.duration_ms as number,
    createdAt: row.created_at as string,
    localPlayDate: (row.local_play_date as string | null) ?? null,
  }));
}

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
