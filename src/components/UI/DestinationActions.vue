<template>
  <MenuSlide ref="menuSlide" full-size>
    <!-- Absolutely positioned items -->
    <span id="destination">
      Currently in: {{ game.currentDestination?.name }}
      <br />
      Population: {{ currentPopulation }}
    </span>
    <span id="date">
      Date: {{ game.days.toString(false) }}
      <br />
      Days Passed: {{ game.days.elapsed }}
    </span>
    <!-- End of absolutely positioned items -->
    <h1>Available Actions</h1>
    <div class="action-buttons">
      <template
        v-if="!game.getDestinationAction(game.currentDestination!, DestinationActions.KILL_ALL_CIVILIANS)"
      >
        <button
          @click="actionConfirm?.show(DestinationActions.KILL_ALL_CIVILIANS)"
        >
          Kill All Civilians
        </button>
        <button
          @click="actionConfirm?.show(DestinationActions.KILL_TOWN_LEADERS)"
        >
          Kill Town Leaders
        </button>
      </template>
      <button
        @click="actionConfirm?.show(DestinationActions.SEARCH_FOR_SUPPLIES)"
        v-if="!game.getDestinationAction(game.currentDestination!, DestinationActions.SEARCH_FOR_SUPPLIES)"
      >
        Search for Supplies
      </button>
      <button
        @click="actionConfirm?.show(DestinationActions.DESTROY_RAILROAD)"
        v-if="townHasRailroad &&
      !game.getDestinationAction(game.currentDestination!,
      DestinationActions.DESTROY_RAILROAD)"
      >
        Destroy Railroad
      </button>
      <button
        @click="actionConfirm?.show(DestinationActions.DESTROY_SUPPLY_DEPOT)"
        v-if="townHasSupplyDepot &&
      !game.getDestinationAction(game.currentDestination!,
      DestinationActions.DESTROY_SUPPLY_DEPOT)"
      >
        Destroy Supply Depot
      </button>
      <button
        @click="actionConfirm?.show(DestinationActions.DESTROY_AGRICULTURE)"
        v-if="townHasAgriculture &&
      !game.getDestinationAction(game.currentDestination!,
      DestinationActions.DESTROY_AGRICULTURE)"
      >
        Destroy Agriculture
      </button>
      <button
        @click="actionConfirm?.show(DestinationActions.DESTROY_INDUSTRY)"
        v-if="townHasIndustry &&
      !game.getDestinationAction(game.currentDestination!,
      DestinationActions.DESTROY_INDUSTRY)"
      >
        Destroy Industry
      </button>
      <button @click="resumeMarch">Resume March</button>
    </div>
  </MenuSlide>
  <ActionConfirm ref="actionConfirm" />
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  import ActionConfirm from '@/components/UI/Overlays/ActionConfirm.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  import TownFeatures from '@/data/TownFeatures';
  import DestinationActions from '@/data/DestinationActions';
  // Other
  import { ref, computed } from 'vue';

  const menuSlide = ref<typeof MenuSlide>(),
    actionConfirm = ref<typeof ActionConfirm>(),
    game = useGame();

  const currentPopulation = computed(() => {
      const destinationActionData = game.getDestinationAction(
        game.currentDestination!,
        DestinationActions.KILL_ALL_CIVILIANS,
      );
      const popKilled = destinationActionData
        ? destinationActionData.civiliansKilled
        : 0;
      if (popKilled)
        return (
          game.currentDestination!.population - popKilled
        ).toLocaleString();
      else return game.currentDestination!.population.toLocaleString();
    }),
    townHasRailroad = computed(() => {
      // Check if the RAILROAD feature bit is set
      return !!(game.currentDestination!.features & TownFeatures.RAILROADS);
    }),
    townHasSupplyDepot = computed(() => {
      // Check if the SUPPLY_DEPOT feature bit is set
      return !!(game.currentDestination!.features & TownFeatures.SUPPLY_DEPOT);
    }),
    townHasAgriculture = computed(() => {
      // Check if the AGRICULTURE feature bit is set
      return !!(game.currentDestination!.features & TownFeatures.AGRICULTURE);
    }),
    townHasIndustry = computed(() => {
      // Check if the INDUSTRY feature bit is set
      return !!(game.currentDestination!.features & TownFeatures.INDUSTRY);
    }),
    townIsFort = computed(() => {
      // Check if the FORT feature bit is set
      return !!(game.currentDestination!.features & TownFeatures.FORT);
    });

  function resumeMarch() {
    game.state = GameState.MARCHING;
  }

  console.log(townIsFort.value);

  game.subscribe((state) => {
    if (state === GameState.DESTINATION) {
      menuSlide.value?.show();
    } else menuSlide.value?.hide();
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
