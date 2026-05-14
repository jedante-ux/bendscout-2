"use client";

import type {
  GameDayStatus,
  GameScoreEntry,
  MyGameHistoryEntry,
} from "@/lib/games/actions";
import { ScoutIcon } from "./icon";

interface ScoresPanelProps {
  gameTitle: string;
  dayStatus: GameDayStatus | null;
  todayScores: GameScoreEntry[];
  history: MyGameHistoryEntry[];
}

export function ScoresPanel({
  gameTitle,
  dayStatus,
  todayScores,
  history,
}: ScoresPanelProps) {
  const hasMyPlay =
    !!dayStatus &&
    (dayStatus.practiceDone ||
      dayStatus.attempt1Score !== null ||
      dayStatus.attempt2Score !== null);

  return (
    <div className="vstack" style={{ gap: 12, width: "100%", maxWidth: 420 }}>
      {hasMyPlay && dayStatus ? (
        <MyDayCard title={gameTitle} status={dayStatus} />
      ) : null}

      <TopTodayCard title={gameTitle} entries={todayScores} />

      {history.length > 0 ? <HistoryCard entries={history} /> : null}
    </div>
  );
}

function MyDayCard({
  title,
  status,
}: {
  title: string;
  status: GameDayStatus;
}) {
  return (
    <section className="scout-card" style={{ padding: 16 }}>
      <Header
        icon="trophy"
        eyebrow="Tu día"
        label={title}
        accent="var(--accent)"
      />
      <div
        className="grid grid-cols-4 gap-2"
        style={{ marginTop: 12 }}
      >
        <Tile
          label="Práctica"
          value={status.practiceDone ? "+20" : "—"}
          tone={status.practiceDone ? "sky" : "muted"}
        />
        <Tile
          label="Intento 1"
          value={
            status.attempt1Score !== null
              ? status.attempt1Score.toLocaleString("es")
              : "—"
          }
          tone={status.attempt1Score !== null ? "primary" : "muted"}
        />
        <Tile
          label="Intento 2"
          value={
            status.attempt2Score !== null
              ? status.attempt2Score.toLocaleString("es")
              : "—"
          }
          tone={status.attempt2Score !== null ? "primary" : "muted"}
        />
        <Tile
          label="Mejor"
          value={
            status.bestScore > 0
              ? status.bestScore.toLocaleString("es")
              : "—"
          }
          tone={status.bestScore > 0 ? "accent" : "muted"}
          highlight
        />
      </div>
      <div
        className="hstack t-caption text-muted"
        style={{ marginTop: 10, justifyContent: "space-between" }}
      >
        <span>
          Total del día:{" "}
          <b style={{ color: "var(--fg)" }}>
            {status.dayTotal.toLocaleString("es")}
          </b>{" "}
          pts
        </span>
        {status.scoringAttemptsRemaining > 0 ? (
          <span style={{ color: "var(--primary)" }}>
            <b>{status.scoringAttemptsRemaining}</b> intento
            {status.scoringAttemptsRemaining === 1 ? "" : "s"} restante
            {status.scoringAttemptsRemaining === 1 ? "" : "s"}
          </span>
        ) : (
          <span>Día completo</span>
        )}
      </div>
    </section>
  );
}

