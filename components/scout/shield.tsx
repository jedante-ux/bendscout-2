import { useId } from "react";
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
  /** Foto de patrulla. Si se pasa, reemplaza la letra por la imagen recortada al silueta del escudo. */
  imageSrc?: string | null;
  imageAlt?: string;
}

/**
 * Patrulla shield. SVG-based so the geometry scales perfectly at any size and
 * the letter sits at the visual centroid (not just the bounding-box center —
 * the pointed bottom pulls the visual center upward).
 *
 * viewBox `64 x 72` matches the design system token. Outer path is filled with
 * the team-color gradient; an inner inset path provides the card surface. The
 * letter uses SVG `dominantBaseline="central"` + `textAnchor="middle"` and is
 * nudged up by ~2 units to compensate for the pointed bottom.
 */
export function Shield({
  letter,
  color = "mint",
  size = 64,
  className,
  imageSrc,
  imageAlt,
}: ShieldProps) {
  const reactId = useId();
  const idSafe = reactId.replace(/[:]/g, "");
  const gradId = `shield-grad-${idSafe}`;
  const clipId = `shield-clip-${idSafe}`;
  const height = Math.round(size * 1.125);
  const text = (letter || "?").slice(0, 2).toUpperCase();
  // Letters are wider than 1 char — scale down a bit if 2 chars.
  const fontSize = text.length > 1 ? 26 : 32;
  const hasImage = !!imageSrc;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 64 72"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      role="img"
      aria-label={imageAlt ?? `Escudo ${text}`}
      style={{ display: "inline-block", flex: "none" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0.7" y2="1">
          <stop
            offset="0"
            style={{ stopColor: `var(--c-${color})`, stopOpacity: 0.6 }}
          />
          <stop
            offset="1"
            style={{ stopColor: "var(--surface)", stopOpacity: 1 }}
          />
        </linearGradient>
        {hasImage ? (
          <clipPath id={clipId}>
            {/* Inner card silhouette — image is clipped to this so the outer rim is preserved */}
            <path d="M32 4 L60 14.5 L60 43.5 C60 57.5 47 66 32 67.8 C17 66 4 57.5 4 43.5 L4 14.5 Z" />
          </clipPath>
        ) : null}
      </defs>

      {/* Outer shield silhouette (colored border) */}
      <path
        d="M32 0 L64 12 L64 44 C64 60 48 70 32 72 C16 70 0 60 0 44 L0 12 Z"
        fill={`url(#${gradId})`}
      />

      {/* Inner card surface — same shape, inset ~3 units */}
      <path
        d="M32 4 L60 14.5 L60 43.5 C60 57.5 47 66 32 67.8 C17 66 4 57.5 4 43.5 L4 14.5 Z"
        fill="var(--card)"
      />

      {hasImage ? (
        <image
          href={imageSrc!}
          x="2"
          y="2"
          width="60"
          height="68"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        /* Letter — centered on visual middle of the shape (not box midpoint) */
        <text
          x="32"
          y="35"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-display)"
          fontWeight={800}
          fontSize={fontSize}
          fill={`var(--c-${color})`}
          style={{ letterSpacing: "-0.05em" }}
        >
          {text}
        </text>
      )}
    </svg>
  );
}
