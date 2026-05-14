import type { GameCategory, GameDifficulty } from "@/types/database";

export interface GameDefinition {
  key: string;
  title: string;
  tagline: string;
  category: GameCategory;
  difficulties: GameDifficulty[];
  emoji: string;
  imageSrc?: string;
  status: "live" | "soon" | "locked";
  route?: string;
}

export const GAMES: GameDefinition[] = [
  {
    key: "knot-rush",
    title: "Knot Rush",
    tagline: "Identifica el nudo correcto contra el reloj.",
    category: "knots",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🪢",
    imageSrc: "/icons/nudos.png",
    status: "soon",
  },
  {
    key: "law-shuffle",
    title: "Ley en Orden",
    tagline:
      "Conecta cada fragmento de la Ley Scout con su completación correcta.",
    category: "law",
    difficulties: ["easy", "medium"],
    emoji: "📜",
    imageSrc: "/icons/fogata.png",
    status: "live",
    route: "/play/ley-scout",
  },
  {
    key: "trail-signs",
    title: "Pistas del Sendero",
    tagline: "Descifra señales de rastreo en la naturaleza.",
    category: "orientation",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🧭",
    imageSrc: "/icons/orientacion-mapas.png",
    status: "soon",
  },
  {
    key: "first-response",
    title: "Primera Respuesta",
    tagline: "Decide rápido la acción correcta en emergencias.",
    category: "first_aid",
    difficulties: ["medium", "hard"],
    emoji: "⛑️",
    imageSrc: "/icons/primeros-auxilios.png",
    status: "soon",
  },
];

export function getGame(key: string) {
  return GAMES.find((g) => g.key === key);
}
