<template>
  <MenuSlide ref="menuSlide" full-size>
    <!-- Absolutely positioned items -->
    <ul id="supplies">
      <li v-text="`Food Rations: ${game.supplies.food.toLocaleString()}`" />
      <li
        v-text="`Pouches of bullets: ${game.supplies.bullets.toLocaleString()}`"
      />
      <li
        v-text="
          `Pouches of gunpowder: ${game.supplies.powder.toLocaleString()}`
        "
      />
      <li v-text="`Medkits: ${game.supplies.medkits.toLocaleString()}`" />
    </ul>
    <span id="money" v-text="`$${game.money.toLocaleString()}`" />
    <!-- End of absolutely positioned items -->
    <h1>Requisition Supplies</h1>
    <h2>
      Now is the time to prepare your army for the march.
      <br />
      What would you like to requisition?
    </h2>
    <ul id="req-supplies">
      <li @click="requisitionSupply?.show('food')">Food Rations</li>
      <li @click="requisitionSupply?.show('bullets')">Pouches of bullets</li>
      <li @click="requisitionSupply?.show('powder')">Pouches of gunpowder</li>
      <li @click="requisitionSupply?.show('medkits')">Medkits</li>
    </ul>
    <button
      @click="
        async () => {
          await menuSlide?.hide();
          game.state = GameState.DESTINATION_INTRO;
        }
      "
    >
      Continue
    </button>
  </MenuSlide>
  <RequisitionSupply ref="requisitionSupply" />
</template>

<script lang="ts" setup>
  import MenuSlide from '../Animation/MenuSlide.vue';
  import useGame from '../../stores/GameStateMachine';
  import GameState from '../../data/GameState';
  import { ref } from 'vue';
  import RequisitionSupply from './Overlays/RequisitionSupply.vue';

  const game = useGame(),
    menuSlide = ref<typeof MenuSlide>(),
    requisitionSupply = ref<typeof RequisitionSupply>();

  function show() {
    menuSlide.value?.show();
  }

  game.subscribe(show, GameState.REQUISITION_SUPPLIES);
</script>

<style scoped>
  span#money {
    position: absolute;
    top: 0;
    right: 0;
    margin: 1rem;
    font-size: 2rem;
  }

  ul#req-supplies {
    padding: 1rem 2.5rem;
    margin: 1rem auto;
    font-size: 2rem;
    background-color: #171717;
    border: 1px solid white;
    border-radius: 0.5rem;
    width: fit-content;
    text-align: left;
  }

  ul#req-supplies li {
    margin: 1rem;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: text-decoration-color 0.25s ease-in-out;
  }

  ul#req-supplies li::marker {
    color: transparent;
    transition: color 0.25s ease-in-out;
  }

  ul#req-supplies li:hover {
    text-decoration-color: white;
  }

  ul#req-supplies li:hover::marker {
    color: white;
  }

  ul#supplies {
    position: absolute;
    list-style: none;
    padding: 0;
    text-align: left;
    margin: 1rem;
    top: 0;
    left: 0;
  }
</style>
