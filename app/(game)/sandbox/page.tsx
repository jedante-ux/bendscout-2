import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { ScoutIcon } from "@/components/scout/icon";
import { GAMES as REGISTRY_GAMES } from "@/lib/games/registry";

/**
 * Sandbox de minijuegos. Estos enlaces saltan el daily pick y el flujo de
 * intentos del Jamboree — sirven para testing puro. Cada juego respeta el
 * query `?sandbox=1` para correr sin escribir a `daily_plays` ni
 * `jamboree_scores`.
 */
export default function SandboxPage() {
  // Solo juegos con ruta y status "live". Los `soon`/`locked` no tienen
  // página todavía, así que no se exponen aquí.
  const playable = REGISTRY_GAMES.filter((g) => g.status === "live" && g.route);

  return (
    <>
      <Topbar
        greeting="Sandbox"
        subtitle="Modo libre · sin daily ni jamboree"
        notifications={0}
      />

      <div className="vstack" style={{ gap: 20 }}>
        <section
          className="scout-card"
          style={{
            padding: 18,
            border:
              "1px dashed color-mix(in oklch, var(--c-gold) 55%, var(--border))",
            background:
              "linear-gradient(180deg, color-mix(in oklch, var(--c-gold) 10%, transparent), transparent)",
          }}
        >
          <div className="hstack" style={{ gap: 10, alignItems: "center" }}>
            <span
              className="t-overline"
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background:
                  "color-mix(in oklch, var(--c-gold) 22%, transparent)",
                color: "var(--c-gold)",
                border:
                  "1px solid color-mix(in oklch, var(--c-gold) 45%, transparent)",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              🧪 Modo prueba
            </span>
            <span className="t-caption text-muted">
              Solo testing — no afecta tu Jamboree
            </span>
          </div>
          <p
            className="t-body-sm text-muted"
            style={{ marginTop: 10, maxWidth: "58ch" }}
          >
            Cada juego acá entra con <code>?sandbox=1</code>: sin restricción
            de un-juego-por-día, sin gastar intentos puntuables, sin escribir
            puntaje al jamboree. Ideal para iterar mecánica y balance.
          </p>
        </section>

        <section>
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="t-h3">Minijuegos disponibles</span>
            <span className="t-caption text-muted">
              {playable.length}{" "}
              {playable.length === 1 ? "juego" : "juegos"}
            </span>
          </div>

          {playable.length === 0 ? (
            <div
              className="scout-card text-center"
              style={{ padding: 28 }}
            >
              <p className="t-body-sm text-muted">
                No hay juegos marcados como <code>live</code> en el registry.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playable.map((g) => (
                <Link
                  key={g.key}
                  href={`${g.route}?sandbox=1`}
                  className="scout-card relative overflow-hidden transition hover:-translate-y-1"
                  style={{ padding: 18, textDecoration: "none", color: "var(--fg)" }}
                >
                  <div
                    className="hstack"
                    style={{ gap: 12, alignItems: "flex-start" }}
                  >
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background:
                          "linear-gradient(135deg, color-mix(in oklch, var(--primary) 22%, transparent), color-mix(in oklch, var(--accent) 18%, transparent))",
                        fontSize: 28,
                      }}
                      aria-hidden
                    >
                      {g.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t-display-sm" style={{ fontSize: 16 }}>
                        {g.title}
                      </div>
                      <div
                        className="t-caption text-muted"
                        style={{ marginTop: 2 }}
                      >
                        {g.tagline}
                      </div>
                      <div
                        className="t-mono"
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: "var(--fg-soft)",
                        }}
                      >
                        /{g.key}
                      </div>
                    </div>
                    <ScoutIcon name="arrow" size={16} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
