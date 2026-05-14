import Link from "next/link";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/scout/topbar";
import { Shield } from "@/components/scout/shield";
import { Avatar } from "@/components/scout/avatar";
import { XpBar } from "@/components/scout/xp-bar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { getActiveJamboree } from "@/lib/games/queries";
import { getDailyPick } from "@/lib/games/daily";
import { getUserTeam, getPatrolLeaderboard } from "@/lib/teams/queries";
import { getGame } from "@/lib/games/registry";

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

function formatRelative(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Hace instantes";
  if (minutes < 60) return `Hace ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.round(hours / 24);
  return `Hace ${days}d`;
}

export default async function PatrolLeaderboardPage() {
  const auth = await getAuthState();
  if (!auth.authenticated || !auth.userId) {
    redirect("/login");
  }

  const team = await getUserTeam(auth.userId);
  const jamboree = await getActiveJamboree();
  const dailyPick = team ? await getDailyPick(team.id) : null;
  const rows = team
    ? await getPatrolLeaderboard(
        team.id,
        jamboree?.id ?? null,
        dailyPick?.pickedBy ?? null,
      )
    : [];
  const dailyGame = dailyPick ? getGame(dailyPick.gameKey) : null;

  return (
    <>
      <Topbar
        auth={auth}
        greeting={team ? `Patrulla ${team.name}` : "Tu patrulla"}
        subtitle={
          team
            ? "Ranking privado de tus compañeros de patrulla"
            : "Únete a una patrulla para ver su ranking interno"
        }
        notifications={0}
      />

      <div className="vstack" style={{ gap: 20 }}>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link href="/leaderboard" className="btn btn-ghost">
            <ScoutIcon name="users" size={16} /> Entre patrullas
          </Link>
          <Link href="/leaderboard/patrulla" className="btn btn-secondary">
            <ScoutIcon name="shield" size={16} /> Mi patrulla
          </Link>
          <div style={{ flex: 1 }} />
          {jamboree && (
            <span className="chip chip-accent">
              <ScoutIcon name="flame" size={12} /> Esta semana
            </span>
          )}
        </div>

        {!team ? (
          <NoTeam />
        ) : (
          <>
            {/* Team header card */}
            <section
              className="scout-card relative overflow-hidden"
              style={{ padding: 20 }}
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 60% 100% at 0% 50%, color-mix(in oklch, var(--c-${colorOf(team.color)}) 22%, transparent), transparent 60%)`,
                }}
              />
              <div className="relative flex flex-wrap items-center gap-4">
                <Shield
                  letter={team.emblem ?? team.name.charAt(0).toUpperCase()}
                  color={colorOf(team.color)}
                  size={72}
                  imageSrc={team.avatar_url}
                  imageAlt={team.name}
                />
                <div className="min-w-0 flex-1">
                  <div className="t-overline text-muted">Tu patrulla</div>
                  <div className="t-display-md" style={{ marginBottom: 4 }}>
                    {team.name}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="hstack t-body-sm text-muted">
                      <ScoutIcon name="users" size={14} />
                      {rows.length}{" "}
                      {rows.length === 1 ? "miembro" : "miembros"}
                    </span>
                    {jamboree && (
                      <span className="hstack t-body-sm text-muted">
                        <ScoutIcon
                          name="starfill"
                          size={14}
                          stroke={2.2}
                          style={{ color: "var(--accent)" }}
                        />
                        {rows
                          .reduce((s, r) => s + r.weeklyPoints, 0)
                          .toLocaleString("es")}{" "}
                        pts esta semana
                      </span>
                    )}
                  </div>
                </div>
                {dailyGame && dailyPick && (
                  <div
                    className="hstack flex-shrink-0"
                    style={{
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: "var(--r-md)",
                      background:
                        "color-mix(in oklch, var(--c-gold) 14%, transparent)",
                      border:
                        "1px solid color-mix(in oklch, var(--c-gold) 36%, transparent)",
                    }}
                  >
                    <div style={{ fontSize: 22, lineHeight: 1 }}>
                      {dailyGame.emoji}
                    </div>
                    <div>
                      <div
                        className="t-overline"
                        style={{ color: "var(--c-gold)" }}
                      >
                        Elector del día
                      </div>
                      <div className="t-body-sm" style={{ fontWeight: 700 }}>
                        @{dailyPick.pickedByUsername}
                      </div>
                      <div className="t-caption text-muted">
                        Eligió {dailyGame.title} · +10 pts
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {rows.length === 0 ? (
              <EmptyRoster />
            ) : (
              <RosterList
                rows={rows}
                myUserId={auth.userId!}
                maxPoints={rows[0]?.weeklyPoints || 1}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

function NoTeam() {
  return (
    <section
      className="scout-card"
      style={{ padding: 32, textAlign: "center" }}
    >
      <div className="grid place-items-center" style={{ marginBottom: 14 }}>
        <BadgeCircle color="mint" size={56}>
          <ScoutIcon name="users" size={26} />
        </BadgeCircle>
      </div>
      <h2 className="t-display-sm" style={{ margin: "0 0 6px" }}>
        Aún no tienes patrulla
      </h2>
      <p
        className="t-body-sm text-muted"
        style={{ maxWidth: 380, margin: "0 auto 14px" }}
      >
        Únete o crea una patrulla para acceder a tu leaderboard privado.
      </p>
      <Link href="/teams" className="btn btn-primary">
        Ir a patrullas
      </Link>
    </section>
  );
}

function EmptyRoster() {
  return (
    <section
      className="scout-card"
      style={{ padding: 32, textAlign: "center" }}
    >
      <p className="t-body-sm text-muted">
        Tu patrulla aún no tiene miembros registrados.
      </p>
    </section>
  );
}

function RosterList({
  rows,
  myUserId,
  maxPoints,
}: {
  rows: Awaited<ReturnType<typeof getPatrolLeaderboard>>;
  myUserId: string;
  maxPoints: number;
}) {
  return (
    <section className="scout-card" style={{ padding: 18 }}>
      <div
        className="t-overline"
        style={{
          display: "grid",
          gridTemplateColumns: "40px 48px 1fr 110px 90px",
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
        {rows.map((r) => {
          const isYou = r.userId === myUserId;
          const isPodium = r.rankPosition <= 3 && r.weeklyPoints > 0;
          return (
            <div
              key={r.userId}
              className="grid items-center"
              style={{
                gridTemplateColumns: "40px 48px 1fr 110px 90px",
                gap: 12,
                padding: "10px 12px",
                borderRadius: "var(--r-md)",
                background: isYou
                  ? "color-mix(in oklch, var(--primary) 12%, transparent)"
                  : r.rankPosition === 1 && r.weeklyPoints > 0
                    ? "color-mix(in oklch, var(--accent) 8%, transparent)"
                    : "var(--surface)",
                border: isYou
                  ? "1px solid color-mix(in oklch, var(--primary) 35%, transparent)"
                  : r.rankPosition === 1 && r.weeklyPoints > 0
                    ? "1px solid color-mix(in oklch, var(--accent) 30%, transparent)"
                    : "1px solid transparent",
              }}
            >
              <span
                className="t-display-sm"
                style={{
                  color: isPodium ? "var(--accent)" : "var(--fg-muted)",
                  textAlign: "center",
                }}
              >
                {r.rankPosition}
              </span>
              {r.avatarUrl ? (
                <img
                  src={r.avatarUrl}
                  alt={r.displayName ?? r.username}
                  width={40}
                  height={40}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    objectFit: "cover",
                    border: "1px solid var(--border-hi)",
                  }}
                />
              ) : (
                <Avatar
                  name={r.displayName || r.username}
                  size={40}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.displayName ?? r.username}
                  {isYou && (
                    <span className="chip" style={{ fontSize: 9 }}>
                      Tú
                    </span>
                  )}
                  {r.role !== "member" && (
                    <span
                      className="chip"
                      style={{
                        fontSize: 9,
                        color: "var(--c-gold)",
                        borderColor:
                          "color-mix(in oklch, var(--c-gold) 40%, transparent)",
                      }}
                    >
                      {r.role === "lider" ? "Líder" : "Capitán"}
                    </span>
                  )}
                  {r.isElectorToday && (
                    <span
                      className="chip"
                      title="Elector del día (+10)"
                      style={{
                        fontSize: 9,
                        color: "var(--c-gold)",
                        background:
                          "color-mix(in oklch, var(--c-gold) 16%, transparent)",
                        borderColor:
                          "color-mix(in oklch, var(--c-gold) 50%, transparent)",
                      }}
                    >
                      ⭐ Elector
                    </span>
                  )}
                </div>
                <div className="t-caption text-muted">
                  @{r.username} · Nivel {r.level} ·{" "}
                  {r.playsCount}{" "}
                  {r.playsCount === 1 ? "partida" : "partidas"}
                  {r.lastPlayedAt
                    ? ` · ${formatRelative(r.lastPlayedAt)}`
                    : ""}
                </div>
              </div>
              <XpBar
                value={r.weeklyPoints}
                max={maxPoints}
                variant={isPodium ? "gold" : "primary"}
              />
              <span
                className="t-num"
                style={{
                  fontSize: 18,
                  textAlign: "right",
                  color: isPodium ? "var(--accent)" : "var(--fg)",
                }}
              >
                {r.weeklyPoints.toLocaleString("es")}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
