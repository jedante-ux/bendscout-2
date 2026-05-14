"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ScoutIcon } from "./icon";

type AttemptKindCta = "practice" | "scoring";

interface GameIntroCardProps {
  title: string;
  tagline: string;
  imageSrc?: string;
  emoji?: string;
  /** Intentos puntuables restantes (0–2). */
  attemptsRemaining: 0 | 1 | 2;
  /** Si el usuario ya hizo la práctica de este juego hoy. */
  practiceDone: boolean;
  /** Mejor puntaje del día (si aplica). */
  bestScore?: number;
  /** Estado bloqueado por otro minijuego ya jugado hoy. */
  blockedByOtherGame?: string | null;
  /** Disparador desde el botón. El server decide el `attempt_kind` real. */
  onStart: (preferredKind: AttemptKindCta) => void;
  starting?: boolean;
}

/** Cuenta regresiva hasta la próxima medianoche local del navegador. */
function useMidnightCountdown(): { hours: number; minutes: number } {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  const ms = Math.max(0, next.getTime() - now);
  const totalMin = Math.floor(ms / 60_000);
  return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
}

export function GameIntroCard({
  title,
  tagline,
  imageSrc,
  emoji,
  attemptsRemaining,
  practiceDone,
  bestScore,
  blockedByOtherGame,
  onStart,
  starting = false,
}: GameIntroCardProps) {
  const { hours, minutes } = useMidnightCountdown();
  const countdown = `${hours}h ${minutes.toString().padStart(2, "0")}min`;

  const exhausted = attemptsRemaining === 0 && practiceDone;
  const blocked = Boolean(blockedByOtherGame);

  const scoringDisabled = blocked || exhausted || starting;
  const practiceDisabled = blocked || practiceDone || starting;

  // Si no ha hecho práctica aún, "Intentar" técnicamente disparará una práctica
  // en el server (es la regla de Jamboree). Mostramos un hint sutil al usuario.
  const needsPracticeFirst = !blocked && !practiceDone;

  return (
    <div
      className="scout-card relative mx-auto w-full overflow-hidden"
      style={{
        maxWidth: 420,
        padding: 0,
        border: "1px solid color-mix(in oklch, var(--primary) 22%, var(--border))",
        boxShadow:
          "var(--shadow-md), 0 0 0 1px color-mix(in oklch, var(--primary) 14%, transparent), 0 24px 60px -28px color-mix(in oklch, var(--primary) 70%, transparent)",
      }}
    >
      {/* Preview */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 10",
          background:
            "linear-gradient(150deg, oklch(0.32 0.06 155), oklch(0.18 0.04 155))",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 22% 24%, oklch(0.78 0.16 145 / 0.45), transparent 30%), radial-gradient(circle at 78% 70%, oklch(0.65 0.16 160 / 0.4), transparent 36%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 55%, oklch(0.16 0.04 155) 100%)",
          }}
        />

        {imageSrc ? (
          <div className="absolute inset-0 grid place-items-center">
            <Image
              src={imageSrc}
              alt={title}
              width={320}
              height={320}
              className="animate-float h-[72%] w-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>
        ) : emoji ? (
          <div className="absolute inset-0 grid place-items-center text-[120px] leading-none">
            <span className="animate-float inline-block drop-shadow-2xl">
              {emoji}
            </span>
          </div>
        ) : null}

        {/* Countdown chip (top-left) */}
        <span
          className="absolute left-3 top-3 hstack t-mono"
          style={{
            gap: 6,
            padding: "6px 10px",
            borderRadius: 999,
            background: "oklch(0 0 0 / 0.45)",
            backdropFilter: "blur(8px)",
            color: "white",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.02em",
            border: "1px solid oklch(1 0 0 / 0.12)",
          }}
        >
          <ScoutIcon name="clock" size={12} />
          {countdown}
        </span>

        {/* Slot avatars (bottom-center) — placeholder hasta tener "quién jugó" */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: 12, display: "flex", gap: -8 }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                marginLeft: i === 0 ? 0 : -8,
                background: `var(${
                  i === 0 ? "--c-mint" : i === 1 ? "--c-purple" : "--c-orange"
                })`,
                border: "2px solid oklch(0.16 0.04 155)",
                boxShadow: "0 4px 12px -4px oklch(0 0 0 / 0.5)",
                display: "grid",
                placeItems: "center",
                color: "oklch(0.16 0.04 155)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {["B", "S", "T"][i]}
            </span>
          ))}
        </div>

        {/* Skyline */}
        <svg
          aria-hidden
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          style={{ height: "26%", pointerEvents: "none" }}
        >
          <path
            d="M0 60 L40 30 L70 50 L110 20 L150 45 L200 15 L240 40 L290 25 L340 50 L400 30 L400 80 L0 80 Z"
            fill="oklch(0.18 0.06 155)"
            opacity="0.9"
          />
          <path
            d="M0 70 L60 45 L100 60 L140 35 L180 55 L220 30 L260 50 L320 35 L380 55 L400 50 L400 80 L0 80 Z"
            fill="oklch(0.16 0.04 155)"
          />
        </svg>
      </div>

      {/* Meta + CTAs */}
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              className="t-display-md"
              style={{ margin: 0, lineHeight: 1.1, letterSpacing: "-0.01em" }}
            >
              {title}
            </h2>
            <p
              className="t-caption text-muted"
              style={{ marginTop: 4, textWrap: "balance" }}
            >
              {tagline}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <RewardBadge icon="starfill" value={`+${20}`} tone="sky" hint="Práctica" />
            <RewardBadge icon="trophy" value={`Mejor 2`} tone="gold" hint="Puntuable" />
          </div>
        </div>

        {/* Intentos como dots */}
        <div className="flex items-center justify-between">
          <div className="hstack" style={{ gap: 8 }}>
            <span className="t-overline text-muted">Intentos</span>
            <span className="hstack" style={{ gap: 6 }}>
              {[0, 1].map((i) => {
                const used = i < (2 - attemptsRemaining);
                return (
                  <span
                    key={i}
                    aria-label={used ? "Intento usado" : "Intento disponible"}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: used
                        ? "color-mix(in oklch, var(--border-hi) 90%, transparent)"
                        : "var(--primary)",
                      boxShadow: used
                        ? "none"
                        : "0 0 0 3px color-mix(in oklch, var(--primary) 22%, transparent)",
                    }}
                  />
                );
              })}
            </span>
          </div>
          {bestScore != null && bestScore > 0 ? (
            <span className="t-caption text-muted">
              Mejor de hoy:{" "}
              <b style={{ color: "var(--accent)" }}>
                {bestScore.toLocaleString("es")}
              </b>
            </span>
          ) : null}
        </div>

        {blocked ? (
          <BlockedBanner gameKey={blockedByOtherGame!} />
        ) : null}

        {/* Botón Intentar (primary + counter) */}
        <button
          type="button"
          onClick={() => onStart("scoring")}
          disabled={scoringDisabled}
          className="btn btn-primary btn-lg"
          style={{
            width: "100%",
            justifyContent: "space-between",
            paddingLeft: 18,
            paddingRight: 12,
            opacity: scoringDisabled ? 0.55 : 1,
            cursor: scoringDisabled ? "not-allowed" : "pointer",
          }}
        >
          <span className="hstack" style={{ gap: 8 }}>
            <ScoutIcon name="play" size={16} stroke={2.4} />
            {exhausted ? "Sin intentos" : "Intentar"}
          </span>
          <span
            className="hstack t-num"
            style={{
              gap: 4,
              padding: "4px 10px",
              borderRadius: 999,
              background: "oklch(0 0 0 / 0.22)",
              color: "var(--primary-ink)",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {attemptsRemaining}
            <span style={{ opacity: 0.55 }}>/2</span>
          </span>
        </button>

        {needsPracticeFirst && !scoringDisabled ? (
          <p
            className="t-caption text-muted"
            style={{
              marginTop: -8,
              textAlign: "center",
            }}
          >
            Tu primer intento de hoy cuenta como{" "}
            <b style={{ color: "var(--accent)" }}>práctica</b> · luego desbloqueas
            los puntuables.
          </p>
        ) : null}

        {/* Botón Práctica */}
        <button
          type="button"
          onClick={() => onStart("practice")}
          disabled={practiceDisabled}
          className="btn btn-secondary"
          style={{
            width: "100%",
            opacity: practiceDisabled ? 0.55 : 1,
            cursor: practiceDisabled ? "not-allowed" : "pointer",
          }}
        >
          <ScoutIcon name="sparkle" size={14} />
          {practiceDone ? "Práctica completada" : "Práctica · +20 pts"}
        </button>
      </div>
    </div>
  );
}

