"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";
import {
  MORSE_TEACHING_POOL,
  type MorseLetter,
} from "@/lib/games/morse/alphabet";

const OPTIONS_PER_ROUND = 4;
const CORRECT_POINTS = 100;
const STREAK_STEP = 10;
const STREAK_CAP = 50;
const FEEDBACK_MS = 800;

const DOT_MS = 110;
const DASH_MS = DOT_MS * 3;
const GAP_MS = DOT_MS;
const TONE_HZ = 640;

export interface MorseGameProps {
  interactive: boolean;
  onCorrect?: (delta: number, streak: number) => void;
  onWrong?: () => void;
  onTimeout?: () => void;
  timeLeftSeconds: number;
}

interface Round {
  letter: MorseLetter;
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

function buildRound(
  pool: MorseLetter[],
  previousLetter: string | null,
): Round {
  const candidates = pool.filter((c) => c.letter !== previousLetter);
  const correct =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    pool[Math.floor(Math.random() * pool.length)];
  const wrong = shuffle(
    pool.filter((c) => c.letter !== correct.letter).map((c) => c.letter),
  ).slice(0, OPTIONS_PER_ROUND - 1);
  const options = shuffle([correct.letter, ...wrong]);
  return { letter: correct, options };
}

class MorsePlayer {
  private ctx: AudioContext | null = null;
  private stopAt = 0;

  ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    return this.ctx;
  }

  async play(code: string): Promise<void> {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();

    let t = Math.max(ctx.currentTime + 0.05, this.stopAt);
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      const dur = ch === "." ? DOT_MS / 1000 : DASH_MS / 1000;
      this.scheduleBeep(ctx, t, dur);
      t += dur + GAP_MS / 1000;
    }
    this.stopAt = t;
  }

  private scheduleBeep(ctx: AudioContext, start: number, dur: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = TONE_HZ;
    osc.type = "sine";
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    const end = start + dur;
    // soft envelope to avoid clicks
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.01);
    gain.gain.setValueAtTime(0.22, end - 0.015);
    gain.gain.linearRampToValueAtTime(0, end);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

