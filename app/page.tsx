import Image from "next/image";
import Link from "next/link";
import { ScoutIcon } from "@/components/scout/icon";
import { continueAsGuestAction } from "@/app/(auth)/actions";

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden lg:h-dvh">
      <div className="grid-mask pointer-events-none absolute inset-0 -z-10" />

      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 py-5">
        <Link
          href="/"
          aria-label="BendScout"
          className="reveal-down inline-flex"
          style={{ animationDelay: "0ms" }}
        >
          <Image
            src="/icons/logo.png"
            alt="BendScout"
            width={800}
            height={380}
            priority
            className="h-16 w-auto select-none md:h-20"
          />
        </Link>
        <nav
          className="reveal-down flex items-center gap-2"
          style={{ animationDelay: "120ms" }}
        >
          <Link href="/login" className="btn btn-ghost btn-sm">
            Iniciar sesión
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 pb-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <span
            className="chip reveal-up inline-flex"
            style={{ padding: "6px 12px", animationDelay: "180ms" }}
          >
            <ScoutIcon name="sparkle" size={12} /> Beta · Hackaton Platanus
          </span>

          <h1
            className="t-display-xl reveal-up"
            style={{ margin: "16px 0 10px", animationDelay: "280ms" }}
          >
            <span style={{ color: "var(--primary)" }}>Juega</span>,{" "}
            <span style={{ color: "var(--accent)" }}>compite</span>,
            <br />
            aprende escultismo.
          </h1>

          <p
            className="t-body-lg text-muted reveal-up"
            style={{ maxWidth: 540, animationDelay: "380ms" }}
          >
            Plataforma de minijuegos educativos scout por patrullas. Nudos,
            ley scout, primeros auxilios y orientación — verde lima neón sobre
            noche-bosque, pensado para móvil y desktop.
          </p>

          <div
            className="reveal-up flex flex-wrap gap-3"
            style={{ marginTop: 22, animationDelay: "500ms" }}
          >
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              <ScoutIcon name="play" size={16} /> Entrar al dashboard
            </Link>
            {/* "Ver minijuegos" abre /play via cookie de invitado para que
                quien no está logueado pueda ojearlos sin pasar por /login. */}
            <form action={continueAsGuestAction}>
              <input type="hidden" name="next" value="/play" />
              <button type="submit" className="btn btn-outline btn-lg">
                Ver minijuegos
                <ScoutIcon name="arrow" size={16} />
              </button>
            </form>
          </div>

          <div
            className="reveal-up"
            style={{ marginTop: 18, animationDelay: "560ms" }}
          >
            <p
              className="t-overline text-muted"
              style={{ letterSpacing: "0.16em", marginBottom: 8 }}
            >
              Próximamente
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <StoreBadge platform="ios" />
              <StoreBadge platform="android" />
            </div>
          </div>

          <div
            className="hstack reveal-up"
            style={{ marginTop: 22, gap: 24, animationDelay: "620ms" }}
          >
            <span className="hstack t-caption text-muted">
              <ScoutIcon name="users" size={16} className="text-primary-token" />
              <b style={{ color: "var(--fg)" }}>1.2k</b> scouts
            </span>
            <span className="hstack t-caption text-muted">
              <ScoutIcon name="shield" size={16} className="text-accent-token" />
              <b style={{ color: "var(--fg)" }}>86</b> patrullas
            </span>
            <span className="hstack t-caption text-muted">
              <ScoutIcon name="sparkle" size={16} className="text-primary-token" />
              <b style={{ color: "var(--fg)" }}>14</b> insignias
            </span>
          </div>
        </div>

        <PlatformMockup />
      </section>

      <footer
        className="shrink-0"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-6 py-3 sm:flex-row">
          <p className="t-caption text-muted">
            ⚜️ <b style={{ color: "var(--primary)" }}>Bend</b>
            <b style={{ color: "var(--accent)" }}>Scout</b> · Hackaton Platanus 2026
          </p>
          <p className="t-caption text-muted">
            Hecho con Next.js, Supabase y mucho café de patrulla.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* -------------------------------------------------------------------- */
/* Badges App Store / Google Play (estado "próximamente", no clickables) */
/* -------------------------------------------------------------------- */

