/**
 * Posiciones del brazo del señalero, desde la perspectiva del observador
 * (la figura está de frente). Cada posición describe a qué ángulo apunta
 * el brazo respecto al cuerpo:
 *
 *  - "down" : pegado al cuerpo (45° abajo)
 *  - "low"  : 45° por debajo de horizontal hacia afuera
 *  - "side" : horizontal (90° hacia afuera)
 *  - "high" : 45° por encima de horizontal
 *  - "up"   : vertical hacia arriba
 *
 * Para el brazo IZQUIERDO de la figura (lado izquierdo del observador),
 * "low/side/high" significa hacia la izquierda. Para el brazo DERECHO,
 * hacia la derecha. "up" y "down" son simétricos.
 */
export type ArmPosition = "down" | "low" | "side" | "high" | "up";

export interface SemaphoreLetter {
  /** Letra mayúscula. */
  letter: string;
  /** Posición del brazo izquierdo de la figura (lado observador-izquierdo). */
  left: ArmPosition;
  /** Posición del brazo derecho de la figura (lado observador-derecho). */
  right: ArmPosition;
}

/**
 * 15 letras con posiciones "limpias" del alfabeto semáforo scout. Algunas
 * letras (E,F,G) son la reflexión de A,B,C — útiles para enseñar la regla
 * de los círculos del señalero.
 */
export const SEMAPHORE_LETTERS: SemaphoreLetter[] = [
  { letter: "A", left: "down", right: "low" },
  { letter: "B", left: "down", right: "side" },
  { letter: "C", left: "down", right: "high" },
  { letter: "D", left: "down", right: "up" },
  { letter: "E", left: "high", right: "down" },
  { letter: "F", left: "side", right: "down" },
  { letter: "G", left: "low", right: "down" },
  { letter: "H", left: "low", right: "side" },
  { letter: "I", left: "low", right: "high" },
  { letter: "K", left: "side", right: "up" },
  { letter: "L", left: "side", right: "low" },
  { letter: "M", left: "high", right: "side" },
  { letter: "N", left: "high", right: "high" },
  { letter: "P", left: "high", right: "up" },
  { letter: "U", left: "up", right: "up" },
];

/** Devuelve el ángulo en grados (matemático, 0° = derecha, 90° = arriba)
 * para una posición de brazo del lado `side` del observador. */
export function armAngle(
  side: "left" | "right",
  position: ArmPosition,
): number {
  // 0° = brazo apunta hacia la derecha del observador
  // 90° = brazo apunta hacia arriba
  // 180° = brazo apunta a la izquierda del observador
  // -90° = brazo apunta hacia abajo
  if (position === "up") return 90;
  if (position === "down") return -90;
  // Para los lados, depende de qué brazo es:
  if (side === "right") {
    if (position === "side") return 0;
    if (position === "high") return 45;
    if (position === "low") return -45;
  } else {
    if (position === "side") return 180;
    if (position === "high") return 135;
    if (position === "low") return -135;
  }
  return -90;
}
