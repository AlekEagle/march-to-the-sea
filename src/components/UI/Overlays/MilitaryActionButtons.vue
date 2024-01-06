<template>
  <Transition name="sliding-buttons">
    <div
      v-if="
        game.state === GameState.DESTINATION ||
        game.state === GameState.MARCHING
      "
    >
      <button id="options" @click="game.state = GameState.OPTIONS">
        Options
      </button>
      <button id="info" @click="game.state = GameState.MILITARY_INFO">
        View Military Info
      </button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';

  const game = useGame();
</script>

<style scoped>
  div {
    position: absolute;
    bottom: 0;
    z-index: 5;
    width: calc(100vw - 1rem);
    margin: 0.5rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }

  div button {
    pointer-events: all;
  }

  .sliding-buttons-enter-active {
    animation: buttons-slide 1s ease-in-out;
  }

  .sliding-buttons-leave-active {
    animation: buttons-slide 1s ease-in-out reverse;
  }

  @keyframes buttons-slide {
    0% {
      width: 200%;
    }
    45% {
      width: 200%;
    }
    100% {
      width: calc(100vw - 1rem);
    }
  }
</style>
