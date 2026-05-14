import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { Avatar } from "@/components/scout/avatar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon } from "@/components/scout/icon";
import { INSIGNIAS as INSIGNIA_REGISTRY } from "@/lib/insignias/registry";
import { getUserInsignias, countUnlocked } from "@/lib/insignias/queries";

type BadgeColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface RankTier {
  name: string;
  level: number;
  color: BadgeColor;
}

/**
 * Tiers de rango por nivel mínimo. El nivel viene del trigger
 * `sync_profile_xp_from_jamboree` que actualiza `profiles.rank` con
 * `level_for_xp(xp)`. Cada tier abarca un rango de niveles del DB.
 */
const RANK_TIERS: RankTier[] = [
  { name: "Lobato", level: 1, color: "mint" },
  { name: "Scout", level: 3, color: "sky" },
  { name: "Explorador", level: 6, color: "purple" },
  { name: "Pionero", level: 10, color: "gold" },
  { name: "Rover", level: 15, color: "rose" },
];

/** Mirror de `public.xp_for_level(N) = 250 * (N-1) * N / 2`. */
function xpForLevel(n: number): number {
  return Math.max(0, Math.floor((250 * (n - 1) * n) / 2));
}

function currentRankIndex(level: number): number {
  let idx = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (RANK_TIERS[i].level <= level) idx = i;
  }
  return idx;
}

const WEEK = [
  { d: "L", v: 30 },
  { d: "M", v: 55 },
  { d: "X", v: 20 },
  { d: "J", v: 80 },
  { d: "V", v: 100, today: true },
  { d: "S", v: 45 },
  { d: "D", v: 65 },
];

