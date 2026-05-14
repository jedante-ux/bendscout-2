"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import {
  COMPASS_HEADINGS,
  angularDiff,
  normalize,
  type CompassHeading,
} from "@/lib/games/brujula/headings";

const TOLERANCE_DEG = 20;
const CORRECT_POINTS = 100;
const ACCURACY_BONUS_MAX = 60; // bonus por estar perfecto (0° diff)
const STREAK_STEP = 10;
const STREAK_CAP = 50;
const FEEDBACK_MS = 700;

export interface BrujulaGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

function pickHeading(prev: CompassHeading | null): CompassHeading {
  const candidates = COMPASS_HEADINGS.filter((h) => h.short !== prev?.short);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function BrujulaGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: BrujulaGameProps) {
  const [target, setTarget] = useState<CompassHeading>(() => pickHeading(null));
  const [pointerDeg, setPointerDeg] = useState<number>(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    state: "correct" | "wrong";
    diff: number;
    delta: number;
  } | null>(null);

  const dialRef = useRef<HTMLDivElement | null>(null);
  const lockedRef = useRef(false);
  const dragStateRef = useRef<{
    pointerId: number;
    startAngle: number;
    startPointerDeg: number;
  } | null>(null);

  const advance = useCallback(() => {
    setTarget((prev) => pickHeading(prev));
    setFeedback(null);
    lockedRef.current = false;
  }, []);

  const computeAngleFromCenter = (clientX: number, clientY: number): number => {
    const el = dialRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    // 0° = norte = arriba (negativo Y), girando en sentido horario.
    const dx = clientX - cx;
    const dy = clientY - cy;
    const rad = Math.atan2(dx, -dy);
    return normalize((rad * 180) / Math.PI);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || lockedRef.current) return;
    const startAngle = computeAngleFromCenter(e.clientX, e.clientY);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startAngle,
      startPointerDeg: pointerDeg,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const currentAngle = computeAngleFromCenter(e.clientX, e.clientY);
    const delta = currentAngle - drag.startAngle;
    setPointerDeg(normalize(drag.startPointerDeg + delta));
  };

  const handleConfirm = useCallback(() => {
    if (!interactive || lockedRef.current) return;
    lockedRef.current = true;
    const diff = angularDiff(pointerDeg, target.degrees);
    const correct = diff <= TOLERANCE_DEG;

    if (correct) {
      const accuracyBonus = Math.round(
        ACCURACY_BONUS_MAX * (1 - diff / TOLERANCE_DEG),
      );
      const nextStreak = streak + 1;
      const streakBonus = Math.min(
        STREAK_CAP,
        Math.max(0, nextStreak - 1) * STREAK_STEP,
      );
      const delta = CORRECT_POINTS + accuracyBonus + streakBonus;
      setStreak(nextStreak);
      setFeedback({ state: "correct", diff, delta });
      onCorrect?.(delta, nextStreak);
    } else {
      setStreak(0);
      setFeedback({ state: "wrong", diff, delta: -30 });
      onWrong?.();
    }

    window.setTimeout(() => advance(), FEEDBACK_MS);
  }, [interactive, pointerDeg, target.degrees, streak, onCorrect, onWrong, advance]);

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const diff = useMemo(
    () => angularDiff(pointerDeg, target.degrees),
    [pointerDeg, target.degrees],
  );
  const intent: "near" | "ok" | "far" =
    diff <= TOLERANCE_DEG ? "ok" : diff <= TOLERANCE_DEG * 2.5 ? "near" : "far";

  return (
    <div
      className="flex flex-1 flex-col items-center"
      style={{ gap: 14, touchAction: "none" }}
    >
      <div
        className="flex items-center justify-between w-full"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Apunta la flecha al rumbo
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
        className="scout-card text-center"
        style={{
          padding: "12px 20px",
          background: "color-mix(in oklch, var(--c-gold) 14%, transparent)",
          border:
            "1px solid color-mix(in oklch, var(--c-gold) 40%, transparent)",
        }}
      >
        <div
          className="t-overline"
          style={{ color: "var(--c-gold)", letterSpacing: "0.18em" }}
        >
          Rumbo objetivo
        </div>
        <div
          className="t-display-md"
          style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}
        >
          {target.name}{" "}
          <span style={{ color: "var(--c-gold)" }}>· {target.short}</span>
        </div>
      </div>

      <CompassDial
        dialRef={dialRef}
        target={target}
        pointerDeg={pointerDeg}
        intent={intent}
        feedback={feedback?.state ?? null}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!interactive || feedback != null}
        className="btn btn-primary"
        style={{
          height: 56,
          width: "100%",
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        {feedback ? (
          <>
            <ScoutIcon
              name={feedback.state === "correct" ? "check" : "close"}
              size={16}
              stroke={2.4}
            />
            {feedback.state === "correct"
              ? `¡Bien! ±${Math.round(feedback.diff)}° · +${feedback.delta}`
              : `Fallaste por ${Math.round(feedback.diff)}°`}
          </>
        ) : (
          <>
            <ScoutIcon name="compass" size={16} stroke={2.4} /> Confirmar
            rumbo
          </>
        )}
      </button>
    </div>
  );
}

