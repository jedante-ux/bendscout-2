/**
 * Cada "escena" del juego de las diferencias se renderiza como SVG a partir
 * de una lista de elementos. La segunda escena se renderiza con los mismos
 * elementos PERO algunos están "alterados" — cambia color, posición o se
 * agrega/quita una pieza. El componente expone las coordenadas de cada
 * diferencia para detectar taps cercanos.
 *
 * Convención: cada diferencia se identifica por una zona circular (cx, cy,
 * radius en coords de 100×100). El jugador toca en CUALQUIERA de las dos
 * escenas dentro de esa zona para descubrir la diferencia.
 */
export interface SceneDiff {
  id: string;
  /** Coords del punto central donde está la diferencia (en una de las
   *  escenas — la otra simétrica). 0..100. */
  cx: number;
  cy: number;
  /** Radio de tolerancia del tap, también en 0..100. */
  radius: number;
  /** Descripción corta (mostrada al acertar). */
  label: string;
}

export interface ScenePuzzle {
  id: string;
  title: string;
  /** Subtítulo educativo / curiosidad. */
  caption: string;
  /** Renderiza la escena "A" — la original. */
  renderA: () => React.ReactNode;
  /** Renderiza la escena "B" — con las diferencias aplicadas. */
  renderB: () => React.ReactNode;
  diffs: SceneDiff[];
}

// Helpers de elementos SVG comunes
const tree = (x: number, y: number, color = "#2f7a3a") => (
  <g key={`tree-${x}-${y}`}>
    <polygon points={`${x},${y - 14} ${x - 8},${y} ${x + 8},${y}`} fill={color} />
    <polygon
      points={`${x},${y - 10} ${x - 9},${y + 4} ${x + 9},${y + 4}`}
      fill={color}
    />
    <rect x={x - 1.5} y={y + 4} width={3} height={4} fill="#5a3a20" />
  </g>
);
const cloud = (x: number, y: number, scale = 1) => (
  <g key={`cloud-${x}-${y}`} fill="#e9e9ee" opacity={0.9}>
    <circle cx={x} cy={y} r={3 * scale} />
    <circle cx={x + 3.5 * scale} cy={y - 1.5 * scale} r={3.5 * scale} />
    <circle cx={x + 6 * scale} cy={y} r={3 * scale} />
    <circle cx={x + 3 * scale} cy={y + 1 * scale} r={2.6 * scale} />
  </g>
);
const tent = (x: number, y: number, color: string) => (
  <g key={`tent-${x}-${y}`}>
    <polygon
      points={`${x - 12},${y + 6} ${x},${y - 14} ${x + 12},${y + 6}`}
      fill={color}
      stroke="#000"
      strokeWidth={0.5}
    />
    <polygon points={`${x - 2},${y + 6} ${x},${y - 10} ${x + 2},${y + 6}`} fill="#1a1612" />
  </g>
);
const fire = (x: number, y: number, withFlame: boolean) => (
  <g key={`fire-${x}-${y}`}>
    <line x1={x - 6} y1={y + 3} x2={x + 6} y2={y - 3} stroke="#7a4a2a" strokeWidth={1.6} />
    <line x1={x - 5} y1={y - 3} x2={x + 5} y2={y + 3} stroke="#7a4a2a" strokeWidth={1.6} />
    {withFlame && (
      <>
        <path d={`M${x - 3} ${y - 4} Q${x} ${y - 14} ${x + 3} ${y - 4} Q${x} ${y - 8} ${x - 3} ${y - 4}Z`} fill="#f3a23a" />
        <path d={`M${x - 1.5} ${y - 6} Q${x} ${y - 12} ${x + 1.5} ${y - 6}Z`} fill="#f4d63a" />
      </>
    )}
  </g>
);
const sun = (x: number, y: number, color = "#f3c12c") => (
  <g key={`sun-${x}-${y}`}>
    <circle cx={x} cy={y} r={5} fill={color} />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      return (
        <line
          key={i}
          x1={x + Math.cos(a) * 7}
          y1={y + Math.sin(a) * 7}
          x2={x + Math.cos(a) * 10}
          y2={y + Math.sin(a) * 10}
          stroke={color}
          strokeWidth={1.2}
        />
      );
    })}
  </g>
);
const scout = (x: number, y: number, scarfColor: string) => (
  <g key={`scout-${x}-${y}`}>
    {/* head */}
    <circle cx={x} cy={y - 6} r={3.2} fill="#d3a37a" stroke="#000" strokeWidth={0.3} />
    {/* hat */}
    <path d={`M${x - 4} ${y - 7} Q${x} ${y - 11} ${x + 4} ${y - 7} L${x + 4} ${y - 6.5} L${x - 4} ${y - 6.5} Z`} fill="#3a6b3a" />
    {/* body */}
    <rect x={x - 2.8} y={y - 3} width={5.6} height={7} fill="#5d8a55" />
    {/* scarf */}
    <polygon points={`${x - 2.8},${y - 3} ${x + 2.8},${y - 3} ${x},${y + 0.5}`} fill={scarfColor} />
    {/* legs */}
    <rect x={x - 2.4} y={y + 4} width={1.8} height={4} fill="#3a3a3a" />
    <rect x={x + 0.6} y={y + 4} width={1.8} height={4} fill="#3a3a3a" />
  </g>
);
const ground = (y: number, color = "#2a4a2a") => (
  <rect key={`ground-${y}`} x={0} y={y} width={100} height={100 - y} fill={color} />
);
const sky = (color = "#1f3358") => (
  <rect key="sky" x={0} y={0} width={100} height={100} fill={color} />
);

