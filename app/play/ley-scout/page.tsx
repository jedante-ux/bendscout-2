"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/scout/game-shell";
import { GameIntroCard } from "@/components/scout/game-intro-card";
import { ScoresPanel } from "@/components/scout/scores-panel";
import { TeamChat } from "@/components/scout/team-chat";
import { MatchingGame } from "@/components/games/matching-game";
import { ScoutIcon } from "@/components/scout/icon";
import { LEY_SCOUT_ROUNDS } from "@/lib/games/matching/ley-scout";
import {
  finishAttempt,
  getGameDayStatus,
  getGameTodayScores,
  getMyGameHistory,
  startAttempt,
  type GameDayStatus,
  type GameScoreEntry,
  type MyGameHistoryEntry,
} from "@/lib/games/actions";
import { getGame } from "@/lib/games/registry";
import type {
  AttemptKind,
  FinishAttemptResult,
  StartAttemptResult,
} from "@/types/database";

const GAME_KEY = "ley-scout";
const MATCH_BONUS = 120;
const WRONG_PENALTY = 30;
const MAX_LIVES = 3;
const ROUND_TIME_BONUS = 5;

type Phase =
  | "ready"
  | "loading"
  | "play"
  | "round-clear"
  | "submitting"
  | "done"
  | "fail"
  | "blocked";

