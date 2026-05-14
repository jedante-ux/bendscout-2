"use client";

import type { ReactNode } from "react";
import { ScoutIcon } from "@/components/scout/icon";

interface GameStartOverlayProps {
  onStart: () => void;
  /** Texto del botón. Default: "¡Comenzar!" */
  label?: string;
  /** Chip de arriba. Default: "Listo para jugar" */
  badge?: string;
  /** Hint opcional bajo el botón (atajos de teclado, instrucciones cortas). */
  hint?: ReactNode;
}

/**
 * Overlay genérico para arrancar un minijuego. Se monta como `absolute
 * inset-0` dentro de un contenedor `relative`. El botón usa los mismos
 * estilos que el resto de los CTAs primarios (`btn btn-primary btn-lg`).
 */
export function GameStartOverlay({
  onStart,
  label = "¡Comenzar!",
  badge = "Listo para jugar",
  hint,
}: GameStartOverlayProps) {
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{
        borderRadius: 16,
        background:
          "linear-gradient(180deg, color-mix(in oklch, var(--bg) 70%, transparent) 0%, color-mix(in oklch, var(--bg) 85%, transparent) 100%)",
        backdropFilter: "blur(4px)",
        zIndex: 10,
      }}
    >
      <div className="vstack" style={{ gap: 12, alignItems: "center" }}>
        <span
          className="t-overline"
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: "color-mix(in oklch, var(--bg) 80%, transparent)",
            border: "1px solid var(--border)",
            letterSpacing: "0.12em",
            fontWeight: 700,
          }}
        >
          {badge}
        </span>
        <button
          type="button"
          onClick={onStart}
          autoFocus
          className="btn btn-primary btn-lg"
          style={{
            padding: "16px 28px",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.04em",
            boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
          }}
        >
          <ScoutIcon name="play" size={18} stroke={2.4} />
          {label}
        </button>
        {hint ? (
          <span
            className="t-caption text-muted"
            style={{
              background: "color-mix(in oklch, var(--bg) 75%, transparent)",
              padding: "4px 10px",
              borderRadius: 8,
            }}
          >
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
