"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Shield } from "@/components/scout/shield";
import { ScoutIcon } from "@/components/scout/icon";
import {
  createTeamAction,
  type TeamActionResult,
} from "@/lib/teams/actions";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ShieldColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

const COLORS: Array<{ key: ShieldColor; label: string }> = [
  { key: "mint", label: "Mint" },
  { key: "gold", label: "Gold" },
  { key: "rose", label: "Rose" },
  { key: "purple", label: "Purple" },
  { key: "orange", label: "Orange" },
  { key: "sky", label: "Sky" },
  { key: "teal", label: "Teal" },
];

export function TeamForm({
  initialName = "",
  initialEmblem = "L",
  initialColor = "mint" as ShieldColor,
  initialAvatarUrl = "",
  hiddenId,
  action = createTeamAction,
  submitLabel = "Crear patrulla",
}: {
  initialName?: string;
  initialEmblem?: string;
  initialColor?: ShieldColor;
  initialAvatarUrl?: string;
  hiddenId?: string;
  action?: typeof createTeamAction;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<
    TeamActionResult | undefined,
    FormData
  >(action, undefined);

  const [name, setName] = useState(initialName);
  const [emblem, setEmblem] = useState(initialEmblem);
  const [color, setColor] = useState<ShieldColor>(initialColor);

  // Avatar uploader state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

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

  const fieldError = (f: "name" | "emblem" | "color" | "avatarFile") =>
    state && !state.ok && state.field === f ? state.error : null;
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form
      action={formAction}
      className="vstack"
      style={{ gap: 16 }}
    >
      {hiddenId && <input type="hidden" name="teamId" value={hiddenId} />}
      <input
        type="hidden"
        name="removeAvatar"
        value={removeAvatar ? "1" : "0"}
      />

      {/* Preview */}
      <div
        className="grid place-items-center scout-card-flat"
        style={{ padding: 24 }}
      >
        <Shield
          letter={(emblem || "?").toUpperCase()}
          color={color}
          size={88}
          imageSrc={previewUrl}
          imageAlt={name || "Patrulla"}
        />
        <div
          className="t-display-sm"
          style={{ marginTop: 12, textAlign: "center", maxWidth: 240 }}
        >
          {name || "Tu patrulla"}
        </div>
        <div className="flex flex-wrap gap-2" style={{ marginTop: 14, justifyContent: "center" }}>
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
            style={{ color: "var(--c-rose)", marginTop: 8, marginBottom: 0 }}
          >
            {fileError ?? fieldError("avatarFile")}
          </p>
        )}
        <p
          className="t-caption text-soft"
          style={{
            marginTop: fileError ? 4 : 8,
            marginBottom: 0,
            textAlign: "center",
          }}
        >
          JPG, PNG, WEBP o GIF. Máx 5 MB.
        </p>
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="name"
          style={{ marginBottom: 6, display: "block" }}
        >
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={3}
          maxLength={48}
          className="input input-fancy"
          placeholder="Lobos del Bosque"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!fieldError("name")}
        />
        {fieldError("name") && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 4 }}
          >
            {fieldError("name")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          htmlFor="emblem"
          style={{ marginBottom: 6, display: "block" }}
        >
          Inicial / emblema (1-2 caracteres)
        </label>
        <input
          id="emblem"
          name="emblem"
          type="text"
          required
          minLength={1}
          maxLength={2}
          pattern="[a-zA-Z0-9]+"
          className="input input-fancy"
          placeholder="L"
          value={emblem}
          onChange={(e) => setEmblem(e.target.value.toUpperCase())}
          style={{ textTransform: "uppercase", fontFamily: "var(--font-display)" }}
          aria-invalid={!!fieldError("emblem")}
        />
        {fieldError("emblem") && (
          <p
            className="t-caption"
            style={{ color: "var(--c-rose)", marginTop: 4 }}
          >
            {fieldError("emblem")}
          </p>
        )}
      </div>

      <div>
        <label
          className="t-overline text-muted"
          style={{ marginBottom: 6, display: "block" }}
        >
          Color de patrulla
        </label>
        <input type="hidden" name="color" value={color} />
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setColor(c.key)}
              aria-label={c.label}
              aria-pressed={color === c.key}
              className={cn(
                "grid place-items-center transition",
                color === c.key && "ring-2",
              )}
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: `var(--c-${c.key})`,
                cursor: "pointer",
                boxShadow:
                  color === c.key
                    ? `0 0 0 3px var(--bg), 0 0 0 5px var(--c-${c.key})`
                    : "inset 0 0 0 1.5px color-mix(in oklch, currentColor 55%, transparent)",
                color: `var(--c-${c.key})`,
              }}
            >
              {color === c.key && (
                <ScoutIcon
                  name="check"
                  size={20}
                  stroke={3}
                  style={{ color: "var(--primary-ink)" }}
                />
              )}
            </button>
          ))}
        </div>
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
        {pending ? "Guardando…" : submitLabel}
        <ScoutIcon name="arrow" size={16} />
      </button>
    </form>
  );
}
