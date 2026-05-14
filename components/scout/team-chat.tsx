"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type ChatMessage,
  type MyTeamForChat,
  getMyTeamForChat,
  getTeamChat,
  sendTeamChat,
} from "@/lib/chat/actions";
import { createClient } from "@/lib/supabase/client";
import { ScoutIcon } from "./icon";

interface TeamChatProps {
  gameKey?: string;
  className?: string;
}

export function TeamChat({ gameKey, className }: TeamChatProps) {
  const [team, setTeam] = useState<MyTeamForChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Cargar patrulla + historial inicial.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await getMyTeamForChat();
      if (cancelled) return;
      setTeam(t);
      if (t) {
        const history = await getTeamChat(t.teamId, 50);
        if (cancelled) return;
        history.forEach((m) => seenIdsRef.current.add(m.id));
        setMessages(history);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Suscripción Realtime para nuevos mensajes de la patrulla.
  useEffect(() => {
    if (!team) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:team:${team.teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `team_id=eq.${team.teamId}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            team_id: string;
            user_id: string;
            body: string;
            game_key: string | null;
            created_at: string;
          };
          if (seenIdsRef.current.has(row.id)) return;
          seenIdsRef.current.add(row.id);

          // Lookup author profile (small extra fetch — cached at client).
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", row.user_id)
            .maybeSingle();
          const { data: me } = await supabase.auth.getUser();
          const newMsg: ChatMessage = {
            id: row.id,
            teamId: row.team_id,
            userId: row.user_id,
            body: row.body,
            gameKey: row.game_key,
            createdAt: row.created_at,
            username: (profile?.username as string) ?? "scout",
            displayName: (profile?.display_name as string | null) ?? null,
            avatarUrl: (profile?.avatar_url as string | null) ?? null,
            isMe: me.user?.id === row.user_id,
          };
          setMessages((prev) => [...prev, newMsg]);
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team]);

  // Auto-scroll al final cuando entran mensajes.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const value = draft.trim();
      if (!team || !value || sending) return;
      setSending(true);
      setError(null);
      setDraft("");

      // Optimistic: insertamos el mensaje localmente con un id temporal
      // para que se vea de inmediato; al confirmar, lo reemplazamos.
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimistic: ChatMessage = {
        id: tempId,
        teamId: team.teamId,
        userId: "me",
        body: value,
        gameKey: gameKey ?? null,
        createdAt: new Date().toISOString(),
        username: "tú",
        displayName: null,
        avatarUrl: null,
        isMe: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await sendTeamChat(team.teamId, value, gameKey ?? null);
        if (!res.ok || !res.message) {
          console.error("[team-chat] sendTeamChat failed", res.error);
          setError(res.error ?? "No se pudo enviar");
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          setDraft(value);
          return;
        }
        // Reemplazar el optimista por el confirmado (id real, autor enriquecido).
        seenIdsRef.current.add(res.message.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.message! : m)),
        );
      } catch (err) {
        console.error("[team-chat] send error", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setDraft(value);
      } finally {
        setSending(false);
      }
    },
    [team, draft, sending, gameKey],
  );

  if (loading) {
    return (
      <section
        className={`scout-card vstack ${className ?? ""}`}
        style={{ padding: 16, gap: 10, width: "100%", maxWidth: 420, minHeight: 200 }}
      >
        <ChatHeader team={null} connected={false} />
        <div
          className="text-muted t-caption"
          style={{ padding: 12, textAlign: "center" }}
        >
          Cargando chat…
        </div>
      </section>
    );
  }

  if (!team) {
    return (
      <section
        className={`scout-card vstack ${className ?? ""}`}
        style={{ padding: 16, gap: 8, width: "100%", maxWidth: 420 }}
      >
        <ChatHeader team={null} connected={false} />
        <div
          className="vstack t-caption text-muted"
          style={{
            padding: "16px 12px",
            gap: 6,
            alignItems: "center",
            textAlign: "center",
            borderRadius: "var(--r-sm)",
            background: "var(--surface)",
            border: "1px dashed var(--border-hi)",
          }}
        >
          <ScoutIcon name="users" size={20} />
          Únete a una patrulla para chatear con tu tropa.
        </div>
      </section>
    );
  }

  return (
    <section
      className={`scout-card vstack ${className ?? ""}`}
      style={{
        padding: 0,
        gap: 0,
        width: "100%",
        maxWidth: 420,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 14, paddingBottom: 10 }}>
        <ChatHeader team={team} connected={connected} />
      </div>

      <div
        ref={listRef}
        className="vstack"
        style={{
          padding: "8px 14px",
          gap: 8,
          maxHeight: 280,
          overflowY: "auto",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          scrollbarWidth: "thin",
        }}
      >
        {messages.length === 0 ? (
          <div
            className="text-muted t-caption"
            style={{ padding: "20px 0", textAlign: "center" }}
          >
            Aún no hay mensajes. Rompe el hielo 👋
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const grouped = prev && prev.userId === m.userId && timeGap(prev.createdAt, m.createdAt) < 5 * 60_000;
            return <ChatBubble key={m.id} msg={m} grouped={!!grouped} />;
          })
        )}
      </div>

      {error ? (
        <div
          className="hstack t-caption"
          style={{
            gap: 8,
            padding: "8px 14px",
            background: "color-mix(in oklch, var(--c-rose) 14%, transparent)",
            color: "var(--c-rose)",
            borderTop: "1px solid color-mix(in oklch, var(--c-rose) 25%, transparent)",
          }}
        >
          <ScoutIcon name="close" size={12} />
          <span style={{ color: "var(--fg)" }}>
            No se envió: {error}
          </span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              color: "var(--fg-soft)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Cerrar
          </button>
        </div>
      ) : null}

      <form
        onSubmit={handleSend}
        className="hstack"
        style={{ padding: 10, gap: 8 }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder={`Mensaje a ${team.name}…`}
          disabled={sending}
          className="t-body-sm"
          style={{
            flex: 1,
            height: 40,
            padding: "0 14px",
            borderRadius: "var(--r-md)",
            background: "var(--surface)",
            border: "1px solid var(--border-hi)",
            color: "var(--fg)",
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--primary)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-hi)")
          }
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="btn btn-primary btn-icon"
          aria-label="Enviar mensaje"
          style={{
            opacity: !draft.trim() || sending ? 0.55 : 1,
            cursor: !draft.trim() || sending ? "not-allowed" : "pointer",
          }}
        >
          <ScoutIcon name="arrow" size={16} stroke={2.4} />
        </button>
      </form>
    </section>
  );
}

function ChatHeader({
  team,
  connected,
}: {
  team: MyTeamForChat | null;
  connected: boolean;
}) {
  return (
    <div className="hstack" style={{ gap: 10 }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: team?.color ? `var(--c-${team.color})` : "var(--card-hi)",
          color: "oklch(0.16 0.04 155)",
          fontSize: 14,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {team?.emblem ?? team?.name?.charAt(0).toUpperCase() ?? "?"}
      </span>
      <div className="min-w-0" style={{ flex: 1 }}>
        <div className="t-overline text-muted">Chat de patrulla</div>
        <div className="t-body-sm" style={{ fontWeight: 700 }}>
          {team?.name ?? "Sin patrulla"}
        </div>
      </div>
      <span
        className="hstack t-caption"
        title={connected ? "Conectado" : "Reconectando…"}
        style={{
          gap: 5,
          color: connected ? "var(--primary)" : "var(--fg-soft)",
          fontWeight: 700,
          fontSize: 11,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: connected ? "var(--primary)" : "var(--fg-soft)",
            boxShadow: connected
              ? "0 0 0 4px color-mix(in oklch, var(--primary) 18%, transparent)"
              : "none",
          }}
        />
        {connected ? "Live" : "…"}
      </span>
    </div>
  );
}

function ChatBubble({ msg, grouped }: { msg: ChatMessage; grouped: boolean }) {
  const align = msg.isMe ? "flex-end" : "flex-start";
  const bg = msg.isMe
    ? "color-mix(in oklch, var(--primary) 80%, transparent)"
    : "var(--card)";
  const color = msg.isMe ? "var(--primary-ink)" : "var(--fg)";
  const initial = (msg.displayName ?? msg.username).charAt(0).toUpperCase();

  return (
    <div
      className="hstack"
      style={{
        gap: 8,
        alignItems: "flex-end",
        justifyContent: align,
        marginTop: grouped ? 0 : 6,
      }}
    >
      {!msg.isMe ? (
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: "var(--card-hi)",
            color: "var(--fg)",
            fontSize: 11,
            fontWeight: 800,
            visibility: grouped ? "hidden" : "visible",
            flexShrink: 0,
          }}
        >
          {initial}
        </span>
      ) : null}
      <div
        style={{
          maxWidth: "78%",
          padding: "8px 12px",
          borderRadius: 14,
          background: bg,
          color,
          border: msg.isMe ? "none" : "1px solid var(--border)",
          borderBottomLeftRadius: msg.isMe ? 14 : grouped ? 14 : 4,
          borderBottomRightRadius: msg.isMe ? (grouped ? 14 : 4) : 14,
        }}
      >
        {!msg.isMe && !grouped ? (
          <div
            className="t-caption"
            style={{ fontWeight: 700, color: "var(--fg-soft)", marginBottom: 2 }}
          >
            {msg.displayName ?? msg.username}
          </div>
        ) : null}
        <div className="t-body-sm" style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
          {msg.body}
        </div>
        <div
          className="t-caption"
          style={{
            marginTop: 2,
            fontSize: 10,
            opacity: 0.7,
            textAlign: msg.isMe ? "right" : "left",
            color: msg.isMe ? "var(--primary-ink)" : "var(--fg-soft)",
          }}
        >
          {hhmm(msg.createdAt)}
        </div>
      </div>
    </div>
  );
}

function hhmm(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeGap(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime();
}
