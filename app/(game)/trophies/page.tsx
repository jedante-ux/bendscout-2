import { Topbar } from "@/components/scout/topbar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";

type TrophyColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

type Rarity = "Común" | "Raro" | "Épico";

interface Trophy {
  title: string;
  sub: string;
  color: TrophyColor;
  icon: ScoutIconName;
  date: string;
  rare: Rarity;
}

interface LockedTrophy {
  title: string;
  sub: string;
  color: TrophyColor;
}

const RARITY_COLOR: Record<Rarity, string> = {
  Épico: "var(--c-purple)",
  Raro: "var(--c-sky)",
  Común: "var(--fg-muted)",
};

const TROPHIES: Trophy[] = [
  { title: "Maestro de Memoria", sub: "Gana Memoria Visual nivel 5", color: "purple", icon: "starfill", date: "12 mar 2026", rare: "Raro" },
  { title: "Veloz del Bosque", sub: "Termina Camino Seguro en <30s", color: "mint", icon: "flame", date: "08 mar 2026", rare: "Común" },
  { title: "Sabio Scout", sub: "10 respuestas perfectas seguidas", color: "gold", icon: "lightbulb", date: "01 mar 2026", rare: "Épico" },
  { title: "Top Patrulla", sub: "Ranking #1 una semana", color: "rose", icon: "trophy", date: "20 feb 2026", rare: "Épico" },
  { title: "Coleccionista", sub: "10 insignias desbloqueadas", color: "sky", icon: "shield", date: "10 feb 2026", rare: "Raro" },
  { title: "Aullido", sub: "Convocar a toda la patrulla", color: "orange", icon: "users", date: "05 feb 2026", rare: "Común" },
];

const LOCKED: LockedTrophy[] = [
  { title: "Leyenda Scout", sub: "Llega a nivel 50", color: "gold" },
  { title: "Cazador Nocturno", sub: "Juega 7 noches seguidas", color: "purple" },
  { title: "Sin errores", sub: "100 minijuegos sin fallar", color: "mint" },
];

export default function TrophiesPage() {
  return (
    <>
      <Topbar
        greeting="Trofeos"
        subtitle="Tus logros más raros y especiales"
        notifications={3}
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
              <span className="rank-tag">Rango · Pionero</span>
              <div
                className="t-display-xl"
                style={{ margin: "8px 0 6px", fontSize: 44 }}
              >
                6{" "}
                <span className="text-muted" style={{ fontSize: 28 }}>
                  de 24 trofeos
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
              <button className="btn btn-secondary btn-sm">Todos</button>
              <button className="btn btn-ghost btn-sm">Comunes</button>
              <button className="btn btn-ghost btn-sm">Raros</button>
              <button className="btn btn-ghost btn-sm">Épicos</button>
            </div>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {TROPHIES.map((t) => {
              const rc = RARITY_COLOR[t.rare];
              return (
                <div key={t.title} className="scout-card" style={{ padding: 18 }}>
                  <div className="between" style={{ marginBottom: 12 }}>
                    <BadgeCircle color={t.color} size={56} ringed>
                      <ScoutIcon name={t.icon} size={26} />
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
                      {t.rare}
                    </span>
                  </div>
                  <div className="t-h3" style={{ marginBottom: 2 }}>
                    {t.title}
                  </div>
                  <div className="t-caption text-muted" style={{ marginBottom: 12 }}>
                    {t.sub}
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
                    Conseguido · {t.date}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Locked */}
        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h2">Por desbloquear</span>
            <span className="t-caption text-muted">Próximos 3</span>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {LOCKED.map((t) => (
              <div
                key={t.title}
                className="scout-card"
                style={{ padding: 18, opacity: 0.7 }}
              >
                <div className="flex items-center" style={{ gap: 14 }}>
                  <BadgeCircle color="locked" size={56}>
                    <ScoutIcon name="lock" size={26} />
                  </BadgeCircle>
                  <div>
                    <div className="t-h3" style={{ marginBottom: 2 }}>
                      {t.title}
                    </div>
                    <div className="t-caption text-muted">{t.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
