import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { Shield } from "@/components/scout/shield";
import { XpBar } from "@/components/scout/xp-bar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { Avatar } from "@/components/scout/avatar";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import {
  getActiveJamboree,
  getJamboreeLeaderboard,
  getTeamLeaderboard,
  type TeamLeaderboardEntry,
  type LeaderboardEntry,
} from "@/lib/games/queries";
import { getUserTeam } from "@/lib/teams/queries";

type TeamColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

function colorOf(c: string | null | undefined): TeamColor {
  const valid: TeamColor[] = [
    "mint",
    "gold",
    "rose",
    "purple",
    "orange",
    "sky",
    "teal",
  ];
  return (valid as string[]).includes(c ?? "") ? (c as TeamColor) : "mint";
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: "teams" | "individual" }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "individual" ? "individual" : "teams";

  const auth = await getAuthState();
  const jamboree = await getActiveJamboree();
  const teamRows = jamboree ? await getTeamLeaderboard(jamboree.id, 20) : [];
  const userRows = jamboree
    ? await getJamboreeLeaderboard(jamboree.id, 20)
    : [];
  const myTeam = auth.userId ? await getUserTeam(auth.userId) : null;
  const myUserId = auth.userId ?? null;

  return (
    <>
      <Topbar
        auth={auth}
        greeting="Ranking"
        subtitle={
          jamboree
            ? `${jamboree.name} — ${formatDateRange(jamboree.starts_at, jamboree.ends_at)}`
            : "Las patrullas más activas de la tropa"
        }
        notifications={0}
      />

      <div className="vstack" style={{ gap: 20 }}>
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/leaderboard"
            className={`btn ${tab === "teams" ? "btn-secondary" : "btn-ghost"}`}
          >
            <ScoutIcon name="users" size={16} /> Patrullas
          </Link>
          <Link
            href="/leaderboard?tab=individual"
            className={`btn ${tab === "individual" ? "btn-secondary" : "btn-ghost"}`}
          >
            <ScoutIcon name="user" size={16} /> Individual
          </Link>
          {myTeam && (
            <Link
              href="/leaderboard/patrulla"
              className="btn btn-ghost"
              title={`Ranking interno de ${myTeam.name}`}
            >
              <ScoutIcon name="shield" size={16} /> Mi patrulla
            </Link>
          )}
          <div style={{ flex: 1 }} />
          <span className="chip chip-accent">
            <ScoutIcon name="flame" size={12} /> Esta semana
          </span>
        </div>

        {jamboree == null ? (
          <NoJamboree />
        ) : tab === "teams" ? (
          <TeamsView rows={teamRows} myTeamId={myTeam?.id ?? null} />
        ) : (
          <IndividualView rows={userRows} myUserId={myUserId} />
        )}
      </div>
    </>
  );
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString("es", { day: "numeric", month: "short" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function NoJamboree() {
  return (
    <section
      className="scout-card"
      style={{ padding: 32, textAlign: "center" }}
    >
      <div className="grid place-items-center" style={{ marginBottom: 14 }}>
        <BadgeCircle color="rose" size={56}>
          <ScoutIcon name="flame" size={26} />
        </BadgeCircle>
      </div>
      <h2 className="t-display-sm" style={{ margin: "0 0 6px" }}>
        Sin temporada activa
      </h2>
      <p className="t-body-sm text-muted" style={{ maxWidth: 360, margin: "0 auto" }}>
        El primer jamboree arranca al iniciar tu primer minijuego.
      </p>
    </section>
  );
}

function TeamsView({
  rows,
  myTeamId,
}: {
  rows: TeamLeaderboardEntry[];
  myTeamId: string | null;
}) {
  if (rows.length === 0) {
    return (
      <section className="scout-card" style={{ padding: 32, textAlign: "center" }}>
        <div className="grid place-items-center" style={{ marginBottom: 14 }}>
          <BadgeCircle color="mint" size={56}>
            <ScoutIcon name="users" size={26} />
          </BadgeCircle>
        </div>
        <h2 className="t-display-sm" style={{ margin: "0 0 6px" }}>
          Aún no hay patrullas en el ranking
        </h2>
        <p className="t-body-sm text-muted" style={{ maxWidth: 380, margin: "0 auto" }}>
          Sé la primera patrulla en jugar esta semana.
        </p>
      </section>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const maxPoints = rows[0]?.total_points || 1;

  return (
    <>
      {top3.length > 0 && <Podium rows={top3} />}
      <section className="scout-card" style={{ padding: 18 }}>
        <div
          className="t-overline"
          style={{
            display: "grid",
            gridTemplateColumns: "40px 64px 1fr 120px 100px",
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
        </div>
        <div className="vstack" style={{ gap: 6 }}>
          {rows.map((t) => {
            const isYou = myTeamId === t.team_id;
            const color = colorOf(t.color);
            return (
              <div
                key={t.team_id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "40px 64px 1fr 120px 100px",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: "var(--r-md)",
                  background: isYou
                    ? "color-mix(in oklch, var(--primary) 10%, transparent)"
                    : t.rank_position === 1
                      ? "color-mix(in oklch, var(--accent) 8%, transparent)"
                      : "var(--surface)",
                  border: isYou
                    ? "1px solid color-mix(in oklch, var(--primary) 30%, transparent)"
                    : t.rank_position === 1
                      ? "1px solid color-mix(in oklch, var(--accent) 30%, transparent)"
                      : "1px solid transparent",
                }}
              >
                <span
                  className="t-display-sm"
                  style={{
                    color:
                      t.rank_position <= 3 ? "var(--accent)" : "var(--fg-muted)",
                    textAlign: "center",
                  }}
                >
                  {t.rank_position}
                </span>
                <Shield
                  letter={t.emblem ?? t.name.charAt(0).toUpperCase()}
                  color={color}
                  size={48}
                />
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
                    {isYou && (
                      <span className="chip" style={{ fontSize: 9 }}>
                        Tu patrulla
                      </span>
                    )}
                  </div>
                  <div className="t-caption text-muted">
                    {t.members_active}{" "}
                    {t.members_active === 1 ? "scout activo" : "scouts activos"}
                  </div>
                </div>
                <XpBar
                  value={t.total_points}
                  max={maxPoints}
                  variant={t.rank_position === 1 ? "gold" : "primary"}
                />
                <span
                  className="t-num"
                  style={{
                    fontSize: 18,
                    textAlign: "right",
                    color:
                      t.rank_position === 1 ? "var(--accent)" : "var(--fg)",
                  }}
                >
                  {t.total_points.toLocaleString("es")}
                </span>
              </div>
            );
          })}
        </div>
        {rest.length === 0 && rows.length <= 3 && (
          <p
            className="t-caption text-muted"
            style={{ textAlign: "center", marginTop: 16 }}
          >
            Solo {rows.length}{" "}
            {rows.length === 1 ? "patrulla compite" : "patrullas compiten"} esta
            semana.
          </p>
        )}
      </section>
    </>
  );
}

function Podium({ rows }: { rows: TeamLeaderboardEntry[] }) {
  const [a, b, c] = [rows[1], rows[0], rows[2]];

  return (
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
        {a ? (
          <PodiumColumn entry={a} height={90} />
        ) : (
          <div />
        )}

        {/* 1st */}
        {b ? (
          <PodiumColumn entry={b} height={120} highlight />
        ) : (
          <div />
        )}

        {/* 3rd */}
        {c ? (
          <PodiumColumn entry={c} height={70} />
        ) : (
          <div />
        )}
      </div>
    </section>
  );
}

function PodiumColumn({
  entry,
  height,
  highlight = false,
}: {
  entry: TeamLeaderboardEntry;
  height: number;
  highlight?: boolean;
}) {
  const color = colorOf(entry.color);
  return (
    <div className="text-center">
      {highlight && (
        <div className="flex justify-center" style={{ marginBottom: 6 }}>
          <BadgeCircle color="gold" size={36}>
            <ScoutIcon name="trophy" size={18} />
          </BadgeCircle>
        </div>
      )}
      <div className="flex justify-center">
        <Shield
          letter={entry.emblem ?? entry.name.charAt(0).toUpperCase()}
          color={color}
          size={highlight ? 80 : 64}
        />
      </div>
      <div
        style={{
          marginTop: 10,
          fontWeight: 800,
          fontSize: highlight ? 18 : 16,
          color: highlight ? "var(--accent)" : "var(--fg)",
        }}
      >
        {entry.name}
      </div>
      <div
        className="t-num"
        style={{
          fontSize: highlight ? 28 : 22,
          marginTop: 4,
          color: highlight ? "var(--accent)" : "var(--fg)",
        }}
      >
        {entry.total_points.toLocaleString("es")}
      </div>
      <div
        className="grid place-items-center"
        style={{
          marginTop: 12,
          height,
          borderRadius: "var(--r-md) var(--r-md) 0 0",
          background: highlight
            ? "linear-gradient(180deg, color-mix(in oklch, var(--accent) 35%, transparent), color-mix(in oklch, var(--accent) 15%, transparent))"
            : entry.rank_position === 2
              ? "color-mix(in oklch, var(--fg) 12%, transparent)"
              : "color-mix(in oklch, var(--c-rose) 18%, transparent)",
          border: highlight
            ? "1px solid color-mix(in oklch, var(--accent) 40%, transparent)"
            : undefined,
        }}
      >
        <span
          className="t-display-2xl"
          style={{
            fontSize: highlight ? 72 : entry.rank_position === 2 ? 56 : 48,
            color: highlight
              ? "var(--accent)"
              : entry.rank_position === 2
                ? "var(--fg-muted)"
                : "color-mix(in oklch, var(--c-rose) 80%, var(--fg))",
          }}
        >
          {entry.rank_position}
        </span>
      </div>
    </div>
  );
}

function IndividualView({
  rows,
  myUserId,
}: {
  rows: LeaderboardEntry[];
  myUserId: string | null;
}) {
  if (rows.length === 0) {
    return (
      <section className="scout-card" style={{ padding: 32, textAlign: "center" }}>
        <div className="grid place-items-center" style={{ marginBottom: 14 }}>
          <BadgeCircle color="purple" size={56}>
            <ScoutIcon name="user" size={26} />
          </BadgeCircle>
        </div>
        <h2 className="t-display-sm" style={{ margin: "0 0 6px" }}>
          Aún no hay scouts en el ranking
        </h2>
        <p className="t-body-sm text-muted" style={{ maxWidth: 380, margin: "0 auto" }}>
          Sé el primero en jugar y ponerle nombre al podio.
        </p>
      </section>
    );
  }

  const maxPoints = rows[0]?.total_points || 1;

  return (
    <section className="scout-card" style={{ padding: 18 }}>
      <div
        className="t-overline"
        style={{
          display: "grid",
          gridTemplateColumns: "40px 56px 1fr 120px 100px",
          gap: 12,
          padding: "8px 12px",
          color: "var(--fg-soft)",
        }}
      >
        <div>#</div>
        <div></div>
        <div>Scout</div>
        <div>Progreso</div>
        <div style={{ textAlign: "right" }}>Puntos</div>
      </div>
      <div className="vstack" style={{ gap: 6 }}>
        {rows.map((u) => {
          const isYou = myUserId === u.user_id;
          const color = colorOf(u.team_color);
          return (
            <div
              key={u.user_id}
              className="grid items-center"
              style={{
                gridTemplateColumns: "40px 56px 1fr 120px 100px",
                gap: 12,
                padding: "10px 12px",
                borderRadius: "var(--r-md)",
                background: isYou
                  ? "color-mix(in oklch, var(--primary) 10%, transparent)"
                  : u.rank_position === 1
                    ? "color-mix(in oklch, var(--accent) 8%, transparent)"
                    : "var(--surface)",
                border: isYou
                  ? "1px solid color-mix(in oklch, var(--primary) 30%, transparent)"
                  : u.rank_position === 1
                    ? "1px solid color-mix(in oklch, var(--accent) 30%, transparent)"
                    : "1px solid transparent",
              }}
            >
              <span
                className="t-display-sm"
                style={{
                  color:
                    u.rank_position <= 3 ? "var(--accent)" : "var(--fg-muted)",
                  textAlign: "center",
                }}
              >
                {u.rank_position}
              </span>
              <Avatar
                name={u.display_name ?? u.username}
                size={40}
                color={color}
                ring={isYou}
              />
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
                  {u.display_name ?? u.username}
                  {isYou && (
                    <span className="chip" style={{ fontSize: 9 }}>
                      Tú
                    </span>
                  )}
                </div>
                <div className="t-caption text-muted">
                  @{u.username}
                  {u.team_name && ` · ${u.team_name}`}
                </div>
              </div>
              <XpBar
                value={u.total_points}
                max={maxPoints}
                variant={u.rank_position === 1 ? "gold" : "primary"}
              />
              <span
                className="t-num"
                style={{
                  fontSize: 18,
                  textAlign: "right",
                  color:
                    u.rank_position === 1 ? "var(--accent)" : "var(--fg)",
                }}
              >
                {u.total_points.toLocaleString("es")}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
