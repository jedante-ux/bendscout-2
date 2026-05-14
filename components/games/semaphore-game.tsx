"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";
import {
  SEMAPHORE_LETTERS,
  armAngle,
  type SemaphoreLetter,
} from "@/lib/games/semaphore/alphabet";

const OPTIONS_PER_ROUND = 4;
const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 50;
const FEEDBACK_MS = 700;

export interface SemaphoreGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Round {
  letter: SemaphoreLetter;
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
  pool: SemaphoreLetter[],
  previousLetter: string | null,
): Round {
  const candidates = pool.filter((c) => c.letter !== previousLetter);
  const correct =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(
    pool.filter((c) => c.letter !== correct.letter).map((c) => c.letter),
  ).slice(0, OPTIONS_PER_ROUND - 1);
  const options = shuffle([correct.letter, ...wrong]);
  return { letter: correct, options };
}

export function SemaphoreGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: SemaphoreGameProps) {
  const [round, setRound] = useState<Round>(() =>
    buildRound(SEMAPHORE_LETTERS, null),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const lockedRef = useRef(false);

  const advance = useCallback(() => {
    setRound((prev) => buildRound(SEMAPHORE_LETTERS, prev.letter.letter));
    setPicked(null);
    lockedRef.current = false;
  }, []);

  const handlePick = (option: string) => {
    if (!interactive || lockedRef.current) return;
    lockedRef.current = true;
    setPicked(option);

    const isCorrect = option === round.letter.letter;
    if (isCorrect) {
      const nextStreak = streak + 1;
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

    window.setTimeout(() => advance(), FEEDBACK_MS);
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  return (
    <div className="flex flex-1 flex-col" style={{ gap: 14 }}>
      <SemaphoreFigure
        letter={round.letter}
        flash={
          picked
            ? picked === round.letter.letter
              ? "correct"
              : "wrong"
            : null
        }
      />

      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          ¿Qué letra está señalando?
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

      <div className="grid grid-cols-2 gap-2.5">
        {round.options.map((opt) => {
          const isPicked = picked === opt;
          const isAnswer = opt === round.letter.letter;
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
              key={`${round.letter.letter}-${opt}`}
              type="button"
              onClick={() => handlePick(opt)}
              disabled={!interactive || picked != null}
              className={cn("btn btn-secondary")}
              style={{
                height: 64,
                justifyContent: "center",
                padding: 0,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "0.04em",
                transition: "all 0.22s var(--ease-out-quint)",
                ...stateStyle,
              }}
            >
              {opt}
              {state === "ok" && (
                <ScoutIcon
                  name="check"
                  size={16}
                  stroke={2.4}
                  style={{ marginLeft: 8 }}
                />
              )}
              {state === "fail" && (
                <ScoutIcon
                  name="close"
                  size={16}
                  stroke={2.4}
                  style={{ marginLeft: 8 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FigureProps {
  letter: SemaphoreLetter;
  flash: "correct" | "wrong" | null;
}

function SemaphoreFigure({ letter, flash }: FigureProps) {
  const accent =
    flash === "correct"
      ? "var(--primary)"
      : flash === "wrong"
        ? "var(--c-rose)"
        : "var(--c-gold)";
  const glow =
    flash === "correct"
      ? "color-mix(in oklch, var(--primary) 35%, transparent)"
      : flash === "wrong"
        ? "color-mix(in oklch, var(--c-rose) 30%, transparent)"
        : "color-mix(in oklch, var(--c-gold) 22%, transparent)";

  // Cuerpo en (50, 55), hombros en (44/56, 38)
  const shoulderL = { x: 44, y: 38 };
  const shoulderR = { x: 56, y: 38 };
  const armLen = 26;

  const angleL = useMemo(() => armAngle("left", letter.left), [letter.left]);
  const angleR = useMemo(
    () => armAngle("right", letter.right),
    [letter.right],
  );

  const endL = {
    x: shoulderL.x + Math.cos((angleL * Math.PI) / 180) * armLen,
    y: shoulderL.y - Math.sin((angleL * Math.PI) / 180) * armLen,
  };
  const endR = {
    x: shoulderR.x + Math.cos((angleR * Math.PI) / 180) * armLen,
    y: shoulderR.y - Math.sin((angleR * Math.PI) / 180) * armLen,
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "1 / 1",
        background:
          "linear-gradient(170deg, oklch(0.32 0.06 220) 0%, oklch(0.18 0.04 230) 100%)",
        border: "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
        boxShadow: `inset 0 0 60px ${glow}`,
        transition: "box-shadow 0.4s var(--ease-out-quint)",
      }}
    >
      {/* horizonte */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "auto 0 18% 0",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklch, #fff 22%, transparent), transparent)",
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <filter
            id="flag-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* sombra al pie */}
        <ellipse
          cx="50"
          cy="86"
          rx="14"
          ry="2.2"
          fill="oklch(0 0 0 / 0.45)"
        />

        {/* piernas */}
        <line
          x1="50"
          y1="62"
          x2="46"
          y2="84"
          stroke="#e9e9ee"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="62"
          x2="54"
          y2="84"
          stroke="#e9e9ee"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* torso */}
        <line
          x1="50"
          y1="38"
          x2="50"
          y2="62"
          stroke="#e9e9ee"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* hombros */}
        <line
          x1={shoulderL.x}
          y1={shoulderL.y}
          x2={shoulderR.x}
          y2={shoulderR.y}
          stroke="#e9e9ee"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* cabeza */}
        <circle
          cx="50"
          cy="30"
          r="6"
          fill="oklch(0.85 0.04 60)"
          stroke="#e9e9ee"
          strokeWidth="1.2"
        />
        {/* boina scout */}
        <path
          d="M 43 27 Q 50 21 57 27 L 57 30 L 43 30 Z"
          fill={accent}
          opacity="0.9"
        />

        {/* brazo izquierdo */}
        <g filter="url(#flag-glow)">
          <line
            x1={shoulderL.x}
            y1={shoulderL.y}
            x2={endL.x}
            y2={endL.y}
            stroke="#e9e9ee"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <SemaphoreFlag x={endL.x} y={endL.y} variant="left" />
        </g>

        {/* brazo derecho */}
        <g filter="url(#flag-glow)">
          <line
            x1={shoulderR.x}
            y1={shoulderR.y}
            x2={endR.x}
            y2={endR.y}
            stroke="#e9e9ee"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <SemaphoreFlag x={endR.x} y={endR.y} variant="right" />
        </g>
      </svg>
    </div>
  );
}

function SemaphoreFlag({
  x,
  y,
  variant,
}: {
  x: number;
  y: number;
  variant: "left" | "right";
}) {
  // Bandera dividida diagonal: mitad roja, mitad amarilla (estándar scout)
  const w = 8;
  const h = 8;
  const x0 = variant === "left" ? x - w : x;
  const y0 = y - h / 2;
  const id = `sem-flag-${variant}`;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={x0} y={y0} width={w} height={h} rx={0.6} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={x0} y={y0} width={w} height={h} fill="#f3c12c" />
        <polygon
          points={`${x0},${y0} ${x0 + w},${y0} ${x0},${y0 + h}`}
          fill="#d44a3a"
        />
      </g>
      <rect
        x={x0}
        y={y0}
        width={w}
        height={h}
        fill="none"
        stroke="oklch(0 0 0 / 0.4)"
        strokeWidth="0.4"
      />
    </g>
  );
}
