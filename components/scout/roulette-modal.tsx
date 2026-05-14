"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ScoutIcon } from "./icon";
import type { GameDefinition } from "@/lib/games/registry";
import {
  spinDailyPick,
  type SpinDailyPickResult,
} from "@/lib/games/daily";

/* ---------- Constants ---------- */

const SLOT_HEIGHT = 96; // px per game card in the reel
const VISIBLE_SLOTS = 3; // slots visible at once inside the frame
const REEL_COPIES = 18; // how many times we repeat the game list (the spinning effect)
const FAST_SPIN_SPEED = 1600; // px/sec during the pre-spin loop
const MIN_FAST_SPIN_MS = 700; // minimum time the fast spin runs before deceleration
const DECEL_MS = 2400; // smooth deceleration to the winner
const REDIRECT_COUNTDOWN = 2; // seconds before auto-redirect to the chosen game

/* ---------- Component ---------- */

interface RouletteModalProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  /** All games to display visually in the reel. */
  games: GameDefinition[];
  /** game_keys already picked this jamboree week; excluded from the roulette. */
  excludeKeys?: string[];
}

type Phase =
  | "idle"
  | "spinning"
  | "done"
  | "error"
  | "empty";

export function RouletteModal({
  open,
  onClose,
  teamId,
  games,
  excludeKeys = [],
}: RouletteModalProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const [result, setResult] = useState<SpinDailyPickResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const reelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Solo entran a la ruleta los live con route, excluyendo los ya elegidos esta semana.
  const excludeSet = useMemo(() => new Set(excludeKeys), [excludeKeys]);
  const eligibleGames = useMemo(
    () =>
      games.filter(
        (g) => g.status === "live" && g.route && !excludeSet.has(g.key),
      ),
    [games, excludeSet],
  );

  // El reel visual incluye también los excluidos en gris, para que se note
  // que existen pero ya fueron jugados. Si no hay elegibles, mostramos estado vacío.
  const reelGames = useMemo(() => {
    const live = games.filter((g) => g.status === "live" && g.route);
    return live;
  }, [games]);

  // Reset state when modal opens fresh.
  useEffect(() => {
    if (!open) return;
    if (eligibleGames.length === 0) {
      setPhase("empty");
      return;
    }
    setPhase("idle");
    setPickedKey(null);
    setResult(null);
    setCountdown(null);
    stopFastSpin();
    if (redirectTimerRef.current) {
      window.clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    if (reelRef.current) {
      reelRef.current.style.transition = "none";
      reelRef.current.style.transform = "translateY(0px)";
    }
  }, [open, eligibleGames.length]);

  // Close on Escape (solo si no estamos girando).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "spinning") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      stopFastSpin();
      if (redirectTimerRef.current) {
        window.clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []);

  const stopFastSpin = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleSpin = () => {
    if (phase !== "idle") return;
    if (eligibleGames.length === 0) {
      setPhase("empty");
      return;
    }

    setPhase("spinning");
    const candidate =
      eligibleGames[Math.floor(Math.random() * eligibleGames.length)];

    // Pre-spin: arranca un loop rápido inmediatamente para feedback visual.
    const reelHeight = reelGames.length * SLOT_HEIGHT;
    const spinStart = performance.now();
    const tick = () => {
      const elapsed = performance.now() - spinStart;
      const offset = -((elapsed / 1000) * FAST_SPIN_SPEED) % reelHeight;
      if (reelRef.current) {
        reelRef.current.style.transition = "none";
        reelRef.current.style.transform = `translateY(${offset}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    startTransition(async () => {
      const startedAt = performance.now();
      const res = await spinDailyPick(teamId, candidate.key);
      setResult(res);

      const elapsedNow = performance.now() - startedAt;
      const waitMore = Math.max(0, MIN_FAST_SPIN_MS - elapsedNow);

      window.setTimeout(() => {
        stopFastSpin();

        if (!res.ok || !res.pick) {
          setPhase("error");
          if (reelRef.current) {
            reelRef.current.style.transition = "transform 250ms ease-out";
            reelRef.current.style.transform = "translateY(0px)";
          }
          return;
        }

        const winnerKey = res.pick.gameKey;
        setPickedKey(winnerKey);

        // Land the winner centered in the frame. Tomamos la copia del reel
        // cercana al final para que se vea recorrido, pero arrancamos desde
        // la posición actual (pre-spin) suavizando con cubic-bezier.
        const winnerIndex = reelGames.findIndex((g) => g.key === winnerKey);
        const safeIndex = winnerIndex === -1 ? 0 : winnerIndex;
        const landingCopy = REEL_COPIES - 3;
        const absoluteIndex = landingCopy * reelGames.length + safeIndex;
        const centerOffset = Math.floor(VISIBLE_SLOTS / 2) * SLOT_HEIGHT;
        const targetY = -(absoluteIndex * SLOT_HEIGHT - centerOffset);

        if (reelRef.current) {
          // Forzamos reflow para que la transición a target se vea continua.
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          reelRef.current.getBoundingClientRect();
          reelRef.current.style.transition = `transform ${DECEL_MS}ms cubic-bezier(0.16, 0.86, 0.2, 1)`;
          reelRef.current.style.transform = `translateY(${targetY}px)`;
        }

        window.setTimeout(() => {
          setPhase("done");
          const winner = reelGames.find((g) => g.key === winnerKey);
          const href = winner?.route ?? "/play";
          setCountdown(REDIRECT_COUNTDOWN);
          redirectTimerRef.current = window.setInterval(() => {
            setCountdown((prev) => {
              if (prev === null) return null;
              if (prev <= 1) {
                if (redirectTimerRef.current) {
                  window.clearInterval(redirectTimerRef.current);
                  redirectTimerRef.current = null;
                }
                router.push(href);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }, DECEL_MS + 150);
      }, waitMore);
    });
  };

  const cancelRedirect = () => {
    if (redirectTimerRef.current) {
      window.clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    setCountdown(null);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ruleta del juego del día"
      onClick={() => {
        if (phase !== "spinning") onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "oklch(0 0 0 / 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal scout-card"
        style={{
          width: "min(100%, 460px)",
          padding: 24,
          textAlign: "center",
          maxHeight: "100dvh",
          overflow: "auto",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={phase === "spinning"}
          className="btn btn-ghost btn-icon btn-sm"
          style={{ position: "absolute", top: 12, right: 12 }}
        >
          <ScoutIcon name="close" size={16} />
        </button>

        {phase === "idle" && (
          <Intro
            onSpin={handleSpin}
            available={eligibleGames.length}
            totalLive={reelGames.length}
            pending={isPending}
          />
        )}

        {phase === "spinning" && <SpinningHeader />}

        {phase === "done" && result?.pick && (
          <ResultHeader result={result} games={reelGames} />
        )}

        {phase === "error" && (
          <ErrorBlock message={result?.error ?? "No se pudo girar la ruleta"} />
        )}

        {phase === "empty" && <EmptyState />}

        {(phase === "idle" || phase === "spinning" || phase === "done") && (
          <Reel
            games={reelGames}
            excludeSet={excludeSet}
            pickedKey={pickedKey}
            reelRef={reelRef}
          />
        )}

        {phase === "done" && result?.pick && (
          <DoneActions
            gameKey={result.pick.gameKey}
            games={reelGames}
            onClose={onClose}
            countdown={countdown}
            onCancelRedirect={cancelRedirect}
          />
        )}

        {phase === "idle" && (
          <p
            className="t-caption text-muted"
            style={{ marginTop: 16, marginBottom: 0 }}
          >
            Cualquiera de la patrulla puede girar.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function Intro({
  onSpin,
  available,
  totalLive,
  pending,
}: {
  onSpin: () => void;
  available: number;
  totalLive: number;
  pending: boolean;
}) {
  const disabled = available === 0 || pending;
  const usedThisWeek = totalLive - available;
  return (
    <>
      <div className="grid place-items-center" style={{ marginBottom: 8 }}>
        <div
          className="grid place-items-center animate-pulse-glow"
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 30% 25%, color-mix(in oklch, var(--primary) 60%, white), color-mix(in oklch, var(--primary) 40%, black))",
            color: "var(--primary-ink)",
          }}
        >
          <ScoutIcon name="sparkle" size={28} stroke={2.2} />
        </div>
      </div>
      <h2 className="t-display-md" style={{ margin: "10px 0 6px" }}>
        ¡Selecciona un juego!
      </h2>
      <p className="t-body text-muted" style={{ margin: "0 0 6px" }}>
        Hoy aún no tienen juego asignado. Tú decides para toda la patrulla.
      </p>
      <p
        className="t-caption"
        style={{ color: "var(--accent)", fontWeight: 700, marginTop: 4 }}
      >
        +10 pts para ti y tu patrulla por ser el elector del día
      </p>
      {usedThisWeek > 0 && (
        <p className="t-caption text-muted" style={{ marginTop: 4 }}>
          {usedThisWeek} {usedThisWeek === 1 ? "ya jugado" : "ya jugados"} esta
          semana · {available} {available === 1 ? "disponible" : "disponibles"}
        </p>
      )}
      <button
        type="button"
        onClick={onSpin}
        disabled={disabled}
        className="btn btn-primary btn-lg animate-pulse-glow"
        style={{ marginTop: 18, minWidth: 220 }}
      >
        <ScoutIcon name="sparkle" size={16} stroke={2.4} />
        {pending ? "Preparando…" : "Girar ahora"}
      </button>
    </>
  );
}

function SpinningHeader() {
  return (
    <>
      <h2 className="t-display-md" style={{ margin: "0 0 6px" }}>
        Eligiendo…
      </h2>
      <p className="t-body-sm text-muted" style={{ margin: 0 }}>
        Que el destino decida
      </p>
    </>
  );
}

function ResultHeader({
  result,
  games,
}: {
  result: SpinDailyPickResult;
  games: GameDefinition[];
}) {
  const game = games.find((g) => g.key === result.pick?.gameKey);
  return (
    <>
      <span
        className="chip chip-accent"
        style={{ padding: "6px 12px", marginBottom: 8 }}
      >
        {result.first
          ? `🎉 +${result.bonusAwarded ?? 10} pts por elegir`
          : "Pick de la patrulla"}
      </span>
      <h2 className="t-display-md" style={{ margin: "10px 0 6px" }}>
        ¡Hoy juegan {game?.title ?? result.pick?.gameKey}!
      </h2>
      <p
        className="t-body-sm text-muted"
        style={{ margin: 0, maxWidth: 360, marginInline: "auto" }}
      >
        {result.first
          ? "Tú fuiste el elector. Tu patrulla también recibe el bonus."
          : `${result.pick?.pickedByName ?? result.pick?.pickedByUsername} eligió por la patrulla`}
      </p>
    </>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <>
      <div className="grid place-items-center" style={{ marginBottom: 12 }}>
        <div
          className="grid place-items-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "color-mix(in oklch, var(--c-rose) 18%, transparent)",
            color: "var(--c-rose)",
          }}
        >
          <ScoutIcon name="close" size={24} />
        </div>
      </div>
      <h2 className="t-h2" style={{ margin: "0 0 6px" }}>
        Ups…
      </h2>
      <p className="t-body-sm text-muted" style={{ margin: 0 }}>
        {message}
      </p>
    </>
  );
}

function EmptyState() {
  return (
    <>
      <div className="grid place-items-center" style={{ marginBottom: 12 }}>
        <div
          className="grid place-items-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background:
              "color-mix(in oklch, var(--accent) 18%, transparent)",
            color: "var(--accent)",
          }}
        >
          <ScoutIcon name="trophy" size={28} />
        </div>
      </div>
      <h2 className="t-display-md" style={{ margin: "10px 0 6px" }}>
        Ya jugaron todos
      </h2>
      <p
        className="t-body-sm text-muted"
        style={{ margin: 0, maxWidth: 380, marginInline: "auto" }}
      >
        Tu patrulla ya pasó por cada minijuego esta semana. Espera al próximo
        Jamboree para que la ruleta se reactive.
      </p>
    </>
  );
}

function Reel({
  games,
  excludeSet,
  pickedKey,
  reelRef,
}: {
  games: GameDefinition[];
  excludeSet: Set<string>;
  pickedKey: string | null;
  reelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const reel = useMemo(() => {
    const arr: GameDefinition[] = [];
    for (let i = 0; i < REEL_COPIES; i++) arr.push(...games);
    return arr;
  }, [games]);

  return (
    <div
      style={{
        position: "relative",
        marginTop: 18,
        marginBottom: 18,
        height: SLOT_HEIGHT * VISIBLE_SLOTS,
        overflow: "hidden",
        borderRadius: "var(--r-2xl)",
        background:
          "linear-gradient(180deg, oklch(0.16 0.04 155), oklch(0.12 0.03 155))",
        border: "1px solid var(--border-hi)",
        boxShadow:
          "inset 0 12px 24px -8px oklch(0 0 0 / 0.6), inset 0 -12px 24px -8px oklch(0 0 0 / 0.6)",
      }}
    >
      {/* Center indicator */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: SLOT_HEIGHT,
          left: 0,
          right: 0,
          height: SLOT_HEIGHT,
          pointerEvents: "none",
          zIndex: 2,
          borderTop: "2px solid color-mix(in oklch, var(--primary) 60%, transparent)",
          borderBottom: "2px solid color-mix(in oklch, var(--primary) 60%, transparent)",
          background:
            "linear-gradient(90deg, color-mix(in oklch, var(--primary) 6%, transparent), transparent 30%, transparent 70%, color-mix(in oklch, var(--primary) 6%, transparent))",
          boxShadow:
            "0 0 24px -2px color-mix(in oklch, var(--primary) 40%, transparent)",
        }}
      />

      {/* Edge fades */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background:
            "linear-gradient(180deg, oklch(0.10 0.03 155) 0%, transparent 18%, transparent 82%, oklch(0.10 0.03 155) 100%)",
        }}
      />

      {/* Reel */}
      <div
        ref={reelRef}
        style={{
          willChange: "transform",
          transform: "translateY(0)",
        }}
      >
        {reel.map((g, i) => (
          <ReelCard
            key={`${g.key}-${i}`}
            game={g}
            highlight={g.key === pickedKey}
            disabled={excludeSet.has(g.key)}
          />
        ))}
      </div>
    </div>
  );
}

function ReelCard({
  game,
  highlight,
  disabled,
}: {
  game: GameDefinition;
  highlight: boolean;
  disabled: boolean;
}) {
  return (
    <div
      style={{
        height: SLOT_HEIGHT,
        padding: 8,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          flex: 1,
          height: "100%",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 8,
          background: highlight
            ? "linear-gradient(95deg, color-mix(in oklch, var(--primary) 24%, transparent), color-mix(in oklch, var(--primary) 8%, transparent))"
            : "color-mix(in oklch, var(--card) 60%, transparent)",
          border: highlight
            ? "1px solid color-mix(in oklch, var(--primary) 50%, transparent)"
            : "1px solid var(--border)",
          opacity: disabled && !highlight ? 0.45 : 1,
          transition: "background 200ms, border-color 200ms, opacity 200ms",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 96,
            height: "100%",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            background: `radial-gradient(ellipse 80% 60% at 30% 30%, color-mix(in oklch, var(--primary) 28%, transparent), transparent 70%), linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))`,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          {game.imageSrc ? (
            <Image
              src={game.imageSrc}
              alt={game.title}
              width={120}
              height={80}
              className="h-[80%] w-auto object-contain"
              style={{
                filter:
                  disabled && !highlight
                    ? "grayscale(0.8) opacity(0.8)"
                    : undefined,
              }}
            />
          ) : (
            <span style={{ fontSize: 32 }}>{game.emoji}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="t-display-sm"
            style={{ fontSize: 16, lineHeight: 1.1, margin: 0 }}
          >
            {game.title}
          </div>
          <div
            className="t-caption text-muted"
            style={{ marginTop: 4, lineHeight: 1.3 }}
          >
            {disabled ? "Ya jugado esta semana" : game.tagline}
          </div>
        </div>
      </div>
    </div>
  );
}

function DoneActions({
  gameKey,
  games,
  onClose,
  countdown,
  onCancelRedirect,
}: {
  gameKey: string;
  games: GameDefinition[];
  onClose: () => void;
  countdown: number | null;
  onCancelRedirect: () => void;
}) {
  const game = games.find((g) => g.key === gameKey);
  const href = game?.route ?? "/play";
  const isRedirecting = countdown !== null && countdown > 0;
  return (
    <>
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1.4fr", gap: 8, marginTop: 4 }}
      >
        <button
          type="button"
          onClick={() => {
            onCancelRedirect();
            onClose();
          }}
          className="btn btn-secondary"
        >
          Cerrar
        </button>
        <Link href={href} className="btn btn-primary">
          Jugar ahora <ScoutIcon name="play" size={14} stroke={2.4} />
        </Link>
      </div>
      {isRedirecting && (
        <p
          className="t-caption text-muted"
          style={{ marginTop: 12, marginBottom: 0 }}
        >
          Redirigiendo en {countdown}s…{" "}
          <button
            type="button"
            onClick={onCancelRedirect}
            className="link-underline"
            style={{
              color: "var(--primary)",
              fontWeight: 700,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            cancelar
          </button>
        </p>
      )}
    </>
  );
}
