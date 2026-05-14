"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ScoutIcon } from "@/components/scout/icon";
import { signupAction, type ActionResult } from "../actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(signupAction, undefined);

  const fieldError = (field: "username" | "email" | "password") =>
    state && !state.ok && state.field === field ? state.error : null;
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form action={formAction} className="vstack" style={{ gap: 14 }}>
      <div>
        <label
          className="t-overline text-muted"
          htmlFor="username"
          style={{ marginBottom: 6, display: "block" }}
        >
          Nombre scout
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          className="input input-fancy"
          placeholder="lobeznoVeloz"
          aria-invalid={!!fieldError("username")}
        />
        {fieldError("username") && (
          <p className="t-caption" style={{ color: "var(--c-rose)", marginTop: 4 }}>
            {fieldError("username")}
          </p>
        )}
      </div>

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
          aria-invalid={!!fieldError("email")}
        />
        {fieldError("email") && (
          <p className="t-caption" style={{ color: "var(--c-rose)", marginTop: 4 }}>
            {fieldError("email")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="password"
          style={{ marginBottom: 6, display: "block" }}
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input input-fancy"
          placeholder="Mín. 8 caracteres"
          aria-invalid={!!fieldError("password")}
        />
        {fieldError("password") && (
          <p className="t-caption" style={{ color: "var(--c-rose)", marginTop: 4 }}>
            {fieldError("password")}
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
        style={{ marginTop: 8 }}
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
        <ScoutIcon name="arrow" size={16} />
      </button>

      <p
        className="t-caption text-muted"
        style={{ textAlign: "center", marginTop: 16 }}
      >
        ¿Ya tienes cuenta?{" "}
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
