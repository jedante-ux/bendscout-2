import Link from "next/link";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";

interface Option {
  letter: string;
  text: string;
  selected: boolean;
}

const OPTIONS: Option[] = [
  { letter: "A", text: "La flor de lis", selected: true },
  { letter: "B", text: "El trébol", selected: false },
  { letter: "C", text: "La estrella", selected: false },
  { letter: "D", text: "El ancla", selected: false },
];

export default function PreguntasScoutPage() {
  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      style={{ background: "var(--bg)" }}
    >
      <header
        className="flex items-center justify-between"
        style={{ padding: "16px 18px" }}
      >
        <Link
          href="/play"
          className="btn btn-ghost btn-icon btn-sm"
          aria-label="Cerrar"
        >
          <ScoutIcon name="close" size={18} />
        </Link>
        <div style={{ textAlign: "center" }}>
          <div
            className="t-display-sm"
            style={{ fontSize: 13, letterSpacing: "0.16em" }}
          >
            PREGUNTAS SCOUT
          </div>
          <div className="t-caption text-muted">Pregunta 2/10</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-caption text-muted">Puntos</div>
          <div
            className="t-num"
            style={{ fontSize: 18, color: "var(--accent)" }}
          >
            750
          </div>
        </div>
      </header>

      <div style={{ padding: "4px 20px 0" }}>
        <div className="xp-track" style={{ height: 4 }}>
          <div className="xp-fill" style={{ width: "20%" }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col" style={{ padding: "20px 20px 12px" }}>
        <span className="chip chip-sky" style={{ alignSelf: "flex-start" }}>
          📚 Símbolos scout
        </span>
        <h2
          className="t-h2"
          style={{ margin: "16px 0 24px", textWrap: "balance" }}
        >
          ¿Cuál es el símbolo mundial del escultismo?
        </h2>

        <div className="vstack flex-1" style={{ gap: 10 }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.letter}
              type="button"
              className={cn(
                "btn",
                opt.selected ? "btn-primary" : "btn-secondary",
              )}
              style={{
                height: 56,
                padding: "0 16px",
                width: "100%",
                justifyContent: "flex-start",
                fontSize: 15,
                gap: 14,
              }}
            >
              <span
                className="grid place-items-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: opt.selected
                    ? "oklch(0 0 0 / 0.2)"
                    : "var(--card)",
                  color: opt.selected
                    ? "var(--primary-ink)"
                    : "var(--fg-muted)",
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {opt.letter}
              </span>
              {opt.text}
              {opt.selected && (
                <ScoutIcon
                  name="check"
                  size={18}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: "100%", marginTop: 12 }}
        >
          Confirmar respuesta
        </button>
      </div>

      <XpBar value={20} max={100} />
    </main>
  );
}
