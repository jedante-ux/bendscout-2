export interface BotiquinItem {
  id: string;
  name: string;
  emoji: string;
  /** color token visual */
  color: string;
}

export interface BotiquinScenario {
  id: string;
  /** Síntoma o situación que ve el scout. */
  symptom: string;
  /** Emoji del "paciente" o situación. */
  patientEmoji: string;
  /** ID del ítem correcto del botiquín. */
  correctItemId: string;
  /** Pista corta para la pantalla de feedback. */
  hint?: string;
}

/**
 * Catálogo de ítems del botiquín scout. Se muestran 4 por ronda — el
 * correcto + 3 distractores aleatorios. Mantén el set en ~10 items para
 * que las opciones se mezclen bien.
 */
export const BOTIQUIN_ITEMS: BotiquinItem[] = [
  { id: "gasa",          name: "Gasa estéril",      emoji: "🩹", color: "var(--c-mint)"   },
  { id: "antiseptico",   name: "Antiséptico",       emoji: "🧴", color: "var(--c-sky)"    },
  { id: "hielo",         name: "Hielo",             emoji: "🧊", color: "var(--c-sky)"    },
  { id: "suero",         name: "Suero oral",        emoji: "🥤", color: "var(--c-orange)" },
  { id: "agua",          name: "Agua fría",         emoji: "💧", color: "var(--c-sky)"    },
  { id: "inmovilizador", name: "Inmovilizador",     emoji: "🦴", color: "var(--c-gold)"   },
  { id: "silbato",       name: "Silbato",           emoji: "📣", color: "var(--c-rose)"   },
  { id: "linterna",      name: "Linterna",          emoji: "🔦", color: "var(--c-gold)"   },
  { id: "manta",         name: "Manta térmica",     emoji: "🧣", color: "var(--c-purple)" },
  { id: "vendaje",       name: "Vendaje elástico",  emoji: "🧵", color: "var(--c-rose)"   },
];

export const BOTIQUIN_SCENARIOS: BotiquinScenario[] = [
  {
    id: "sangrado",
    symptom: "Corte profundo en el brazo con sangrado",
    patientEmoji: "🩸",
    correctItemId: "gasa",
    hint: "Presión directa con gasa estéril detiene el sangrado.",
  },
  {
    id: "esguince",
    symptom: "Tobillo hinchado tras una caída",
    patientEmoji: "🦶",
    correctItemId: "hielo",
    hint: "RICE: reposo, hielo, compresión, elevación.",
  },
  {
    id: "quemadura",
    symptom: "Quemadura leve con la olla del fogón",
    patientEmoji: "🔥",
    correctItemId: "agua",
    hint: "Agua fría por 10 minutos sobre la zona quemada.",
  },
  {
    id: "deshidratacion",
    symptom: "Mareo y boca seca tras larga caminata",
    patientEmoji: "🥵",
    correctItemId: "suero",
    hint: "Suero oral para reponer electrolitos.",
  },
  {
    id: "raspon",
    symptom: "Raspón sucio en la rodilla del cabro chico",
    patientEmoji: "🧒",
    correctItemId: "antiseptico",
    hint: "Limpia con antiséptico antes de cubrir.",
  },
  {
    id: "fractura",
    symptom: "Brazo doblado en ángulo raro tras golpe",
    patientEmoji: "🦴",
    correctItemId: "inmovilizador",
    hint: "Inmoviliza antes de mover al herido.",
  },
  {
    id: "perdido",
    symptom: "Scout perdido en bosque cercano",
    patientEmoji: "🌲",
    correctItemId: "silbato",
    hint: "Tres silbidos cortos = pedido de ayuda.",
  },
  {
    id: "noche",
    symptom: "Necesitas marcar el camino al campamento de noche",
    patientEmoji: "🌙",
    correctItemId: "linterna",
    hint: "Linterna en mano siempre apunta al suelo.",
  },
  {
    id: "hipotermia",
    symptom: "Compañera tirita sin parar tras la lluvia",
    patientEmoji: "🥶",
    correctItemId: "manta",
    hint: "Manta térmica conserva el calor corporal.",
  },
  {
    id: "torcedura",
    symptom: "Muñeca dolorida pero móvil",
    patientEmoji: "✋",
    correctItemId: "vendaje",
    hint: "Vendaje elástico inmoviliza sin cortar circulación.",
  },
  {
    id: "ampolla",
    symptom: "Ampolla reventada en el talón",
    patientEmoji: "👣",
    correctItemId: "antiseptico",
    hint: "Antiséptico primero, gasa después.",
  },
  {
    id: "golpe-calor",
    symptom: "Cara roja y temperatura alta bajo el sol",
    patientEmoji: "☀️",
    correctItemId: "agua",
    hint: "Enfriar la piel con agua fresca, no helada.",
  },
];

export function getItem(id: string): BotiquinItem | undefined {
  return BOTIQUIN_ITEMS.find((i) => i.id === id);
}
