<template>
  <MenuSlide
    ref="menuSlide"
    full-size
    style="z-index: 2; position: absolute; background-color: #0c0c0c"
  >
    <h1>Military Options</h1>
    <h3>Hover an option to learn more about it.</h3>

    <div>
      <span title="How far the army will march each day.">
        <label for="march-speed">Marching Speed</label>
        <select id="march-speed" v-model="game.marchSpeed">
          <option
            v-for="(speed, index) in MARCHING_SPEEDS"
            :value="index"
            :title="`Miles per day: ${speed.value}. Exhaustion Chance: ${speed.exhaustionChance}%`"
          >
            {{
              index
                .split('')
                .map((char, i) => (i === 0 ? char.toUpperCase() : char))
                .join('')
            }}
          </option>
        </select>
      </span>
      <span class="separator" />
      <span title="How often you'll provide rations for soldiers.">
        <label for="ration-frequency">Rationing Frequency</label>
        <select id="ration-frequency" v-model="game.rationFrequency">
          <option
            v-for="(frequency, index) in RATION_FREQUENCIES"
            :value="index"
            :title="frequency.description"
          >
            {{ frequency.label }}
          </option>
        </select>
        <h3>
          According to your rationing current rationing frequency, you will
          {{
            RATION_FREQUENCIES[game.rationFrequency].rationRequirement(
              game.days.elapsed,
            )
              ? 'provide'
              : 'skip'
          }}
          rations for today by default.
        </h3>
      </span>
      <span class="separator" />
      <span title="Whether or not you should skip rationing today.">
        <button @click="game.skipRationing = !game.skipRationing">
          {{
            game.skipRationing
              ? 'Provide Rations For Today'
              : 'Skip Rations For Today'
          }}
        </button>
        <h3>
          You will
          {{
            game.skipRationing
              ? 'skip'
              : `provide ${RATION_FREQUENCIES[game.rationFrequency].amount}`
          }}
          ration{{
            RATION_FREQUENCIES[game.rationFrequency].amount === 1 &&
            !game.skipRationing
              ? ''
              : 's'
          }}
          today.
        </h3>
      </span>
      <span class="separator" />
      <span title="Use medkits to heal wounded or infected soldiers.">
        <button
          @click="game.state = GameState.USE_MEDKITS"
          :disabled="game.union.infected + game.union.wounded < 1"
        >
          Use Medkits
        </button>
      </span>
    </div>

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
  import MARCHING_SPEEDS from '@/data/MarchingSpeeds';
  import RATION_FREQUENCIES from '@/data/RationFrequency';
  // Other
  import { ref } from 'vue';

  const menuSlide = ref<typeof MenuSlide>(),
    game = useGame(),
    stateToRestore = ref<GameState>();

  function hide() {
    menuSlide.value?.hide();
    game.state = stateToRestore.value!;
  }

  game.subscribe((state, oldState) => {
    if (state === GameState.OPTIONS) {
      if (oldState !== GameState.USE_MEDKITS) stateToRestore.value = oldState;
      menuSlide.value?.show();
    } else menuSlide.value?.hide();
  });
</script>

<style scoped>
  span {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    margin: 0 auto;
    width: 25vw;
    min-width: fit-content;
  }

  span.separator {
    background: #fff;
    height: 1px;
    width: 75vw;
    padding: 0;
    margin: 0 auto;
  }

  span label {
    margin: 0 1rem;
  }

  h3 {
    margin-bottom: 0;
  }

  span[title] {
    cursor: help;
  }
</style>
