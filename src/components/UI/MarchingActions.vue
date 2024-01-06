<template>
  <MenuSlide
    ref="menuSlide"
    full-size
    style="z-index: 2; position: absolute; background-color: #242424"
  >
    <!-- Absolutely positioned items -->
    <span id="destination">
      Departed from: {{ game.previousDestination.name }}
      <br />
      Traveling to: {{ game.nextDestination.name }}
      <br />
      {{ game.distanceToNextDestination.toLocaleString() }} Miles left
    </span>
    <span id="date">
      Date: {{ game.days.toString(false) }}
      <br />
      Days Passed: {{ game.days.elapsed }}
    </span>
    <!-- End of absolutely positioned items -->
    <h1>Marching Actions</h1>
    <div class="action-buttons">
      <button @click="game.march">March</button>
      <button @click="game.advanceDay">Rest</button>
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

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame();

  function show() {
    menuSlide.value?.show();
  }

  game.subscribe((state) => {
    if (state === GameState.MARCHING) show();
    else menuSlide.value?.hide();
  });
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

  div.action-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: fit-content;
    margin: 0 auto;
  }

  div.action-buttons button {
    width: 100%;
  }
</style>
