<template>
  <MenuSlide ref="menuSlide" full-size>
    <!-- Absolutely positioned items -->
    <span id="destination">
      Currently in: {{ game.currentDestination?.name }}
      <br />
      Population: {{ game.currentDestination?.population.toLocaleString() }}
    </span>
    <span id="date">
      Date: {{ game.days.toString(false) }}
      <br />
      Days Passed: {{ game.days.elapsed }}
    </span>
    <!-- End of absolutely positioned items -->
    <h1>Available Actions</h1>
  </MenuSlide>
</template>

<script lang="ts" setup>
  import MenuSlide from '../Animation/MenuSlide.vue';
  import { ref } from 'vue';
  import useGame from '@/stores/GameStateMachine';
  import GameState from '@/data/GameState';

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame();

  async function show() {
    await menuSlide.value?.show();
  }

  game.subscribe(show, GameState.DESTINATION);
</script>

<style scoped>
  #destination {
    position: absolute;
    top: 15px;
    left: 15px;
    text-align: left;
  }

  #date {
    position: absolute;
    top: 15px;
    right: 15px;
    text-align: right;
  }
</style>
