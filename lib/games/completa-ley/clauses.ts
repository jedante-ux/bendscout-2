export interface LawClause {
  id: string;
  /** Frase con el marcador `___` donde va la palabra correcta. */
  prompt: string;
  /** Palabra correcta (mostrada en el feedback). */
  correct: string;
  /** Distractores plausibles (otras palabras del léxico scout). */
  distractors: string[];
  /** Número de artículo de la Ley Scout (1-10). */
  article: number;
}

/**
 * Variaciones de las 10 leyes scout, simplificadas para fill-in-the-blank.
 * Mezcla artículos clásicos chilenos + alguna línea más coloquial.
 */
export const LAW_CLAUSES: LawClause[] = [
  {
    id: "art1-verdad",
    article: 1,
    prompt: "El scout dice siempre la ___",
    correct: "verdad",
    distractors: ["promesa", "razón", "palabra"],
  },
  {
    id: "art2-deber",
    article: 2,
    prompt: "El scout cumple sus ___ como ciudadano",
    correct: "deberes",
    distractors: ["sueños", "amigos", "horarios"],
  },
  {
    id: "art3-servicial",
    article: 3,
    prompt: "El scout es generoso, cortés y ___",
    correct: "servicial",
    distractors: ["puntual", "valiente", "discreto"],
  },
  {
    id: "art4-hermano",
    article: 4,
    prompt: "El scout considera a todo otro scout como su ___",
    correct: "hermano",
    distractors: ["amigo", "colega", "rival"],
  },
  {
    id: "art5-naturaleza",
    article: 5,
    prompt: "El scout es amigo de la ___",
    correct: "naturaleza",
    distractors: ["aventura", "ciudad", "patrulla"],
  },
  {
    id: "art6-dificultades",
    article: 6,
    prompt: "El scout se sobrepone a las ___",
    correct: "dificultades",
    distractors: ["alegrías", "competencias", "distracciones"],
  },
  {
    id: "art7-salud",
    article: 7,
    prompt: "El scout cuida su ___",
    correct: "salud",
    distractors: ["mochila", "uniforme", "patrulla"],
  },
  {
    id: "art8-perseverante",
    article: 8,
    prompt: "El scout es trabajador y ___",
    correct: "perseverante",
    distractors: ["paciente", "ordenado", "puntual"],
  },
  {
    id: "art9-honesto",
    article: 9,
    prompt: "El scout es respetuoso con los demás y siempre ___",
    correct: "honesto",
    distractors: ["alegre", "valiente", "atento"],
  },
  {
    id: "art10-pensamiento",
    article: 10,
    prompt: "El scout es puro de pensamiento, palabra y ___",
    correct: "acción",
    distractors: ["intención", "memoria", "voluntad"],
  },
  {
    id: "art3-corte",
    article: 3,
    prompt: "El scout es ___, cortés y servicial",
    correct: "generoso",
    distractors: ["alegre", "valiente", "honesto"],
  },
  {
    id: "art6-alegre",
    article: 6,
    prompt: "El scout es responsable, ___ y se sobrepone a las dificultades",
    correct: "alegre",
    distractors: ["paciente", "tranquilo", "sereno"],
  },
];
