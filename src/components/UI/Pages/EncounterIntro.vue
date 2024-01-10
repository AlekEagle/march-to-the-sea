<template>
  <EnterExitSlide
    ref="enterExitSlide"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Get ready to fight!</h1>
    <h2>{{ game.encounter!.union.engaged.toLocaleString() }} Union soldiers</h2>
    <img src="@/assets/images/vs.png" alt="vs" />
    <h2>
      Roughly
      {{
        (
          Math.round(game.encounter!.confederate.engaged / 10) * 10
        ).toLocaleString()
      }}
      Confederate soldiers
    </h2>
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
    game.state = GameState.ENCOUNTER;
  }

  game.subscribe(show, GameState.ENCOUNTER_INTRO);
</script>

<style scoped>
  img {
    height: 5rem;
  }
</style>
