import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { Shield } from "@/components/scout/shield";
import { Avatar } from "@/components/scout/avatar";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { getUserTeam, getTeamWithMembers } from "@/lib/teams/queries";
import { leaveTeamAction } from "@/lib/teams/actions";

type TeamColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

function colorOf(c: string | null): TeamColor {
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

export default async function TeamsPage() {
  const auth = await getAuthState();

  // Guests don't have a team to show.
  if (auth.guest && !auth.authenticated) {
    return <GuestEmpty />;
  }

  if (!auth.authenticated) {
    return <NoTeamEmpty title="Inicia sesión para ver tu patrulla" />;
  }

  const summary = await getUserTeam(auth.userId!);
  if (!summary) {
    return <NoTeamEmpty />;
  }

  const team = await getTeamWithMembers(summary.id);
  if (!team) return <NoTeamEmpty />;

  const isOwner = team.owner_id === auth.userId;
  const totalXp = team.members.reduce((sum, m) => sum + (m.xp ?? 0), 0);
  const color = colorOf(team.color);

  // Rank members by xp desc
  const ranked = [...team.members].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));

  return (
    <>
      <Topbar
        auth={auth}
        greeting="Mi patrulla"
        subtitle={`${team.name} · ${team.members.length} ${team.members.length === 1 ? "scout" : "scouts"}`}
        notifications={0}
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
              background: `radial-gradient(ellipse 50% 100% at 100% 50%, color-mix(in oklch, var(--c-${color}) 22%, transparent), transparent 70%)`,
            }}
          />
          <div
            className="relative grid items-center"
            style={{ gridTemplateColumns: "auto 1fr auto", gap: 28 }}
          >
            <Shield
              letter={team.emblem ?? team.name.charAt(0).toUpperCase()}
              color={color}
              size={120}
              imageSrc={team.avatar_url}
              imageAlt={team.name}
            />
            <div>
              <span
                className="rank-tag"
                style={{
                  background: `color-mix(in oklch, var(--c-${color}) 16%, transparent)`,
                  color: `var(--c-${color})`,
                  borderColor: `color-mix(in oklch, var(--c-${color}) 30%, transparent)`,
                }}
              >
                Patrulla {color}
              </span>
              <div
                className="t-display-xl"
                style={{ margin: "8px 0 4px", fontSize: 44 }}
              >
                {team.name}
              </div>
              <div className="t-body-sm text-muted">
                Fundada{" "}
                {new Date(team.created_at).toLocaleDateString("es", {
                  month: "long",
                  year: "numeric",
                })}
                {isOwner && " · Eres el líder ⚜️"}
              </div>
              <div
                className="flex flex-wrap"
                style={{ gap: 28, marginTop: 18 }}
              >
                <Stat label="Puntos" value={totalXp.toLocaleString("es")} />
                <Stat label="Scouts" value={String(team.members.length)} />
                <Stat label="Slug" value={`#${team.slug}`} />
              </div>
            </div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {isOwner ? (
                <>
                  <Link href="/teams/edit" className="btn btn-primary">
                    <ScoutIcon name="edit" size={16} /> Editar patrulla
                  </Link>
                  <form action={leaveTeamAction}>
                    <button
                      type="submit"
                      className="btn btn-danger"
                      style={{ width: "100%" }}
                    >
                      <ScoutIcon name="close" size={16} /> Disolver patrulla
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary">
                    <ScoutIcon name="share" size={16} /> Compartir
                  </button>
                  <form action={leaveTeamAction}>
                    <button
                      type="submit"
                      className="btn btn-ghost btn-sm"
                      style={{
                        width: "100%",
                        color: "var(--c-rose)",
                      }}
                    >
                      Salir de la patrulla
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Members table + side cards */}
        <section
          className="grid gap-4"
          style={{
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          }}
        >
          <div className="scout-card" style={{ padding: 18 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <span className="t-h3">Scouts de la patrulla</span>
              <span className="t-caption text-muted">
                Ordenados por XP
              </span>
            </div>
            <div className="vstack" style={{ gap: 6 }}>
              {ranked.map((m, idx) => {
                const isYou = m.id === auth.userId;
                const pos = idx + 1;
                return (
                  <div
                    key={m.id}
                    className="grid items-center"
                    style={{
                      gridTemplateColumns: "28px auto 1fr auto auto",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: "var(--r-md)",
                      background: isYou
                        ? "color-mix(in oklch, var(--primary) 10%, transparent)"
                        : "var(--surface)",
                      border: isYou
                        ? "1px solid color-mix(in oklch, var(--primary) 30%, transparent)"
                        : "1px solid transparent",
                    }}
                  >
                    <span
                      className="t-display-sm"
                      style={{
                        color: pos <= 3 ? "var(--accent)" : "var(--fg-muted)",
                        textAlign: "center",
                      }}
                    >
                      {pos}
                    </span>
                    <Avatar
                      name={m.display_name ?? m.username}
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
                        {m.display_name ?? m.username}
                        {isYou && (
                          <span className="chip" style={{ fontSize: 9 }}>
                            Tú
                          </span>
                        )}
                        {m.role === "owner" && (
                          <span
                            className="chip chip-accent"
                            style={{ fontSize: 9 }}
                          >
                            Líder
                          </span>
                        )}
                      </div>
                      <div className="t-caption text-muted">
                        @{m.username}
                      </div>
                    </div>
                    <div style={{ width: 120 }}>
                      <XpBar value={m.xp ?? 0} max={Math.max(9000, totalXp)} />
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
                      {(m.xp ?? 0).toLocaleString("es")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="vstack" style={{ gap: 16 }}>
            <div className="scout-card" style={{ padding: 18 }}>
              <div className="between" style={{ marginBottom: 10 }}>
                <span className="t-h3">Misiones de patrulla</span>
                <span className="chip chip-accent">Próximamente</span>
              </div>
              <p className="t-body-sm text-muted" style={{ margin: 0 }}>
                Cuando se habiliten las misiones grupales podrán competir como
                tropa y ganar XP extra para todos.
              </p>
            </div>

            <div className="scout-card" style={{ padding: 18 }}>
              <div className="between" style={{ marginBottom: 10 }}>
                <span className="t-h3">Invitar scouts</span>
              </div>
              <div
                className="scout-card-flat"
                style={{ padding: 12, marginTop: 8 }}
              >
                <div className="t-caption text-muted">Código de invitación</div>
                <div
                  className="t-num"
                  style={{ fontSize: 22, color: "var(--accent)" }}
                >
                  {team.slug.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: 12 }}
              >
                <ScoutIcon name="share" size={14} /> Compartir código
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function NoTeamEmpty({ title = "Aún no tienes patrulla" }: { title?: string } = {}) {
  return (
    <>
      <Topbar greeting="Mi patrulla" subtitle="Únete o crea una para empezar" notifications={0} />
      <section
        className="scout-card"
        style={{
          padding: 36,
          textAlign: "center",
          maxWidth: 480,
          margin: "60px auto",
        }}
      >
        <div className="grid place-items-center" style={{ marginBottom: 18 }}>
          <Shield letter="?" color="mint" size={80} />
        </div>
        <h2 className="t-display-sm" style={{ margin: "0 0 6px" }}>
          {title}
        </h2>
        <p className="t-body-sm text-muted" style={{ margin: "0 0 18px" }}>
          En BendScout siempre formas parte de un equipo. Únete a una
          patrulla existente o funda la tuya.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/onboarding/team" className="btn btn-primary btn-lg">
            <ScoutIcon name="users" size={16} /> Ver patrullas
          </Link>
          <Link href="/onboarding/team/new" className="btn btn-secondary">
            <ScoutIcon name="plus" size={16} /> Crear nueva patrulla
          </Link>
        </div>
      </section>
    </>
  );
}

function GuestEmpty() {
  return (
    <>
      <Topbar greeting="Mi patrulla" subtitle="Modo invitado" notifications={0} />
      <section
        className="scout-card"
        style={{
          padding: 36,
          textAlign: "center",
          maxWidth: 480,
          margin: "60px auto",
        }}
      >
        <div className="grid place-items-center" style={{ marginBottom: 18 }}>
          <Shield letter="?" color="orange" size={80} />
        </div>
        <h2 className="t-display-sm" style={{ margin: "0 0 6px" }}>
          Las patrullas son para scouts registrados
        </h2>
        <p className="t-body-sm text-muted" style={{ margin: "0 0 18px" }}>
          Crea tu cuenta para unirte a una patrulla y competir en equipo.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/signup" className="btn btn-primary btn-lg">
            Crear cuenta
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Ya tengo cuenta
          </Link>
        </div>
      </section>
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