function StoreBadge({ platform }: { platform: "ios" | "android" }) {
  const isIos = platform === "ios";
  return (
    <span
      aria-label={isIos ? "Próximamente en App Store" : "Próximamente en Google Play"}
      className="hstack"
      style={{
        height: 48,
        padding: "0 14px",
        gap: 10,
        borderRadius: 12,
        background: "color-mix(in oklch, var(--fg) 6%, var(--bg))",
        border: "1px solid var(--border)",
        color: "var(--fg)",
        cursor: "not-allowed",
        opacity: 0.85,
      }}
    >
      {isIos ? <AppleGlyph /> : <PlayStoreGlyph />}
      <span className="vstack" style={{ gap: 0, alignItems: "flex-start" }}>
        <span
          className="t-overline text-muted"
          style={{ fontSize: 8.5, letterSpacing: "0.14em", lineHeight: 1 }}
        >
          {isIos ? "Pronto en" : "Pronto en"}
        </span>
        <span
          className="t-h3"
          style={{ fontSize: 14, lineHeight: 1.1, margin: 0 }}
        >
          {isIos ? "App Store" : "Google Play"}
        </span>
      </span>
    </span>
  );
}

function AppleGlyph() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.04 12.86c-.02-2.21 1.8-3.27 1.88-3.32-1.02-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.65.8-3.34.8-.7 0-1.76-.78-2.9-.76-1.49.02-2.87.87-3.64 2.2-1.56 2.7-.4 6.7 1.12 8.89.74 1.07 1.62 2.27 2.78 2.22 1.12-.04 1.54-.72 2.9-.72 1.34 0 1.74.72 2.92.7 1.2-.02 1.96-1.08 2.7-2.15.85-1.24 1.2-2.45 1.22-2.51-.03-.01-2.34-.9-2.36-3.57zM14.92 6.25c.61-.74 1.03-1.78.91-2.81-.88.04-1.95.59-2.59 1.32-.57.65-1.08 1.72-.94 2.72.99.08 1.99-.5 2.62-1.23z" />
    </svg>
  );
}

function PlayStoreGlyph() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <defs>
        <linearGradient id="ps-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ps-a)"
        d="M3.6 2.6c-.4.3-.6.8-.6 1.4v16c0 .6.2 1.1.6 1.4l9.3-9.4-9.3-9.4zm10.4 10.4l2.6 2.6 3.7-2.1c1.2-.7 1.2-2.4 0-3.1l-3.7-2.1-2.6 2.6 2 2-2 2.1zm-1.1 1l-9.1 9.3c.3.1.7.1 1 .1.3 0 .7-.1 1-.2l10.8-6.1-3.7-3.1z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------- */
/* Platform mockup — phone frame que se "construye" en cascada con los  */
/* utilitarios .reveal-* y animationDelay. Los íconos orbitan flotando. */
/* -------------------------------------------------------------------- */

