export interface KnotStep {
  id: string;
  /** Orden correcto (1-4). El componente baraja y pide ordenar. */
  order: number;
  text: string;
  emoji: string;
}

export interface KnotPuzzle {
  id: string;
  name: string;
  emoji: string;
  /** Para qué sirve — se muestra al acertar. */
  useCase: string;
  steps: KnotStep[];
}

/**
 * Puzzles de "ordena los pasos para hacer el nudo". Cada nudo tiene
 * exactamente 4 pasos. El componente baraja el orden y muestra los
 * pasos al jugador para reordenar.
 */
export const KNOT_PUZZLES: KnotPuzzle[] = [
  {
    id: "rizo-plano",
    name: "Rizo plano",
    emoji: "🪢",
    useCase: "Unir dos cabos del mismo grosor.",
    steps: [
      { id: "rizo-1", order: 1, emoji: "🤝", text: "Cruza el cabo derecho sobre el izquierdo" },
      { id: "rizo-2", order: 2, emoji: "↩️", text: "Pasa el cabo de abajo por debajo y arriba" },
      { id: "rizo-3", order: 3, emoji: "🤝", text: "Cruza ahora el izquierdo sobre el derecho" },
      { id: "rizo-4", order: 4, emoji: "✊", text: "Tira de los dos extremos para ajustar" },
    ],
  },
  {
    id: "as-de-guia",
    name: "As de guía",
    emoji: "🪢",
    useCase: "Hacer un lazo que no se corre — el rey de los nudos.",
    steps: [
      { id: "ag-1", order: 1, emoji: "🔄", text: "Haz un lazo pequeño con el cabo largo arriba" },
      { id: "ag-2", order: 2, emoji: "⬇️", text: "Pasa la punta del cabo corto por el lazo de abajo hacia arriba" },
      { id: "ag-3", order: 3, emoji: "🔁", text: "Rodea la base del cabo largo y vuelve a entrar al lazo" },
      { id: "ag-4", order: 4, emoji: "✊", text: "Aprieta sosteniendo el lazo y tirando de la base" },
    ],
  },
  {
    id: "ballestrinque",
    name: "Ballestrinque",
    emoji: "⚓",
    useCase: "Amarrar un cabo a un poste o tronco.",
    steps: [
      { id: "ba-1", order: 1, emoji: "🪵", text: "Pasa el cabo alrededor del poste" },
      { id: "ba-2", order: 2, emoji: "✖️", text: "Crúzalo sobre sí mismo formando una X" },
      { id: "ba-3", order: 3, emoji: "🔁", text: "Da una segunda vuelta al poste" },
      { id: "ba-4", order: 4, emoji: "⬇️", text: "Mete la punta bajo la última vuelta y aprieta" },
    ],
  },
  {
    id: "vuelta-escota",
    name: "Vuelta de escota",
    emoji: "🪢",
    useCase: "Unir dos cabos de distinto grosor.",
    steps: [
      { id: "ve-1", order: 1, emoji: "🔄", text: "Forma un bucle con el cabo más grueso" },
      { id: "ve-2", order: 2, emoji: "⬇️", text: "Pasa el cabo delgado de abajo hacia arriba por el bucle" },
      { id: "ve-3", order: 3, emoji: "🔁", text: "Rodea el bucle por detrás" },
      { id: "ve-4", order: 4, emoji: "✊", text: "Mete el delgado bajo sí mismo y aprieta" },
    ],
  },
  {
    id: "ocho",
    name: "Nudo de ocho",
    emoji: "8️⃣",
    useCase: "Tope al final del cabo para que no escape.",
    steps: [
      { id: "oc-1", order: 1, emoji: "🔄", text: "Haz un bucle dejando la punta arriba" },
      { id: "oc-2", order: 2, emoji: "🔁", text: "Lleva la punta por detrás del cabo principal" },
      { id: "oc-3", order: 3, emoji: "⬇️", text: "Pasa la punta por el bucle desde arriba" },
      { id: "oc-4", order: 4, emoji: "✊", text: "Aprieta — debería verse como un 8" },
    ],
  },
  {
    id: "pescador",
    name: "Pescador",
    emoji: "🎣",
    useCase: "Unir dos cabos delgados o de hilo de pesca.",
    steps: [
      { id: "pe-1", order: 1, emoji: "📍", text: "Pon los dos cabos paralelos en direcciones opuestas" },
      { id: "pe-2", order: 2, emoji: "🪢", text: "Haz un nudo simple con un cabo alrededor del otro" },
      { id: "pe-3", order: 3, emoji: "🪢", text: "Haz otro nudo simple con el segundo cabo alrededor del primero" },
      { id: "pe-4", order: 4, emoji: "✊", text: "Tira de las puntas para que los nudos se junten" },
    ],
  },
];
