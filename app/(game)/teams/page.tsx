import { Topbar } from "@/components/scout/topbar";
import { Shield } from "@/components/scout/shield";
import { Avatar } from "@/components/scout/avatar";
import { XpBar } from "@/components/scout/xp-bar";
import { MissionCard } from "@/components/scout/mission-card";
import { ScoutIcon } from "@/components/scout/icon";

type MemberColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface Member {
  name: string;
  role: string;
  xp: number;
  pos: number;
  you?: boolean;
  color: MemberColor;
}

const MEMBERS: Member[] = [
  { name: "ScoutMaster", role: "Líder", xp: 8560, pos: 1, you: true, color: "mint" },
  { name: "AnaForest", role: "Subjefe", xp: 7820, pos: 2, color: "purple" },
  { name: "LeoTrail", role: "Scout", xp: 6210, pos: 3, color: "sky" },
  { name: "MiaKnot", role: "Scout", xp: 5440, pos: 4, color: "rose" },
  { name: "DanWolf", role: "Scout", xp: 4910, pos: 5, color: "orange" },
  { name: "SofPine", role: "Scout", xp: 4230, pos: 6, color: "teal" },
  { name: "TomFire", role: "Scout", xp: 3850, pos: 7, color: "gold" },
  { name: "EvaOak", role: "Novato", xp: 1290, pos: 8, color: "mint" },
];

export default function TeamsPage() {
  return (
    <>
      <Topbar
        greeting="Mi patrulla"
        subtitle="Lobos del Bosque · Tropa 14"
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
                "radial-gradient(ellipse 50% 100% at 100% 50%, color-mix(in oklch, var(--c-mint) 22%, transparent), transparent 70%)",
            }}
          />
          <div
            className="relative grid items-center"
            style={{ gridTemplateColumns: "auto 1fr auto", gap: 28 }}
          >
            <Shield letter="L" color="mint" size={120} />
            <div>
              <span
                className="rank-tag"
                style={{
                  background:
                    "color-mix(in oklch, var(--c-mint) 16%, transparent)",
                  color: "var(--c-mint)",
                  borderColor:
                    "color-mix(in oklch, var(--c-mint) 30%, transparent)",
                }}
              >
                Patrulla mint
              </span>
              <div
                className="t-display-xl"
                style={{ margin: "8px 0 4px", fontSize: 44 }}
              >
                Lobos del Bosque
              </div>
              <div className="t-body-sm text-muted">
                &quot;Aullamos en equipo, ganamos en equipo.&quot; · Fundada en
                marzo 2025
              </div>
              <div className="flex flex-wrap" style={{ gap: 28, marginTop: 18 }}>
                <Stat label="Posición" value="#2" color="var(--accent)" />
                <Stat label="Puntos" value="38 940" />
                <Stat label="Scouts" value="8" />
                <Stat label="Racha" value="12d" color="var(--c-orange)" />
              </div>
            </div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <button className="btn btn-primary">
                <ScoutIcon name="users" size={16} /> Invitar scout
              </button>
              <button className="btn btn-secondary">
                <ScoutIcon name="flag" size={16} /> Retar tropa
              </button>
              <button className="btn btn-ghost btn-sm">
                Chat de patrulla →
              </button>
            </div>
          </div>
        </section>

        {/* Members + side cards */}
        <section
          className="grid gap-4"
          style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}
        >
          <div className="scout-card" style={{ padding: 18 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <span className="t-h3">Scouts de la patrulla</span>
              <button className="btn btn-ghost btn-sm">
                <ScoutIcon name="filter" size={14} /> Ordenar
              </button>
            </div>
            <div className="vstack" style={{ gap: 6 }}>
              {MEMBERS.map((m) => (
                <div
                  key={m.name}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: "28px auto 1fr auto auto",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--r-md)",
                    background: m.you
                      ? "color-mix(in oklch, var(--primary) 10%, transparent)"
                      : "var(--surface)",
                    border: m.you
                      ? "1px solid color-mix(in oklch, var(--primary) 30%, transparent)"
                      : "1px solid transparent",
                  }}
                >
                  <span
                    className="t-display-sm"
                    style={{
                      color: m.pos <= 3 ? "var(--accent)" : "var(--fg-muted)",
                      textAlign: "center",
                    }}
                  >
                    {m.pos}
                  </span>
                  <Avatar name={m.name} size={40} color={m.color} ring={m.you} />
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {m.name}
                      {m.you && (
                        <span className="chip" style={{ fontSize: 9 }}>
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="t-caption text-muted">{m.role}</div>
                  </div>
                  <div style={{ width: 120 }}>
                    <XpBar value={m.xp} max={9000} />
                  </div>
                  <span
                    className="t-mono"
                    style={{
                      fontWeight: 700,
                      color: "var(--accent)",
                      minWidth: 70,
                      textAlign: "right",
                    }}
                  >
                    {m.xp.toLocaleString("es")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="vstack" style={{ gap: 16 }}>
            <div className="scout-card" style={{ padding: 18 }}>
              <div className="between" style={{ marginBottom: 10 }}>
                <span className="t-h3">Misiones de patrulla</span>
                <span className="chip chip-accent">2 activas</span>
              </div>
              <div className="vstack" style={{ gap: 10 }}>
                <MissionCard
                  title="Aullido coordinado"
                  description="Todos juegan hoy"
                  icon={<ScoutIcon name="users" size={18} />}
                  iconColor="mint"
                  xpReward={500}
                  progress={{ value: 75, max: 100 }}
                />
                <MissionCard
                  title="Cazar la luna"
                  description="Ganar 3 retos seguidos"
                  icon={<ScoutIcon name="flame" size={18} />}
                  iconColor="purple"
                  xpReward={800}
                  progress={{ value: 33, max: 100 }}
                />
              </div>
            </div>

            <div className="scout-card" style={{ padding: 18 }}>
              <div className="between" style={{ marginBottom: 10 }}>
                <span className="t-h3">Próximo desafío</span>
                <span className="chip chip-rose">⏱ 2d 4h</span>
              </div>
              <div className="flex items-center" style={{ gap: 12 }}>
                <Shield letter="A" color="rose" size={56} />
                <div
                  style={{
                    fontSize: 22,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                  }}
                >
                  VS
                </div>
                <Shield letter="L" color="mint" size={56} />
              </div>
              <div className="t-body-sm text-muted" style={{ marginTop: 10 }}>
                Las{" "}
                <b style={{ color: "var(--c-rose)" }}>Águilas Reales</b> los han
                retado. Modo: Memoria Visual · Mejor de 5.
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 12 }}
              >
                Aceptar desafío
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
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
      <div className="t-num" style={{ fontSize: 32, color }}>
        {value}
      </div>
    </div>
  );
}
