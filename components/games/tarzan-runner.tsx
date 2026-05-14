"use client";

import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { TARZAN_GAME } from "@/lib/games/runner/tarzan";

type ObstacleKind = "rock" | "branch";

interface Obstacle {
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

interface RunnerState {
  y: number;          // y del top del corredor (sistema lógico)
  vy: number;         // velocidad vertical
  ducking: boolean;
  onGround: boolean;
}

export interface TarzanRunnerHandle {
  jump(): void;
  setDuck(ducking: boolean): void;
  pause(): void;
  resume(): void;
}

export interface TarzanRunnerProps {
  paused: boolean;
  onScoreChange?: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  /** Permite al padre obtener el handle imperativo. */
  controlsRef?: React.Ref<TarzanRunnerHandle>;
}

/**
 * Endless runner estilo Chrome-dino, tema Tarzán.
 * - Render con canvas (placeholder rects, listo para swap a sprites).
 * - Loop con requestAnimationFrame y delta-time variable.
 * - Score solo se notifica a React cada ~6 frames para no recrear renders.
 */
export function TarzanRunner({
  paused,
  onScoreChange,
  onGameOver,
  controlsRef,
}: TarzanRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Refs para evitar re-renders en el loop.
  const pausedRef = useRef(paused);
  const aliveRef = useRef(true);
  const lastTsRef = useRef<number>(0);
  const speedRef = useRef<number>(TARZAN_GAME.speed.initial);
  const spawnTimerRef = useRef<number>(60); // primer obstáculo tarda un poco
  const spawnIntervalRef = useRef<number>(TARZAN_GAME.spawn.initialIntervalFrames);
  const elapsedSecRef = useRef(0);
  const scoreRef = useRef(0);
  const scoreEmitTickRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const groundOffsetRef = useRef(0);

  const runnerRef = useRef<RunnerState>({
    y: TARZAN_GAME.world.groundY - TARZAN_GAME.runner.heightRun,
    vy: 0,
    ducking: false,
    onGround: true,
  });

  useEffect(() => {
    pausedRef.current = paused;
    // Reset el delta cuando se sale de pausa para evitar saltos enormes.
    if (!paused) {
      lastTsRef.current = 0;
    }
  }, [paused]);

  // ---------- Imperative API (jump / duck) ----------
  const doJump = useCallback(() => {
    if (!aliveRef.current || pausedRef.current) return;
    const r = runnerRef.current;
    if (r.onGround) {
      r.vy = TARZAN_GAME.runner.jumpImpulse;
      r.onGround = false;
      r.ducking = false;
    }
  }, []);

  const doSetDuck = useCallback((ducking: boolean) => {
    if (!aliveRef.current) return;
    const r = runnerRef.current;
    r.ducking = ducking;
    if (ducking && r.onGround) {
      // Si estamos parados y agachamos, ajustar y al alto de agachado.
      r.y = TARZAN_GAME.world.groundY - TARZAN_GAME.runner.heightDuck;
    } else if (!ducking && r.onGround) {
      r.y = TARZAN_GAME.world.groundY - TARZAN_GAME.runner.heightRun;
    }
  }, []);

  useImperativeHandle(
    controlsRef,
    () => ({
      jump: doJump,
      setDuck: doSetDuck,
      pause: () => {
        pausedRef.current = true;
      },
      resume: () => {
        pausedRef.current = false;
      },
    }),
    [doJump, doSetDuck],
  );

  // ---------- Loop ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset state for fresh run.
    aliveRef.current = true;
    lastTsRef.current = 0;
    speedRef.current = TARZAN_GAME.speed.initial;
    spawnTimerRef.current = 60;
    spawnIntervalRef.current = TARZAN_GAME.spawn.initialIntervalFrames;
    elapsedSecRef.current = 0;
    scoreRef.current = 0;
    scoreEmitTickRef.current = 0;
    obstaclesRef.current = [];
    groundOffsetRef.current = 0;
    runnerRef.current = {
      y: TARZAN_GAME.world.groundY - TARZAN_GAME.runner.heightRun,
      vy: 0,
      ducking: false,
      onGround: true,
    };

    const W = TARZAN_GAME.world.width;
    const H = TARZAN_GAME.world.height;
    const GROUND = TARZAN_GAME.world.groundY;

    // Hi-DPI: ajustar el backing store al devicePixelRatio.
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const cssWidth = canvas.clientWidth || W;
      const cssHeight = canvas.clientHeight || H;
      canvas.width = Math.round(cssWidth * ratio);
      canvas.height = Math.round(cssHeight * ratio);
      const scaleX = (cssWidth * ratio) / W;
      const scaleY = (cssHeight * ratio) / H;
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawnObstacle = () => {
      const useBranch = Math.random() < TARZAN_GAME.spawn.branchProbability;
      if (useBranch) {
        obstaclesRef.current.push({
          kind: "branch",
          x: W + 20,
          y: TARZAN_GAME.obstacles.branch.topY,
          width: TARZAN_GAME.obstacles.branch.width,
          height: TARZAN_GAME.obstacles.branch.height,
          passed: false,
        });
      } else {
        obstaclesRef.current.push({
          kind: "rock",
          x: W + 20,
          y: GROUND - TARZAN_GAME.obstacles.rock.height,
          width: TARZAN_GAME.obstacles.rock.width,
          height: TARZAN_GAME.obstacles.rock.height,
          passed: false,
        });
      }
    };

    const collides = (a: { x: number; y: number; width: number; height: number }, b: Obstacle) => {
      // Hitbox del corredor reducido un poco para que sea justo.
      const pad = 4;
      return (
        a.x + pad < b.x + b.width - pad &&
        a.x + a.width - pad > b.x + pad &&
        a.y + pad < b.y + b.height - pad &&
        a.y + a.height - pad > b.y + pad
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Cielo celeste degradado.
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
      sky.addColorStop(0, "#5fb8ff");
      sky.addColorStop(0.55, "#a8dcff");
      sky.addColorStop(1, "#d8f0ff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, GROUND);

      // Nubes parallax (lentas).
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      const cloudOffset = -(groundOffsetRef.current * 0.15) % 260;
      for (let i = 0; i < 5; i++) {
        const cx = cloudOffset + i * 260;
        const cy = 80 + (i % 2) * 50;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 30, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 26, cy + 4, 22, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 52, cy, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Silueta de selva al fondo (parallax medio).
      ctx.fillStyle = "rgba(31, 70, 40, 0.85)";
      const farOffset = -(groundOffsetRef.current * 0.3) % 160;
      for (let i = 0; i < 8; i++) {
        const x = farOffset + i * 160;
        ctx.beginPath();
        ctx.moveTo(x, GROUND - 110);
        ctx.lineTo(x + 40, GROUND - 180);
        ctx.lineTo(x + 80, GROUND - 110);
        ctx.closePath();
        ctx.fill();
      }

      // Silueta cercana (parallax rápido).
      ctx.fillStyle = "rgba(20, 50, 28, 0.95)";
      const nearOffset = -(groundOffsetRef.current * 0.55) % 110;
      for (let i = 0; i < 12; i++) {
        const x = nearOffset + i * 110;
        ctx.beginPath();
        ctx.moveTo(x, GROUND);
        ctx.lineTo(x + 22, GROUND - 70);
        ctx.lineTo(x + 44, GROUND);
        ctx.closePath();
        ctx.fill();
      }

      // Piso (suelo de tierra).
      ctx.fillStyle = "#6e4a2b";
      ctx.fillRect(0, GROUND, W, H - GROUND);
      // Líneas del piso para sensación de movimiento.
      ctx.strokeStyle = "#4a2f1a";
      ctx.lineWidth = 2;
      const stride = 70;
      const lineOffset = -groundOffsetRef.current % stride;
      ctx.beginPath();
      for (let i = -1; i < W / stride + 2; i++) {
        const x = lineOffset + i * stride;
        ctx.moveTo(x, GROUND + 12);
        ctx.lineTo(x + 36, GROUND + 12);
      }
      ctx.stroke();

      // Obstáculos.
      for (const ob of obstaclesRef.current) {
        if (ob.kind === "rock") {
          ctx.fillStyle = "#8a8580";
          ctx.beginPath();
          ctx.ellipse(
            ob.x + ob.width / 2,
            ob.y + ob.height / 2,
            ob.width / 2,
            ob.height / 2,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.strokeStyle = "#5a544f";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Branch: tronco horizontal con hojas.
          ctx.fillStyle = "#5a3a1f";
          ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
          ctx.fillStyle = "#7bb04a";
          ctx.beginPath();
          ctx.ellipse(ob.x + 10, ob.y + ob.height / 2, 14, 12, 0, 0, Math.PI * 2);
          ctx.ellipse(ob.x + ob.width - 10, ob.y + ob.height / 2, 14, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Corredor (placeholder).
      const r = runnerRef.current;
      const rw = TARZAN_GAME.runner.width;
      const rh = r.ducking && r.onGround
        ? TARZAN_GAME.runner.heightDuck
        : TARZAN_GAME.runner.heightRun;
      ctx.fillStyle = "#f4c97a";
      ctx.fillRect(TARZAN_GAME.runner.x, r.y, rw, rh);
      // Detalles mínimos: banda de taparrabos y "ojo".
      ctx.fillStyle = "#b04a2a";
      ctx.fillRect(TARZAN_GAME.runner.x, r.y + rh - 18, rw, 8);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(TARZAN_GAME.runner.x + rw - 12, r.y + 14, 5, 5);
    };

    const frame = (ts: number) => {
      if (!aliveRef.current) return;

      if (lastTsRef.current === 0) lastTsRef.current = ts;
      const dt = Math.min(48, ts - lastTsRef.current); // ms; cap a 48ms para evitar saltos enormes
      lastTsRef.current = ts;

      if (pausedRef.current) {
        // Redibuja sin avanzar.
        draw();
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      // Normalizamos a "frames" de 60Hz para que las tunables tengan sentido.
      const frames = dt / (1000 / 60);
      const seconds = dt / 1000;

      elapsedSecRef.current += seconds;

      // Acelerar velocidad.
      speedRef.current = Math.min(
        TARZAN_GAME.speed.max,
        speedRef.current + TARZAN_GAME.speed.accelPerSec * seconds,
      );

      // Reducir intervalo de spawn con el tiempo.
      spawnIntervalRef.current = Math.max(
        TARZAN_GAME.spawn.minIntervalFrames,
        spawnIntervalRef.current - TARZAN_GAME.spawn.intervalShrinkPerSec * seconds,
      );

      // Spawn de obstáculos.
      spawnTimerRef.current -= frames;
      if (spawnTimerRef.current <= 0) {
        spawnObstacle();
        // Jitter para que no sean perfectamente regulares.
        spawnTimerRef.current = spawnIntervalRef.current * (0.85 + Math.random() * 0.4);
      }

      // Física del corredor.
      const r = runnerRef.current;
      const runH = TARZAN_GAME.runner.heightRun;
      const duckH = TARZAN_GAME.runner.heightDuck;

      if (!r.onGround) {
        const grav =
          TARZAN_GAME.runner.gravity +
          (r.ducking ? TARZAN_GAME.runner.duckFallBoost : 0);
        r.vy += grav * frames;
        r.y += r.vy * frames;
        // Aterrizaje:
        const targetH = r.ducking ? duckH : runH;
        if (r.y + targetH >= TARZAN_GAME.world.groundY) {
          r.y = TARZAN_GAME.world.groundY - targetH;
          r.vy = 0;
          r.onGround = true;
        }
      } else {
        // Pegado al piso, asegurar y.
        const targetH = r.ducking ? duckH : runH;
        r.y = TARZAN_GAME.world.groundY - targetH;
      }

      // Mover obstáculos y suelo.
      const dx = speedRef.current * frames;
      groundOffsetRef.current += dx;
      const remaining: Obstacle[] = [];
      for (const ob of obstaclesRef.current) {
        ob.x -= dx;
        if (ob.x + ob.width < -10) continue; // fuera de pantalla
        remaining.push(ob);
      }
      obstaclesRef.current = remaining;

      // Hitbox del corredor.
      const rh = r.ducking && r.onGround ? duckH : runH;
      const runnerBox = {
        x: TARZAN_GAME.runner.x,
        y: r.y,
        width: TARZAN_GAME.runner.width,
        height: rh,
      };

      // Colisiones + bonus al pasar.
      for (const ob of obstaclesRef.current) {
        if (!ob.passed && ob.x + ob.width < TARZAN_GAME.runner.x) {
          ob.passed = true;
          scoreRef.current += TARZAN_GAME.scoring.obstacleClearedBonus;
        }
        if (collides(runnerBox, ob)) {
          aliveRef.current = false;
          draw();
          onGameOver(Math.round(scoreRef.current));
          return;
        }
      }

      // Score por supervivencia.
      const speedBonus = speedRef.current * TARZAN_GAME.scoring.speedMultiplier;
      scoreRef.current +=
        (TARZAN_GAME.scoring.pointsPerSec + speedBonus) * seconds;

      // Notificar a React cada ~6 frames.
      scoreEmitTickRef.current += 1;
      if (scoreEmitTickRef.current >= 6) {
        scoreEmitTickRef.current = 0;
        onScoreChange?.(Math.round(scoreRef.current));
      }

      draw();
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      aliveRef.current = false;
    };
    // We intentionally run this effect once — the loop is driven by refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Teclado: espacio/flecha arriba = saltar, flecha abajo = agacharse.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        doJump();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        doSetDuck(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        doSetDuck(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [doJump, doSetDuck]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{
        aspectRatio: "1 / 1",
        maxWidth: 520,
        margin: "0 auto",
        borderRadius: 16,
        background: "linear-gradient(180deg, #7ecbff 0%, #b8e5ff 60%, #d8f0ff 100%)",
        display: "block",
        touchAction: "none",
      }}
    />
  );
}
