import { BadgeCircle } from "./badge-circle";
import { cn } from "@/lib/utils";

type BadgeColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface ActivityItemProps {
  title: string;
  delta: string;
  timeAgo: string;
  icon: React.ReactNode;
  iconColor?: BadgeColor;
  className?: string;
}

export function ActivityItem({
  title,
  delta,
  timeAgo,
  icon,
  iconColor = "mint",
  className,
}: ActivityItemProps) {
  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <BadgeCircle color={iconColor} size={36}>
        {icon}
      </BadgeCircle>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs font-bold text-primary-token">{delta}</p>
      </div>
      <span className="t-caption text-muted">{timeAgo}</span>
    </div>
  );
}
