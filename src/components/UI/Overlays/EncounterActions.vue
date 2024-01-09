<template>
  <MenuSlide
    ref="menuSlide"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Encounter Actions</h1>
    <div class="grid">
      <div class="grid-section">
        <h2>Union</h2>
        <h3>Engaged: {{ game.encounter!.union.engaged.toLocaleString() }}</h3>
        <h3>
          Remaining:
          {{
            (
              game.encounter!.union.engaged -
              (game.encounter!.union.casualties + game.encounter!.union.wounded)
            ).toLocaleString()
          }}
        </h3>
        <h3
          >Casualties:
          {{ game.encounter!.union.casualties.toLocaleString() }}</h3
        >
        <h3>Wounded: {{ game.encounter!.union.wounded.toLocaleString() }}</h3>
      </div>
      <div class="grid-section">
        <button @click="game.stepEncounter">Continue Fight</button>
      </div>
      <div class="grid-section">
        <h2>Confederacy</h2>
        <h3>
          Engaged: ~{{
            (
              Math.round(game.encounter!.confederate.engaged / 10) * 10
            ).toLocaleString()
          }}
        </h3>
        <h3>
          Remaining: ~{{
            (
              Math.round(
                (game.encounter!.confederate.engaged -
                  game.encounter!.confederate.casualties) /
                  10,
              ) * 10
            ).toLocaleString()
          }}
        </h3>
        <h3>
          Casualties:
          {{ game.encounter!.confederate.casualties.toLocaleString() }}
        </h3>
      </div>
    </div>
  </MenuSlide>
</template>

<script lang="ts" setup>
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  import useGame from '@/stores/GameStateMachine';
  import GameState from '@/data/GameState';
  import { ref } from 'vue';

  const menuSlide = ref<typeof MenuSlide>();
  const game = useGame();

  function show() {
    menuSlide.value?.show();
  }

  game.subscribe(show, GameState.ENCOUNTER);
</script>

<style scoped>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    height: 100%;
  }

  .grid-section {
    border: 1px solid black;
  }
</style>
