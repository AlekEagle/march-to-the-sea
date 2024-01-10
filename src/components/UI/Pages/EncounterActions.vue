<template>
  <MenuSlide ref="menuSlide" full-size style="position: absolute; z-index: 0">
    <h1>Encounter Actions</h1>
    <div class="grid">
      <!-- Union Statistics and Information -->
      <div class="grid-section union-stats">
        <h2>Union</h2>
        <h3>Engaged: {{ game.encounter!.union.engaged.toLocaleString() }}</h3>
        <h3>
          Remaining:
          {{
            (
              game.encounter!.union.engaged -
              (game.encounter!.union.casualties + game.encounter!.union.wounded)
            ).toLocaleString()
          }}
        </h3>
        <h3
          >Casualties:
          {{ game.encounter!.union.casualties.toLocaleString() }}</h3
        >
        <h3>Wounded: {{ game.encounter!.union.wounded.toLocaleString() }}</h3>
        <h3
          title="How many soldiers need to be wounded or killed before the Union retreats."
        >
          Casualties before Retreat:
          {{
            Math.round(
              (((game.encounter!.union.casualties /
                game.encounter!.union.engaged) *
                100) /
                game.union.retreatThreshold) *
                100,
            )
          }}%
        </h3>
      </div>
      <!-- Action Buttons -->
      <div class="grid-section action-buttons">
        <button @click="game.stepEncounter" :disabled="autoFight"
          >Continue Fight</button
        >
        <button @click="toggleAutoFight">
          {{ autoFight ? 'Stop' : 'Start' }} Auto Fight
        </button>
        <button
          @click="game.advanceLine"
          v-if="game.encounter!.state !== EncounterState.MELEE_ONLY"
          :disabled="autoFight"
          >Advance Line</button
        >
        <button
          @click="game.retractLine"
          v-if="game.encounter!.state > EncounterState.RANGED_MELEE"
          :disabled="autoFight"
          >Retract Line</button
        >
        <button
          @click="game.retreatFromEncounter"
          v-if="game.encounter!.duration >= 6"
          :disabled="autoFight"
        >
          Retreat
        </button>
      </div>
      <!-- General Encounter Statistics and Information -->
      <div class="grid-section battle-stats">
        <h2>Battle</h2>
        <h3>Duration: {{ encounterDuration }}</h3>
        <h3 :title="combatPositionHint"
          >Combat Position: {{ combatPosition }}</h3
        >
        <h3>
          Overall Casualties:
          {{
            (
              game.encounter!.union.casualties +
              game.encounter!.confederate.casualties
            ).toLocaleString()
          }}
        </h3>
      </div>
      <!-- Confederate Statistics and Information -->
      <div class="grid-section confederate-stats">
        <h2>Confederacy</h2>
        <h3>
          Engaged: ~{{
            (
              Math.round(game.encounter!.confederate.engaged / 10) * 10
            ).toLocaleString()
          }}
        </h3>
        <h3>
          Remaining: ~{{
            (
              Math.round(
                (game.encounter!.confederate.engaged -
                  game.encounter!.confederate.casualties) /
                  10,
              ) * 10
            ).toLocaleString()
          }}
        </h3>
        <h3>
          Casualties:
          {{ game.encounter!.confederate.casualties.toLocaleString() }}
        </h3>
        <h3 v-if="game.currentDestination!.features & TownFeatures.FORT">
          The Confederacy is defending a fort, which gives them stat bonuses.
        </h3>
        <h3 v-if="game.confederacySupplyAvailability < 20">
          The Confederacy is low on supplies, they have ran out of ammunition
          and can't return ranged fire.
        </h3>
      </div>
    </div>
  </MenuSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import MenuSlide from '@/components/Animation/MenuSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  import { EncounterState } from '@/data/Encounter';
  import TownFeatures from '@/data/TownFeatures';
  // Other
  import { ref, computed } from 'vue';
  import { wait } from '@/utils/Wait';

  const menuSlide = ref<typeof MenuSlide>();
  const game = useGame();
  const autoFight = ref(false);
  const encounterDuration = computed(() => {
      const minutes = game.encounter!.duration * 20;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours > 0 ? `${hours} hours ` : ''}${
        remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''
      }`;
    }),
    combatPosition = computed(() => {
      switch (game.encounter!.state) {
        case EncounterState.RANGED_ONLY:
          return 'Ranged Only';
        case EncounterState.RANGED_MELEE:
          return 'Ranged and Melee';
        case EncounterState.MELEE_ONLY:
          return 'Melee Only';
      }
    }),
    combatPositionHint = computed(() => {
      switch (game.encounter!.state) {
        case EncounterState.RANGED_ONLY:
          return 'The front two ranks are engaged in ranged combat.';
        case EncounterState.RANGED_MELEE:
          return 'The rear ranks are engaged in ranged combat, while the front ranks are engaged in melee combat.';
        case EncounterState.MELEE_ONLY:
          return 'The front two ranks are engaged in melee combat.';
      }
    });

  function toggleAutoFight() {
    autoFight.value = !autoFight.value;
    if (autoFight.value) autoFightEncounter();
  }

  async function autoFightEncounter() {
    if (autoFight.value) {
      game.stepEncounter();
      await wait(1000);
      if (game.state === GameState.ENCOUNTER && autoFight.value)
        autoFightEncounter();
    }
  }

  function show() {
    menuSlide.value?.show();
  }

  function hide() {
    autoFight.value = false;
    menuSlide.value?.hide();
  }

  game.subscribe(show, GameState.ENCOUNTER, hide);
</script>

<style scoped>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: fit-content;
  }

  .grid-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .grid-section.union-stats,
  .grid-section.confederate-stats {
    justify-content: space-between;
    grid-row: 1 / span 2;
  }

  .grid-section.union-stats {
    grid-column: 1 / span 1;
  }

  .grid-section.action-buttons {
    grid-column: 2 / span 1;
    justify-content: center;
  }

  .grid-section.battle-stats {
    grid-column: 2 / span 1;
    grid-row: 2 / span 1;
  }

  .grid-section.confederate-stats {
    grid-column: 3 / span 1;
  }

  h3[title] {
    cursor: help;
  }
</style>
