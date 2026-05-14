"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { MAZES, parseMaze, type ParsedMaze } from "@/lib/games/laberinto/mazes";

const CORRECT_POINTS = 200;
const STREAK_STEP = 20;
const STREAK_CAP = 80;
const WRONG_PENALTY = 40;
const TIME_BONUS_PER_SEC = 6;
const FEEDBACK_MS = 800;

export interface LaberintoGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Cell {
  r: number;
  c: number;
}

function cellsEqual(a: Cell, b: Cell): boolean {
  return a.r === b.r && a.c === b.c;
}

function isAdjacent(a: Cell, b: Cell): boolean {
  return (
    (Math.abs(a.r - b.r) === 1 && a.c === b.c) ||
    (Math.abs(a.c - b.c) === 1 && a.r === b.r)
  );
}

function pickMaze(prev: string | null): ParsedMaze {
  const candidates = MAZES.filter((m) => m.id !== prev);
  const pool = candidates.length ? candidates : MAZES;
  return parseMaze(pool[Math.floor(Math.random() * pool.length)]);
}

export function LaberintoGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: LaberintoGameProps) {
  const [maze, setMaze] = useState<ParsedMaze>(() => pickMaze(null));
  const [trail, setTrail] = useState<Cell[]>([maze.start]);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<"sort" | "win" | "fail">("sort");
  const [feedbackDelta, setFeedbackDelta] = useState<number | null>(null);

  const startedAtRef = useRef<number>(0);
  const lockedRef = useRef(false);
  const pointerRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Inicializa el tiempo de inicio en mount (no se puede hacer en render).
  useEffect(() => {
    startedAtRef.current = performance.now();
  }, []);

  const resetForNew = useCallback(() => {
    setMaze((prev) => {
      const next = pickMaze(prev.id);
      setTrail([next.start]);
      return next;
    });
    setPhase("sort");
    setFeedbackDelta(null);
    startedAtRef.current = performance.now();
    lockedRef.current = false;
    pointerRef.current = null;
  }, []);

  const handleWin = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    const elapsedSec = (performance.now() - startedAtRef.current) / 1000;
    const timeBonus = Math.max(
      0,
      Math.round((10 - elapsedSec) * TIME_BONUS_PER_SEC),
    );
    const nextStreak = streak + 1;
    const streakBonus = Math.min(
      STREAK_CAP,
      Math.max(0, nextStreak - 1) * STREAK_STEP,
    );
    const delta = CORRECT_POINTS + timeBonus + streakBonus;
    setStreak(nextStreak);
    setPhase("win");
    setFeedbackDelta(delta);
    onCorrect?.(delta, nextStreak);
    window.setTimeout(() => resetForNew(), FEEDBACK_MS + 200);
  }, [streak, onCorrect, resetForNew]);

  const handleFail = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setStreak(0);
    setPhase("fail");
    setFeedbackDelta(-WRONG_PENALTY);
    onWrong?.();
    window.setTimeout(() => {
      // reinicia el mismo maze para volver a intentar
      setTrail([maze.start]);
      setPhase("sort");
      setFeedbackDelta(null);
      startedAtRef.current = performance.now();
      lockedRef.current = false;
    }, FEEDBACK_MS);
  }, [maze.start, onWrong]);

  // Detecta qué celda corresponde al puntero.
  const pointToCell = useCallback(
    (clientX: number, clientY: number): Cell | null => {
      const el = gridRef.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cellW = r.width / maze.cols;
      const cellH = r.height / maze.rows;
      const cx = clientX - r.left;
      const cy = clientY - r.top;
      if (cx < 0 || cy < 0 || cx > r.width || cy > r.height) return null;
      const col = Math.floor(cx / cellW);
      const row = Math.floor(cy / cellH);
      if (row < 0 || row >= maze.rows || col < 0 || col >= maze.cols) return null;
      return { r: row, c: col };
    },
    [maze.rows, maze.cols],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || phase !== "sort" || lockedRef.current) return;
    const cell = pointToCell(e.clientX, e.clientY);
    if (!cell) return;
    // Solo arranca si tocan la celda de inicio (o ya estás en el trail).
    if (!cellsEqual(cell, maze.start)) return;
    pointerRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setTrail([maze.start]);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current == null || pointerRef.current !== e.pointerId) return;
    if (lockedRef.current || phase !== "sort") return;
    const cell = pointToCell(e.clientX, e.clientY);
    if (!cell) return;

    setTrail((prev) => {
      const head = prev[prev.length - 1];
      if (cellsEqual(cell, head)) return prev;

      // Backtrack: si el dedo retrocede a la celda anterior, deshace un paso.
      if (prev.length > 1 && cellsEqual(cell, prev[prev.length - 2])) {
        return prev.slice(0, -1);
      }

      // Avanza solo a celdas adyacentes y abiertas.
      if (!isAdjacent(cell, head)) return prev;
      if (!maze.open[cell.r]?.[cell.c]) {
        // Tocó muro — fallo.
        window.setTimeout(() => handleFail(), 0);
        return prev;
      }
      // Evita revisitar celdas (excepto backtrack).
      if (prev.some((c) => cellsEqual(c, cell))) return prev;

      const next = [...prev, cell];
      if (cellsEqual(cell, maze.end)) {
        window.setTimeout(() => handleWin(), 0);
      }
      return next;
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current !== e.pointerId) return;
    pointerRef.current = null;
    // Soltar antes de llegar al fin no penaliza; el trail queda y puede retomarse.
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const trailSet = useMemo(() => {
    const s = new Set<string>();
    for (const c of trail) s.add(`${c.r}:${c.c}`);
    return s;
  }, [trail]);

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
          Traza con el dedo desde S hasta E
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
        className="text-center"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 12,
          letterSpacing: "0.18em",
          color: "var(--c-mint)",
          fontWeight: 700,
        }}
      >
        {maze.label.toUpperCase()}
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "8px 0",
        }}
      >
        <div
          ref={gridRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${maze.cols}, 1fr)`,
            gridTemplateRows: `repeat(${maze.rows}, 1fr)`,
            gap: 1,
            width: "min(90vw, 360px)",
            aspectRatio: `${maze.cols} / ${maze.rows}`,
            background: "color-mix(in oklch, var(--c-mint) 14%, var(--bg))",
            border:
              "2px solid color-mix(in oklch, var(--c-mint) 35%, var(--border))",
            borderRadius: 14,
            padding: 4,
            touchAction: "none",
            userSelect: "none",
            position: "relative",
          }}
        >
          {Array.from({ length: maze.rows }).map((_, r) =>
            Array.from({ length: maze.cols }).map((_, c) => {
              const open = maze.open[r][c];
              const inTrail = trailSet.has(`${r}:${c}`);
              const isHead =
                trail.length > 0 &&
                cellsEqual(trail[trail.length - 1], { r, c });
              const isStart = cellsEqual(maze.start, { r, c });
              const isEnd = cellsEqual(maze.end, { r, c });

              let bg = "color-mix(in oklch, #000 40%, transparent)";
              if (open) bg = "color-mix(in oklch, var(--c-mint) 8%, transparent)";
              if (inTrail) bg = "color-mix(in oklch, var(--c-mint) 45%, transparent)";
              if (isHead && phase === "sort") bg = "var(--c-mint)";
              if (phase === "win" && inTrail) bg = "var(--primary)";
              if (phase === "fail" && inTrail) bg = "var(--c-rose)";

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    background: bg,
                    borderRadius: 4,
                    position: "relative",
                    display: "grid",
                    placeItems: "center",
                    transition: "background 0.18s var(--ease-out-quint)",
                  }}
                >
                  {isStart && (
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "min(2.4vw, 12px)",
                        fontWeight: 800,
                        color: "#0e1f17",
                        letterSpacing: "0.04em",
                      }}
                    >
                      S
                    </span>
                  )}
                  {isEnd && (
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "min(2.4vw, 12px)",
                        fontWeight: 800,
                        color: phase === "win" ? "var(--primary-ink)" : "var(--c-gold)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      E
                    </span>
                  )}
                </div>
              );
            }),
          )}

          {/* Overlay de feedback */}
          {(phase === "win" || phase === "fail") && feedbackDelta != null && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                pointerEvents: "none",
                background:
                  phase === "win"
                    ? "color-mix(in oklch, var(--primary) 22%, transparent)"
                    : "color-mix(in oklch, var(--c-rose) 22%, transparent)",
                borderRadius: 14,
                animation: "scale-in 0.25s var(--ease-out-quint)",
              }}
            >
              <div
                className="t-display-md"
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color:
                    phase === "win" ? "var(--primary)" : "var(--c-rose)",
                  textShadow: "0 4px 16px oklch(0 0 0 / 0.55)",
                }}
              >
                {phase === "win"
                  ? `+${feedbackDelta}`
                  : `Muro · ${feedbackDelta}`}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-2"
        style={{
          color: "var(--fg-muted)",
          fontSize: 12,
        }}
      >
        <ScoutIcon name="map" size={14} stroke={2} /> Sin levantar el dedo,
        evita los muros
      </div>
    </div>
  );
}
