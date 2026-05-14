import { Topbar } from "@/components/scout/topbar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";

type MissionColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface ActiveMission {
  title: string;
  sub: string;
  xp: number;
  progress: number;
  color: MissionColor;
  icon: ScoutIconName;
  deadline: string;
}

interface PatrolMission {
  title: string;
  sub: string;
  xp: number;
  progress: number;
  color: MissionColor;
  icon: ScoutIconName;
}

interface DoneMission {
  title: string;
  sub: string;
  xp: number;
  color: MissionColor;
  icon: ScoutIconName;
  when: string;
}

const ACTIVE: ActiveMission[] = [
  {
    title: "Explorador Digital",
    sub: "Completa 5 minijuegos",
    xp: 150,
    progress: 60,
    color: "mint",
    icon: "leaf",
    deadline: "3 días",
  },
  {
    title: "Coleccionista",
    sub: "Gana 3 insignias diferentes",
    xp: 100,
    progress: 33,
    color: "rose",
    icon: "shield",
    deadline: "1 sem.",
  },
  {
    title: "Racha Ganadora",
    sub: "Gana 10 minijuegos seguidos",
    xp: 200,
    progress: 80,
    color: "orange",
    icon: "flame",
    deadline: "2 días",
  },
];

const PATROL: PatrolMission[] = [
  {
    title: "Aullido coordinado",
    sub: "Todos los Lobos juegan hoy",
    xp: 500,
    progress: 75,
    color: "mint",
    icon: "users",
  },
  {
    title: "Cazar la luna",
    sub: "Ganar 3 retos de patrulla seguidos",
    xp: 800,
    progress: 33,
    color: "purple",
    icon: "flame",
  },
];

const DONE: DoneMission[] = [
  {
    title: "Primer paso",
    sub: "Juega tu primer minijuego",
    xp: 50,
    color: "mint",
    icon: "play",
    when: "Hace 18 días",
  },
  {
    title: "Bienvenido a la tropa",
    sub: "Únete a una patrulla",
    xp: 100,
    color: "sky",
    icon: "users",
    when: "Hace 17 días",
  },
  {
    title: "Madrugador",
    sub: "Juega 3 días seguidos",
    xp: 75,
    color: "orange",
    icon: "flame",
    when: "Hace 12 días",
  },
];