interface DialProps {
  dialRef: React.RefObject<HTMLDivElement | null>;
  target: CompassHeading;
  pointerDeg: number;
  intent: "near" | "ok" | "far";
  feedback: "correct" | "wrong" | null;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

function CompassDial({
  dialRef,
  target,
  pointerDeg,
  intent,
  feedback,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: DialProps) {
  const arrowColor =
    feedback === "correct"
      ? "var(--primary)"
      : feedback === "wrong"
        ? "var(--c-rose)"
        : intent === "ok"
          ? "var(--primary)"
          : intent === "near"
            ? "var(--c-gold)"
            : "var(--c-rose)";

  const glow =
    feedback === "correct"
      ? "color-mix(in oklch, var(--primary) 50%, transparent)"
      : feedback === "wrong"
        ? "color-mix(in oklch, var(--c-rose) 40%, transparent)"
        : intent === "ok"
          ? "color-mix(in oklch, var(--primary) 40%, transparent)"
          : "color-mix(in oklch, var(--c-gold) 25%, transparent)";

  return (
    <div
      ref={dialRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "relative",
        width: "min(86vw, 320px)",
        aspectRatio: "1 / 1",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 50% 38%, oklch(0.34 0.06 80) 0%, oklch(0.18 0.04 60) 70%, oklch(0.10 0.02 60) 100%)",
        border: "2px solid color-mix(in oklch, var(--c-gold) 30%, var(--border))",
        boxShadow: `inset 0 0 60px ${glow}, 0 16px 36px oklch(0 0 0 / 0.45)`,
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
        transition: "box-shadow 0.4s var(--ease-out-quint)",
      }}
    >
      {/* Wedge del rumbo objetivo */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="bru-target" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop
              offset="60%"
              stopColor="color-mix(in oklch, var(--c-gold) 25%, transparent)"
            />
            <stop
              offset="100%"
              stopColor="color-mix(in oklch, var(--c-gold) 12%, transparent)"
            />
          </radialGradient>
        </defs>
        <g transform={`translate(100,100) rotate(${target.degrees})`}>
          <path
            d={`M 0 0 L ${Math.sin((-TOLERANCE_DEG * Math.PI) / 180) * 96} ${
              -Math.cos((-TOLERANCE_DEG * Math.PI) / 180) * 96
            } A 96 96 0 0 1 ${Math.sin((TOLERANCE_DEG * Math.PI) / 180) * 96} ${
              -Math.cos((TOLERANCE_DEG * Math.PI) / 180) * 96
            } Z`}
            fill="url(#bru-target)"
          />
        </g>
      </svg>

      {/* Rosa de los vientos (etiquetas N/E/S/O) */}
      {COMPASS_HEADINGS.map((h) => {
        const isCardinal = h.short.length === 1;
        const rad = (h.degrees * Math.PI) / 180;
        const r = 0.41;
        const x = 50 + Math.sin(rad) * r * 100;
        const y = 50 - Math.cos(rad) * r * 100;
        return (
          <span
            key={h.short}
            aria-hidden
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: isCardinal ? 18 : 12,
              color: h.short === "N" ? "var(--c-rose)" : "var(--fg-soft)",
              letterSpacing: "0.05em",
              pointerEvents: "none",
            }}
          >
            {h.short}
          </span>
        );
      })}

      {/* Marcas de grado */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full pointer-events-none"
        aria-hidden
      >
        {Array.from({ length: 36 }).map((_, i) => {
          const deg = i * 10;
          const isMajor = deg % 45 === 0;
          const r1 = isMajor ? 84 : 90;
          const r2 = 94;
          return (
            <line
              key={i}
              x1={100 + Math.sin((deg * Math.PI) / 180) * r1}
              y1={100 - Math.cos((deg * Math.PI) / 180) * r1}
              x2={100 + Math.sin((deg * Math.PI) / 180) * r2}
              y2={100 - Math.cos((deg * Math.PI) / 180) * r2}
              stroke="color-mix(in oklch, #fff 30%, transparent)"
              strokeWidth={isMajor ? 1.4 : 0.6}
            />
          );
        })}
      </svg>

      {/* Flecha del jugador */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          transform: `rotate(${pointerDeg}deg)`,
          transition: feedback ? "transform 0.4s var(--ease-out-quint)" : "none",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full"
          aria-hidden
        >
          <defs>
            <filter id="bru-arrow-glow">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#bru-arrow-glow)">
            <polygon
              points="100,18 108,100 100,90 92,100"
              fill={arrowColor}
            />
            <polygon
              points="100,182 108,100 100,110 92,100"
              fill="oklch(0.85 0.03 60)"
            />
            <circle cx="100" cy="100" r="9" fill="#1a1612" stroke={arrowColor} strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}
