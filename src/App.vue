<template>
  <InitialAnimation ref="initAnim" />
  <StartMenu @start="startGame" @about="showAbout" ref="startMenu" />
  <AboutGame @close="hideAbout" ref="aboutGame" />
  <GameIntro ref="gameIntro" />
  <Transition name="speech-box">
    <div v-if="gameState.speechBox" class="speech-box">
      <h3 v-text="gameState.speechBoxTitle" />
      <p v-text="gameState.speechBoxTextToDisplay" />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  // Vue Components
  import InitialAnimation from '@/components/UI/InitialAnimation.vue';
  import StartMenu from '@/components/UI/StartMenu.vue';
  import AboutGame from '@/components/UI/AboutGame.vue';
  import GameIntro from '@/components/UI/GameIntro.vue';
  // Stores
  import useGameState, { GameState } from '@/stores/GameStateMachine';
  // Other
  import { ref, onMounted } from 'vue';

  const gameState = useGameState(),
    initAnim = ref<typeof InitialAnimation>(),
    startMenu = ref<typeof StartMenu>(),
    aboutGame = ref<typeof AboutGame>(),
    gameIntro = ref<typeof GameIntro>();

  onMounted(async () => {
    // Begin the initial animation.
    await initAnim.value?.begin();
    // Once the initial animation is finished, change the game state to the start menu.
    gameState.state = GameState.START_MENU;
    await startMenu.value?.show();
  });

  if (!import.meta.env.DEV)
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    });

  async function startGame() {
    await startMenu.value?.hide();
    gameState.state = GameState.GAME_INTRO;
    await gameIntro.value?.show();
  }

  async function showAbout() {
    await startMenu.value?.hide();
    gameState.state = GameState.ABOUT;
    await aboutGame.value?.show();
  }

  async function hideAbout() {
    await aboutGame.value?.hide();
    gameState.state = GameState.START_MENU;
    await startMenu.value?.show();
  }
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
