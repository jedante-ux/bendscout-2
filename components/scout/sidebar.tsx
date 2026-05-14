"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ProfileCard } from "./profile-card";
import { ScoutIcon, type ScoutIconName } from "./icon";
import { cn } from "@/lib/utils";
import type { AuthState } from "@/lib/auth/session";
import { logoutAction } from "@/app/(auth)/actions";

const NAV_ITEMS: Array<{ href: string; label: string; icon: ScoutIconName }> = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/profile", label: "Perfil", icon: "user" },
  { href: "/missions", label: "Misiones", icon: "flag" },
  { href: "/play", label: "Minijuegos", icon: "gamepad" },
  { href: "/leaderboard", label: "Ranking", icon: "chart" },
  { href: "/trophies", label: "Trofeos", icon: "trophy" },
  { href: "/teams", label: "Mi patrulla", icon: "users" },
  { href: "/shop", label: "Tienda", icon: "store" },
  { href: "/settings", label: "Ajustes", icon: "settings" },
];

export function Sidebar({ auth }: { auth: AuthState }) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r p-4 lg:flex"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--border)",
      }}
    >
      <Link
        href="/"
        className="mb-6 inline-flex px-2"
        aria-label="BendScout"
      >
        <Image
          src="/icons/logo.png"
          alt="BendScout"
          width={400}
          height={120}
          priority
          className="h-10 w-auto select-none"
        />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname?.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn("nav-item", active && "is-active")}
            >
              <ScoutIcon name={icon} size={18} className="icon" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 vstack" style={{ gap: 8 }}>
        {auth.authenticated && auth.profile ? (
          <>
            <ProfileCard
              name={auth.profile.display_name ?? auth.profile.username}
              rank="Explorador"
              level={Math.max(1, auth.profile.rank ?? 1)}
              xp={auth.profile.xp ?? 0}
              xpMax={Math.max(6000, (auth.profile.xp ?? 0) + 1000)}
              initials={initialsOf(auth.profile.display_name ?? auth.profile.username)}
              avatarUrl={auth.profile.avatar_url}
            />
            <form action={logoutAction}>
              <button
                type="submit"
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "flex-start", color: "var(--c-rose)" }}
              >
                <ScoutIcon name="logout" size={16} /> Cerrar sesión
              </button>
            </form>
          </>
        ) : (
          <GuestPanel />
        )}
      </div>
    </aside>
  );
}

function GuestPanel() {
  return (
    <div
      className="scout-card-flat"
      style={{ padding: 14, position: "relative" }}
    >
      <div className="hstack" style={{ marginBottom: 10, gap: 10 }}>
        <span
          className="avatar"
          style={{ width: 40, height: 40, fontSize: 14 }}
        >
          ?
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Modo invitado</div>
          <div className="t-caption text-muted">Sin progreso guardado</div>
        </div>
      </div>
      <Link
        href="/signup"
        className="btn btn-primary btn-sm"
        style={{ width: "100%" }}
      >
        Crear cuenta
      </Link>
      <Link
        href="/login"
        className="btn btn-ghost btn-sm"
        style={{ width: "100%", marginTop: 6 }}
      >
        Iniciar sesión
      </Link>
    </div>
  );
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
