"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TRACK_TYPES, type TrackType } from "@/lib/games/huellas/tracks";

const GRID_COLS = 3;
const GRID_ROWS = 4;
const CELLS = GRID_COLS * GRID_ROWS;

const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 60;

const INITIAL_SPAWN_MS = 720;
const MIN_SPAWN_MS = 320;
const SPAWN_DECAY_MS = 18; // cada spawn, baja un poco el intervalo
const TRACK_LIFETIME_MS = 1300;
const TARGET_ROTATE_MS = 7500;
const TARGET_BIAS = 0.55; // prob. de que el spawn sea del tipo objetivo
const FEEDBACK_MS = 220;

export interface HuellasGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Track {
  id: string;
  cellIdx: number;
  type: TrackType;
  spawnedAt: number;
  expiresAt: number;
  feedback?: "correct" | "wrong";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let _trackCounter = 0;
const nextId = () => `t${++_trackCounter}`;

export function HuellasGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: HuellasGameProps) {
  const [target, setTarget] = useState<TrackType>(() => pick(TRACK_TYPES));
  const [tracks, setTracks] = useState<Track[]>([]);
  const [streak, setStreak] = useState(0);
  const [spawnInterval, setSpawnInterval] = useState(INITIAL_SPAWN_MS);

  const interactiveRef = useRef(interactive);
  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  const targetRef = useRef(target);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  const streakRef = useRef(streak);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  // Spawner: agrega un track cada `spawnInterval` ms.
  useEffect(() => {
    if (!interactive) return;
    let mounted = true;
    let interval = spawnInterval;

    const spawnOne = () => {
      if (!mounted) return;
      setTracks((prev) => {
        // No reusar celdas ocupadas.
        const occupied = new Set(prev.map((t) => t.cellIdx));
        const free = [];
        for (let i = 0; i < CELLS; i++) if (!occupied.has(i)) free.push(i);
        if (free.length === 0) return prev;

        const useTarget = Math.random() < TARGET_BIAS;
        const distractors = TRACK_TYPES.filter(
          (t) => t.id !== targetRef.current.id,
        );
        const type = useTarget ? targetRef.current : pick(distractors);
        const cellIdx = free[Math.floor(Math.random() * free.length)];
        const now = performance.now();
        const track: Track = {
          id: nextId(),
          cellIdx,
          type,
          spawnedAt: now,
          expiresAt: now + TRACK_LIFETIME_MS,
        };
        return [...prev, track];
      });

      // Acelera el siguiente spawn levemente.
      interval = Math.max(MIN_SPAWN_MS, interval - SPAWN_DECAY_MS);
      setSpawnInterval(interval);
      timer = window.setTimeout(spawnOne, interval);
    };

    let timer = window.setTimeout(spawnOne, interval);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
    // Se reinicia cuando arranca interactive; el spawnInterval se ajusta solo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  // Cleanup de tracks expirados.
  useEffect(() => {
    if (!interactive) return;
    const id = window.setInterval(() => {
      const now = performance.now();
      setTracks((prev) => {
        const next: Track[] = [];
        let missed = 0;
        for (const t of prev) {
          if (now >= t.expiresAt) {
            if (t.type.id === targetRef.current.id && !t.feedback) {
              missed += 1;
            }
            continue;
          }
          next.push(t);
        }
        if (missed > 0 && interactiveRef.current) {
          onWrong?.();
          setStreak(0);
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [interactive, onWrong]);

  // Rotación del tipo objetivo.
  useEffect(() => {
    if (!interactive) return;
    const id = window.setInterval(() => {
      setTarget((prev) => {
        const others = TRACK_TYPES.filter((t) => t.id !== prev.id);
        return pick(others);
      });
    }, TARGET_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [interactive]);

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const handleTap = useCallback(
    (track: Track) => {
      if (!interactiveRef.current || track.feedback) return;
      const correct = track.type.id === targetRef.current.id;
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? { ...t, feedback: correct ? "correct" : "wrong" }
            : t,
        ),
      );

      if (correct) {
        const nextStreak = streakRef.current + 1;
        const bonus = Math.min(
          STREAK_CAP,
          Math.max(0, nextStreak - 1) * STREAK_STEP,
        );
        setStreak(nextStreak);
        onCorrect?.(CORRECT_POINTS + bonus, nextStreak);
      } else {
        setStreak(0);
        onWrong?.();
      }

      // Quita la huella después del flash.
      window.setTimeout(() => {
        setTracks((prev) => prev.filter((t) => t.id !== track.id));
      }, FEEDBACK_MS);
    },
    [onCorrect, onWrong],
  );

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ gap: 14, touchAction: "manipulation" }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Toca solo las huellas correctas
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

      <TargetBanner target={target} />

      <Grid tracks={tracks} target={target} onTap={handleTap} />
    </div>
  );
}

function TargetBanner({ target }: { target: TrackType }) {
  return (
    <div
      className="flex items-center justify-center gap-3 rounded-2xl"
      style={{
        padding: "12px 16px",
        background: `color-mix(in oklch, ${target.color} 18%, transparent)`,
        border: `1.5px solid color-mix(in oklch, ${target.color} 45%, transparent)`,
        transition: "background 0.3s var(--ease-out-quint), border-color 0.3s",
      }}
    >
      <span style={{ fontSize: 32, lineHeight: 1 }}>{target.emoji}</span>
      <div>
        <div className="t-overline text-muted" style={{ letterSpacing: "0.16em" }}>
          Caza solo
        </div>
        <div
          className="t-display-sm"
          style={{ fontSize: 22, fontWeight: 800, color: target.color }}
        >
          {target.name}
        </div>
      </div>
    </div>
  );
}

function Grid({
  tracks,
  target,
  onTap,
}: {
  tracks: Track[];
  target: TrackType;
  onTap: (t: Track) => void;
}) {
  const byCell = useMemo(() => {
    const map = new Map<number, Track>();
    for (const t of tracks) map.set(t.cellIdx, t);
    return map;
  }, [tracks]);

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gap: 10,
        flex: 1,
        minHeight: 0,
      }}
    >
      {Array.from({ length: CELLS }).map((_, i) => {
        const t = byCell.get(i);
        return (
          <Cell
            key={i}
            track={t}
            target={target}
            onTap={onTap}
          />
        );
      })}
    </div>
  );
}

function Cell({
  track,
  target,
  onTap,
}: {
  track: Track | undefined;
  target: TrackType;
  onTap: (t: Track) => void;
}) {
  const fb = track?.feedback;
  const accent = fb === "correct"
    ? "var(--primary)"
    : fb === "wrong"
      ? "var(--c-rose)"
      : track
        ? track.type.color
        : "var(--border)";

  // Progress bar: cuánto queda de vida (0..1)
  const [life, setLife] = useState(1);
  useEffect(() => {
    if (!track) return;
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const t = (track.expiresAt - now) / (track.expiresAt - track.spawnedAt);
      setLife(Math.max(0, Math.min(1, t)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [track]);

  return (
    <button
      type="button"
      onClick={() => track && onTap(track)}
      disabled={!track || !!fb}
      className="rounded-2xl"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        background: track
          ? `color-mix(in oklch, ${accent} 16%, oklch(0.18 0.04 80))`
          : "color-mix(in oklch, var(--bg) 60%, transparent)",
        border: `1.5px solid color-mix(in oklch, ${accent} ${track ? 55 : 25}%, transparent)`,
        cursor: track ? "pointer" : "default",
        transition: "all 0.18s var(--ease-out-quint)",
        transform: fb === "correct"
          ? "scale(0.92)"
          : fb === "wrong"
            ? "scale(0.92) rotate(-3deg)"
            : track
              ? "scale(1)"
              : "scale(0.98)",
        opacity: track ? 1 : 0.55,
        boxShadow: fb
          ? `inset 0 0 30px color-mix(in oklch, ${accent} 50%, transparent)`
          : track
            ? `0 6px 20px color-mix(in oklch, ${accent} 22%, transparent)`
            : "none",
        userSelect: "none",
        padding: 0,
      }}
    >
      {track && (
        <>
          <span
            style={{
              fontSize: "clamp(28px, 8vw, 44px)",
              filter:
                track.type.id === target.id
                  ? "drop-shadow(0 0 12px color-mix(in oklch, currentColor 60%, transparent))"
                  : undefined,
              lineHeight: 1,
            }}
          >
            {track.type.emoji}
          </span>
          {/* Indicador de vida abajo */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              bottom: 8,
              height: 3,
              borderRadius: 999,
              background: "color-mix(in oklch, #000 50%, transparent)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${life * 100}%`,
                background: accent,
                transition: "width 80ms linear",
              }}
            />
          </span>
        </>
      )}
    </button>
  );
}