export default async function ProfilePage() {
  const { getAuthState } = await import("@/lib/auth/session");
  const { getUserTeam } = await import("@/lib/teams/queries");
  const { getUserStats } = await import("@/lib/games/queries");
  const auth = await getAuthState();
  const profile = auth.profile;
  const team = profile ? await getUserTeam(profile.id) : null;
  const stats = profile ? await getUserStats(profile.id) : null;
  const insignias = profile ? await getUserInsignias(profile.id) : [];
  const insigniasUnlocked = countUnlocked(insignias);
  const insigniasTotal = INSIGNIA_REGISTRY.length;

  const displayName = profile?.display_name ?? profile?.username ?? "Invitado";
  const username = profile?.username ?? "invitado";
  const since = profile
    ? new Date(profile.created_at).toLocaleDateString("es", {
        month: "long",
        year: "numeric",
      })
    : null;

  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const xpInto = stats?.xpIntoLevel ?? 0;
  const xpStep = (stats?.xpIntoLevel ?? 0) + (stats?.xpToNext ?? 250);
  const streak = stats?.streakDays ?? 0;

  // ---- Rank progression (data real) ----
  const curIdx = currentRankIndex(level);
  const currentRank = RANK_TIERS[curIdx];
  const nextRank = RANK_TIERS[curIdx + 1] ?? null;
  const rankFloorXp = xpForLevel(currentRank.level);
  const rankCapXp = nextRank ? xpForLevel(nextRank.level) : rankFloorXp;
  const rankXpInto = Math.max(0, xp - rankFloorXp);
  const rankXpSpan = Math.max(1, rankCapXp - rankFloorXp);
  const rankXpToNext = nextRank ? Math.max(0, rankCapXp - xp) : 0;
  const rankIsMax = !nextRank;

  // 3 requisitos reales para subir al siguiente rango
  const requirements = nextRank
    ? [
        {
          title: `Alcanza nivel ${nextRank.level}`,
          value: Math.min(level, nextRank.level) - currentRank.level,
          max: nextRank.level - currentRank.level,
          suffix: `${level} / ${nextRank.level}`,
        },
        {
          title: `Acumula ${rankCapXp.toLocaleString("es")} XP`,
          value: Math.min(xp, rankCapXp) - rankFloorXp,
          max: rankCapXp - rankFloorXp,
          suffix: `${xp.toLocaleString("es")} / ${rankCapXp.toLocaleString("es")}`,
        },
        {
          title: `Desbloquea ${insigniasTotal} insignias`,
          value: insigniasUnlocked,
          max: insigniasTotal,
          suffix: `${insigniasUnlocked} / ${insigniasTotal}`,
        },
      ]
    : [];

  return (
    <>
      <Topbar auth={auth} greeting="Perfil" subtitle="Tu camino scout · resumen" notifications={3} />

      <div className="vstack" style={{ gap: 20 }}>
        {/* Hero */}
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
                "radial-gradient(ellipse 60% 80% at 80% 30%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 60%)",
            }}
          />
          <div
            className="relative grid items-center"
            style={{ gridTemplateColumns: "auto 1fr auto", gap: 24 }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                width={96}
                height={96}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  objectFit: "cover",
                  boxShadow: "0 0 0 3px var(--bg), 0 0 0 5px var(--primary)",
                }}
              />
            ) : (
              <Avatar name={displayName} size={96} ring />
            )}
            <div>
              <span
                className="rank-tag"
                style={{
                  color: `var(--c-${currentRank.color})`,
                  background: `color-mix(in oklch, var(--c-${currentRank.color}) 14%, transparent)`,
                  borderColor: `color-mix(in oklch, var(--c-${currentRank.color}) 30%, transparent)`,
                }}
              >
                Rango · {currentRank.name}
              </span>
              <div className="t-display-lg" style={{ margin: "8px 0 2px" }}>
                {displayName}
              </div>
              <div className="t-body-sm text-muted">
                @{username}
                {team && ` · Patrulla ${team.name}`}
                {since && ` · Desde ${since}`}
              </div>
              <div className="flex flex-wrap" style={{ gap: 24, marginTop: 16 }}>
                <Stat label="Nivel" value={String(level)} color="var(--primary)" />
                <Stat label="XP total" value={xp.toLocaleString("es")} />
                <Stat
                  label="Pts. semana"
                  value={(stats?.weeklyPoints ?? 0).toLocaleString("es")}
                  color="var(--accent)"
                />
                <Stat
                  label="Partidas"
                  value={String(stats?.weeklyPlays ?? 0)}
                />
                <Stat
                  label="Racha"
                  value={streak > 0 ? `${streak}d` : "—"}
                  color="var(--c-orange)"
                />
                <Stat
                  label="Insignias"
                  value={String(insigniasUnlocked)}
                  color="var(--c-gold)"
                />
              </div>
            </div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <Link href="/profile/edit" className="btn btn-primary">
                <ScoutIcon name="edit" size={16} /> Editar perfil
              </Link>
              <button className="btn btn-secondary">
                <ScoutIcon name="share" size={16} /> Compartir
              </button>
            </div>
          </div>
        </section>

        {/* Two columns */}
        <section
          className="grid gap-4"
          style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}
        >
          <div className="scout-card" style={{ padding: 18 }}>
            <div className="between" style={{ marginBottom: 12 }}>
              <span className="t-h3">Camino al siguiente rango</span>
              {nextRank ? (
                <span
                  className="rank-tag"
                  style={{
                    color: `var(--c-${nextRank.color})`,
                    background: `color-mix(in oklch, var(--c-${nextRank.color}) 16%, transparent)`,
                    borderColor: `color-mix(in oklch, var(--c-${nextRank.color}) 30%, transparent)`,
                  }}
                >
                  Próximo · {nextRank.name}
                </span>
              ) : (
                <span
                  className="rank-tag"
                  style={{
                    color: "var(--c-gold)",
                    background:
                      "color-mix(in oklch, var(--c-gold) 16%, transparent)",
                    borderColor:
                      "color-mix(in oklch, var(--c-gold) 30%, transparent)",
                  }}
                >
                  Rango máximo
                </span>
              )}
            </div>

            <div
              className="flex items-center gap-3"
              style={{ marginBottom: 14 }}
            >
              {RANK_TIERS.map((tier, i) => (
                <RankStepNode
                  key={tier.name}
                  rank={{
                    label: tier.name,
                    color: tier.color,
                    done: i <= curIdx,
                    active: i === curIdx,
                  }}
                  showConnector={i > 0}
                  connectorDone={i <= curIdx}
                />
              ))}
            </div>

            <div className="between" style={{ marginBottom: 4 }}>
              <span className="t-caption text-muted">
                {rankIsMax
                  ? "Has alcanzado el rango más alto"
                  : `${rankXpToNext.toLocaleString("es")} XP para ${nextRank!.name}`}
              </span>
              <span className="t-mono">
                {rankIsMax
                  ? `${xp.toLocaleString("es")} XP`
                  : `${rankXpInto.toLocaleString("es")} / ${rankXpSpan.toLocaleString("es")}`}
              </span>
            </div>
            <XpBar
              value={rankIsMax ? rankXpSpan : rankXpInto}
              max={rankXpSpan}
            />

            {requirements.length > 0 ? (
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                {requirements.map((r, i) => {
                  const done = r.value >= r.max;
                  return (
                    <div
                      key={r.title}
                      style={{
                        padding: 12,
                        background: "var(--surface)",
                        border: done
                          ? "1px solid color-mix(in oklch, var(--primary) 40%, transparent)"
                          : "1px solid var(--border)",
                        borderRadius: "var(--r-lg)",
                      }}
                    >
                      <div
                        className="between"
                        style={{ alignItems: "center" }}
                      >
                        <div className="t-overline text-muted">
                          Requisito {i + 1}
                        </div>
                        {done ? (
                          <ScoutIcon
                            name="check"
                            size={12}
                            stroke={2.4}
                            className="text-primary-token"
                          />
                        ) : null}
                      </div>
                      <div
                        style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}
                      >
                        {r.title}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <XpBar value={Math.min(r.value, r.max)} max={r.max} />
                      </div>
                      <div
                        className="t-caption text-muted"
                        style={{ marginTop: 6 }}
                      >
                        {r.suffix}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="scout-card" style={{ padding: 18 }}>
            <div className="between" style={{ marginBottom: 12 }}>
              <span className="t-h3">XP esta semana</span>
              <span
                className="t-num"
                style={{ fontSize: 22, color: "var(--primary)" }}
              >
                +1 240
              </span>
            </div>
            <div
              className="grid items-end"
              style={{
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 8,
                height: 140,
              }}
            >
              {WEEK.map((b) => (
                <div
                  key={b.d}
                  className="flex flex-col items-center"
                  style={{ gap: 6, height: "100%", justifyContent: "flex-end" }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${b.v}%`,
                      borderRadius: 6,
                      background: b.today
                        ? "var(--primary)"
                        : "color-mix(in oklch, var(--primary) 30%, transparent)",
                      boxShadow: b.today
                        ? "0 0 12px 0 color-mix(in oklch, var(--primary) 60%, transparent)"
                        : undefined,
                    }}
                  />
                  <span
                    className="t-caption"
                    style={{
                      color: b.today ? "var(--primary)" : "var(--fg-muted)",
                      fontWeight: b.today ? 700 : 500,
                    }}
                  >
                    {b.d}
                  </span>
                </div>
              ))}
            </div>
            <hr className="divider" style={{ margin: "16px 0" }} />
            <div className="vstack" style={{ gap: 8 }}>
              <div className="between">
                <span className="t-caption text-muted">Minijuegos jugados</span>
                <span className="t-mono">42</span>
              </div>
              <div className="between">
                <span className="t-caption text-muted">
                  Misiones completadas
                </span>
                <span className="t-mono">7</span>
              </div>
              <div className="between">
                <span className="t-caption text-muted">
                  Posición en patrulla
                </span>
                <span
                  className="t-mono"
                  style={{ color: "var(--accent)" }}
                >
                  2º
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Insignias */}
        <section className="scout-card" style={{ padding: 18 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <span className="t-h3">
              Mis insignias{" "}
              <span
                className="t-caption text-muted"
                style={{ marginLeft: 6 }}
              >
                {insigniasUnlocked} de {insigniasTotal}
              </span>
            </span>
            <div className="flex gap-1.5">
              <button className="btn btn-ghost btn-sm">Todas</button>
              <button className="btn btn-secondary btn-sm">Desbloqueadas</button>
              <button className="btn btn-ghost btn-sm">Bloqueadas</button>
            </div>
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}
          >
            {insignias.map((i) => (
              <div
                key={i.def.slug}
                className="flex flex-col items-center"
                style={{
                  gap: 6,
                  padding: 12,
                  borderRadius: "var(--r-lg)",
                  background: "var(--surface)",
                }}
              >
                <BadgeCircle
                  color={i.unlocked ? i.def.color : "locked"}
                  size={56}
                  ringed={i.unlocked}
                >
                  <ScoutIcon
                    name={i.unlocked ? i.def.icon : "lock"}
                    size={26}
                    stroke={1.8}
                  />
                </BadgeCircle>
                <div
                  className="t-caption"
                  style={{
                    textAlign: "center",
                    fontWeight: 600,
                    color: i.unlocked ? "var(--fg)" : "var(--fg-soft)",
                  }}
                >
                  {i.def.title}
                </div>
              </div>
            ))}
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
      <div className="t-num" style={{ fontSize: 28, color }}>
        {value}
      </div>
    </div>
  );
}

function RankStepNode({
  rank,
  showConnector,
  connectorDone,
}: {
  rank: { label: string; color: BadgeColor; done: boolean; active?: boolean };
  showConnector: boolean;
  connectorDone: boolean;
}) {
  return (
    <>
      {showConnector && (
        <div
          style={{
            flex: 1,
            height: 2,
            background: connectorDone ? "var(--primary)" : "var(--border)",
          }}
        />
      )}
      <div className="flex flex-col items-center" style={{ gap: 6 }}>
        <BadgeCircle
          color={rank.done ? rank.color : "locked"}
          size={rank.active ? 48 : 36}
          ringed={rank.active}
        >
          <ScoutIcon
            name={rank.done ? "check" : "lock"}
            size={rank.active ? 22 : 16}
            stroke={2.2}
          />
        </BadgeCircle>
        <span
          className="t-caption"
          style={{
            fontWeight: rank.active ? 800 : 500,
            color: rank.active ? "var(--fg)" : "var(--fg-muted)",
          }}
        >
          {rank.label}
        </span>
      </div>
    </>
  );
}
