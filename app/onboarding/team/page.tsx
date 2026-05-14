import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield } from "@/components/scout/shield";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { getUserTeam, listTeamsWithCounts } from "@/lib/teams/queries";
import { joinTeamAction } from "@/lib/teams/actions";

type ShieldColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

function colorOf(c: string | null): ShieldColor {
  const valid: ShieldColor[] = [
    "mint",
    "gold",
    "rose",
    "purple",
    "orange",
    "sky",
    "teal",
  ];
  return (valid as string[]).includes(c ?? "") ? (c as ShieldColor) : "mint";
}

export default async function OnboardingTeamPage() {
  const auth = await getAuthState();

  // Guests bypass onboarding — they're allowed straight to the app.
  if (!auth.authenticated) {
    if (auth.guest) redirect("/dashboard");
    redirect("/login?next=/onboarding/team");
  }

  // If already in a team, skip onboarding.
  const current = await getUserTeam(auth.userId!);
  if (current) redirect("/teams");

  const teams = await listTeamsWithCounts();

  return (
    <main
      className="flex min-h-dvh flex-col"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header
          className="flex items-center justify-between"
          style={{ padding: "16px 20px" }}
        >
          <Link
            href="/signup"
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Volver"
          >
            <ScoutIcon name="chevronl" size={18} />
          </Link>
          <div className="flex gap-1">
            {[true, true, false].map((done, i) => (
              <span
                key={i}
                style={{
                  width: 24,
                  height: 4,
                  borderRadius: 2,
                  background: done ? "var(--primary)" : "var(--border-hi)",
                }}
              />
            ))}
          </div>
          <Link
            href="/dashboard"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12 }}
          >
            Saltar
          </Link>
        </header>

        <div
          className="flex-1 overflow-auto"
          style={{ padding: "8px 20px 20px" }}
        >
        <h1
          className="t-display-md"
          style={{ margin: "8px 0 6px", fontSize: 26 }}
        >
          Elige tu <span style={{ color: "var(--primary)" }}>patrulla</span>
        </h1>
        <p
          className="t-body-sm text-muted"
          style={{ margin: "0 0 18px" }}
        >
          En BendScout siempre formas parte de un equipo. Únete a una
          existente o crea la tuya.
        </p>

        {teams.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {teams.map((t) => (
              <form key={t.id} action={joinTeamAction}>
                <input type="hidden" name="teamId" value={t.id} />
                <button
                  type="submit"
                  className="scout-card text-center transition w-full"
                  style={{
                    padding: 14,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="grid place-items-center"
                    style={{ marginBottom: 10 }}
                  >
                    <Shield
                      letter={t.emblem ?? t.name.charAt(0).toUpperCase()}
                      color={colorOf(t.color)}
                      size={56}
                      imageSrc={t.avatar_url}
                      imageAlt={t.name}
                    />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    {t.name}
                  </div>
                  <div
                    className="t-caption text-muted"
                    style={{ marginTop: 2 }}
                  >
                    {t.memberCount} {t.memberCount === 1 ? "scout" : "scouts"}
                  </div>
                </button>
              </form>
            ))}
          </div>
        )}

          <Link
            href="/onboarding/team/new"
            className="btn btn-secondary"
            style={{ width: "100%", marginTop: 14 }}
          >
            <ScoutIcon name="plus" size={16} /> Crear nueva patrulla
          </Link>
        </div>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div
      className="scout-card-flat"
      style={{
        padding: 20,
        textAlign: "center",
      }}
    >
      <div
        className="grid place-items-center"
        style={{ marginBottom: 12, opacity: 0.6 }}
      >
        <Shield letter="?" color="mint" size={56} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        Aún no hay patrullas
      </div>
      <p
        className="t-caption text-muted"
        style={{ marginTop: 6, marginBottom: 0 }}
      >
        Sé el primero en fundar una.
      </p>
    </div>
  );
}
