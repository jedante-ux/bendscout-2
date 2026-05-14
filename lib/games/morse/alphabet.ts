/**
 * Tabla de código Morse internacional. `.` = punto (di), `-` = raya (dah).
 * Sólo letras A-Z. Para la mezcla del juego excluimos pares ambiguos.
 */
export interface MorseLetter {
  letter: string;
  /** Patrón "." y "-". */
  code: string;
}

export const MORSE_ALPHABET: MorseLetter[] = [
  { letter: "A", code: ".-" },
  { letter: "B", code: "-..." },
  { letter: "C", code: "-.-." },
  { letter: "D", code: "-.." },
  { letter: "E", code: "." },
  { letter: "F", code: "..-." },
  { letter: "G", code: "--." },
  { letter: "H", code: "...." },
  { letter: "I", code: ".." },
  { letter: "J", code: ".---" },
  { letter: "K", code: "-.-" },
  { letter: "L", code: ".-.." },
  { letter: "M", code: "--" },
  { letter: "N", code: "-." },
  { letter: "O", code: "---" },
  { letter: "P", code: ".--." },
  { letter: "Q", code: "--.-" },
  { letter: "R", code: ".-." },
  { letter: "S", code: "..." },
  { letter: "T", code: "-" },
  { letter: "U", code: "..-" },
  { letter: "V", code: "...-" },
  { letter: "W", code: ".--" },
  { letter: "X", code: "-..-" },
  { letter: "Y", code: "-.--" },
  { letter: "Z", code: "--.." },
];

/** Mezcla más educativa: letras con patrones cortos y distinguibles. */
export const MORSE_TEACHING_POOL: MorseLetter[] = MORSE_ALPHABET.filter(
  (l) => l.code.length <= 4,
);
