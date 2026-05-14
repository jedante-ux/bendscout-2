"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/scout/game-shell";
import { GameIntroCard } from "@/components/scout/game-intro-card";
import { ScoresPanel } from "@/components/scout/scores-panel";
import { TeamChat } from "@/components/scout/team-chat";
import { ScoutIcon } from "@/components/scout/icon";
import {
  TarzanRunner,
  type TarzanRunnerHandle,
} from "@/components/games/tarzan-runner";
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

const GAME_KEY = "tarzan";

type Phase =
  | "ready"
  | "loading"
  | "play"
  | "submitting"
  | "done"
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

export default function TarzanPage() {
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

  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const startedAtRef = useRef<number>(0);
  const controlsRef = useRef<TarzanRunnerHandle | null>(null);
  const [, startTransition] = useTransition();

  const meta = getGame(GAME_KEY);

  const beginAttempt = useCallback(() => {
    setPhase("loading");
    setStarting(true);
    setScore(0);
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
          router.replace(`/login?next=/play/${GAME_KEY}`);
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
      });
    return () => {
      cancelled = true;
    };
  }, [router, refreshIntroData]);

  // Cronómetro mientras se juega.
  useEffect(() => {
    if (phase !== "play" || paused) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase, paused]);

  const submitScore = useCallback(
    (finalScore: number) => {
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
          setPhase("done");
        } catch (err) {
          console.error(err);
          setSubmitResult(null);
          setPhase("done");
        }
      });
    },
    [attempt],
  );

  const handleGameOver = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      submitScore(finalScore);
    },
    [submitScore],
  );

  const handleRetry = () => beginAttempt();
  const handleBackToIntro = useCallback(() => {
    setAttempt(null);
    setSubmitResult(null);
    setBlockedReason(null);
    setPhase("ready");
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
      return attempt.kind === "practice" ? "Práctica" : `Intento ${attempt.no}/2`;
    }
    return "Pista de Tarzán";
  }, [phase, attempt]);

  if (phase === "ready") {
    return (
      <IntroLayout>
        {dayStatus ? (
          <>
            <GameIntroCard
              title={meta?.title ?? "Pista de Tarzán"}
              tagline={
                meta?.tagline ??
                "Salta piedras y agáchate bajo las ramas. ¡Cada vez es más rápido!"
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
              gameTitle={meta?.title ?? "Pista de Tarzán"}
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
      title="PISTA DE TARZÁN"
      level={headerLevel}
      time={formatTime(elapsed)}
      points={score}
      lives={1}
      livesUsed={0}
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
      <AttemptBadge attempt={attempt} phase={phase} />

      <div className="relative flex-1 py-2">
        {(phase === "play" || phase === "submitting" || phase === "done") && (
          <>
            <TarzanRunner
              key={attempt?.sessionId ?? "none"}
              paused={paused || phase !== "play"}
              onScoreChange={setScore}
              onGameOver={handleGameOver}
              controlsRef={controlsRef}
            />
            <RunnerControls
              disabled={phase !== "play" || paused}
              onJump={() => controlsRef.current?.jump()}
              onDuckDown={() => controlsRef.current?.setDuck(true)}
              onDuckUp={() => controlsRef.current?.setDuck(false)}
            />
          </>
        )}

        {phase === "loading" && <LoadingOverlay />}
        {phase === "submitting" && <SubmittingOverlay />}

        {phase === "done" && (
          <FinishOverlay
            score={score}
            elapsed={elapsed}
            onRetry={handleRetry}
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

function RunnerControls({
  disabled,
  onJump,
  onDuckDown,
  onDuckUp,
}: {
  disabled: boolean;
  onJump: () => void;
  onDuckDown: () => void;
  onDuckUp: () => void;
}) {
  return (
    <div
      className="mt-3 grid select-none gap-3"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
      <button
        type="button"
        disabled={disabled}
        onPointerDown={(e) => {
          e.preventDefault();
          onDuckDown();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onDuckUp();
        }}
        onPointerLeave={onDuckUp}
        onPointerCancel={onDuckUp}
        className="btn btn-secondary btn-lg"
        style={{
          padding: "20px 12px",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.04em",
          touchAction: "manipulation",
        }}
      >
        <ScoutIcon name="arrow" size={18} stroke={2.4} /> AGACHARSE
      </button>
      <button
        type="button"
        disabled={disabled}
        onPointerDown={(e) => {
          e.preventDefault();
          onJump();
        }}
        className="btn btn-primary btn-lg"
        style={{
          padding: "20px 12px",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.04em",
          touchAction: "manipulation",
        }}
      >
        <ScoutIcon name="arrow" size={18} stroke={2.4} /> SALTAR
      </button>
    </div>
  );
}

function AttemptBadge({
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
    <div className="pt-1 pb-2">
      <div className="flex items-center gap-2">
        <span className={chipClass}>
          {attempt?.kind === "practice" ? "🎯 Práctica" : "🏆 Puntuable"}
        </span>
        {attempt?.kind === "scoring" && (
          <span className="t-caption text-muted">{`Intento ${attempt.no}/2`}</span>
        )}
      </div>
      <p className="t-caption text-muted" style={{ marginTop: 6 }}>
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
        <div style={{ height: 22, width: "60%", borderRadius: 8, background: "var(--card-hi)" }} />
        <div style={{ height: 14, width: "85%", borderRadius: 8, background: "var(--card-hi)" }} />
        <div style={{ height: 48, width: "100%", borderRadius: 12, background: "var(--card-hi)" }} />
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <Overlay>
      <div className="text-center">
        <div
          className="animate-pulse-glow mx-auto grid h-12 w-12 place-items-center rounded-full"
          style={{ background: "color-mix(in oklch, var(--primary) 18%, transparent)" }}
        >
          <ScoutIcon name="sparkle" size={22} className="text-primary-token" />
        </div>
        <p className="t-body-sm text-muted" style={{ marginTop: 12 }}>
          Preparando la pista…
        </p>
      </div>
    </Overlay>
  );
}

function SubmittingOverlay() {
  return (
    <Overlay>
      <div className="text-center">
        <div
          className="animate-pulse-glow mx-auto grid h-12 w-12 place-items-center rounded-full"
          style={{ background: "color-mix(in oklch, var(--primary) 18%, transparent)" }}
        >
          <ScoutIcon name="shieldcheck" size={22} className="text-primary-token" />
        </div>
        <p className="t-body-sm text-muted" style={{ marginTop: 12 }}>
          Guardando en tu Jamboree…
        </p>
      </div>
    </Overlay>
  );
}

function FinishOverlay({
  score,
  elapsed,
  onRetry,
  result,
  attempt,
}: {
  score: number;
  elapsed: number;
  onRetry: () => void;
  result: FinishAttemptResult | null;
  attempt: ActiveAttempt | null;
}) {
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
            background: "color-mix(in oklch, var(--c-rose) 22%, transparent)",
            color: "var(--c-rose)",
          }}
        >
          <ScoutIcon name="heart" size={36} stroke={2} />
        </div>
        <h3 className="t-display-md" style={{ marginTop: 14 }}>
          ¡Te atrapó la jungla!
        </h3>
        <p className="t-body-sm text-muted" style={{ marginTop: 4 }}>
          {attempt?.kind === "practice"
            ? "Suma 20 puntos por la práctica a tu semana."
            : "Tu mejor de dos intentos cuenta para el Jamboree."}
        </p>

        <div className="grid grid-cols-2 gap-2" style={{ marginTop: 16 }}>
          <Stat label="Score" value={score.toLocaleString("es")} highlight />
          <Stat label="Tiempo" value={formatTime(elapsed)} />
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
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
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
