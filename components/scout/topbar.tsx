import { ScoutLogo } from "./logo";
import { ScoutIcon } from "./icon";
import type { AuthState } from "@/lib/auth/session";

interface TopbarProps {
  greeting?: string;
  subtitle?: string;
  notifications?: number;
  auth?: AuthState;
}

export function Topbar({
  greeting,
  subtitle = "Listo para una nueva aventura?",
  notifications = 3,
  auth,
}: TopbarProps) {
  const computedGreeting =
    greeting ??
    (auth?.authenticated && auth.profile
      ? `¡Hola, ${auth.profile.display_name ?? auth.profile.username}!`
      : auth?.guest
        ? "¡Hola, invitado!"
        : "¡Hola, ScoutMaster!");

  return (
    <header
      className="sticky top-0 z-30 -mx-4 -mt-4 mb-6 px-4 pt-4 md:-mx-6 md:-mt-6 md:px-6 md:pt-6"
      style={{
        background: "color-mix(in oklch, var(--bg) 85%, transparent)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:hidden">
          <ScoutLogo size={32} wordmarkSize={18} />
        </div>
        <div className="space-y-1">
          <h1 className="t-h1">
            {computedGreeting}{" "}
            <span className="inline-block animate-float">👋</span>
          </h1>
          <p className="t-body-sm text-muted">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block md:w-72">
            <input
              type="search"
              placeholder="Buscar minijuegos, scouts, patrullas…"
              className="input input-search"
            />
          </div>

          <button
            type="button"
            aria-label="Notificaciones"
            className="btn btn-secondary btn-icon relative"
          >
            <ScoutIcon name="bell" size={18} />
            {notifications > 0 && (
              <span
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-extrabold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-ink)",
                }}
              >
                {notifications}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Ajustes"
            className="btn btn-secondary btn-icon"
          >
            <ScoutIcon name="settings" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
