import Link from "next/link";
import { ScoutLogo } from "@/components/scout/logo";
import { ScoutIcon } from "@/components/scout/icon";
import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
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
        <ScoutIcon name="chevronl" size={14} /> Volver
      </Link>

      <div className="w-full max-w-md">
        <div
          className="flex flex-col items-center gap-3 text-center"
          style={{ marginBottom: 24 }}
        >
          <ScoutLogo size={56} withWordmark={false} />
          <h1 className="t-display-md" style={{ margin: 0 }}>
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="t-body-sm text-muted" style={{ maxWidth: 340 }}>
            Te enviamos un enlace al email para que crees una nueva. Pasa solo
            un minuto.
          </p>
        </div>

        <div className="scout-card" style={{ padding: 24 }}>
          <ForgotForm />
        </div>
      </div>
    </main>
  );
}
