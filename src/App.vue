<template>
  <InitialAnimation />
  <StartMenu />
  <AboutGame />
  <GameIntro />
  <RequisitionSupplies />
  <DestinationIntro />
  <DestinationActions />
  <MilitaryInfo />
  <MilitaryOptions />
  <UseMedkitAction />
  <MilitaryActionButtons />
  <div class="toast-container">
    <Transition name="toast">
      <div v-if="game.toast" class="toast">
        {{ game.toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
  // Vue Components
  import InitialAnimation from '@/components/UI/InitialAnimation.vue';
  import StartMenu from '@/components/UI/StartMenu.vue';
  import AboutGame from '@/components/UI/AboutGame.vue';
  import GameIntro from '@/components/UI/GameIntro.vue';
  import RequisitionSupplies from '@/components/UI/RequisitionSupplies.vue';
  import DestinationIntro from '@/components/UI/DestinationIntro.vue';
  import DestinationActions from '@/components/UI/DestinationActions.vue';
  import MilitaryInfo from '@/components/UI/Overlays/MilitaryInfo.vue';
  import MilitaryActionButtons from '@/components/UI/Overlays/MilitaryActionButtons.vue';
  import MilitaryOptions from '@/components/UI/Overlays/MilitaryOptions.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  import UseMedkitAction from './components/UI/Overlays/UseMedkitAction.vue';

  const game = useGame();

  if (!import.meta.env.DEV)
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
  }

  .toast {
    position: relative;
    bottom: 15px;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    z-index: 100;
    border-radius: 5px;
    border: 1px solid white;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.5s;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
  }

  .toast-enter-to,
  .toast-leave-from {
    opacity: 1;
  }
</style>
