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
    key: "tarzan",
    title: "Pista de Tarzán",
    tagline:
      "Salta piedras y agáchate bajo las ramas. ¡Cada vez es más rápido!",
    category: "nature",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🌴",
    imageSrc: "/icons/tarzan.png",
    status: "live",
    route: "/play/tarzan",
  },
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
    key: "recordando-nudos",
    title: "Recordando nudos",
    tagline:
      "Voltea cartas y empareja los 18 nudos y amarres scout. ¡Memoria de hierro!",
    category: "knots",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🪢",
    imageSrc: "/icons/nudos.png",
    status: "live",
    route: "/play/recordando-nudos",
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
    key: "constelaciones",
    title: "Mapa Estelar",
    tagline:
      "Identifica la constelación correcta antes que se acabe el tiempo. ¡60 segundos contra el reloj!",
    category: "orientation",
    difficulties: ["easy", "medium", "hard"],
    emoji: "✨",
    imageSrc: "/icons/orientacion-mapas.png",
    status: "live",
    route: "/play/constelaciones",
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
    tagline:
      "Decide rápido la acción correcta en cada emergencia. ¡60 segundos contra el reloj!",
    category: "first_aid",
    difficulties: ["easy", "medium", "hard"],
    emoji: "⛑️",
    imageSrc: "/icons/primeros-auxilios.png",
    status: "live",
    route: "/play/primera-respuesta",
  },
  {
    key: "banderas-semaforas",
    title: "Banderas Semáforas",
    tagline:
      "Identifica la letra del alfabeto semáforo antes que se acabe el tiempo. ¡60 segundos!",
    category: "orientation",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🚩",
    imageSrc: "/icons/orientacion-mapas.png",
    status: "live",
    route: "/play/banderas-semaforas",
  },
  {
    key: "botiquin",
    title: "Botiquín Express",
    tagline:
      "Arrastra el ítem correcto al paciente. Cada segundo cuenta para salvarlo.",
    category: "first_aid",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🩹",
    imageSrc: "/icons/primeros-auxilios.png",
    status: "live",
    route: "/play/botiquin",
  },
  {
    key: "morse",
    title: "Código Morse",
    tagline:
      "Escucha el patrón de puntos y rayas y elige la letra. ¡Sube el volumen!",
    category: "orientation",
    difficulties: ["easy", "medium", "hard"],
    emoji: "📡",
    imageSrc: "/icons/orientacion-mapas.png",
    status: "live",
    route: "/play/morse",
  },
  {
    key: "mochila",
    title: "Mochila de Campamento",
    tagline:
      "Swipea: derecha para llevar, izquierda para dejar. ¡Arma la mochila perfecta!",
    category: "nature",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🎒",
    imageSrc: "/icons/tarzan.png",
    status: "live",
    route: "/play/mochila",
  },
  {
    key: "historia",
    title: "Historia Scout",
    tagline:
      "Ordena los hitos del Movimiento Scout del más antiguo al más reciente.",
    category: "history",
    difficulties: ["easy", "medium", "hard"],
    emoji: "📜",
    imageSrc: "/icons/fogata.png",
    status: "live",
    route: "/play/historia",
  },
  {
    key: "brujula",
    title: "Brújula al Rumbo",
    tagline:
      "Gira la flecha al rumbo correcto antes que se acabe el tiempo.",
    category: "orientation",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🧭",
    imageSrc: "/icons/orientacion-mapas.png",
    status: "live",
    route: "/play/brujula",
  },
  {
    key: "huellas",
    title: "Caza de Huellas",
    tagline:
      "Toca solo las huellas del animal correcto. ¡Reflejos scout al máximo!",
    category: "nature",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🐾",
    imageSrc: "/icons/tarzan.png",
    status: "live",
    route: "/play/huellas",
  },
  {
    key: "laberinto",
    title: "Laberinto",
    tagline:
      "Traza con el dedo la salida del laberinto sin chocar con muros.",
    category: "orientation",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🌀",
    imageSrc: "/icons/orientacion-mapas.png",
    status: "live",
    route: "/play/laberinto",
  },
  {
    key: "completa-ley",
    title: "Completa la Ley",
    tagline:
      "Completa la frase de la Ley Scout con la palabra correcta. ¡60 segundos!",
    category: "law",
    difficulties: ["easy", "medium", "hard"],
    emoji: "📜",
    imageSrc: "/icons/fogata.png",
    status: "live",
    route: "/play/completa-ley",
  },
  {
    key: "nudo-pasos",
    title: "Nudo paso-a-paso",
    tagline:
      "Ordena los 4 pasos del nudo correctamente. Aprende nudos rápido.",
    category: "knots",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🪢",
    imageSrc: "/icons/nudos.png",
    status: "live",
    route: "/play/nudo-pasos",
  },
  {
    key: "sopa-letras",
    title: "Sopa de Letras Scout",
    tagline:
      "Encuentra las palabras scout escondidas en la grilla. ¡Arrastra y caza!",
    category: "history",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🔤",
    imageSrc: "/icons/fogata.png",
    status: "live",
    route: "/play/sopa-letras",
  },
  {
    key: "diferencias",
    title: "Encuentra las Diferencias",
    tagline:
      "Compara las dos escenas de campamento y toca las 5 diferencias.",
    category: "nature",
    difficulties: ["easy", "medium", "hard"],
    emoji: "🔍",
    imageSrc: "/icons/tarzan.png",
    status: "live",
    route: "/play/diferencias",
  },
  {
    key: "construye-carpa",
    title: "Construye la Carpa",
    tagline:
      "Arrastra cada pieza en el orden correcto al lugar correcto. ¡Arma la carpa!",
    category: "nature",
    difficulties: ["easy", "medium", "hard"],
    emoji: "⛺",
    imageSrc: "/icons/tarzan.png",
    status: "live",
    route: "/play/construye-carpa",
  },
];

export function getGame(key: string) {
  return GAMES.find((g) => g.key === key);
}
