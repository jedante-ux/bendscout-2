"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GameShell } from "@/components/scout/game-shell";
import { GameIntroCard } from "@/components/scout/game-intro-card";
import { ScoresPanel } from "@/components/scout/scores-panel";
import { TeamChat } from "@/components/scout/team-chat";
import { HuellasGame } from "@/components/games/huellas-game";
import { GameStartOverlay } from "@/components/games/game-start-overlay";
import { ScoutIcon } from "@/components/scout/icon";
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

const GAME_KEY = "huellas";
const ROUND_SECONDS = 60;

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
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function HuellasPage() {
  return (
    <Suspense fallback={null}>
      <HuellasPageInner />
    </Suspense>
  );
}

function HuellasPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSandbox = searchParams.get("sandbox") === "1";

  const [phase, setPhase] = useState<Phase>(() =>
    isSandbox ? "play" : "ready",
  );
  const [attempt, setAttempt] = useState<ActiveAttempt | null>(() =>
    isSandbox ? { sessionId: "sandbox", kind: "practice", no: 1 } : null,
  );
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<FinishAttemptResult | null>(
    null,
  );
  const [dayStatus, setDayStatus] = useState<GameDayStatus | null>(null);
  const [todayScores, setTodayScores] = useState<GameScoreEntry[]>([]);
  const [history, setHistory] = useState<MyGameHistoryEntry[]>([]);
  const [starting, setStarting] = useState(false);

  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const scoreRef = useRef(0);
  const startedAtRef = useRef<number>(0);
  const [, startTransition] = useTransition();

  const meta = getGame(GAME_KEY);
  const fallbackTitle = "Caza de Huellas";
  const fallbackTagline =
    "Toca solo las huellas del animal correcto antes que desaparezcan.";

  const beginAttempt = useCallback(() => {
    setPhase("loading");
    setStarting(true);
    setScore(0);
    scoreRef.current = 0;
    setHits(0);
    setMisses(0);
    setMaxStreak(0);
    setTimeLeft(ROUND_SECONDS);
    setPaused(false);
    setStarted(false);
    setAttemptCount((c) => c + 1);
    setSubmitResult(null);
    startedAtRef.current = Date.now();

    if (isSandbox) {
      setAttempt({ sessionId: "sandbox", kind: "practice", no: 1 });
      setPhase("play");
      setStarting(false);
      return;
    }

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
  }, [router, isSandbox]);

  const refreshIntroData = useCallback(async () => {
    const [status, scores, hist] = await Promise.all([
      getGameDayStatus(GAME_KEY),
      getGameTodayScores(GAME_KEY, 8),
      getMyGameHistory(GAME_KEY, 5),
    ]);
    return { status, scores, hist };
  }, []);

  useEffect(() => {
    if (isSandbox) return;
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
  }, [router, refreshIntroData, isSandbox]);

  const submitScore = useCallback(
    (finalScore: number) => {
      if (!attempt) return;

      if (isSandbox) {
        setScore(finalScore);
        setSubmitResult(null);
        setPhase("done");
        return;
      }

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
    [attempt, isSandbox],
  );

  const endedRef = useRef(false);
  const handleTimeout = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    submitScore(scoreRef.current);
  }, [submitScore]);

  useEffect(() => {
    if (phase !== "play") return;
    endedRef.current = false;
  }, [phase, attemptCount]);

  useEffect(() => {
    if (phase !== "play" || paused || !started) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, paused, started]);

  const handleCorrect = (delta: number, streak: number) => {
    setScore((s) => {
      const next = s + delta;
      scoreRef.current = next;
      return next;
    });
    setHits((h) => h + 1);
    setMaxStreak((m) => Math.max(m, streak));
  };

  const handleWrong = () => {
    setScore((s) => {
      const next = Math.max(0, s - 30);
      scoreRef.current = next;
      return next;
    });
    setMisses((m) => m + 1);
  };

  const handleRetry = () => beginAttempt();
  const handleBackToIntro = useCallback(() => {
    if (isSandbox) {
      router.push("/sandbox");
      return;
    }
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
  }, [refreshIntroData, isSandbox, router]);

  const headerLevel = useMemo(() => {
    if (phase === "loading") return "Preparando…";
    if (phase === "blocked") return "Bloqueado";
    if (phase === "submitting") return "Guardando…";
    if (attempt) {
      return attempt.kind === "practice"
        ? "Práctica"
        : `Intento ${attempt.no}/2`;
    }
    return fallbackTitle;
  }, [phase, attempt, fallbackTitle]);

  if (phase === "ready") {
    return (
      <IntroLayout>
        {dayStatus ? (
          <>
            <GameIntroCard
              title={meta?.title ?? fallbackTitle}
              tagline={meta?.tagline ?? fallbackTagline}
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
              gameTitle={meta?.title ?? fallbackTitle}
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
      title="HUELLAS"
      level={headerLevel}
      time={formatTime(timeLeft)}
      points={score}
      lives={0}
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
      <AttemptBadge attempt={attempt} phase={phase} hits={hits} misses={misses} />

      <div className="relative flex-1 py-2">
        {phase === "play" && (
          <>
            <HuellasGame
              key={attemptCount}
              interactive={started && !paused && timeLeft > 0}
              timeLeftSeconds={timeLeft}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
              onTimeout={handleTimeout}
            />
            {!started && (
              <GameStartOverlay
                onStart={() => setStarted(true)}
                hint="Toca rápido — solo las huellas del animal correcto"
              />
            )}
          </>
        )}

        {phase === "loading" && <LoadingOverlay />}
        {phase === "submitting" && <SubmittingOverlay />}

        {phase === "done" && (
          <FinishOverlay
            score={score}
            hits={hits}
            misses={misses}
            maxStreak={maxStreak}
            onRetry={handleRetry}
            result={submitResult}
            attempt={attempt}
            isSandbox={isSandbox}
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

function AttemptBadge({
  attempt,
  phase,
  hits,
  misses,
}: {
  attempt: ActiveAttempt | null;
  phase: Phase;
  hits: number;
  misses: number;
}) {
  if (phase === "blocked" || phase === "ready") return null;
  const chipClass =
    attempt?.kind === "practice" ? "chip chip-sky" : "chip chip-accent";

  return (
    <div className="pt-1 pb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={chipClass}>
          {attempt?.kind === "practice" ? "🎯 Práctica" : "🏆 Puntuable"}
        </span>
        {attempt?.kind === "scoring" && (
          <span className="t-caption text-muted">{`Intento ${attempt.no}/2`}</span>
        )}
      </div>
      <div className="flex items-center gap-2 t-caption">
        <span style={{ color: "var(--primary)", fontWeight: 700 }}>
          ✓ {hits}
        </span>
        <span style={{ color: "var(--c-rose)", fontWeight: 700 }}>
          ✗ {misses}
        </span>
      </div>
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
          Rastreando el bosque…
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
  hits,
  misses,
  maxStreak,
  onRetry,
  result,
  attempt,
  isSandbox,
}: {
  score: number;
  hits: number;
  misses: number;
  maxStreak: number;
  onRetry: () => void;
  result: FinishAttemptResult | null;
  attempt: ActiveAttempt | null;
  isSandbox: boolean;
}) {
  const wasScoring = attempt?.kind === "scoring" && !isSandbox;
  const showRetryButton =
    isSandbox ||
    attempt?.kind === "practice" ||
    (attempt?.kind === "scoring" && attempt.no === 1);
  const accuracy =
    hits + misses === 0 ? 0 : Math.round((hits * 100) / (hits + misses));

  return (
    <Overlay>
      <div className="text-center">
        <div
          className="mx-auto grid place-items-center rounded-full"
          style={{
            width: 72,
            height: 72,
            background: "color-mix(in oklch, var(--primary) 22%, transparent)",
            color: "var(--primary)",
          }}
        >
          <ScoutIcon name="trophy" size={36} stroke={2} />
        </div>
        <h3 className="t-display-md" style={{ marginTop: 14 }}>
          {attempt?.kind === "practice"
            ? "¡Práctica completa!"
            : "¡Rastreador experto!"}
        </h3>
        <p className="t-body-sm text-muted" style={{ marginTop: 4 }}>
          {isSandbox
            ? "Modo prueba: nada se guarda al Jamboree."
            : attempt?.kind === "practice"
              ? "Suma 20 puntos por la práctica a tu semana."
              : "Tu mejor de dos intentos cuenta para el Jamboree."}
        </p>

        <div className="grid grid-cols-3 gap-2" style={{ marginTop: 16 }}>
          <Stat label="Score" value={score.toLocaleString("es")} highlight />
          <Stat label="Aciertos" value={`${hits}/${hits + misses}`} />
          <Stat label="Racha" value={`x${maxStreak}`} />
        </div>

        <div className="grid grid-cols-2 gap-2" style={{ marginTop: 10 }}>
          <Stat label="Precisión" value={`${accuracy}%`} />
          {result && wasScoring ? (
            <Stat
              label="Semana"
              value={result.weeklyTotal.toLocaleString("es")}
              highlight
            />
          ) : (
            <Stat label="Errores" value={misses.toString()} />
          )}
        </div>

        {result && wasScoring && (
          <div className="grid grid-cols-1 gap-2" style={{ marginTop: 10 }}>
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
              {isSandbox
                ? "Otra vez"
                : attempt?.kind === "practice"
                  ? "Jugar puntuable"
                  : "Intento 2"}
            </button>
          )}
          <Link
            href={isSandbox ? "/sandbox" : "/play"}
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
