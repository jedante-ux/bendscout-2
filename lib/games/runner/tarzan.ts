// Tunables del runner "Pista de Tarzán". Todas las unidades son píxeles
// en el sistema de coordenadas LÓGICO del canvas (600 x 600, ratio 1:1).
// El canvas se escala con CSS al contenedor; el motor trabaja siempre en
// este sistema lógico.

export const TARZAN_GAME = {
  // Mundo
  world: {
    width: 600,
    height: 600,
    groundY: 460, // y del piso (los pies del corredor descansan acá)
  },

  // Corredor
  runner: {
    x: 100,
    width: 60,
    heightRun: 110,
    heightDuck: 65,
    gravity: 0.85,       // px/frame²
    jumpImpulse: -17,    // px/frame (negativo = arriba)
    duckFallBoost: 1.1,  // gravedad extra al estar agachado en el aire
  },

  // Obstáculos: piedra (suelo, hay que SALTAR) y rama (alta, hay que AGACHARSE).
  obstacles: {
    rock: { width: 52, height: 54 },
    branch: {
      width: 130,
      height: 32,
      // y del TOP del branch — pasa por encima del corredor parado pero
      // por debajo del corredor agachado.
      // Corredor parado: top y = 460 - 110 = 350.
      // Corredor agachado: top y = 460 - 65 = 395.
      // branch [360, 392] choca con parado y libra al agachado.
      topY: 360,
    },
  },

  // Spawner
  spawn: {
    initialIntervalFrames: 130, // ~2.16s a 60fps — arranque calmado
    minIntervalFrames: 45,      // ~0.75s — tope de dificultad
    intervalShrinkPerSec: 2.2,  // cada segundo, el intervalo baja N frames
    branchProbability: 0.4,     // chance de que el obstáculo sea rama (vs piedra)
  },

  // Velocidad
  speed: {
    initial: 6.0,
    max: 14.0,
    accelPerSec: 0.22,
  },

  // Puntaje
  scoring: {
    pointsPerSec: 12,
    speedMultiplier: 0.18,
    obstacleClearedBonus: 25,
  },
} as const;

export type TarzanConfig = typeof TARZAN_GAME;
