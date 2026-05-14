import { Topbar } from "@/components/scout/topbar";
import { Shield } from "@/components/scout/shield";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon } from "@/components/scout/icon";

type TeamColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface TeamRow {
  pos: number;
  letter: string;
  color: TeamColor;
  name: string;
  members: number;
  pts: number;
  delta: string;
  up?: boolean;
  you?: boolean;
}

const TEAMS: TeamRow[] = [
  { pos: 1, letter: "S", color: "gold", name: "Serpientes Plata", members: 9, pts: 42180, delta: "+8%", up: true },
  { pos: 2, letter: "L", color: "mint", name: "Lobos del Bosque", members: 8, pts: 38940, delta: "+3%", up: true, you: true },
  { pos: 3, letter: "B", color: "purple", name: "Búhos Nocturnos", members: 7, pts: 31620, delta: "0%" },
  { pos: 4, letter: "A", color: "rose", name: "Águilas Reales", members: 6, pts: 29840, delta: "-2%", up: false },
  { pos: 5, letter: "Z", color: "sky", name: "Zorros Veloces", members: 5, pts: 26430, delta: "+1%", up: true },
  { pos: 6, letter: "P", color: "orange", name: "Pumas Andinos", members: 4, pts: 22810, delta: "+12%", up: true },
  { pos: 7, letter: "C", color: "teal", name: "Castores", members: 6, pts: 18920, delta: "-4%", up: false },
];

