"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import {
  KNOT_PUZZLES,
  type KnotPuzzle,
  type KnotStep,
} from "@/lib/games/nudo-pasos/knots";

const PERFECT_POINTS = 180;
const PARTIAL_PER_PAIR = 30;
const WRONG_PENALTY = 25;
const STREAK_STEP = 15;
const STREAK_CAP = 70;
const FEEDBACK_MS = 1200;

export interface NudoPasosGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Round {
  puzzle: KnotPuzzle;
  steps: KnotStep[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(prevId: string | null): Round {
  const candidates = KNOT_PUZZLES.filter((p) => p.id !== prevId);
  const puzzle =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    KNOT_PUZZLES[Math.floor(Math.random() * KNOT_PUZZLES.length)];
  // Asegura que el orden inicial no sea ya el correcto.
  let initial = shuffle(puzzle.steps);
  let safety = 6;
  while (
    safety-- > 0 &&
    initial.every((s, i) => s.order === i + 1)
  ) {
    initial = shuffle(puzzle.steps);
  }
  return { puzzle, steps: initial };
}

export function NudoPasosGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: NudoPasosGameProps) {
  const [round, setRound] = useState<Round>(() => buildRound(null));
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<"sort" | "reveal">("sort");
  const [revealResult, setRevealResult] = useState<{
    delta: number;
    perfect: boolean;
  } | null>(null);
  const lockedRef = useRef(false);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointerRef = useRef<{
    id: number;
    startY: number;
    fromIdx: number;
  } | null>(null);

  const reset = useCallback(() => {
    setRound((prev) => buildRound(prev.puzzle.id));
    setPhase("sort");
    setRevealResult(null);
    setDragIdx(null);
    setOverIdx(null);
    setDragOffsetY(0);
    lockedRef.current = false;
  }, []);

  const onItemPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    idx: number,
  ) => {
    if (!interactive || phase !== "sort" || lockedRef.current) return;
    pointerRef.current = { id: e.pointerId, startY: e.clientY, fromIdx: idx };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIdx(idx);
    setOverIdx(idx);
    setDragOffsetY(0);
  };

