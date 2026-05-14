"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ScoutIcon } from "@/components/scout/icon";
import { forgotPasswordAction, type ActionResult } from "../actions";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(forgotPasswordAction, undefined);

  if (state?.ok) {
    return (
      <div className="vstack" style={{ gap: 14 }}>
        <div
          className="scout-card-flat"
          style={{
            padding: 16,
            borderColor: "color-mix(in oklch, var(--c-mint) 35%, transparent)",
            background:
              "color-mix(in oklch, var(--c-mint) 10%, transparent)",
          }}
        >
          <div className="hstack" style={{ marginBottom: 6 }}>
            <ScoutIcon name="check" size={18} stroke={2.4} style={{ color: "var(--c-mint)" }} />
            <span style={{ fontWeight: 700, color: "var(--c-mint)" }}>
              Revisa tu email
            </span>
          </div>
          <p className="t-body-sm text-muted" style={{ margin: 0 }}>
            Si la cuenta existe, recibirás un enlace para restablecer la
            contraseña. El enlace expira en 1 hora.
          </p>
          <p
            className="t-caption text-soft"
            style={{ marginTop: 10, fontStyle: "italic" }}
          >
            En desarrollo local los emails llegan a{" "}
            <a
              href="http://127.0.0.1:54324"
              target="_blank"
              rel="noreferrer"
              className="link-underline"
              style={{ color: "var(--primary)" }}
            >
              Mailpit ↗
            </a>
            .
          </p>
        </div>
        <Link href="/login" className="btn btn-secondary" style={{ width: "100%" }}>
          ← Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  const fieldError = state && !state.ok && state.field === "email" ? state.error : null;
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form action={formAction} className="vstack" style={{ gap: 14 }}>
      <div>
        <label
          className="t-overline text-muted"
          htmlFor="email"
          style={{ marginBottom: 6, display: "block" }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input input-fancy"
          placeholder="scout@bendscout.app"
          aria-invalid={!!fieldError}
        />
        {fieldError && (
          <p className="t-caption" style={{ color: "var(--c-rose)", marginTop: 4 }}>
            {fieldError}
          </p>
        )}
      </div>

      {genericError && (
        <p
          className="t-caption"
          style={{
            color: "var(--c-rose)",
            padding: "8px 12px",
            background: "color-mix(in oklch, var(--c-rose) 12%, transparent)",
            border: "1px solid color-mix(in oklch, var(--c-rose) 30%, transparent)",
            borderRadius: "var(--r-sm)",
          }}
          role="alert"
        >
          {genericError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-lg"
      >
        {pending ? "Enviando…" : "Enviar enlace"}
        <ScoutIcon name="arrow" size={16} />
      </button>

      <p
        className="t-caption text-muted"
        style={{ textAlign: "center", marginTop: 8 }}
      >
        ¿Recuerdas tu contraseña?{" "}
        <Link
          href="/login"
          className="link-underline"
          style={{ color: "var(--primary)", fontWeight: 700 }}
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
