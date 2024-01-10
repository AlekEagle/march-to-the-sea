<template>
  <MenuSlide
    ref="menuSlide"
    full-size
    style="z-index: 2; position: absolute; background-color: #0c0c0c"
  >
    <h1>Military Information</h1>
    <h3>Hover over a piece of information to learn more about it.</h3>
    <template v-if="currentMilitary === 'union'">
      <button @click="currentMilitary = 'confederacy'">View Confederacy</button>
      <h2>Union</h2>
      <div id="info">
        <div>
          <h3>Units</h3>
          <h4 title="Healthy soldiers.">
            Alive: {{ game.union.alive.toLocaleString() }}
          </h4>
          <h4
            title="Soldiers injured from wounds during confrontations. There's a 90% chance of these soldiers developing infections due to their wounds. If they don't develop infections, they will recover in a day."
          >
            Wounded: {{ game.union.wounded.toLocaleString() }}
          </h4>
          <h4
            title="Soldiers injured from becoming exhausted from overexertion while marching."
          >
            Exhausted: {{ game.union.exhausted.toLocaleString() }}
          </h4>
          <h4
            title="Soldiers who have developed infections from wounds during confrontations, if not tended to they will die in a day."
          >
            Infected: {{ game.union.infected.toLocaleString() }}
          </h4>
          <h4 title="Soldiers that have died.">
            Dead: {{ game.union.dead.toLocaleString() }}
          </h4>
        </div>
        <div>
          <h3>Supplies</h3>
          <h4
            title="A meal for a soldier, depending how well fed they are, they could be able to march further distances."
          >
            Food Rations: {{ game.supplies.food.toLocaleString() }}
          </h4>
          <h4
            title="Each pouch of bullets has 20 bullets, the average soldier will go through one of these in 20 minutes."
          >
            Pouches of bullets:
            {{ game.supplies.bullets.toLocaleString() }}
          </h4>
          <h4
            title="Each pouch of bullets has 20 shots worth of powder, the average soldier will go through one of these in 20 minutes."
          >
            Pouches of powder: {{ game.supplies.powder.toLocaleString() }}
          </h4>
          <h4
            title="A medkit can immediately help one wounded or infected soldier recover from their injuries."
          >
            Medkits: {{ game.supplies.medkits.toLocaleString() }}
          </h4>
        </div>
        <div>
          <h3>Stats</h3>
          <h4
            title="How confident the union army is. Affects accuracy and strength."
          >
            Morale: {{ game.union.morale }}%
          </h4>
          <h4 title="How well fed the union army is. Affects strength.">
            Nutrition: {{ game.union.nutrition }}%
          </h4>
          <h4 title="How accurate the union army is with their rifles.">
            Accuracy: {{ game.union.accuracy.toFixed(2) }}%
          </h4>
          <h4 title="How strong a union soldier is in physical combat.">
            Strength: {{ game.union.strength.toFixed(2) }}
          </h4>
        </div>
      </div>
    </template>
    <template v-else-if="currentMilitary === 'confederacy'">
      <button @click="currentMilitary = 'union'">View Union</button>
      <h2>Confederacy</h2>
      <h3>Units</h3>
      <h4 title="You don't know the exact number, this is just an estimate.">
        Alive: ~{{ confederacyRoundedUnitCount.toLocaleString() }}
      </h4>
      <h4
        title="You've kept track of how many Confederate soldiers you've killed."
      >
        Dead: {{ game.confederacy.dead.toLocaleString() }}
      </h4>
    </template>
    <template v-else>
      <h2>How</h2>
      <h3>I am broken.</h3>
    </template>
    <button @click="game.state = GameState.DAILY_HISTORY">
      View Daily History
    </button>
    <br />
    <br />
    <button @click="hide">Close</button>
  </MenuSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  // Other
  import { ref, computed } from 'vue';

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame(),
    currentMilitary = ref<'union' | 'confederacy'>('union'),
    stateToRestore = ref<GameState>();

  const confederacyRoundedUnitCount = computed(() => {
    return Math.round(game.confederacy.alive / 1000) * 1000;
  });

  function hide() {
    menuSlide.value?.hide();
    game.state = stateToRestore.value!;
  }

  game.subscribe((state, oldState) => {
    if (state === GameState.MILITARY_INFO) {
      if (oldState !== GameState.DAILY_HISTORY) stateToRestore.value = oldState;
      menuSlide.value?.show();
    } else menuSlide.value?.hide();
  });
</script>

<style scoped>
  div#info {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  div#info div {
    display: inline-block;
    padding: 0 1rem;
    width: 25vw;
    min-width: fit-content;
  }

  div#info div:first-child {
    text-align: right;
  }

  div#info div:last-child {
    text-align: left;
  }

  h4[title] {
    cursor: help;
  }
</style>
