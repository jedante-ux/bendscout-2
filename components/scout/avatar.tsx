import { cn } from "@/lib/utils";

type AvatarColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface AvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
  color?: AvatarColor;
  className?: string;
}

export function Avatar({
  name,
  size = 44,
  ring = false,
  color,
  className,
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn("avatar", ring && "avatar-ring", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: color
          ? `linear-gradient(140deg, color-mix(in oklch, var(--c-${color}) 50%, var(--surface-2)), var(--surface))`
          : undefined,
      }}
    >
      {initials}
    </span>
  );
}
