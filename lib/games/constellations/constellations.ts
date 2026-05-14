export interface ConstellationStar {
  x: number;
  y: number;
  /** Tamaño relativo (1.0 = base). Estrellas brillantes ~1.6. */
  size?: number;
}

export interface Constellation {
  id: string;
  name: string;
  /** Aliases aceptados como respuesta correcta (case-insensitive). */
  aliases?: string[];
  /** Estrellas en coords normalizadas 0..100 (viewBox cuadrado). */
  stars: ConstellationStar[];
  /** Pares de índices de estrellas que se conectan con líneas. */
  lines: [number, number][];
  /** Pista breve mostrada cuando el usuario acierta. */
  hint?: string;
}

/**
 * 10 constelaciones visibles desde el hemisferio sur, dibujadas a partir
 * de coordenadas normalizadas. El componente las renderiza como SVG.
 */
export const CONSTELLATIONS: Constellation[] = [
  {
    id: "cruz-del-sur",
    name: "Cruz del Sur",
    aliases: ["crux"],
    stars: [
      { x: 50, y: 12, size: 1.5 },
      { x: 50, y: 88, size: 1.7 },
      { x: 18, y: 52 },
      { x: 82, y: 50 },
      { x: 58, y: 70 },
    ],
    lines: [
      [0, 1],
      [2, 3],
    ],
    hint: "Apunta al sur celeste.",
  },
  {
    id: "orion",
    name: "Orión",
    aliases: ["el cazador"],
    stars: [
      { x: 22, y: 20, size: 1.6 }, // Betelgeuse
      { x: 78, y: 22, size: 1.4 }, // Bellatrix
      { x: 38, y: 50 }, // belt
      { x: 50, y: 50 },
      { x: 62, y: 50 },
      { x: 25, y: 82, size: 1.5 }, // Rigel
      { x: 75, y: 80 }, // Saiph
      { x: 50, y: 70 }, // sword
    ],
    lines: [
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
      [3, 7],
    ],
    hint: "El cinturón con tres estrellas alineadas.",
  },
  {
    id: "osa-mayor",
    name: "Osa Mayor",
    aliases: ["el carro", "big dipper", "ursa major"],
    stars: [
      { x: 12, y: 60 },
      { x: 30, y: 50 },
      { x: 30, y: 72 },
      { x: 50, y: 68 },
      { x: 65, y: 55, size: 1.4 },
      { x: 80, y: 38 },
      { x: 92, y: 25 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
      [4, 5],
      [5, 6],
    ],
    hint: "La cacerola con mango más famosa del cielo.",
  },
  {
    id: "casiopea",
    name: "Casiopea",
    aliases: ["cassiopeia"],
    stars: [
      { x: 10, y: 60, size: 1.3 },
      { x: 30, y: 30 },
      { x: 50, y: 55, size: 1.4 },
      { x: 70, y: 28 },
      { x: 90, y: 58 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    hint: 'Forma una "W" o "M" según la rotación.',
  },
  {
    id: "escorpio",
    name: "Escorpio",
    aliases: ["escorpión", "scorpius"],
    stars: [
      { x: 88, y: 14 },
      { x: 78, y: 28 },
      { x: 65, y: 38, size: 1.5 }, // Antares
      { x: 50, y: 42 },
      { x: 36, y: 44 },
      { x: 24, y: 56 },
      { x: 18, y: 72 },
      { x: 26, y: 86 },
      { x: 42, y: 90 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
    ],
    hint: "Curva como un aguijón. Antares brilla en rojo.",
  },
  {
    id: "leo",
    name: "Leo",
    aliases: ["el león"],
    stars: [
      { x: 18, y: 72 },
      { x: 32, y: 80 },
      { x: 48, y: 70 },
      { x: 56, y: 52 },
      { x: 64, y: 32 },
      { x: 78, y: 22 },
      { x: 88, y: 14 },
      { x: 84, y: 70 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [2, 7],
    ],
    hint: 'La "hoz" invertida marca su cabeza.',
  },
  {
    id: "cisne",
    name: "Cisne",
    aliases: ["cygnus", "la cruz del norte"],
    stars: [
      { x: 50, y: 10, size: 1.4 },
      { x: 50, y: 90, size: 1.5 },
      { x: 18, y: 38 },
      { x: 82, y: 40 },
      { x: 50, y: 50 },
      { x: 50, y: 72 },
    ],
    lines: [
      [0, 4],
      [4, 5],
      [5, 1],
      [2, 4],
      [4, 3],
    ],
    hint: "Una cruz volando: alas extendidas en el cielo.",
  },
  {
    id: "sagitario",
    name: "Sagitario",
    aliases: ["la tetera", "sagittarius"],
    stars: [
      { x: 18, y: 58 },
      { x: 30, y: 45 },
      { x: 50, y: 32 },
      { x: 72, y: 42 },
      { x: 72, y: 28 },
      { x: 82, y: 60 },
      { x: 68, y: 75 },
      { x: 48, y: 78 },
      { x: 28, y: 72 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 0],
    ],
    hint: "Forma una tetera con tapa y asa.",
  },
  {
    id: "geminis",
    name: "Géminis",
    aliases: ["los gemelos", "gemini"],
    stars: [
      { x: 28, y: 14, size: 1.4 }, // Castor
      { x: 36, y: 35 },
      { x: 42, y: 56 },
      { x: 48, y: 82 },
      { x: 60, y: 16, size: 1.5 }, // Pollux
      { x: 64, y: 38 },
      { x: 70, y: 60 },
      { x: 78, y: 84 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [6, 7],
      [0, 4],
    ],
    hint: "Dos líneas paralelas: Cástor y Pólux.",
  },
  {
    id: "tauro",
    name: "Tauro",
    aliases: ["el toro", "taurus"],
    stars: [
      { x: 18, y: 80 },
      { x: 36, y: 50 },
      { x: 50, y: 38 },
      { x: 62, y: 50, size: 1.5 }, // Aldebarán
      { x: 80, y: 78 },
      { x: 30, y: 20 },
      { x: 70, y: 22 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [3, 6],
    ],
    hint: "Una V con Aldebarán en el ojo del toro.",
  },
];

export function getConstellation(id: string): Constellation | undefined {
  return CONSTELLATIONS.find((c) => c.id === id);
}