  const onItemPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p || p.id !== e.pointerId) return;
    setDragOffsetY(e.clientY - p.startY);
    const slots = slotRefs.current;
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (!s) continue;
      const r = s.getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom) {
        setOverIdx(i);
        return;
      }
    }
  };

  const onItemPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p || p.id !== e.pointerId) return;
    const from = p.fromIdx;
    const to = overIdx ?? from;
    pointerRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
    setDragOffsetY(0);
    if (from !== to) {
      setRound((r) => {
        const next = [...r.steps];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return { ...r, steps: next };
      });
    }
  };

  const handleSubmit = () => {
    if (!interactive || phase !== "sort" || lockedRef.current) return;
    lockedRef.current = true;

    let pairs = 0;
    for (let i = 0; i < round.steps.length - 1; i++) {
      if (round.steps[i].order <= round.steps[i + 1].order) pairs++;
    }
    const totalPairs = round.steps.length - 1;
    const isPerfect = pairs === totalPairs;

    let delta = 0;
    if (isPerfect) {
      const nextStreak = streak + 1;
      const bonus = Math.min(
        STREAK_CAP,
        Math.max(0, nextStreak - 1) * STREAK_STEP,
      );
      setStreak(nextStreak);
      delta = PERFECT_POINTS + bonus;
      onCorrect?.(delta, nextStreak);
    } else {
      setStreak(0);
      delta = pairs * PARTIAL_PER_PAIR - WRONG_PENALTY;
      if (delta > 0) {
        onCorrect?.(delta, 0);
      } else {
        delta = -WRONG_PENALTY;
        onWrong?.();
      }
    }

    setRevealResult({ delta, perfect: isPerfect });
    setPhase("reveal");
    window.setTimeout(() => reset(), FEEDBACK_MS + 200);
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const correctOrder = useMemo(
    () => [...round.puzzle.steps].sort((a, b) => a.order - b.order),
    [round.puzzle],
  );

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ gap: 14, touchAction: "none" }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Ordena los pasos del nudo
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
        className="flex items-center justify-center gap-3 rounded-2xl"
        style={{
          padding: "10px 16px",
          background: "color-mix(in oklch, var(--c-orange) 14%, transparent)",
          border:
            "1.5px solid color-mix(in oklch, var(--c-orange) 35%, transparent)",
        }}
      >
        <span style={{ fontSize: 28 }}>{round.puzzle.emoji}</span>
        <div>
          <div
            className="t-overline text-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Hacer un
          </div>
          <div
            className="t-display-sm"
            style={{ fontSize: 20, fontWeight: 800, color: "var(--c-orange)" }}
          >
            {round.puzzle.name}
          </div>
        </div>
      </div>

      <div className="vstack" style={{ gap: 8, flex: 1 }}>
        {round.steps.map((step, idx) => {
          const isDragging = dragIdx === idx;
          const isReveal = phase === "reveal";
          const correctIdx = correctOrder.findIndex((s) => s.id === step.id);
          const isInPlace = isReveal && correctIdx === idx;

          const stateBorder = isReveal
            ? isInPlace
              ? "color-mix(in oklch, var(--primary) 55%, transparent)"
              : "color-mix(in oklch, var(--c-rose) 55%, transparent)"
            : isDragging
              ? "color-mix(in oklch, var(--c-orange) 55%, transparent)"
              : "var(--border)";
          const stateBg = isReveal
            ? isInPlace
              ? "color-mix(in oklch, var(--primary) 14%, transparent)"
              : "color-mix(in oklch, var(--c-rose) 12%, transparent)"
            : "var(--surface)";

          return (
            <div
              key={step.id}
              ref={(el) => {
                slotRefs.current[idx] = el;
              }}
              onPointerDown={(e) => onItemPointerDown(e, idx)}
              onPointerMove={onItemPointerMove}
              onPointerUp={onItemPointerUp}
              onPointerCancel={onItemPointerUp}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                border: `1.5px solid ${stateBorder}`,
                background: stateBg,
                cursor: interactive && phase === "sort" ? "grab" : "default",
                userSelect: "none",
                touchAction: "none",
                transform: isDragging
                  ? `translateY(${dragOffsetY * 0.6}px) scale(1.02)`
                  : "translateY(0) scale(1)",
                boxShadow: isDragging
                  ? "0 14px 28px oklch(0 0 0 / 0.4)"
                  : "none",
                zIndex: isDragging ? 10 : 1,
                transition: isDragging
                  ? "none"
                  : "all 0.28s var(--ease-out-quint)",
                opacity: isDragging ? 0.92 : 1,
              }}
            >
              <span
                className="grid place-items-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: isReveal
                    ? isInPlace
                      ? "color-mix(in oklch, var(--primary) 20%, transparent)"
                      : "color-mix(in oklch, var(--c-rose) 20%, transparent)"
                    : "var(--card)",
                  color: isReveal
                    ? isInPlace
                      ? "var(--primary)"
                      : "var(--c-rose)"
                    : "var(--fg-muted)",
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {idx + 1}
              </span>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{step.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="t-body-sm"
                  style={{ fontWeight: 600, lineHeight: 1.3 }}
                >
                  {step.text}
                </div>
                {isReveal && (
                  <div
                    className="t-caption"
                    style={{
                      color: isInPlace ? "var(--primary)" : "var(--c-rose)",
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    Paso correcto: {step.order}
                  </div>
                )}
              </div>
              {!isReveal && interactive && (
                <ScoutIcon
                  name="menu"
                  size={14}
                  className="text-muted"
                  stroke={2}
                />
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!interactive || phase !== "sort"}
          className="btn btn-primary"
          style={{ height: 52, marginTop: 8, fontWeight: 800 }}
        >
          {phase === "reveal" ? (
            <>
              <ScoutIcon name="check" size={16} stroke={2.4} />
              {revealResult?.perfect
                ? "¡Perfecto!"
                : revealResult?.delta && revealResult.delta > 0
                  ? `+${revealResult.delta} pts`
                  : "Casi…"}
            </>
          ) : (
            <>
              <ScoutIcon name="check" size={16} stroke={2.4} />
              Confirmar orden
            </>
          )}
        </button>
      </div>
    </div>
  );
}
