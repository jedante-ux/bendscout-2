"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScoutIcon } from "@/components/scout/icon";
import {
  MOCHILA_ITEMS,
  type MochilaItem,
} from "@/lib/games/mochila/items";

const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 50;
const FEEDBACK_MS = 520;
const SWIPE_THRESHOLD = 80;
const ROTATION_FACTOR = 0.08;

export interface MochilaGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface CardState {
  item: MochilaItem;
  dragX: number;
  dragY: number;
  dragging: boolean;
  exitDir: "left" | "right" | null;
  feedback: "correct" | "wrong" | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MochilaGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: MochilaGameProps) {
  // Deck que se rellena cíclicamente.
  const initial = useMemo(() => {
    const shuffled = shuffle(MOCHILA_ITEMS);
    const [first, ...rest] = shuffled;
    return { first, rest };
  }, []);
  const [deck, setDeck] = useState<MochilaItem[]>(() => initial.rest);
  const [streak, setStreak] = useState(0);
  const [top, setTop] = useState<CardState | null>(() => ({
    item: initial.first,
    dragX: 0,
    dragY: 0,
    dragging: false,
    exitDir: null,
    feedback: null,
  }));
  const lockedRef = useRef(false);
  const pointerRef = useRef<{
    id: number;
    startX: number;
    startY: number;
  } | null>(null);

  const promoteNext = useCallback(() => {
    setDeck((prev) => {
      if (prev.length === 0) {
        // Re-shuffle al agotarse.
        const reshuffled = shuffle(MOCHILA_ITEMS);
        const [next, ...rest] = reshuffled;
        setTop({
          item: next,
          dragX: 0,
          dragY: 0,
          dragging: false,
          exitDir: null,
          feedback: null,
        });
        return rest;
      }
      const [next, ...rest] = prev;
      setTop({
        item: next,
        dragX: 0,
        dragY: 0,
        dragging: false,
        exitDir: null,
        feedback: null,
      });
      return rest;
    });
    lockedRef.current = false;
  }, []);

  const decideCard = useCallback(
    (direction: "left" | "right") => {
      if (!top || lockedRef.current) return;
      lockedRef.current = true;

      const userPicked: "essential" | "skip" =
        direction === "right" ? "essential" : "skip";
      const isCorrect =
        (top.item.essential && userPicked === "essential") ||
        (!top.item.essential && userPicked === "skip");

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

      setTop((prev) =>
        prev
          ? {
              ...prev,
              exitDir: direction,
              dragging: false,
              feedback: isCorrect ? "correct" : "wrong",
              dragX: direction === "right" ? 600 : -600,
              dragY: 0,
            }
          : prev,
      );

      window.setTimeout(() => promoteNext(), FEEDBACK_MS);
    },
    [top, streak, onCorrect, onWrong, promoteNext],
  );

  const onCardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || lockedRef.current || !top) return;
    pointerRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setTop((prev) => (prev ? { ...prev, dragging: true } : prev));
  };

  const onCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p || p.id !== e.pointerId || !top || top.exitDir) return;
    setTop((prev) =>
      prev
        ? {
            ...prev,
            dragX: e.clientX - p.startX,
            dragY: e.clientY - p.startY,
          }
        : prev,
    );
  };

  const onCardPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p || p.id !== e.pointerId || !top) return;
    pointerRef.current = null;
    const dx = e.clientX - p.startX;

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      decideCard(dx > 0 ? "right" : "left");
    } else {
      // Snap back
      setTop((prev) =>
        prev
          ? { ...prev, dragX: 0, dragY: 0, dragging: false }
          : prev,
      );
    }
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  // Atajos por botones (tap fallback)
  const handleButton = (direction: "left" | "right") => {
    if (!interactive || lockedRef.current || !top) return;
    decideCard(direction);
  };

  const intent: "essential" | "skip" | null = useMemo(() => {
    if (!top) return null;
    if (top.dragX > 24) return "essential";
    if (top.dragX < -24) return "skip";
    return null;
  }, [top]);

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ gap: 14, position: "relative", touchAction: "none" }}
    >
      <div className="flex items-center justify-between" style={{ padding: "0 2px" }}>
        <span className="t-overline text-muted" style={{ letterSpacing: "0.14em" }}>
          Llevar o dejar
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
        className="relative"
        style={{
          flex: 1,
          minHeight: 320,
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* Etiquetas izq/der */}
        <DecisionLabel
          side="left"
          active={intent === "skip"}
          visible={top != null}
        />
        <DecisionLabel
          side="right"
          active={intent === "essential"}
          visible={top != null}
        />

        {/* Carta siguiente (peek) */}
        {deck[0] && (
          <CardView
            item={deck[0]}
            style={{
              transform: "translate(-50%, -50%) scale(0.94)",
              opacity: 0.7,
            }}
          />
        )}

        {/* Carta superior */}
        {top && (
          <CardView
            item={top.item}
            interactive={interactive && top.exitDir == null}
            onPointerDown={onCardPointerDown}
            onPointerMove={onCardPointerMove}
            onPointerUp={onCardPointerUp}
            onPointerCancel={onCardPointerUp}
            feedback={top.feedback}
            note={top.feedback ? top.item.note : null}
            style={{
              transform: `translate(calc(-50% + ${top.dragX}px), calc(-50% + ${
                top.dragY * 0.4
              }px)) rotate(${top.dragX * ROTATION_FACTOR}deg)`,
              transition: top.dragging
                ? "none"
                : "transform 0.4s var(--ease-out-quint), opacity 0.4s var(--ease-out-quint)",
              cursor: interactive ? "grab" : "default",
              opacity: top.exitDir ? 0 : 1,
              zIndex: 2,
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleButton("left")}
          disabled={!interactive || top?.exitDir != null}
          className="btn btn-secondary"
          style={{
            height: 56,
            gap: 8,
            justifyContent: "center",
            color: "var(--c-rose)",
            fontWeight: 700,
          }}
        >
          <ScoutIcon name="close" size={16} stroke={2.4} /> Dejar
        </button>
        <button
          type="button"
          onClick={() => handleButton("right")}
          disabled={!interactive || top?.exitDir != null}
          className="btn btn-secondary"
          style={{
            height: 56,
            gap: 8,
            justifyContent: "center",
            color: "var(--primary)",
            fontWeight: 700,
          }}
        >
          <ScoutIcon name="check" size={16} stroke={2.4} /> Llevar
        </button>
      </div>
    </div>
  );
}

interface CardViewProps {
  item: MochilaItem;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (e: React.PointerEvent<HTMLDivElement>) => void;
  feedback?: "correct" | "wrong" | null;
  note?: string | null;
  style?: React.CSSProperties;
}

function CardView({
  item,
  interactive,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  feedback,
  note,
  style,
}: CardViewProps) {
  const accent =
    feedback === "correct"
      ? "var(--primary)"
      : feedback === "wrong"
        ? "var(--c-rose)"
        : "var(--c-gold)";

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 260,
        minHeight: 300,
        borderRadius: 24,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background:
          "linear-gradient(160deg, oklch(0.30 0.05 200) 0%, oklch(0.18 0.04 220) 100%)",
        border: `1.5px solid color-mix(in oklch, ${accent} 40%, var(--border))`,
        boxShadow:
          "0 22px 44px oklch(0 0 0 / 0.45), inset 0 0 40px color-mix(in oklch, " +
          accent +
          " 18%, transparent)",
        userSelect: "none",
        touchAction: "none",
        pointerEvents: interactive ? "auto" : "none",
        ...style,
      }}
    >
      <span
        className="chip"
        style={{
          alignSelf: "center",
          background: "color-mix(in oklch, #000 35%, transparent)",
          color: accent,
          borderColor: "color-mix(in oklch, currentColor 30%, transparent)",
        }}
      >
        ¿Va o no va?
      </span>
      <div
        style={{
          fontSize: 80,
          lineHeight: 1,
          filter: "drop-shadow(0 8px 22px oklch(0 0 0 / 0.45))",
        }}
      >
        {item.emoji}
      </div>
      <p
        className="t-display-sm"
        style={{
          margin: 0,
          textAlign: "center",
          color: "#fff",
          fontWeight: 800,
          letterSpacing: "0.02em",
          textWrap: "balance",
        }}
      >
        {item.name}
      </p>
      {note && (
        <p
          className="t-caption"
          style={{
            margin: 0,
            textAlign: "center",
            color: accent,
            fontWeight: 700,
            textWrap: "balance",
          }}
        >
          {feedback === "correct" ? "✓ " : "✗ "}
          {note}
        </p>
      )}
    </div>
  );
}

function DecisionLabel({
  side,
  active,
  visible,
}: {
  side: "left" | "right";
  active: boolean;
  visible: boolean;
}) {
  if (!visible) return null;
  const isLeft = side === "left";
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 28,
        [isLeft ? "left" : "right"]: 16,
        padding: "6px 14px",
        borderRadius: 12,
        border: `2px solid ${isLeft ? "var(--c-rose)" : "var(--primary)"}`,
        color: isLeft ? "var(--c-rose)" : "var(--primary)",
        background: active
          ? `color-mix(in oklch, ${
              isLeft ? "var(--c-rose)" : "var(--primary)"
            } 20%, transparent)`
          : "transparent",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.16em",
        transform: `rotate(${isLeft ? -12 : 12}deg)`,
        transition: "all 0.22s var(--ease-out-quint)",
        opacity: active ? 1 : 0.45,
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      {isLeft ? "DEJAR" : "LLEVAR"}
    </span>
  );
}
