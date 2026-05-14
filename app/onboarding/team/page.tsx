import Link from "next/link";
import { Shield } from "@/components/scout/shield";
import { ScoutIcon } from "@/components/scout/icon";
import { cn } from "@/lib/utils";

type ShieldColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

const PATRULLAS: Array<{
  letter: string;
  color: ShieldColor;
  name: string;
  members: number;
}> = [
  { letter: "L", color: "mint", name: "Lobos del Bosque", members: 8 },
  { letter: "A", color: "rose", name: "Águilas Reales", members: 6 },
  { letter: "Z", color: "sky", name: "Zorros Veloces", members: 5 },
  { letter: "B", color: "purple", name: "Búhos Nocturnos", members: 7 },
  { letter: "P", color: "orange", name: "Pumas Andinos", members: 4 },
  { letter: "C", color: "teal", name: "Castores", members: 6 },
];

export default function OnboardingTeamPage() {
  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
      style={{ background: "var(--bg)" }}
    >
      <header
        className="flex items-center justify-between"
        style={{ padding: "16px 20px" }}
      >
        <Link
          href="/signup"
          className="btn btn-ghost btn-icon btn-sm"
          aria-label="Volver"
        >
          <ScoutIcon name="chevronl" size={18} />
        </Link>
        <div className="flex gap-1">
          {[true, true, false].map((done, i) => (
            <span
              key={i}
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: done ? "var(--primary)" : "var(--border-hi)",
              }}
            />
          ))}
        </div>
        <Link
          href="/dashboard"
          className="btn btn-ghost btn-sm"
          style={{ fontSize: 12 }}
        >
          Saltar
        </Link>
      </header>

      <div
        className="flex-1 overflow-auto"
        style={{ padding: "8px 20px 20px" }}
      >
        <h1
          className="t-display-md"
          style={{ margin: "8px 0 6px", fontSize: 26 }}
        >
          Elige tu <span style={{ color: "var(--primary)" }}>patrulla</span>
        </h1>
        <p
          className="t-body-sm text-muted"
          style={{ margin: "0 0 18px" }}
        >
          En BendScout siempre formas parte de un equipo. Únete a una existente
          o crea la tuya.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {PATRULLAS.map((p, i) => (
            <button
              key={p.letter}
              type="button"
              className={cn("scout-card text-center transition")}
              style={{
                padding: 14,
                border:
                  i === 0
                    ? "1px solid color-mix(in oklch, var(--primary) 45%, transparent)"
                    : "1px solid var(--border)",
                boxShadow:
                  i === 0
                    ? "0 0 0 3px color-mix(in oklch, var(--primary) 18%, transparent)"
                    : "var(--shadow-md)",
              }}
            >
              <div
                className="grid place-items-center"
                style={{ marginBottom: 10 }}
              >
                <Shield letter={p.letter} color={p.color} size={56} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
              <div
                className="t-caption text-muted"
                style={{ marginTop: 2 }}
              >
                {p.members} scouts
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: "100%", marginTop: 14 }}
        >
          <ScoutIcon name="plus" size={16} /> Crear nueva patrulla
        </button>
      </div>

      <div
        style={{
          padding: "12px 20px 20px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Link
          href="/dashboard"
          className="btn btn-primary btn-lg"
          style={{ width: "100%" }}
        >
          Unirme a Lobos del Bosque
        </Link>
      </div>
    </main>
  );
}
