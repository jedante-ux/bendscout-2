"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoutIcon } from "./icon";
import { spinDailyPick } from "@/lib/games/daily";
import type { GameDefinition } from "@/lib/games/registry";

const ITEM_W = 92;
const ITEM_GAP = 12;
const STEP = ITEM_W + ITEM_GAP;
const VISIBLE = 5;
const STRIP_LOOPS = 10;
const SPIN_MS = 3200;

type SpinState = "idle" | "spinning" | "settled";

interface DailyRouletteProps {
  teamId: string;
  games: GameDefinition[];
}

interface SettledResult {
  gameKey: string;
  first: boolean;
  bonusAwarded: number;
  pickedByUsername: string;
  pickedByName: string | null;
  isMe: boolean;
}

export function DailyRoulette({ teamId, games }: DailyRouletteProps) {
  const router = useRouter();
  const liveGames = useMemo(
    () => games.filter((g) => g.status === "live" && g.route),
    [games],
  );

  const strip = useMemo(() => {
    const list: GameDefinition[] = [];
    for (let i = 0; i < STRIP_LOOPS; i++) list.push(...games);
    return list;
  }, [games]);

  const [state, setState] = useState<SpinState>("idle");
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<SettledResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSpin() {
    if (state === "spinning" || liveGames.length === 0) return;
    setError(null);
    setResult(null);
    setState("spinning");

    const guess = liveGames[Math.floor(Math.random() * liveGames.length)];
    const res = await spinDailyPick(teamId, guess.key);

    if (!res.ok || !res.pick) {
      setState("idle");
      setError("No pudimos girar la ruleta. Intenta de nuevo en un momento.");
      return;
    }

    const finalKey = res.pick.gameKey;
    // Land in the last loop so the strip moves "enough" to feel like a spin.
    const finalLoopStart = (STRIP_LOOPS - 1) * games.length;
    const idxInGames = games.findIndex((g) => g.key === finalKey);
    const targetIdx = finalLoopStart + Math.max(0, idxInGames);
    // Push offset to center the target item under the pointer (item at index = floor(VISIBLE/2)).
    const center = Math.floor(VISIBLE / 2);
    const newOffset = -(targetIdx - center) * STEP;
    setOffset(newOffset);

    window.setTimeout(() => {
      setState("settled");
      setResult({
        gameKey: finalKey,
        first: !!res.first,
        bonusAwarded: res.bonusAwarded ?? 0,
        pickedByUsername: res.pick!.pickedByUsername,
        pickedByName: res.pick!.pickedByName,
        isMe: !!res.first,
      });
      router.refresh();
    }, SPIN_MS + 80);
  }

  const chosenGame =
    result != null ? games.find((g) => g.key === result.gameKey) : null;

  const viewportW = VISIBLE * STEP - ITEM_GAP;

  return (
    <section
      className="scout-card-glow relative overflow-hidden"
      style={{ padding: 0 }}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 85% 30%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 65%), radial-gradient(ellipse 50% 60% at 10% 90%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)",
        }}
      />

      <div className="relative grid items-stretch gap-0 lg:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left: copy + CTA */}
        <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <span
              className="hstack t-overline"
              style={{
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background:
                  "color-mix(in oklch, var(--primary) 18%, transparent)",
                color: "var(--primary)",
                border:
                  "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
                letterSpacing: "0.04em",
              }}
            >
              <ScoutIcon name="flame" size={14} stroke={2.2} />
              Ruleta del día
            </span>
            <span className="t-caption text-muted">+10 al primero</span>
          </div>

          <div>
            {state === "settled" && result && chosenGame ? (
              <>
                <h1 className="t-display-lg" style={{ margin: 0, lineHeight: 1.05 }}>
                  {chosenGame.title}
                </h1>
                <p className="t-body text-muted" style={{ marginTop: 8 }}>
                  {result.first
                    ? `¡Tú elegiste! Tu patrulla y tú ganaron +${result.bonusAwarded} puntos por ser los primeros.`
                    : `@${result.pickedByUsername} eligió primero hoy. Aún puedes jugarlo y sumar puntos.`}
                </p>
              </>
            ) : state === "spinning" ? (
              <>
                <h1 className="t-display-lg" style={{ margin: 0, lineHeight: 1.05 }}>
                  Girando…
                </h1>
                <p className="t-body text-muted" style={{ marginTop: 8 }}>
                  La suerte decide qué minijuego juega tu patrulla hoy.
                </p>
              </>
            ) : (
              <>
                <h1 className="t-display-lg" style={{ margin: 0, lineHeight: 1.05 }}>
                  ¡Gira y elige!
                </h1>
                <p className="t-body text-muted" style={{ marginTop: 8 }}>
                  El primer scout de tu patrulla que dispare la ruleta hoy
                  decide el minijuego del día y gana <strong>+10 puntos</strong>{" "}
                  para sí y para su patrulla.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {state === "settled" && chosenGame ? (
              <Link
                href={chosenGame.route ?? "/play"}
                className="btn btn-primary btn-lg"
                style={{ minWidth: 180 }}
              >
                <ScoutIcon name="play" size={16} stroke={2.4} />
                Jugar {chosenGame.title}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={state === "spinning" || liveGames.length === 0}
                className="btn btn-primary btn-lg"
                style={{ minWidth: 180 }}
              >
                <ScoutIcon
                  name={state === "spinning" ? "clock" : "play"}
                  size={16}
                  stroke={2.4}
                />
                {state === "spinning" ? "Girando…" : "¡Girar la ruleta!"}
              </button>
            )}
            <Link href="/play" className="btn btn-secondary btn-lg">
              Ver todos los minijuegos
            </Link>
          </div>

          {error && (
            <p
              className="t-caption"
              style={{ color: "var(--c-rose)", margin: 0 }}
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {/* Right: roulette strip */}
        <div
          className="relative min-h-[260px] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.30 0.05 155), oklch(0.18 0.04 155))",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, oklch(0.78 0.16 145 / 0.35), transparent 30%), radial-gradient(circle at 75% 70%, oklch(0.65 0.16 160 / 0.32), transparent 35%)",
            }}
          />

          {/* Roulette viewport */}
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="relative"
              style={{
                width: viewportW,
                maxWidth: "92%",
                height: ITEM_W + 24,
                borderRadius: "var(--r-md)",
                background:
                  "linear-gradient(180deg, oklch(0.12 0.04 155 / 0.55), oklch(0.10 0.03 155 / 0.55))",
                border: "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
                boxShadow:
                  "inset 0 0 0 1px color-mix(in oklch, var(--primary) 18%, transparent), 0 8px 28px -10px oklch(0 0 0 / 0.5)",
                overflow: "hidden",
              }}
            >
              {/* Pointer */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: -6,
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "12px solid var(--accent)",
                  zIndex: 3,
                  filter: "drop-shadow(0 2px 4px oklch(0 0 0 / 0.4))",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 64,
                  background:
                    "linear-gradient(90deg, oklch(0.10 0.03 155) 5%, transparent)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 64,
                  background:
                    "linear-gradient(270deg, oklch(0.10 0.03 155) 5%, transparent)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              <div
                className="flex items-center"
                style={{
                  height: "100%",
                  paddingLeft: ITEM_GAP / 2,
                  gap: ITEM_GAP,
                  transform: `translateX(${offset}px)`,
                  transition:
                    state === "spinning"
                      ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 0.84, 0.2, 1)`
                      : "none",
                  willChange: "transform",
                }}
              >
                {strip.map((g, i) => (
                  <div
                    key={`${g.key}-${i}`}
                    className="grid place-items-center flex-shrink-0"
                    style={{
                      width: ITEM_W,
                      height: ITEM_W,
                      borderRadius: "var(--r-md)",
                      background:
                        g.status === "live"
                          ? "color-mix(in oklch, var(--primary) 16%, oklch(0.22 0.04 155))"
                          : "oklch(0.22 0.04 155)",
                      border:
                        g.status === "live"
                          ? "1px solid color-mix(in oklch, var(--primary) 38%, transparent)"
                          : "1px solid color-mix(in oklch, var(--border-hi) 60%, transparent)",
                      opacity: g.status === "live" ? 1 : 0.55,
                    }}
                  >
                    {g.imageSrc ? (
                      <Image
                        src={g.imageSrc}
                        alt={g.title}
                        width={64}
                        height={64}
                        className="h-[72%] w-auto object-contain"
                      />
                    ) : (
                      <span style={{ fontSize: 44, lineHeight: 1 }}>
                        {g.emoji}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {state === "settled" && result?.first && (
            <div
              className="absolute"
              style={{
                left: "50%",
                bottom: 18,
                transform: "translateX(-50%)",
                padding: "6px 14px",
                borderRadius: 999,
                background: "color-mix(in oklch, var(--c-gold) 25%, var(--bg))",
                border:
                  "1px solid color-mix(in oklch, var(--c-gold) 60%, transparent)",
                color: "var(--c-gold)",
                fontWeight: 800,
                letterSpacing: "0.04em",
                fontSize: 13,
                animation: "fade-up 600ms var(--ease-out-quint) both",
              }}
            >
              ⭐ +{result.bonusAwarded} PTS
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
