import Link from "next/link";
import { Topbar } from "@/components/scout/topbar";
import { StatCard } from "@/components/scout/stat-card";
import { MissionCard } from "@/components/scout/mission-card";
import { FeaturedGame } from "@/components/scout/featured-game";
import { ActivityItem } from "@/components/scout/activity-item";
import { BadgeCircle } from "@/components/scout/badge-circle";
import { Shield } from "@/components/scout/shield";
import { ScoutIcon } from "@/components/scout/icon";
import { getAuthState } from "@/lib/auth/session";

export default async function DashboardPage() {
  const auth = await getAuthState();

  return (
    <>
      <Topbar auth={auth} notifications={3} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nivel actual"
          value="24"
          icon={<ScoutIcon name="leaf" size={18} />}
          iconColor="mint"
          progress={{ value: 4250, max: 6000 }}
        />
        <StatCard
          label="Insignias"
          value="12"
          link={{ label: "Ver todas →" }}
          footer={
            <div className="flex items-center gap-1.5">
              <BadgeCircle color="purple" size={28} ringed>
                <ScoutIcon name="starfill" size={14} stroke={2.2} />
              </BadgeCircle>
              <BadgeCircle color="rose" size={28} ringed>
                <ScoutIcon name="shield" size={14} />
              </BadgeCircle>
              <BadgeCircle color="gold" size={28} ringed>
                <ScoutIcon name="starfill" size={14} stroke={2.2} />
              </BadgeCircle>
              <BadgeCircle color="orange" size={28} ringed>
                <ScoutIcon name="flame" size={14} />
              </BadgeCircle>
              <BadgeCircle color="sky" size={28} ringed>
                <ScoutIcon name="leaf" size={14} />
              </BadgeCircle>
            </div>
          }
        />
        <StatCard
          label="Misiones activas"
          value="3"
          icon={<ScoutIcon name="flag" size={18} />}
          iconColor="mint"
          footer={
            <Link className="stat-link" href="/missions">
              Ver misiones →
            </Link>
          }
        />
        <StatCard
          label="Puntos Scout"
          value="8 560"
          icon={<ScoutIcon name="starfill" size={18} stroke={2.2} />}
          iconColor="gold"
          footer={
            <a className="stat-link" href="#">
              Historial →
            </a>
          }
        />
      </section>

      <section
        className="mt-5 grid gap-4"
        style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.4fr) minmax(0, 1.1fr)" }}
      >
        <div className="scout-card" style={{ padding: 18 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <span className="t-h3">Misiones activas</span>
            <Link
              className="t-caption"
              href="/missions"
              style={{ color: "var(--primary)", fontWeight: 700 }}
            >
              Ver todas →
            </Link>
          </div>
          <div className="vstack" style={{ gap: 10 }}>
            <MissionCard
              title="Explorador Digital"
              description="Completa 5 minijuegos"
              icon={<ScoutIcon name="leaf" size={18} />}
              iconColor="mint"
              xpReward={150}
              progress={{ value: 3, max: 5 }}
            />
            <MissionCard
              title="Coleccionista"
              description="Gana 3 insignias diferentes"
              icon={<ScoutIcon name="shield" size={18} />}
              iconColor="rose"
              xpReward={100}
              progress={{ value: 1, max: 3 }}
            />
            <MissionCard
              title="Racha Ganadora"
              description="Gana 10 minijuegos seguidos"
              icon={<ScoutIcon name="flame" size={18} />}
              iconColor="orange"
              xpReward={200}
              progress={{ value: 8, max: 10 }}
            />
          </div>
        </div>

        <div className="scout-card flex flex-col" style={{ padding: 18 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <span className="t-h3">Minijuego destacado</span>
            <Link
              className="t-caption"
              href="/play"
              style={{ color: "var(--primary)", fontWeight: 700 }}
            >
              Jugar ahora →
            </Link>
          </div>
          <FeaturedGame
            title="Desafío de Senderos"
            tagline="Pon a prueba tu agilidad y reflejos."
            imageSrc="/icons/fogata.png"
          />
          <div
            className="flex items-center justify-center"
            style={{ gap: 6, marginTop: 12 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  width: i === 0 ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  background:
                    i === 0 ? "var(--primary)" : "var(--border-hi)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="scout-card" style={{ padding: 18 }}>
          <div className="between" style={{ marginBottom: 10 }}>
            <span className="t-h3">Actividad reciente</span>
          </div>
          <ActivityItem
            title="¡Ganaste Desafío de Memoria!"
            delta="+150 XP"
            timeAgo="Hace 2h"
            icon={<ScoutIcon name="starfill" size={16} stroke={2.2} />}
            iconColor="purple"
          />
          <ActivityItem
            title="Nueva insignia: Explorador"
            delta="+100 XP"
            timeAgo="Hace 1d"
            icon={<ScoutIcon name="leaf" size={16} />}
            iconColor="mint"
          />
          <ActivityItem
            title="Completaste una misión"
            delta="+200 XP"
            timeAgo="Hace 2d"
            icon={<ScoutIcon name="flag" size={16} />}
            iconColor="orange"
          />
          <ActivityItem
            title="Nuevo récord en Laberinto"
            delta="+50 XP"
            timeAgo="Hace 3d"
            icon={<ScoutIcon name="trophy" size={16} />}
            iconColor="gold"
          />
        </div>
      </section>

      <section
        className="scout-card mt-5"
        style={{ padding: 18, position: "relative", overflow: "hidden" }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 40% 70% at 90% 50%, color-mix(in oklch, var(--c-mint) 18%, transparent), transparent 70%)",
          }}
        />
        <div
          className="relative grid items-center gap-6"
          style={{ gridTemplateColumns: "auto 1fr auto" }}
        >
          <Shield letter="L" color="mint" size={72} />
          <div>
            <div className="t-overline text-muted" style={{ marginBottom: 4 }}>
              Tu patrulla · #2 en el ranking
            </div>
            <div className="t-display-md" style={{ marginBottom: 6 }}>
              Lobos del Bosque
            </div>
            <div
              className="flex flex-wrap items-center"
              style={{ gap: 14 }}
            >
              <span className="hstack t-body-sm text-muted">
                <ScoutIcon name="users" size={16} /> 8 scouts
              </span>
              <span className="hstack t-body-sm text-muted">
                <ScoutIcon
                  name="flame"
                  size={16}
                  style={{ color: "var(--c-orange)" }}
                />{" "}
                Racha 12 días
              </span>
              <span className="hstack t-body-sm text-muted">
                <ScoutIcon
                  name="starfill"
                  size={16}
                  stroke={2.2}
                  style={{ color: "var(--accent)" }}
                />{" "}
                38 940 pts
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/teams" className="btn btn-secondary">
              Ver patrulla
            </Link>
            <button className="btn btn-primary">Retar otra tropa</button>
          </div>
        </div>
      </section>
    </>
  );
}
