"use client";

import { useActionState } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import { resetPasswordAction, type ActionResult } from "../actions";

export function ResetForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(resetPasswordAction, undefined);

  const fieldError =
    state && !state.ok && state.field === "password" ? state.error : null;
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form action={formAction} className="vstack" style={{ gap: 14 }}>
      <div>
        <label
          className="t-overline text-muted"
          htmlFor="password"
          style={{ marginBottom: 6, display: "block" }}
        >
          Nueva contraseña
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
          aria-invalid={!!fieldError}
        />
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="confirmPassword"
          style={{ marginBottom: 6, display: "block" }}
        >
          Confirma la contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input input-fancy"
          placeholder="Repítela"
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
        {pending ? "Guardando…" : "Cambiar contraseña"}
        <ScoutIcon name="arrow" size={16} />
      </button>
    </form>
  );
}
