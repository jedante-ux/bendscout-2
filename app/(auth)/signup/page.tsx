import Link from "next/link";
import Image from "next/image";
import { ScoutIcon } from "@/components/scout/icon";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--fg)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
      className="signup-grid"
    >
      <BrandPanel />
      <FormPanel />

      <style>{`
        @media (max-width: 960px) {
          .signup-grid { grid-template-columns: 1fr !important; }
          .signup-brand-panel { min-height: auto !important; padding: 48px 32px 56px !important; }
          .signup-form-panel { padding: 40px 32px 56px !important; }
          .signup-headline { font-size: 38px !important; line-height: 1 !important; }
          .signup-hero-logo { width: 220px !important; margin-bottom: 20px !important; }
        }
        @media (max-width: 640px) {
          .signup-brand-panel { padding: 36px 22px 44px !important; }
          .signup-form-panel { padding: 28px 22px 44px !important; }
          .signup-headline { font-size: 32px !important; }
          .signup-hero-logo { width: 168px !important; margin-bottom: 16px !important; }
          .signup-blurb { font-size: 15px !important; }
          .signup-form-container { max-width: 100% !important; }
          .signup-eyebrow { padding: 5px 10px !important; font-size: 10px !important; }
          .signup-title { font-size: 30px !important; }
        }
      `}</style>
    </main>
  );
}

function BrandPanel() {
  return (
    <div
      className="signup-brand-panel reveal-wash"
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
          className="signup-hero-logo reveal-hero animate-float"
          style={{
            width: 360,
            height: "auto",
            filter:
              "drop-shadow(0 24px 48px color-mix(in oklch, var(--accent) 50%, transparent))",
            marginBottom: 32,
          }}
        />
        <h1
          className="t-display-xl signup-headline"
          style={{ margin: 0, fontSize: 48 }}
        >
          <span
            className="reveal-left"
            style={{
              display: "inline-block",
              color: "var(--accent)",
              animationDelay: "260ms",
            }}
          >
            Únete
          </span>
          <span className="reveal-up" style={{ display: "inline-block", animationDelay: "320ms" }}>
            a la
          </span>
          <br />
          <span
            className="reveal-left"
            style={{
              display: "inline-block",
              color: "var(--primary)",
              animationDelay: "400ms",
            }}
          >
            tropa
          </span>
          <span className="reveal-up" style={{ display: "inline-block", animationDelay: "460ms" }}>
            scout.
          </span>
        </h1>
        <p
          className="t-body-lg text-muted signup-blurb reveal-up"
          style={{ marginTop: 16, maxWidth: 360, animationDelay: "700ms" }}
        >
          Crea tu cuenta y empieza a competir hoy. Tu patrulla te espera —
          puedes elegirla en el siguiente paso.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          position: "relative",
          flexWrap: "wrap",
        }}
      >
        <div className="hstack t-body-sm text-muted reveal-up" style={{ animationDelay: "820ms" }}>
          <ScoutIcon name="users" size={16} style={{ color: "var(--primary)" }} />
          <b style={{ color: "var(--fg)" }}>1.2k</b> scouts
        </div>
        <div className="hstack t-body-sm text-muted reveal-up" style={{ animationDelay: "900ms" }}>
          <ScoutIcon name="trophy" size={16} style={{ color: "var(--accent)" }} />
          <b style={{ color: "var(--fg)" }}>86</b> patrullas
        </div>
        <div className="hstack t-body-sm text-muted reveal-up" style={{ animationDelay: "980ms" }}>
          <ScoutIcon name="shieldcheck" size={16} style={{ color: "var(--c-purple)" }} />
          <b style={{ color: "var(--fg)" }}>14</b> insignias
        </div>
      </div>
    </div>
  );
}

function FormPanel() {
  return (
    <div
      className="signup-form-panel reveal-right"
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
        className="signup-form-container"
        style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}
      >
        <span
          className="chip chip-accent signup-eyebrow reveal-down"
          style={{ padding: "6px 12px", animationDelay: "300ms" }}
        >
          Empieza tu aventura
        </span>
        <h2
          className="t-display-lg signup-title reveal-up"
          style={{ margin: "12px 0 8px", animationDelay: "360ms" }}
        >
          Crear cuenta
        </h2>
        <p
          className="t-body-sm text-muted reveal-up"
          style={{ margin: "0 0 24px", animationDelay: "420ms" }}
        >
          Tu progreso, insignias y patrulla se guardan automáticamente.
        </p>

        <SignupForm />

        <p
          className="t-caption text-soft reveal-up"
          style={{ textAlign: "center", marginTop: 12, animationDelay: "920ms" }}
        >
          ¿Solo quieres probar?{" "}
          <Link
            href="/dashboard?guest=1"
            className="link-underline"
            style={{ color: "var(--primary)", fontWeight: 700 }}
          >
            Entrar como invitado →
          </Link>
        </p>
      </div>
    </div>
  );
}
