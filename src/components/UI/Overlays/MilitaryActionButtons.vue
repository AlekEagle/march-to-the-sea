<template>
  <button
    id="options"
    @click="game.state = GameState.OPTIONS"
    v-if="
      game.state === GameState.DESTINATION || game.state === GameState.MARCHING
    "
    >Options</button
  >
  <button
    id="info"
    @click="game.state = GameState.MILITARY_INFO"
    v-if="
      game.state === GameState.DESTINATION || game.state === GameState.MARCHING
    "
    >View Military Info</button
  >
</template>

<script lang="ts" setup>
  import useGame from '@/stores/GameStateMachine';
  import GameState from '@/data/GameState';

  const game = useGame();
</script>

<style scoped>
  button#options {
    position: absolute;
    bottom: 5px;
    left: 5px;
    z-index: 1;
  }

  button#info {
    position: absolute;
    bottom: 5px;
    right: 5px;
    z-index: 1;
  }
</style>
