export interface KnotCard {
  id: string;
  name: string;
  emoji: string;
  /** CSS color token (var(--c-*) or oklch). */
  color: string;
}

/**
 * 18 nudos y amarres scout. Cada uno aparece 2 veces como par en el
 * tablero 6×6 (36 cartas) del minijuego "Recordando nudos".
 */
export const KNOTS: KnotCard[] = [
  { id: "rizo-plano",         name: "Rizo plano",        emoji: "🪢", color: "var(--c-mint)"   },
  { id: "as-de-guia",         name: "As de guía",        emoji: "🪢", color: "var(--c-sky)"    },
  { id: "ballestrinque",      name: "Ballestrinque",     emoji: "⚓", color: "var(--c-gold)"   },
  { id: "vuelta-escota",      name: "Vuelta de escota",  emoji: "🪢", color: "var(--c-rose)"   },
  { id: "vuelta-braza",       name: "Vuelta de braza",   emoji: "🪵", color: "var(--c-purple)" },
  { id: "pescador",           name: "Pescador",          emoji: "🎣", color: "var(--c-mint)"   },
  { id: "ocho",               name: "Nudo de ocho",      emoji: "8️⃣", color: "var(--c-sky)"    },
  { id: "margarita",          name: "Margarita",         emoji: "🌼", color: "var(--c-orange)" },
  { id: "capuchino",          name: "Capuchino",         emoji: "🧗", color: "var(--c-gold)"   },
  { id: "lazo-corredizo",     name: "Lazo corredizo",    emoji: "🤠", color: "var(--c-rose)"   },
  { id: "amarre-cuadrado",    name: "Amarre cuadrado",   emoji: "🟦", color: "var(--c-sky)"    },
  { id: "amarre-diagonal",    name: "Amarre diagonal",   emoji: "🔺", color: "var(--c-purple)" },
  { id: "amarre-redondo",     name: "Amarre redondo",    emoji: "⭕", color: "var(--c-mint)"   },
  { id: "amarre-paralelo",    name: "Amarre paralelo",   emoji: "🟰", color: "var(--c-orange)" },
  { id: "amarre-tripode",     name: "Amarre trípode",    emoji: "🔱", color: "var(--c-gold)"   },
  { id: "doble-pescador",     name: "Doble pescador",    emoji: "🪝", color: "var(--c-rose)"   },
  { id: "presilla-alondra",   name: "Presilla de alondra", emoji: "🕊️", color: "var(--c-sky)"    },
  { id: "vuelta-mordida",     name: "Vuelta mordida",    emoji: "🪛", color: "var(--c-purple)" },
];
