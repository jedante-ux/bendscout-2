import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import {
  getUserTrophies,
  countUnlockedTrophies,
  type TrophyWithProgress,
} from "@/lib/trophies/queries";
import {
  TROPHIES,
  TROPHIES_TOTAL,
  rarityOrder,
  type TrophyRarity,
} from "@/lib/trophies/registry";

type FilterRarity = "todos" | "comunes" | "raros" | "epicos";

const RARITY_FROM_FILTER: Record<Exclude<FilterRarity, "todos">, TrophyRarity> =
  {
    comunes: "Común",
    raros: "Raro",
    epicos: "Épico",
  };

const RARITY_COLOR: Record<TrophyRarity, string> = {
  Épico: "var(--c-purple)",
  Raro: "var(--c-sky)",
  Común: "var(--fg-muted)",
};

// Trofeos demo para visitantes sin sesión.
const DEMO_TROPHIES: TrophyWithProgress[] = TROPHIES.map((def) => ({
  def,
  progress: 0,
  target: def.target,
  unlocked: false,
  achievedAt: null,
}));

function parseFilter(value: string | undefined): FilterRarity {
  if (value === "comunes" || value === "raros" || value === "epicos")
    return value;
  return "todos";
}

function formatAchievedDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatProgress(t: TrophyWithProgress): string {
  // Para targets pequeños (1) mostramos la frase, no la fracción.
  if (t.target === 1) return t.unlocked ? "Logrado" : "Pendiente";
  return `${Math.min(t.progress, t.target).toLocaleString("es")} / ${t.target.toLocaleString("es")}`;
}

function rankFromUnlocked(unlocked: number): string {
  if (unlocked >= 11) return "Leyenda";
  if (unlocked >= 8) return "Pionero";
  if (unlocked >= 5) return "Explorador";
  if (unlocked >= 2) return "Scout";
  return "Lobato";
}

