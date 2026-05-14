import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function BrandMark({ size = 40, className, priority }: BrandMarkProps) {
  return (
    <Image
      src="/icons/logo-mark.png"
      alt="BendScout"
      width={size}
      height={size}
      priority={priority}
      className={cn("brand-mark select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