function TopTodayCard({
  title,
  entries,
}: {
  title: string;
  entries: GameScoreEntry[];
}) {
  return (
    <section className="scout-card" style={{ padding: 16 }}>
      <Header
        icon="users"
        eyebrow="Hoy en tu patrulla"
        label={title}
        accent="var(--primary)"
      />
      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ol
          style={{ marginTop: 10, padding: 0, listStyle: "none" }}
          className="vstack"
        >
          {entries.map((entry, i) => (
            <li key={entry.userId}>
              <ScoreRow rank={i + 1} entry={entry} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function ScoreRow({ rank, entry }: { rank: number; entry: GameScoreEntry }) {
  const initial = (entry.displayName ?? entry.username)?.charAt(0).toUpperCase();
  const isMe = entry.isMe;
  const rankColor =
    rank === 1
      ? "var(--c-gold)"
      : rank === 2
        ? "var(--fg-soft)"
        : rank === 3
          ? "var(--c-orange)"
          : "var(--fg-soft)";
  return (
    <div
      className="hstack"
      style={{
        gap: 10,
        padding: "8px 10px",
        borderRadius: "var(--r-md)",
        background: isMe
          ? "color-mix(in oklch, var(--primary) 12%, transparent)"
          : "transparent",
        border: isMe
          ? "1px solid color-mix(in oklch, var(--primary) 30%, transparent)"
          : "1px solid transparent",
      }}
    >
      <span
        className="t-num"
        style={{
          width: 24,
          textAlign: "center",
          fontSize: 13,
          fontWeight: 800,
          color: rankColor,
        }}
      >
        {rank}
      </span>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: entry.teamColor
            ? `var(--c-${entry.teamColor})`
            : "var(--card-hi)",
          color: "oklch(0.16 0.04 155)",
          fontSize: 13,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {initial}
      </span>
      <div className="min-w-0" style={{ flex: 1 }}>
        <div
          className="t-body-sm"
          style={{
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isMe ? "Tú" : (entry.displayName ?? entry.username)}{" "}
          {entry.attemptKind === "practice" ? (
            <span
              className="t-caption"
              style={{ color: "var(--c-sky)", fontWeight: 600 }}
            >
              · práctica
            </span>
          ) : null}
        </div>
        <div className="t-caption text-muted">
          {entry.teamName ?? "Sin patrulla"}
        </div>
      </div>
      <span
        className="t-num"
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: isMe ? "var(--accent)" : "var(--fg)",
        }}
      >
        {entry.bestScore.toLocaleString("es")}
      </span>
    </div>
  );
}

function HistoryCard({ entries }: { entries: MyGameHistoryEntry[] }) {
  return (
    <section className="scout-card" style={{ padding: 16 }}>
      <Header
        icon="history"
        eyebrow="Tu historia"
        label="Últimas partidas"
        accent="var(--c-purple)"
      />
      <div className="vstack" style={{ gap: 6, marginTop: 10 }}>
        {entries.map((h) => (
          <div
            key={h.sessionId}
            className="hstack"
            style={{
              gap: 10,
              padding: "8px 10px",
              borderRadius: "var(--r-sm)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <ScoutIcon
              name={h.attemptKind === "practice" ? "sparkle" : "trophy"}
              size={14}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-body-sm" style={{ fontWeight: 600 }}>
                {h.attemptKind === "practice"
                  ? "Práctica"
                  : `Intento ${h.attemptNo}`}
              </div>
              <div className="t-caption text-muted">{relTime(h.createdAt)}</div>
            </div>
            <span
              className="t-num"
              style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)" }}
            >
              {h.score.toLocaleString("es")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Header({
  icon,
  eyebrow,
  label,
  accent,
}: {
  icon: "trophy" | "users" | "history";
  eyebrow: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="hstack" style={{ gap: 10 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          background: `color-mix(in oklch, ${accent} 14%, transparent)`,
          color: accent,
          border: `1px solid color-mix(in oklch, ${accent} 30%, transparent)`,
        }}
      >
        <ScoutIcon name={icon} size={14} />
      </span>
      <div className="min-w-0" style={{ flex: 1 }}>
        <div className="t-overline text-muted" style={{ letterSpacing: "0.06em" }}>
          {eyebrow}
        </div>
        <div className="t-body-sm" style={{ fontWeight: 700 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  tone: "sky" | "primary" | "accent" | "muted";
  highlight?: boolean;
}) {
  const colorMap: Record<string, string> = {
    sky: "var(--c-sky)",
    primary: "var(--primary)",
    accent: "var(--accent)",
    muted: "var(--fg-soft)",
  };
  return (
    <div
      style={{
        padding: "10px 8px",
        borderRadius: "var(--r-sm)",
        background: highlight
          ? "color-mix(in oklch, var(--accent) 10%, transparent)"
          : "var(--surface)",
        border: highlight
          ? "1px solid color-mix(in oklch, var(--accent) 30%, transparent)"
          : "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <div
        className="t-overline text-muted"
        style={{ fontSize: 9, letterSpacing: "0.06em" }}
      >
        {label}
      </div>
      <div
        className="t-num"
        style={{
          marginTop: 2,
          fontSize: 15,
          fontWeight: 800,
          color: colorMap[tone],
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="vstack t-caption text-muted"
      style={{
        marginTop: 10,
        padding: "16px 12px",
        textAlign: "center",
        gap: 4,
        alignItems: "center",
        borderRadius: "var(--r-sm)",
        background: "var(--surface)",
        border: "1px dashed var(--border-hi)",
      }}
    >
      <ScoutIcon name="leaf" size={20} />
      Sé el primero de tu patrulla en jugar hoy.
    </div>
  );
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "Justo ahora";
  if (min < 60) return `Hace ${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `Hace ${hr}h`;
  const d = Math.round(hr / 24);
  return `Hace ${d}d`;
}
