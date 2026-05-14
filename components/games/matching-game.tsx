"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingGameProps {
  pairs: MatchingPair[];
  onMatch?: (pair: MatchingPair) => void;
  onWrong?: () => void;
  onComplete?: () => void;
}

type Line = { x1: number; y1: number; x2: number; y2: number };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchingGame({
  pairs,
  onMatch,
  onWrong,
  onComplete,
}: MatchingGameProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(
    null,
  );
  const [lines, setLines] = useState<Record<string, Line>>({});

  const rightOrder = useMemo(() => shuffle(pairs.map((p) => p.id)), [pairs]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cb = container.getBoundingClientRect();
    const next: Record<string, Line> = {};
    matched.forEach((id) => {
      const l = leftRefs.current[id];
      const r = rightRefs.current[id];
      if (!l || !r) return;
      const lr = l.getBoundingClientRect();
      const rr = r.getBoundingClientRect();
      next[id] = {
        x1: lr.right - cb.left,
        y1: lr.top + lr.height / 2 - cb.top,
        x2: rr.left - cb.left,
        y2: rr.top + rr.height / 2 - cb.top,
      };
    });
    setLines(next);
  }, [matched]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(recompute);
    ro.observe(containerRef.current);
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute);
    };
  }, [recompute]);

  // Reset state if pairs change (e.g. new round).
  useEffect(() => {
    setSelectedLeft(null);
    setMatched(new Set());
    setWrong(null);
    setLines({});
  }, [pairs]);

  const handleLeft = (id: string) => {
    if (matched.has(id) || wrong) return;
    setSelectedLeft((cur) => (cur === id ? null : id));
  };

  const handleRight = (id: string) => {
    if (matched.has(id) || wrong) return;
    if (!selectedLeft) return;

    if (selectedLeft === id) {
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelectedLeft(null);
      onMatch?.(pairs.find((p) => p.id === id)!);
      if (next.size === pairs.length) {
        setTimeout(() => onComplete?.(), 450);
      }
    } else {
      setWrong({ left: selectedLeft, right: id });
      onWrong?.();
      setTimeout(() => {
        setWrong(null);
        setSelectedLeft(null);
      }, 480);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Line connection layer (below cards) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Object.entries(lines).map(([id, g]) => {
          const dx = Math.abs(g.x2 - g.x1) * 0.45;
          const d = `M ${g.x1} ${g.y1} C ${g.x1 + dx} ${g.y1}, ${g.x2 - dx} ${g.y2}, ${g.x2} ${g.y2}`;
          return (
            <g key={id} filter="url(#line-glow)">
              <path
                d={d}
                pathLength={100}
                stroke="var(--primary)"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
                className="match-line"
              />
            </g>
          );
        })}
      </svg>

      <div className="relative grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2.5">
          {pairs.map((p) => (
            <MatchCard
              key={`L-${p.id}`}
              ref={(el) => {
                leftRefs.current[p.id] = el;
              }}
              side="left"
              text={p.left}
              selected={selectedLeft === p.id}
              matched={matched.has(p.id)}
              wrong={wrong?.left === p.id}
              onClick={() => handleLeft(p.id)}
              disabled={matched.has(p.id)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {rightOrder.map((id) => {
            const p = pairs.find((x) => x.id === id)!;
            const isMatched = matched.has(id);
            return (
              <MatchCard
                key={`R-${id}`}
                ref={(el) => {
                  rightRefs.current[id] = el;
                }}
                side="right"
                text={p.right}
                selected={false}
                matched={isMatched}
                wrong={wrong?.right === id}
                onClick={() => handleRight(id)}
                disabled={isMatched || !selectedLeft}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  side: "left" | "right";
  text: string;
  selected: boolean;
  matched: boolean;
  wrong: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const MatchCard = forwardRef<HTMLButtonElement, CardProps>(function MatchCard(
  { side, text, selected, matched, wrong, disabled, onClick },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      aria-pressed={selected || matched}
      className={cn(
        "match-card group relative w-full rounded-2xl border px-3 py-3 text-left transition",
        "active:scale-[0.98]",
        selected && "match-card--selected",
        matched && "match-card--matched",
        wrong && "match-card--wrong",
        side === "right" && "text-right",
        disabled && !matched && "opacity-90",
      )}
    >
      <span className="block t-body-sm" style={{ fontWeight: 600, lineHeight: 1.25 }}>
        {text}
      </span>
      {matched && (
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 -translate-y-1/2 grid place-items-center rounded-full",
            side === "left" ? "-right-2" : "-left-2",
          )}
          style={{
            width: 18,
            height: 18,
            background: "var(--primary)",
            color: "var(--primary-ink)",
            boxShadow: "0 0 0 3px var(--bg)",
          }}
        >
          <ScoutIcon name="check" size={11} stroke={3} />
        </span>
      )}
    </button>
  );
});
