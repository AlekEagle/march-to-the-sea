<template>
  <EnterExitSlide
    ref="proBanner"
    :duration="2000"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
    @cancelled="bodyClickEventHandler"
  >
    <img :src="professionalBanner" alt="Professional Banner" />
    <h1>Very Professional Video Games Incorporated ™©®</h1>
  </EnterExitSlide>
  <EnterExitSlide
    ref="iwcProd"
    :duration="2000"
    direction="right-to-left"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
    @cancelled="bodyClickEventHandler"
  >
    <h1>An Idiots with Computers ™©® Production</h1>
  </EnterExitSlide>
  <EnterExitSlide
    ref="awardWinning"
    :duration="2000"
    direction="left-to-right"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
    @cancelled="bodyClickEventHandler"
  >
    <h1>An Award Winning, Sad Excuse of a """"Video Game""""</h1>
  </EnterExitSlide>
  <EnterExitSlide
    ref="comingSoon"
    :duration="2000"
    direction="bottom-to-top"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
    @cancelled="bodyClickEventHandler"
  >
    <h1>Coming Soon To Theaters and LaserDisc...</h1>
  </EnterExitSlide>
  <EnterExitSlide
    ref="comingSoon2"
    :duration="2000"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
    @cancelled="bodyClickEventHandler"
  >
    <h1>...and also to your local Blockbuster Video™©®</h1>
  </EnterExitSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import EnterExitSlide from '@/components/Animation/EnterExitSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  // Other
  import professionalBanner from '@/assets/images/lol.jpg';
  import { ref, onMounted } from 'vue';

  let game = useGame(),
    proBanner = ref<typeof EnterExitSlide>(),
    iwcProd = ref<typeof EnterExitSlide>(),
    awardWinning = ref<typeof EnterExitSlide>(),
    comingSoon = ref<typeof EnterExitSlide>(),
    comingSoon2 = ref<typeof EnterExitSlide>(),
    shouldStop = ref(false);

  function bodyClickEventHandler() {
    // Stop the animation if the user clicks anywhere on the page.
    shouldStop.value = true;
  }

  async function begin() {
    if (game.isDebug) return;

    // Reset shouldStop
    shouldStop.value = false;
    // Listen for clicks on the page
    await proBanner.value?.begin(true);
    // If the animation was stopped early, continue.
    if (!shouldStop.value) await iwcProd.value?.begin(true);
    // If the animation was stopped early, continue.
    if (!shouldStop.value) await awardWinning.value?.begin(true);
    // If the animation was stopped early, continue.
    if (!shouldStop.value) await comingSoon.value?.begin(true);
    // If the animation was stopped early, continue.
    if (!shouldStop.value) await comingSoon2.value?.begin(true);
    // After the animation is finished, set the game state to the start menu.
    game.state = GameState.START_MENU;
  }

  onMounted(async () => {
    await begin();
  });
</script>

<style scoped>
  img {
    aspect-ratio: 16/9;
    width: 75vw;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    /* Scale the font size to match the width of the image regardless of the screen size */
    font-family: 'Comic Sans MS', 'Comic Sans', cursive;
    font-size: calc(75vw / 25.5);
    font-weight: 900;
    color: #ffffff;
    text-shadow: 0 0 6px #ffffff;
  }
</style>
