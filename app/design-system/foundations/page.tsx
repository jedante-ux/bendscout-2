import Link from "next/link";
import Image from "next/image";
import { ScoutLogo } from "@/components/scout/logo";
import { BrandMark } from "@/components/scout/brand-mark";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { XpBar } from "@/components/scout/xp-bar";
import { ScoutIcon, SCOUT_ICONS, type ScoutIconName } from "@/components/scout/icon";

const TOC = [
  { id: "brand", label: "Brand" },
  { id: "colors", label: "Color" },
  { id: "type", label: "Tipografía" },
  { id: "spacing", label: "Espaciado" },
  { id: "radii", label: "Radios" },
  { id: "shadows", label: "Sombras" },
  { id: "icons", label: "Iconos" },
  { id: "components", label: "Componentes" },
  { id: "game-ui", label: "Game UI" },
  { id: "patrullas", label: "Patrullas" },
  { id: "patterns", label: "Patrones" },
  { id: "voice", label: "Voz" },
];

function Swatch({
  name,
  code,
  token,
  varName,
}: {
  name: string;
  code: string;
  token: string;
  varName: string;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div style={{ height: 92, background: `var(${varName})` }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
        <div
          className="t-mono text-muted"
          style={{ fontSize: 11, marginTop: 4, wordBreak: "break-all" }}
        >
          {code}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--primary)",
            marginTop: 6,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {token}
        </div>
      </div>
    </div>
  );
}

