<template>
  <MenuSlide
    ref="menuSlide"
    style="z-index: 10; position: absolute; background-color: #0c0c0c"
    full-size
  >
    <h1>Daily History</h1>
    <div class="header-action-buttons">
      <button :disabled="dayObserving <= 0" @click="dayObserving--"
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
          <!-- Rations for units -->
          <p
            v-text="
              `Each soldier ate ${
                currentDayObserving[1].day.fedSoldiers
              } ration${
                currentDayObserving[1].day.fedSoldiers === 1 ? '' : 's'
              }.`
            "
          />
          <!-- Starved units -->
          <span
            v-if="
              currentDayObserving[1].day.starvedUnits.alive +
                currentDayObserving[1].day.starvedUnits.exhausted +
                currentDayObserving[1].day.starvedUnits.infected +
                currentDayObserving[1].day.starvedUnits.wounded !==
              0
            "
          >
            Some of your soldiers died of starvation:
            <ul class="starved">
              <li
                v-for="[key, value] in Object.entries(
                  currentDayObserving[1].day.starvedUnits,
                ).filter(([, value]) => value > 0)"
              >
                {{ key.charAt(0).toLocaleUpperCase() + key.slice(1) }}:
                {{ value }}
              </li>
            </ul>
          </span>
          <!-- Recovered exhausted units -->
          <p v-if="currentDayObserving[1].day.recoveredExhaustedSoldiers > 0">
            {{
              currentDayObserving[1].day.recoveredExhaustedSoldiers.toLocaleString()
            }}
            of your exhausted soldiers recovered.
          </p>
          <!-- Infected wounded units -->
          <p v-if="currentDayObserving[1].day.infectedWoundedSoldiers > 0">
            {{
              currentDayObserving[1].day.infectedWoundedSoldiers.toLocaleString()
            }}
            of your wounded soldiers developed an infection.
          </p>
          <!-- Recovered wounded units -->
          <p v-if="currentDayObserving[1].day.recoveredWoundedSoldiers > 0">
            {{
              currentDayObserving[1].day.recoveredWoundedSoldiers.toLocaleString()
            }}
            of your wounded soldiers recovered.
          </p>
          <!-- Dead infected units -->
          <p v-if="currentDayObserving[1].day.deadInfectedSoldiers > 0">
            {{
              currentDayObserving[1].day.deadInfectedSoldiers.toLocaleString()
            }}
            of your infected soldiers died.
          </p>
        </div>
        <div
          class="history-item"
          v-if="currentDayObserving[1].destinationAction"
        >
          <h3>Action</h3>
          <p v-text="actionText" />
        </div>
        <div class="history-item" v-if="currentDayObserving[1].march">
          <h3>March</h3>
          <p
            v-text="
              `You marched ${currentDayObserving[1].march.distanceTraveled} miles.`
            "
          />
          <p
            v-if="currentDayObserving[1].march.exhaustedSoldiers > 0"
            v-text="
              `${currentDayObserving[1].march.exhaustedSoldiers} became exhausted during the march from overexertion.`
            "
          />
          <p
            v-if="currentDayObserving[1].march.deadExhaustedSoldiers > 0"
            v-text="
              `${currentDayObserving[1].march.deadExhaustedSoldiers} died from exhaustion from overexertion.`
            "
          />
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
  import DestinationActions from '@/data/DestinationActions';
  import DESTINATIONS from '@/data/Destinations';
  // Other
  import { ref, computed } from 'vue';
  import GameDate from '@/data/GameDate';

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame(),
    dayObserving = ref<number>(game.days.elapsed - 1),
    stateToRestore = ref<GameState>();

  const currentDayObserving = computed<DailyResultsRecord | null>(() => {
      return game.dailyResults[dayObserving.value];
    }),
    observingDayDate = computed<GameDate | null>(() => {
      if (currentDayObserving.value === null) return null;
      return GameDate.fromState(currentDayObserving.value[0]);
    }),
    actionText = computed<string | null>(() => {
      if (currentDayObserving.value === null) return null;
      const action = currentDayObserving.value[1].destinationAction;
      if (action === null) return null;
      const actionData = game.getDestinationAction(
        DESTINATIONS.find((d) => d.name === action.location)!,
        action.action,
      );
      switch (action.action) {
        case DestinationActions.KILL_ALL_CIVILIANS:
          return `You killed ${actionData?.civiliansKilled.toLocaleString()} ${
            actionData?.affectsSupplyAvailability ? 'civilians' : 'town leaders'
          }.`;
        case DestinationActions.SEARCH_FOR_SUPPLIES:
          return `You searched for supplies and found ${actionData?.food.toLocaleString()} rations, ${actionData?.bullets.toLocaleString()} pouches of bullets, ${actionData?.powder.toLocaleString()} pouches of powder, and ${actionData?.medkits.toLocaleString()} medkits.`;
        case DestinationActions.DESTROY_RAILROAD:
          return `You destroyed the railroad.`;
        case DestinationActions.DESTROY_SUPPLY_DEPOT:
          return `You destroyed the supply depot.`;
        case DestinationActions.DESTROY_AGRICULTURE:
          return `You destroyed the agriculture.`;
        case DestinationActions.DESTROY_INDUSTRY:
          return `You destroyed the industry.`;
        default:
          return null;
      }
    });

  function show() {
    menuSlide.value?.show();
    dayObserving.value = game.days.elapsed - 1;
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

  ul.starved {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
