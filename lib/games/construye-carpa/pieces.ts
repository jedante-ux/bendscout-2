/**
 * Piezas y slots para "Construye la Carpa". El jugador debe arrastrar
 * cada pieza al slot correcto, EN ORDEN. Cada pieza tiene un orden
 * obligatorio (1-5). Si el jugador suelta una pieza en el slot equivocado
 * o fuera de orden, cuenta como error.
 */
export interface CarpaPiece {
  id: string;
  /** Orden obligatorio en que se debe armar (1 = primero). */
  order: number;
  name: string;
  emoji: string;
  hint: string;
  /** Slot id donde debe ir esta pieza. */
  slotId: string;
}

export interface CarpaSlot {
  id: string;
  /** Posición en el SVG normalizado 0..100. */
  cx: number;
  cy: number;
  /** Radio del área de drop. */
  radius: number;
  /** Etiqueta que se muestra al colocar. */
  label: string;
}

export const CARPA_PIECES: CarpaPiece[] = [
  {
    id: "estaca1",
    order: 1,
    name: "Estaca delantera",
    emoji: "📌",
    hint: "Primero las estacas — el ancla de la carpa.",
    slotId: "slot-estaca1",
  },
  {
    id: "estaca2",
    order: 2,
    name: "Estaca trasera",
    emoji: "📌",
    hint: "Una al frente, una atrás. Que quede tensa.",
    slotId: "slot-estaca2",
  },
  {
    id: "palo1",
    order: 3,
    name: "Palo principal",
    emoji: "🪵",
    hint: "El palo levanta toda la carpa.",
    slotId: "slot-palo",
  },
  {
    id: "lona",
    order: 4,
    name: "Lona",
    emoji: "🟫",
    hint: "Cubre todo con la lona impermeable.",
    slotId: "slot-lona",
  },
  {
    id: "tensores",
    order: 5,
    name: "Tensores",
    emoji: "🪢",
    hint: "Tensa los cabos para resistir el viento.",
    slotId: "slot-tensores",
  },
];

export const CARPA_SLOTS: CarpaSlot[] = [
  { id: "slot-estaca1", cx: 22, cy: 78, radius: 9, label: "Estaca ↑" },
  { id: "slot-estaca2", cx: 78, cy: 78, radius: 9, label: "Estaca ↑" },
  { id: "slot-palo",    cx: 50, cy: 30, radius: 11, label: "Palo central" },
  { id: "slot-lona",    cx: 50, cy: 55, radius: 16, label: "Lona" },
  { id: "slot-tensores", cx: 50, cy: 85, radius: 9, label: "Tensores" },
];
