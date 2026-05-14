import { cn } from "@/lib/utils";
import { XpBar } from "./xp-bar";

interface ProfileCardProps {
  name: string;
  rank?: string;
  level: number;
  xp: number;
  xpMax: number;
  initials?: string;
  avatarUrl?: string | null;
  className?: string;
}

export function ProfileCard({
  name,
  rank = "Explorador",
  level,
  xp,
  xpMax,
  initials = "SM",
  avatarUrl,
  className,
}: ProfileCardProps) {
  return (
    <div className={cn("scout-card-flat p-3", className)} style={{ padding: 12 }}>
      <div className="hstack" style={{ gap: 12 }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            width={56}
            height={56}
            className="avatar-ring select-none"
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <span className="avatar avatar-ring sz-56">{initials}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="t-h3 truncate">{name}</div>
          <div className="t-caption text-muted">
            Nivel {level} · {rank}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <XpBar value={xp} max={xpMax} />
        <div className="between" style={{ marginTop: 6 }}>
          <span className="t-mono text-muted" style={{ fontSize: 11 }}>
            {xp.toLocaleString("es")} / {xpMax.toLocaleString("es")} XP
          </span>
        </div>
      </div>
    </div>
  );
}
