"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";
import {
  SCENARIOS,
  type ResponseScenario,
} from "@/lib/games/first-response/scenarios";

const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 50;
const FEEDBACK_MS = 900;

export interface FirstResponseGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  /** Cuando llega a 0 se dispara onTimeout. Controlado por el padre. */
  timeLeftSeconds: number;
}

interface Round {
  scenario: ResponseScenario;
  /** Opciones en orden mezclado; guardamos el índice correcto post-shuffle. */
  options: { text: string; correct: boolean }[];
  correctIndex: number;
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
  pool: ResponseScenario[],
  previousId: string | null,
): Round {
  const candidates = pool.filter((s) => s.id !== previousId);
  const scenario =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    pool[Math.floor(Math.random() * pool.length)];

  const normalized = scenario.options.map((o) => ({
    text: o.text,
    correct: Boolean(o.correct),
  }));
  const options = shuffle(normalized);
  const correctIndex = options.findIndex((o) => o.correct);
  return { scenario, options, correctIndex };
}

export function FirstResponseGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: FirstResponseGameProps) {
  const [round, setRound] = useState<Round>(() => buildRound(SCENARIOS, null));
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const lockedRef = useRef(false);

  const advance = useCallback(() => {
    setRound((prev) => buildRound(SCENARIOS, prev.scenario.id));
    setPickedIdx(null);
    lockedRef.current = false;
  }, []);

  const handlePick = (idx: number) => {
    if (!interactive || lockedRef.current) return;
    lockedRef.current = true;
    setPickedIdx(idx);

    const isCorrect = idx === round.correctIndex;
    if (isCorrect) {
      const nextStreak = streak + 1;
      const bonus = Math.min(
        STREAK_CAP,
        Math.max(0, nextStreak - 1) * STREAK_STEP,
      );
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

  const revealed = pickedIdx != null;
  const pickedCorrect = revealed && pickedIdx === round.correctIndex;

  return (
    <div className="flex flex-1 flex-col" style={{ gap: 14 }}>
      <ScenarioCard
        scenario={round.scenario}
        flash={revealed ? (pickedCorrect ? "correct" : "wrong") : null}
      />

      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          ¿Qué haces primero?
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
          const isPicked = pickedIdx === idx;
          const isAnswer = idx === round.correctIndex;
          const state: "idle" | "ok" | "fail" | "miss" = !revealed
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
              key={`${round.scenario.id}-${idx}`}
              type="button"
              onClick={() => handlePick(idx)}
              disabled={!interactive || revealed}
              className={cn("btn", "btn-secondary")}
              style={{
                minHeight: 54,
                height: "auto",
                justifyContent: "flex-start",
                gap: 12,
                padding: "10px 14px",
                fontSize: 14,
                lineHeight: 1.3,
                textAlign: "left",
                whiteSpace: "normal",
                transition: "all 0.22s var(--ease-out-quint)",
                ...stateStyle,
              }}
            >
              <span
                className="grid place-items-center shrink-0"
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
              <span style={{ flex: 1 }}>{opt.text}</span>
              {state === "ok" && (
                <ScoutIcon name="check" size={16} stroke={2.4} />
              )}
              {state === "fail" && (
                <ScoutIcon name="close" size={16} stroke={2.4} />
              )}
              {state === "miss" && (
                <span
                  className="t-caption shrink-0"
                  style={{ color: "var(--primary)", fontWeight: 700 }}
                >
                  correcta
                </span>
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className="rounded-xl border px-3 py-2.5"
          style={{
            background: pickedCorrect
              ? "color-mix(in oklch, var(--primary) 10%, transparent)"
              : "color-mix(in oklch, var(--c-rose) 10%, transparent)",
            borderColor: pickedCorrect
              ? "color-mix(in oklch, var(--primary) 30%, transparent)"
              : "color-mix(in oklch, var(--c-rose) 30%, transparent)",
            animation: "scale-in 0.25s var(--ease-out-quint)",
          }}
        >
          <div
            className="t-overline"
            style={{
              color: pickedCorrect ? "var(--primary)" : "var(--c-rose)",
              letterSpacing: "0.12em",
              marginBottom: 2,
            }}
          >
            {pickedCorrect ? "✓ Bien hecho" : "✗ Casi"}
          </div>
          <p className="t-body-sm" style={{ margin: 0, lineHeight: 1.35 }}>
            {round.scenario.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

interface ScenarioCardProps {
  scenario: ResponseScenario;
  flash: "correct" | "wrong" | null;
}

function ScenarioCard({ scenario, flash }: ScenarioCardProps) {
  const accent =
    flash === "correct"
      ? "var(--primary)"
      : flash === "wrong"
        ? "var(--c-rose)"
        : "var(--c-rose)";

  const glow = useMemo(
    () =>
      flash === "correct"
        ? "color-mix(in oklch, var(--primary) 35%, transparent)"
        : flash === "wrong"
          ? "color-mix(in oklch, var(--c-rose) 35%, transparent)"
          : "color-mix(in oklch, var(--c-rose) 18%, transparent)",
    [flash],
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        background:
          "radial-gradient(80% 70% at 50% 30%, oklch(0.28 0.06 25) 0%, oklch(0.16 0.04 25) 60%, oklch(0.10 0.02 25) 100%)",
        border:
          "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
        boxShadow: `inset 0 0 60px ${glow}`,
        transition: "box-shadow 0.4s var(--ease-out-quint)",
        padding: "22px 18px 20px",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.7,
          transition: "background 0.4s var(--ease-out-quint)",
        }}
      />

      <div className="vstack" style={{ gap: 12, alignItems: "center" }}>
        <span
          className="chip"
          style={{
            background:
              "color-mix(in oklch, var(--c-rose) 18%, transparent)",
            color: "var(--c-rose)",
            borderColor:
              "color-mix(in oklch, var(--c-rose) 35%, transparent)",
            letterSpacing: "0.08em",
          }}
        >
          {scenario.tag}
        </span>

        <div
          className="grid place-items-center rounded-full"
          style={{
            width: 86,
            height: 86,
            background:
              "color-mix(in oklch, var(--c-rose) 18%, transparent)",
            border:
              "1px solid color-mix(in oklch, var(--c-rose) 35%, transparent)",
            fontSize: 44,
            lineHeight: 1,
            filter: "drop-shadow(0 6px 14px oklch(0 0 0 / 0.4))",
          }}
        >
          <span aria-hidden>{scenario.emoji}</span>
        </div>

        <p
          className="t-body"
          style={{
            color: "var(--fg)",
            margin: 0,
            textAlign: "center",
            textWrap: "balance",
            maxWidth: 380,
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {scenario.prompt}
        </p>
      </div>
    </div>
  );
}
