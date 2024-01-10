<template>
  <EnterExitSlide
    ref="welcomeCard"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Welcome!</h1>
    <h2>
      This is The March to the Sea, a game about Union General William T.
      Sherman's march through the South during the American Civil War.
    </h2>
    <h3>(Click anywhere to continue.)</h3>
  </EnterExitSlide>
  <EnterExitSlide
    ref="instructionsCardP1"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Instructions</h1>
    <h2>
      You are General Sherman. Your goal is to march through the South and
      cripple the Confederacy's ability to wage war.
      <br />
      <br />
      You will need to prepare your army for the march by requisitioning
      supplies, as well as gathering supplies from the land as you go.
    </h2>
    <h3>(Click anywhere to continue.)</h3>
  </EnterExitSlide>
  <EnterExitSlide
    ref="instructionsCardP2"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Instructions (Cont.)</h1>
    <h2>
      As you march, you will encounter Confederate forces. You will need to
      fight them off, and you will need to make decisions about how to best
      manage your army.
      <br />
      <br />
      If you lose too many soldiers, you will be overwhelmed and lose the game.
    </h2>
    <h3>(Click anywhere to continue.)</h3>
  </EnterExitSlide>
  <EnterExitSlide
    ref="instructionsCardP3"
    cancellable
    full-size
    style="position: absolute; z-index: 0"
  >
    <h1>Instructions (Cont.)</h1>
    <h2>
      You will also need to manage your army's morale. If your army's morale
      drops too low, they will desert and you will lose the game.
    </h2>
    <h3>(Click anywhere to continue.)</h3>
  </EnterExitSlide>
  <EnterExitSlide
    ref="transitionToGameCard"
    cancellable
    :duration="2e3"
    full-size
    style="position: absolute; z-index: 0"
  >
    <h2> How will you march? Will you be a hero, or will you be a villain? </h2>
  </EnterExitSlide>
</template>

<script lang="ts" setup>
  // Vue Components
  import EnterExitSlide from '@/components/Animation/EnterExitSlide.vue';
  // Stores
  import useGame from '@/stores/GameStateMachine';
  // Data
  import GameState from '@/data/GameState';
  // Other
  import { ref } from 'vue';

  const game = useGame(),
    welcomeCard = ref<typeof EnterExitSlide>(),
    instructionsCardP1 = ref<typeof EnterExitSlide>(),
    instructionsCardP2 = ref<typeof EnterExitSlide>(),
    transitionToGameCard = ref<typeof EnterExitSlide>();

  async function show(): Promise<void> {
    if (window.location.search.includes('skip-instructions')) {
      game.state = GameState.REQUISITION_SUPPLIES;
      return;
    }
    await welcomeCard.value?.begin(true);
    // Because welcomeCard has no duration, this promise will not resolve until the user clicks.
    await instructionsCardP1.value?.begin(true);
    await instructionsCardP2.value?.begin(true);
    await transitionToGameCard.value?.begin(true);
    game.state = GameState.REQUISITION_SUPPLIES;
  }

  game.subscribe(show, GameState.GAME_INTRO);
</script>

<style scoped>
  h2 {
    margin: 0 5rem;
  }
</style>
