export interface CompassHeading {
  /** Rumbo cardinal o intercardinal. */
  name: string;
  /** Ángulo en grados (0 = Norte, 90 = Este, etc.). */
  degrees: number;
  /** Sigla scout. */
  short: string;
}

/**
 * 8 rumbos del rosa de los vientos. El juego elige uno aleatorio y el
 * jugador rota la flecha de la brújula al ángulo correspondiente.
 */
export const COMPASS_HEADINGS: CompassHeading[] = [
  { name: "Norte",     short: "N",  degrees: 0   },
  { name: "Noreste",   short: "NE", degrees: 45  },
  { name: "Este",      short: "E",  degrees: 90  },
  { name: "Sureste",   short: "SE", degrees: 135 },
  { name: "Sur",       short: "S",  degrees: 180 },
  { name: "Suroeste",  short: "SO", degrees: 225 },
  { name: "Oeste",     short: "O",  degrees: 270 },
  { name: "Noroeste",  short: "NO", degrees: 315 },
];

/** Normaliza un ángulo a [0, 360). */
export function normalize(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Diferencia angular mínima entre dos ángulos en [0, 180]. */
export function angularDiff(a: number, b: number): number {
  const d = Math.abs(normalize(a) - normalize(b));
  return Math.min(d, 360 - d);
}