interface ActiveAttempt {
  sessionId: string;
  kind: AttemptKind;
  no: 1 | 2;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LeyScoutPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [attempt, setAttempt] = useState<ActiveAttempt | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<FinishAttemptResult | null>(
    null,
  );
  const [dayStatus, setDayStatus] = useState<GameDayStatus | null>(null);
  const [todayScores, setTodayScores] = useState<GameScoreEntry[]>([]);
  const [history, setHistory] = useState<MyGameHistoryEntry[]>([]);
  const [starting, setStarting] = useState(false);

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [livesUsed, setLivesUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const [, startTransition] = useTransition();

  const round = LEY_SCOUT_ROUNDS[roundIndex];
  const totalRounds = LEY_SCOUT_ROUNDS.length;
  const livesLeft = MAX_LIVES - livesUsed;
  const meta = getGame(GAME_KEY);

  const beginAttempt = useCallback(() => {
    setPhase("loading");
    setStarting(true);
    setRoundIndex(0);
    setScore(0);
    setLivesUsed(0);
    setElapsed(0);
    setPaused(false);
    setSubmitResult(null);
    startedAtRef.current = Date.now();

    startTransition(async () => {
      let result: StartAttemptResult;
      try {
        result = await startAttempt(GAME_KEY);
      } catch (err) {
        console.error(err);
        setBlockedReason("unknown_error");
        setPhase("blocked");
        setStarting(false);
        return;
      }

      if (result.blocked) {
        if (result.reason === "unauthenticated") {
          router.replace("/login?next=/play/ley-scout");
          return;
        }
        setBlockedReason(result.reason);
        setPhase("blocked");
        setStarting(false);
        return;
      }

      setAttempt({
        sessionId: result.sessionId,
        kind: result.attemptKind,
        no: result.attemptNo,
      });
      setPhase("play");
      setStarting(false);
    });
  }, [router]);

  const refreshIntroData = useCallback(async () => {
    const [status, scores, hist] = await Promise.all([
      getGameDayStatus(GAME_KEY),
      getGameTodayScores(GAME_KEY, 8),
      getMyGameHistory(GAME_KEY, 5),
    ]);
    return { status, scores, hist };
  }, []);

  // Mount: fetch day status + scores + history (no auto-start).
  useEffect(() => {
    let cancelled = false;
    refreshIntroData()
      .then(({ status, scores, hist }) => {
        if (cancelled) return;
        setDayStatus(status);
        setTodayScores(scores);
        setHistory(hist);
        if (!status.authenticated) {
          router.replace(`/login?next=/play/${GAME_KEY}`);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setDayStatus({
            authenticated: true,
            practiceDone: false,
            attempt1Score: null,
            attempt2Score: null,
            scoringAttemptsUsed: 0,
            scoringAttemptsRemaining: 2,
            bestScore: 0,
            dayTotal: 0,
            blockedByOtherGame: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router, refreshIntroData]);

  // Tick timer while playing.
  useEffect(() => {
    if (phase !== "play" || paused) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase, paused]);

  const submitScore = useCallback(
    (finalScore: number, outcome: "done" | "fail") => {
      if (!attempt) return;
      setPhase("submitting");
      const durationMs = Date.now() - startedAtRef.current;

      startTransition(async () => {
        try {
          const res = await finishAttempt(
            attempt.sessionId,
            finalScore,
            durationMs,
          );
          setSubmitResult(res);
          setPhase(outcome);
        } catch (err) {
          console.error(err);
          setSubmitResult(null);
          setPhase(outcome);
        }
      });
    },
    [attempt],
  );

  const handleMatch = () => setScore((s) => s + MATCH_BONUS);

  const handleWrong = () => {
    setScore((s) => Math.max(0, s - WRONG_PENALTY));
    setLivesUsed((l) => {
      const next = l + 1;
      if (next >= MAX_LIVES) {
        // Submit on next tick so React applies state first.
        setTimeout(() => submitScore(Math.max(0, score - WRONG_PENALTY), "fail"), 0);
      }
      return next;
    });
  };

  const handleRoundComplete = () => {
    const timeBonus = Math.max(0, 90 - elapsed) * ROUND_TIME_BONUS;
    const newScore = score + timeBonus;
    setScore(newScore);

    if (roundIndex + 1 >= totalRounds) {
      submitScore(newScore, "done");
    } else {
      setPhase("round-clear");
    }
  };

  const handleNextRound = () => {
    setRoundIndex((i) => i + 1);
    setPhase("play");
    setElapsed(0);
  };

  const handleRetry = () => beginAttempt();
  const handleBackToIntro = useCallback(() => {
    setAttempt(null);
    setSubmitResult(null);
    setBlockedReason(null);
    setPhase("ready");
    // Refresh status + scores to reflect newly-used attempts.
    refreshIntroData()
      .then(({ status, scores, hist }) => {
        setDayStatus(status);
        setTodayScores(scores);
        setHistory(hist);
      })
      .catch((err) => console.error(err));
  }, [refreshIntroData]);

  const headerLevel = useMemo(() => {
    if (phase === "loading") return "Preparando…";
    if (phase === "blocked") return "Bloqueado";
    if (phase === "submitting") return "Guardando…";
    if (attempt) {
      const tag =
        attempt.kind === "practice" ? "Práctica" : `Intento ${attempt.no}`;
      return `${tag} · Ronda ${roundIndex + 1}/${totalRounds}`;
    }
    return `Ronda ${roundIndex + 1}/${totalRounds}`;
  }, [phase, attempt, roundIndex, totalRounds]);

  if (phase === "ready") {
    return (
      <IntroLayout>
        {dayStatus ? (
          <>
            <GameIntroCard
              title={meta?.title ?? "Ley en Orden"}
              tagline={
                meta?.tagline ??
                "Conecta cada fragmento de la Ley Scout con su completación."
              }
              imageSrc={meta?.imageSrc}
              emoji={meta?.emoji}
              attemptsRemaining={dayStatus.scoringAttemptsRemaining}
              practiceDone={dayStatus.practiceDone}
              bestScore={dayStatus.bestScore}
              blockedByOtherGame={dayStatus.blockedByOtherGame}
              onStart={() => beginAttempt()}
              starting={starting}
            />
            <ScoresPanel
              gameTitle={meta?.title ?? "Ley en Orden"}
              dayStatus={dayStatus}
              todayScores={todayScores}
              history={history}
            />
            <TeamChat gameKey={GAME_KEY} />
          </>
        ) : (
          <IntroSkeleton />
        )}
      </IntroLayout>
    );
  }

  return (
    <GameShell
      title="LEY EN ORDEN"
      level={headerLevel}
      time={formatTime(elapsed)}
      points={score}
      lives={MAX_LIVES}
      livesUsed={livesUsed}
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackToIntro}
            className="btn btn-ghost btn-sm"
            aria-label="Salir"
          >
            <ScoutIcon name="close" size={14} /> Salir
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="btn btn-secondary btn-sm"
            disabled={phase !== "play"}
          >
            <ScoutIcon name={paused ? "play" : "pause"} size={14} />
            {paused ? "Reanudar" : "Pausar"}
          </button>
        </div>
      }
    >
      <Intro attempt={attempt} phase={phase} />

      <div className="relative flex-1 py-3">
        {(phase === "play" || phase === "round-clear") && (
          <MatchingGame
            key={`${attempt?.sessionId ?? "none"}-${roundIndex}`}
            pairs={round}
            onMatch={handleMatch}
            onWrong={handleWrong}
            onComplete={handleRoundComplete}
          />
        )}

        {phase === "loading" && <LoadingOverlay />}

        {phase === "round-clear" && (
          <RoundClearOverlay
            score={score}
            onNext={handleNextRound}
            nextLabel="Siguiente ronda"
          />
        )}

        {phase === "submitting" && <SubmittingOverlay />}

        {phase === "done" && (
          <FinishOverlay
            score={score}
            livesLeft={livesLeft}
            elapsed={elapsed}
            onRetry={handleRetry}
            variant="win"
            result={submitResult}
            attempt={attempt}
          />
        )}

        {phase === "fail" && (
          <FinishOverlay
            score={score}
            livesLeft={0}
            elapsed={elapsed}
            onRetry={handleRetry}
            variant="lose"
            result={submitResult}
            attempt={attempt}
          />
        )}

        {phase === "blocked" && <BlockedOverlay reason={blockedReason} />}

        {paused && phase === "play" && (
          <PausedOverlay onResume={() => setPaused(false)} />
        )}
      </div>
    </GameShell>
  );
}

function Intro({
  attempt,
  phase,
}: {
  attempt: ActiveAttempt | null;
  phase: Phase;
}) {
  if (phase === "blocked" || phase === "ready") return null;
  const tip =
    attempt?.kind === "practice"
      ? "Modo práctica: este intento no afecta tu puntaje semanal."
      : "Modo puntuable: tu mejor de 2 cuenta para el Jamboree.";

  const chipClass =
    attempt?.kind === "practice" ? "chip chip-sky" : "chip chip-accent";

  return (
    <div className="pt-1 pb-3">
      <div className="flex items-center gap-2">
        <span className={chipClass}>
          {attempt?.kind === "practice" ? "🎯 Práctica" : "🏆 Puntuable"}
        </span>
        {attempt?.kind === "scoring" && (
          <span className="t-caption text-muted">{`Intento ${attempt.no}/2`}</span>
        )}
      </div>
      <p className="t-caption text-muted" style={{ marginTop: 8 }}>
        {tip}
      </p>
    </div>
  );
}

function IntroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col"
      style={{ background: "var(--bg)" }}
    >
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklch, var(--bg) 96%, transparent), color-mix(in oklch, var(--bg) 80%, transparent))",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link
          href="/dashboard"
          className="btn btn-ghost btn-sm"
          aria-label="Volver al dashboard"
        >
          <ScoutIcon name="arrow" size={14} />
          Volver
        </Link>
        <span
          className="t-overline"
          style={{ letterSpacing: "0.16em", color: "var(--fg-soft)" }}
        >
          Minijuego del día
        </span>
        <span className="btn btn-ghost btn-sm btn-icon" aria-hidden>
          <ScoutIcon name="settings" size={14} />
        </span>
      </header>
      <div
        className="vstack flex-1 px-5 pb-10 pt-2"
        style={{ gap: 14, alignItems: "center" }}
      >
        {children}
      </div>
    </div>
  );
}

