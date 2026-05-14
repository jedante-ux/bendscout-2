"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SCENE_PUZZLES,
  type ScenePuzzle,
} from "@/lib/games/diferencias/scenes";

const POINTS_PER_DIFF = 60;
const ROUND_BONUS = 80;
const STREAK_STEP = 10;
const STREAK_CAP = 60;
const FEEDBACK_MS = 500;

export interface DiferenciasGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Round {
  puzzle: ScenePuzzle;
  found: Set<string>;
}

function pickPuzzle(prev: string | null): ScenePuzzle {
  const candidates = SCENE_PUZZLES.filter((s) => s.id !== prev);
  return candidates[Math.floor(Math.random() * candidates.length)] ??
    SCENE_PUZZLES[Math.floor(Math.random() * SCENE_PUZZLES.length)];
}

export function DiferenciasGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: DiferenciasGameProps) {
  const [round, setRound] = useState<Round>(() => ({
    puzzle: pickPuzzle(null),
    found: new Set(),
  }));
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<
    { x: number; y: number; correct: boolean } | null
  >(null);

  const advance = useCallback(() => {
    setRound((r) => ({ puzzle: pickPuzzle(r.puzzle.id), found: new Set() }));
    setFlash(null);
  }, []);

  const handleTapScene = useCallback(
    (
      e: React.PointerEvent<HTMLDivElement>,
      scene: HTMLDivElement,
    ) => {
      if (!interactive) return;
      const rect = scene.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Busca una diff cercana no encontrada
      const hit = round.puzzle.diffs.find((d) => {
        if (round.found.has(d.id)) return false;
        const dx = d.cx - x;
        const dy = d.cy - y;
        return Math.hypot(dx, dy) <= d.radius;
      });

      if (hit) {
        setRound((r) => {
          const next = new Set(r.found);
          next.add(hit.id);
          return { ...r, found: next };
        });
        const nextStreak = streak + 1;
        const bonus = Math.min(
          STREAK_CAP,
          Math.max(0, nextStreak - 1) * STREAK_STEP,
        );
        setStreak(nextStreak);
        onCorrect?.(POINTS_PER_DIFF + bonus, nextStreak);
        setFlash({ x, y, correct: true });

        const isComplete = round.found.size + 1 >= round.puzzle.diffs.length;
        if (isComplete) {
          onCorrect?.(ROUND_BONUS, 0);
          window.setTimeout(() => advance(), FEEDBACK_MS + 300);
        } else {
          window.setTimeout(() => setFlash(null), FEEDBACK_MS);
        }
      } else {
        setStreak(0);
        onWrong?.();
        setFlash({ x, y, correct: false });
        window.setTimeout(() => setFlash(null), FEEDBACK_MS - 100);
      }
    },
    [interactive, round, streak, onCorrect, onWrong, advance],
  );

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  return (
    <div className="flex flex-1 flex-col" style={{ gap: 14, touchAction: "manipulation" }}>
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Encuentra las 5 diferencias
        </span>
        {streak >= 2 && (
          <span
            className="chip chip-accent"
            style={{ animation: "scale-in 0.25s var(--ease-out-quint)" }}
          >
            🔥 Racha x{streak}
          </span>
        )}
      </div>

      <div
        className="text-center scout-card"
        style={{
          padding: "8px 14px",
          background: "color-mix(in oklch, var(--c-sky) 14%, transparent)",
          border: "1px solid color-mix(in oklch, var(--c-sky) 35%, transparent)",
        }}
      >
        <div
          className="t-display-sm"
          style={{ fontSize: 16, fontWeight: 800, color: "var(--c-sky)" }}
        >
          {round.puzzle.title}
        </div>
        <div className="t-caption text-muted">{round.puzzle.caption}</div>
      </div>

      <div className="vstack" style={{ gap: 8, flex: 1 }}>
        <SceneView
          variant="A"
          puzzle={round.puzzle}
          found={round.found}
          flash={flash}
          interactive={interactive}
          onTap={handleTapScene}
        />
        <SceneView
          variant="B"
          puzzle={round.puzzle}
          found={round.found}
          flash={flash}
          interactive={interactive}
          onTap={handleTapScene}
        />
      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2">
        {round.puzzle.diffs.map((d) => (
          <span
            key={d.id}
            style={{
              width: 22,
              height: 8,
              borderRadius: 999,
              background: round.found.has(d.id)
                ? "var(--primary)"
                : "color-mix(in oklch, var(--border) 80%, transparent)",
              transition: "background 0.25s var(--ease-out-quint)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface SceneViewProps {
  variant: "A" | "B";
  puzzle: ScenePuzzle;
  found: Set<string>;
  flash: { x: number; y: number; correct: boolean } | null;
  interactive: boolean;
  onTap: (
    e: React.PointerEvent<HTMLDivElement>,
    scene: HTMLDivElement,
  ) => void;
}

function SceneView({
  variant,
  puzzle,
  found,
  flash,
  interactive,
  onTap,
}: SceneViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        if (ref.current) onTap(e, ref.current);
      }}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: 12,
        overflow: "hidden",
        border: "1.5px solid color-mix(in oklch, var(--c-sky) 30%, var(--border))",
        cursor: interactive ? "crosshair" : "default",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {variant === "A" ? puzzle.renderA() : puzzle.renderB()}
      </svg>

      {/* Marcadores de diffs ya encontradas */}
      {puzzle.diffs.map((d) =>
        found.has(d.id) ? (
          <span
            key={d.id}
            aria-hidden
            style={{
              position: "absolute",
              left: `${d.cx}%`,
              top: `${d.cy}%`,
              width: `${d.radius * 2.4}%`,
              aspectRatio: "1 / 1",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: "2.5px solid var(--primary)",
              background: "color-mix(in oklch, var(--primary) 12%, transparent)",
              boxShadow: "0 0 18px color-mix(in oklch, var(--primary) 50%, transparent)",
              pointerEvents: "none",
            }}
          />
        ) : null,
      )}

      {/* Flash */}
      {flash && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: `${flash.x}%`,
            top: `${flash.y}%`,
            width: 28,
            height: 28,
            transform: "translate(-50%, -50%)",
            borderRadius: 999,
            background: flash.correct
              ? "color-mix(in oklch, var(--primary) 50%, transparent)"
              : "color-mix(in oklch, var(--c-rose) 50%, transparent)",
            border: `2px solid ${
              flash.correct ? "var(--primary)" : "var(--c-rose)"
            }`,
            animation: "scale-in 0.25s var(--ease-out-quint)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Etiqueta A/B */}
      <span
        style={{
          position: "absolute",
          top: 6,
          left: 8,
          padding: "2px 8px",
          borderRadius: 6,
          background: "color-mix(in oklch, #000 55%, transparent)",
          color: "var(--c-gold)",
          fontFamily: "var(--font-display)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.12em",
        }}
      >
        {variant}
      </span>
    </div>
  );
}
