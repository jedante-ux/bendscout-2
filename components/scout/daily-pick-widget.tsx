"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ScoutIcon } from "./icon";
import { RouletteModal } from "./roulette-modal";
import type { GameDefinition } from "@/lib/games/registry";
import type { DailyPick } from "@/lib/games/daily";

interface DailyPickWidgetProps {
  /** All games to display in the roulette reel (live + soon, for variety). */
  games: GameDefinition[];
  /** User's current team id. If null → no roulette (must join team first). */
  teamId: string | null;
  /** Today's pick if already chosen. */
  pick: DailyPick | null;
  /** UI variant. "hero" for big card with image, "compact" for a small CTA row. */
  variant?: "hero" | "compact";
}

export function DailyPickWidget({
  games,
  teamId,
  pick,
  variant = "hero",
}: DailyPickWidgetProps) {
  const [open, setOpen] = useState(false);

  // No team → guide them to onboarding.
  if (!teamId) {
    return <NoTeamCard variant={variant} />;
  }

  // Already picked today → show the chosen game.
  if (pick) {
    const game = games.find((g) => g.key === pick.gameKey);
    if (!game) return null;
    return <PickedCard game={game} pick={pick} variant={variant} />;
  }

  // No pick yet → "Girar la ruleta" CTA.
  return (
    <>
      <SpinCard variant={variant} onClick={() => setOpen(true)} />
      <RouletteModal
        open={open}
        onClose={() => setOpen(false)}
        teamId={teamId}
        games={games}
      />
    </>
  );
}

/* ---------- Variants ---------- */

function SpinCard({
  variant,
  onClick,
}: {
  variant: "hero" | "compact";
  onClick: () => void;
}) {
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="scout-card-glow group relative w-full text-left transition hover:-translate-y-0.5"
        style={{
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          className="animate-pulse-glow"
          style={{
            display: "grid",
            placeItems: "center",
            width: 48,
            height: 48,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 30% 25%, color-mix(in oklch, var(--primary) 60%, white), color-mix(in oklch, var(--primary) 40%, black))",
            color: "var(--primary-ink)",
            flexShrink: 0,
          }}
        >
          <ScoutIcon name="sparkle" size={22} stroke={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-h3" style={{ margin: 0 }}>
            Gira la ruleta del día
          </div>
          <div className="t-caption text-muted" style={{ marginTop: 2 }}>
            Decide el minijuego de hoy para tu patrulla · +10 pts
          </div>
        </div>
        <span className="btn btn-primary btn-sm" style={{ pointerEvents: "none" }}>
          Girar <ScoutIcon name="arrow" size={14} />
        </span>
      </button>
    );
  }

  return (
    <section
      className="scout-card-glow relative overflow-hidden"
      style={{ padding: 0 }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 85% 30%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 65%), radial-gradient(ellipse 50% 60% at 10% 90%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="relative grid items-stretch gap-0 lg:[grid-template-columns:minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
          <span
            className="hstack t-overline self-start"
            style={{
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background:
                "color-mix(in oklch, var(--primary) 18%, transparent)",
              color: "var(--primary)",
              border:
                "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
              letterSpacing: "0.04em",
            }}
          >
            <ScoutIcon name="sparkle" size={14} stroke={2.2} />
            Sin juego de hoy
          </span>

          <div>
            <h2
              className="t-display-lg"
              style={{ margin: 0, lineHeight: 1.05 }}
            >
              Gira la ruleta del día
            </h2>
            <p
              className="t-body text-muted"
              style={{ marginTop: 8, maxWidth: "52ch" }}
            >
              Tu patrulla aún no decide qué jugar hoy. Sé el primero en girar
              la ruleta y gana +10 puntos para ti y tu tropa.
            </p>
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
            <span
              className="hstack t-caption"
              style={{
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                background: "var(--card-hi)",
                border: "1px solid var(--border-hi)",
                fontWeight: 600,
                color: "var(--accent)",
              }}
            >
              <ScoutIcon name="starfill" size={14} stroke={2.2} />
              <span style={{ color: "var(--fg)" }}>+10 XP bonus</span>
            </span>
            <span className="hstack t-caption text-muted" style={{ gap: 6 }}>
              <ScoutIcon name="users" size={14} /> Aplica para toda la patrulla
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={onClick}
              className="btn btn-primary btn-lg animate-pulse-glow"
              style={{ minWidth: 200 }}
            >
              <ScoutIcon name="sparkle" size={16} stroke={2.4} />
              Girar la ruleta
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClick}
          aria-label="Girar la ruleta"
          className="group relative block min-h-[200px] overflow-hidden lg:min-h-[300px]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.30 0.05 155), oklch(0.18 0.04 155))",
            cursor: "pointer",
            border: "none",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 grid place-items-center"
            style={{
              fontSize: 120,
              opacity: 0.55,
              filter: "drop-shadow(0 12px 30px oklch(0 0 0 / 0.4))",
            }}
          >
            🎲
          </div>
        </button>
      </div>
    </section>
  );
}