export default function MissionsPage() {
  return (
    <>
      <Topbar
        greeting="Misiones"
        subtitle="Completa retos diarios y semanales"
        notifications={3}
      />

      <div className="vstack" style={{ gap: 20 }}>
        {/* Hero stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="En progreso" value="3" sub="de 12 disponibles" icon="flag" color="mint" />
          <MiniStat label="Patrulla" value="2" sub="activas con tu equipo" icon="users" color="purple" />
          <MiniStat label="Completadas" value="28" link="Ver historial →" icon="check" color="gold" />
          <div
            className="stat-card"
            style={{
              background: "color-mix(in oklch, var(--accent) 10%, transparent)",
              borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)",
            }}
          >
            <div className="between" style={{ marginBottom: 6 }}>
              <span className="stat-label">XP misiones</span>
              <BadgeCircle color="gold" size={32}>
                <ScoutIcon name="starfill" size={16} stroke={2.2} />
              </BadgeCircle>
            </div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>
              +5 240
            </div>
            <div className="t-caption text-muted" style={{ marginTop: 4 }}>
              esta semana
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterButton label="Todas" count={14} active />
          <FilterButton label="Diarias" count={3} />
          <FilterButton label="Semanales" count={5} />
          <FilterButton label="Patrulla" count={2} />
          <FilterButton label="Especiales" />
          <div style={{ flex: 1 }} />
          <button className="btn btn-outline btn-sm">
            <ScoutIcon name="filter" size={14} /> Ordenar
          </button>
        </div>

        {/* Active */}
        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h2">Activas</span>
            <span className="t-caption text-muted">
              3 misiones · termina en menos de 1 semana
            </span>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {ACTIVE.map((m) => (
              <div key={m.title} className="scout-card" style={{ padding: 18 }}>
                <div className="between" style={{ marginBottom: 12 }}>
                  <BadgeCircle color={m.color} size={48} ringed>
                    <ScoutIcon name={m.icon} size={22} />
                  </BadgeCircle>
                  <span className="chip chip-rose">⏱ {m.deadline}</span>
                </div>
                <div className="t-h3" style={{ marginBottom: 4 }}>
                  {m.title}
                </div>
                <div
                  className="t-body-sm text-muted"
                  style={{ marginBottom: 14 }}
                >
                  {m.sub}
                </div>
                <XpBar value={m.progress} max={100} />
                <div className="between" style={{ marginTop: 8 }}>
                  <span className="t-caption text-muted">
                    {m.progress}% completado
                  </span>
                  <span
                    className="t-mono"
                    style={{ color: "var(--primary)", fontWeight: 700 }}
                  >
                    +{m.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Patrol missions */}
        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h2">De patrulla</span>
            <span className="t-caption text-muted">Solo Lobos del Bosque</span>
          </div>
          <div className="scout-card" style={{ padding: 14 }}>
            {PATROL.map((m, i) => (
              <div key={m.title}>
                <div
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 14,
                    padding: "10px 4px",
                  }}
                >
                  <BadgeCircle color={m.color} size={48} ringed>
                    <ScoutIcon name={m.icon} size={22} />
                  </BadgeCircle>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {m.title}
                    </div>
                    <div className="t-caption text-muted">{m.sub}</div>
                    <div style={{ marginTop: 8 }}>
                      <XpBar value={m.progress} max={100} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="mission-xp">+{m.xp} XP</span>
                    <div className="t-caption text-muted" style={{ marginTop: 4 }}>
                      {m.progress}%
                    </div>
                  </div>
                </div>
                {i < PATROL.length - 1 && (
                  <hr className="divider" style={{ margin: "8px 0" }} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Done */}
        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h2">Completadas recientes</span>
            <a
              className="t-caption"
              style={{ color: "var(--primary)", fontWeight: 700 }}
            >
              Ver todas →
            </a>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {DONE.map((m) => (
              <div
                key={m.title}
                className="scout-card"
                style={{ padding: 14, opacity: 0.75 }}
              >
                <div
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 12,
                  }}
                >
                  <BadgeCircle color={m.color} size={40}>
                    <ScoutIcon name={m.icon} size={18} />
                  </BadgeCircle>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {m.title}
                      <ScoutIcon
                        name="check"
                        size={14}
                        className="text-primary-token"
                      />
                    </div>
                    <div className="t-caption text-muted">{m.sub}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      className="t-mono"
                      style={{
                        color: "var(--c-mint)",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      +{m.xp}
                    </span>
                    <div className="t-caption text-muted" style={{ marginTop: 2 }}>
                      {m.when}
                    </div>
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

function MiniStat({
  label,
  value,
  sub,
  link,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  link?: string;
  icon: ScoutIconName;
  color: MissionColor;
}) {
  return (
    <div className="stat-card">
      <div className="between" style={{ marginBottom: 6 }}>
        <span className="stat-label">{label}</span>
        <BadgeCircle color={color} size={32}>
          <ScoutIcon name={icon} size={16} />
        </BadgeCircle>
      </div>
      <div className="stat-value">{value}</div>
      {sub && (
        <div className="t-caption text-muted" style={{ marginTop: 4 }}>
          {sub}
        </div>
      )}
      {link && (
        <a
          className="stat-link"
          style={{ marginTop: 4, display: "inline-block" }}
        >
          {link}
        </a>
      )}
    </div>
  );
}

function FilterButton({
  label,
  count,
  active = false,
}: {
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <button className={`btn ${active ? "btn-secondary" : "btn-ghost"}`}>
      {label}
      {count != null && (
        <span
          className="chip chip-neutral"
          style={{ marginLeft: 6, padding: "2px 6px" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
