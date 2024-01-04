<template>
  <MenuSlide
    ref="menuSlide"
    style="z-index: 2; position: absolute; background-color: #0c0c0c"
    full-size
  >
    <h1>Use Medkits</h1>
    <h2
      >You are going to use your medkits to heal
      {{ injuryToHeal }} soldiers.</h2
    >
    <button
      v-if="injuryToHeal === 'wounded'"
      @click="injuryToHeal = 'infected'"
    >
      Heal Infected Instead
    </button>
    <button
      v-if="injuryToHeal === 'infected'"
      @click="injuryToHeal = 'wounded'"
    >
      Heal Wounded Instead
    </button>

    <div class="amt-select">
      <span
        @click="decreaseSets"
        :class="`${medkitsToUse <= 1 ? 'disabled amt-btn' : 'amt-btn'}`"
        >-</span
      >
      <span
        class="amt"
        v-text="
          `${medkitsToUse.toLocaleString()} Medkit${
            medkitsToUse !== 1 ? 's' : ''
          }`
        "
      />
      <span
        @click="increaseSets"
        :class="`${
          medkitsToUse >= maxAllowedToUse ? 'disabled amt-btn' : 'amt-btn'
        }`"
        >+</span
      >
    </div>
    <div>
      <button @click="close">Cancel</button>
      <button @click="healMax" :disabled="maxAllowedToUse === 0"
        >Heal as Many as Possible</button
      >
      <button @click="heal" :disabled="maxAllowedToUse === 0">Heal</button>
    </div>
  </MenuSlide>
</template>

<script lang="ts" setup>
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  import { ref, computed } from 'vue';
  import useGame from '@/stores/GameStateMachine';
  import GameState from '@/data/GameState';

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame(),
    injuryToHeal = ref<'wounded' | 'infected'>('wounded'),
    medkitsToUse = ref(1),
    stateToRestore = ref<GameState>();

  const soldiersToHeal = computed(() => {
      if (injuryToHeal.value === 'wounded') {
        return game.union.wounded;
      } else {
        return game.union.infected;
      }
    }),
    maxAllowedToUse = computed(() => {
      return Math.min(game.supplies.medkits, soldiersToHeal.value);
    });

  function increaseSets() {
    if (maxAllowedToUse.value > medkitsToUse.value) medkitsToUse.value++;
  }

  function decreaseSets() {
    if (medkitsToUse.value > 1) medkitsToUse.value--;
  }

  function healMax() {
    game.useMedkits(maxAllowedToUse.value, injuryToHeal.value);
    close();
  }

  function heal() {
    game.useMedkits(medkitsToUse.value, injuryToHeal.value);
    close();
  }

  function close() {
    menuSlide.value?.hide();
    medkitsToUse.value = 1;
    game.state = stateToRestore.value!;
  }

  game.subscribe((state, oldState) => {
    if (state === GameState.USE_MEDKITS) {
      stateToRestore.value = oldState;
      menuSlide.value?.show();
    } else menuSlide.value?.hide();
  });
</script>

<style scoped>
  div.amt-select {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div.amt-select span:first-child {
    margin-top: -1.25rem;
  }

  span.amt-btn {
    font-size: 8rem;
    cursor: pointer;
    user-select: none;
  }

  span.amt {
    font-size: 4rem;
    margin: 0 3rem;
  }

  span.disabled {
    color: #2c2c2c;
    cursor: not-allowed;
  }

  div button {
    margin: 0 0.5rem;
  }
</style>
