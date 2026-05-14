"use client";

import { useCallback, useMemo, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";
import type { KnotCard } from "@/lib/games/memory/knots";

export interface MemoryGameProps {
  /** Lista de N cartas únicas; el componente duplica cada una para formar pares. */
  knots: KnotCard[];
  /** Si false, las cartas no responden a clicks (ej. cuando hay un overlay encima). */
  interactive?: boolean;
  onMatch?: (card: KnotCard) => void;
  onWrong?: () => void;
  onComplete?: () => void;
}

interface BoardCard {
  /** ID único de esta posición (uno por celda). */
  cellId: string;
  /** ID compartido por las dos cartas de un par (= KnotCard.id). */
  pairId: string;
  knot: KnotCard;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBoard(knots: KnotCard[]): BoardCard[] {
  const doubled: BoardCard[] = [];
  knots.forEach((k) => {
    doubled.push({ cellId: `${k.id}-a`, pairId: k.id, knot: k });
    doubled.push({ cellId: `${k.id}-b`, pairId: k.id, knot: k });
  });
  return shuffle(doubled);
}

export function MemoryGame({
  knots,
  interactive = true,
  onMatch,
  onWrong,
  onComplete,
}: MemoryGameProps) {
  const board = useMemo(() => buildBoard(knots), [knots]);
  const totalPairs = knots.length;

  const [revealed, setRevealed] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string[] | null>(null);
  const [locked, setLocked] = useState(false);

  const handleFlip = useCallback(
    (card: BoardCard) => {
      if (!interactive) return;
      if (locked) return;
      if (matched.has(card.pairId)) return;
      if (revealed.includes(card.cellId)) return;
      if (revealed.length === 2) return;

      const next = [...revealed, card.cellId];
      setRevealed(next);

      if (next.length === 2) {
        const [firstCellId, secondCellId] = next;
        const first = board.find((b) => b.cellId === firstCellId);
        const second = board.find((b) => b.cellId === secondCellId);
        if (!first || !second) return;

        if (first.pairId === second.pairId) {
          setLocked(true);
          window.setTimeout(() => {
            setMatched((m) => {
              const updated = new Set(m);
              updated.add(first.pairId);
              if (updated.size === totalPairs) {
                window.setTimeout(() => onComplete?.(), 480);
              }
              return updated;
            });
            setRevealed([]);
            setLocked(false);
            onMatch?.(first.knot);
          }, 360);
        } else {
          setLocked(true);
          setWrong(next);
          onWrong?.();
          window.setTimeout(() => {
            setRevealed([]);
            setWrong(null);
            setLocked(false);
          }, 720);
        }
      }
    },
    [board, interactive, locked, matched, onComplete, onMatch, onWrong, revealed, totalPairs],
  );

  const matchedCount = matched.size;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2">
        <span className="t-caption text-muted">
          Parejas{" "}
          <b className="t-num" style={{ color: "var(--fg)" }}>
            {matchedCount}
          </b>
          <span style={{ color: "var(--fg-muted)" }}> / {totalPairs}</span>
        </span>
        <div className="hstack" style={{ gap: 4 }}>
          {Array.from({ length: Math.min(totalPairs, 6) }).map((_, i) => {
            const filled = i < Math.floor((matchedCount / totalPairs) * 6);
            return (
              <span
                key={i}
                aria-hidden
                style={{
                  width: 14,
                  height: 4,
                  borderRadius: 999,
                  background: filled
                    ? "var(--primary)"
                    : "color-mix(in oklch, var(--border-hi) 80%, transparent)",
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 4,
        }}
      >
        {board.map((card) => {
          const isMatched = matched.has(card.pairId);
          const isRevealed = isMatched || revealed.includes(card.cellId);
          const isWrong = wrong?.includes(card.cellId) ?? false;
          return (
            <MemoryCard
              key={card.cellId}
              card={card}
              flipped={isRevealed}
              matched={isMatched}
              wrong={isWrong}
              disabled={locked || isMatched}
              onClick={() => handleFlip(card)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CardProps {
  card: BoardCard;
  flipped: boolean;
  matched: boolean;
  wrong: boolean;
  disabled: boolean;
  onClick: () => void;
}

function MemoryCard({
  card,
  flipped,
  matched,
  wrong,
  disabled,
  onClick,
}: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={flipped ? card.knot.name : "Carta oculta"}
      aria-pressed={flipped}
      className={cn(
        "memory-card group relative",
        flipped && "is-flipped",
        matched && "is-matched",
        wrong && "is-wrong",
      )}
      style={{
        aspectRatio: 1,
        perspective: 600,
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <span
        className="memory-card__inner"
        style={
          {
            position: "relative",
            display: "block",
            width: "100%",
            height: "100%",
            transition: "transform 360ms var(--ease-out-quint)",
            transformStyle: "preserve-3d",
          } as React.CSSProperties
        }
      >
        {/* Back */}
        <span
          className="memory-card__face memory-card__back"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "var(--r-md)",
            background:
              "linear-gradient(160deg, oklch(0.34 0.05 250), oklch(0.20 0.04 250))",
            border: "1px solid color-mix(in oklch, white 8%, transparent)",
            boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.06)",
            backfaceVisibility: "hidden",
          }}
        >
          <ScoutIcon
            name="sparkle"
            size={18}
            stroke={2.2}
            style={{ color: "color-mix(in oklch, white 55%, transparent)" }}
          />
        </span>

        {/* Front */}
        <span
          className="memory-card__face memory-card__front"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            borderRadius: "var(--r-md)",
            background: `radial-gradient(circle at 30% 28%, color-mix(in oklch, ${card.knot.color} 70%, white) 0%, ${card.knot.color} 60%, color-mix(in oklch, ${card.knot.color} 60%, black) 100%)`,
            border: matched
              ? "3px solid #22c55e"
              : "1px solid color-mix(in oklch, white 12%, transparent)",
            boxShadow: matched
              ? "0 0 0 1px #16a34a, 0 0 16px 0 rgba(34,197,94,0.55)"
              : "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 4px 12px -6px oklch(0 0 0 / 0.5)",
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            padding: 2,
            color: "oklch(0.18 0.05 250)",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{card.knot.emoji}</span>
          <span
            className="t-caption"
            style={{
              fontSize: 9,
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.05,
              letterSpacing: "0.01em",
              color: "oklch(0.18 0.05 250)",
              textWrap: "balance",
            }}
          >
            {card.knot.name}
          </span>
        </span>
      </span>
    </button>
  );
}
