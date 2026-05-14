import Link from "next/link";
import { redirect } from "next/navigation";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { getUserTeam } from "@/lib/teams/queries";
import { TeamForm } from "./team-form";

export default async function NewTeamPage() {
  const auth = await getAuthState();
  if (!auth.authenticated) {
    redirect("/login?next=/onboarding/team/new");
  }

  const existing = await getUserTeam(auth.userId!);
  if (existing) redirect("/teams");

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
            href="/onboarding/team"
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Volver"
          >
            <ScoutIcon name="chevronl" size={18} />
          </Link>
          <span className="t-overline text-muted">Crear patrulla</span>
          <span style={{ width: 36 }} />
        </header>

        <div
          className="flex-1 overflow-auto"
          style={{ padding: "0 20px 20px" }}
        >
          <h1
            className="t-display-md"
            style={{ margin: "8px 0 6px", fontSize: 26 }}
          >
            Funda tu <span style={{ color: "var(--primary)" }}>patrulla</span>
          </h1>
          <p
            className="t-body-sm text-muted"
            style={{ margin: "0 0 18px" }}
          >
            Elige nombre, emblema y color. Vas a ser el líder y otros scouts
            podrán unirse.
          </p>

          <TeamForm />
        </div>
      </div>
    </main>
  );
}
