import Link from "next/link";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/scout/topbar";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { getUserTeam } from "@/lib/teams/queries";
import { TeamForm } from "@/app/onboarding/team/new/team-form";
import { updateTeamAction } from "@/lib/teams/actions";

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

export default async function EditTeamPage() {
  const auth = await getAuthState();
  if (!auth.authenticated) redirect("/login?next=/teams/edit");

  const team = await getUserTeam(auth.userId!);
  if (!team) redirect("/onboarding/team");
  if (team.owner_id !== auth.userId) redirect("/teams");

  return (
    <>
      <Topbar
        auth={auth}
        greeting="Editar patrulla"
        subtitle={`Estás editando ${team.name}`}
        notifications={0}
      />

      <div
        className="scout-card"
        style={{ padding: 24, maxWidth: 540, margin: "0 auto" }}
      >
        <div className="between" style={{ marginBottom: 18 }}>
          <h2 className="t-h2" style={{ margin: 0 }}>
            Configuración de patrulla
          </h2>
          <Link href="/teams" className="btn btn-ghost btn-sm">
            <ScoutIcon name="chevronl" size={14} /> Volver
          </Link>
        </div>

        <TeamForm
          hiddenId={team.id}
          initialName={team.name}
          initialEmblem={team.emblem ?? team.name.charAt(0).toUpperCase()}
          initialColor={colorOf(team.color)}
          initialAvatarUrl={team.avatar_url ?? ""}
          action={updateTeamAction}
          submitLabel="Guardar cambios"
        />
      </div>
    </>
  );
}
