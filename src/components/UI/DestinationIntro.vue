<template>
  <EnterExitSlide ref="enterExitSlide" cancellable>
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
  import EnterExitSlide from '@/components/Animation/EnterExitSlide.vue';
  import useGame from '@/stores/GameStateMachine';
  import GameState from '@/data/GameState';
  import { ref } from 'vue';

  const enterExitSlide = ref<typeof EnterExitSlide>();
  const game = useGame();

  async function show() {
    await enterExitSlide.value?.begin();
    game.state = GameState.DESTINATION;
  }

  // TODO: Implement encounter when entering a town

  game.subscribe(show, GameState.DESTINATION_INTRO);
</script>

<style scoped>
  div {
    padding: 0 1rem;
  }
</style>
