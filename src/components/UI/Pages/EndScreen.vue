<template>
  <EnterExitSlide
    ref="enterExitSlide"
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Game Over</h1>
    <h2>{{ gameOverReasonMessage }}</h2>
    <img v-if="isPositive" src="@/assets/images/thumb.png" />
    <br v-if="isPositive" />
    <button @click="replay">Play Again?</button>
  </EnterExitSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import EnterExitSlide from '@/components/Animation/EnterExitSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  import { GameOverReason } from '@/stores/GameStateMachine';
  // Other
  import { ref, computed } from 'vue';

  // Component Refs
  const enterExitSlide = ref<typeof EnterExitSlide>();
  // Stores
  const game = useGame();
  // Computed Values
  const gameOverReasonMessage = computed(() => {
      switch (game.gameOverReason) {
        case GameOverReason.INSUFFICIENT_UNITS:
          return 'You have lost too many units and will be overwhelmed against the Confederacy.';
        case GameOverReason.SAVANNAH_DEFEAT:
          return 'You have lost the Battle of Savannah.';
        case GameOverReason.SAVANNAH_VICTORY:
          return 'You have won the Battle of Savannah and the Confederacy has surrendered.';
        case GameOverReason.INSUFFICIENT_MORALE:
          return 'Your soldiers have lost too much morale and have deserted.';
        default:
          return 'I am horribly broken. Nothing makes sense. I am in pain. I am dying.';
      }
    }),
    isPositive = computed(() => {
      return game.gameOverReason === GameOverReason.SAVANNAH_VICTORY;
    });

  function replay() {
    window.location.reload();
  }

  async function show() {
    await enterExitSlide.value?.begin(true);
  }

  game.subscribe(show, GameState.END);
</script>
