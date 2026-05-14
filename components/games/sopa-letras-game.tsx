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
  GRID_SIZE,
  SCOUT_WORDS,
  WORDS_PER_ROUND,
  randomFillerLetter,
} from "@/lib/games/sopa-letras/words";

const CORRECT_PER_WORD = 80;
const ROUND_BONUS = 80; // bonus si limpias toda la grilla
const STREAK_STEP = 10;
const STREAK_CAP = 60;
const FEEDBACK_MS = 700;

const DIRS: { dx: number; dy: number }[] = [
  { dx: 1, dy: 0 }, // →
  { dx: 0, dy: 1 }, // ↓
  { dx: 1, dy: 1 }, // ↘
  { dx: -1, dy: 1 }, // ↙
  { dx: -1, dy: 0 }, // ←
  { dx: 0, dy: -1 }, // ↑
];

export interface SopaLetrasGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface PlacedWord {
  word: string;
  start: { r: number; c: number };
  dir: { dx: number; dy: number };
}

interface Round {
  grid: string[][];
  placed: PlacedWord[];
  /** Palabras encontradas hasta ahora. */
  found: Set<string>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRound(): Round {
  const wordList = shuffle(SCOUT_WORDS)
    .filter((w) => w.length <= GRID_SIZE)
    .slice(0, WORDS_PER_ROUND);

  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  );

  const placed: PlacedWord[] = [];

  const tryPlace = (word: string): PlacedWord | null => {
    for (let attempt = 0; attempt < 80; attempt++) {
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r0 = Math.floor(Math.random() * GRID_SIZE);
      const c0 = Math.floor(Math.random() * GRID_SIZE);
      const cells: { r: number; c: number; ch: string }[] = [];
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dir.dy * i;
        const c = c0 + dir.dx * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
          ok = false;
          break;
        }
        const existing = grid[r][c];
        if (existing !== null && existing !== word[i]) {
          ok = false;
          break;
        }
        cells.push({ r, c, ch: word[i] });
      }
      if (!ok) continue;
      for (const { r, c, ch } of cells) grid[r][c] = ch;
      return { word, start: { r: r0, c: c0 }, dir };
    }
    return null;
  };

  for (const w of wordList) {
    const p = tryPlace(w);
    if (p) placed.push(p);
  }

  // Rellena huecos con letras random.
  const final: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? randomFillerLetter()),
  );

  return { grid: final, placed, found: new Set() };
}

interface Selection {
  cells: { r: number; c: number }[];
  pointerId: number;
}