function RewardBadge({
  icon,
  value,
  tone,
  hint,
}: {
  icon: "starfill" | "trophy" | "flame";
  value: string;
  tone: "sky" | "gold" | "orange";
  hint: string;
}) {
  const color =
    tone === "sky"
      ? "var(--c-sky)"
      : tone === "gold"
        ? "var(--c-gold)"
        : "var(--c-orange)";
  return (
    <span
      className="hstack t-caption"
      title={hint}
      style={{
        gap: 6,
        padding: "4px 8px",
        borderRadius: 999,
        background: "color-mix(in oklch, var(--surface) 70%, transparent)",
        border: "1px solid var(--border-hi)",
        color: color,
        fontWeight: 700,
        fontSize: 11,
      }}
    >
      <ScoutIcon name={icon} size={12} />
      <span style={{ color: "var(--fg)" }}>{value}</span>
    </span>
  );
}

function BlockedBanner({ gameKey }: { gameKey: string }) {
  return (
    <div
      className="hstack t-caption"
      style={{
        gap: 8,
        padding: "10px 12px",
        borderRadius: "var(--r-md)",
        background: "color-mix(in oklch, var(--c-gold) 14%, transparent)",
        border: "1px solid color-mix(in oklch, var(--c-gold) 35%, transparent)",
        color: "var(--c-gold)",
      }}
    >
      <ScoutIcon name="clock" size={14} />
      <span style={{ color: "var(--fg)" }}>
        Hoy ya empezaste <b>{gameKey}</b>. Este minijuego se desbloquea mañana.
      </span>
    </div>
  );
}
