import { cn } from "@/lib/utils";

interface XpBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  variant?: "primary" | "gold";
}

export function XpBar({
  value,
  max,
  className,
  showLabel = false,
  variant = "primary",
}: XpBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="xp-track">
        <div
          className={cn("xp-fill", variant === "gold" && "is-gold")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="t-mono text-muted">
          {value.toLocaleString("es")} / {max.toLocaleString("es")} XP
        </p>
      )}
    </div>
  );
}