export function MorseGame({
  interactive,
  onCorrect,
  onWrong,
  onTimeout,
  timeLeftSeconds,
}: MorseGameProps) {
  const [round, setRound] = useState<Round>(() =>
    buildRound(MORSE_TEACHING_POOL, null),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [playing, setPlaying] = useState(false);
  const lockedRef = useRef(false);
  const playerRef = useRef<MorsePlayer | null>(null);
  if (playerRef.current == null) playerRef.current = new MorsePlayer();

  const advance = useCallback(() => {
    setRound((prev) => buildRound(MORSE_TEACHING_POOL, prev.letter.letter));
    setPicked(null);
    lockedRef.current = false;
  }, []);

  const playCurrent = useCallback(async () => {
    if (!playerRef.current) return;
    setPlaying(true);
    await playerRef.current.play(round.letter.code);
    const total =
      round.letter.code.length * DOT_MS +
      [...round.letter.code].reduce(
        (acc, c) => acc + (c === "-" ? DASH_MS - DOT_MS : 0),
        0,
      ) +
      (round.letter.code.length - 1) * GAP_MS;
    window.setTimeout(() => setPlaying(false), total + 100);
  }, [round.letter.code]);

  // Auto-play once when a new round starts (after first user gesture).
  const hasGesturedRef = useRef(false);
  useEffect(() => {
    if (!interactive) return;
    if (!hasGesturedRef.current) return;
    const t = window.setTimeout(() => {
      void playCurrent();
    }, 250);
    return () => window.clearTimeout(t);
  }, [round.letter.letter, interactive, playCurrent]);

  const handlePick = (option: string) => {
    if (!interactive || lockedRef.current) return;
    lockedRef.current = true;
    hasGesturedRef.current = true;
    setPicked(option);

    const isCorrect = option === round.letter.letter;
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

  const handlePlayClick = () => {
    if (!interactive) return;
    hasGesturedRef.current = true;
    void playCurrent();
  };

  useEffect(() => {
    if (timeLeftSeconds <= 0) onTimeout?.();
  }, [timeLeftSeconds, onTimeout]);

  const flash = picked
    ? picked === round.letter.letter
      ? "correct"
      : "wrong"
    : null;

  return (
    <div className="flex flex-1 flex-col" style={{ gap: 14 }}>
      <TelegraphCard
        code={round.letter.code}
        onPlay={handlePlayClick}
        playing={playing}
        flash={flash}
        revealLetter={picked ? round.letter.letter : null}
      />

      <div
        className="flex items-center justify-between"
        style={{ padding: "0 2px" }}
      >
        <span
          className="t-overline text-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          ¿Qué letra es?
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
        {round.options.map((opt) => {
          const isPicked = picked === opt;
          const isAnswer = opt === round.letter.letter;
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
              key={`${round.letter.letter}-${opt}`}
              type="button"
              onClick={() => handlePick(opt)}
              disabled={!interactive || picked != null}
              className={cn("btn btn-secondary")}
              style={{
                height: 64,
                justifyContent: "center",
                padding: 0,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "0.04em",
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

interface TelegraphProps {
  code: string;
  onPlay: () => void;
  playing: boolean;
  flash: "correct" | "wrong" | null;
  revealLetter: string | null;
}

function TelegraphCard({
  code,
  onPlay,
  playing,
  flash,
  revealLetter,
}: TelegraphProps) {
  const accent =
    flash === "correct"
      ? "var(--primary)"
      : flash === "wrong"
        ? "var(--c-rose)"
        : "var(--c-gold)";
  const glow =
    flash === "correct"
      ? "color-mix(in oklch, var(--primary) 35%, transparent)"
      : flash === "wrong"
        ? "color-mix(in oklch, var(--c-rose) 30%, transparent)"
        : "color-mix(in oklch, var(--c-gold) 22%, transparent)";

  const symbols = useMemo(() => [...code], [code]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        minHeight: 240,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        background:
          "linear-gradient(165deg, oklch(0.28 0.05 60) 0%, oklch(0.16 0.04 50) 100%)",
        border: "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
        boxShadow: `inset 0 0 60px ${glow}`,
        transition: "box-shadow 0.4s var(--ease-out-quint)",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          background: "color-mix(in oklch, #000 35%, transparent)",
          color: accent,
        }}
      >
        <span style={{ fontSize: 14 }}>📡</span>
        <span
          className="t-overline"
          style={{ letterSpacing: "0.18em", fontWeight: 700 }}
        >
          Transmitiendo
        </span>
      </div>

      <div
        className="flex items-center justify-center"
        style={{ gap: 10, minHeight: 56, flexWrap: "wrap", maxWidth: "100%" }}
      >
        {symbols.map((s, i) => (
          <SymbolDot key={i} symbol={s} active={playing} index={i} />
        ))}
      </div>

      {revealLetter && (
        <div
          className="t-display-md"
          style={{
            fontSize: 32,
            color: accent,
            letterSpacing: "0.1em",
            fontWeight: 800,
          }}
        >
          = {revealLetter}
        </div>
      )}

      <button
        type="button"
        onClick={onPlay}
        className="btn btn-secondary"
        style={{
          height: 44,
          padding: "0 18px",
          gap: 8,
          background: "color-mix(in oklch, #000 30%, transparent)",
          borderColor: "color-mix(in oklch, currentColor 30%, var(--border))",
          color: accent,
        }}
      >
        <ScoutIcon name={playing ? "pause" : "play"} size={14} stroke={2.4} />
        {playing ? "Sonando…" : "Repetir"}
      </button>
    </div>
  );
}

function SymbolDot({
  symbol,
  active,
  index,
}: {
  symbol: string;
  active: boolean;
  index: number;
}) {
  const isDot = symbol === ".";
  const w = isDot ? 14 : 36;
  return (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: 14,
        borderRadius: 999,
        background: "#fff",
        boxShadow: "0 0 14px color-mix(in oklch, var(--c-gold) 70%, white)",
        opacity: active ? 1 : 0.92,
        animation: active
          ? `morse-pulse 240ms ease-in-out ${index * 90}ms 1`
          : undefined,
      }}
    />
  );
}
