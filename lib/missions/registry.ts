import type { ScoutIconName } from "@/components/scout/icon";

export type MissionKind = "individual" | "team";

export type MissionColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

export interface MissionDef {
  slug: string;
  title: string;
  description: string;
  icon: ScoutIconName;
  color: MissionColor;
  /** Valor (count, pts, racha, …) que debe alcanzar `progress`. */
  target: number;
  /** XP que se otorga al completar (no implementado todavía — informativo). */
  xpReward: number;
  kind: MissionKind;
  /** Cómo se mide el progreso — para mostrar % o "N/M" en la UI. */
  metric: "count" | "percent" | "points";
}

export const MISSIONS: MissionDef[] = [
  {
    slug: "explorador-digital",
    title: "Explorador Digital",
    description: "Completa 5 partidas puntuables",
    icon: "leaf",
    color: "mint",
    target: 5,
    xpReward: 150,
    kind: "individual",
    metric: "count",
  },
  {
    slug: "coleccionista",
    title: "Coleccionista",
    description: "Juega 3 minijuegos distintos",
    icon: "shield",
    color: "rose",
    target: 3,
    xpReward: 100,
    kind: "individual",
    metric: "count",
  },
  {
    slug: "racha-ganadora",
    title: "Racha Ganadora",
    description: "Alcanza 7 días de racha",
    icon: "flame",
    color: "orange",
    target: 7,
    xpReward: 200,
    kind: "individual",
    metric: "count",
  },
  {
    slug: "veterano",
    title: "Veterano",
    description: "Acumula 1000 XP",
    icon: "trophy",
    color: "gold",
    target: 1000,
    xpReward: 250,
    kind: "individual",
    metric: "points",
  },
  // ----- Team -----
  {
    slug: "aullido-coordinado",
    title: "Aullido coordinado",
    description: "Todos los miembros de tu patrulla juegan hoy",
    icon: "users",
    color: "mint",
    target: 100,
    xpReward: 500,
    kind: "team",
    metric: "percent",
  },
  {
    slug: "patrulla-en-racha",
    title: "Patrulla en racha",
    description: "Tu patrulla suma 1 000 pts esta semana",
    icon: "flame",
    color: "purple",
    target: 1000,
    xpReward: 800,
    kind: "team",
    metric: "points",
  },
];

export function getMission(slug: string) {
  return MISSIONS.find((m) => m.slug === slug);
}
