import { ScoutIcon } from "./icon";
import { cn } from "@/lib/utils";

interface GameShellProps {
  title: string;
  time: string;
  points: number;
  lives?: number;
  livesUsed?: number;
  hints?: number;
  level?: number | string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function GameShell({
  title,
  time,
  points,
  lives = 3,
  livesUsed = 0,
  hints,
  level,
  children,
  footer,
  className,
}: GameShellProps) {
  return (
    <div
      className={cn("relative mx-auto flex min-h-dvh w-full max-w-md flex-col", className)}
      style={{ background: "var(--bg)" }}
    >
      <header
        className="grid items-center gap-3 px-5 py-3"
        style={{ gridTemplateColumns: "auto 1fr auto" }}
      >
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 t-mono"
          style={{
            background: "oklch(0 0 0 / 0.35)",
            borderRadius: "var(--r-sm)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <ScoutIcon name="clock" size={14} /> {time}
        </span>
        <div style={{ textAlign: "center" }}>
          <div
            className="t-display-sm"
            style={{ fontSize: 13, letterSpacing: "0.16em" }}
          >
            {title}
          </div>
          {level != null && (
            <div className="t-caption text-muted">
              {typeof level === "number" ? `Nivel ${level}` : level}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-caption text-muted">Puntos</div>
          <div
            className="t-num"
            style={{ fontSize: 18, color: "var(--accent)" }}
          >
            {points.toLocaleString("es")}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5">{children}</div>

      <footer
        className="flex items-center justify-between gap-3 px-5 pb-5 pt-3"
      >
        {hints != null ? (
          <span className="hstack" style={{ color: "var(--accent)" }}>
            <ScoutIcon name="lightbulb" size={18} />
            <b className="t-num" style={{ fontSize: 16 }}>
              {hints}
            </b>
          </span>
        ) : (
          <span className="life">
            {Array.from({ length: lives }).map((_, i) => (
              <ScoutIcon
                key={i}
                name={i < lives - livesUsed ? "heartfill" : "heart"}
                size={18}
                className={
                  i < lives - livesUsed ? undefined : "is-empty"
                }
              />
            ))}
          </span>
        )}
        {footer ?? (
          <button className="btn btn-ghost btn-sm">
            <ScoutIcon name="pause" size={14} /> Pausar
          </button>
        )}
      </footer>
    </div>
  );
}
