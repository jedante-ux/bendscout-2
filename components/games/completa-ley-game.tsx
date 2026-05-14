"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";
import { LAW_CLAUSES, type LawClause } from "@/lib/games/completa-ley/clauses";

const OPTIONS_PER_ROUND = 4;
const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 60;
const FEEDBACK_MS = 800;

export interface CompletaLeyGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Round {
  clause: LawClause;
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

function buildRound(prevId: string | null): Round {
  const candidates = LAW_CLAUSES.filter((c) => c.id !== prevId);
  const clause =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    LAW_CLAUSES[Math.floor(Math.random() * LAW_CLAUSES.length)];
  const distractors = shuffle(clause.distractors).slice(0, OPTIONS_PER_ROUND - 1);
  const options = shuffle([clause.correct, ...distractors]);
  return { clause, options };
}

export function CompletaLeyGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: CompletaLeyGameProps) {
  const [round, setRound] = useState<Round>(() => buildRound(null));
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const lockedRef = useRef(false);

  const advance = useCallback(() => {
    setRound((prev) => buildRound(prev.clause.id));
    setPicked(null);
    lockedRef.current = false;
  }, []);

  const handlePick = (option: string) => {
    if (!interactive || lockedRef.current) return;
    lockedRef.current = true;
    setPicked(option);

    const isCorrect = option === round.clause.correct;
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

  const parts = round.clause.prompt.split("___");

  return (
    <div className="flex flex-1 flex-col" style={{ gap: 14 }}>
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Completa la Ley Scout
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
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          padding: "28px 20px",
          background:
            "linear-gradient(160deg, oklch(0.30 0.06 80) 0%, oklch(0.16 0.04 60) 100%)",
          border:
            "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="chip"
          style={{
            background: "color-mix(in oklch, #000 35%, transparent)",
            color: "var(--c-gold)",
            borderColor: "color-mix(in oklch, var(--c-gold) 35%, transparent)",
            alignSelf: "center",
          }}
        >
          Artículo {round.clause.article}
        </div>
        <p
          className="t-display-sm"
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.35,
            textWrap: "balance",
            color: "#fff",
          }}
        >
          {parts[0]}
          <span
            style={{
              display: "inline-block",
              minWidth: 96,
              padding: "2px 10px",
              margin: "0 4px",
              borderBottom: `3px ${picked ? "solid" : "dashed"} ${
                picked
                  ? picked === round.clause.correct
                    ? "var(--primary)"
                    : "var(--c-rose)"
                  : "var(--c-gold)"
              }`,
              color: picked
                ? picked === round.clause.correct
                  ? "var(--primary)"
                  : "var(--c-rose)"
                : "transparent",
              fontWeight: 800,
            }}
          >
            {picked ?? "···"}
          </span>
          {parts[1]}
        </p>
        {picked && picked !== round.clause.correct && (
          <p
            className="t-caption"
            style={{
              margin: 0,
              color: "var(--primary)",
              fontWeight: 700,
            }}
          >
            La palabra correcta era: {round.clause.correct}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {round.options.map((opt) => {
          const isPicked = picked === opt;
          const isAnswer = opt === round.clause.correct;
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
              key={`${round.clause.id}-${opt}`}
              type="button"
              onClick={() => handlePick(opt)}
              disabled={!interactive || picked != null}
              className={cn("btn btn-secondary")}
              style={{
                height: 58,
                justifyContent: "center",
                padding: 0,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.02em",
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
