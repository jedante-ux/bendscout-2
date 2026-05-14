"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BOTIQUIN_ITEMS,
  BOTIQUIN_SCENARIOS,
  getItem,
  type BotiquinItem,
  type BotiquinScenario,
} from "@/lib/games/botiquin/scenarios";

const OPTIONS_PER_ROUND = 4;
const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 50;
const FEEDBACK_MS = 850;

export interface BotiquinGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Round {
  scenario: BotiquinScenario;
  items: BotiquinItem[];
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
  pool: BotiquinScenario[],
  previousId: string | null,
): Round {
  const candidates = pool.filter((s) => s.id !== previousId);
  const scenario =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    pool[Math.floor(Math.random() * pool.length)];

  const correctItem = getItem(scenario.correctItemId);
  if (!correctItem) {
    // Shouldn't happen with valid data — pick first item as fallback.
    return { scenario, items: BOTIQUIN_ITEMS.slice(0, OPTIONS_PER_ROUND) };
  }
  const wrong = shuffle(
    BOTIQUIN_ITEMS.filter((i) => i.id !== correctItem.id),
  ).slice(0, OPTIONS_PER_ROUND - 1);

  return { scenario, items: shuffle([correctItem, ...wrong]) };
}

interface DragState {
  itemId: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
}

export function BotiquinGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: BotiquinGameProps) {
  const [round, setRound] = useState<Round>(() =>
    buildRound(BOTIQUIN_SCENARIOS, null),
  );
  const [picked, setPicked] = useState<{ itemId: string; correct: boolean } | null>(
    null,
  );
  const [streak, setStreak] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const lockedRef = useRef(false);

  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const advance = useCallback(() => {
    setRound((prev) => buildRound(BOTIQUIN_SCENARIOS, prev.scenario.id));
    setPicked(null);
    setDrag(null);
    lockedRef.current = false;
  }, []);

  const resolvePick = useCallback(
    (itemId: string) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const correct = itemId === round.scenario.correctItemId;
      setPicked({ itemId, correct });
      if (correct) {
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
    },
    [round.scenario.correctItemId, streak, onCorrect, onWrong, advance],
  );

  // Drag handlers
  const onItemPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    itemId: string,
  ) => {
    if (!interactive || lockedRef.current) return;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const rect = target.getBoundingClientRect();
    setDrag({
      itemId,
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      setDrag((d) => {
        if (!d || d.pointerId !== e.pointerId) return d;
        return { ...d, x: e.clientX, y: e.clientY };
      });
    },
    [],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      setDrag((d) => {
        if (!d || d.pointerId !== e.pointerId) return d;
        const dz = dropZoneRef.current;
        if (dz) {
          const r = dz.getBoundingClientRect();
          const hit =
            e.clientX >= r.left &&
            e.clientX <= r.right &&
            e.clientY >= r.top &&
            e.clientY <= r.bottom;
          if (hit) {
            resolvePick(d.itemId);
          }
        }
        return null;
      });
    },
    [resolvePick],
  );

  useEffect(() => {
    if (!drag) return;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [drag, onPointerMove, onPointerUp]);

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const dropZoneActive = drag != null;
  const dragItem = useMemo(
    () => (drag ? round.items.find((i) => i.id === drag.itemId) : null),
    [drag, round.items],
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col"
      style={{ gap: 14, position: "relative", touchAction: "none" }}
    >
      <PatientCard
        scenario={round.scenario}
        flash={picked ? (picked.correct ? "correct" : "wrong") : null}
        dropZoneActive={dropZoneActive}
        dropZoneRef={dropZoneRef}
      />

      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Arrastra el ítem correcto
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
        {round.items.map((item) => {
          const isPickedCorrect =
            picked?.correct && picked.itemId === item.id;
          const isPickedWrong =
            picked && !picked.correct && picked.itemId === item.id;
          const isMissedCorrect =
            picked &&
            !picked.correct &&
            item.id === round.scenario.correctItemId;
          const isDragging = drag?.itemId === item.id;

          const stateStyle: React.CSSProperties = isPickedCorrect
            ? {
                background:
                  "color-mix(in oklch, var(--primary) 28%, transparent)",
                borderColor:
                  "color-mix(in oklch, var(--primary) 55%, transparent)",
                color: "var(--primary)",
              }
            : isPickedWrong
              ? {
                  background:
                    "color-mix(in oklch, var(--c-rose) 24%, transparent)",
                  borderColor:
                    "color-mix(in oklch, var(--c-rose) 55%, transparent)",
                  color: "var(--c-rose)",
                }
              : isMissedCorrect
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
              key={item.id}
              type="button"
              onPointerDown={(e) => onItemPointerDown(e, item.id)}
              onClick={() => {
                // Tap fallback: tap-to-pick if no drag occurred
                if (!drag && interactive && !lockedRef.current) {
                  resolvePick(item.id);
                }
              }}
              disabled={!interactive || picked != null}
              className="btn btn-secondary"
              style={{
                height: 76,
                padding: "8px 12px",
                gap: 10,
                flexDirection: "column",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.22s var(--ease-out-quint)",
                opacity: isDragging ? 0.35 : 1,
                cursor: interactive ? "grab" : "default",
                touchAction: "none",
                ...stateStyle,
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{item.emoji}</span>
              <span style={{ textAlign: "center", lineHeight: 1.15 }}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Drag preview floating on the cursor */}
      {drag && dragItem && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            zIndex: 50,
            pointerEvents: "none",
            transform: "scale(1.06)",
            transition: "transform 0.15s var(--ease-out-quint)",
          }}
        >
          <div
            className="rounded-xl border"
            style={{
              width: 132,
              padding: "10px 12px",
              background: "var(--surface)",
              borderColor:
                "color-mix(in oklch, var(--primary) 50%, var(--border))",
              boxShadow: "0 18px 36px oklch(0 0 0 / 0.45)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>
              {dragItem.emoji}
            </span>
            <span
              className="t-caption"
              style={{ fontWeight: 700, textAlign: "center" }}
            >
              {dragItem.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface PatientProps {
  scenario: BotiquinScenario;
  flash: "correct" | "wrong" | null;
  dropZoneActive: boolean;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
}

function PatientCard({
  scenario,
  flash,
  dropZoneActive,
  dropZoneRef,
}: PatientProps) {
  const accent =
    flash === "correct"
      ? "var(--primary)"
      : flash === "wrong"
        ? "var(--c-rose)"
        : "var(--c-gold)";
  const glow =
    flash === "correct"
      ? "color-mix(in oklch, var(--primary) 40%, transparent)"
      : flash === "wrong"
        ? "color-mix(in oklch, var(--c-rose) 36%, transparent)"
        : dropZoneActive
          ? "color-mix(in oklch, var(--primary) 30%, transparent)"
          : "color-mix(in oklch, var(--c-gold) 18%, transparent)";

  return (
    <div
      ref={dropZoneRef}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        minHeight: 220,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background:
          "linear-gradient(160deg, oklch(0.30 0.07 30) 0%, oklch(0.18 0.04 20) 100%)",
        border: `1.5px ${dropZoneActive ? "dashed" : "solid"} ${
          dropZoneActive
            ? "color-mix(in oklch, var(--primary) 55%, transparent)"
            : "color-mix(in oklch, var(--border) 80%, transparent)"
        }`,
        boxShadow: `inset 0 0 60px ${glow}`,
        transition: "all 0.3s var(--ease-out-quint)",
      }}
    >
      <span
        className="chip"
        style={{
          alignSelf: "center",
          background: "color-mix(in oklch, #000 30%, transparent)",
          color: accent,
          borderColor: "color-mix(in oklch, currentColor 35%, transparent)",
        }}
      >
        Emergencia
      </span>
      <div
        style={{
          fontSize: 64,
          lineHeight: 1,
          filter: "drop-shadow(0 6px 18px oklch(0 0 0 / 0.45))",
        }}
      >
        {scenario.patientEmoji}
      </div>
      <p
        className="t-body"
        style={{
          textAlign: "center",
          maxWidth: 280,
          textWrap: "balance",
          color: "#fff",
          fontWeight: 600,
          margin: 0,
        }}
      >
        {scenario.symptom}
      </p>
      {flash === "correct" && scenario.hint && (
        <p
          className="t-caption"
          style={{
            textAlign: "center",
            color: "var(--primary)",
            fontWeight: 700,
            maxWidth: 280,
            margin: 0,
          }}
        >
          ✓ {scenario.hint}
        </p>
      )}
      {dropZoneActive && flash == null && (
        <p
          className="t-caption text-muted"
          style={{ marginTop: 4, fontStyle: "italic" }}
        >
          Suelta aquí
        </p>
      )}
    </div>
  );
}