function PickedCard({
  game,
  pick,
  variant,
}: {
  game: GameDefinition;
  pick: DailyPick;
  variant: "hero" | "compact";
}) {
  const href = game.route ?? "/play";

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="scout-card group relative flex w-full items-center gap-3 overflow-hidden transition hover:-translate-y-0.5"
        style={{ padding: 14, textDecoration: "none", color: "inherit" }}
      >
        <div
          style={{
            position: "relative",
            width: 64,
            height: 56,
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, oklch(0.30 0.05 155), oklch(0.18 0.04 155))",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {game.imageSrc ? (
            <Image src={game.imageSrc} alt="" width={80} height={56} className="h-[80%] w-auto object-contain" />
          ) : (
            <span style={{ fontSize: 28 }}>{game.emoji}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-overline text-muted">Hoy juegan</div>
          <div className="t-h3" style={{ margin: 0 }}>
            {game.title}
          </div>
          <div className="t-caption text-muted">
            Elegido por {pick.pickedByName ?? pick.pickedByUsername}
          </div>
        </div>
        <span className="btn btn-primary btn-sm" style={{ pointerEvents: "none" }}>
          Jugar <ScoutIcon name="play" size={12} stroke={2.4} />
        </span>
      </Link>
    );
  }

  return (
    <section
      className="scout-card-glow relative overflow-hidden"
      style={{ padding: 0 }}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 85% 30%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 65%), radial-gradient(ellipse 50% 60% at 10% 90%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="relative grid items-stretch gap-0 lg:[grid-template-columns:minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
          <span
            className="hstack t-overline self-start"
            style={{
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background:
                "color-mix(in oklch, var(--primary) 18%, transparent)",
              color: "var(--primary)",
              border:
                "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
              letterSpacing: "0.04em",
            }}
          >
            <ScoutIcon name="flame" size={14} stroke={2.2} />
            Minijuego del día
          </span>

          <div>
            <h1 className="t-display-lg" style={{ margin: 0, lineHeight: 1.05 }}>
              {game.title}
            </h1>
            <p className="t-body text-muted" style={{ marginTop: 8 }}>
              {game.tagline}
            </p>
            <p
              className="t-caption text-soft"
              style={{ marginTop: 6, fontStyle: "italic" }}
            >
              Elegido hoy por {pick.pickedByName ?? pick.pickedByUsername}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href={href}
              className="btn btn-primary btn-lg"
              style={{ minWidth: 180 }}
            >
              <ScoutIcon name="play" size={16} stroke={2.4} />
              Jugar ahora
            </Link>
            <Link href="/play" className="btn btn-secondary btn-lg">
              Ver minijuegos
            </Link>
          </div>
        </div>

        <Link
          href={href}
          aria-label={`Jugar ${game.title}`}
          className="group relative block min-h-[200px] overflow-hidden lg:min-h-[300px]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.30 0.05 155), oklch(0.18 0.04 155))",
          }}
        >
          {game.imageSrc ? (
            <div
              className="absolute inset-0 grid place-items-center"
              style={{ padding: 16 }}
            >
              <Image
                src={game.imageSrc}
                alt={game.title}
                width={520}
                height={300}
                className="animate-float h-[80%] w-auto object-contain drop-shadow-2xl"
              />
            </div>
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 grid place-items-center"
              style={{
                fontSize: 140,
                opacity: 0.85,
                filter: "drop-shadow(0 12px 30px oklch(0 0 0 / 0.4))",
              }}
            >
              {game.emoji}
            </div>
          )}
        </Link>
      </div>
    </section>
  );
}

function NoTeamCard({ variant }: { variant: "hero" | "compact" }) {
  if (variant === "compact") {
    return (
      <Link
        href="/onboarding/team"
        className="scout-card group relative flex w-full items-center gap-3 transition hover:-translate-y-0.5"
        style={{ padding: 14, textDecoration: "none", color: "inherit" }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 48,
            height: 48,
            borderRadius: 999,
            background:
              "color-mix(in oklch, var(--c-orange) 18%, transparent)",
            color: "var(--c-orange)",
          }}
        >
          <ScoutIcon name="users" size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-h3" style={{ margin: 0 }}>
            Únete a una patrulla
          </div>
          <div className="t-caption text-muted">
            Necesitas estar en una para girar la ruleta
          </div>
        </div>
        <span className="btn btn-secondary btn-sm" style={{ pointerEvents: "none" }}>
          Ir
        </span>
      </Link>
    );
  }

  return (
    <section
      className="scout-card relative overflow-hidden"
      style={{ padding: 32, textAlign: "center" }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 80% at 50% 0%, color-mix(in oklch, var(--c-orange) 14%, transparent), transparent 60%)",
        }}
      />
      <div
        className="relative grid place-items-center"
        style={{ marginBottom: 14 }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 64,
            height: 64,
            borderRadius: 999,
            background:
              "color-mix(in oklch, var(--c-orange) 18%, transparent)",
            color: "var(--c-orange)",
          }}
        >
          <ScoutIcon name="users" size={28} />
        </div>
      </div>
      <h2 className="t-display-sm" style={{ margin: "0 0 6px" }}>
        Únete a una patrulla primero
      </h2>
      <p
        className="t-body-sm text-muted"
        style={{ margin: "0 0 14px", maxWidth: 380, marginInline: "auto" }}
      >
        El juego del día se decide entre los miembros de tu patrulla. Únete o
        crea una para girar la ruleta.
      </p>
      <Link href="/onboarding/team" className="btn btn-primary btn-lg">
        Elegir patrulla
      </Link>
    </section>
  );
}