function IntroSkeleton() {
  return (
    <div
      className="scout-card w-full"
      style={{
        maxWidth: 420,
        padding: 0,
        overflow: "hidden",
        opacity: 0.7,
      }}
    >
      <div
        className="animate-pulse"
        style={{
          aspectRatio: "16 / 10",
          background:
            "linear-gradient(110deg, var(--surface) 0%, var(--card-hi) 50%, var(--surface) 100%)",
        }}
      />
      <div className="vstack" style={{ padding: 20, gap: 14 }}>
        <div
          style={{
            height: 22,
            width: "60%",
            borderRadius: 8,
            background: "var(--card-hi)",
          }}
        />
        <div
          style={{
            height: 14,
            width: "85%",
            borderRadius: 8,
            background: "var(--card-hi)",
          }}
        />
        <div
          style={{
            height: 48,
            width: "100%",
            borderRadius: 12,
            background: "var(--card-hi)",
          }}
        />
        <div
          style={{
            height: 40,
            width: "100%",
            borderRadius: 10,
            background: "var(--card-hi)",
          }}
        />
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <Overlay>
      <div className="text-center">
        <div className="animate-pulse-glow mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: "color-mix(in oklch, var(--primary) 18%, transparent)" }}>
          <ScoutIcon name="sparkle" size={22} className="text-primary-token" />
        </div>
        <p className="t-body-sm text-muted" style={{ marginTop: 12 }}>
          Preparando tu intento…
        </p>
      </div>
    </Overlay>
  );
}