function PlatformMockup() {
  // Cada ícono orbita una posición distinta alrededor del teléfono.
  const orbit: Array<{
    src: string;
    alt: string;
    pos: string;
    delay: number;
    floatDelay: string;
  }> = [
    {
      src: "/icons/tarzan.png",
      alt: "Tarzán",
      pos: "left-[-32px] top-[14%]",
      delay: 1150,
      floatDelay: "0s",
    },
    {
      src: "/icons/nudos.png",
      alt: "Nudos",
      pos: "right-[-28px] top-[6%]",
      delay: 1300,
      floatDelay: "0.6s",
    },
    {
      src: "/icons/primeros-auxilios.png",
      alt: "Primeros auxilios",
      pos: "left-[-38px] bottom-[18%]",
      delay: 1450,
      floatDelay: "1.2s",
    },
    {
      src: "/icons/orientacion-mapas.png",
      alt: "Orientación",
      pos: "right-[-36px] bottom-[8%]",
      delay: 1600,
      floatDelay: "1.8s",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[360px] lg:max-w-[400px]">
      {/* Halo */}
      <div
        aria-hidden
        className="reveal-scale pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--primary) 28%, transparent), transparent 65%)",
          animationDelay: "120ms",
        }}
      />

      {/* Teléfono */}
      <div
        className="scout-card reveal-hero relative overflow-hidden p-2"
        style={{ borderRadius: 38, animationDelay: "240ms" }}
      >
        {/* Notch */}
        <div
          aria-hidden
          className="absolute left-1/2 top-2 z-10 h-1.5 w-20 -translate-x-1/2 rounded-full"
          style={{ background: "color-mix(in oklch, var(--fg) 24%, transparent)" }}
        />

        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, var(--bg), color-mix(in oklch, var(--bg) 86%, var(--primary) 14%))",
            borderRadius: 30,
            padding: 14,
            minHeight: 540,
          }}
        >
          {/* Topbar */}
          <div
            className="reveal-down flex items-center justify-between"
            style={{ marginTop: 4, animationDelay: "620ms" }}
          >
            <div className="min-w-0">
              <div
                className="t-overline text-muted"
                style={{ fontSize: 9, letterSpacing: "0.14em" }}
              >
                Buenos días, José
              </div>
              <div className="t-h3" style={{ fontSize: 14, margin: 0 }}>
                Patrulla Cóndor
              </div>
            </div>
            <div className="hstack" style={{ gap: 6 }}>
              <span
                className="hstack"
                style={{
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "color-mix(in oklch, var(--c-orange) 18%, transparent)",
                  color: "var(--c-orange)",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                <ScoutIcon name="flame" size={10} stroke={2.4} />
                12
              </span>
              <div
                className="grid place-items-center rounded-full"
                style={{
                  width: 32,
                  height: 32,
                  background:
                    "linear-gradient(135deg, color-mix(in oklch, var(--primary) 50%, white), color-mix(in oklch, var(--primary) 30%, black))",
                  color: "var(--primary-ink)",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                JE
              </div>
            </div>
          </div>

          {/* Daily pick card */}
          <div
            className="reveal-up scout-card"
            style={{
              marginTop: 12,
              padding: 12,
              animationDelay: "780ms",
              borderRadius: 16,
              borderColor: "color-mix(in oklch, var(--primary) 35%, var(--border))",
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--primary) 14%, var(--card)), var(--card))",
            }}
          >
            <div className="between" style={{ marginBottom: 4 }}>
              <span
                className="t-overline"
                style={{
                  color: "var(--primary)",
                  fontSize: 8,
                  letterSpacing: "0.14em",
                }}
              >
                HOY JUEGAN
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--accent)",
                  fontWeight: 800,
                }}
              >
                +10 pts
              </span>
            </div>
            <div className="between">
              <div className="min-w-0" style={{ flex: 1 }}>
                <div className="t-h3" style={{ fontSize: 13, margin: 0 }}>
                  Pista de Tarzán
                </div>
                <div
                  className="t-caption text-muted"
                  style={{ fontSize: 9, marginTop: 2 }}
                >
                  Salta y agáchate sin parar
                </div>
              </div>
              <div
                className="grid place-items-center rounded-xl"
                style={{
                  width: 38,
                  height: 38,
                  background:
                    "linear-gradient(135deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/icons/tarzan.png"
                  alt=""
                  width={48}
                  height={48}
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Level progress */}
          <div
            className="reveal-up"
            style={{ marginTop: 10, animationDelay: "860ms" }}
          >
            <div className="between" style={{ marginBottom: 4 }}>
              <span
                className="t-overline text-muted"
                style={{ fontSize: 8, letterSpacing: "0.14em" }}
              >
                NIVEL 7 · EXPLORADOR
              </span>
              <span
                className="t-caption"
                style={{ fontSize: 9, fontWeight: 700 }}
              >
                2.4k <span className="text-muted">/ 3k XP</span>
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: "color-mix(in oklch, var(--fg) 10%, transparent)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "78%",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, var(--primary), var(--accent))",
                }}
              />
            </div>
          </div>

          {/* Stats row: Nivel · XP · Insignias */}
          <div
            className="grid grid-cols-3"
            style={{ marginTop: 10, gap: 6 }}
          >
            {[
              { label: "Nivel", value: "7", icon: "leaf" as const, delay: 940 },
              { label: "XP", value: "2.4k", icon: "starfill" as const, delay: 1000 },
              { label: "Insignias", value: "9", icon: "shieldcheck" as const, delay: 1060 },
            ].map((s) => (
              <div
                key={s.label}
                className="reveal-up scout-card"
                style={{ padding: 8, animationDelay: `${s.delay}ms` }}
              >
                <div
                  className="hstack t-caption text-muted"
                  style={{ fontSize: 8, gap: 3 }}
                >
                  <ScoutIcon name={s.icon} size={9} />
                  {s.label}
                </div>
                <div className="t-h3" style={{ fontSize: 16, margin: 0 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Top patrullas mini leaderboard */}
          <div
            className="reveal-up between"
            style={{
              marginTop: 12,
              animationDelay: "1140ms",
            }}
          >
            <span
              className="t-overline text-muted"
              style={{ fontSize: 8, letterSpacing: "0.14em" }}
            >
              TOP PATRULLAS · JAMBOREE 19
            </span>
            <ScoutIcon name="trophy" size={10} className="text-accent-token" />
          </div>
          <div style={{ marginTop: 6 }}>
            {[
              { rank: 1, name: "Lobos", pts: "3.4k", delay: 1200, hi: true },
              { rank: 2, name: "Cóndor", pts: "3.1k", delay: 1260, hi: false, me: true },
              { rank: 3, name: "Halcones", pts: "2.8k", delay: 1320, hi: false },
            ].map((t) => (
              <div
                key={t.name}
                className="reveal-up hstack"
                style={{
                  padding: "6px 8px",
                  marginBottom: 4,
                  gap: 8,
                  borderRadius: 10,
                  background: t.me
                    ? "color-mix(in oklch, var(--primary) 14%, var(--card))"
                    : "var(--card)",
                  border: t.me
                    ? "1px solid color-mix(in oklch, var(--primary) 40%, transparent)"
                    : "1px solid var(--border)",
                  animationDelay: `${t.delay}ms`,
                }}
              >
                <span
                  className="grid place-items-center"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    fontSize: 9,
                    fontWeight: 800,
                    background: t.hi
                      ? "linear-gradient(135deg, var(--c-gold), oklch(0.65 0.18 80))"
                      : "color-mix(in oklch, var(--fg) 10%, transparent)",
                    color: t.hi ? "oklch(0.18 0.05 80)" : "var(--fg)",
                    flexShrink: 0,
                  }}
                >
                  {t.rank}
                </span>
                <span
                  className="t-caption"
                  style={{ fontSize: 11, fontWeight: 700, flex: 1 }}
                >
                  Patrulla {t.name}
                </span>
                {t.me && (
                  <span
                    className="t-overline"
                    style={{
                      fontSize: 7,
                      letterSpacing: "0.14em",
                      color: "var(--primary)",
                    }}
                  >
                    TÚ
                  </span>
                )}
                <span
                  className="t-caption"
                  style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)" }}
                >
                  {t.pts}
                </span>
              </div>
            ))}
          </div>

          {/* Insignias chip row */}
          <div
            className="reveal-up hstack"
            style={{
              marginTop: 10,
              gap: 6,
              animationDelay: "1380ms",
            }}
          >
            <span
              className="t-overline text-muted"
              style={{ fontSize: 8, letterSpacing: "0.14em", marginRight: 2 }}
            >
              ÚLTIMA
            </span>
            <span
              className="hstack"
              style={{
                gap: 4,
                padding: "3px 8px",
                borderRadius: 999,
                background: "color-mix(in oklch, var(--accent) 14%, transparent)",
                color: "var(--accent)",
                fontSize: 9,
                fontWeight: 700,
                border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
              }}
            >
              <ScoutIcon name="knot" size={9} />
              Maestro de Nudos
            </span>
          </div>
        </div>
      </div>

      {/* Iconos flotantes orbitando alrededor del mockup */}
      {orbit.map((it) => (
        <div
          key={it.alt}
          aria-hidden
          className={`reveal-scale absolute ${it.pos}`}
          style={{ animationDelay: `${it.delay}ms` }}
        >
          <div
            className="scout-card-glow animate-float grid place-items-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              padding: 8,
              animationDelay: it.floatDelay,
              background:
                "linear-gradient(135deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
            }}
          >
            <Image
              src={it.src}
              alt=""
              width={64}
              height={64}
              className="h-10 w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
