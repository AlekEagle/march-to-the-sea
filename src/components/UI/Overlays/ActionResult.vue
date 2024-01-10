<template>
  <MenuSlide
    ref="menuSlide"
    style="z-index: 10; position: absolute; background-color: #0c0c0c"
    full-size
  >
    <div>
      <h1>Action Results</h1>
      <h2>You Chose to {{ chosenActionText }}.</h2>
      <br />
      <h3 v-html="actionDetails" />
      <br />
      <button @click="menuSlide?.hide">Continue</button>
    </div>
  </MenuSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import DestinationActions from '@/data/DestinationActions';
  // Other
  import { ref, computed } from 'vue';

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame(),
    destinationAction = ref<DestinationActions>();

  const chosenActionText = computed(() => {
      switch (destinationAction.value) {
        case DestinationActions.KILL_ALL_CIVILIANS:
          return 'Kill All Civilians';
        case DestinationActions.KILL_TOWN_LEADERS:
          return 'Kill Town Leaders';
        case DestinationActions.SEARCH_FOR_SUPPLIES:
          return 'Search for Supplies';
        case DestinationActions.DESTROY_RAILROAD:
          return 'Destroy the Railroad';
        case DestinationActions.DESTROY_SUPPLY_DEPOT:
          return 'Destroy the Supply Depot';
        case DestinationActions.DESTROY_AGRICULTURE:
          return 'Destroy the Agriculture';
        case DestinationActions.DESTROY_INDUSTRY:
          return 'Destroy the Industry';
        default:
          return 'Unknown Action';
      }
    }),
    actionDetails = computed(() => {
      switch (destinationAction.value) {
        case DestinationActions.KILL_ALL_CIVILIANS:
          return `You killed ${(
            game.getDestinationAction(
              game.currentDestination!,
              DestinationActions.KILL_ALL_CIVILIANS,
            ).civiliansKilled as number
          ).toLocaleString()} civilians. You got most of them but some hid well. This has negatively affected the Confederacy's morale and slightly affected their supply availability.`;
        case DestinationActions.KILL_TOWN_LEADERS:
          return `You killed ${(
            game.getDestinationAction(
              game.currentDestination!,
              DestinationActions.KILL_ALL_CIVILIANS,
            ).civiliansKilled as number
          ).toLocaleString()} town leaders. This has negatively affected the Confederacy's morale, but has not disrupted their supply availability.`;
        case DestinationActions.SEARCH_FOR_SUPPLIES:
          const suppliesFound = game.getDestinationAction(
            game.currentDestination!,
            DestinationActions.SEARCH_FOR_SUPPLIES,
          );
          return `You found:<br/>${suppliesFound.food.toLocaleString()} Food Rations<br/>${suppliesFound.bullets.toLocaleString()} Pouches of bullets<br/>${suppliesFound.powder.toLocaleString()} Pouches of powder<br/>${suppliesFound.medkits.toLocaleString()} Medkits`;
        case DestinationActions.DESTROY_RAILROAD:
          return `You destroyed the railroad. This has negatively affected the Confederacy's morale.`;
        case DestinationActions.DESTROY_SUPPLY_DEPOT:
          return `You destroyed the supply depot. This has negatively affected the Confederacy's morale and significantly affected their supply availability.`;
        case DestinationActions.DESTROY_AGRICULTURE:
          return `You destroyed the agriculture. This has negatively affected the Confederacy's morale .`;
        case DestinationActions.DESTROY_INDUSTRY:
          return `You destroyed the industry. This has negatively affected the Confederacy's morale.`;
        default:
          return 'Unknown Action';
      }
    });

  function show(action: DestinationActions) {
    menuSlide.value?.show();
    destinationAction.value = action;
  }

  defineExpose({ show });
</script>
