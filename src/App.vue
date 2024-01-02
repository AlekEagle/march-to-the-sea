<template>
  <InitialAnimation />
  <StartMenu />
  <AboutGame />
  <GameIntro />
  <RequisitionSupplies />
  <DestinationIntro />
  <DestinationActions />
  <Transition name="speech-box">
    <div v-if="game.speechBox" class="speech-box">
      <h3 v-text="game.speechBoxTitle" />
      <p v-text="game.speechBoxTextToDisplay" />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  // Vue Components
  import InitialAnimation from '@/components/UI/InitialAnimation.vue';
  import StartMenu from '@/components/UI/StartMenu.vue';
  import AboutGame from '@/components/UI/AboutGame.vue';
  import GameIntro from '@/components/UI/GameIntro.vue';
  import RequisitionSupplies from './components/UI/RequisitionSupplies.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  import DestinationIntro from './components/UI/DestinationIntro.vue';
  import DestinationActions from './components/UI/DestinationActions.vue';

  const game = useGame();

  if (!import.meta.env.DEV)
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    });
</script>

<style scoped>
  div.speech-box {
    display: grid;
    grid-template-rows: 1fr 3fr;
    background-color: #171717;
    border: 1px solid white;
    padding: 1rem;
    margin: 1rem;
    border-radius: 0.5rem;
    bottom: 0;
    transition: bottom;
    width: 95vw;
    max-width: 500px;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    height: 100px;
    transition: bottom 0.5s ease-in-out;
    text-align: left;
  }

  div.speech-box h3 {
    margin: 0;
    grid-row: 1;
  }

  div.speech-box p {
    margin: 0;
    grid-row: 2;
  }

  .speech-box-enter-to,
  .speech-box-leave-from {
    bottom: 0;
  }

  .speech-box-enter-from,
  .speech-box-leave-to {
    bottom: -155px;
  }
</style>
