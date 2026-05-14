export interface TrackType {
  id: string;
  /** Nombre del animal/objetivo. */
  name: string;
  emoji: string;
  /** color token visual */
  color: string;
}

/**
 * Tipos de huellas/animales que aparecen en el grid. El juego rota
 * cuál es el "objetivo" cada pocos segundos. El resto actúan como
 * distractores.
 */
export const TRACK_TYPES: TrackType[] = [
  { id: "puma",      name: "Puma",     emoji: "🐾", color: "var(--c-gold)"   },
  { id: "lobo",      name: "Lobo",     emoji: "🐺", color: "var(--c-sky)"    },
  { id: "zorro",     name: "Zorro",    emoji: "🦊", color: "var(--c-orange)" },
  { id: "ciervo",    name: "Ciervo",   emoji: "🦌", color: "var(--c-mint)"   },
  { id: "aguila",    name: "Águila",   emoji: "🦅", color: "var(--c-rose)"   },
  { id: "oso",       name: "Oso",      emoji: "🐻", color: "var(--c-purple)" },
];
