import type { ScoutIconName } from "@/components/scout/icon";

export type TrophyColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

export type TrophyRarity = "Común" | "Raro" | "Épico";

export interface TrophyDef {
  /** Stable identifier for lookups. */
  slug: string;
  /** Display title shown in the UI. */
  title: string;
  /** Short description — qué hay que hacer para ganarlo. */
  description: string;
  /** Icon used when unlocked. */
  icon: ScoutIconName;
  /** Accent color for the trophy badge. */
  color: TrophyColor;
  /** Rarity tier — drives the rarity chip and ordering. */
  rarity: TrophyRarity;
  /** Progress value required to unlock. */
  target: number;
}

/**
 * Catálogo estático de trofeos. Todos los criterios son computables desde
 * `profiles`, `game_sessions`, `daily_plays`, `jamboree_scores` y los RPC
 * `get_user_streak` / `get_user_stats`. La progresión se calcula on-read
 * en `lib/trophies/queries.ts`.
 *
 * Los trofeos son logros permanentes (no caducan) y más raros que las
 * insignias: cada uno representa un hito específico del camino scout.
 */
export const TROPHIES: TrophyDef[] = [
  // ---- Comunes ----
  {
    slug: "primer-paso",
    title: "Primer Paso",
    description: "Completa tu primera partida puntuable",
    icon: "flag",
    color: "mint",
    rarity: "Común",
    target: 1,
  },
  {
    slug: "aullido",
    title: "Aullido",
    description: "Únete a una patrulla",
    icon: "users",
    color: "orange",
    rarity: "Común",
    target: 1,
  },
  {
    slug: "veloz-del-bosque",
    title: "Veloz del Bosque",
    description: "Termina una partida en menos de 30s",
    icon: "flame",
    color: "mint",
    rarity: "Común",
    target: 1,
  },

  // ---- Raros ----
  {
    slug: "maestro-de-la-ley",
    title: "Maestro de la Ley",
    description: "Juega Ley en Orden 10 veces",
    icon: "lightbulb",
    color: "teal",
    rarity: "Raro",
    target: 10,
  },
  {
    slug: "coleccionista",
    title: "Coleccionista",
    description: "Desbloquea 10 insignias",
    icon: "shield",
    color: "sky",
    rarity: "Raro",
    target: 10,
  },
  {
    slug: "cartografo",
    title: "Cartógrafo",
    description: "Juega los 4 minijuegos disponibles",
    icon: "map",
    color: "purple",
    rarity: "Raro",
    target: 4,
  },
  {
    slug: "llama-eterna",
    title: "Llama Eterna",
    description: "Mantén 5 días seguidos de racha",
    icon: "flame",
    color: "orange",
    rarity: "Raro",
    target: 5,
  },
  {
    slug: "top-patrulla",
    title: "Top Patrulla",
    description: "Lidera tu patrulla en el jamboree activo",
    icon: "trophy",
    color: "rose",
    rarity: "Raro",
    target: 1,
  },

  // ---- Épicos ----
  {
    slug: "sabio-scout",
    title: "Sabio Scout",
    description: "Acumula 5 000 XP totales",
    icon: "lightbulb",
    color: "gold",
    rarity: "Épico",
    target: 5000,
  },
  {
    slug: "leyenda-scout",
    title: "Leyenda Scout",
    description: "Alcanza nivel 10",
    icon: "starfill",
    color: "purple",
    rarity: "Épico",
    target: 10,
  },
  {
    slug: "top-jamboree",
    title: "Top Jamboree",
    description: "Termina #1 individual del jamboree",
    icon: "trophy",
    color: "gold",
    rarity: "Épico",
    target: 1,
  },
  {
    slug: "puntuacion-perfecta",
    title: "Puntuación Perfecta",
    description: "Logra 300+ puntos en una sola partida",
    icon: "starfill",
    color: "gold",
    rarity: "Épico",
    target: 300,
  },
];

export const TROPHIES_TOTAL = TROPHIES.length;

export function getTrophy(slug: string): TrophyDef | undefined {
  return TROPHIES.find((t) => t.slug === slug);
}

const RARITY_ORDER: Record<TrophyRarity, number> = {
  Épico: 0,
  Raro: 1,
  Común: 2,
};

export function rarityOrder(r: TrophyRarity): number {
  return RARITY_ORDER[r];
}
