import Link from "next/link";
import { BadgeCircle } from "./badge-circle";
import { ScoutIcon } from "./icon";

interface VictoryModalProps {
  title?: string;
  gameLabel?: string;
  xp?: number;
  patrolBonus?: number;
  time?: string;
  livesLeft?: string;
  isRecord?: boolean;
  primaryHref?: string;
  secondaryHref?: string;
}

const CONFETTI = [
  ["10%", "-30px", "var(--primary)"],
  ["20%", "-50px", "var(--accent)"],
  ["80%", "-40px", "var(--c-purple)"],
  ["90%", "-20px", "var(--primary)"],
  ["50%", "-70px", "var(--c-rose)"],
  ["35%", "-25px", "var(--accent)"],
  ["65%", "-55px", "var(--c-sky)"],
] as const;

export function VictoryModal({
  title = "¡Victoria!",
  gameLabel = "Memoria Visual nivel 3",
  xp = 150,
  patrolBonus = 50,
  time = "00:42",
  livesLeft = "3 / 3",
  isRecord = true,
  primaryHref = "/play",
  secondaryHref = "/dashboard",
}: VictoryModalProps) {
  return (
    <div
      className="grid place-items-center"
      style={{
        minHeight: "100dvh",
        background: "oklch(0 0 0 / 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: 20,
      }}
    >
      <div
        className="modal text-center"
        style={{ width: "100%", maxWidth: 400, padding: 28 }}
      >
        <div style={{ position: "relative", height: 0 }}>
          {CONFETTI.map(([x, y, c], i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 8,
                height: 8,
                borderRadius: 2,
                background: c,
                transform: `rotate(${i * 45}deg)`,
              }}
            />
          ))}
        </div>

        <div className="grid place-items-center" style={{ marginBottom: 18 }}>
          <BadgeCircle color="purple" size={96} ringed pulse>
            <ScoutIcon name="starfill" size={44} stroke={1.8} />
          </BadgeCircle>
        </div>

        <span className="chip chip-accent" style={{ marginBottom: 8 }}>
          +{xp} XP
        </span>
        <h2 className="t-display-lg" style={{ margin: "10px 0 4px" }}>
          {title}
        </h2>
        <p className="t-body text-muted" style={{ margin: "0 0 18px" }}>
          Has dominado <b style={{ color: "var(--fg)" }}>{gameLabel}</b>.
          {patrolBonus > 0 && (
            <>
              {" "}Tu patrulla gana{" "}
              <b style={{ color: "var(--accent)" }}>+{patrolBonus} pts</b> extra.
            </>
          )}
        </p>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div className="t-overline text-muted">Tiempo</div>
            <div className="t-num" style={{ fontSize: 18 }}>
              {time}
            </div>
          </div>
          <div
            style={{
              padding: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div className="t-overline text-muted">Vidas</div>
            <div className="t-num" style={{ fontSize: 18, color: "var(--c-rose)" }}>
              {livesLeft}
            </div>
          </div>
          <div
            style={{
              padding: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div className="t-overline text-muted">Récord</div>
            <div className="t-num" style={{ fontSize: 18, color: "var(--accent)" }}>
              {isRecord ? "★" : "—"}
            </div>
          </div>
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1.4fr", gap: 8 }}
        >
          <Link href={secondaryHref} className="btn btn-secondary">
            Salir
          </Link>
          <Link href={primaryHref} className="btn btn-primary">
            Siguiente nivel <ScoutIcon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
