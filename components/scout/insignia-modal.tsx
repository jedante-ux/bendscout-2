import Link from "next/link";
import { BadgeCircle } from "./badge-circle";
import { ScoutIcon } from "./icon";

interface InsigniaModalProps {
  name?: string;
  description?: string;
  rarity?: string;
  percentText?: string;
  xp?: number;
  points?: number;
  patrolBonus?: number;
  primaryHref?: string;
}

export function InsigniaModal({
  name = "Explorador",
  description = "Has completado tu primer sendero y descubierto rincones que pocos conocen.",
  rarity = "Insignia rara · Top 8% scouts",
  percentText = "Solo el 8% de los scouts tiene esta insignia 🌿",
  xp = 300,
  points = 500,
  patrolBonus = 1000,
  primaryHref = "/profile",
}: InsigniaModalProps) {
  const sparkles: [number, number][] = [
    [10, 20],
    [80, 15],
    [15, 75],
    [88, 80],
    [50, 5],
  ];

  return (
    <div
      className="relative grid place-items-center"
      style={{
        minHeight: "100dvh",
        background: "oklch(0 0 0 / 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: 20,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--c-purple) 30%, transparent), transparent 60%)",
        }}
      />

      <div
        className="modal text-center"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 32,
          position: "relative",
        }}
      >
        {sparkles.map(([x, y], i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              color: "var(--c-purple)",
            }}
          >
            <ScoutIcon name="sparkle" size={12} />
          </span>
        ))}

        <span className="chip chip-purple" style={{ marginBottom: 4 }}>
          {rarity}
        </span>

        <div
          className="grid place-items-center"
          style={{ margin: "20px 0 18px", position: "relative" }}
        >
          <BadgeCircle color="purple" size={96} ringed pulse>
            <ScoutIcon name="starfill" size={44} stroke={1.8} />
          </BadgeCircle>
        </div>

        <h2 className="t-display-lg" style={{ margin: "0 0 6px" }}>
          ¡Eres {name}!
        </h2>
        <p className="t-body text-muted" style={{ margin: "0 0 4px" }}>
          {description}
        </p>
        <p className="t-caption text-soft" style={{ margin: "0 0 22px" }}>
          {percentText}
        </p>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 22,
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
            <div className="t-overline text-muted">+ XP</div>
            <div className="t-num" style={{ fontSize: 18, color: "var(--primary)" }}>
              +{xp}
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
            <div className="t-overline text-muted">+ Pts</div>
            <div className="t-num" style={{ fontSize: 18, color: "var(--accent)" }}>
              +{points}
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
            <div className="t-overline text-muted">Patrulla</div>
            <div className="t-num" style={{ fontSize: 18 }}>
              +{(patrolBonus / 1000).toFixed(0)}k
            </div>
          </div>
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1.4fr", gap: 8 }}
        >
          <button type="button" className="btn btn-secondary">
            <ScoutIcon name="share" size={14} /> Compartir
          </button>
          <Link href={primaryHref} className="btn btn-primary">
            ¡Genial!
          </Link>
        </div>
      </div>
    </div>
  );
}
