<template>
  <EnterExitSlide
    ref="enterExitSlide"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Welcome to {{ game.currentDestination?.name }}</h1>
    <h2 v-text="game.currentDestination?.description" />
    <h3
      v-text="
        `Population: ${game.currentDestination?.population.toLocaleString()}`
      "
    />
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
  import { ref } from 'vue';

  const enterExitSlide = ref<typeof EnterExitSlide>();
  const game = useGame();

  async function show() {
    await enterExitSlide.value?.begin(true);
    game.state = GameState.DESTINATION;
  }

  // TODO: Implement encounter when entering a town

  game.subscribe(show, GameState.DESTINATION_INTRO);
</script>

<style scoped>
  div {
    padding: 0 1rem;
    width: calc(100vw - 2rem) !important;
  }
</style>
