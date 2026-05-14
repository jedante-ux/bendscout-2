import { cn } from "@/lib/utils";

type ShieldColor =
  | "mint"
  | "gold"
  | "rose"
  | "purple"
  | "orange"
  | "sky"
  | "teal";

interface ShieldProps {
  letter: string;
  color?: ShieldColor;
  size?: number;
  className?: string;
}

export function Shield({
  letter,
  color = "mint",
  size = 64,
  className,
}: ShieldProps) {
  const height = size * 1.125;
  return (
    <span
      className={cn("shield", className)}
      style={{
        width: size,
        height,
        fontSize: size * 0.45,
        background: `linear-gradient(155deg, color-mix(in oklch, var(--c-${color}) 60%, var(--surface-2)), var(--surface))`,
      }}
    >
      <span
        style={{
          color: `var(--c-${color})`,
          textShadow: "0 2px 0 oklch(0 0 0 / 0.3)",
        }}
      >
        {letter}
      </span>
    </span>
  );
}
