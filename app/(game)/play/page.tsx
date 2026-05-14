import Link from "next/link";
import Image from "next/image";
import { Topbar } from "@/components/scout/topbar";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";
import { cn } from "@/lib/utils";
import { getAuthState } from "@/lib/auth/session";
import { getActiveJamboree } from "@/lib/games/queries";
import { createClient } from "@/lib/supabase/server";
import { getUserTeam } from "@/lib/teams/queries";
import { getDailyPick } from "@/lib/games/daily";
import { GAMES as REGISTRY_GAMES } from "@/lib/games/registry";
import { DailyPickWidget } from "@/components/scout/daily-pick-widget";

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
  /** game_key tal como se guarda en `game_sessions` / `daily_plays`. */
  gameKey: string;
  title: string;
  sub: string;
  color: GameColor;
  emoji: string;
  time: string;
  imageSrc?: string;
  locked?: boolean;
  isNew?: boolean;
  href?: string;
}

/**
 * Catálogo maestro. Las claves `gameKey` deben coincidir con las que las
 * páginas individuales pasan a `start_attempt` para que el filtro de
 * "jugados en la temporada" funcione.
 */
const GAMES: Game[] = [
  { id: "mem", gameKey: "memoria-visual", title: "Memoria Visual", sub: "Encuentra las parejas", color: "mint", emoji: "🍃", time: "1 min", href: "/play/memoria" },
  { id: "lab", gameKey: "laberinto", title: "Laberinto", sub: "Encuentra la salida", color: "sky", emoji: "🧭", time: "2 min", href: "/play/laberinto" },
  { id: "cam", gameKey: "camino-seguro", title: "Camino Seguro", sub: "Cruza el río saltando", color: "purple", emoji: "🏃", time: "1 min", href: "/play/camino-seguro" },
  { id: "qz", gameKey: "preguntas", title: "Preguntas Scout", sub: "Pon a prueba lo que sabes", color: "gold", emoji: "📖", time: "2 min", href: "/play/preguntas" },
  { id: "ley", gameKey: "ley-scout", title: "Ley en Orden", sub: "Conecta cada artículo", color: "mint", emoji: "📜", time: "2 min", imageSrc: "/icons/fogata.png", href: "/play/ley-scout", isNew: true },
  { id: "tar", gameKey: "tarzan", title: "Pista de Tarzán", sub: "Salta y agáchate sin parar", color: "teal", emoji: "🌴", time: "1 min", imageSrc: "/icons/tarzan.png", href: "/play/tarzan", isNew: true },
  { id: "knot", gameKey: "knot-rush", title: "Maestro Nudos", sub: "Identifica el nudo correcto", color: "orange", emoji: "🪢", time: "3 min", imageSrc: "/icons/nudos.png", isNew: true },
  { id: "recnud", gameKey: "recordando-nudos", title: "Recordando nudos", sub: "Empareja 18 nudos y amarres", color: "orange", emoji: "🪢", time: "3 min", imageSrc: "/icons/nudos.png", href: "/play/recordando-nudos", isNew: true },
  { id: "morse", gameKey: "morse", title: "Código Morse", sub: "Descifra el mensaje", color: "rose", emoji: "📡", time: "2 min", locked: true },
  { id: "star", gameKey: "star-map", title: "Mapa Estelar", sub: "Conecta las constelaciones", color: "purple", emoji: "✨", time: "3 min", locked: true },
  { id: "first", gameKey: "first-response", title: "Primeros Aux.", sub: "Actúa rápido y bien", color: "teal", emoji: "🚑", time: "2 min", locked: true },
];

async function getPlayedGameKeys(
  userId: string,
  jamboreeId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_sessions")
    .select("game_key")
    .eq("user_id", userId)
    .eq("jamboree_id", jamboreeId)
    .eq("status", "completed");
  if (!data) return new Set();
  return new Set(data.map((r) => (r as { game_key: string }).game_key));
}

export default async function PlayPage() {
  const auth = await getAuthState();
  const jamboree = await getActiveJamboree();
  const team =
    auth.authenticated && auth.userId ? await getUserTeam(auth.userId) : null;
  const dailyPick = team ? await getDailyPick(team.id) : null;

  const playedKeys =
    auth.authenticated && auth.userId && jamboree
      ? await getPlayedGameKeys(auth.userId, jamboree.id)
      : new Set<string>();

  const dailyKey = dailyPick?.gameKey ?? "";

  const visibleGames = GAMES.filter(
    (g) => playedKeys.has(g.gameKey) || g.gameKey === dailyKey,
  );

  const historyGames = visibleGames.filter((g) => g.gameKey !== dailyKey);

  return (
    <>
      <Topbar
        greeting="Minijuegos"
        subtitle={
          playedKeys.size > 0
            ? `${playedKeys.size} ${
                playedKeys.size === 1 ? "jugado" : "jugados"
              } esta temporada`
            : "Empieza por el minijuego del día"
        }
        notifications={3}
      />

      <div className="vstack" style={{ gap: 20 }}>
        <DailyPickWidget
          games={REGISTRY_GAMES}
          teamId={team?.id ?? null}
          pick={dailyPick}
          variant="hero"
        />

        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h3">Tu temporada</span>
            <span className="t-caption text-muted">
              {historyGames.length === 0
                ? "Sin partidas todavía"
                : `${historyGames.length} ${
                    historyGames.length === 1 ? "juego" : "juegos"
                  }`}
            </span>
          </div>

          {historyGames.length === 0 ? (
            <EmptyHistory />
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {historyGames.map((g) => (
                <GameTile key={g.id} game={g} />
              ))}
            </div>
          )}
        </section>

        <LockedHint />
      </div>
    </>
  );
}


function EmptyHistory() {
  return (
    <div
      className="vstack scout-card"
      style={{
        padding: 28,
        textAlign: "center",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: "color-mix(in oklch, var(--primary) 14%, transparent)",
          color: "var(--primary)",
          border:
            "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
        }}
      >
        <ScoutIcon name="gamepad" size={20} />
      </span>
      <div className="t-h3" style={{ margin: 0 }}>
        Tu temporada está vacía
      </div>
      <p className="t-body-sm text-muted" style={{ maxWidth: 380 }}>
        Empieza por el minijuego del día. Conforme juegues otros minijuegos
        durante el Jamboree, aparecerán acá.
      </p>
    </div>
  );
}

function LockedHint() {
  return (
    <p
      className="t-caption text-muted"
      style={{ textAlign: "center", marginTop: 4 }}
    >
      <ScoutIcon name="lock" size={12} /> Los demás minijuegos se desbloquean
      conforme avance el Jamboree.
    </p>
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
          <ScoutIcon name={"clock" as ScoutIconName} size={10} /> {g.time}
        </span>
      </div>

      <div style={{ padding: 12 }}>
        <div className="t-display-sm" style={{ fontSize: 14 }}>
          {g.title}
        </div>
        <div className="t-caption text-muted" style={{ marginTop: 2 }}>
          {g.sub}
        </div>
        <div
          className="hstack t-caption"
          style={{
            marginTop: 10,
            gap: 5,
            color: "var(--primary)",
            fontWeight: 700,
          }}
        >
          <ScoutIcon name="check" size={12} stroke={2.4} />
          Jugado esta temporada
        </div>
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
