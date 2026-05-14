import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

const SCOUT_ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c0-2.5 1.3-5 4-5s2 1.5 2 5"/>',
  gamepad:
    '<path d="M6 12h4M8 10v4"/><circle cx="15" cy="11" r="0.9" fill="currentColor"/><circle cx="17" cy="13" r="0.9" fill="currentColor"/><rect x="2" y="7" width="20" height="11" rx="4"/>',
  chart:
    '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  trophy:
    '<path d="M6 4h12v3a6 6 0 0 1-12 0V4Z"/><path d="M6 6H3a3 3 0 0 0 3 3"/><path d="M18 6h3a3 3 0 0 1-3 3"/><path d="M9 20h6"/><path d="M12 14v6"/>',
  store:
    '<path d="M4 8h16l-1 4H5L4 8Z"/><path d="M5 12v8h14v-8"/><path d="M4 8 5 4h14l1 4"/><path d="M9 20v-5h6v5"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  chevronl: '<path d="m15 6-6 6 6 6"/>',
  chevrond: '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  arrow: '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
  filter: '<path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"/>',
  share:
    '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.5 10.5 7-4"/><path d="m8.5 13.5 7 4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  history:
    '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/>',
  play: '<path d="M7 5v14l12-7L7 5Z" fill="currentColor"/>',
  pause: '<path d="M7 5v14"/><path d="M17 5v14"/>',
  compass:
    '<circle cx="12" cy="12" r="9"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/><path d="m15.5 8.5-3 4.5-3-1.5 6-3Z" fill="currentColor"/>',
  leaf: '<path d="M5 19c0-9 7-14 16-14 0 9-5 16-14 16-3 0-2-1-2-2Z"/><path d="M5 19 16 8"/>',
  flag: '<path d="M5 4v17"/><path d="M5 4h11l-2 4 2 4H5"/>',
  flame:
    '<path d="M12 3c1 3 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 1-5 0 1 1 2 2 2 0-2 0-4 1-6Z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>',
  shieldcheck:
    '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m8.5 12.5 2.5 2.5 4.5-4.5"/>',
  star: '<path d="m12 3 2.6 5.4 5.9.6-4.5 4 1.3 5.8L12 16l-5.3 2.8 1.3-5.8-4.5-4 5.9-.6L12 3Z"/>',
  starfill:
    '<path d="m12 3 2.6 5.4 5.9.6-4.5 4 1.3 5.8L12 16l-5.3 2.8 1.3-5.8-4.5-4 5.9-.6L12 3Z" fill="currentColor"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 0 5h5a2.5 2.5 0 0 1 0 5h-5"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
  pin: '<path d="M12 22s7-8 7-13a7 7 0 0 0-14 0c0 5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/>',
  tent: '<path d="M12 4 3 20h18L12 4Z"/><path d="m12 4 0 16"/><path d="M9 20l3-5 3 5"/>',
  knot: '<path d="M6 8c4-4 8 4 12 0"/><path d="M6 16c4 4 8-4 12 0"/><circle cx="12" cy="12" r="2"/>',
  heart:
    '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>',
  heartfill:
    '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" fill="currentColor"/>',
  lightbulb:
    '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  sparkle:
    '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6 6 2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>',
  desktop:
    '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  tablet:
    '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/>',
  mobile: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
} as const;

export type ScoutIconName = keyof typeof SCOUT_ICONS;

interface ScoutIconProps
  extends Omit<SVGProps<SVGSVGElement>, "name" | "stroke"> {
  name: ScoutIconName;
  size?: number;
  stroke?: number;
}

export function ScoutIcon({
  name,
  size = 20,
  stroke = 2,
  className,
  ...rest
}: ScoutIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("icon", className)}
      dangerouslySetInnerHTML={{ __html: SCOUT_ICONS[name] }}
      {...rest}
    />
  );
}

export { SCOUT_ICONS };
