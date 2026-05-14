"use server";

import { createClient } from "@/lib/supabase/server";

export interface ChatMessage {
  id: string;
  teamId: string;
  userId: string;
  body: string;
  gameKey: string | null;
  createdAt: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isMe: boolean;
}

export interface MyTeamForChat {
  teamId: string;
  name: string;
  color: string | null;
  emblem: string | null;
}

/** Devuelve la patrulla principal del usuario actual (la primera por joined_at). */
export async function getMyTeamForChat(): Promise<MyTeamForChat | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("team_members")
    .select("team_id, joined_at, teams ( id, name, color, emblem )")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const teams = (data as { teams: unknown }).teams;
  const t = Array.isArray(teams) ? teams[0] : teams;
  if (!t) return null;
  const team = t as { id: string; name: string; color: string | null; emblem: string | null };
  return {
    teamId: team.id,
    name: team.name,
    color: team.color,
    emblem: team.emblem,
  };
}

/** Historial reciente del chat de una patrulla (orden cronológico ascendente). */
export async function getTeamChat(
  teamId: string,
  limit = 50,
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  type Row = {
    id: string;
    team_id: string;
    user_id: string;
    body: string;
    game_key: string | null;
    created_at: string;
    profiles:
      | { username: string; display_name: string | null; avatar_url: string | null }
      | { username: string; display_name: string | null; avatar_url: string | null }[]
      | null;
  };

  const { data, error } = await supabase
    .from("chat_messages")
    .select(
      `
      id, team_id, user_id, body, game_key, created_at,
      profiles:profiles!user_id ( username, display_name, avatar_url )
    `,
    )
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Row[]>();

  if (error || !data) return [];

  const messages: ChatMessage[] = data
    .map((row) => {
      const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        teamId: row.team_id,
        userId: row.user_id,
        body: row.body,
        gameKey: row.game_key,
        createdAt: row.created_at,
        username: p?.username ?? "scout",
        displayName: p?.display_name ?? null,
        avatarUrl: p?.avatar_url ?? null,
        isMe: row.user_id === user.id,
      };
    })
    .reverse();

  return messages;
}

export interface SendChatResult {
  ok: boolean;
  message?: ChatMessage;
  error?: string;
}

/** Envía un mensaje al chat de la patrulla. RLS restringe a miembros. */
export async function sendTeamChat(
  teamId: string,
  body: string,
  gameKey: string | null = null,
): Promise<SendChatResult> {
  const trimmed = body.trim().slice(0, 500);
  if (!trimmed) return { ok: false, error: "empty" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      team_id: teamId,
      user_id: user.id,
      body: trimmed,
      game_key: gameKey,
    })
    .select("id, team_id, user_id, body, game_key, created_at")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };

  // Enriquecer con perfil para devolverlo al cliente (optimistic confirm).
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    ok: true,
    message: {
      id: data.id as string,
      teamId: data.team_id as string,
      userId: data.user_id as string,
      body: data.body as string,
      gameKey: (data.game_key as string | null) ?? null,
      createdAt: data.created_at as string,
      username: (profile?.username as string) ?? "scout",
      displayName: (profile?.display_name as string | null) ?? null,
      avatarUrl: (profile?.avatar_url as string | null) ?? null,
      isMe: true,
    },
  };
}
