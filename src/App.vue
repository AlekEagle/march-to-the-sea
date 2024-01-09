<template>
  <AboutGame />
  <DailyResultInfo />
  <DestinationActions />
  <DestinationIntro />
  <EncounterActions />
  <EncounterIntro />
  <GameIntro />
  <InitialAnimation />
  <MarchingActions />
  <MilitaryActionButtons />
  <MilitaryInfo />
  <MilitaryOptions />
  <RequisitionSupplies />
  <StartMenu />
  <UseMedkitAction />
</template>

<script lang="ts" setup>
  // Vue Components
  import AboutGame from '@/components/UI/AboutGame.vue';
  import DailyResultInfo from '@/components/UI/Overlays/DailyResultInfo.vue';
  import DestinationActions from '@/components/UI/DestinationActions.vue';
  import DestinationIntro from '@/components/UI/DestinationIntro.vue';
  import EncounterActions from '@/components/UI/Overlays/EncounterActions.vue';
  import EncounterIntro from '@/components/UI/EncounterIntro.vue';
  import GameIntro from '@/components/UI/GameIntro.vue';
  import InitialAnimation from '@/components/UI/InitialAnimation.vue';
  import MarchingActions from '@/components/UI/MarchingActions.vue';
  import MilitaryActionButtons from '@/components/UI/Overlays/MilitaryActionButtons.vue';
  import MilitaryInfo from '@/components/UI/Overlays/MilitaryInfo.vue';
  import MilitaryOptions from '@/components/UI/Overlays/MilitaryOptions.vue';
  import RequisitionSupplies from '@/components/UI/RequisitionSupplies.vue';
  import StartMenu from '@/components/UI/StartMenu.vue';
  import UseMedkitAction from '@/components/UI/Overlays/UseMedkitAction.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  // Other
  import { onMounted } from 'vue';

  let game = useGame();

  onMounted(async () => {
    if (game.isDebug) {
      game.supplies.medkits =
        game.supplies.powder =
        game.supplies.food =
        game.supplies.bullets =
          100_000_000_000;
      game.state = GameState.DESTINATION;
    }
  });

  if (!game.isDebug)
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    });
</script>
