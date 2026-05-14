import { cn } from "@/lib/utils";
import { XpBar } from "./xp-bar";
import { BadgeCircle } from "./badge-circle";

type BadgeColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconColor?: BadgeColor;
  link?: { label: string; href?: string };
  progress?: { value: number; max: number };
  footer?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconColor = "mint",
  link,
  progress,
  footer,
  className,
}: StatCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="between" style={{ marginBottom: 8 }}>
        <span className="stat-label">{label}</span>
        {icon ? (
          <BadgeCircle color={iconColor} size={36}>
            {icon}
          </BadgeCircle>
        ) : link ? (
          <a className="stat-link" href={link.href ?? "#"}>
            {link.label}
          </a>
        ) : null}
      </div>
      <div className="stat-value">{value}</div>
      {progress && (
        <>
          <div style={{ margin: "10px 0 6px" }}>
            <XpBar value={progress.value} max={progress.max} />
          </div>
          <div className="t-caption text-muted">
            {progress.value.toLocaleString("es")} /{" "}
            {progress.max.toLocaleString("es")} XP
          </div>
        </>
      )}
      {footer && <div style={{ marginTop: 12 }}>{footer}</div>}
    </div>
  );
}
