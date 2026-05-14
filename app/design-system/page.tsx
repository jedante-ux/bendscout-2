import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/scout/brand-mark";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon } from "@/components/scout/icon";

export default function DesignSystemHubPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 24px",
      }}
    >
      <div
        style={{ width: "100%", maxWidth: 1080, display: "grid", gap: 32 }}
      >
        {/* ============ HERO ============ */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "56px 44px",
            borderRadius: "var(--r-3xl)",
            background:
              "radial-gradient(ellipse 60% 80% at 80% 20%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%), radial-gradient(ellipse 50% 60% at 10% 100%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 70%), var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            aria-hidden
            className="grid-mask"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          />
          <div
            className="hub-hero-grid"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 32,
              alignItems: "center",
            }}
          >
            <div>
              <div
                className="hstack"
                style={{ gap: 12, marginBottom: 20, flexWrap: "wrap" }}
              >
                <BrandMark size={44} priority />
                <span className="brand-wordmark" style={{ fontSize: 28 }}>
                  <span className="bend">Bend</span>
                  <span className="scout">Scout</span>
                </span>
                <span className="chip chip-neutral">v1.0 · 2026</span>
              </div>

              <span className="chip" style={{ padding: "6px 12px" }}>
                <ScoutIcon name="sparkle" size={12} /> Design System
              </span>
              <h1 className="t-display-xl" style={{ margin: "14px 0 12px" }}>
                <span style={{ color: "var(--primary)" }}>Juega</span>,{" "}
                <span style={{ color: "var(--accent)" }}>compite</span>,<br />
                aprende escultismo.
              </h1>
              <p className="t-body-lg text-muted" style={{ maxWidth: 560 }}>
                Sistema visual completo para BendScout — la plataforma de
                minijuegos educativos por patrullas, estilo Playus, con foco en
                competencia por equipos. Todo listo para entregar a tu codebase
                Next.js.
              </p>
            </div>

            <Image
              src="/icons/logo.png"
              alt="BendScout"
              width={500}
              height={500}
              priority
              className="hub-hero-logo"
              style={{
                height: 200,
                width: "auto",
                filter:
                  "drop-shadow(0 24px 48px color-mix(in oklch, var(--primary) 40%, transparent))",
              }}
            />
          </div>
        </div>

        {/* ============ CARDS ============ */}
        <div className="hub-grid">
          <HubCard
            href="/design-system/foundations"
            chip="01 · Foundations"
            title="Sistema de Diseño"
            description={
              <>
                Brand, color, tipografía, espaciado, radios, sombras, iconos,
                componentes y patrones — con tokens compatibles con tu{" "}
                <code>globals.css</code>.
              </>
            }
            tags={[
              "Tokens",
              "Tipografía",
              "Componentes",
              "Iconografía",
              "Patterns",
              "Voz",
            ]}
            preview={<FoundationsPreview />}
          />

          <HubCard
            href="/design-system/screens"
            chip="02 · Screens"
            chipVariant="accent"
            title="Pantallas"
            description={
              <>
                17 pantallas clave: login, dashboard (desktop + mobile),
                perfil, mi patrulla, ranking, 4 minijuegos, misiones, trofeos,
                tienda y modales.
              </>
            }
            tags={[
              "Login",
              "Dashboard",
              "Perfil",
              "Patrulla",
              "Ranking",
              "4 minijuegos",
              "Misiones",
              "Trofeos",
              "Tienda",
              "+2 modales",
            ]}
            preview={<ScreensPreview />}
          />
        </div>

        {/* ============ HANDOFF ============ */}
        <div
          className="scout-card hub-handoff"
          style={{
            padding: 24,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          <div>
            <span className="t-overline text-primary-token">Para handoff</span>
            <h3 className="t-h3" style={{ margin: "8px 0 6px" }}>
              Compatible con tu codebase
            </h3>
            <p className="t-body-sm text-muted" style={{ margin: 0 }}>
              Los tokens (<code>--primary</code>, <code>--card</code>,{" "}
              <code>--c-*</code>, radios) coinciden con tu{" "}
              <code>app/globals.css</code> actual.
            </p>
          </div>
          <div>
            <span className="t-overline text-primary-token">Fuentes</span>
            <h3 className="t-h3" style={{ margin: "8px 0 6px" }}>
              Space Grotesk + Unbounded
            </h3>
            <p className="t-body-sm text-muted" style={{ margin: 0 }}>
              UI en Space Grotesk (geométrica) · Display en Unbounded (arcade
              chunky) · Mono en JetBrains Mono.
            </p>
          </div>
          <div>
            <span className="t-overline text-primary-token">Iconos</span>
            <h3 className="t-h3" style={{ margin: "8px 0 6px" }}>
              Set de 50+ iconos
            </h3>
            <p className="t-body-sm text-muted" style={{ margin: 0 }}>
              Outline 2px estilo Lucide + iconos scout-específicos (brújula,
              nudo, hoja, fogata, escudo).
            </p>
          </div>
        </div>

        <footer
          style={{
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          <span className="t-body-sm text-muted">
            <b style={{ color: "var(--primary)" }}>Bend</b>
            <b style={{ color: "var(--accent)" }}>Scout</b> · Design System v1.0
            · Hecho para tu Claude Code 🤖
          </span>
        </footer>
      </div>

      <style>{`
        .hub-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 720px) {
          .hub-grid { grid-template-columns: 1fr; }
          .hub-hero-grid { grid-template-columns: 1fr !important; }
          .hub-hero-logo { display: none; }
          .hub-handoff { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function HubCard({
  href,
  chip,
  chipVariant = "primary",
  title,
  description,
  tags,
  preview,
}: {
  href: string;
  chip: string;
  chipVariant?: "primary" | "accent";
  title: string;
  description: React.ReactNode;
  tags: string[];
  preview: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hub-card"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: 32,
        borderRadius: "var(--r-2xl)",
        background: "var(--card)",
        border: "1px solid var(--border)",
        transition:
          "transform 200ms var(--ease-spring), border-color 200ms",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        minHeight: 280,
      }}
    >
      <div>
        <span className={chipVariant === "accent" ? "chip chip-accent" : "chip"}>
          {chip}
        </span>
        <h2 className="t-display-md" style={{ margin: "12px 0 6px" }}>
          {title}
        </h2>
        <p className="t-body-sm text-muted" style={{ margin: 0 }}>
          {description}
        </p>
      </div>

      {preview}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((t) => (
          <span
            key={t}
            className="chip chip-neutral"
            style={{ fontSize: 10, padding: "3px 8px" }}
          >
            {t}
          </span>
        ))}
      </div>

      <style>{`
        .hub-card:hover {
          transform: translateY(-3px);
          border-color: color-mix(in oklch, var(--primary) 40%, transparent) !important;
        }
      `}</style>
    </Link>
  );
}

function FoundationsPreview() {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: "var(--r-lg)",
        background: "var(--surface)",
        border: "1px solid var(--border-soft)",
        position: "relative",
        overflow: "hidden",
        aspectRatio: "16/9",
        padding: 20,
        display: "grid",
        gridTemplateColumns: "80px 1fr 1fr 1fr",
        gap: 12,
        alignItems: "center",
      }}
    >
      {/* primary swatch */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "var(--primary)",
          boxShadow:
            "0 0 0 1px oklch(1 0 0 / 0.06), 0 12px 24px -8px color-mix(in oklch, var(--primary) 60%, transparent)",
        }}
      />
      {/* font sample */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            lineHeight: 1,
          }}
        >
          Aa
        </div>
        <div className="t-caption text-muted" style={{ marginTop: 4 }}>
          Unbounded
        </div>
      </div>
      {/* color swatches */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
        }}
      >
        <div style={{ aspectRatio: 1, borderRadius: 8, background: "var(--c-mint)" }} />
        <div style={{ aspectRatio: 1, borderRadius: 8, background: "var(--c-gold)" }} />
        <div style={{ aspectRatio: 1, borderRadius: 8, background: "var(--c-purple)" }} />
        <div style={{ aspectRatio: 1, borderRadius: 8, background: "var(--c-rose)" }} />
      </div>
      {/* button + xp */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          className="btn btn-primary btn-sm"
          style={{ fontSize: 11, pointerEvents: "none" }}
        >
          Botón
        </span>
        <XpBar value={70} max={100} />
      </div>
    </div>
  );
}

function ScreensPreview() {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: "var(--r-lg)",
        background: "var(--surface)",
        border: "1px solid var(--border-soft)",
        position: "relative",
        overflow: "hidden",
        aspectRatio: "16/9",
        padding: 14,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
      }}
    >
      <div
        style={{
          background: "var(--card-hi)",
          borderRadius: 6,
          display: "grid",
          placeItems: "center",
          color: "var(--primary)",
        }}
      >
        <ScoutIcon name="home" size={20} />
      </div>
      <div
        style={{
          background: "var(--card-hi)",
          borderRadius: 6,
          display: "grid",
          placeItems: "center",
          color: "var(--accent)",
        }}
      >
        <ScoutIcon name="trophy" size={20} />
      </div>
      <div
        style={{
          background: "var(--card-hi)",
          borderRadius: 6,
          display: "grid",
          placeItems: "center",
          color: "var(--c-purple)",
        }}
      >
        <ScoutIcon name="gamepad" size={20} />
      </div>
      <div
        style={{
          background: "var(--card-hi)",
          borderRadius: 6,
          display: "grid",
          placeItems: "center",
          color: "var(--c-rose)",
        }}
      >
        <ScoutIcon name="shield" size={20} />
      </div>
      <div
        style={{
          gridColumn: "span 4",
          background:
            "linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
          borderRadius: 8,
          padding: 10,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--fg)",
          }}
        >
          DESAFÍO DE SENDEROS
        </span>
        <span
          className="btn btn-primary btn-sm"
          style={{
            fontSize: 10,
            height: 24,
            padding: "0 8px",
            pointerEvents: "none",
          }}
        >
          Jugar
        </span>
      </div>
    </div>
  );
}
