import Link from "next/link";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/scout/topbar";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { ProfileEditForm } from "./profile-edit-form";
import { PasswordForm } from "./password-form";

export default async function ProfileEditPage() {
  const auth = await getAuthState();

  if (!auth.authenticated) {
    redirect("/login?next=/profile/edit");
  }
  if (!auth.profile) {
    redirect("/login");
  }

  const profile = auth.profile;

  return (
    <>
      <Topbar
        auth={auth}
        greeting="Editar perfil"
        subtitle="Actualiza tu identidad scout"
        notifications={0}
      />

      <div
        className="vstack"
        style={{ gap: 16, maxWidth: 540, margin: "0 auto" }}
      >
        <div className="scout-card" style={{ padding: 24 }}>
          <div className="between" style={{ marginBottom: 18 }}>
            <h2 className="t-h2" style={{ margin: 0 }}>
              Mi perfil
            </h2>
            <Link href="/profile" className="btn btn-ghost btn-sm">
              <ScoutIcon name="chevronl" size={14} /> Volver
            </Link>
          </div>

          <ProfileEditForm
            initialUsername={profile.username}
            initialDisplayName={profile.display_name ?? profile.username}
            initialAvatarUrl={profile.avatar_url ?? ""}
            initialTimezone={profile.timezone ?? ""}
          />
        </div>

        <div className="scout-card" style={{ padding: 24 }}>
          <div className="between" style={{ marginBottom: 4 }}>
            <h2 className="t-h2" style={{ margin: 0 }}>
              Cambiar contraseña
            </h2>
            <ScoutIcon
              name="lock"
              size={18}
              style={{ color: "var(--fg-muted)" }}
            />
          </div>
          <p
            className="t-body-sm text-muted"
            style={{ margin: "0 0 18px" }}
          >
            Necesitas tu contraseña actual para confirmar.
          </p>
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