export const SCENE_PUZZLES: ScenePuzzle[] = [
  {
    id: "campamento-amanecer",
    title: "Campamento al amanecer",
    caption: "El fogón aún humea. ¿Notas los cambios?",
    diffs: [
      { id: "carpa-color", cx: 30, cy: 60, radius: 12, label: "Color de la carpa" },
      { id: "sol-faltante", cx: 80, cy: 18, radius: 12, label: "El sol cambió" },
      { id: "nube-extra", cx: 50, cy: 16, radius: 10, label: "Una nube extra" },
      { id: "scout-pañuelo", cx: 65, cy: 70, radius: 10, label: "Pañuelo del scout" },
      { id: "arbol-faltante", cx: 12, cy: 60, radius: 10, label: "Falta un árbol" },
    ],
    renderA: () => (
      <>
        {sky("#2d4a7a")}
        {sun(80, 18, "#f3c12c")}
        {cloud(20, 20)}
        {tree(12, 65)}
        {tree(90, 65, "#2f7a3a")}
        {ground(72)}
        {tent(30, 70, "#c44a3a")}
        {fire(55, 78, true)}
        {scout(65, 70, "#f3c12c")}
      </>
    ),
    renderB: () => (
      <>
        {sky("#2d4a7a")}
        {sun(80, 18, "#d44a3a")}
        {cloud(20, 20)}
        {cloud(50, 16, 0.9)}
        {tree(90, 65, "#2f7a3a")}
        {ground(72)}
        {tent(30, 70, "#2d6aa0")}
        {fire(55, 78, true)}
        {scout(65, 70, "#c44a3a")}
      </>
    ),
  },
  {
    id: "bosque-noche",
    title: "Bosque de noche",
    caption: "Las estrellas están afuera. ¿Y los detalles?",
    diffs: [
      { id: "luna-color", cx: 78, cy: 18, radius: 12, label: "Color de la luna" },
      { id: "fogata-apagada", cx: 50, cy: 76, radius: 12, label: "La fogata se apagó" },
      { id: "carpa-pos", cx: 25, cy: 70, radius: 14, label: "La carpa se movió" },
      { id: "estrella-extra", cx: 45, cy: 12, radius: 8, label: "Estrella nueva" },
      { id: "arbol-pos", cx: 88, cy: 60, radius: 12, label: "Árbol movido" },
    ],
    renderA: () => (
      <>
        {sky("#0c0f24")}
        {/* luna */}
        <circle cx={78} cy={18} r={6} fill="#e9e9ee" />
        <circle cx={80} cy={16} r={5} fill="#0c0f24" />
        {/* estrellas */}
        <circle cx={15} cy={14} r={0.6} fill="#fff" />
        <circle cx={30} cy={8} r={0.5} fill="#fff" />
        <circle cx={60} cy={20} r={0.6} fill="#fff" />
        <circle cx={20} cy={28} r={0.5} fill="#fff" />
        {tree(10, 65, "#1a4a2a")}
        {tree(88, 60, "#1a4a2a")}
        {ground(72, "#1a2a1a")}
        {tent(25, 70, "#a04a3a")}
        {fire(50, 78, true)}
      </>
    ),
    renderB: () => (
      <>
        {sky("#0c0f24")}
        <circle cx={78} cy={18} r={6} fill="#f3c12c" />
        <circle cx={80} cy={16} r={5} fill="#0c0f24" />
        <circle cx={15} cy={14} r={0.6} fill="#fff" />
        <circle cx={30} cy={8} r={0.5} fill="#fff" />
        <circle cx={45} cy={12} r={0.7} fill="#fff" />
        <circle cx={60} cy={20} r={0.6} fill="#fff" />
        <circle cx={20} cy={28} r={0.5} fill="#fff" />
        {tree(10, 65, "#1a4a2a")}
        {tree(80, 60, "#1a4a2a")}
        {ground(72, "#1a2a1a")}
        {tent(35, 70, "#a04a3a")}
        {fire(50, 78, false)}
      </>
    ),
  },
  {
    id: "rio-pradera",
    title: "Río en la pradera",
    caption: "Día tranquilo junto al río.",
    diffs: [
      { id: "pez", cx: 40, cy: 82, radius: 10, label: "Apareció un pez" },
      { id: "nube", cx: 70, cy: 14, radius: 10, label: "La nube creció" },
      { id: "carpa", cx: 18, cy: 60, radius: 12, label: "Color de la carpa" },
      { id: "scout-pos", cx: 75, cy: 60, radius: 14, label: "El scout se movió" },
      { id: "arbusto", cx: 55, cy: 65, radius: 10, label: "Falta un arbusto" },
    ],
    renderA: () => (
      <>
        {sky("#5a8ec0")}
        {sun(82, 20, "#f3c12c")}
        {cloud(70, 14, 0.9)}
        {ground(72, "#3a7a3a")}
        {/* río */}
        <rect x={0} y={78} width={100} height={22} fill="#3a7ab0" />
        <path d="M0 84 Q 25 80 50 84 T 100 84" stroke="#a8d0f0" strokeWidth={0.6} fill="none" />
        {/* arbusto */}
        <ellipse cx={55} cy={68} rx={5} ry={3} fill="#2f7a3a" />
        {tree(8, 62)}
        {tent(18, 64, "#c44a3a")}
        {scout(65, 65, "#3a6bc0")}
      </>
    ),
    renderB: () => (
      <>
        {sky("#5a8ec0")}
        {sun(82, 20, "#f3c12c")}
        {cloud(68, 14, 1.4)}
        {ground(72, "#3a7a3a")}
        <rect x={0} y={78} width={100} height={22} fill="#3a7ab0" />
        <path d="M0 84 Q 25 80 50 84 T 100 84" stroke="#a8d0f0" strokeWidth={0.6} fill="none" />
        {/* pez */}
        <g>
          <ellipse cx={40} cy={84} rx={3} ry={1.5} fill="#f3a23a" />
          <polygon points="37,84 33,82 33,86" fill="#f3a23a" />
        </g>
        {tree(8, 62)}
        {tent(18, 64, "#3aa07a")}
        {scout(78, 65, "#3a6bc0")}
      </>
    ),
  },
];