function SubmittingOverlay() {
  return (
    <Overlay>
      <div className="text-center">
        <div className="animate-pulse-glow mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: "color-mix(in oklch, var(--primary) 18%, transparent)" }}>
          <ScoutIcon name="shieldcheck" size={22} className="text-primary-token" />
        </div>
        <p className="t-body-sm text-muted" style={{ marginTop: 12 }}>
          Guardando en tu Jamboree…
        </p>
      </div>
    </Overlay>
  );
}

function RoundClearOverlay({
  score,
  onNext,
  nextLabel,
}: {
  score: number;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <Overlay>
      <div className="text-center">
        <div
          className="mx-auto grid place-items-center rounded-full"
          style={{
            width: 64,
            height: 64,
            background: "color-mix(in oklch, var(--primary) 18%, transparent)",
            color: "var(--primary)",
          }}
        >
          <ScoutIcon name="shieldcheck" size={32} stroke={2} />
        </div>
        <h3 className="t-display-md" style={{ marginTop: 14 }}>
          ¡Ronda completa!
        </h3>
        <p className="t-body-sm text-muted" style={{ marginTop: 4 }}>
          Puntos acumulados:{" "}
          <b style={{ color: "var(--accent)" }}>
            {score.toLocaleString("es")}
          </b>
        </p>
        <button
          onClick={onNext}
          className="btn btn-primary btn-lg"
          style={{ marginTop: 18, width: "100%" }}
        >
          {nextLabel}
          <ScoutIcon name="arrow" size={14} />
        </button>
      </div>
    </Overlay>
  );
}

