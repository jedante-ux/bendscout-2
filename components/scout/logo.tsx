import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";

interface LogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  wordmarkSize?: number;
  withTagline?: boolean;
}

export function ScoutLogo({
  className,
  size = 40,
  withWordmark = true,
  wordmarkSize = 22,
  withTagline = false,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark size={size} />
      {withWordmark && (
        <div className="flex flex-col items-start gap-1">
          <span
            className="brand-wordmark"
            style={{ fontSize: `${wordmarkSize}px` }}
          >
            <span className="bend">Bend</span>
            <span className="scout">Scout</span>
          </span>
          {withTagline && (
            <span className="brand-tagline">
              <span>JUEGA</span>
              <span className="accent">·</span>
              <span>COMPITE</span>
              <span className="accent">·</span>
              <span>ESCULTISMO</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
