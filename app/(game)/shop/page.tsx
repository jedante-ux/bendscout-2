import { Topbar } from "@/components/scout/topbar";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";

type ShopColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface Cosmetic {
  title: string;
  price: number;
  color: ShopColor;
  emoji: string;
}

interface Boost {
  title: string;
  price: number;
  color: ShopColor;
  icon: ScoutIconName;
  desc: string;
}

const COSMETICS: Cosmetic[] = [
  { title: "Avatar · Halcón", price: 800, color: "rose", emoji: "🦅" },
  { title: "Marco dorado", price: 1500, color: "gold", emoji: "🏆" },
  { title: "Escudo de patrulla XL", price: 1200, color: "purple", emoji: "🛡️" },
  { title: "Banner ‘Aullido’", price: 500, color: "mint", emoji: "🐺" },
];

const BOOSTS: Boost[] = [
  { title: "Doble XP · 1 día", price: 600, color: "mint", icon: "starfill", desc: "Todo lo que juegues hoy" },
  { title: "+3 vidas", price: 250, color: "rose", icon: "heartfill", desc: "Solo para minijuegos" },
  { title: "Pista doble", price: 150, color: "gold", icon: "lightbulb", desc: "Funciona en Laberinto" },
];

export default function ShopPage() {
  return (
    <>
      <Topbar
        greeting="Tienda"
        subtitle="Personaliza tu camino con puntos scout"
        notifications={3}
      />

      <div className="vstack" style={{ gap: 20 }}>
        {/* Wallet */}
        <section
          className="scout-card flex items-center justify-between"
          style={{ padding: 16, gap: 16, flexWrap: "wrap" }}
        >
          <div className="flex items-center" style={{ gap: 14 }}>
            <BadgeCircle color="gold" size={48} ringed>
              <ScoutIcon name="starfill" size={22} stroke={2.2} />
            </BadgeCircle>
            <div>
              <div className="t-overline text-muted">Tu cartera</div>
              <div className="flex items-baseline" style={{ gap: 6 }}>
                <span
                  className="t-num"
                  style={{ fontSize: 32, color: "var(--accent)" }}
                >
                  8 560
                </span>
                <span className="t-body-sm text-muted">puntos scout</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary">Historial</button>
            <button className="btn btn-primary">
              Ganar más <ScoutIcon name="plus" size={14} />
            </button>
          </div>
        </section>

        {/* Featured pack */}
        <section
          className="scout-card-glow grid items-center"
          style={{
            padding: 24,
            gridTemplateColumns: "auto 1fr auto",
            gap: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 40% 80% at 0% 50%, color-mix(in oklch, var(--c-purple) 22%, transparent), transparent 60%)",
            }}
          />
          <div
            className="relative grid place-items-center"
            style={{
              width: 100,
              height: 100,
              borderRadius: "var(--r-xl)",
              background:
                "linear-gradient(140deg, var(--c-purple), color-mix(in oklch, var(--c-purple) 50%, black))",
            }}
          >
            <span
              style={{
                fontSize: 56,
                filter: "drop-shadow(0 8px 16px oklch(0 0 0 / 0.4))",
              }}
            >
              🎁
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <span className="chip chip-purple">★ Edición limitada</span>
            <div className="t-display-md" style={{ margin: "8px 0 4px" }}>
              Pack Pionero
            </div>
            <p className="t-body-sm text-muted" style={{ margin: 0 }}>
              Marco dorado + 3 boosts de XP + insignia exclusiva
              &quot;Coleccionista&quot;.
            </p>
          </div>
          <div style={{ position: "relative", textAlign: "right" }}>
            <div
              className="flex items-center justify-end"
              style={{ gap: 8 }}
            >
              <span
                className="t-mono text-soft"
                style={{ textDecoration: "line-through", fontSize: 12 }}
              >
                3 200
              </span>
              <span
                className="t-num"
                style={{ fontSize: 28, color: "var(--accent)" }}
              >
                2 400
              </span>
            </div>
            <button className="btn btn-accent" style={{ marginTop: 10 }}>
              Comprar pack
            </button>
          </div>
        </section>

        {/* Cosmetics + Boosts */}
        <section
          className="grid gap-4"
          style={{
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          }}
        >
          <div>
            <div className="between" style={{ marginBottom: 12 }}>
              <span className="t-h2">Cosméticos</span>
              <span className="t-caption text-muted">Cambia cuando quieras</span>
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {COSMETICS.map((c) => (
                <div key={c.title} className="scout-card" style={{ padding: 14 }}>
                  <div
                    className="grid place-items-center"
                    style={{
                      aspectRatio: "16 / 10",
                      borderRadius: "var(--r-md)",
                      marginBottom: 10,
                      background: `radial-gradient(ellipse 80% 60% at 50% 40%, color-mix(in oklch, var(--c-${c.color}) 30%, transparent), transparent 70%), linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))`,
                    }}
                  >
                    <span style={{ fontSize: 56 }}>{c.emoji}</span>
                  </div>
                  <div className="between" style={{ alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {c.title}
                      </div>
                      <div
                        className="hstack t-caption"
                        style={{ color: "var(--accent)", marginTop: 4 }}
                      >
                        <ScoutIcon name="starfill" size={11} stroke={2.2} />
                        <span className="t-mono">
                          {c.price.toLocaleString("es")}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm">Comprar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="between" style={{ marginBottom: 12 }}>
              <span className="t-h2">Boosts</span>
              <span className="t-caption text-muted">Consumibles</span>
            </div>
            <div className="vstack" style={{ gap: 10 }}>
              {BOOSTS.map((b) => (
                <div key={b.title} className="scout-card" style={{ padding: 14 }}>
                  <div
                    className="grid items-center"
                    style={{
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 14,
                    }}
                  >
                    <BadgeCircle color={b.color} size={48} ringed>
                      <ScoutIcon name={b.icon} size={22} />
                    </BadgeCircle>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {b.title}
                      </div>
                      <div className="t-caption text-muted">{b.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="hstack justify-end"
                        style={{ color: "var(--accent)" }}
                      >
                        <ScoutIcon name="starfill" size={12} stroke={2.2} />
                        <span className="t-num" style={{ fontSize: 16 }}>
                          {b.price}
                        </span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: 6 }}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
