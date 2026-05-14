export interface MochilaItem {
  id: string;
  name: string;
  emoji: string;
  /** ¿Debería ir en la mochila scout para un campamento de 2 días? */
  essential: boolean;
  /** Texto corto que aparece tras decidir (educativo). */
  note: string;
}

export const MOCHILA_ITEMS: MochilaItem[] = [
  // Esenciales
  { id: "linterna", name: "Linterna frontal", emoji: "🔦", essential: true,
    note: "Manos libres para armar carpa de noche." },
  { id: "navaja", name: "Navaja multiuso", emoji: "🔪", essential: true,
    note: "Cortar, abrir, reparar — bajo supervisión." },
  { id: "saco", name: "Saco de dormir", emoji: "🛌", essential: true,
    note: "Frío nocturno > comodidad." },
  { id: "botella", name: "Botella de agua", emoji: "💧", essential: true,
    note: "Hidratación es prioridad uno." },
  { id: "impermeable", name: "Capa impermeable", emoji: "🧥", essential: true,
    note: "Lluvia + frío = hipotermia rápida." },
  { id: "brujula", name: "Brújula", emoji: "🧭", essential: true,
    note: "GPS muere; la brújula no." },
  { id: "fosforos", name: "Fósforos a prueba de agua", emoji: "🔥", essential: true,
    note: "Fuego seguro = vida en la montaña." },
  { id: "botiquin", name: "Botiquín básico", emoji: "🩹", essential: true,
    note: "Cura raspones antes que se infecten." },
  { id: "silbato", name: "Silbato", emoji: "📣", essential: true,
    note: "Más fuerte que tu voz cuando te pierdes." },
  { id: "muda", name: "Muda de ropa seca", emoji: "👕", essential: true,
    note: "Ropa mojada = noche pésima." },
  { id: "papel", name: "Papel higiénico", emoji: "🧻", essential: true,
    note: "Te vas a acordar de mí." },
  { id: "comida", name: "Snacks energéticos", emoji: "🥨", essential: true,
    note: "Calorías para caminar todo el día." },
  { id: "gorro", name: "Gorro de sol", emoji: "🧢", essential: true,
    note: "Cuero cabelludo quemado es un infierno." },
  { id: "cantimplora", name: "Plato y cubiertos", emoji: "🍽️", essential: true,
    note: "Comer caliente cambia el ánimo." },

  // NO van
  { id: "consola", name: "Consola portátil", emoji: "🎮", essential: false,
    note: "El campamento es para desconectar." },
  { id: "parlante", name: "Parlante bluetooth", emoji: "🔊", essential: false,
    note: "Respeta la naturaleza y a la patrulla vecina." },
  { id: "drone", name: "Drone DJI", emoji: "🛸", essential: false,
    note: "Reservado, ruidoso y caro de perder." },
  { id: "perfume", name: "Perfume floral", emoji: "🌸", essential: false,
    note: "Atrae insectos y mosquitos." },
  { id: "secador", name: "Secador de pelo", emoji: "💇", essential: false,
    note: "No hay enchufe en la pradera." },
  { id: "tv", name: "Televisor", emoji: "📺", essential: false,
    note: "¿En serio?" },
  { id: "tacones", name: "Tacones", emoji: "👠", essential: false,
    note: "Tobillo torcido garantizado." },
  { id: "spray-graffiti", name: "Spray de graffiti", emoji: "🎨", essential: false,
    note: "Deja el bosque como lo encontraste." },
  { id: "fuegos", name: "Fuegos artificiales", emoji: "🎆", essential: false,
    note: "Riesgo de incendio forestal." },
  { id: "patines", name: "Patines en línea", emoji: "🛼", essential: false,
    note: "No hay asfalto en el cerro." },
  { id: "gato", name: "Tu gato", emoji: "🐱", essential: false,
    note: "Se va a perder a los 5 minutos." },
  { id: "joyas", name: "Joyas caras", emoji: "💍", essential: false,
    note: "Riesgo de perderlas en el barro." },
  { id: "vinilos", name: "Tocadiscos vinilo", emoji: "💿", essential: false,
    note: "Reservado, frágil y se moja." },
  { id: "globos", name: "Globos de helio", emoji: "🎈", essential: false,
    note: "Contaminación visible desde la luna." },
];
