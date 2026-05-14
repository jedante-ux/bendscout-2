import { GameShell } from "@/components/scout/game-shell";

const STARS: Array<[number, number, number]> = [
  [20, 15, 1],
  [60, 8, 2],
  [80, 22, 1.5],
  [35, 30, 1],
  [88, 40, 1.2],
];

const COINS: Array<[number, number]> = [
  [28, 52],
  [50, 73],
  [72, 46],
];

export default function CaminoSeguroPage() {
  return (
    <GameShell
      title="CAMINO SEGURO"
      time="00:30"
      points={1560}
      lives={3}
      livesUsed={1}
      level={4}
    >
      <div className="flex flex-1 items-center justify-center">
        <div
          style={{
            width: "100%",
            aspectRatio: "9 / 12",
            borderRadius: "var(--r-xl)",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, oklch(0.32 0.08 195) 0%, oklch(0.20 0.06 200) 40%, oklch(0.15 0.05 215) 100%)",
            border: "1px solid var(--border)",
            position: "relative",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 30% at 50% 80%, color-mix(in oklch, white 15%, transparent), transparent 70%)",
            }}
          />
          {STARS.map(([x, y, r], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: r * 4,
                height: r * 4,
                borderRadius: 999,
                background: "oklch(1 0 0 / 0.7)",
                boxShadow: "0 0 8px oklch(1 0 0 / 0.6)",
              }}
            />
          ))}

          <Platform left="10%" top="60%" width="28%" height={14} />
          <Platform left="42%" top="78%" width="16%" height={12} />
          <Platform left="62%" top="50%" width="20%" height={14} />
          <Platform left="30%" top="38%" width="14%" height={12} />

          {/* gem */}
          <div
            style={{
              position: "absolute",
              left: "70%",
              top: "32%",
              transform: "translate(-50%, 0)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24">
              <path
                d="M12 2 22 10 12 22 2 10z"
                fill="var(--c-purple)"
                stroke="var(--c-purple)"
                strokeWidth="1.5"
              />
              <path
                d="M12 2 7 10 12 22 17 10z"
                fill="oklch(1 0 0 / 0.4)"
              />
            </svg>
          </div>

          {COINS.map(([x, y], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: 16,
                height: 16,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at 30% 30%, var(--accent), color-mix(in oklch, var(--accent) 50%, black))",
                boxShadow:
                  "0 0 8px color-mix(in oklch, var(--accent) 60%, transparent)",
              }}
            />
          ))}

          {/* character */}
          <div
            className="grid place-items-center"
            style={{
              position: "absolute",
              left: "20%",
              top: "48%",
              width: 36,
              height: 48,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50% 50% 40% 40%",
                background:
                  "linear-gradient(180deg, oklch(0.55 0.14 30), oklch(0.40 0.10 30))",
                boxShadow: "0 6px 14px oklch(0 0 0 / 0.4)",
              }}
            />
            <div
              style={{
                width: 22,
                height: 8,
                borderRadius: 999,
                background: "oklch(0 0 0 / 0.3)",
                position: "absolute",
                bottom: 0,
                filter: "blur(3px)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              padding: "4px 8px",
              background: "oklch(0 0 0 / 0.4)",
              borderRadius: "var(--r-sm)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            ⚡ ¡SALTA!
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function Platform({
  left,
  top,
  width,
  height,
}: {
  left: string;
  top: string;
  width: string;
  height: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderRadius: height,
        background:
          "linear-gradient(180deg, oklch(0.42 0.13 145), oklch(0.26 0.08 145))",
        boxShadow: "0 4px 12px oklch(0 0 0 / 0.4)",
      }}
    />
  );
}
