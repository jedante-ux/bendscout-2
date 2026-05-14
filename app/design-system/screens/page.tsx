import Link from "next/link";
import { BrandMark } from "@/components/scout/brand-mark";
import { ScoutIcon, type ScoutIconName } from "@/components/scout/icon";
import { BadgeCircle } from "@/components/scout/badge-circle";

interface ScreenEntry {
  id: string;
  label: string;
  width: number;
  height: number;
  href?: string;
  status: "live" | "draft";
  icon?: ScoutIconName;
  badgeColor?:
    | "mint"
    | "gold"
    | "rose"
    | "purple"
    | "orange"
    | "sky"
    | "teal";
}

interface ScreenSection {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  screens: ScreenEntry[];
}

const SECTIONS: ScreenSection[] = [
  {
    id: "auth",
    num: "01",
    title: "Auth & Onboarding",
    subtitle: "Primer contacto con BendScout",
    screens: [
      {
        id: "login",
        label: "Login (desktop)",
        width: 1200,
        height: 780,
        href: "/login",
        status: "live",
        icon: "compass",
        badgeColor: "mint",
      },
      {
        id: "signup",
        label: "Signup · Crear cuenta",
        width: 390,
        height: 780,
        href: "/signup",
        status: "live",
        icon: "users",
        badgeColor: "gold",
      },
      {
        id: "onb-patrulla",
        label: "Onboarding · Elegir patrulla",
        width: 390,
        height: 780,
        href: "/onboarding/team",
        status: "live",
        icon: "shield",
        badgeColor: "purple",
      },
    ],
  },
  {
    id: "dashboard",
    num: "02",
    title: "Dashboard",
    subtitle: "Centro de mando del scout",
    screens: [
      {
        id: "dash-desk",
        label: "Dashboard · Desktop",
        width: 1280,
        height: 860,
        href: "/dashboard",
        status: "live",
        icon: "home",
        badgeColor: "mint",
      },
      {
        id: "dash-mob",
        label: "Dashboard · Mobile",
        width: 390,
        height: 844,
        href: "/dashboard",
        status: "live",
        icon: "home",
        badgeColor: "sky",
      },
    ],
  },
  {
    id: "social",
    num: "03",
    title: "Perfil, Patrulla y Ranking",
    subtitle: "La identidad individual y de equipo",
    screens: [
      {
        id: "perfil",
        label: "Perfil",
        width: 1280,
        height: 1080,
        href: "/profile",
        status: "live",
        icon: "user",
        badgeColor: "purple",
      },
      {
        id: "patrulla",
        label: "Mi Patrulla",
        width: 1280,
        height: 880,
        href: "/teams",
        status: "live",
        icon: "users",
        badgeColor: "mint",
      },
      {
        id: "ranking",
        label: "Ranking de Patrullas",
        width: 1280,
        height: 1020,
        href: "/leaderboard",
        status: "live",
        icon: "chart",
        badgeColor: "gold",
      },
    ],
  },
  {
    id: "games",
    num: "04",
    title: "Minijuegos",
    subtitle: "Hub + experiencia in-game (mobile-first)",
    screens: [
      {
        id: "games-hub",
        label: "Hub de minijuegos",
        width: 1280,
        height: 900,
        href: "/play",
        status: "live",
        icon: "gamepad",
        badgeColor: "mint",
      },
      {
        id: "game-mem",
        label: "Memoria Visual",
        width: 390,
        height: 780,
        href: "/play/memoria",
        status: "live",
        icon: "eye",
        badgeColor: "purple",
      },
      {
        id: "game-lab",
        label: "Laberinto",
        width: 390,
        height: 780,
        href: "/play/laberinto",
        status: "live",
        icon: "map",
        badgeColor: "sky",
      },
      {
        id: "game-cam",
        label: "Camino Seguro",
        width: 390,
        height: 780,
        href: "/play/camino-seguro",
        status: "live",
        icon: "shieldcheck",
        badgeColor: "teal",
      },
      {
        id: "game-qz",
        label: "Preguntas Scout",
        width: 390,
        height: 780,
        href: "/play/preguntas",
        status: "live",
        icon: "lightbulb",
        badgeColor: "orange",
      },
    ],
  },
  {
    id: "engagement",
    num: "05",
    title: "Engagement",
    subtitle: "Misiones, trofeos y tienda",
    screens: [
      {
        id: "misiones",
        label: "Misiones",
        width: 1280,
        height: 1080,
        href: "/missions",
        status: "live",
        icon: "flag",
        badgeColor: "mint",
      },
      {
        id: "trofeos",
        label: "Trofeos",
        width: 1280,
        height: 920,
        href: "/trophies",
        status: "live",
        icon: "trophy",
        badgeColor: "gold",
      },
      {
        id: "tienda",
        label: "Tienda",
        width: 1280,
        height: 900,
        href: "/shop",
        status: "live",
        icon: "store",
        badgeColor: "rose",
      },
    ],
  },
  {
    id: "modals",
    num: "06",
    title: "Modales",
    subtitle: "Momentos de celebración",
    screens: [
      {
        id: "modal-victoria",
        label: "Victoria",
        width: 520,
        height: 680,
        href: "/play/victory",
        status: "live",
        icon: "trophy",
        badgeColor: "gold",
      },
      {
        id: "modal-insignia",
        label: "Insignia desbloqueada",
        width: 520,
        height: 780,
        href: "/play/insignia",
        status: "live",
        icon: "starfill",
        badgeColor: "purple",
      },
    ],
  },
];

