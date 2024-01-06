<template>
  <MenuSlide
    ref="menuSlide"
    style="z-index: 10; position: absolute; background-color: #0c0c0c"
    full-size
  >
    <h1>Daily History</h1>
    <div class="header-action-buttons">
      <button :disabled="dayObserving === 0" @click="dayObserving--"
        >Prev Day</button
      >
      <button @click="hide">Close</button>
      <button
        :disabled="dayObserving >= game.dailyResults.length - 1"
        @click="dayObserving++"
        >Next Day</button
      >
    </div>
    <template v-if="currentDayObserving">
      <h2 v-text="observingDayDate?.toString()" />
      <div class="history">
        <div class="history-item" v-if="currentDayObserving[1].day">
          <h3>End of day</h3>
          <p>
            The soldiers ate
            {{ currentDayObserving[1].day.fedSoldiers }} ration{{
              currentDayObserving[1].day.fedSoldiers === 1 ? '' : 's'
            }}.
            <br />
            {{ currentDayObserving[1].day.deadInfectedSoldiers }} died due to an
            infection.
          </p>
        </div>
      </div>
    </template>
    <h2 v-else>There isn't any daily history yet...</h2>
  </MenuSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  // Stores
  import useGame, { DailyResultsRecord } from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  // Other
  import { ref, computed } from 'vue';
  import GameDate from '@/data/GameDate';

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame(),
    dayObserving = ref<number>(game.days.elapsed),
    stateToRestore = ref<GameState>();

  const currentDayObserving = computed<DailyResultsRecord | null>(() => {
      return game.dailyResults[dayObserving.value];
    }),
    observingDayDate = computed<GameDate | null>(() => {
      if (currentDayObserving.value === null) return null;
      return GameDate.fromState(currentDayObserving.value[0]);
    });

  function show() {
    menuSlide.value?.show();
    dayObserving.value = game.days.elapsed;
  }

  function hide() {
    menuSlide.value?.hide();
    game.state = stateToRestore.value!;
  }

  game.subscribe((state, oldState) => {
    if (state === GameState.DAILY_HISTORY) {
      stateToRestore.value = oldState;
      show();
    } else if (oldState === GameState.DAILY_HISTORY) {
      menuSlide.value?.hide();
    }
  });
</script>

<style scoped>
  div.header-action-buttons button {
    margin: 0 0.5rem;
  }
</style>