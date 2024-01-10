<template>
  <MenuSlide ref="menuSlide">
    <h1>A March to the Sea</h1>
    <p>
      A March to the Sea is a game similar to the classic Oregon Trail, but set
      during the American Civil War. You play as Union General William T.
      Sherman as he leads his army on a march through the South. You must manage
      your supplies, your soldiers, and your reputation as you march through the
      Confederacy.
    </p>
    <button @click="close">Back</button>
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

  async function close() {
    await menuSlide.value?.hide();
    game.state = GameState.START_MENU;
  }

  function show() {
    menuSlide.value?.show();
  }

  game.subscribe(show, GameState.ABOUT);
</script>

<style scoped>
  p {
    font-size: 1.5rem;
    margin: 0 4rem 1rem;
  }
</style>
