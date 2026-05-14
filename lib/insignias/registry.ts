import type { ScoutIconName } from "@/components/scout/icon";

export type InsigniaColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

export interface InsigniaDef {
  /** Stable identifier for lookups. */
  slug: string;
  /** Display title shown in the UI. */
  title: string;
  /** Short description — "para qué se gana". */
  description: string;
  /** Icon used when unlocked. */
  icon: ScoutIconName;
  /** Accent color for the badge. */
  color: InsigniaColor;
  /** Progress value required to unlock. */
  target: number;
}

/**
 * Static catalog of insignias for the MVP. Progress is computed on read
 * from `game_sessions` / `profiles` — see `lib/insignias/queries.ts`.
 */
export const INSIGNIAS: InsigniaDef[] = [
  {
    slug: "naturalista",
    title: "Naturalista",
    description: "Completa 10 partidas",
    icon: "leaf",
    color: "mint",
    target: 10,
  },
  {
    slug: "guardian",
    title: "Guardián",
    description: "Acumula 500 XP",
    icon: "shield",
    color: "rose",
    target: 500,
  },
  {
    slug: "pionero",
    title: "Pionero",
    description: "Alcanza nivel 3",
    icon: "starfill",
    color: "gold",
    target: 3,
  },
  {
    slug: "explorador",
    title: "Explorador",
    description: "Alcanza nivel 5",
    icon: "starfill",
    color: "purple",
    target: 5,
  },
  {
    slug: "llama-eterna",
    title: "Llama eterna",
    description: "Mantén 5 días de racha",
    icon: "flame",
    color: "orange",
    target: 5,
  },
  {
    slug: "cartografo",
    title: "Cartógrafo",
    description: "Juega 7 minijuegos distintos",
    icon: "map",
    color: "sky",
    target: 7,
  },
  {
    slug: "maestro-de-nudos",
    title: "Maestro de nudos",
    description: "Juega knot-rush 10 veces",
    icon: "knot",
    color: "teal",
    target: 10,
  },
  {
    slug: "campista",
    title: "Campista",
    description: "Completa 30 partidas",
    icon: "tent",
    color: "mint",
    target: 30,
  },
  {
    slug: "buen-samaritano",
    title: "Buen samaritano",
    description: "Juega first-response 5 veces",
    icon: "heart",
    color: "rose",
    target: 5,
  },
  {
    slug: "brujula",
    title: "Brújula",
    description: "Juega trail-signs 5 veces",
    icon: "compass",
    color: "purple",
    target: 5,
  },
  {
    slug: "top-3-semanal",
    title: "Top 3 semanal",
    description: "Termina top 3 del jamboree",
    icon: "trophy",
    color: "gold",
    target: 1,
  },
  {
    slug: "sabio-scout",
    title: "Sabio scout",
    description: "Acumula 5 000 XP",
    icon: "lightbulb",
    color: "sky",
    target: 5000,
  },
];

/** Lookup an insignia definition by slug. Returns `undefined` if not found. */
export function getInsignia(slug: string): InsigniaDef | undefined {
  return INSIGNIAS.find((i) => i.slug === slug);
}
