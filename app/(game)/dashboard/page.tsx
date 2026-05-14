import Image from "next/image";
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

  const liveGames = GAMES.filter((g) => g.status === "live" && g.route);
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const dailyGame =
    liveGames.length > 0
      ? liveGames[dayIndex % liveGames.length]
      : GAMES[0];
  const dailyHref = dailyGame.route ?? "/play";
  const dailyXp = 150;

  return (
    <>
      <Topbar auth={auth} notifications={3} />

      <section
        className="scout-card-glow relative mb-5 overflow-hidden"
        style={{ padding: 0 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 85% 30%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 65%), radial-gradient(ellipse 50% 60% at 10% 90%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative grid items-stretch gap-0 lg:[grid-template-columns:minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
            <div className="flex items-center gap-2">
              <span
                className="hstack t-overline"
                style={{
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background:
                    "color-mix(in oklch, var(--primary) 18%, transparent)",
                  color: "var(--primary)",
                  border:
                    "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
                  letterSpacing: "0.04em",
                }}
              >
                <ScoutIcon name="flame" size={14} stroke={2.2} />
                Minijuego del día
              </span>
              <span className="t-caption text-muted">
                Se renueva en 24h
              </span>
            </div>

            <div>
              <h1
                className="t-display-lg"
                style={{ margin: 0, lineHeight: 1.05 }}
              >
                {dailyGame.title}
              </h1>
              <p
                className="t-body text-muted"
                style={{ marginTop: 8, maxWidth: 52 + "ch" }}
              >
                {dailyGame.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
              <span
                className="hstack t-caption"
                style={{
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "var(--card-hi)",
                  border: "1px solid var(--border-hi)",
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                <ScoutIcon name="starfill" size={14} stroke={2.2} />
                <span style={{ color: "var(--fg)" }}>+{dailyXp} XP</span>
              </span>
              <span
                className="hstack t-caption"
                style={{
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "var(--card-hi)",
                  border: "1px solid var(--border-hi)",
                  fontWeight: 600,
                  color: "var(--c-orange)",
                }}
              >
                <ScoutIcon name="flame" size={14} />
                <span style={{ color: "var(--fg)" }}>Suma a tu racha</span>
              </span>
              <span
                className="hstack t-caption text-muted"
                style={{ gap: 6 }}
              >
                <ScoutIcon name="clock" size={14} /> 3–5 min
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={dailyHref}
                className="btn btn-primary btn-lg"
                style={{ minWidth: 180 }}
              >
                <ScoutIcon name="play" size={16} stroke={2.4} />
                Jugar ahora
              </Link>
              <Link href="/play" className="btn btn-secondary btn-lg">
                Ver todos los minijuegos
              </Link>
            </div>
          </div>

          <Link
            href={dailyHref}
            aria-label={`Jugar ${dailyGame.title}`}
            className="group relative block min-h-[220px] overflow-hidden lg:min-h-[320px]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.30 0.05 155), oklch(0.18 0.04 155))",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, oklch(0.78 0.16 145 / 0.45), transparent 30%), radial-gradient(circle at 75% 70%, oklch(0.65 0.16 160 / 0.4), transparent 35%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, transparent 50%, oklch(0.16 0.04 155) 100%)",
              }}
            />
            {dailyGame.imageSrc ? (
              <div className="absolute inset-0 grid place-items-center">
                <Image
                  src={dailyGame.imageSrc}
                  alt={dailyGame.title}
                  width={320}
                  height={320}
                  className="animate-float h-[75%] w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-[180px] leading-none">
                <span className="animate-float inline-block">
                  {dailyGame.emoji}
                </span>
              </div>
            )}
            <svg
              aria-hidden
              className="absolute bottom-0 left-0 w-full"
              viewBox="0 0 400 80"
              preserveAspectRatio="none"
              style={{ height: "26%" }}
            >
              <path
                d="M0 60 L40 30 L70 50 L110 20 L150 45 L200 15 L240 40 L290 25 L340 50 L400 30 L400 80 L0 80 Z"
                fill="oklch(0.18 0.06 155)"
                opacity="0.9"
              />
              <path
                d="M0 70 L60 45 L100 60 L140 35 L180 55 L220 30 L260 50 L320 35 L380 55 L400 50 L400 80 L0 80 Z"
                fill="oklch(0.16 0.04 155)"
              />
            </svg>
          </Link>
        </div>
      </section>

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
            <button className="btn btn-primary">Retar otra tropa</button>
          </div>
        </div>
      </section>
    </>
  );
}
