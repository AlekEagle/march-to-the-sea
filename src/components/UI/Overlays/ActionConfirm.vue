<template>
  <MenuSlide
    ref="menuSlide"
    style="z-index: 2; position: absolute; background-color: #0c0c0c"
    full-size
  >
    <div>
      <h1>Confirm Action</h1>
      <h2>You Have Chosen to {{ chosenActionText }}. Are you sure?</h2>
      <h3
        >This will take one day to complete. You will not be able to perform
        this action again.</h3
      >
      <h4
        v-if="
          destinationAction === DestinationActions.KILL_ALL_CIVILIANS ||
          destinationAction === DestinationActions.KILL_TOWN_LEADERS
        "
      >
        You will not be able to kill any more civilians in this town. (This
        includes the town leaders.)
      </h4>
      <button
        @click="
          async () => {
            await menuSlide?.hide();
            destinationAction = undefined;
          }
        "
        >Nevermind</button
      >
      <button @click="confirm">I'm sure</button>
    </div>
  </MenuSlide>
  <ActionResult ref="actionResult" />
</template>

<script lang="ts" setup>
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  import useGame from '@/stores/GameStateMachine';
  import DestinationActions from '@/data/DestinationActions';
  import { ref, computed } from 'vue';
  import ActionResult from './ActionResult.vue';

  const menuSlide = ref<typeof MenuSlide>(),
    actionResult = ref<typeof ActionResult>(),
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
  });

  async function confirm() {
    switch (destinationAction.value) {
      case DestinationActions.KILL_ALL_CIVILIANS:
        game.killCivilians(false);
        break;
      case DestinationActions.KILL_TOWN_LEADERS:
        game.killCivilians(true);
        break;
      case DestinationActions.SEARCH_FOR_SUPPLIES:
        game.searchForSupplies();
        break;
      case DestinationActions.DESTROY_RAILROAD:
        game.destroyRailroad();
        break;
      case DestinationActions.DESTROY_SUPPLY_DEPOT:
        game.destroySupplyDepot();
        break;
      case DestinationActions.DESTROY_AGRICULTURE:
        game.destroyAgriculture();
        break;
      case DestinationActions.DESTROY_INDUSTRY:
        game.destroyIndustry();
        break;
      default:
        game.showToast('Whoops!');
    }
    await menuSlide.value?.hide();
    actionResult.value?.show(destinationAction.value);
  }

  function show(action: DestinationActions) {
    menuSlide.value?.show();
    destinationAction.value = action;
  }

  defineExpose({ show });
</script>

<style scoped>
  div button {
    margin: 0 0.5rem;
  }

  h2 {
    margin: 0.5rem;
  }

  h3 {
    margin: 0.5rem;
  }

  h4 {
    margin: 0.5rem;
  }
</style>
