"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";
import {
  CONSTELLATIONS,
  type Constellation,
} from "@/lib/games/constellations/constellations";

const OPTIONS_PER_ROUND = 4;
const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 50;
const FEEDBACK_MS = 700;

export interface ConstellationsGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  /** Cuando llega a 0 se dispara onTimeout. Controlado por el padre. */
  timeLeftSeconds: number;
}

interface Round {
  constellation: Constellation;
  options: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(
  pool: Constellation[],
  previousId: string | null,
): Round {
  const candidates = pool.filter((c) => c.id !== previousId);
  const correct =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    pool[Math.floor(Math.random() * pool.length)];

  const wrongNames = shuffle(
    pool.filter((c) => c.id !== correct.id).map((c) => c.name),
  ).slice(0, OPTIONS_PER_ROUND - 1);

  const options = shuffle([correct.name, ...wrongNames]);
  return { constellation: correct, options };
}

export function ConstellationsGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: ConstellationsGameProps) {
  const [round, setRound] = useState<Round>(() =>
    buildRound(CONSTELLATIONS, null),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const previousIdRef = useRef<string | null>(null);
  const lockedRef = useRef(false);

  const advance = useCallback(() => {
    setRound((prev) => {
      previousIdRef.current = prev.constellation.id;
      return buildRound(CONSTELLATIONS, prev.constellation.id);
    });
    setPicked(null);
    lockedRef.current = false;
  }, []);

  const handlePick = (option: string) => {
    if (!interactive || lockedRef.current) return;
    lockedRef.current = true;
    setPicked(option);

    const isCorrect = option === round.constellation.name;
    if (isCorrect) {
      const nextStreak = streak + 1;
      const bonus = Math.min(STREAK_CAP, Math.max(0, nextStreak - 1) * STREAK_STEP);
      const delta = CORRECT_POINTS + bonus;
      setStreak(nextStreak);
      onCorrect?.(delta, nextStreak);
    } else {
      setStreak(0);
      onWrong?.();
    }

    window.setTimeout(() => advance(), FEEDBACK_MS);
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      onTimeout?.();
    }
  }, [timeLeftSeconds, onTimeout]);

  const isCorrect = picked === round.constellation.name;

  return (
    <div className="flex flex-1 flex-col" style={{ gap: 14 }}>
      <ConstellationCanvas
        constellation={round.constellation}
        flash={picked ? (isCorrect ? "correct" : "wrong") : null}
      />

      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span className="t-overline text-muted" style={{ letterSpacing: "0.14em" }}>
          ¿Qué constelación es?
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

      <div className="grid grid-cols-1 gap-2.5">
        {round.options.map((opt, idx) => {
          const isPicked = picked === opt;
          const isAnswer = opt === round.constellation.name;
          const reveal = picked != null;
          const state: "idle" | "ok" | "fail" | "miss" =
            !reveal
              ? "idle"
              : isPicked && isAnswer
                ? "ok"
                : isPicked
                  ? "fail"
                  : isAnswer
                    ? "miss"
                    : "idle";

          const stateStyle: React.CSSProperties =
            state === "ok"
              ? {
                  background:
                    "color-mix(in oklch, var(--primary) 28%, transparent)",
                  borderColor:
                    "color-mix(in oklch, var(--primary) 55%, transparent)",
                  color: "var(--primary)",
                }
              : state === "fail"
                ? {
                    background:
                      "color-mix(in oklch, var(--c-rose) 24%, transparent)",
                    borderColor:
                      "color-mix(in oklch, var(--c-rose) 55%, transparent)",
                    color: "var(--c-rose)",
                  }
                : state === "miss"
                  ? {
                      background:
                        "color-mix(in oklch, var(--primary) 14%, transparent)",
                      borderColor:
                        "color-mix(in oklch, var(--primary) 35%, transparent)",
                      color: "var(--primary)",
                    }
                  : {};

          return (
            <button
              key={`${round.constellation.id}-${opt}`}
              type="button"
              onClick={() => handlePick(opt)}
              disabled={!interactive || picked != null}
              className={cn("btn", state === "idle" ? "btn-secondary" : "btn-secondary")}
              style={{
                height: 54,
                justifyContent: "flex-start",
                gap: 12,
                padding: "0 14px",
                fontSize: 15,
                transition: "all 0.22s var(--ease-out-quint)",
                ...stateStyle,
              }}
            >
              <span
                className="grid place-items-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background:
                    state === "idle"
                      ? "var(--card)"
                      : "color-mix(in oklch, currentColor 16%, transparent)",
                  color: state === "idle" ? "var(--fg-muted)" : "currentColor",
                  fontFamily: "var(--font-display)",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ textAlign: "left", flex: 1 }}>{opt}</span>
              {state === "ok" && <ScoutIcon name="check" size={16} stroke={2.4} />}
              {state === "fail" && <ScoutIcon name="close" size={16} stroke={2.4} />}
              {state === "miss" && (
                <span
                  className="t-caption"
                  style={{ color: "var(--primary)", fontWeight: 700 }}
                >
                  correcta
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CanvasProps {
  constellation: Constellation;
  flash: "correct" | "wrong" | null;
}

function ConstellationCanvas({ constellation, flash }: CanvasProps) {
  const seeds = useMemo(() => {
    let h = 2166136261;
    for (let k = 0; k < constellation.id.length; k++) {
      h ^= constellation.id.charCodeAt(k);
      h = Math.imul(h, 16777619);
    }
    const offset = Math.abs(h % 97);
    return Array.from({ length: 36 }).map((_, i) => {
      const j = i + offset;
      return {
        cx: ((j * 53) % 100) + (j % 7) * 0.3,
        cy: ((j * 37) % 100) + (j % 5) * 0.6,
        r: 0.25 + ((j * 17) % 11) / 30,
        opacity: 0.18 + ((j * 13) % 8) / 30,
      };
    });
  }, [constellation.id]);

  const accent =
    flash === "correct"
      ? "var(--primary)"
      : flash === "wrong"
        ? "var(--c-rose)"
        : "var(--c-sky)";
  const glow =
    flash === "correct"
      ? "color-mix(in oklch, var(--primary) 35%, transparent)"
      : flash === "wrong"
        ? "color-mix(in oklch, var(--c-rose) 30%, transparent)"
        : "color-mix(in oklch, var(--c-sky) 30%, transparent)";

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "1 / 1",
        background:
          "radial-gradient(80% 70% at 50% 40%, oklch(0.20 0.05 270) 0%, oklch(0.10 0.03 270) 60%, oklch(0.05 0.02 270) 100%)",
        border: "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
        boxShadow: `inset 0 0 60px ${glow}`,
        transition: "box-shadow 0.4s var(--ease-out-quint)",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="star-bright" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="40%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id="constellation-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {seeds.map((s, i) => (
          <circle
            key={`bg-${i}`}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#fff"
            opacity={s.opacity}
          />
        ))}

        <g filter="url(#constellation-glow)">
          {constellation.lines.map(([a, b], i) => {
            const sa = constellation.stars[a];
            const sb = constellation.stars[b];
            if (!sa || !sb) return null;
            return (
              <line
                key={`l-${i}`}
                x1={sa.x}
                y1={sa.y}
                x2={sb.x}
                y2={sb.y}
                stroke={accent}
                strokeWidth={0.6}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}

          {constellation.stars.map((star, i) => {
            const size = star.size ?? 1;
            return (
              <g key={`s-${i}`}>
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={2.6 * size}
                  fill="url(#star-bright)"
                />
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={1.1 * size}
                  fill="#fff"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
