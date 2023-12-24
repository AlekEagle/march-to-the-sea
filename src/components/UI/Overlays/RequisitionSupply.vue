<template>
  <MenuSlide
    ref="menuSlide"
    style="z-index: 2; position: absolute; background-color: #0c0c0c"
  >
    <div>
      <h1>Purchase Supply</h1>
      <h2>You Chose: {{ SUPPLY_COSTS[supplyToPurchase].name }}</h2>
      <h3 v-text="SUPPLY_COSTS[supplyToPurchase].description" />
      <h4
        >You can purchase this supply in sets of
        {{ SUPPLY_COSTS[supplyToPurchase].amount.toLocaleString() }} for ${{
          SUPPLY_COSTS[supplyToPurchase].value.toLocaleString()
        }}.</h4
      >

      <div class="amt-select">
        <span
          @click="
            () => {
              if (--setsToPurchase < 1) setsToPurchase = 1;
            }
          "
          :class="`${setsToPurchase <= 1 ? 'disabled amt-btn' : 'amt-btn'}`"
          >-</span
        >
        <span
          class="amt"
          v-text="
            `${setsToPurchase.toLocaleString()} Set${
              setsToPurchase !== 1 ? 's' : ''
            }`
          "
        />
        <span
          @click="
            () => {
              if (++setsToPurchase > 999) setsToPurchase = 999;
            }
          "
          :class="`${
            setsToPurchase >= 999 || totalCost > game.money
              ? 'disabled amt-btn'
              : 'amt-btn'
          }`"
          >+</span
        >
      </div>
      <h3>
        You are about to purchase
        {{ totalAmount.toLocaleString() }}
        units of this supply for ${{ totalCost.toLocaleString() }}, leaving you
        with ${{ (game.money - totalCost).toLocaleString() }}.
      </h3>
    </div>
    <div>
      <button
        @click="
          async () => {
            await menuSlide?.hide();
            setsToPurchase = 1;
          }
        "
        >Cancel</button
      >
      <button
        @click="
          () => {
            game.purchaseSupplies(supplyToPurchase, setsToPurchase);
            setsToPurchase = 1;
            menuSlide?.hide();
          }
        "
        :disabled="totalCost > game.money"
      >
        Purchase
      </button>
    </div>
  </MenuSlide>
</template>

<script lang="ts" setup>
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  import useGame from '@/stores/GameStateMachine';
  import SUPPLY_COSTS, { SupplyType } from '@/data/SupplyCosts';
  import { ref, computed } from 'vue';

  const game = useGame(),
    menuSlide = ref<typeof MenuSlide>(),
    supplyToPurchase = ref<SupplyType>('bullets'),
    setsToPurchase = ref(1),
    totalCost = computed(() => {
      return setsToPurchase.value * SUPPLY_COSTS[supplyToPurchase.value].value;
    }),
    totalAmount = computed(() => {
      return setsToPurchase.value * SUPPLY_COSTS[supplyToPurchase.value].amount;
    });

  game.state;

  function show(supply: SupplyType) {
    menuSlide.value?.show();
    supplyToPurchase.value = supply;
  }

  defineExpose({ show });
</script>

<style scoped>
  div.amt-select {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div button {
    margin: 0 0.5rem;
  }

  div.amt-select span:first-child {
    margin-top: -1.25rem;
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
</style>