function SpecCard({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title?: string;
  desc: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 20,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
      }}
    >
      {eyebrow && (
        <span className="chip" style={{ marginBottom: 10, padding: "4px 10px" }}>
          {eyebrow}
        </span>
      )}
      {title && (
        <h4 style={{ margin: "4px 0", fontSize: 13, fontWeight: 700 }}>
          {title}
        </h4>
      )}
      <p className="t-body-sm text-muted" style={{ margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

function PreviewBox({
  label,
  children,
  flat,
}: {
  label?: string;
  children: React.ReactNode;
  flat?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        padding: 32,
        background: flat ? "var(--bg-deep)" : "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
      }}
    >
      {label && (
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 14,
            fontSize: 10,
            fontWeight: 700,
            color: "var(--fg-dim)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "32px 28px 120px",
      }}
    >
      {/* ============ HERO ============ */}
      <header
        style={{
          position: "relative",
          padding: "56px 40px 48px",
          borderRadius: "var(--r-3xl)",
          background:
            "radial-gradient(ellipse 60% 70% at 90% 20%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%), radial-gradient(ellipse 50% 60% at 10% 100%, color-mix(in oklch, var(--accent) 12%, transparent), transparent 70%), var(--card)",
          border: "1px solid var(--border)",
          overflow: "hidden",
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
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 40,
            alignItems: "center",
          }}
          className="md:grid-cols-[1.4fr_1fr] grid-cols-1"
        >
          <div>
            <div
              className="hstack"
              style={{ gap: 14, marginBottom: 20 }}
            >
              <ScoutLogo size={48} wordmarkSize={28} withTagline />
              <span className="chip chip-neutral" style={{ padding: "4px 10px" }}>
                v1.0 · 2026
              </span>
            </div>

            <span className="chip" style={{ padding: "6px 12px" }}>
              <ScoutIcon name="sparkle" size={12} /> Sistema de diseño · juego +
              aprendizaje
            </span>
            <h1 className="t-display-xl" style={{ margin: "16px 0 12px" }}>
              <span style={{ color: "var(--primary)" }}>Juega</span>,{" "}
              <span style={{ color: "var(--accent)" }}>compite</span>,
              <br />
              aprende escultismo.
            </h1>
            <p className="t-body-lg text-muted" style={{ maxWidth: 540 }}>
              Sistema visual de{" "}
              <b style={{ color: "var(--fg)" }}>BendScout</b> — plataforma de
              minijuegos educativos por patrullas. Verde lima neón sobre
              noche-bosque, tipografía geométrica-arcade y un kit de componentes
              pensado para móvil y desktop.
            </p>

            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Link href="/dashboard" className="btn btn-primary">
                <ScoutIcon name="play" size={16} /> Ver pantallas
              </Link>
              <a href="#colors" className="btn btn-outline">
                <ScoutIcon name="leaf" size={16} /> Tokens
              </a>
              <a href="#components" className="btn btn-ghost">
                Componentes <ScoutIcon name="chevron" size={16} />
              </a>
            </div>
          </div>

          {/* Hero right card */}
          <div className="scout-card" style={{ padding: 22 }}>
            <div className="between" style={{ marginBottom: 16 }}>
              <div className="hstack">
                <BadgeCircle color="mint" size={44} ringed>
                  <ScoutIcon name="knot" size={20} />
                </BadgeCircle>
                <div>
                  <div className="t-overline text-muted">Tu progreso</div>
                  <div className="t-h3">Nivel 24 · Explorador</div>
                </div>
              </div>
              <span className="rank-tag">+150 XP hoy</span>
            </div>

            <div
              className="center"
              style={{ position: "relative", padding: "8px 0 16px" }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  opacity: 0.45,
                }}
              >
                <div
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 999,
                    background:
                      "radial-gradient(circle, color-mix(in oklch, var(--primary) 35%, transparent), transparent 70%)",
                  }}
                />
              </div>
              <BadgeCircle color="mint" size={96} ringed pulse>
                <ScoutIcon name="shieldcheck" size={44} stroke={1.8} />
              </BadgeCircle>
            </div>

            <div className="between" style={{ marginBottom: 8 }}>
              <span className="t-caption text-muted">Próximo: Nivel 25</span>
              <span className="t-mono" style={{ fontWeight: 700 }}>
                4 250 / 6 000
              </span>
            </div>
            <XpBar value={4250} max={6000} />

            <div
              className="hstack"
              style={{ justifyContent: "center", marginTop: 18, gap: 8 }}
            >
              <BadgeCircle color="purple" size={28} ringed>
                <ScoutIcon name="starfill" size={14} stroke={2.2} />
              </BadgeCircle>
              <BadgeCircle color="rose" size={28} ringed>
                <ScoutIcon name="shield" size={14} />
              </BadgeCircle>
              <BadgeCircle color="gold" size={28} ringed>
                <ScoutIcon name="trophy" size={14} />
              </BadgeCircle>
              <BadgeCircle color="orange" size={28} ringed>
                <ScoutIcon name="flame" size={14} />
              </BadgeCircle>
              <BadgeCircle color="sky" size={28} ringed>
                <ScoutIcon name="leaf" size={14} />
              </BadgeCircle>
            </div>
          </div>
        </div>
      </header>

      {/* ============ TOC ============ */}
      <nav
        style={{
          position: "sticky",
          top: 12,
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          padding: 8,
          margin: "32px 0",
          background: "color-mix(in oklch, var(--card) 80%, transparent)",
          backdropFilter: "blur(12px)",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--border)",
          zIndex: 30,
        }}
      >
        {TOC.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--fg-muted)",
              borderRadius: "var(--r-md)",
            }}
            className="hover:bg-card-hi hover:text-fg"
          >
            {t.label}
          </a>
        ))}
      </nav>

      {/* ============ BRAND ============ */}
      <Section id="brand" num="01" title="Brand" sub="Identidad, espíritu, logotipo">
        <div className="grid gap-4" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
          <PreviewBox>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                minHeight: 240,
              }}
            >
              <ScoutLogo size={80} wordmarkSize={48} withTagline />
            </div>
          </PreviewBox>

          <div className="vstack" style={{ gap: 16 }}>
            <SpecCard
              title="Símbolo"
              desc={
                <>
                  Medallón compás con nudo celta entrelazado verde + dorado.
                  Inspirado en el <i>bend</i> de la heráldica (la franja
                  diagonal). Espacio aislado mínimo alrededor = 30% del ancho
                  del medallón.
                </>
              }
            />
            <SpecCard
              title="Wordmark"
              desc={
                <>
                  Dos colores:{" "}
                  <b style={{ color: "var(--primary)" }}>Bend</b> en verde +{" "}
                  <b style={{ color: "var(--accent)" }}>Scout</b> en gold.
                  Nunca invertir el orden. Tagline:{" "}
                  <b>JUEGA · COMPITE · ESCULTISMO.</b>
                </>
              }
            />
          </div>
        </div>

        <div
          className="grid gap-4 mt-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          <PreviewBox>
            <div className="center" style={{ minHeight: 160, flexDirection: "column", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <ScoutLogo size={48} wordmarkSize={28} />
              <span className="t-caption text-dim">Horizontal · default</span>
            </div>
          </PreviewBox>
          <PreviewBox>
            <div
              style={{
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <BrandMark size={64} />
              <span className="brand-wordmark" style={{ fontSize: 22 }}>
                <span className="bend">Bend</span>
                <span className="scout">Scout</span>
              </span>
              <span className="t-caption text-dim">Vertical · compacta</span>
            </div>
          </PreviewBox>
          <PreviewBox>
            <div
              style={{
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <BrandMark size={72} />
              <span className="t-caption text-dim">
                Mark · favicon / app icon
              </span>
            </div>
          </PreviewBox>
        </div>

        <div
          className="grid gap-4 mt-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          <SpecCard
            eyebrow="Misión"
            desc="Hacer del aprendizaje scout una aventura diaria que se disfruta en patrulla."
          />
          <SpecCard
            eyebrow="Tono"
            desc={
              <>
                Cercano, motivador, aventurero. Trato de <i>tú</i>. Cero
                corporativo, cero infantilismo forzado.
              </>
            }
          />
          <SpecCard
            eyebrow="Energía visual"
            desc="Noche en el bosque iluminada por una linterna verde. Oscuro pero vivo. Chunky pero limpio."
          />
        </div>
      </Section>

      {/* ============ COLORS ============ */}
      <Section id="colors" num="02" title="Color" sub="Definido en oklch · dark-first">
        <h3 className="t-h3" style={{ marginBottom: 12 }}>
          Superficies
        </h3>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            marginBottom: 32,
          }}
        >
          <Swatch
            name="Background"
            code="oklch(0.16 0.018 155)"
            token="--bg"
            varName="--bg"
          />
          <Swatch
            name="Surface"
            code="oklch(0.21 0.022 155)"
            token="--surface"
            varName="--surface"
          />
          <Swatch
            name="Card"
            code="oklch(0.22 0.024 155)"
            token="--card"
            varName="--card"
          />
          <Swatch
            name="Card hover"
            code="oklch(0.26 0.028 155)"
            token="--card-hi"
            varName="--card-hi"
          />
          <Swatch
            name="Sidebar"
            code="oklch(0.19 0.022 155)"
            token="--sidebar"
            varName="--sidebar"
          />
        </div>

        <h3 className="t-h3" style={{ marginBottom: 12 }}>
          Marca
        </h3>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            marginBottom: 32,
          }}
        >
          <Swatch
            name="Primary · Lime neón"
            code="oklch(0.82 0.21 145)"
            token="--primary"
            varName="--primary"
          />
          <Swatch
            name="Primary deep"
            code="oklch(0.38 0.13 148)"
            token="--primary-deep"
            varName="--primary-deep"
          />
          <Swatch
            name="Accent · Gold"
            code="oklch(0.84 0.18 80)"
            token="--accent"
            varName="--accent"
          />
        </div>

        <h3 className="t-h3" style={{ marginBottom: 12 }}>
          Insignias (semánticas)
        </h3>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          <Swatch name="Mint" code="Éxito, logros, XP+" token="--c-mint" varName="--c-mint" />
          <Swatch name="Gold" code="Trofeos, premios, #1" token="--c-gold" varName="--c-gold" />
          <Swatch name="Rose" code="Vidas, errores, urgencia" token="--c-rose" varName="--c-rose" />
          <Swatch name="Purple" code="Especiales, eventos, magia" token="--c-purple" varName="--c-purple" />
          <Swatch name="Orange" code="Racha, fuego, energía" token="--c-orange" varName="--c-orange" />
          <Swatch name="Sky" code="Información, conocimiento" token="--c-sky" varName="--c-sky" />
          <Swatch name="Teal" code="Naturaleza, primeros auxilios" token="--c-teal" varName="--c-teal" />
        </div>
      </Section>

      {/* ============ TYPE ============ */}
      <Section
        id="type"
        num="03"
        title="Tipografía"
        sub="Space Grotesk + Unbounded + JetBrains Mono"
      >
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 32 }}
        >
          <div
            style={{
              padding: 20,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <span className="chip" style={{ padding: "4px 10px" }}>
              UI · Space Grotesk
            </span>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 56,
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                marginTop: 16,
              }}
            >
              Aa
            </div>
            <p className="t-body-sm text-muted" style={{ marginTop: 8 }}>
              Geométrica, abierta, legible a 12px. Pesos 400/500/600/700.
            </p>
          </div>
          <div
            style={{
              padding: 20,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <span className="chip" style={{ padding: "4px 10px" }}>
              Display · Unbounded
            </span>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 56,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                marginTop: 16,
              }}
            >
              Aa
            </div>
            <p className="t-body-sm text-muted" style={{ marginTop: 8 }}>
              Arcade-display chunky. Solo titulares y números grandes.
            </p>
          </div>
          <div
            style={{
              padding: 20,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <span className="chip" style={{ padding: "4px 10px" }}>
              Mono · JetBrains
            </span>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 56,
                lineHeight: 1,
                fontWeight: 700,
                marginTop: 16,
              }}
            >
              Aa
            </div>
            <p className="t-body-sm text-muted" style={{ marginTop: 8 }}>
              Cronómetros, IDs, tokens, código.
            </p>
          </div>
        </div>

        <PreviewBox>
          {(
            [
              ["display-2xl", "t-display-2xl", "Ranking de patrullas"],
              ["display-xl", "t-display-xl", "Desafío de Senderos"],
              ["display-lg", "t-display-lg", "¡Subiste de nivel!"],
              ["display-md", "t-display-md", "Misiones activas"],
              ["display-sm", "t-display-sm", "Memoria Visual"],
              ["h1", "t-h1", "Hola, ScoutMaster 👋"],
              ["h2", "t-h2", "Tu progreso esta semana"],
              ["h3", "t-h3", "Pon a prueba tu agilidad"],
              [
                "body-lg",
                "t-body-lg",
                "Minijuegos rápidos de nudos, ley scout, primeros auxilios y orientación.",
              ],
              [
                "body",
                "t-body",
                "Forma tu patrulla, sube de rango y desafía a otras tropas.",
              ],
              [
                "body-sm",
                "t-body-sm",
                "Completa 5 minijuegos para ganar +150 XP",
              ],
              ["caption", "t-caption text-muted", "Hace 2 horas"],
              ["overline", "t-overline text-primary-token", "Nivel actual"],
              ["mono", "t-mono", "04:21 · 1 250 XP · #A4F25C"],
            ] as const
          ).map(([meta, klass, sample]) => (
            <div
              key={meta}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 200px",
                gap: 24,
                alignItems: "baseline",
                padding: "18px 0",
                borderBottom: "1px dashed var(--border)",
              }}
            >
              <div className="t-mono text-muted" style={{ fontSize: 11 }}>
                {meta}
              </div>
              <div className={klass}>{sample}</div>
              <div
                className="t-mono"
                style={{
                  fontSize: 11,
                  color: "var(--fg-dim)",
                  textAlign: "right",
                }}
              >
                {klass}
              </div>
            </div>
          ))}
        </PreviewBox>
      </Section>

      {/* ============ SPACING ============ */}
      <Section
        id="spacing"
        num="04"
        title="Espaciado"
        sub="Escala de 4 · base-8 friendly"
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
          <PreviewBox>
            {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 0",
                }}
              >
                <span
                  className="t-mono text-muted"
                  style={{ width: 110, fontSize: 11 }}
                >
                  --space-{s === 4 ? 1 : s === 8 ? 2 : s === 12 ? 3 : s === 16 ? 4 : s === 20 ? 5 : s === 24 ? 6 : s === 32 ? 8 : s === 40 ? 10 : s === 48 ? 12 : 16} · {s}
                </span>
                <div
                  style={{
                    height: 16,
                    width: s,
                    background:
                      "color-mix(in oklch, var(--primary) 30%, transparent)",
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
          </PreviewBox>
          <SpecCard
            title="Reglas de espaciado"
            desc={
              <>
                Padding interno de cards: <code>20–24</code>. Gap entre cards:{" "}
                <code>16</code>. Gap entre secciones: <code>32–48</code>.
                Padding de página: <code>24</code> móvil, <code>40</code> desktop.
                <br />
                <br />
                <b>Áreas de toque</b>: mínimo <code>44 × 44 px</code>. Tab bar
                móvil mínimo <code>72 px</code>.
              </>
            }
          />
        </div>
      </Section>

      {/* ============ RADII ============ */}
      <Section
        id="radii"
        num="05"
        title="Radios"
        sub="Base 1rem · escala 0.6→2.2"
      >
        <PreviewBox>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
          >
            {(
              [
                ["SM", "9.6", "var(--r-sm)"],
                ["MD", "12.8", "var(--r-md)"],
                ["LG", "16", "var(--r-lg)"],
                ["XL", "22.4", "var(--r-xl)"],
                ["2XL", "28.8", "var(--r-2xl)"],
                ["3XL", "35.2", "var(--r-3xl)"],
              ] as const
            ).map(([label, px, r]) => (
              <div
                key={label}
                style={{
                  aspectRatio: 1,
                  background:
                    "color-mix(in oklch, var(--primary) 22%, transparent)",
                  border:
                    "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: r,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {label}
                <br />
                {px}
              </div>
            ))}
          </div>
          <p className="t-body-sm text-muted" style={{ marginTop: 16 }}>
            Botones <code>r-md</code>. Inputs <code>r-md</code>. Cards{" "}
            <code>r-xl</code>. Modales y hero <code>r-2xl/3xl</code>. Insignias y
            avatares <code>r-full</code>.
          </p>
        </PreviewBox>
      </Section>

      {/* ============ SHADOWS ============ */}
      <Section
        id="shadows"
        num="06"
        title="Sombras y elevación"
        sub="Suaves abajo, glow para el primary"
      >
        <PreviewBox>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {(
              [
                ["shadow-sm", "var(--shadow-sm)"],
                ["shadow-md", "var(--shadow-md)"],
                ["shadow-lg", "var(--shadow-lg)"],
                ["shadow-glow", "var(--shadow-glow)"],
              ] as const
            ).map(([name, sh]) => (
              <div
                key={name}
                style={{
                  aspectRatio: 1.4,
                  background: "var(--card)",
                  borderRadius: "var(--r-lg)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-muted)",
                  boxShadow: sh,
                }}
              >
                {name}
              </div>
            ))}
          </div>
          <p className="t-body-sm text-muted" style={{ marginTop: 16 }}>
            Los botones &quot;chunky&quot; usan una sombra plana de offset Y
            (efecto botón físico) — ver{" "}
            <a href="#components" style={{ color: "var(--primary)" }}>
              Componentes → Botones
            </a>
            .
          </p>
        </PreviewBox>
      </Section>

      {/* ============ ICONS ============ */}
      <Section
        id="icons"
        num="07"
        title="Iconografía"
        sub="Outline 2 px · 24 viewbox · Lucide-style + scout"
      >
        <PreviewBox>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            }}
          >
            {(Object.keys(SCOUT_ICONS) as ScoutIconName[]).map((name) => (
              <div
                key={name}
                style={{
                  aspectRatio: 1,
                  background: "var(--surface)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "var(--r-md)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: "var(--fg)",
                }}
              >
                <ScoutIcon name={name} size={22} />
                <span
                  className="t-mono"
                  style={{ fontSize: 10, color: "var(--fg-muted)" }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </PreviewBox>

        <div
          className="grid gap-4 mt-4"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          <SpecCard
            title="UI Icons"
            desc="Outline limpio, stroke 2, esquinas redondeadas. Tamaños comunes: 16 / 18 / 20 / 24. Color = currentColor."
          />
          <SpecCard
            title="Minijuego illustrations"
            desc="Para minijuegos usamos ilustraciones con luz cinematográfica verde-noche. Nunca dentro de cards de UI estándar — solo en cards de minijuego y hero."
          />
        </div>
      </Section>

      {/* ============ COMPONENTS ============ */}
      <Section id="components" num="08" title="Componentes" sub="Variantes, tamaños, estados">
        {/* BUTTONS */}
        <h3 className="t-h3" style={{ margin: "0 0 12px" }}>
          Botones
        </h3>
        <PreviewBox label="Variantes">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-primary">
              Jugar ahora <ScoutIcon name="play" size={14} />
            </button>
            <button className="btn btn-accent">Reclamar XP</button>
            <button className="btn btn-secondary">Ver detalles</button>
            <button className="btn btn-outline">Cancelar</button>
            <button className="btn btn-ghost">Más tarde</button>
            <button className="btn btn-danger">Salir de la patrulla</button>
            <button className="btn btn-primary" disabled>
              No disponible
            </button>
          </div>
          <hr className="divider" />
          <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 8 }}>
            <button className="btn btn-primary btn-sm">SM</button>
            <button className="btn btn-primary">MD</button>
            <button className="btn btn-primary btn-lg">LG</button>
            <button className="btn btn-secondary btn-icon btn-sm">
              <ScoutIcon name="settings" size={16} />
            </button>
            <button className="btn btn-secondary btn-icon">
              <ScoutIcon name="bell" size={18} />
            </button>
            <button className="btn btn-primary btn-icon btn-lg">
              <ScoutIcon name="play" size={22} />
            </button>
          </div>
        </PreviewBox>

        {/* CARDS */}
        <h3 className="t-h3" style={{ margin: "32px 0 12px" }}>
          Stat cards
        </h3>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card">
            <div className="between" style={{ marginBottom: 8 }}>
              <span className="stat-label">Nivel actual</span>
              <BadgeCircle color="mint" size={36}>
                <ScoutIcon name="leaf" size={16} />
              </BadgeCircle>
            </div>
            <div className="stat-value">24</div>
            <div style={{ margin: "10px 0 6px" }}>
              <XpBar value={4250} max={6000} />
            </div>
            <div className="t-caption text-muted">4 250 / 6 000 XP</div>
          </div>
          <div className="stat-card">
            <div className="between" style={{ marginBottom: 8 }}>
              <span className="stat-label">Insignias</span>
              <a className="stat-link" href="#">
                Ver todas
              </a>
            </div>
            <div className="stat-value">12</div>
            <div className="flex items-center gap-1.5" style={{ marginTop: 12 }}>
              <BadgeCircle color="purple" size={28} ringed>
                <ScoutIcon name="starfill" size={14} stroke={2.2} />
              </BadgeCircle>
              <BadgeCircle color="rose" size={28} ringed>
                <ScoutIcon name="shield" size={14} />
              </BadgeCircle>
              <BadgeCircle color="gold" size={28} ringed>
                <ScoutIcon name="starfill" size={14} stroke={2.2} />
              </BadgeCircle>
              <BadgeCircle color="orange" size={28} ringed>
                <ScoutIcon name="flame" size={14} />
              </BadgeCircle>
              <BadgeCircle color="sky" size={28} ringed>
                <ScoutIcon name="shield" size={14} />
              </BadgeCircle>
            </div>
          </div>
          <div className="stat-card">
            <div className="between" style={{ marginBottom: 8 }}>
              <span className="stat-label">Puntos scout</span>
              <BadgeCircle color="gold" size={36}>
                <ScoutIcon name="starfill" size={16} stroke={2.2} />
              </BadgeCircle>
            </div>
            <div className="stat-value">8 560</div>
            <a
              className="stat-link"
              href="#"
              style={{ marginTop: 6, display: "inline-block" }}
            >
              Historial
            </a>
          </div>
        </div>

        {/* INSIGNIAS */}
        <h3 className="t-h3" style={{ margin: "32px 0 12px" }}>
          Insignias
        </h3>
        <PreviewBox label="Tamaños">
          <div
            className="flex flex-wrap items-end gap-3"
            style={{ marginTop: 8 }}
          >
            <BadgeCircle color="mint" size={28}>
              <ScoutIcon name="leaf" size={14} stroke={2.2} />
            </BadgeCircle>
            <BadgeCircle color="mint" size={36}>
              <ScoutIcon name="leaf" size={18} />
            </BadgeCircle>
            <BadgeCircle color="mint" size={44}>
              <ScoutIcon name="leaf" size={22} />
            </BadgeCircle>
            <BadgeCircle color="mint" size={56}>
              <ScoutIcon name="leaf" size={28} stroke={1.8} />
            </BadgeCircle>
            <BadgeCircle color="mint" size={72} ringed>
              <ScoutIcon name="leaf" size={36} stroke={1.6} />
            </BadgeCircle>
            <BadgeCircle color="mint" size={96} ringed pulse>
              <ScoutIcon name="leaf" size={48} stroke={1.4} />
            </BadgeCircle>
          </div>
          <hr className="divider" />
          <div
            className="flex flex-wrap items-end gap-6"
            style={{ marginTop: 8 }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <BadgeCircle color="mint" size={72} ringed>
                <ScoutIcon name="shieldcheck" size={36} stroke={1.6} />
              </BadgeCircle>
              <span className="t-caption">Desbloqueada</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <BadgeCircle color="mint" size={72} ringed pulse>
                <ScoutIcon name="shieldcheck" size={36} stroke={1.6} />
              </BadgeCircle>
              <span className="t-caption text-primary-token">Nueva</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <BadgeCircle color="locked" size={72}>
                <ScoutIcon name="lock" size={36} stroke={1.6} />
              </BadgeCircle>
              <span className="t-caption text-soft">Bloqueada</span>
            </div>
          </div>
        </PreviewBox>

        {/* XP BAR */}
        <h3 className="t-h3" style={{ margin: "32px 0 12px" }}>
          XP / Progreso
        </h3>
        <PreviewBox>
          <div className="vstack" style={{ gap: 18 }}>
            <div>
              <div className="between" style={{ marginBottom: 6 }}>
                <span className="t-caption">XP estándar</span>
                <span className="t-mono">4 250 / 6 000</span>
              </div>
              <XpBar value={4250} max={6000} />
            </div>
            <div>
              <div className="between" style={{ marginBottom: 6 }}>
                <span className="t-caption">Misión completada</span>
                <span className="t-mono">100%</span>
              </div>
              <XpBar value={100} max={100} />
            </div>
            <div>
              <div className="between" style={{ marginBottom: 6 }}>
                <span className="t-caption text-accent-token">
                  Insignia dorada
                </span>
                <span className="t-mono">85%</span>
              </div>
              <XpBar value={85} max={100} variant="gold" />
            </div>
          </div>
        </PreviewBox>

        {/* INPUTS */}
        <h3 className="t-h3" style={{ margin: "32px 0 12px" }}>
          Formularios
        </h3>
        <PreviewBox>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "1fr 1fr", maxWidth: 720 }}
          >
            <div className="vstack" style={{ gap: 6 }}>
              <label className="t-overline text-muted">Nombre de patrulla</label>
              <input
                className="input"
                placeholder="Lobos del Bosque"
                defaultValue="Lobos del Bosque"
              />
            </div>
            <div className="vstack" style={{ gap: 6 }}>
              <label className="t-overline text-muted">
                Código de invitación
              </label>
              <input className="input" placeholder="SCOUT-XXXX" />
            </div>
            <div className="vstack" style={{ gap: 6, gridColumn: "span 2" }}>
              <label className="t-overline text-muted">Buscar</label>
              <input
                className="input input-search"
                placeholder="Buscar minijuegos, scouts, patrullas…"
              />
            </div>
          </div>
        </PreviewBox>

        {/* CHIPS */}
        <h3 className="t-h3" style={{ margin: "32px 0 12px" }}>
          Chips · Rangos
        </h3>
        <PreviewBox>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">Nuevo</span>
            <span className="chip chip-accent">+150 XP</span>
            <span className="chip chip-rose">Urgente</span>
            <span className="chip chip-purple">Especial</span>
            <span className="chip chip-sky">Info</span>
            <span className="chip chip-neutral">Borrador</span>
            <span className="rank-tag">⚜️ Manada</span>
            <span className="rank-tag">🏕️ Tropa</span>
            <span className="rank-tag">🌲 Clan Pioneros</span>
          </div>
        </PreviewBox>

        {/* AVATARS */}
        <h3 className="t-h3" style={{ margin: "32px 0 12px" }}>
          Avatares
        </h3>
        <PreviewBox>
          <div className="flex flex-wrap items-end gap-3">
            <span className="avatar sz-32">AM</span>
            <span className="avatar">SM</span>
            <span className="avatar sz-56">JF</span>
            <span className="avatar sz-72 avatar-ring">CR</span>
            <span className="avatar sz-96 avatar-ring">SM</span>
            <span
              className="avatar sz-56"
              style={{
                background:
                  "linear-gradient(140deg, color-mix(in oklch, var(--c-purple) 50%, var(--surface-2)), var(--surface))",
              }}
            >
              ⚡
            </span>
            <span
              className="avatar sz-56"
              style={{
                background:
                  "linear-gradient(140deg, color-mix(in oklch, var(--c-orange) 50%, var(--surface-2)), var(--surface))",
              }}
            >
              🔥
            </span>
          </div>
        </PreviewBox>

        {/* TOAST & MODAL */}
        <h3 className="t-h3" style={{ margin: "32px 0 12px" }}>
          Toasts y modal
        </h3>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
          <div className="vstack" style={{ gap: 12 }}>
            <div className="toast">
              <BadgeCircle color="mint" size={36}>
                <ScoutIcon name="check" size={16} stroke={2.4} />
              </BadgeCircle>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  ¡Ganaste +150 XP!
                </div>
                <div className="t-caption text-muted">
                  Completaste Memoria Visual nivel 3
                </div>
              </div>
            </div>
            <div className="toast" style={{ borderColor: "color-mix(in oklch, var(--c-purple) 35%, transparent)" }}>
              <BadgeCircle color="purple" size={36} ringed>
                <ScoutIcon name="starfill" size={16} stroke={2.2} />
              </BadgeCircle>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  Nueva insignia:{" "}
                  <span style={{ color: "var(--c-purple)" }}>Explorador</span>
                </div>
                <div className="t-caption text-muted">Toca para ver detalles</div>
              </div>
            </div>
            <div
              className="toast"
              style={{
                borderColor:
                  "color-mix(in oklch, var(--c-rose) 35%, transparent)",
              }}
            >
              <BadgeCircle color="rose" size={36}>
                <ScoutIcon name="heart" size={16} />
              </BadgeCircle>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  Te queda 1 vida
                </div>
                <div className="t-caption text-muted">
                  Una más y perderás la racha
                </div>
              </div>
            </div>
          </div>

          <div className="modal">
            <div className="center" style={{ marginBottom: 18 }}>
              <BadgeCircle color="purple" size={96} ringed pulse>
                <ScoutIcon name="starfill" size={44} stroke={1.8} />
              </BadgeCircle>
            </div>
            <h3
              className="t-display-md"
              style={{ textAlign: "center", margin: "0 0 6px" }}
            >
              ¡Nueva insignia!
            </h3>
            <p
              className="t-body text-muted"
              style={{ textAlign: "center", margin: "0 0 20px" }}
            >
              Has desbloqueado{" "}
              <b style={{ color: "var(--c-purple)" }}>Explorador</b> por
              completar tu primer sendero.
            </p>
            <div className="flex justify-center gap-2">
              <button className="btn btn-ghost">Más tarde</button>
              <button className="btn btn-primary">¡Genial!</button>
            </div>
          </div>
        </div>
      </Section>

      {/* ============ GAME UI ============ */}
      <Section
        id="game-ui"
        num="09"
        title="Game UI"
        sub="Timer, vidas, puntos, niveles"
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {(
            [
              {
                title: "MEMORIA VISUAL",
                level: 3,
                timer: "00:45",
                points: "1 250",
                bg: "linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
                lives: [true, true, false],
              },
              {
                title: "LABERINTO",
                level: 2,
                timer: "01:10",
                points: "980",
                bg: "linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
                hints: 3,
              },
              {
                title: "CAMINO SEGURO",
                level: 4,
                timer: "00:30",
                points: "1 560",
                bg: "linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
                lives: [true, false, false],
              },
              {
                title: "PREGUNTAS",
                level: "Quick fire",
                timer: "2/10",
                points: "750",
                bg: "linear-gradient(180deg, oklch(0.26 0.04 195), oklch(0.20 0.03 195))",
                progress: 20,
              },
            ] as const
          ).map((g) => (
            <div
              key={g.title}
              style={{
                background: g.bg,
                borderRadius: "var(--r-xl)",
                border: "1px solid var(--border)",
                padding: 16,
                aspectRatio: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                color: "var(--fg)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="between">
                <span
                  className="hstack"
                  style={{
                    padding: "4px 8px",
                    background: "oklch(0 0 0 / 0.35)",
                    borderRadius: "var(--r-sm)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {"hints" in g ? null : <ScoutIcon name="clock" size={14} />}
                  {g.timer}
                </span>
                <div style={{ fontSize: 10, color: "var(--fg-muted)", textAlign: "right" }}>
                  Puntos
                  <br />
                  <b
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 16,
                      color: "var(--accent)",
                    }}
                  >
                    {g.points}
                  </b>
                </div>
              </div>
              <div
                className="t-display-sm"
                style={{ fontSize: 13, letterSpacing: "0.14em", opacity: 0.9 }}
              >
                {g.title}
              </div>
              <div className="between">
                <span className="t-caption">
                  {typeof g.level === "number" ? `Nivel ${g.level}` : g.level}
                </span>
                {"lives" in g && g.lives ? (
                  <span className="life">
                    {g.lives.map((alive, i) => (
                      <svg
                        key={i}
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill={alive ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={alive ? "" : "is-empty"}
                      >
                        <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
                      </svg>
                    ))}
                  </span>
                ) : "hints" in g && g.hints ? (
                  <span
                    className="hstack"
                    style={{ color: "var(--accent)" }}
                  >
                    <ScoutIcon name="lightbulb" size={16} />
                    <b
                      className="t-num"
                      style={{ fontSize: 14 }}
                    >
                      {g.hints}
                    </b>
                  </span>
                ) : "progress" in g && g.progress ? (
                  <div style={{ width: 60 }}>
                    <XpBar value={g.progress} max={100} />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <p className="t-body-sm text-muted" style={{ marginTop: 16 }}>
          Cada minijuego usa la misma rejilla cabeza/cuerpo/pie. <b>Timer</b>{" "}
          izquierda (mono), <b>Puntos</b> derecha (display + tabular). Vidas en
          rosa con outline para vidas perdidas. El header es siempre compacto
          para dejar al juego el protagonismo.
        </p>
      </Section>

      {/* ============ PATRULLAS ============ */}
      <Section
        id="patrullas"
        num="10"
        title="Patrullas"
        sub="Escudo, bandera, ranking de equipo"
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
          <PreviewBox>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, auto)",
                gap: 24,
                placeItems: "center",
                padding: "16px 0",
              }}
            >
              {(
                [
                  ["L", "Lobos", "--c-mint"],
                  ["A", "Águilas", "--c-rose"],
                  ["Z", "Zorros", "--c-sky"],
                  ["B", "Búhos", "--c-purple"],
                  ["P", "Pumas", "--c-orange"],
                  ["C", "Castores", "--c-teal"],
                ] as const
              ).map(([letter, name, color]) => (
                <div key={name} className="vstack" style={{ alignItems: "center", gap: 8 }}>
                  <span
                    className="shield"
                    style={{
                      background: `linear-gradient(155deg, color-mix(in oklch, var(${color}) 55%, var(--surface-2)), var(--surface))`,
                    }}
                  >
                    {letter}
                  </span>
                  <span className="t-caption text-muted">{name}</span>
                </div>
              ))}
            </div>
          </PreviewBox>

          <div className="scout-card" style={{ padding: 18 }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <div className="vstack" style={{ gap: 2 }}>
                <span className="t-overline text-muted">
                  Ranking de patrullas
                </span>
                <span className="t-display-sm">Top tropas</span>
              </div>
              <span className="chip chip-accent">Semana 14</span>
            </div>
            <div className="vstack" style={{ gap: 6 }}>
              {(
                [
                  {
                    rank: 1,
                    letter: "L",
                    name: "Lobos del Bosque",
                    meta: "8 scouts · racha 12 días",
                    points: "42 180",
                    delta: "8%",
                    color: "--c-mint",
                    highlight: true,
                  },
                  {
                    rank: 2,
                    letter: "A",
                    name: "Águilas Reales",
                    meta: "6 scouts · racha 9 días",
                    points: "38 940",
                    delta: "3%",
                    color: "--c-rose",
                  },
                  {
                    rank: 3,
                    letter: "B",
                    name: "Búhos Nocturnos",
                    meta: "7 scouts · racha 4 días",
                    points: "31 620",
                    delta: "0%",
                    color: "--c-purple",
                  },
                ] as const
              ).map((row) => (
                <div
                  key={row.rank}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 60px 1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    padding: 10,
                    borderRadius: "var(--r-md)",
                    background: row.highlight
                      ? "color-mix(in oklch, var(--accent) 8%, transparent)"
                      : "var(--surface)",
                    border: row.highlight
                      ? "1px solid color-mix(in oklch, var(--accent) 25%, transparent)"
                      : "1px solid transparent",
                  }}
                >
                  <span
                    className="t-display-md"
                    style={{
                      color: row.highlight ? "var(--accent)" : "var(--fg-muted)",
                      textAlign: "center",
                    }}
                  >
                    {row.rank}
                  </span>
                  <span
                    className="shield"
                    style={{
                      width: 48,
                      height: 56,
                      fontSize: 22,
                      background: `linear-gradient(155deg, color-mix(in oklch, var(${row.color}) 55%, var(--surface-2)), var(--surface))`,
                    }}
                  >
                    {row.letter}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {row.name}
                    </div>
                    <div className="t-caption text-muted">{row.meta}</div>
                  </div>
                  <span
                    className="t-num"
                    style={{
                      fontSize: 22,
                      color: row.highlight ? "var(--accent)" : "var(--fg)",
                    }}
                  >
                    {row.points}
                  </span>
                  <span
                    className="hstack t-caption"
                    style={{
                      color:
                        row.delta === "0%"
                          ? "var(--fg-soft)"
                          : "var(--c-mint)",
                    }}
                  >
                    {row.delta === "0%" ? "—" : <ScoutIcon name="arrow" size={12} />}{" "}
                    {row.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ============ PATTERNS ============ */}
      <Section id="patterns" num="11" title="Patrones" sub="Reglas de aplicación">
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div
            style={{
              padding: 20,
              borderRadius: "var(--r-lg)",
              border:
                "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
              background: "var(--surface)",
            }}
          >
            <h5
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--primary)",
              }}
            >
              Hazlo así
            </h5>
            <ul
              className="t-body-sm text-muted"
              style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}
            >
              <li>
                Usa el verde primary <b>solo</b> para acciones principales, XP
                positivo y elementos activos.
              </li>
              <li>
                Tipografía display para titulares y números grandes; nunca para
                párrafos.
              </li>
              <li>
                Una pantalla = un objetivo claro. Si necesitas dos, divide en
                pestañas.
              </li>
              <li>
                Microcopy en tono cercano y breve. Verbos en imperativo amable
                (&quot;Juega&quot;, &quot;Reclama&quot;, &quot;Únete&quot;).
              </li>
            </ul>
          </div>
          <div
            style={{
              padding: 20,
              borderRadius: "var(--r-lg)",
              border:
                "1px solid color-mix(in oklch, var(--c-rose) 30%, transparent)",
              background: "var(--surface)",
            }}
          >
            <h5
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--c-rose)",
              }}
            >
              Evita esto
            </h5>
            <ul
              className="t-body-sm text-muted"
              style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}
            >
              <li>Gradientes en texto principal o en &gt;1 elemento por pantalla.</li>
              <li>
                Emoji como reemplazo de iconos UI — usa el set{" "}
                <a href="#icons" style={{ color: "var(--primary)" }}>
                  oficial
                </a>
                .
              </li>
              <li>Cards sin jerarquía (mismo peso para todo).</li>
              <li>Más de 3 colores semánticos juntos en una misma vista.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ============ VOICE ============ */}
      <Section
        id="voice"
        num="12"
        title="Voz y copy"
        sub="Cómo hablamos a los scouts"
      >
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {(
            [
              [
                "Saludo",
                "¡Hola, ScoutMaster! 👋",
                "Personal, energético, sin formalidad. Trato de tú.",
              ],
              [
                "Onboarding",
                "Listo para una nueva aventura?",
                "Marca la promesa: aprender = aventurarse.",
              ],
              [
                "Logro",
                "¡Ganaste el Desafío de Memoria!",
                "Celebra el qué (logro) y el cuánto (+XP) en líneas separadas.",
              ],
              [
                "Error",
                "Casi… ¡intenta de nuevo!",
                "Nunca culpamos al usuario. Optimismo y siguiente paso.",
              ],
              [
                "Vacío",
                "Aún no tienes patrulla",
                "Estado + acción evidente debajo (Crear patrulla / Unirme).",
              ],
              [
                "Confirmación",
                "¿Salir de la patrulla?",
                "Pregunta directa + consecuencia clara en cuerpo del modal.",
              ],
            ] as const
          ).map(([eyebrow, headline, desc]) => (
            <div
              key={eyebrow}
              style={{
                padding: 20,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)",
              }}
            >
              <span className="chip" style={{ padding: "4px 10px" }}>
                {eyebrow}
              </span>
              <p className="t-h3" style={{ margin: "12px 0 4px" }}>
                &quot;{headline}&quot;
              </p>
              <p className="t-body-sm text-muted" style={{ margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ============ FOOTER ============ */}
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
            <b style={{ color: "var(--accent)" }}>Scout</b> · Design System v1.0
            · 2026
          </span>
        </div>
        <Link
          href="/design-system/screens"
          className="t-body-sm"
          style={{ color: "var(--primary)", fontWeight: 700 }}
        >
          Pantallas →
        </Link>
      </footer>
    </main>
  );
}

function Section({
  id,
  num,
  title,
  sub,
  children,
}: {
  id: string;
  num: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginTop: 80, scrollMarginTop: 80 }}>
      <div
        className="between"
        style={{ alignItems: "baseline", marginBottom: 24 }}
      >
        <h2 className="t-display-md hstack" style={{ margin: 0, gap: 12 }}>
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
            {num}
          </span>
          {title}
        </h2>
        {sub && <span className="text-muted t-body-sm">{sub}</span>}
      </div>
      {children}
    </section>
  );
}
