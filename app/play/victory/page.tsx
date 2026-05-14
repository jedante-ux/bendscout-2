import { VictoryModal } from "@/components/scout/victory-modal";

export default function VictoryDemoPage() {
  return (
    <VictoryModal
      title="¡Victoria!"
      gameLabel="Memoria Visual nivel 3"
      xp={150}
      patrolBonus={50}
      time="00:42"
      livesLeft="3 / 3"
      isRecord
      primaryHref="/play/memoria"
      secondaryHref="/dashboard"
    />
  );
}
