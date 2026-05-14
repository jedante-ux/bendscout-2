import { GameShell } from "@/components/scout/game-shell";

const CELL = 32;
const N = 9;

export default function LaberintoPage() {
  const W = CELL * N + 8;
  return (
    <GameShell
      title="LABERINTO"
      time="01:10"
      points={980}
      hints={3}
      level={2}
    >
      <div className="flex flex-1 items-center justify-center">
        <div
          style={{
            background:
              "linear-gradient(180deg, oklch(0.30 0.06 155), oklch(0.18 0.04 155))",
            padding: 14,
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--border)",
          }}
        >
          <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect
              x="0"
              y="0"
              width={W}
              height={W}
              fill="oklch(0.10 0.03 155)"
              rx="12"
            />
            <g
              stroke="var(--primary)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            >
              <rect
                x="8"
                y="8"
                width={CELL * N - 8}
                height={CELL * N - 8}
                rx="4"
              />
              <path
                d={`
                  M ${8 + CELL} ${8}        L ${8 + CELL} ${8 + CELL * 3}
                  M ${8 + CELL * 2} ${8 + CELL * 2} L ${8 + CELL * 2} ${8 + CELL * 5} L ${8 + CELL * 4} ${8 + CELL * 5}
                  M ${8 + CELL * 3} ${8 + CELL * 2} L ${8 + CELL * 5} ${8 + CELL * 2}
                  M ${8 + CELL * 4} ${8 + CELL * 3} L ${8 + CELL * 4} ${8 + CELL * 4}
                  M ${8 + CELL * 5} ${8 + CELL * 5} L ${8 + CELL * 5} ${8 + CELL * 7}
                  M ${8 + CELL * 6} ${8 + CELL * 6} L ${8 + CELL * 6} ${8 + CELL * 7} L ${8 + CELL * 4} ${8 + CELL * 7}
                  M ${8 + CELL * 6} ${8 + CELL * 3} L ${8 + CELL * 7} ${8 + CELL * 3}
                  M ${8 + CELL * 7} ${8 + CELL * 4} L ${8 + CELL * 7} ${8 + CELL * 6}
                  M ${8 + CELL * 3} ${8 + CELL * 6} L ${8 + CELL * 4} ${8 + CELL * 6}
                `}
              />
            </g>
            <circle
              cx={8 + CELL * 1.5}
              cy={8 + CELL * 1.5}
              r="9"
              fill="var(--accent)"
              filter="url(#glow)"
            />
            <g
              transform={`translate(${8 + CELL * (N - 1.5) - 8}, ${8 + CELL * (N - 1.5) - 8})`}
            >
              <path
                d="m12 0 3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1 3-8z"
                transform="scale(0.7)"
                fill="var(--primary)"
                filter="url(#glow)"
              />
            </g>
          </svg>
          <div className="between" style={{ marginTop: 10 }}>
            <span className="t-caption text-muted">Encuentra la salida</span>
            <span
              className="t-caption"
              style={{ color: "var(--accent)", fontWeight: 700 }}
            >
              +50 XP por pista
            </span>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
