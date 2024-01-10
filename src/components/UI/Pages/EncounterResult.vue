<template>
  <EnterExitSlide
    ref="enterExitSlide"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>The fight is over!</h1>
    <h2>{{ victor }} is victorious.</h2>
    <h3
      v-if="game.encounter!.results.victory === EncounterVictory.UNION_VICTORY"
    >
      The Confederacy's morale has been broken and they have retreated!
    </h3>
    <h3
      v-else-if="game.encounter!.results.victory === EncounterVictory.CONFEDERATE_VICTORY"
    >
      Your morale has been broken and you have retreated back a day's march,
      leaving wounded soldiers in the field to die.
    </h3>
    <h3 v-else-if="game.encounter!.results.victory === EncounterVictory.DRAW">
      Both sides have retreated, you retreated back a day's march and left
      wounded soldiers in the field to die. Both sides have reduced morale.
    </h3>
    <h3 v-else>
      I am horribly broken. Nothing makes sense. I am in pain. I am dying.
    </h3>
    <h4>You can see the specifics in military history.</h4>
  </EnterExitSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import EnterExitSlide from '@/components/Animation/EnterExitSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  import { EncounterVictory } from '@/data/Encounter';
  import { GameOverReason } from '@/stores/GameStateMachine';
  // Other
  import { ref, computed } from 'vue';

  // Component Refs
  const enterExitSlide = ref<typeof EnterExitSlide>();
  // Stores
  const game = useGame();
  // Computed Values
  const victor = computed(() => {
    switch (game.encounter!.results.victory!) {
      case EncounterVictory.UNION_VICTORY:
        return 'The Union';
      case EncounterVictory.CONFEDERATE_VICTORY:
        return 'The Confederacy';
      case EncounterVictory.DRAW:
        return 'No one';
    }
  });

  async function show() {
    await enterExitSlide.value?.begin(true);
    // If we are at the end of the march, go to the end of the game
    if (game.nextDestination === undefined) {
      // If the Union won this battle, set the game over reason to Savannah Victory
      if (game.encounter!.results.victory === EncounterVictory.UNION_VICTORY)
        game.gameOverReason = GameOverReason.SAVANNAH_VICTORY;
      // Otherwise, set the game over reason to Savannah Defeat
      else game.gameOverReason = GameOverReason.SAVANNAH_DEFEAT;
      // End the game
      game.state = GameState.END;
    }
    // If the Union retreated, return to the previous destination
    else if (game.encounter!.results.victory !== EncounterVictory.UNION_VICTORY)
      game.march(true); // March in reverse
    // Clear the encounter
    game.state = game.currentDestination
      ? GameState.DESTINATION
      : GameState.MARCHING;
    game.encounter = null;
  }

  game.subscribe(show, GameState.ENCOUNTER_RESULT);
</script>
