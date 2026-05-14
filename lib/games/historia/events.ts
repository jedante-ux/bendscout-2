export interface HistoriaEvent {
  id: string;
  /** Año exacto del evento (para ordenar). */
  year: number;
  /** Texto corto del evento. */
  title: string;
  emoji: string;
}

/**
 * Eventos clave de la historia del Movimiento Scout y Baden-Powell. El
 * componente arma rondas de 4 eventos aleatorios para que el jugador los
 * ordene cronológicamente.
 */
export const HISTORIA_EVENTS: HistoriaEvent[] = [
  {
    id: "bp-nace",
    year: 1857,
    title: "Nace Robert Baden-Powell en Londres",
    emoji: "👶",
  },
  {
    id: "mafeking",
    year: 1899,
    title: "Baden-Powell defiende Mafeking en la guerra Bóer",
    emoji: "⚔️",
  },
  {
    id: "brownsea",
    year: 1907,
    title: "Primer campamento experimental en Brownsea Island",
    emoji: "🏕️",
  },
  {
    id: "scouting-for-boys",
    year: 1908,
    title: 'Se publica "Scouting for Boys"',
    emoji: "📖",
  },
  {
    id: "girl-guides",
    year: 1910,
    title: "Nacen las Guías Scouts con Agnes Baden-Powell",
    emoji: "👧",
  },
  {
    id: "chile-funda",
    year: 1909,
    title: "Se funda el escultismo en Chile",
    emoji: "🇨🇱",
  },
  {
    id: "bp-casa",
    year: 1912,
    title: "Baden-Powell se casa con Olave Soames",
    emoji: "💍",
  },
  {
    id: "primer-jamboree",
    year: 1920,
    title: "Primer Jamboree Mundial en Olympia, Londres",
    emoji: "🌍",
  },
  {
    id: "lord-bp",
    year: 1929,
    title: "Baden-Powell recibe el título de Lord",
    emoji: "👑",
  },
  {
    id: "muerte-bp",
    year: 1941,
    title: "Muere Baden-Powell en Nyeri, Kenia",
    emoji: "🕊️",
  },
  {
    id: "wagggs",
    year: 1928,
    title: "Se funda la Asociación Mundial de Guías Scouts (WAGGGS)",
    emoji: "🌐",
  },
  {
    id: "centenario",
    year: 2007,
    title: "Centenario del Movimiento Scout — Jamboree en Inglaterra",
    emoji: "💯",
  },
  {
    id: "jamboree-sudamerica",
    year: 1959,
    title: "Primer Jamboree Mundial en Sudamérica",
    emoji: "🌎",
  },
  {
    id: "patrulla-guias",
    year: 1916,
    title: "Sistema de Patrullas oficial en el Movimiento Scout",
    emoji: "🤝",
  },
  {
    id: "muere-olave",
    year: 1977,
    title: "Muere Olave Baden-Powell, jefa mundial de guías",
    emoji: "🌹",
  },
];
