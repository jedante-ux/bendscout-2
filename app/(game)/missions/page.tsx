import { Topbar } from "@/components/scout/topbar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import {
  getActiveMissions,
  type MissionWithProgress,
} from "@/lib/missions/queries";
import type { MissionColor } from "@/lib/missions/registry";

// Demo fallback when the user is not authenticated.
const DEMO_MISSIONS: MissionWithProgress[] = [
  {
    slug: "explorador-digital",
    title: "Explorador Digital",
    description: "Completa 5 partidas puntuables",
    icon: "leaf",
    color: "mint",
    target: 5,
    xpReward: 150,
    kind: "individual",
    metric: "count",
    progress: 3,
    completed: false,
  },
  {
    slug: "coleccionista",
    title: "Coleccionista",
    description: "Juega 3 minijuegos distintos",
    icon: "shield",
    color: "rose",
    target: 3,
    xpReward: 100,
    kind: "individual",
    metric: "count",
    progress: 1,
    completed: false,
  },
  {
    slug: "racha-ganadora",
    title: "Racha Ganadora",
    description: "Alcanza 7 días de racha",
    icon: "flame",
    color: "orange",
    target: 7,
    xpReward: 200,
    kind: "individual",
    metric: "count",
    progress: 5,
    completed: false,
  },
  {
    slug: "aullido-coordinado",
    title: "Aullido coordinado",
    description: "Todos los miembros de tu patrulla juegan hoy",
    icon: "users",
    color: "mint",
    target: 100,
    xpReward: 500,
    kind: "team",
    metric: "percent",
    progress: 75,
    completed: false,
  },
  {
    slug: "patrulla-en-racha",
    title: "Patrulla en racha",
    description: "Tu patrulla suma 1 000 pts esta semana",
    icon: "flame",
    color: "purple",
    target: 1000,
    xpReward: 800,
    kind: "team",
    metric: "points",
    progress: 330,
    completed: false,
  },
];

export default async function MissionsPage() {
  const auth = await getAuthState();
  const missions =
    auth.authenticated && auth.userId
      ? await getActiveMissions(auth.userId)
      : DEMO_MISSIONS;

  const active = missions.filter((m) => m.kind === "individual" && !m.completed);
  const patrol = missions.filter((m) => m.kind === "team");
  const done = missions.filter((m) => m.completed);

  const inProgressCount = active.length;
  const patrolCount = patrol.length;
  const doneCount = done.length;
  const xpFromDone = done.reduce((acc, m) => acc + m.xpReward, 0);

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
          <MiniStat
            label="En progreso"
            value={inProgressCount.toString()}
            sub={`de ${missions.length} disponibles`}
            icon="flag"
            color="mint"
          />
          <MiniStat
            label="Patrulla"
            value={patrolCount.toString()}
            sub="activas con tu equipo"
            icon="users"
            color="purple"
          />
          <MiniStat
            label="Completadas"
            value={doneCount.toString()}
            link="Ver historial →"
            icon="check"
            color="gold"
          />
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
              +{xpFromDone.toLocaleString("es")}
            </div>
            <div className="t-caption text-muted" style={{ marginTop: 4 }}>
              ganados al completar
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterButton label="Todas" count={missions.length} active />
          <FilterButton label="Individuales" count={missions.filter((m) => m.kind === "individual").length} />
          <FilterButton label="Patrulla" count={patrolCount} />
          <FilterButton label="Completadas" count={doneCount} />
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
              {active.length}{" "}
              {active.length === 1 ? "misión" : "misiones"} en progreso
            </span>
          </div>
          {active.length === 0 ? (
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
                name="check"
                size={28}
                style={{ color: "var(--fg-soft)" }}
              />
              No tienes misiones individuales pendientes.
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {active.map((m) => {
                const pct = Math.round((m.progress / m.target) * 100);
                return (
                  <div
                    key={m.slug}
                    className="scout-card"
                    style={{ padding: 18 }}
                  >
                    <div className="between" style={{ marginBottom: 12 }}>
                      <BadgeCircle color={m.color} size={48} ringed>
                        <ScoutIcon name={m.icon} size={22} />
                      </BadgeCircle>
                      <span className="chip chip-rose">⏱ Sin fecha</span>
                    </div>
                    <div className="t-h3" style={{ marginBottom: 4 }}>
                      {m.title}
                    </div>
                    <div
                      className="t-body-sm text-muted"
                      style={{ marginBottom: 14 }}
                    >
                      {m.description}
                    </div>
                    <XpBar value={m.progress} max={m.target} />
                    <div className="between" style={{ marginTop: 8 }}>
                      <span className="t-caption text-muted">
                        {formatProgressLabel(m, pct)}
                      </span>
                      <span
                        className="t-mono"
                        style={{ color: "var(--primary)", fontWeight: 700 }}
                      >
                        +{m.xpReward} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Patrol missions */}
        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h2">De patrulla</span>
            <span className="t-caption text-muted">Con tu tropa</span>
          </div>
          {patrol.length === 0 ? (
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
                name="users"
                size={28}
                style={{ color: "var(--fg-soft)" }}
              />
              No hay misiones de patrulla disponibles.
            </div>
          ) : (
            <div className="scout-card" style={{ padding: 14 }}>
              {patrol.map((m, i) => {
                const pct = Math.round((m.progress / m.target) * 100);
                return (
                  <div key={m.slug}>
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
                          {m.completed && (
                            <ScoutIcon
                              name="check"
                              size={14}
                              className="text-primary-token"
                              style={{ marginLeft: 6 }}
                            />
                          )}
                        </div>
                        <div className="t-caption text-muted">
                          {m.description}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <XpBar value={m.progress} max={m.target} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className="mission-xp">+{m.xpReward} XP</span>
                        <div
                          className="t-caption text-muted"
                          style={{ marginTop: 4 }}
                        >
                          {formatProgressLabel(m, pct)}
                        </div>
                      </div>
                    </div>
                    {i < patrol.length - 1 && (
                      <hr className="divider" style={{ margin: "8px 0" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
          {done.length === 0 ? (
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
              Aún no completas misiones. ¡Sigue jugando!
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {done.map((m) => (
                <div
                  key={m.slug}
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
                      <div className="t-caption text-muted">
                        {m.description}
                      </div>
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
                        +{m.xpReward}
                      </span>
                      <div
                        className="t-caption text-muted"
                        style={{ marginTop: 2 }}
                      >
                        Completada
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function formatProgressLabel(m: MissionWithProgress, pct: number) {
  if (m.metric === "percent") return `${m.progress}% completado`;
  if (m.metric === "points")
    return `${m.progress.toLocaleString("es")} / ${m.target.toLocaleString(
      "es",
    )} pts`;
  // count
  return `${m.progress} / ${m.target} (${pct}%)`;
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