export default async function TrophiesPage({
  searchParams,
}: {
  searchParams: Promise<{ rarity?: string; status?: string }>;
}) {
  const params = await searchParams;
  const rarityFilter = parseFilter(params.rarity);
  const showLocked = params.status !== "unlocked"; // default: muestra ambos

  const auth = await getAuthState();
  const trophies =
    auth.authenticated && auth.userId
      ? await getUserTrophies(auth.userId)
      : DEMO_TROPHIES;

  const unlockedCount = countUnlockedTrophies(trophies);

  // Filtrado por rareza para el grid principal.
  const visible =
    rarityFilter === "todos"
      ? trophies
      : trophies.filter(
          (t) => t.def.rarity === RARITY_FROM_FILTER[rarityFilter],
        );

  const unlocked = visible
    .filter((t) => t.unlocked)
    .sort((a, b) => {
      // épicos primero, después por fecha desc.
      const r = rarityOrder(a.def.rarity) - rarityOrder(b.def.rarity);
      if (r !== 0) return r;
      const aDate = a.achievedAt ? Date.parse(a.achievedAt) : 0;
      const bDate = b.achievedAt ? Date.parse(b.achievedAt) : 0;
      return bDate - aDate;
    });

  const locked = visible
    .filter((t) => !t.unlocked)
    .sort((a, b) => {
      // Bloqueados ordenados por "más cerca de desbloquear" (mayor % de
      // progreso primero), épicos al final cuando hay empates.
      const pa = a.progress / a.target;
      const pb = b.progress / b.target;
      if (pa !== pb) return pb - pa;
      return rarityOrder(b.def.rarity) - rarityOrder(a.def.rarity);
    });

  const rankName = rankFromUnlocked(unlockedCount);

  return (
    <>
      <Topbar
        auth={auth}
        greeting="Trofeos"
        subtitle="Tus logros más raros y especiales"
        notifications={0}
      />

      <div className="vstack" style={{ gap: 20 }}>
        {/* Hero */}
        <section
          className="scout-card"
          style={{ padding: 28, position: "relative", overflow: "hidden" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 50% 80% at 80% 50%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 60%)",
            }}
          />
          <div
            className="relative grid items-center"
            style={{ gridTemplateColumns: "1fr auto", gap: 28 }}
          >
            <div>
              <span className="rank-tag">Rango · {rankName}</span>
              <div
                className="t-display-xl"
                style={{ margin: "8px 0 6px", fontSize: 44 }}
              >
                {unlockedCount}{" "}
                <span className="text-muted" style={{ fontSize: 28 }}>
                  de {TROPHIES_TOTAL} trofeos
                </span>
              </div>
              <p
                className="t-body text-muted"
                style={{ margin: 0, maxWidth: 480 }}
              >
                Los trofeos son logros únicos que no caducan. Más raros que las
                insignias, reflejan momentos especiales de tu camino scout.
              </p>
            </div>
            <div className="flex" style={{ gap: 12 }}>
              <BadgeCircle color="gold" size={96} ringed pulse>
                <ScoutIcon name="trophy" size={44} stroke={1.8} />
              </BadgeCircle>
              <BadgeCircle color="purple" size={72} ringed>
                <ScoutIcon name="starfill" size={32} stroke={2.0} />
              </BadgeCircle>
              <BadgeCircle color="rose" size={72} ringed>
                <ScoutIcon name="shield" size={32} />
              </BadgeCircle>
            </div>
          </div>
        </section>

        {/* Unlocked */}
        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h2">Desbloqueados</span>
            <div className="flex gap-1.5">
              <RarityFilter current={rarityFilter} value="todos" label="Todos" />
              <RarityFilter
                current={rarityFilter}
                value="comunes"
                label="Comunes"
              />
              <RarityFilter
                current={rarityFilter}
                value="raros"
                label="Raros"
              />
              <RarityFilter
                current={rarityFilter}
                value="epicos"
                label="Épicos"
              />
            </div>
          </div>
          {unlocked.length === 0 ? (
            <div
              className="scout-card vstack t-body-sm text-muted"
              style={{
                padding: 24,
                textAlign: "center",
                gap: 6,
                alignItems: "center",
              }}
            >
              <ScoutIcon
                name="trophy"
                size={28}
                style={{ color: "var(--fg-soft)" }}
              />
              {auth.authenticated
                ? "Aún no has desbloqueado trofeos. ¡Sigue jugando!"
                : "Inicia sesión para empezar a ganar trofeos."}
              {!auth.authenticated && (
                <Link
                  href="/login?next=/trophies"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 8 }}
                >
                  Entrar
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {unlocked.map((t) => {
                const rc = RARITY_COLOR[t.def.rarity];
                const date = formatAchievedDate(t.achievedAt);
                return (
                  <div
                    key={t.def.slug}
                    className="scout-card"
                    style={{ padding: 18 }}
                  >
                    <div className="between" style={{ marginBottom: 12 }}>
                      <BadgeCircle color={t.def.color} size={56} ringed>
                        <ScoutIcon name={t.def.icon} size={26} />
                      </BadgeCircle>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: `color-mix(in oklch, ${rc} 16%, transparent)`,
                          color: rc,
                          border: `1px solid color-mix(in oklch, ${rc} 30%, transparent)`,
                        }}
                      >
                        {t.def.rarity}
                      </span>
                    </div>
                    <div className="t-h3" style={{ marginBottom: 2 }}>
                      {t.def.title}
                    </div>
                    <div
                      className="t-caption text-muted"
                      style={{ marginBottom: 12 }}
                    >
                      {t.def.description}
                    </div>
                    <div
                      className="t-caption text-soft hstack"
                      style={{ gap: 6 }}
                    >
                      <ScoutIcon
                        name="check"
                        size={12}
                        style={{ color: "var(--c-mint)" }}
                      />{" "}
                      {date ? `Conseguido · ${date}` : "Conseguido"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Locked */}
        {showLocked && locked.length > 0 && (
          <section>
            <div className="between" style={{ marginBottom: 12 }}>
              <span className="t-h2">Por desbloquear</span>
              <span className="t-caption text-muted">
                {locked.length}{" "}
                {locked.length === 1 ? "trofeo restante" : "trofeos restantes"}
              </span>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {locked.map((t) => {
                const rc = RARITY_COLOR[t.def.rarity];
                const pct = Math.round(
                  (Math.min(t.progress, t.target) / t.target) * 100,
                );
                return (
                  <div
                    key={t.def.slug}
                    className="scout-card"
                    style={{ padding: 18 }}
                  >
                    <div className="between" style={{ marginBottom: 12 }}>
                      <BadgeCircle color="locked" size={56}>
                        <ScoutIcon name="lock" size={26} />
                      </BadgeCircle>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: `color-mix(in oklch, ${rc} 12%, transparent)`,
                          color: rc,
                          border: `1px solid color-mix(in oklch, ${rc} 24%, transparent)`,
                        }}
                      >
                        {t.def.rarity}
                      </span>
                    </div>
                    <div
                      className="t-h3"
                      style={{ marginBottom: 2, color: "var(--fg-soft)" }}
                    >
                      {t.def.title}
                    </div>
                    <div
                      className="t-caption text-muted"
                      style={{ marginBottom: 10 }}
                    >
                      {t.def.description}
                    </div>
                    <XpBar value={Math.min(t.progress, t.target)} max={t.target} />
                    <div className="between" style={{ marginTop: 8 }}>
                      <span className="t-caption text-muted">
                        {formatProgress(t)}
                      </span>
                      <span
                        className="t-mono"
                        style={{ fontWeight: 700, color: "var(--fg-soft)" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function RarityFilter({
  current,
  value,
  label,
}: {
  current: FilterRarity;
  value: FilterRarity;
  label: string;
}) {
  const href =
    value === "todos" ? "/trophies" : `/trophies?rarity=${value}`;
  const active = current === value;
  return (
    <Link
      href={href}
      className={`btn btn-sm ${active ? "btn-secondary" : "btn-ghost"}`}
    >
      {label}
    </Link>
  );
}