function FinishOverlay({
  score,
  livesLeft,
  elapsed,
  onRetry,
  variant,
  result,
  attempt,
}: {
  score: number;
  livesLeft: number;
  elapsed: number;
  onRetry: () => void;
  variant: "win" | "lose";
  result: FinishAttemptResult | null;
  attempt: ActiveAttempt | null;
}) {
  const isWin = variant === "win";
  const wasScoring = attempt?.kind === "scoring";
  const showRetryButton =
    attempt?.kind === "practice" ||
    (attempt?.kind === "scoring" && attempt.no === 1);

  return (
    <Overlay>
      <div className="text-center">
        <div
          className="mx-auto grid place-items-center rounded-full"
          style={{
            width: 72,
            height: 72,
            background: isWin
              ? "color-mix(in oklch, var(--primary) 22%, transparent)"
              : "color-mix(in oklch, var(--c-rose) 22%, transparent)",
            color: isWin ? "var(--primary)" : "var(--c-rose)",
          }}
        >
          <ScoutIcon name={isWin ? "trophy" : "heart"} size={36} stroke={2} />
        </div>
        <h3 className="t-display-md" style={{ marginTop: 14 }}>
          {isWin
            ? attempt?.kind === "practice"
              ? "¡Práctica completa!"
              : "¡Intento completo!"
            : "Sin vidas"}
        </h3>
        <p className="t-body-sm text-muted" style={{ marginTop: 4 }}>
          {attempt?.kind === "practice"
            ? "Suma 20 puntos por la práctica a tu semana."
            : isWin
              ? "Tu mejor de dos intentos cuenta para el Jamboree."
              : "Inténtalo de nuevo, tu patrulla cuenta contigo."}
        </p>

        <div className="grid grid-cols-3 gap-2" style={{ marginTop: 16 }}>
          <Stat label="Score" value={score.toLocaleString("es")} highlight />
          <Stat label="Tiempo" value={formatTime(elapsed)} />
          <Stat label="Vidas" value={`${livesLeft}/${MAX_LIVES}`} />
        </div>

        {result && wasScoring && (
          <div className="grid grid-cols-2 gap-2" style={{ marginTop: 10 }}>
            <Stat
              label="Semana"
              value={result.weeklyTotal.toLocaleString("es")}
              highlight
            />
            <Stat
              label="Patrulla"
              value={result.teamWeekly.toLocaleString("es")}
            />
          </div>
        )}

        <div className="flex gap-2" style={{ marginTop: 18 }}>
          {showRetryButton && (
            <button
              onClick={onRetry}
              className="btn btn-secondary btn-lg"
              style={{ flex: 1 }}
            >
              <ScoutIcon name="history" size={14} />
              {attempt?.kind === "practice" ? "Jugar puntuable" : "Intento 2"}
            </button>
          )}
          <Link
            href="/play"
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
          >
            Volver
            <ScoutIcon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </Overlay>
  );
}

function BlockedOverlay({ reason }: { reason: string | null }) {
  const copy =
    reason === "already_played_other_game"
      ? {
          title: "Solo un juego al día",
          body: "Hoy ya empezaste otro minijuego. Vuelve mañana para jugar este — tu Jamboree se reinicia el lunes.",
        }
      : reason === "attempts_exhausted"
        ? {
            title: "Intentos agotados",
            body: "Ya usaste tu práctica y los 2 intentos puntuables de hoy. ¡Buen trabajo!",
          }
        : {
            title: "No pudimos preparar tu intento",
            body: "Algo falló al iniciar. Intenta de nuevo en un momento.",
          };

  return (
    <Overlay>
      <div className="text-center">
        <div
          className="mx-auto grid place-items-center rounded-full"
          style={{
            width: 64,
            height: 64,
            background: "color-mix(in oklch, var(--c-gold) 18%, transparent)",
            color: "var(--c-gold)",
          }}
        >
          <ScoutIcon name="clock" size={30} stroke={2} />
        </div>
        <h3 className="t-display-md" style={{ marginTop: 14 }}>
          {copy.title}
        </h3>
        <p className="t-body-sm text-muted" style={{ marginTop: 6, textWrap: "balance" }}>
          {copy.body}
        </p>
        <Link
          href="/play"
          className="btn btn-primary btn-lg"
          style={{ marginTop: 18, width: "100%" }}
        >
          Ver otros minijuegos
          <ScoutIcon name="arrow" size={14} />
        </Link>
      </div>
    </Overlay>
  );
}

function PausedOverlay({ onResume }: { onResume: () => void }) {
  return (
    <Overlay>
      <div className="text-center">
        <ScoutIcon name="pause" size={36} className="mx-auto" />
        <h3 className="t-display-md" style={{ marginTop: 10 }}>
          En pausa
        </h3>
        <button
          onClick={onResume}
          className="btn btn-primary btn-lg"
          style={{ marginTop: 14, width: "100%" }}
        >
          <ScoutIcon name="play" size={14} /> Reanudar
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center px-4"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklch, var(--bg) 88%, transparent), color-mix(in oklch, var(--bg) 96%, transparent))",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="scout-card w-full max-w-xs"
        style={{
          padding: 22,
          animation: "scale-in 0.32s var(--ease-out-quint) both",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="t-overline text-muted">{label}</div>
      <div
        className="t-num"
        style={{
          fontSize: 16,
          color: highlight ? "var(--accent)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
