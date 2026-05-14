import Image from "next/image";
import Link from "next/link";
import { ScoutIcon } from "@/components/scout/icon";
import { GAMES } from "@/lib/games/registry";

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="grid-mask pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" aria-label="BendScout">
          <Image
            src="/icons/logo.png"
            alt="BendScout"
            width={800}
            height={380}
            priority
            className="h-20 w-auto select-none md:h-24"
          />
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">
            Iniciar sesión
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="chip" style={{ padding: "6px 12px" }}>
              <ScoutIcon name="sparkle" size={12} /> Beta · Hackaton Platanus
            </span>

            <h1 className="t-display-xl" style={{ margin: "20px 0 12px" }}>
              <span style={{ color: "var(--primary)" }}>Juega</span>,{" "}
              <span style={{ color: "var(--accent)" }}>compite</span>,
              <br />
              aprende escultismo.
            </h1>

            <p className="t-body-lg text-muted" style={{ maxWidth: 540 }}>
              Plataforma de minijuegos educativos scout por patrullas. Nudos,
              ley scout, primeros auxilios y orientación — verde lima neón sobre
              noche-bosque, pensado para móvil y desktop.
            </p>

            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                <ScoutIcon name="play" size={16} /> Entrar al dashboard
              </Link>
              <Link href="/play" className="btn btn-outline btn-lg">
                Ver minijuegos
                <ScoutIcon name="arrow" size={16} />
              </Link>
              <Link href="/design-system" className="btn btn-ghost btn-lg">
                Sistema de diseño
              </Link>
            </div>

            <div className="hstack" style={{ marginTop: 32, gap: 24 }}>
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

          <HeroPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="between" style={{ marginBottom: 24 }}>
          <div>
            <h2 className="t-display-md" style={{ margin: 0 }}>
              Minijuegos
            </h2>
            <p className="t-body-sm text-muted" style={{ marginTop: 4 }}>
              Empezamos por single-player. Multijugador en tiempo real próximamente.
            </p>
          </div>
          <Link
            href="/play"
            className="hidden text-sm font-bold sm:inline-flex"
            style={{ color: "var(--primary)" }}
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((game) => (
            <Link
              key={game.key}
              href={game.route ?? "/play"}
              className="scout-card group relative overflow-hidden p-0 transition hover:-translate-y-1"
            >
              <div
                className="relative aspect-square w-full overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
                }}
              >
                {game.imageSrc ? (
                  <div className="absolute inset-0 grid place-items-center">
                    <Image
                      src={game.imageSrc}
                      alt={game.title}
                      width={180}
                      height={180}
                      className="animate-float h-[75%] w-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 grid place-items-center text-[88px] leading-none drop-shadow-2xl"
                  >
                    <span className="animate-float inline-block">
                      {game.emoji}
                    </span>
                  </span>
                )}
              </div>
              <div className="space-y-1 p-4">
                <h3 className="t-h3" style={{ margin: 0 }}>
                  {game.title}
                </h3>
                <p className="t-caption text-muted line-clamp-1">
                  {game.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 sm:flex-row">
          <p className="t-body-sm text-muted">
            ⚜️{" "}
            <b style={{ color: "var(--primary)" }}>Bend</b>
            <b style={{ color: "var(--accent)" }}>Scout</b> · Hackaton Platanus 2026
          </p>
          <p className="t-body-sm text-muted">
            Hecho con Next.js, Supabase y mucho café de patrulla.
          </p>
        </div>
      </footer>
    </main>
  );
}

function HeroPreview() {
  const tilts = ["-rotate-3", "rotate-2", "rotate-1", "-rotate-2"];
  const delays = ["0s", "0.6s", "1.2s", "1.8s"];

  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--primary) 28%, transparent), transparent 65%)",
        }}
      />

      <div className="scout-card relative overflow-hidden p-5">
        <div className="between" style={{ marginBottom: 14 }}>
          <span className="t-overline text-muted">Empieza a jugar</span>
          <span className="chip" style={{ padding: "4px 10px" }}>
            <ScoutIcon name="sparkle" size={10} /> 4 minijuegos
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game, i) => (
            <div
              key={game.key}
              className={`group relative overflow-hidden rounded-2xl border p-3 transition hover:-translate-y-1 hover:rotate-0 ${tilts[i]}`}
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
              }}
            >
              <div className="relative grid aspect-square place-items-center">
                {game.imageSrc ? (
                  <Image
                    src={game.imageSrc}
                    alt={game.title}
                    width={140}
                    height={140}
                    className="animate-float h-[80%] w-auto object-contain drop-shadow-2xl"
                    style={{ animationDelay: delays[i] }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className="animate-float text-[56px] leading-none drop-shadow-2xl"
                    style={{ animationDelay: delays[i] }}
                  >
                    {game.emoji}
                  </span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="t-caption" style={{ fontWeight: 700 }}>
                  {game.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/play"
          className="hstack mt-4 w-full justify-center rounded-xl py-2.5 text-sm font-bold transition hover:brightness-110"
          style={{
            background:
              "color-mix(in oklch, var(--primary) 14%, transparent)",
            color: "var(--primary)",
            border:
              "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
          }}
        >
          Probar minijuegos
          <ScoutIcon name="arrow" size={14} />
        </Link>
      </div>
    </div>
  );
}
