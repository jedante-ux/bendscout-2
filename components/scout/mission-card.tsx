import { BadgeCircle } from "./badge-circle";
import { XpBar } from "./xp-bar";
import { cn } from "@/lib/utils";

type BadgeColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface MissionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: BadgeColor;
  xpReward: number;
  progress: { value: number; max: number };
  className?: string;
}

export function MissionCard({
  title,
  description,
  icon,
  iconColor = "mint",
  xpReward,
  progress,
  className,
}: MissionCardProps) {
  return (
    <div className={cn("mission", className)}>
      <BadgeCircle color={iconColor} size={44}>
        {icon}
      </BadgeCircle>
      <div className="min-w-0">
        <div className="mission-title truncate">{title}</div>
        <div className="mission-sub line-clamp-1">{description}</div>
        <div style={{ marginTop: 8 }}>
          <XpBar value={progress.value} max={progress.max} />
        </div>
      </div>
      <span className="mission-xp">+{xpReward} XP</span>
    </div>
  );
}