export default function LeaderboardPage() {
  return (
    <>
      <Topbar
        greeting="Ranking"
        subtitle="Las patrullas más activas de la tropa esta semana"
        notifications={3}
      />

      <div className="vstack" style={{ gap: 20 }}>
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button className="btn btn-secondary">
            <ScoutIcon name="users" size={16} /> Patrullas
          </button>
          <button className="btn btn-ghost">
            <ScoutIcon name="user" size={16} /> Individual
          </button>
          <button className="btn btn-ghost">Top tropas</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-outline btn-sm">
            <ScoutIcon name="filter" size={14} /> Esta semana
          </button>
        </div>

        {/* Podium */}
        <section
          className="scout-card"
          style={{ padding: 24, position: "relative", overflow: "hidden" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 50% 80% at 50% 0%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 60%)",
            }}
          />
          <div
            className="relative grid items-end"
            style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
          >
            {/* 2nd */}
            <div className="text-center">
              <div className="flex justify-center">
                <Shield letter="L" color="mint" size={64} />
              </div>
              <div style={{ marginTop: 10, fontWeight: 800, fontSize: 16 }}>
                Lobos del Bosque
              </div>
              <div className="t-num" style={{ fontSize: 22, marginTop: 4 }}>
                38 940
              </div>
              <div
                className="grid place-items-center"
                style={{
                  marginTop: 12,
                  height: 90,
                  borderRadius: "var(--r-md) var(--r-md) 0 0",
                  background: "color-mix(in oklch, var(--fg) 12%, transparent)",
                }}
              >
                <span
                  className="t-display-2xl"
                  style={{ fontSize: 56, color: "var(--fg-muted)" }}
                >
                  2
                </span>
              </div>
            </div>

            {/* 1st */}
            <div className="text-center">
              <div className="flex justify-center">
                <BadgeCircle color="gold" size={36}>
                  <ScoutIcon name="trophy" size={18} />
                </BadgeCircle>
              </div>
              <div style={{ marginTop: 6 }} className="flex justify-center">
                <Shield letter="S" color="gold" size={80} />
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontWeight: 800,
                  fontSize: 18,
                  color: "var(--accent)",
                }}
              >
                Serpientes Plata
              </div>
              <div
                className="t-num"
                style={{ fontSize: 28, marginTop: 4, color: "var(--accent)" }}
              >
                42 180
              </div>
              <div
                className="grid place-items-center"
                style={{
                  marginTop: 12,
                  height: 120,
                  borderRadius: "var(--r-md) var(--r-md) 0 0",
                  background:
                    "linear-gradient(180deg, color-mix(in oklch, var(--accent) 35%, transparent), color-mix(in oklch, var(--accent) 15%, transparent))",
                  border:
                    "1px solid color-mix(in oklch, var(--accent) 40%, transparent)",
                }}
              >
                <span
                  className="t-display-2xl"
                  style={{ fontSize: 72, color: "var(--accent)" }}
                >
                  1
                </span>
              </div>
            </div>

            {/* 3rd */}
            <div className="text-center">
              <div className="flex justify-center">
                <Shield letter="B" color="purple" size={64} />
              </div>
              <div style={{ marginTop: 10, fontWeight: 800, fontSize: 16 }}>
                Búhos Nocturnos
              </div>
              <div className="t-num" style={{ fontSize: 22, marginTop: 4 }}>
                31 620
              </div>
              <div
                className="grid place-items-center"
                style={{
                  marginTop: 12,
                  height: 70,
                  borderRadius: "var(--r-md) var(--r-md) 0 0",
                  background:
                    "color-mix(in oklch, var(--c-rose) 18%, transparent)",
                }}
              >
                <span
                  className="t-display-2xl"
                  style={{
                    fontSize: 48,
                    color: "color-mix(in oklch, var(--c-rose) 80%, var(--fg))",
                  }}
                >
                  3
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="scout-card" style={{ padding: 18 }}>
          <div
            className="t-overline"
            style={{
              display: "grid",
              gridTemplateColumns: "40px 64px 1fr 120px 100px 80px",
              gap: 12,
              padding: "8px 12px",
              color: "var(--fg-soft)",
            }}
          >
            <div>#</div>
            <div></div>
            <div>Patrulla</div>
            <div>Progreso</div>
            <div style={{ textAlign: "right" }}>Puntos</div>
            <div style={{ textAlign: "right" }}>Δ</div>
          </div>
          <div className="vstack" style={{ gap: 6 }}>
            {TEAMS.map((t) => (
              <div
                key={t.pos}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "40px 64px 1fr 120px 100px 80px",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: "var(--r-md)",
                  background: t.you
                    ? "color-mix(in oklch, var(--primary) 10%, transparent)"
                    : t.pos === 1
                      ? "color-mix(in oklch, var(--accent) 8%, transparent)"
                      : "var(--surface)",
                  border: t.you
                    ? "1px solid color-mix(in oklch, var(--primary) 30%, transparent)"
                    : t.pos === 1
                      ? "1px solid color-mix(in oklch, var(--accent) 30%, transparent)"
                      : "1px solid transparent",
                }}
              >
                <span
                  className="t-display-sm"
                  style={{
                    color: t.pos <= 3 ? "var(--accent)" : "var(--fg-muted)",
                    textAlign: "center",
                  }}
                >
                  {t.pos}
                </span>
                <Shield letter={t.letter} color={t.color} size={48} />
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
                    {t.name}
                    {t.you && (
                      <span className="chip" style={{ fontSize: 9 }}>
                        Tu patrulla
                      </span>
                    )}
                  </div>
                  <div className="t-caption text-muted">
                    {t.members} scouts · racha activa
                  </div>
                </div>
                <XpBar value={t.pts} max={45000} variant={t.pos === 1 ? "gold" : "primary"} />
                <span
                  className="t-num"
                  style={{
                    fontSize: 18,
                    textAlign: "right",
                    color: t.pos === 1 ? "var(--accent)" : "var(--fg)",
                  }}
                >
                  {t.pts.toLocaleString("es")}
                </span>
                <span
                  style={{
                    textAlign: "right",
                    color:
                      t.delta === "0%"
                        ? "var(--fg-soft)"
                        : t.up
                          ? "var(--c-mint)"
                          : "var(--c-rose)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {t.delta}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
