import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";
import { logoutAction } from "@/app/(auth)/actions";

interface SettingsRow {
  href: string;
  label: string;
  hint: string;
  icon: ScoutIconName;
  color: string;
}

const ACCOUNT_ROWS: SettingsRow[] = [
  {
    href: "/profile",
    label: "Mi perfil",
    hint: "Avatar, rango, insignias y estadísticas",
    icon: "user",
    color: "var(--primary)",
  },
  {
    href: "/profile/edit",
    label: "Editar perfil",
    hint: "Nombre, usuario, avatar y zona horaria",
    icon: "edit",
    color: "var(--c-mint)",
  },
  {
    href: "/profile/edit",
    label: "Cambiar contraseña",
    hint: "Actualiza tu contraseña de acceso",
    icon: "lock",
    color: "var(--c-sky)",
  },
];

const PREFERENCE_ROWS: SettingsRow[] = [
  {
    href: "/settings",
    label: "Notificaciones",
    hint: "Próximamente — alertas de misiones y patrulla",
    icon: "bell",
    color: "var(--c-orange)",
  },
  {
    href: "/settings",
    label: "Apariencia",
    hint: "Próximamente — tema claro / oscuro",
    icon: "sparkle",
    color: "var(--c-purple)",
  },
  {
    href: "/settings",
    label: "Privacidad",
    hint: "Próximamente — visibilidad del perfil",
    icon: "eye",
    color: "var(--c-rose)",
  },
];

export default async function SettingsPage() {
  const auth = await getAuthState();

  return (
    <>
      <Topbar
        auth={auth}
        greeting="Ajustes"
        subtitle="Configura tu cuenta y preferencias"
        notifications={0}
      />

      <div
        className="vstack"
        style={{ gap: 20, maxWidth: 640, margin: "0 auto" }}
      >
        <SettingsSection title="Cuenta" rows={ACCOUNT_ROWS} />
        <SettingsSection title="Preferencias" rows={PREFERENCE_ROWS} />

        <section className="scout-card" style={{ padding: 18 }}>
          <div className="t-overline text-muted" style={{ marginBottom: 12 }}>
            Sesión
          </div>
          {auth.authenticated ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="btn btn-secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  color: "var(--c-rose)",
                  borderColor:
                    "color-mix(in oklch, var(--c-rose) 35%, transparent)",
                }}
              >
                <ScoutIcon name="logout" size={16} /> Cerrar sesión
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/login"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function SettingsSection({
  title,
  rows,
}: {
  title: string;
  rows: SettingsRow[];
}) {
  return (
    <section className="scout-card" style={{ padding: 18 }}>
      <div className="t-overline text-muted" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <ul className="vstack" style={{ gap: 8 }}>
        {rows.map((row) => (
          <li key={`${title}-${row.label}`}>
            <Link
              href={row.href}
              className="flex items-center gap-3 rounded-[var(--r-lg)] p-3 transition-colors hover:bg-[var(--surface)]"
              style={{ border: "1px solid var(--border)" }}
            >
              <span
                className="grid place-items-center rounded-full"
                style={{
                  width: 36,
                  height: 36,
                  background: `color-mix(in oklch, ${row.color} 14%, transparent)`,
                  color: row.color,
                  flexShrink: 0,
                }}
              >
                <ScoutIcon name={row.icon} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {row.label}
                </div>
                <div className="t-caption text-muted">{row.hint}</div>
              </div>
              <ScoutIcon
                name="chevron"
                size={16}
                style={{ color: "var(--fg-soft)", flexShrink: 0 }}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
