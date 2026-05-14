"use client";

import { useActionState, useState } from "react";
import { Avatar } from "@/components/scout/avatar";
import { ScoutIcon } from "@/components/scout/icon";
import {
  updateProfileAction,
  type ProfileActionResult,
} from "@/lib/profile/actions";

interface ProfileEditFormProps {
  initialUsername: string;
  initialDisplayName: string;
  initialAvatarUrl: string;
  initialTimezone: string;
}

const COMMON_TZ = [
  "America/Caracas",
  "America/Bogota",
  "America/Mexico_City",
  "America/Buenos_Aires",
  "America/Santiago",
  "America/Lima",
  "Europe/Madrid",
];

export function ProfileEditForm({
  initialUsername,
  initialDisplayName,
  initialAvatarUrl,
  initialTimezone,
}: ProfileEditFormProps) {
  const [state, formAction, pending] = useActionState<
    ProfileActionResult | undefined,
    FormData
  >(updateProfileAction, undefined);

  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [timezone, setTimezone] = useState(initialTimezone);

  const fieldError = (
    f: "username" | "displayName" | "avatarUrl" | "timezone",
  ) => (state && !state.ok && state.field === f ? state.error : null);
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form action={formAction} className="vstack" style={{ gap: 18 }}>
      {/* Avatar preview */}
      <div
        className="scout-card-flat hstack"
        style={{
          padding: 16,
          gap: 16,
          alignItems: "center",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || username}
            width={72}
            height={72}
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              objectFit: "cover",
              border: "1px solid var(--border-hi)",
              boxShadow: "0 0 0 3px var(--bg), 0 0 0 5px var(--primary)",
            }}
            onError={() => setAvatarUrl("")}
          />
        ) : (
          <Avatar
            name={displayName || username || "?"}
            size={72}
            ring
          />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="t-h3" style={{ margin: 0 }}>
            {displayName || username || "Tu nombre"}
          </div>
          <div className="t-caption text-muted">@{username || "username"}</div>
        </div>
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="displayName"
          style={{ marginBottom: 6, display: "block" }}
        >
          Nombre visible
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxLength={48}
          className="input input-fancy"
          placeholder="Tu nombre de scout"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          aria-invalid={!!fieldError("displayName")}
        />
        {fieldError("displayName") && (
          <p className="t-caption" style={{ color: "var(--c-rose)", marginTop: 4 }}>
            {fieldError("displayName")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="username"
          style={{ marginBottom: 6, display: "block" }}
        >
          Nombre de usuario (URL)
        </label>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--fg-soft)",
              pointerEvents: "none",
              fontWeight: 700,
            }}
          >
            @
          </span>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]+"
            className="input input-fancy"
            placeholder="lobeznoVeloz"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ paddingLeft: 32 }}
            aria-invalid={!!fieldError("username")}
          />
        </div>
        <p
          className="t-caption text-soft"
          style={{ marginTop: 6, marginBottom: 0 }}
        >
          3-24 caracteres. Solo letras, números y guión bajo.
        </p>
        {fieldError("username") && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 4 }}
          >
            {fieldError("username")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="avatarUrl"
          style={{ marginBottom: 6, display: "block" }}
        >
          URL de avatar (opcional)
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          className="input input-fancy"
          placeholder="https://..."
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          aria-invalid={!!fieldError("avatarUrl")}
        />
        {fieldError("avatarUrl") && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 4 }}
          >
            {fieldError("avatarUrl")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="timezone"
          style={{ marginBottom: 6, display: "block" }}
        >
          Zona horaria
        </label>
        <select
          id="timezone"
          name="timezone"
          className="input input-fancy"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          aria-invalid={!!fieldError("timezone")}
        >
          <option value="">— Elegir —</option>
          {COMMON_TZ.includes(timezone) ? null : timezone ? (
            <option value={timezone}>{timezone}</option>
          ) : null}
          {COMMON_TZ.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p
          className="t-caption text-soft"
          style={{ marginTop: 6, marginBottom: 0 }}
        >
          Usada para calcular el día de tus partidas en torneos.
        </p>
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

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-lg"
          style={{ flex: 1 }}
        >
          {pending ? "Guardando…" : "Guardar cambios"}
          <ScoutIcon name="check" size={16} stroke={2.4} />
        </button>
      </div>
    </form>
  );
}
