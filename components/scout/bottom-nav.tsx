"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScoutIcon, type ScoutIconName } from "./icon";
import { cn } from "@/lib/utils";

const ITEMS: Array<{ href: string; label: string; icon: ScoutIconName }> = [
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/missions", label: "Misiones", icon: "flag" },
  { href: "/play", label: "Jugar", icon: "gamepad" },
  { href: "/leaderboard", label: "Ranking", icon: "chart" },
  { href: "/shop", label: "Tienda", icon: "store" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{
        background:
          "color-mix(in oklch, var(--sidebar) 92%, transparent)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <ul className="tabbar mx-auto max-w-md pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {ITEMS.map(({ href, label, icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname?.startsWith(href + "/"));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn("tabbar-item", active && "is-active")}
              >
                <ScoutIcon name={icon} size={22} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
