import { InsigniaModal } from "@/components/scout/insignia-modal";

export default function InsigniaDemoPage() {
  return (
    <InsigniaModal
      name="Explorador"
      description="Has completado tu primer sendero y descubierto rincones que pocos conocen."
      rarity="Insignia rara · Top 8% scouts"
      percentText="Solo el 8% de los scouts tiene esta insignia 🌿"
      xp={300}
      points={500}
      patrolBonus={1000}
      primaryHref="/profile"
    />
  );
}