export function SopaLetrasGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: SopaLetrasGameProps) {
  const [round, setRound] = useState<Round>(() => generateRound());
  const [streak, setStreak] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [feedback, setFeedback] = useState<
    | { word: string; cells: { r: number; c: number }[]; correct: boolean }
    | null
  >(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const advanceRound = useCallback(() => {
    setRound(generateRound());
    setSelection(null);
    setFeedback(null);
  }, []);

  const pointToCell = useCallback(
    (clientX: number, clientY: number): { r: number; c: number } | null => {
      const el = gridRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cellW = rect.width / GRID_SIZE;
      const cellH = rect.height / GRID_SIZE;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
      return {
        r: Math.floor(y / cellH),
        c: Math.floor(x / cellW),
      };
    },
    [],
  );

  /** Devuelve las celdas en línea recta entre dos puntos, o null si no
   *  forman una dirección válida (H, V o diagonal). */
  const lineCells = (
    a: { r: number; c: number },
    b: { r: number; c: number },
  ): { r: number; c: number }[] | null => {
    const dr = b.r - a.r;
    const dc = b.c - a.c;
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    if (len === 0) return [a];
    // Debe ser H, V o diagonal exacta
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
    const sr = Math.sign(dr);
    const sc = Math.sign(dc);
    const out = [];
    for (let i = 0; i <= len; i++) {
      out.push({ r: a.r + sr * i, c: a.c + sc * i });
    }
    return out;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || feedback) return;
    const cell = pointToCell(e.clientX, e.clientY);
    if (!cell) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelection({ pointerId: e.pointerId, cells: [cell] });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!selection || selection.pointerId !== e.pointerId) return;
    const cell = pointToCell(e.clientX, e.clientY);
    if (!cell) return;
    const start = selection.cells[0];
    const line = lineCells(start, cell);
    if (!line) return;
    setSelection({ ...selection, cells: line });
  };

  const checkSelection = useCallback(
    (cells: { r: number; c: number }[]): string | null => {
      if (cells.length < 2) return null;
      const a = cells[0];
      const b = cells[cells.length - 1];
      const dr = Math.sign(b.r - a.r);
      const dc = Math.sign(b.c - a.c);

      for (const p of round.placed) {
        if (round.found.has(p.word)) continue;
        const startMatchesA =
          p.start.r === a.r && p.start.c === a.c &&
          p.dir.dx === dc && p.dir.dy === dr &&
          cells.length === p.word.length;
        const endR = p.start.r + p.dir.dy * (p.word.length - 1);
        const endC = p.start.c + p.dir.dx * (p.word.length - 1);
        const startMatchesB =
          p.start.r === b.r && p.start.c === b.c &&
          p.dir.dx === -dc && p.dir.dy === -dr &&
          cells.length === p.word.length;
        const reverseStartMatchesA =
          endR === a.r && endC === a.c &&
          -p.dir.dx === dc && -p.dir.dy === dr;
        if (startMatchesA || startMatchesB || reverseStartMatchesA) {
          return p.word;
        }
      }
      return null;
    },
    [round],
  );

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!selection || selection.pointerId !== e.pointerId) return;
    const cells = selection.cells;
    const matched = checkSelection(cells);

    if (matched) {
      // Encontrada
      setRound((r) => {
        const nextFound = new Set(r.found);
        nextFound.add(matched);
        return { ...r, found: nextFound };
      });
      const nextStreak = streak + 1;
      const bonus = Math.min(
        STREAK_CAP,
        Math.max(0, nextStreak - 1) * STREAK_STEP,
      );
      setStreak(nextStreak);
      onCorrect?.(CORRECT_PER_WORD + bonus, nextStreak);
      setFeedback({ word: matched, cells, correct: true });

      // ¿Completó la grilla?
      const newCount = round.found.size + 1;
      if (newCount >= round.placed.length) {
        // bonus por limpiar
        onCorrect?.(ROUND_BONUS, 0);
        window.setTimeout(() => advanceRound(), FEEDBACK_MS + 200);
      } else {
        window.setTimeout(() => {
          setFeedback(null);
          setSelection(null);
        }, FEEDBACK_MS);
      }
    } else if (cells.length >= 2) {
      onWrong?.();
      setStreak(0);
      setFeedback({ word: "", cells, correct: false });
      window.setTimeout(() => {
        setFeedback(null);
        setSelection(null);
      }, FEEDBACK_MS - 200);
    } else {
      setSelection(null);
    }
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const selectedCells = useMemo(() => {
    const set = new Set<string>();
    if (selection) {
      for (const c of selection.cells) set.add(`${c.r}:${c.c}`);
    }
    if (feedback) {
      for (const c of feedback.cells) set.add(`${c.r}:${c.c}`);
    }
    return set;
  }, [selection, feedback]);

  const foundCells = useMemo(() => {
    const set = new Set<string>();
    for (const p of round.placed) {
      if (!round.found.has(p.word)) continue;
      for (let i = 0; i < p.word.length; i++) {
        const r = p.start.r + p.dir.dy * i;
        const c = p.start.c + p.dir.dx * i;
        set.add(`${r}:${c}`);
      }
    }
    return set;
  }, [round]);

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
          Encuentra las palabras
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

      {/* Lista de palabras */}
      <div className="flex flex-wrap gap-2" style={{ minHeight: 30 }}>
        {round.placed.map((p) => {
          const isFound = round.found.has(p.word);
          return (
            <span
              key={p.word}
              className="chip"
              style={{
                background: isFound
                  ? "color-mix(in oklch, var(--primary) 22%, transparent)"
                  : "var(--card)",
                color: isFound ? "var(--primary)" : "var(--fg)",
                borderColor: isFound
                  ? "color-mix(in oklch, var(--primary) 45%, transparent)"
                  : "var(--border)",
                textDecoration: isFound ? "line-through" : "none",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {p.word}
            </span>
          );
        })}
      </div>

      <div style={{ display: "grid", placeItems: "center", flex: 1 }}>
        <div
          ref={gridRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            gap: 4,
            width: "min(90vw, 360px)",
            aspectRatio: "1 / 1",
            padding: 8,
            borderRadius: 16,
            background:
              "linear-gradient(160deg, oklch(0.30 0.05 100) 0%, oklch(0.16 0.03 80) 100%)",
            border:
              "1.5px solid color-mix(in oklch, var(--c-gold) 35%, var(--border))",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          {round.grid.map((row, r) =>
            row.map((ch, c) => {
              const key = `${r}:${c}`;
              const isFound = foundCells.has(key);
              const isSelected = selectedCells.has(key);
              const isFeedback = feedback != null && isSelected;
              const fbState = isFeedback
                ? feedback?.correct
                  ? "ok"
                  : "fail"
                : null;

              const bg = isFound
                ? "color-mix(in oklch, var(--primary) 28%, transparent)"
                : fbState === "ok"
                  ? "color-mix(in oklch, var(--primary) 35%, transparent)"
                  : fbState === "fail"
                    ? "color-mix(in oklch, var(--c-rose) 28%, transparent)"
                    : isSelected
                      ? "color-mix(in oklch, var(--c-gold) 30%, transparent)"
                      : "color-mix(in oklch, var(--card) 95%, transparent)";

              const color = isFound
                ? "var(--primary)"
                : fbState === "fail"
                  ? "var(--c-rose)"
                  : isSelected
                    ? "var(--c-gold)"
                    : "var(--fg)";

              return (
                <div
                  key={key}
                  style={{
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 6,
                    background: bg,
                    color,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "min(4vw, 18px)",
                    transition: "all 0.15s var(--ease-out-quint)",
                  }}
                >
                  {ch}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-2"
        style={{ color: "var(--fg-muted)", fontSize: 12 }}
      >
        <ScoutIcon name="search" size={14} stroke={2} /> Arrastra desde la
        primera letra hasta la última
      </div>
    </div>
  );
}
