"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ScoutIcon } from "@/components/scout/icon";
import {
  loginAction,
  continueAsGuestAction,
  type ActionResult,
} from "../actions";

export function LoginForm({ next = "" }: { next?: string }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | undefined,
    FormData
  >(loginAction, undefined);

  const fieldError = (field: "email" | "password") =>
    state && !state.ok && state.field === field ? state.error : null;
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <>
    <form action={formAction} className="vstack" style={{ gap: 14 }}>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="reveal-up" style={{ animationDelay: "500ms" }}>
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
          placeholder="scoutmaster@bendscout.com"
          aria-invalid={!!fieldError("email")}
        />
        {fieldError("email") && (
          <p className="t-caption" style={{ color: "var(--c-rose)", marginTop: 4 }}>
            {fieldError("email")}
          </p>
        )}
      </div>

      <div className="reveal-up" style={{ animationDelay: "580ms" }}>
        <div className="between" style={{ marginBottom: 6 }}>
          <label className="t-overline text-muted" htmlFor="password">
            Contraseña
          </label>
          <Link
            href="/forgot-password"
            className="t-caption link-underline"
            style={{ color: "var(--primary)", fontWeight: 700 }}
          >
            ¿Olvidaste?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input input-fancy"
          placeholder="••••••••"
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
          className="t-caption reveal-up"
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
        className="btn btn-primary btn-lg reveal-up"
        style={{ marginTop: 8, animationDelay: "660ms" }}
      >
        {pending ? "Entrando…" : "Entrar"}
        <ScoutIcon name="arrow" size={16} />
      </button>
    </form>

    <div className="vstack" style={{ gap: 14 }}>
      <div
        className="reveal-up"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "8px 0",
          animationDelay: "760ms",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span className="t-caption text-dim">o</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <form action={continueAsGuestAction}>
        {next && <input type="hidden" name="next" value={next} />}
        <button
          type="submit"
          className="btn btn-outline reveal-up"
          style={{ width: "100%", animationDelay: "820ms" }}
        >
          <ScoutIcon name="user" size={16} /> Continuar como invitado
        </button>
      </form>

      <p
        className="t-caption text-muted reveal-up"
        style={{
          textAlign: "center",
          marginTop: 16,
          animationDelay: "900ms",
        }}
      >
        ¿Sin cuenta?{" "}
        <Link
          href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
          className="link-underline"
          style={{ color: "var(--primary)", fontWeight: 700 }}
        >
          Únete a la tropa →
        </Link>
      </p>
    </div>
    </>
  );
}
