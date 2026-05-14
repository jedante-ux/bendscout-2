import { cn } from "@/lib/utils";

type BadgeColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal"
  | "locked";

type BadgeSize = 28 | 36 | 44 | 56 | 72 | 96;

interface BadgeCircleProps {
  color?: BadgeColor;
  size?: BadgeSize | number;
  children?: React.ReactNode;
  className?: string;
  ringed?: boolean;
  pulse?: boolean;
}

const SZ_CLASS: Record<number, string> = {
  28: "sz-28",
  36: "sz-36",
  44: "sz-44",
  56: "sz-56",
  72: "sz-72",
  96: "sz-96",
};

export function BadgeCircle({
  color = "mint",
  size = 44,
  children,
  className,
  ringed = false,
  pulse = false,
}: BadgeCircleProps) {
  const sizeClass = SZ_CLASS[size];
  return (
    <span
      className={cn(
        "insignia",
        `is-${color}`,
        ringed && "is-ringed",
        pulse && "animate-pulse-glow",
        sizeClass,
        className,
      )}
      style={sizeClass ? undefined : { width: size, height: size }}
    >
      {children}
    </span>
  );
}
