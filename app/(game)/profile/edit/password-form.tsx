"use client";

import { useActionState, useEffect, useRef } from "react";
import { ScoutIcon } from "@/components/scout/icon";
import {
  changePasswordAction,
  type ChangePasswordResult,
} from "@/lib/profile/actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<
    ChangePasswordResult | undefined,
    FormData
  >(changePasswordAction, undefined);

  const formRef = useRef<HTMLFormElement>(null);

  // Clear form on success.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const fieldError = (
    f: "currentPassword" | "newPassword" | "confirmPassword",
  ) => (state && !state.ok && state.field === f ? state.error : null);
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form ref={formRef} action={formAction} className="vstack" style={{ gap: 14 }}>
      <div>
        <label
          className="t-overline text-muted"
          htmlFor="currentPassword"
          style={{ marginBottom: 6, display: "block" }}
        >
          Contraseña actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="input input-fancy"
          placeholder="••••••••"
          aria-invalid={!!fieldError("currentPassword")}
        />
        {fieldError("currentPassword") && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 4 }}
          >
            {fieldError("currentPassword")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="newPassword"
          style={{ marginBottom: 6, display: "block" }}
        >
          Nueva contraseña
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input input-fancy"
          placeholder="Mín. 8 caracteres"
          aria-invalid={!!fieldError("newPassword")}
        />
        {fieldError("newPassword") && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 4 }}
          >
            {fieldError("newPassword")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="confirmPassword"
          style={{ marginBottom: 6, display: "block" }}
        >
          Repite la nueva contraseña
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
          aria-invalid={!!fieldError("confirmPassword")}
        />
        {fieldError("confirmPassword") && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 4 }}
          >
            {fieldError("confirmPassword")}
          </p>
        )}
      </div>

      {genericError && (
        <p
          className="t-caption"
          style={{
            color: "var(--c-rose)",
            padding: "10px 12px",
            background:
              "color-mix(in oklch, var(--c-rose) 12%, transparent)",
            border:
              "1px solid color-mix(in oklch, var(--c-rose) 30%, transparent)",
            borderRadius: "var(--r-sm)",
          }}
          role="alert"
        >
          {genericError}
        </p>
      )}

      {state?.ok && (
        <p
          className="t-caption hstack"
          style={{
            padding: "10px 12px",
            background:
              "color-mix(in oklch, var(--c-mint) 12%, transparent)",
            border:
              "1px solid color-mix(in oklch, var(--c-mint) 30%, transparent)",
            borderRadius: "var(--r-sm)",
            color: "var(--c-mint)",
            fontWeight: 700,
          }}
          role="status"
        >
          <ScoutIcon name="check" size={14} stroke={2.6} /> Contraseña
          actualizada
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
        style={{ width: "100%" }}
      >
        {pending ? "Cambiando…" : "Cambiar contraseña"}
        <ScoutIcon name="check" size={16} stroke={2.4} />
      </button>
    </form>
  );
}
