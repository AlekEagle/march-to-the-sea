<template>
  <MenuSlide ref="menuSlide">
    <h1>A March to the Sea</h1>
    <h2>The Game</h2>

    <div class="button-container">
      <button @click="start">Play</button>
      <button @click="about">About</button>
    </div>
  </MenuSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  // Other
  import { ref } from 'vue';

  const game = useGame(),
    menuSlide = ref<typeof MenuSlide>();

  function show() {
    menuSlide.value?.show();
  }

  async function start() {
    await menuSlide.value?.hide();
    game.state = GameState.GAME_INTRO;
  }

  async function about() {
    await menuSlide.value?.hide();
    game.state = GameState.ABOUT;
  }

  game.subscribe(show, GameState.START_MENU);
</script>
