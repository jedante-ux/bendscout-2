"use client";

import { useActionState, useState } from "react";
import { Shield } from "@/components/scout/shield";
import { ScoutIcon } from "@/components/scout/icon";
import {
  createTeamAction,
  type TeamActionResult,
} from "@/lib/teams/actions";
import { cn } from "@/lib/utils";

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
  hiddenId,
  action = createTeamAction,
  submitLabel = "Crear patrulla",
}: {
  initialName?: string;
  initialEmblem?: string;
  initialColor?: ShieldColor;
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

  const fieldError = (f: "name" | "emblem" | "color") =>
    state && !state.ok && state.field === f ? state.error : null;
  const genericError = state && !state.ok && !state.field ? state.error : null;

  return (
    <form action={formAction} className="vstack" style={{ gap: 16 }}>
      {hiddenId && <input type="hidden" name="teamId" value={hiddenId} />}

      {/* Preview */}
      <div
        className="grid place-items-center scout-card-flat"
        style={{ padding: 24 }}
      >
        <Shield
          letter={(emblem || "?").toUpperCase()}
          color={color}
          size={88}
        />
        <div
          className="t-display-sm"
          style={{ marginTop: 12, textAlign: "center", maxWidth: 240 }}
        >
          {name || "Tu patrulla"}
        </div>
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
