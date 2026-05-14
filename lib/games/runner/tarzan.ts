// Tunables del runner "Pista de Tarzán". Todas las unidades son píxeles
// en el sistema de coordenadas LÓGICO del canvas (800 x 300). El canvas se
// escala con CSS a su contenedor; el motor trabaja siempre en este sistema.

export const TARZAN_GAME = {
  // Mundo
  world: {
    width: 800,
    height: 300,
    groundY: 250, // y del piso (los pies del corredor descansan acá)
  },

  // Corredor
  runner: {
    x: 110,
    width: 44,
    heightRun: 68,
    heightDuck: 40,
    gravity: 0.7,        // px/frame²
    jumpImpulse: -14.5,  // px/frame (negativo = arriba)
    duckFallBoost: 0.9,  // gravedad extra al estar agachado en el aire
  },

  // Obstáculos: piedra (suelo, hay que SALTAR) y rama (alta, hay que AGACHARSE).
  obstacles: {
    rock: { width: 36, height: 38 },
    branch: {
      width: 80,
      height: 24,
      // y del TOP del branch — pasa por encima del corredor parado pero
      // por debajo del corredor agachado.
      topY: 162,
    },
  },

  // Spawner
  spawn: {
    initialIntervalFrames: 95, // ~1.6s a 60fps
    minIntervalFrames: 38,     // ~0.63s — no más rápido que esto
    intervalShrinkPerSec: 1.8, // cada segundo, el intervalo baja 1.8 frames
    branchProbability: 0.4,    // chance de que el obstáculo sea rama (vs piedra)
  },

  // Velocidad
  speed: {
    initial: 6.0,         // px/frame
    max: 14.0,            // tope
    accelPerSec: 0.18,    // cuánto sube la velocidad por segundo
  },

  // Puntaje
  scoring: {
    pointsPerSec: 12,           // base de puntos por segundo de supervivencia
    speedMultiplier: 0.18,      // bonus extra por velocidad (puntos/seg × speed)
    obstacleClearedBonus: 25,   // bonus al librar un obstáculo
  },
} as const;

export type TarzanConfig = typeof TARZAN_GAME;
