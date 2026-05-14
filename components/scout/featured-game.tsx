import Image from "next/image";
import { ScoutIcon } from "./icon";
import { cn } from "@/lib/utils";

interface FeaturedGameProps {
  title: string;
  tagline: string;
  emoji?: string;
  imageSrc?: string;
  href?: string;
  className?: string;
}

export function FeaturedGame({
  title,
  tagline,
  emoji,
  imageSrc,
  className,
}: FeaturedGameProps) {
  return (
    <div className={cn("scout-card group relative overflow-hidden", className)}>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.30 0.05 155), oklch(0.20 0.03 155))",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, oklch(0.78 0.16 145 / 0.4), transparent 24%), radial-gradient(circle at 78% 18%, oklch(0.78 0.16 145 / 0.3), transparent 20%), radial-gradient(circle at 62% 88%, oklch(0.65 0.16 160 / 0.35), transparent 26%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, oklch(0.16 0.04 155) 0%, transparent 50%)",
          }}
        />

        {imageSrc ? (
          <div className="absolute inset-0 grid place-items-center">
            <Image
              src={imageSrc}
              alt={title}
              width={260}
              height={260}
              className="animate-float h-[72%] w-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>
        ) : emoji ? (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[140px] leading-none drop-shadow-2xl">
            <span className="animate-float inline-block">{emoji}</span>
          </div>
        ) : null}

        <svg
          aria-hidden
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          style={{ height: "30%" }}
        >
          <path
            d="M0 60 L40 30 L70 50 L110 20 L150 45 L200 15 L240 40 L290 25 L340 50 L400 30 L400 80 L0 80 Z"
            fill="oklch(0.18 0.06 155)"
            opacity="0.9"
          />
          <path
            d="M0 70 L60 45 L100 60 L140 35 L180 55 L220 30 L260 50 L320 35 L380 55 L400 50 L400 80 L0 80 Z"
            fill="oklch(0.16 0.04 155)"
          />
        </svg>
      </div>

      <div className="p-5">
        <h3 className="t-h2" style={{ margin: 0 }}>
          {title}
        </h3>
        <p className="t-body-sm text-muted" style={{ marginTop: 4 }}>
          {tagline}
        </p>
        <button type="button" className="btn btn-primary w-full" style={{ marginTop: 16 }}>
          <ScoutIcon name="play" size={14} />
          Jugar ahora
        </button>
      </div>
    </div>
  );
}
