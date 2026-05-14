"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
  const [timezone, setTimezone] = useState(initialTimezone);

  // Avatar state: previewUrl drives what's shown. Sources, in priority order:
  // 1. local File preview (object URL)
  // 2. existing avatarUrl from DB
  // 3. fallback Avatar with initials
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  // Revoke object URLs on unmount / replace
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const previewUrl = filePreview
    ? filePreview
    : removeAvatar
      ? null
      : initialAvatarUrl || null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) {
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview(null);
      return;
    }
    if (!ACCEPTED_MIMES.includes(file.type)) {
      setFileError("Formato no soportado. Usa JPG, PNG, WEBP o GIF.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFileError("La imagen pesa más de 5 MB.");
      e.target.value = "";
      return;
    }
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  }

  function handleRemove() {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setRemoveAvatar(true);
    setFileError(null);
  }

  const fieldError = (
    f: "username" | "displayName" | "avatarFile" | "timezone",
  ) => (state && !state.ok && state.field === f ? state.error : null);
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="vstack"
      style={{ gap: 18 }}
    >
      {/* Avatar uploader */}
      <input
        type="hidden"
        name="removeAvatar"
        value={removeAvatar ? "1" : "0"}
      />
      <div
        className="scout-card-flat"
        style={{ padding: 16 }}
      >
        <div
          className="flex flex-col items-center gap-4 sm:flex-row sm:items-center"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
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
                flexShrink: 0,
              }}
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
            <div
              className="t-caption text-muted"
              style={{ marginBottom: 10 }}
            >
              @{username || "username"}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ScoutIcon name="edit" size={14} />
                {previewUrl ? "Cambiar foto" : "Subir foto"}
              </button>
              {previewUrl && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleRemove}
                  style={{ color: "var(--c-rose)" }}
                >
                  <ScoutIcon name="close" size={14} />
                  Quitar
                </button>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          id="avatarFile"
          name="avatarFile"
          type="file"
          accept={ACCEPTED_MIMES.join(",")}
          className="sr-only"
          onChange={handleFileChange}
          aria-invalid={!!fileError || !!fieldError("avatarFile")}
        />
        {(fileError || fieldError("avatarFile")) && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 10, marginBottom: 0 }}
          >
            {fileError ?? fieldError("avatarFile")}
          </p>
        )}
        <p
          className="t-caption text-soft"
          style={{ marginTop: fileError ? 4 : 10, marginBottom: 0 }}
        >
          JPG, PNG, WEBP o GIF. Máx 5 MB.
        </p>
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
