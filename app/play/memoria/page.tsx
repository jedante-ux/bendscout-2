import { GameShell } from "@/components/scout/game-shell";

interface Tile {
  color: string;
  flipped: boolean;
  match: boolean;
}

const TILES: Tile[] = [
  { color: "var(--c-sky)", flipped: true, match: false },
  { color: "var(--c-mint)", flipped: true, match: true },
  { color: "var(--c-mint)", flipped: true, match: true },
  { color: "var(--c-gold)", flipped: false, match: false },
  { color: "var(--c-rose)", flipped: true, match: false },
  { color: "var(--c-gold)", flipped: false, match: false },
  { color: "var(--c-sky)", flipped: false, match: false },
  { color: "var(--c-rose)", flipped: false, match: false },
  { color: "var(--c-purple)", flipped: false, match: false },
];

export default function MemoriaVisualPage() {
  return (
    <GameShell
      title="MEMORIA VISUAL"
      time="00:45"
      points={1250}
      lives={3}
      livesUsed={0}
      level={3}
    >
      <div className="flex flex-1 items-center justify-center">
        <div
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, oklch(0.30 0.05 250), oklch(0.16 0.03 250) 70%)",
            padding: 16,
            borderRadius: "var(--r-xl)",
            width: "100%",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
          >
            {TILES.map((t, i) => (
              <div
                key={i}
                className="grid place-items-center"
                style={{
                  aspectRatio: 1,
                  borderRadius: "var(--r-md)",
                  background: t.flipped
                    ? `radial-gradient(circle at 30% 30%, color-mix(in oklch, ${t.color} 60%, white), ${t.color})`
                    : "linear-gradient(160deg, oklch(0.35 0.04 250), oklch(0.22 0.04 250))",
                  border: t.match
                    ? "2px solid var(--primary)"
                    : "1px solid color-mix(in oklch, white 8%, transparent)",
                  boxShadow: t.match
                    ? "0 0 16px 0 color-mix(in oklch, var(--primary) 60%, transparent)"
                    : "inset 0 1px 0 oklch(1 0 0 / 0.06)",
                  transition: "all 240ms ease",
                }}
              >
                {t.flipped ? (
                  <svg
                    width="38%"
                    height="38%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(0.20 0.05 145)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M5 19c0-9 7-14 16-14 0 9-5 16-14 16-3 0-2-1-2-2Z"
                      fill="oklch(0.20 0.05 145)"
                      fillOpacity="0.3"
                    />
                    <path d="M5 19 16 8" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 32,
                      color: "oklch(0.45 0.03 250)",
                    }}
                  >
                    ?
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="between" style={{ marginTop: 14 }}>
            <span className="t-caption text-muted">Parejas: 1 / 4</span>
            <span
              className="t-caption"
              style={{ color: "var(--primary)", fontWeight: 700 }}
            >
              ¡Bien!
            </span>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
