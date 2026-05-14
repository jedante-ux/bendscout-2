"use client";

import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { TARZAN_GAME } from "@/lib/games/runner/tarzan";

type ObstacleKind = "snake" | "branch";

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
  /** Vidas máximas. Default 3. Cada colisión gasta una con ~1.3s de invulnerabilidad. */
  maxLives?: number;
  onScoreChange?: (score: number) => void;
  /** Se llama cada vez que el jugador pierde una vida (livesUsed = nuevas usadas). */
  onLivesChange?: (livesUsed: number) => void;
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
  maxLives = 3,
  onScoreChange,
  onLivesChange,
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
  const livesUsedRef = useRef(0);
  const invincibleUntilRef = useRef(0); // performance.now() ms hasta el cual el corredor es invulnerable

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
      // Si estaba agachado, r.y está en la posición baja (groundY - heightDuck);
      // si aplicamos el impulso desde ahí, el chequeo de aterrizaje (que ya
      // usa heightRun porque ducking=false) lo come en 1 frame. Restauramos
      // a la posición de corriendo antes de saltar.
      if (r.ducking) {
        r.y = TARZAN_GAME.world.groundY - TARZAN_GAME.runner.heightRun;
        r.ducking = false;
      }
      r.vy = TARZAN_GAME.runner.jumpImpulse;
      r.onGround = false;
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

    // Preload del sprite del personaje. El loop renderiza rect placeholder
    // hasta que `tarzanImgLoaded` sea true. Al cargar, computamos el
    // bounding box opaco (alpha > umbral) para recortar el excedente
    // transparente — así la hitbox coincide con el personaje real.
    // Helper genérico: calcula el bounding box opaco de una imagen y aplica
    // insets opcionales (en px del sprite original). Devuelve {sx,sy,sw,sh}
    // listos para pasar a drawImage(img, sx, sy, sw, sh, ...).
    const computeAlphaCrop = (
      img: HTMLImageElement,
      inset: { top: number; bottom: number; front: number; back: number } = {
        top: 0,
        bottom: 0,
        front: 0,
        back: 0,
      },
    ): { sx: number; sy: number; sw: number; sh: number } => {
      const iw = img.width;
      const ih = img.height;
      let bounds = { sx: 0, sy: 0, sw: iw, sh: ih };
      const off = document.createElement("canvas");
      off.width = iw;
      off.height = ih;
      const octx = off.getContext("2d");
      if (!octx) return bounds;
      octx.drawImage(img, 0, 0);
      try {
        const data = octx.getImageData(0, 0, iw, ih).data;
        let minX = iw;
        let minY = ih;
        let maxX = -1;
        let maxY = -1;
        const alphaThreshold = 16;
        for (let y = 0; y < ih; y++) {
          for (let x = 0; x < iw; x++) {
            const a = data[(y * iw + x) * 4 + 3];
            if (a > alphaThreshold) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX >= 0 && maxY >= 0) {
          const sx = Math.max(0, minX + inset.back);
          const sy = Math.max(0, minY + inset.top);
          const ex = Math.min(iw, maxX + 1 - inset.front);
          const ey = Math.min(ih, maxY + 1 - inset.bottom);
          bounds = {
            sx,
            sy,
            sw: Math.max(1, ex - sx),
            sh: Math.max(1, ey - sy),
          };
        }
      } catch {
        /* CORS u otro fallo: deja la imagen entera */
      }
      return bounds;
    };

    const tarzanImg = new window.Image();
    tarzanImg.src = "/icons/scout-corre-1.png";
    let tarzanImgLoaded = false;
    let tarzanCrop = { sx: 0, sy: 0, sw: 1, sh: 1, aspect: 1 };
    tarzanImg.onload = () => {
      const b = computeAlphaCrop(tarzanImg, TARZAN_GAME.runner.spriteInset);
      tarzanCrop = { ...b, aspect: b.sw / b.sh };
      tarzanImgLoaded = true;
    };

    // Sprite "dash" — se usa al agacharse. La hitbox sigue siendo más baja
    // (heightDuck) pero el sprite se dibuja al MISMO alto que corriendo
    // para no distorsionarlo; el aspect-ratio del crop define el ancho.
    const dashImg = new window.Image();
    dashImg.src = "/icons/dash.png";
    let dashImgLoaded = false;
    let dashCrop = { sx: 0, sy: 0, sw: 1, sh: 1, aspect: 2 };
    dashImg.onload = () => {
      const b = computeAlphaCrop(dashImg);
      dashCrop = { ...b, aspect: b.sw / b.sh };
      dashImgLoaded = true;
    };

    // Culebra: obstáculo de suelo, hay que SALTAR.
    const snakeImg = new window.Image();
    snakeImg.src = "/icons/culebra.png";
    let snakeImgLoaded = false;
    let snakeCrop = { sx: 0, sy: 0, sw: 1, sh: 1, aspect: 2 };
    snakeImg.onload = () => {
      const b = computeAlphaCrop(snakeImg);
      snakeCrop = { ...b, aspect: b.sw / b.sh };
      snakeImgLoaded = true;
    };

    // Pájaro: obstáculo alto (sustituye a "branch"). Recortado al alpha
    // como los demás sprites; aspect ratio se conserva al dibujar.
    const birdImg = new window.Image();
    birdImg.src = "/icons/pajaro.png";
    let birdImgLoaded = false;
    let birdCrop = { sx: 0, sy: 0, sw: 1, sh: 1, aspect: 3 };
    birdImg.onload = () => {
      const b = computeAlphaCrop(birdImg);
      birdCrop = { ...b, aspect: b.sw / b.sh };
      birdImgLoaded = true;
    };

    // Nubes: dos sprites alternados para el parallax del cielo.
    const cloud1 = new window.Image();
    cloud1.src = "/icons/nube1.png";
    let cloud1Loaded = false;
    cloud1.onload = () => {
      cloud1Loaded = true;
    };
    const cloud2 = new window.Image();
    cloud2.src = "/icons/nube2.png";
    let cloud2Loaded = false;
    cloud2.onload = () => {
      cloud2Loaded = true;
    };

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
    livesUsedRef.current = 0;
    invincibleUntilRef.current = 0;
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
        // Culebra en el suelo. El alto manda; el ancho sale del aspect del
        // sprite recortado para no deformar la imagen. Si el sprite no
        // cargó todavía, asumimos ~2:1 como fallback.
        const sh = TARZAN_GAME.obstacles.snake.height;
        const aspect = snakeImgLoaded ? snakeCrop.aspect : 2;
        const sw = sh * aspect;
        obstaclesRef.current.push({
          kind: "snake",
          x: W + 20,
          y: GROUND - sh,
          width: sw,
          height: sh,
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

      // Nubes parallax (lentas). Usa los sprites nube1/nube2 alternados;
      // si aún no cargaron, cae a unas elipses suaves.
      const cloudSpacing = 260;
      const cloudOffset = -(groundOffsetRef.current * 0.15) % cloudSpacing;
      const cloudCount = Math.ceil(W / cloudSpacing) + 2;
      for (let i = 0; i < cloudCount; i++) {
        const cx = cloudOffset + i * cloudSpacing;
        const cy = 60 + (i % 2) * 40;
        const useFirst = i % 2 === 0;
        const img = useFirst ? cloud1 : cloud2;
        const loaded = useFirst ? cloud1Loaded : cloud2Loaded;
        if (loaded && img.naturalWidth > 0) {
          // Tamaño objetivo: 140px ancho, mantiene aspect ratio.
          const targetW = useFirst ? 150 : 130;
          const aspect = img.naturalHeight / img.naturalWidth;
          const targetH = targetW * aspect;
          ctx.drawImage(img, cx, cy, targetW, targetH);
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.beginPath();
          ctx.ellipse(cx + 40, cy + 20, 32, 14, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + 70, cy + 24, 24, 12, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + 100, cy + 20, 30, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        }
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
        if (ob.kind === "snake") {
          if (snakeImgLoaded) {
            ctx.drawImage(
              snakeImg,
              snakeCrop.sx,
              snakeCrop.sy,
              snakeCrop.sw,
              snakeCrop.sh,
              ob.x,
              ob.y,
              ob.width,
              ob.height,
            );
          } else {
            // Fallback verde antes de que cargue.
            ctx.fillStyle = "#5da13a";
            ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
          }
        } else {
          // Pájaro: obstáculo alto. La hitbox del branch es delgada (32px)
          // pero el sprite se renderiza más alto y centrado para que se vea
          // bien sin afectar la colisión (la hitbox sigue siendo ob.* tal cual).
          if (birdImgLoaded) {
            const drawH = ob.height * 1.9; // ~60px visible
            const drawW = drawH * birdCrop.aspect;
            const drawX = ob.x + (ob.width - drawW) / 2;
            // Centrado verticalmente en la hitbox del branch.
            const drawY = ob.y + (ob.height - drawH) / 2;
            ctx.drawImage(
              birdImg,
              birdCrop.sx,
              birdCrop.sy,
              birdCrop.sw,
              birdCrop.sh,
              drawX,
              drawY,
              drawW,
              drawH,
            );
          } else {
            // Fallback marrón hasta que cargue.
            ctx.fillStyle = "#5a3a1f";
            ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
          }
        }
      }

      // Corredor.
      const r = runnerRef.current;
      const rw = TARZAN_GAME.runner.width;
      const rh = r.ducking && r.onGround
        ? TARZAN_GAME.runner.heightDuck
        : TARZAN_GAME.runner.heightRun;
      const rx = TARZAN_GAME.runner.x;

      // Flicker durante invulnerabilidad (~12Hz).
      const isInvincibleNow =
        performance.now() < invincibleUntilRef.current;
      const flickerOn =
        !isInvincibleNow || Math.floor(performance.now() / 80) % 2 === 0;

      // Selección de sprite: al agacharse usa "dash". La hitbox (rh) ya es
      // más baja cuando r.ducking && r.onGround, pero el sprite se dibuja
      // proporcional al personaje normal — sólo un pelín más bajo al dash
      // para sugerir que se está agachando.
      const useDash = r.ducking;
      const activeImg = useDash ? dashImg : tarzanImg;
      const activeLoaded = useDash ? dashImgLoaded : tarzanImgLoaded;
      const activeCrop = useDash ? dashCrop : tarzanCrop;

      // Dash: 88% del alto de corriendo (sin distorsión: el ancho se
      // recalcula con el aspect-ratio propio del sprite dash).
      const drawH = useDash
        ? TARZAN_GAME.runner.heightRun * 0.88
        : TARZAN_GAME.runner.heightRun;
      const drawW = activeLoaded ? drawH * activeCrop.aspect : rw;
      const drawX = rx + (rw - drawW) / 2;
      // Anclar el sprite por su BOTTOM al fondo de la hitbox (r.y + rh)
      // para que (a) suba/baje con el salto físico (r.y cambia en el aire)
      // y (b) cuando el sprite es más alto que la hitbox (ej. dash), la
      // diferencia sobresalga HACIA ARRIBA sin despegar los pies del suelo.
      const drawY = r.y + rh - drawH;

      // Sombra primero (bajo el personaje).
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(
        drawX + drawW / 2,
        TARZAN_GAME.world.groundY + 4,
        drawW * 0.45,
        6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      if (flickerOn) {
        if (activeLoaded) {
          ctx.save();
          if (isInvincibleNow) ctx.globalAlpha = 0.6;
          ctx.drawImage(
            activeImg,
            activeCrop.sx,
            activeCrop.sy,
            activeCrop.sw,
            activeCrop.sh,
            drawX,
            drawY,
            drawW,
            drawH,
          );
          ctx.restore();
        } else {
          // Placeholder hasta que cargue.
          ctx.fillStyle = "#f4c97a";
          ctx.fillRect(rx, r.y, rw, rh);
          ctx.fillStyle = "#b04a2a";
          ctx.fillRect(rx, r.y + rh - 18, rw, 8);
        }
      }
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
        // Jitter amplio para que el patrón se sienta aleatorio real.
        spawnTimerRef.current =
          spawnIntervalRef.current * (0.65 + Math.random() * 0.75);
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

      // Hitbox del corredor: usa el ancho REAL del sprite recortado (sin el
      // excedente transparente alrededor) para que las colisiones se sientan
      // justas. Si el sprite aún no cargó, fallback al runner.width.
      const rh = r.ducking && r.onGround ? duckH : runH;
      const boxW = tarzanImgLoaded
        ? rh * tarzanCrop.aspect
        : TARZAN_GAME.runner.width;
      const boxX =
        TARZAN_GAME.runner.x + (TARZAN_GAME.runner.width - boxW) / 2;
      const runnerBox = {
        x: boxX,
        y: r.y,
        width: boxW,
        height: rh,
      };

      // Colisiones + bonus al pasar.
      const nowMs = ts;
      const invincible = nowMs < invincibleUntilRef.current;
      for (const ob of obstaclesRef.current) {
        if (!ob.passed && ob.x + ob.width < TARZAN_GAME.runner.x) {
          ob.passed = true;
          scoreRef.current += TARZAN_GAME.scoring.obstacleClearedBonus;
        }
        if (!invincible && collides(runnerBox, ob)) {
          livesUsedRef.current += 1;
          onLivesChange?.(livesUsedRef.current);
          // Marcar el obstáculo como "ya cobrado" para no doblar daño.
          ob.passed = true;
          if (livesUsedRef.current >= maxLives) {
            aliveRef.current = false;
            draw();
            onGameOver(Math.round(scoreRef.current));
            return;
          }
          // Invulnerabilidad ~1.2s y un pequeño rebote.
          invincibleUntilRef.current = nowMs + 1200;
          if (r.onGround) {
            r.vy = -10;
            r.onGround = false;
          }
          break;
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
