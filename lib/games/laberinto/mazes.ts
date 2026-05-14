/**
 * Cada laberinto es una grilla rectangular. Caracteres:
 *  - `#` muro
 *  - `.` camino abierto
 *  - `S` inicio (el jugador apoya el dedo aquí)
 *  - `E` salida
 *
 * El componente busca S y E al cargar el maze. Asegúrate de que existan
 * exactamente uno de cada.
 */
export interface MazeLayout {
  id: string;
  /** Etiqueta corta para el HUD. */
  label: string;
  rows: string[];
}

export const MAZES: MazeLayout[] = [
  {
    id: "claro",
    label: "Claro del bosque",
    rows: [
      "#########",
      "S.......#",
      "###.###.#",
      "#...#...#",
      "#.###.###",
      "#.....#.#",
      "#####.#.#",
      "#......E#",
      "#########",
    ],
  },
  {
    id: "rio",
    label: "Cruzar el río",
    rows: [
      "##########",
      "S....#...#",
      "####.#.#.#",
      "#..#.#.#.#",
      "#.##.#.#.#",
      "#......#.#",
      "######.#.#",
      "#......#.#",
      "#.####.#.#",
      "#........E",
      "##########",
    ],
  },
  {
    id: "cueva",
    label: "Cueva oscura",
    rows: [
      "#########",
      "#S....###",
      "###.#...#",
      "#...#.#.#",
      "#.###.#.#",
      "#.....#.#",
      "#####.#.#",
      "#.....#.#",
      "#.#####.#",
      "#......E#",
      "#########",
    ],
  },
  {
    id: "valle",
    label: "Valle de pinos",
    rows: [
      "###########",
      "S.#.......#",
      "#.#.#####.#",
      "#.#.#.....#",
      "#.#.#.###.#",
      "#.#.#.#.#.#",
      "#.#.#.#.#.#",
      "#...#...#.#",
      "###.#####.#",
      "#.........E",
      "###########",
    ],
  },
  {
    id: "cumbre",
    label: "Cumbre nevada",
    rows: [
      "##########",
      "S........#",
      "########.#",
      "#........#",
      "#.########",
      "#........#",
      "########.#",
      "#........#",
      "#.########",
      "#.......E#",
      "##########",
    ],
  },
  {
    id: "campamento",
    label: "Salida del campamento",
    rows: [
      "#########",
      "#S......#",
      "#.#####.#",
      "#.#...#.#",
      "#.#.#.#.#",
      "#.#.#.#.#",
      "#.#.#.#.#",
      "#...#...#",
      "#####.###",
      "#.......E",
      "#########",
    ],
  },
];

export interface ParsedMaze {
  id: string;
  label: string;
  rows: number;
  cols: number;
  /** true si la celda es transitable (no es muro). */
  open: boolean[][];
  start: { r: number; c: number };
  end: { r: number; c: number };
}

export function parseMaze(layout: MazeLayout): ParsedMaze {
  const rows = layout.rows.length;
  const cols = layout.rows[0].length;
  const open: boolean[][] = [];
  let start = { r: 0, c: 0 };
  let end = { r: 0, c: 0 };
  for (let r = 0; r < rows; r++) {
    const line = layout.rows[r];
    const arr: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      const ch = line[c];
      if (ch === "S") {
        start = { r, c };
        arr.push(true);
      } else if (ch === "E") {
        end = { r, c };
        arr.push(true);
      } else if (ch === ".") {
        arr.push(true);
      } else {
        arr.push(false);
      }
    }
    open.push(arr);
  }
  return { id: layout.id, label: layout.label, rows, cols, open, start, end };
}
