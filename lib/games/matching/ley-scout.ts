import type { MatchingPair } from "@/components/games/matching-game";

/**
 * Ley Scout — 10 artículos divididos en 2 rondas de 5 parejas.
 * Estructura genérica: { id, left, right }. El mismo MatchingGame
 * acepta cualquier dataset con esta forma.
 */
export const LEY_SCOUT_ROUNDS: MatchingPair[][] = [
  [
    { id: "a1", left: "Cifra su honor en…", right: "ser digno de confianza" },
    { id: "a2", left: "Es leal con su…", right: "patria y sus líderes" },
    { id: "a3", left: "Es útil y…", right: "ayuda a los demás" },
    { id: "a4", left: "Es amigo de todos y…", right: "hermano de cada Scout" },
    { id: "a5", left: "Su trato siempre es…", right: "cortés y amable" },
  ],
  [
    { id: "a6", left: "Protege la naturaleza y…", right: "ama a los animales" },
    { id: "a7", left: "Obedece sin réplica y…", right: "no hace nada a medias" },
    { id: "a8", left: "Sonríe y canta en…", right: "sus dificultades" },
    { id: "a9", left: "Es trabajador y…", right: "respeta el bien ajeno" },
    { id: "a10", left: "Es limpio en…", right: "pensamientos y acciones" },
  ],
];
