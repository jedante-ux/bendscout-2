import Link from "next/link";
import Image from "next/image";
import { Topbar } from "@/components/scout/topbar";
import { FeaturedGame } from "@/components/scout/featured-game";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";
import { cn } from "@/lib/utils";

type GameColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface Game {
  id: string;
  title: string;
  sub: string;
  best: number;
  plays: number;
  color: GameColor;
  emoji: string;
  time: string;
  imageSrc?: string;
  locked?: boolean;
  isNew?: boolean;
  href?: string;
}

const GAMES: Game[] = [
  { id: "mem", title: "Memoria Visual", sub: "Encuentra las parejas", best: 2150, plays: 18, color: "mint", emoji: "🍃", time: "1 min", href: "/play/memoria" },
  { id: "lab", title: "Laberinto", sub: "Encuentra la salida", best: 1820, plays: 12, color: "sky", emoji: "🧭", time: "2 min", href: "/play/laberinto" },
  { id: "cam", title: "Camino Seguro", sub: "Cruza el río saltando", best: 1560, plays: 9, color: "purple", emoji: "🏃", time: "1 min", href: "/play/camino-seguro" },
  { id: "qz", title: "Preguntas Scout", sub: "Pon a prueba lo que sabes", best: 1750, plays: 24, color: "gold", emoji: "📖", time: "2 min", href: "/play/preguntas" },
  { id: "ley", title: "Ley en Orden", sub: "Conecta cada artículo", best: 0, plays: 0, color: "mint", emoji: "📜", time: "2 min", imageSrc: "/icons/fogata.png", href: "/play/ley-scout", isNew: true },
  { id: "knot", title: "Maestro Nudos", sub: "Identifica el nudo correcto", best: 980, plays: 6, color: "orange", emoji: "🪢", time: "3 min", imageSrc: "/icons/nudos.png", isNew: true },
  { id: "morse", title: "Código Morse", sub: "Descifra el mensaje", best: 0, plays: 0, color: "rose", emoji: "📡", time: "2 min", locked: true },
  { id: "star", title: "Mapa Estelar", sub: "Conecta las constelaciones", best: 0, plays: 0, color: "purple", emoji: "✨", time: "3 min", locked: true },
  { id: "first", title: "Primeros Aux.", sub: "Actúa rápido y bien", best: 0, plays: 0, color: "teal", emoji: "🚑", time: "2 min", locked: true },
];

export default function PlayPage() {
  return (
    <>
      <Topbar
        greeting="Minijuegos"
        subtitle="8 retos · gana XP, sube de rango"
        notifications={3}
      />

      <div className="vstack" style={{ gap: 20 }}>
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-secondary">Todos</button>
          <button className="btn btn-ghost">Velocidad</button>
          <button className="btn btn-ghost">Memoria</button>
          <button className="btn btn-ghost">Conocimiento</button>
          <button className="btn btn-ghost">Habilidad</button>
          <div style={{ flex: 1 }} />
          <span className="chip chip-accent">
            <ScoutIcon name="flame" size={12} /> Racha 12 días
          </span>
        </div>

        {/* Featured */}
        <section
          className="scout-card grid items-center"
          style={{
            padding: 24,
            position: "relative",
            overflow: "hidden",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 24,
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 80% at 70% 50%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 60%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <span className="chip">★ Destacado de la semana</span>
            <div className="t-display-lg" style={{ margin: "10px 0 6px" }}>
              Desafío de Senderos
            </div>
            <p
              className="t-body text-muted"
              style={{ marginBottom: 18, maxWidth: 420 }}
            >
              Recorre el bosque saltando entre troncos, esquiva obstáculos y
              recolecta hojas. Quien llegue más lejos gana doble XP para su
              patrulla.
            </p>
            <div className="flex flex-wrap" style={{ gap: 18, marginBottom: 18 }}>
              <Stat label="Tu mejor" value="2 450" color="var(--accent)" />
              <Stat label="Patrulla" value="3 120" />
              <Stat label="XP por victoria" value="+200" color="var(--primary)" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/play/camino-seguro" className="btn btn-primary btn-lg">
                <ScoutIcon name="play" size={16} /> Jugar ahora
              </Link>
              <button className="btn btn-secondary">Ver récords</button>
            </div>
          </div>
          <FeaturedGame
            title=""
            tagline=""
            imageSrc="/icons/fogata.png"
          />
        </section>

        {/* Grid */}
        <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((g) => (
            <GameTile key={g.id} game={g} />
          ))}
        </section>
      </div>
    </>
  );
}

function GameTile({ game: g }: { game: Game }) {
  const inner = (
    <>
      <div
        className="relative grid place-items-center"
        style={{
          aspectRatio: 1,
          background: `radial-gradient(ellipse 80% 60% at 30% 30%, color-mix(in oklch, var(--c-${g.color}) 30%, transparent), transparent 70%), linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))`,
        }}
      >
        {g.imageSrc ? (
          <Image
            src={g.imageSrc}
            alt={g.title}
            width={140}
            height={140}
            className="animate-float h-[70%] w-auto object-contain drop-shadow-2xl"
            style={
              g.locked ? { filter: "grayscale(80%) opacity(0.6)" } : undefined
            }
          />
        ) : (
          <span
            style={{
              fontSize: 64,
              opacity: 0.85,
              filter: "drop-shadow(0 8px 20px oklch(0 0 0 / 0.4))",
            }}
          >
            {g.emoji}
          </span>
        )}

        {g.locked && (
          <div
            aria-hidden
            className="absolute inset-0 grid place-items-center"
            style={{ background: "oklch(0 0 0 / 0.4)" }}
          >
            <ScoutIcon name="lock" size={28} />
          </div>
        )}

        {g.isNew && (
          <span
            className="chip"
            style={{ position: "absolute", top: 10, right: 10 }}
          >
            Nuevo
          </span>
        )}

        <span
          className="chip chip-neutral"
          style={{ position: "absolute", top: 10, left: 10 }}
        >
          <ScoutIcon name="clock" size={10} /> {g.time}
        </span>
      </div>

      <div style={{ padding: 12 }}>
        <div className="t-display-sm" style={{ fontSize: 14 }}>
          {g.title}
        </div>
        <div className="t-caption text-muted" style={{ marginTop: 2 }}>
          {g.sub}
        </div>
        {!g.locked ? (
          <div className="between" style={{ marginTop: 10 }}>
            <span className="t-caption text-muted">Mejor</span>
            <span
              className="t-mono"
              style={{ color: "var(--accent)", fontWeight: 700 }}
            >
              {g.best.toLocaleString("es")}
            </span>
          </div>
        ) : (
          <div className="t-caption text-muted" style={{ marginTop: 10 }}>
            Nivel 28 para desbloquear
          </div>
        )}
      </div>
    </>
  );

  const baseStyle = "scout-card relative overflow-hidden transition";
  const baseInline = { padding: 0 } as React.CSSProperties;

  if (g.locked) {
    return (
      <div
        className={cn(baseStyle)}
        style={{ ...baseInline, opacity: 0.55, cursor: "not-allowed" }}
      >
        {inner}
      </div>
    );
  }

  if (g.href) {
    return (
      <Link
        href={g.href}
        className={cn(baseStyle, "hover:-translate-y-1")}
        style={baseInline}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={cn(baseStyle)} style={baseInline}>
      {inner}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="t-overline text-muted">{label}</div>
      <div className="t-num" style={{ fontSize: 22, color }}>
        {value}
      </div>
    </div>
  );
}
