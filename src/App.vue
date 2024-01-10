<template>
  <AboutGame />
  <DailyResultInfo />
  <DestinationActions />
  <DestinationIntro />
  <EncounterActions />
  <EncounterIntro />
  <EncounterResult />
  <EndScreen />
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
  import AboutGame from '@/components/UI/Pages/AboutGame.vue';
  import DailyResultInfo from '@/components/UI/Overlays/DailyResultInfo.vue';
  import DestinationActions from '@/components/UI/Pages/DestinationActions.vue';
  import DestinationIntro from '@/components/UI/Pages/DestinationIntro.vue';
  import EncounterActions from '@/components/UI/Pages/EncounterActions.vue';
  import EncounterIntro from '@/components/UI/Pages/EncounterIntro.vue';
  import EncounterResult from '@/components/UI/Pages/EncounterResult.vue';
  import EndScreen from '@/components/UI/Pages/EndScreen.vue';
  import GameIntro from '@/components/UI/Pages/GameIntro.vue';
  import InitialAnimation from '@/components/UI/Pages/InitialAnimation.vue';
  import MarchingActions from '@/components/UI/Pages/MarchingActions.vue';
  import MilitaryActionButtons from '@/components/UI/Overlays/MilitaryActionButtons.vue';
  import MilitaryInfo from '@/components/UI/Overlays/MilitaryInfo.vue';
  import MilitaryOptions from '@/components/UI/Overlays/MilitaryOptions.vue';
  import RequisitionSupplies from '@/components/UI/Pages/RequisitionSupplies.vue';
  import StartMenu from '@/components/UI/Pages/StartMenu.vue';
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

  function preventUnload(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }

  function removePreventUnload() {
    window.removeEventListener('beforeunload', preventUnload);
  }

  if (!game.isDebug) window.addEventListener('beforeunload', preventUnload);

  game.subscribe(removePreventUnload, GameState.END);
</script>
