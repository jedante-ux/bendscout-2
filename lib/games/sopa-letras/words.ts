/**
 * Vocabulario scout para la sopa de letras. El generador del juego
 * elige 4-5 palabras al azar por ronda y las coloca en una grilla 9×9
 * en direcciones aleatorias (horizontal, vertical, diagonal).
 */
export const SCOUT_WORDS: string[] = [
  "NUDO",
  "SCOUT",
  "FOGATA",
  "PATRULLA",
  "BRUJULA",
  "INSIGNIA",
  "PROMESA",
  "TROPA",
  "LOBATO",
  "MOCHILA",
  "SENDA",
  "MAPA",
  "TIENDA",
  "BANDERA",
  "JAMBOREE",
  "AVENTURA",
  "RASTREO",
  "GUIA",
  "LEY",
  "CARPA",
  "PALO",
  "HACHA",
  "MORSE",
  "PISTA",
];

export const GRID_SIZE = 9;
export const WORDS_PER_ROUND = 4;

/** Letras de relleno con frecuencia razonable en español. */
const FILLER_LETTERS = "AABCDEEFGHIIJLMNNOOPRSTUVZ";

export function randomFillerLetter(): string {
  return FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)];
}
