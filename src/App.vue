<template>
  <InitialAnimation />
  <StartMenu />
  <AboutGame />
  <GameIntro />
  <RequisitionSupplies />
  <MarchingActions />
  <DestinationIntro />
  <DestinationActions />
  <MilitaryInfo />
  <DailyResultInfo />
  <MilitaryOptions />
  <UseMedkitAction />
  <MilitaryActionButtons />
</template>

<script lang="ts" setup>
  // Vue Components
  import InitialAnimation from '@/components/UI/InitialAnimation.vue';
  import StartMenu from '@/components/UI/StartMenu.vue';
  import AboutGame from '@/components/UI/AboutGame.vue';
  import GameIntro from '@/components/UI/GameIntro.vue';
  import RequisitionSupplies from '@/components/UI/RequisitionSupplies.vue';
  import MarchingActions from '@/components/UI/MarchingActions.vue';
  import DestinationIntro from '@/components/UI/DestinationIntro.vue';
  import DestinationActions from '@/components/UI/DestinationActions.vue';
  import MilitaryInfo from '@/components/UI/Overlays/MilitaryInfo.vue';
  import MilitaryActionButtons from '@/components/UI/Overlays/MilitaryActionButtons.vue';
  import MilitaryOptions from '@/components/UI/Overlays/MilitaryOptions.vue';
  import UseMedkitAction from '@/components/UI/Overlays/UseMedkitAction.vue';
  import DailyResultInfo from '@/components/UI/Overlays/DailyResultInfo.vue';
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

<style scoped>
  .toast-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    flex-direction: column;
  }

  .toast {
    display: inline-block;
    position: relative;
    bottom: -100px;
    padding: 1rem;
    margin: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    z-index: 100;
    border-radius: 5px;
    border: 1px solid white;
    backdrop-filter: blur(5px);
    pointer-events: all;
    cursor: pointer;
    transition: bottom 0.5s;
  }

  .toast-enter-from,
  .toast-leave-to {
    bottom: -100px;
  }

  .toast-enter-to,
  .toast-leave-from {
    bottom: 0;
  }
</style>
