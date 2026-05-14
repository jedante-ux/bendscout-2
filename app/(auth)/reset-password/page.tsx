import Link from "next/link";
import { ScoutLogo } from "@/components/scout/logo";
import { ScoutIcon } from "@/components/scout/icon";
import { ResetForm } from "./reset-form";
import { getAuthState } from "@/lib/auth/session";

export default async function ResetPasswordPage() {
  const auth = await getAuthState();

  // El callback de Supabase setea una sesión efímera al canjear el code.
  // Si no hay sesión es que el enlace expiró o nunca pasó por el callback.
  const linkExpired = !auth.authenticated;

  return (
    <main
      className="relative grid min-h-dvh place-items-center overflow-hidden p-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="grid-mask pointer-events-none absolute inset-0 -z-10" />

      <Link
        href="/login"
        className="absolute left-6 top-6 hstack t-body-sm text-muted hover:text-primary-token"
      >
        <ScoutIcon name="chevronl" size={14} /> Volver al login
      </Link>

      <div className="w-full max-w-md">
        <div
          className="flex flex-col items-center gap-3 text-center"
          style={{ marginBottom: 24 }}
        >
          <ScoutLogo size={56} withWordmark={false} />
          <h1 className="t-display-md" style={{ margin: 0 }}>
            Crea una nueva contraseña
          </h1>
          <p className="t-body-sm text-muted" style={{ maxWidth: 340 }}>
            Elige una contraseña segura. Te dejaremos con sesión iniciada al
            terminar.
          </p>
        </div>

        <div className="scout-card" style={{ padding: 24 }}>
          {linkExpired ? (
            <div className="vstack" style={{ gap: 14 }}>
              <p
                className="t-caption"
                style={{
                  color: "var(--c-rose)",
                  padding: "10px 12px",
                  background: "color-mix(in oklch, var(--c-rose) 12%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--c-rose) 30%, transparent)",
                  borderRadius: "var(--r-sm)",
                }}
              >
                Tu enlace expiró o ya se usó. Solicita uno nuevo.
              </p>
              <Link href="/forgot-password" className="btn btn-primary">
                Pedir nuevo enlace
              </Link>
            </div>
          ) : (
            <ResetForm />
          )}
        </div>
      </div>
    </main>
  );
}
