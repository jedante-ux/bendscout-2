"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import {
  CARPA_PIECES,
  CARPA_SLOTS,
  type CarpaPiece,
} from "@/lib/games/construye-carpa/pieces";

const POINTS_PER_PIECE = 80;
const ROUND_BONUS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 60;
const FEEDBACK_MS = 600;

export interface ConstruyeCarpaGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  /**
   * Compat: si el caller aún pasa timeLeftSeconds y este llega a 0 disparamos
   * onTimeout. Sin timer no se usa.
   */
  onTimeout?: () => void;
  timeLeftSeconds?: number;
}

interface Round {
  /** Próximo orden esperado (1..5). */
  nextOrder: number;
  /** Slots ya llenados. */
  filled: Set<string>;
}

interface DragState {
  pieceId: string;
  pointerId: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

export function ConstruyeCarpaGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: ConstruyeCarpaGameProps) {
  const [round, setRound] = useState<Round>({
    nextOrder: 1,
    filled: new Set(),
  });
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<
    | { pieceId: string; slotId: string; correct: boolean; hint: string }
    | null
  >(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverSlotId, setHoverSlotId] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const lockedRef = useRef(false);

  const advance = useCallback(() => {
    setRound({ nextOrder: 1, filled: new Set() });
    setFeedback(null);
    setDrag(null);
    lockedRef.current = false;
  }, []);

  const onPiecePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    piece: CarpaPiece,
  ) => {
    if (!interactive || lockedRef.current || round.filled.has(piece.slotId)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      pieceId: piece.id,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    setDrag((d) => {
      if (!d || d.pointerId !== e.pointerId) return d;
      const board = boardRef.current;
      if (board) {
        const rect = board.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        const hit = CARPA_SLOTS.find(
          (s) => Math.hypot(s.cx - px, s.cy - py) <= s.radius,
        );
        setHoverSlotId(hit?.id ?? null);
      }
      return { ...d, x: e.clientX, y: e.clientY };
    });
  }, []);

  const resolveDrop = useCallback(
    (d: DragState) => {
      if (lockedRef.current) return;
      const board = boardRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const px = ((d.x - rect.left) / rect.width) * 100;
      const py = ((d.y - rect.top) / rect.height) * 100;
      if (px < 0 || px > 100 || py < 0 || py > 100) return;

      const piece = CARPA_PIECES.find((p) => p.id === d.pieceId);
      if (!piece) return;
      const correctSlot = CARPA_SLOTS.find((s) => s.id === piece.slotId);
      if (!correctSlot) return;

      // Encuentra el slot bajo el dedo (si hay alguno)
      const hit = CARPA_SLOTS.find((s) => {
        const dx = s.cx - px;
        const dy = s.cy - py;
        return Math.hypot(dx, dy) <= s.radius;
      });

      const inCorrectSlot =
        hit && hit.id === piece.slotId && piece.order === round.nextOrder;

      lockedRef.current = true;
      if (inCorrectSlot) {
        setRound((r) => {
          const filled = new Set(r.filled);
          filled.add(piece.slotId);
          return { nextOrder: r.nextOrder + 1, filled };
        });
        const nextStreak = streak + 1;
        const bonus = Math.min(
          STREAK_CAP,
          Math.max(0, nextStreak - 1) * STREAK_STEP,
        );
        setStreak(nextStreak);
        onCorrect?.(POINTS_PER_PIECE + bonus, nextStreak);
        setFeedback({
          pieceId: piece.id,
          slotId: piece.slotId,
          correct: true,
          hint: piece.hint,
        });
        // Si completó todo, bonus de ronda
        const isLast = round.nextOrder === CARPA_PIECES.length;
        if (isLast) {
          onCorrect?.(ROUND_BONUS, 0);
          window.setTimeout(() => advance(), FEEDBACK_MS + 400);
        } else {
          window.setTimeout(() => {
            setFeedback(null);
            lockedRef.current = false;
          }, FEEDBACK_MS);
        }
      } else {
        setStreak(0);
        onWrong?.();
        setFeedback({
          pieceId: piece.id,
          slotId: hit?.id ?? "miss",
          correct: false,
          hint:
            piece.order !== round.nextOrder
              ? `Aún no — primero la pieza #${round.nextOrder}.`
              : `Esa pieza no va ahí. Prueba otro lugar.`,
        });
        window.setTimeout(() => {
          setFeedback(null);
          lockedRef.current = false;
        }, FEEDBACK_MS);
      }
    },
    [round.nextOrder, streak, onCorrect, onWrong, advance],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      setDrag((d) => {
        if (!d || d.pointerId !== e.pointerId) return d;
        resolveDrop(d);
        return null;
      });
      setHoverSlotId(null);
    },
    [resolveDrop],
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
    if (timeLeftSeconds === undefined) return;
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const dragPiece = useMemo(
    () => (drag ? CARPA_PIECES.find((p) => p.id === drag.pieceId) : null),
    [drag],
  );

  const nextPiece = CARPA_PIECES.find((p) => p.order === round.nextOrder);

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
          Arma la carpa en orden
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

      {nextPiece && (
        <div
          className="flex items-center gap-3 rounded-2xl"
          style={{
            padding: "10px 14px",
            background:
              "color-mix(in oklch, var(--c-mint) 14%, transparent)",
            border:
              "1.5px solid color-mix(in oklch, var(--c-mint) 35%, transparent)",
          }}
        >
          <span
            className="grid place-items-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "color-mix(in oklch, var(--c-mint) 30%, transparent)",
              color: "var(--c-mint)",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {round.nextOrder}
          </span>
          <div style={{ flex: 1 }}>
            <div
              className="t-overline text-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              Próxima pieza
            </div>
            <div
              className="t-display-sm"
              style={{ fontSize: 16, fontWeight: 800, color: "var(--c-mint)" }}
            >
              {nextPiece.name}
            </div>
          </div>
        </div>
      )}

      {/* Tablero con slots */}
      <div
        ref={boardRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: 16,
          background:
            "linear-gradient(170deg, oklch(0.30 0.05 200) 0%, oklch(0.16 0.04 220) 100%)",
          border:
            "1.5px solid color-mix(in oklch, var(--c-mint) 30%, var(--border))",
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        {/* Silueta de la carpa */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full pointer-events-none"
          aria-hidden
        >
          {/* Suelo */}
          <line
            x1={5}
            y1={85}
            x2={95}
            y2={85}
            stroke="color-mix(in oklch, var(--c-mint) 40%, transparent)"
            strokeWidth={0.6}
            strokeDasharray="2 2"
          />
          {/* Outline de la carpa */}
          <polygon
            points="22,78 50,30 78,78"
            fill="none"
            stroke="color-mix(in oklch, var(--c-mint) 30%, transparent)"
            strokeWidth={0.6}
            strokeDasharray="2 2"
          />
        </svg>

        {/* Slots */}
        {CARPA_SLOTS.map((slot) => {
          const isFilled = round.filled.has(slot.id);
          const isTargeted = hoverSlotId === slot.id;
          const piece = CARPA_PIECES.find((p) => p.slotId === slot.id);
          return (
            <div
              key={slot.id}
              aria-hidden
              style={{
                position: "absolute",
                left: `${slot.cx}%`,
                top: `${slot.cy}%`,
                width: `${slot.radius * 2.4}%`,
                aspectRatio: "1 / 1",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: `2px ${isFilled ? "solid" : "dashed"} ${
                  isFilled
                    ? "var(--primary)"
                    : isTargeted
                      ? "var(--c-gold)"
                      : "color-mix(in oklch, var(--c-mint) 45%, transparent)"
                }`,
                background: isFilled
                  ? "color-mix(in oklch, var(--primary) 18%, transparent)"
                  : isTargeted
                    ? "color-mix(in oklch, var(--c-gold) 16%, transparent)"
                    : "color-mix(in oklch, var(--c-mint) 8%, transparent)",
                display: "grid",
                placeItems: "center",
                transition: "all 0.22s var(--ease-out-quint)",
                pointerEvents: "none",
                fontSize: "min(4vw, 24px)",
              }}
            >
              {isFilled && piece ? (
                <span>{piece.emoji}</span>
              ) : (
                <span
                  style={{
                    color: "color-mix(in oklch, currentColor 80%, transparent)",
                    fontFamily: "var(--font-display)",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    opacity: 0.7,
                  }}
                >
                  {slot.label}
                </span>
              )}
            </div>
          );
        })}

        {/* Feedback */}
        {feedback && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              bottom: 8,
              transform: "translateX(-50%)",
              padding: "6px 12px",
              borderRadius: 8,
              background: feedback.correct
                ? "color-mix(in oklch, var(--primary) 35%, transparent)"
                : "color-mix(in oklch, var(--c-rose) 35%, transparent)",
              color: feedback.correct ? "var(--primary)" : "var(--c-rose)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.04em",
              maxWidth: "90%",
              textAlign: "center",
              animation: "scale-in 0.22s var(--ease-out-quint)",
              border: `1px solid currentColor`,
            }}
          >
            {feedback.hint}
          </div>
        )}
      </div>

      {/* Piezas disponibles (drag source) */}
      <div className="grid grid-cols-5 gap-2">
        {CARPA_PIECES.map((piece) => {
          const placed = round.filled.has(piece.slotId);
          const isDragging = drag?.pieceId === piece.id;
          return (
            <button
              key={piece.id}
              type="button"
              onPointerDown={(e) => onPiecePointerDown(e, piece)}
              disabled={!interactive || placed || isDragging}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: 12,
                border: `1.5px solid ${
                  placed
                    ? "color-mix(in oklch, var(--primary) 45%, transparent)"
                    : "var(--border)"
                }`,
                background: placed
                  ? "color-mix(in oklch, var(--primary) 14%, transparent)"
                  : "var(--surface)",
                display: "grid",
                placeItems: "center",
                fontSize: "min(7vw, 28px)",
                color: placed ? "var(--primary)" : "var(--fg)",
                cursor: placed ? "default" : "grab",
                opacity: isDragging ? 0.3 : placed ? 0.7 : 1,
                transition: "all 0.2s var(--ease-out-quint)",
                touchAction: "none",
                userSelect: "none",
                padding: 0,
              }}
            >
              {placed ? (
                <ScoutIcon name="check" size={14} stroke={2.4} />
              ) : (
                <>
                  <span>{piece.emoji}</span>
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 4,
                      fontFamily: "var(--font-display)",
                      fontSize: 9,
                      fontWeight: 800,
                      color: "var(--fg-muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    #{piece.order}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Ghost de la pieza arrastrada */}
      {drag && dragPiece && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            zIndex: 60,
            pointerEvents: "none",
            transform: "scale(1.12)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "var(--surface)",
              border: "2px solid var(--c-gold)",
              boxShadow: "0 14px 28px oklch(0 0 0 / 0.45)",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
            }}
          >
            {dragPiece.emoji}
          </div>
        </div>
      )}
    </div>
  );
}
