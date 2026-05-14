import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { StatCard } from "@/components/scout/stat-card";
import { MissionCard } from "@/components/scout/mission-card";
import { ActivityItem } from "@/components/scout/activity-item";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { Shield } from "@/components/scout/shield";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { getUserStats, getRecentSessions } from "@/lib/games/queries";
import { getUserTeam } from "@/lib/teams/queries";
import { getActiveMissions } from "@/lib/missions/queries";
import { GAMES, getGame } from "@/lib/games/registry";
import { getDailyPick } from "@/lib/games/daily";
import { DailyPickWidget } from "@/components/scout/daily-pick-widget";
import { getUserInsignias, countUnlocked } from "@/lib/insignias/queries";

function formatRelative(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `Hace ${Math.max(1, minutes)}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.round(hours / 24);
  return `Hace ${days}d`;
}

const GAME_ICON: Record<string, ScoutIconName> = {
  "knot-rush": "knot",
  "law-shuffle": "flag",
  "trail-signs": "compass",
  "first-response": "heart",
  "memoria-visual": "eye",
  laberinto: "map",
  "camino-seguro": "shieldcheck",
  preguntas: "lightbulb",
};

export default async function DashboardPage() {
  const auth = await getAuthState();
  const stats = auth.authenticated && auth.userId
    ? await getUserStats(auth.userId)
    : null;
  const recent = auth.authenticated && auth.userId
    ? await getRecentSessions(auth.userId, 5)
    : [];
  const team = auth.authenticated && auth.userId
    ? await getUserTeam(auth.userId)
    : null;
  const dailyPick = team ? await getDailyPick(team.id) : null;
  const allMissions = auth.authenticated && auth.userId
    ? await getActiveMissions(auth.userId)
    : null;
  const insignias = auth.authenticated && auth.userId
    ? await getUserInsignias(auth.userId)
    : [];
  const insigniasUnlocked = countUnlocked(insignias);
  const insigniasShowcase = insignias.filter((i) => i.unlocked).slice(0, 5);
  const insigniasPreview =
    insigniasShowcase.length > 0
      ? insigniasShowcase
      : insignias.slice(0, 5);
  const dashboardMissions = allMissions
    ? allMissions
        .filter((m) => m.kind === "individual" && !m.completed)
        .slice(0, 3)
    : null;

  const level = stats?.level ?? 1;
  const xpInto = stats?.xpIntoLevel ?? 0;
  const xpStep = (stats?.xpIntoLevel ?? 0) + (stats?.xpToNext ?? 250);
  const streak = stats?.streakDays ?? 0;
  const weeklyPoints = stats?.weeklyPoints ?? 0;
  const weeklyPlays = stats?.weeklyPlays ?? 0;

  return (
    <>
      <Topbar auth={auth} notifications={3} />

      <div className="mb-5">
        <DailyPickWidget
          games={GAMES}
          teamId={team?.id ?? null}
          pick={dailyPick}
          variant="hero"
        />
      </div>


      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nivel actual"
          value={level.toString()}
          icon={<ScoutIcon name="leaf" size={18} />}
          iconColor="mint"
          progress={{ value: xpInto, max: xpStep }}
        />
        <StatCard
          label="Insignias"
          value={insigniasUnlocked.toString()}
          link={{ label: "Ver todas →", href: "/profile" }}
          footer={
            <div className="flex items-center gap-1.5">
              {insigniasPreview.map((i) => (
                <BadgeCircle
                  key={i.def.slug}
                  color={i.unlocked ? i.def.color : "locked"}
                  size={28}
                  ringed={i.unlocked}
                >
                  <ScoutIcon
                    name={i.unlocked ? i.def.icon : "lock"}
                    size={14}
                    stroke={2}
                  />
                </BadgeCircle>
              ))}
            </div>
          }
        />
        <StatCard
          label="Racha"
          value={streak > 0 ? `${streak}d` : "—"}
          icon={<ScoutIcon name="flame" size={18} />}
          iconColor="orange"
          footer={
            <span className="t-caption text-muted">
              {streak === 0
                ? "Juega hoy para iniciarla"
                : streak === 1
                  ? "¡Vas iniciando!"
                  : `Encadenas ${streak} días seguidos`}
            </span>
          }
        />
        <StatCard
          label="Puntos esta semana"
          value={weeklyPoints.toLocaleString("es")}
          icon={<ScoutIcon name="starfill" size={18} stroke={2.2} />}
          iconColor="gold"
          footer={
            <span className="t-caption text-muted">
              {weeklyPlays} {weeklyPlays === 1 ? "partida" : "partidas"} este
              jamboree
            </span>
          }
        />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 lg:[grid-template-columns:minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="scout-card" style={{ padding: 18 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <span className="t-h3">Misiones activas</span>
            <Link
              className="t-caption"
              href="/missions"
              style={{ color: "var(--primary)", fontWeight: 700 }}
            >
              Ver todas →
            </Link>
          </div>
          <div className="vstack" style={{ gap: 10 }}>
            {dashboardMissions && dashboardMissions.length > 0 ? (
              dashboardMissions.map((m) => (
                <MissionCard
                  key={m.slug}
                  title={m.title}
                  description={m.description}
                  icon={<ScoutIcon name={m.icon} size={18} />}
                  iconColor={m.color}
                  xpReward={m.xpReward}
                  progress={{ value: m.progress, max: m.target }}
                />
              ))
            ) : dashboardMissions && dashboardMissions.length === 0 ? (
              <div
                className="vstack t-body-sm text-muted"
                style={{
                  padding: 20,
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
                Has completado todas las misiones individuales.
              </div>
            ) : (
              <>
                <MissionCard
                  title="Explorador Digital"
                  description="Completa 5 minijuegos"
                  icon={<ScoutIcon name="leaf" size={18} />}
                  iconColor="mint"
                  xpReward={150}
                  progress={{ value: 3, max: 5 }}
                />
                <MissionCard
                  title="Coleccionista"
                  description="Gana 3 insignias diferentes"
                  icon={<ScoutIcon name="shield" size={18} />}
                  iconColor="rose"
                  xpReward={100}
                  progress={{ value: 1, max: 3 }}
                />
                <MissionCard
                  title="Racha Ganadora"
                  description="Gana 10 minijuegos seguidos"
                  icon={<ScoutIcon name="flame" size={18} />}
                  iconColor="orange"
                  xpReward={200}
                  progress={{ value: 8, max: 10 }}
                />
              </>
            )}
          </div>
        </div>

        <div className="scout-card" style={{ padding: 18 }}>
          <div className="between" style={{ marginBottom: 10 }}>
            <span className="t-h3">Actividad reciente</span>
            <span className="t-caption text-muted">
              Tus últimas {recent.length}
            </span>
          </div>
          {recent.length === 0 ? (
            <div
              className="vstack t-body-sm text-muted"
              style={{
                padding: 20,
                textAlign: "center",
                gap: 6,
                alignItems: "center",
              }}
            >
              <ScoutIcon
                name="gamepad"
                size={28}
                style={{ color: "var(--fg-soft)" }}
              />
              Aún no has jugado. Empieza por{" "}
              <Link
                href="/play"
                className="link-underline"
                style={{ color: "var(--primary)", fontWeight: 700 }}
              >
                un minijuego →
              </Link>
            </div>
          ) : (
            recent.map((s) => {
              const game = getGame(s.game_key);
              const isPractice = s.attempt_kind === "practice";
              const title = isPractice
                ? `Práctica · ${game?.title ?? s.game_key}`
                : `${game?.title ?? s.game_key} · Intento #${s.attempt_no}`;
              return (
                <ActivityItem
                  key={s.id}
                  title={title}
                  delta={isPractice ? "+20 pts" : `${s.score} pts`}
                  timeAgo={formatRelative(s.created_at)}
                  icon={
                    <ScoutIcon
                      name={GAME_ICON[s.game_key] ?? "starfill"}
                      size={16}
                    />
                  }
                  iconColor={isPractice ? "sky" : "purple"}
                />
              );
            })
          )}
        </div>
      </section>

      <section
        className="scout-card mt-5"
        style={{ padding: 18, position: "relative", overflow: "hidden" }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 40% 70% at 90% 50%, color-mix(in oklch, var(--c-mint) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-start gap-4 sm:grid sm:items-center sm:gap-6 sm:[grid-template-columns:auto_1fr_auto]">
          <div className="flex w-full items-center gap-4 sm:contents">
            <Shield
              letter={team?.emblem ?? team?.name?.charAt(0).toUpperCase() ?? "?"}
              color={(team?.color as "mint" | "gold" | "rose" | "purple" | "orange" | "sky" | "teal") ?? "mint"}
              size={72}
              imageSrc={team?.avatar_url ?? null}
              imageAlt={team?.name}
            />
            <div className="min-w-0 flex-1">
              <div className="t-overline text-muted" style={{ marginBottom: 4 }}>
                {team ? "Tu patrulla" : "Aún sin patrulla"}
              </div>
              <div className="t-display-md" style={{ marginBottom: 6 }}>
                {team?.name ?? "Únete o crea una"}
              </div>
              <div
                className="flex flex-wrap items-center"
                style={{ gap: 14 }}
              >
                {team ? (
                  <>
                    <span className="hstack t-body-sm text-muted">
                      <ScoutIcon name="users" size={16} /> Tu tropa
                    </span>
                    <span className="hstack t-body-sm text-muted">
                      <ScoutIcon
                        name="flame"
                        size={16}
                        style={{ color: "var(--c-orange)" }}
                      />{" "}
                      Racha {streak}d
                    </span>
                    <span className="hstack t-body-sm text-muted">
                      <ScoutIcon
                        name="starfill"
                        size={16}
                        stroke={2.2}
                        style={{ color: "var(--accent)" }}
                      />{" "}
                      {weeklyPoints.toLocaleString("es")} pts esta semana
                    </span>
                  </>
                ) : (
                  <span className="t-body-sm text-muted">
                    Forma una patrulla para competir en equipo.
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/teams" className="btn btn-secondary">
              Ver patrulla
            </Link>
            {team ? (
              <Link href="/leaderboard/patrulla" className="btn btn-primary">
                <ScoutIcon name="shield" size={14} />
                Ranking de patrulla
              </Link>
            ) : (
              <Link href="/teams" className="btn btn-primary">
                Unirse a una patrulla
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