export default function ScreensPage() {
  const totalLive = SECTIONS.flatMap((s) => s.screens).filter(
    (s) => s.status === "live",
  ).length;
  const totalDraft = SECTIONS.flatMap((s) => s.screens).filter(
    (s) => s.status === "draft",
  ).length;

  return (
    <main
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "32px 28px 120px",
      }}
    >
      <header
        style={{
          position: "relative",
          padding: "40px 36px",
          borderRadius: "var(--r-3xl)",
          background:
            "radial-gradient(ellipse 60% 80% at 80% 20%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%), var(--card)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          className="grid-mask"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
        <div
          className="relative flex items-center justify-between"
          style={{ gap: 24, flexWrap: "wrap" }}
        >
          <div>
            <div className="hstack" style={{ gap: 10, marginBottom: 12 }}>
              <Link href="/design-system" className="t-body-sm text-muted">
                ← Hub
              </Link>
            </div>
            <span className="chip chip-accent" style={{ padding: "6px 12px" }}>
              <ScoutIcon name="desktop" size={12} /> 02 · Pantallas
            </span>
            <h1 className="t-display-lg" style={{ margin: "14px 0 8px" }}>
              17 pantallas clave de BendScout
            </h1>
            <p className="t-body-lg text-muted" style={{ maxWidth: 600 }}>
              Catálogo completo de pantallas implementadas. Click en una para
              abrirla en vivo.
            </p>
            <div className="hstack" style={{ gap: 16, marginTop: 16 }}>
              <span className="hstack t-body-sm">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: "var(--primary)",
                    boxShadow:
                      "0 0 10px color-mix(in oklch, var(--primary) 70%, transparent)",
                  }}
                />
                <b>{totalLive}</b>
                <span className="text-muted">implementadas</span>
              </span>
              {totalDraft > 0 && (
                <span className="hstack t-body-sm">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "var(--fg-dim)",
                    }}
                  />
                  <b>{totalDraft}</b>
                  <span className="text-muted">en draft</span>
                </span>
              )}
            </div>
          </div>
          <BrandMark size={88} />
        </div>
      </header>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          style={{ marginTop: 64, scrollMarginTop: 80 }}
        >
          <div
            className="between"
            style={{ alignItems: "baseline", marginBottom: 24, gap: 16 }}
          >
            <div className="hstack" style={{ gap: 14, alignItems: "baseline" }}>
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background:
                    "color-mix(in oklch, var(--primary) 18%, transparent)",
                  color: "var(--primary)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {section.num}
              </span>
              <h2 className="t-display-md" style={{ margin: 0 }}>
                {section.title}
              </h2>
            </div>
            <span className="text-muted t-body-sm">{section.subtitle}</span>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {section.screens.map((screen) => (
              <ScreenArtboard key={screen.id} screen={screen} />
            ))}
          </div>
        </section>
      ))}

      <footer
        style={{
          marginTop: 96,
          paddingTop: 32,
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div className="hstack">
          <BrandMark size={28} />
          <span className="t-body-sm text-muted">
            <b style={{ color: "var(--primary)" }}>Bend</b>
            <b style={{ color: "var(--accent)" }}>Scout</b> · Pantallas · 2026
          </span>
        </div>
        <Link
          href="/design-system/foundations"
          className="t-body-sm"
          style={{ color: "var(--primary)", fontWeight: 700 }}
        >
          ← Sistema de Diseño
        </Link>
      </footer>
    </main>
  );
}

function ScreenArtboard({ screen }: { screen: ScreenEntry }) {
  const isLive = screen.status === "live";
  const mobile = screen.width <= 500;
  const aspectRatio = `${screen.width} / ${screen.height}`;

  const inner = (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio,
          maxHeight: 320,
          background:
            "linear-gradient(180deg, oklch(0.24 0.04 155), oklch(0.18 0.03 155))",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.05) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)",
          }}
        />
        {screen.icon && (
          <BadgeCircle
            color={screen.badgeColor ?? "mint"}
            size={56}
            ringed={isLive}
            pulse={isLive}
          >
            <ScoutIcon name={screen.icon} size={26} stroke={1.8} />
          </BadgeCircle>
        )}
        {mobile && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 4,
              borderRadius: 999,
              background: "oklch(1 0 0 / 0.15)",
            }}
          />
        )}
      </div>

      <div
        className="between"
        style={{ marginTop: 14, alignItems: "flex-start" }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="t-h3 truncate" style={{ margin: 0 }}>
            {screen.label}
          </div>
          <div
            className="t-mono text-muted"
            style={{ fontSize: 11, marginTop: 4 }}
          >
            {screen.width} × {screen.height}
            {" · "}
            {mobile ? "Mobile" : "Desktop"}
          </div>
        </div>
        {isLive ? (
          <span className="chip" style={{ padding: "3px 8px", fontSize: 10 }}>
            Live
          </span>
        ) : (
          <span
            className="chip chip-neutral"
            style={{ padding: "3px 8px", fontSize: 10 }}
          >
            Draft
          </span>
        )}
      </div>
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: "block",
    padding: 16,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-xl)",
    transition: "transform 200ms var(--ease-spring), border-color 200ms",
    boxShadow: "var(--shadow-md)",
    textDecoration: "none",
    color: "inherit",
    opacity: isLive ? 1 : 0.7,
  };

  if (isLive && screen.href) {
    return (
      <Link href={screen.href} className="screen-card" style={baseStyle}>
        {inner}
        <style>{`
          .screen-card:hover {
            transform: translateY(-3px);
            border-color: color-mix(in oklch, var(--primary) 40%, transparent) !important;
          }
        `}</style>
      </Link>
    );
  }

  return <div style={{ ...baseStyle, cursor: "not-allowed" }}>{inner}</div>;
}
