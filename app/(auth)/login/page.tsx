import Image from "next/image";
import { LoginForm } from "./login-form";
import { safeNextPath } from "@/lib/auth/safe-redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "");

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--fg)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
      className="login-grid"
    >
      <BrandPanel />
      <FormPanel next={next} />

      <style>{`
        /* ---- Tablet (≤ 960px): collapse to one column, brand becomes hero strip ---- */
        @media (max-width: 960px) {
          .login-grid {
            grid-template-columns: 1fr !important;
          }
          .login-brand-panel {
            min-height: auto !important;
            padding: 48px 32px 56px !important;
          }
          .login-form-panel {
            padding: 40px 32px 56px !important;
          }
          .login-headline {
            font-size: 38px !important;
            line-height: 1 !important;
          }
          .login-hero-logo {
            width: 220px !important;
            margin-bottom: 20px !important;
          }
        }

        /* ---- Mobile (≤ 640px): tighter, smaller hero, dense form ---- */
        @media (max-width: 640px) {
          .login-brand-panel {
            padding: 36px 22px 44px !important;
          }
          .login-form-panel {
            padding: 28px 22px 44px !important;
          }
          .login-headline {
            font-size: 32px !important;
          }
          .login-hero-logo {
            width: 168px !important;
            margin-bottom: 16px !important;
          }
          .login-brand-blurb {
            font-size: 15px !important;
          }
          .login-form-container {
            max-width: 100% !important;
          }
          .login-eyebrow {
            padding: 5px 10px !important;
            font-size: 10px !important;
          }
          .login-title {
            font-size: 30px !important;
          }
        }
      `}</style>
    </main>
  );
}

function BrandPanel() {
  return (
    <div
      className="login-brand-panel reveal-wash"
      style={{
        position: "relative",
        padding: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(160deg, oklch(0.30 0.08 145) 0%, oklch(0.18 0.04 155) 70%)",
        overflow: "hidden",
        minHeight: "100dvh",
      }}
    >
      <div
        aria-hidden
        className="reveal-scale"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 70% 80% at 30% 20%, black, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 80% at 30% 20%, black, transparent 70%)",
          animationDelay: "120ms",
          animationDuration: "1100ms",
        }}
      />

      <div style={{ position: "relative" }} />

      <div style={{ position: "relative" }}>
        <Image
          src="/icons/logo.png"
          alt=""
          width={800}
          height={800}
          priority
          className="login-hero-logo reveal-hero animate-float"
          style={{
            width: 360,
            height: "auto",
            filter:
              "drop-shadow(0 24px 48px color-mix(in oklch, var(--primary) 50%, transparent))",
            marginBottom: 32,
            animationDelay: "80ms, 1100ms",
            animationDuration: "900ms, 4s",
            animationName: "hero-pop, float-soft",
            animationTimingFunction:
              "var(--ease-out-expo), ease-in-out",
            animationIterationCount: "1, infinite",
            animationFillMode: "both, both",
          }}
        />
        <h1
          className="t-display-xl login-headline"
          style={{ margin: 0, fontSize: 48 }}
        >
          <span
            className="reveal-left"
            style={{
              display: "inline-block",
              color: "var(--primary)",
              animationDelay: "260ms",
            }}
          >
            Juega
          </span>
          <span className="reveal-up" style={{ display: "inline-block", animationDelay: "320ms" }}>,</span>
          <br />
          <span
            className="reveal-left"
            style={{
              display: "inline-block",
              color: "var(--accent)",
              animationDelay: "400ms",
            }}
          >
            compite
          </span>
          <span className="reveal-up" style={{ display: "inline-block", animationDelay: "460ms" }}>,</span>
          <br />
          <span
            className="reveal-left"
            style={{ display: "inline-block", animationDelay: "540ms" }}
          >
            aprende escultismo.
          </span>
        </h1>
        <p
          className="t-body-lg text-muted login-brand-blurb reveal-up"
          style={{ marginTop: 16, maxWidth: 360, animationDelay: "700ms" }}
        >
          Minijuegos rápidos de nudos, ley scout, primeros auxilios y
          orientación. Forma tu patrulla y desafía a otras tropas.
        </p>
      </div>

    </div>
  );
}

function FormPanel({ next }: { next: string }) {
  return (
    <div
      className="login-form-panel reveal-right"
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        animationDelay: "60ms",
        animationDuration: "780ms",
      }}
    >
      <div
        className="login-form-container"
        style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}
      >
        <span
          className="chip login-eyebrow reveal-down"
          style={{ padding: "6px 12px", animationDelay: "300ms" }}
        >
          Bienvenido de vuelta
        </span>
        <h2
          className="t-display-lg login-title reveal-up"
          style={{ margin: "12px 0 8px", animationDelay: "360ms" }}
        >
          Inicia sesión
        </h2>
        <p
          className="t-body-sm text-muted reveal-up"
          style={{ margin: "0 0 24px", animationDelay: "420ms" }}
        >
          Continúa tu camino scout donde lo dejaste.
        </p>

        <LoginForm next={next} />
      </div>
    </div>
  );
}
