<template>
  <EnterExitSlide ref="welcomeCard" cancellable>
    <h1>Welcome!</h1>
    <h2>
      This is The March to the Sea, a game about Union General William T.
      Sherman's march through the South during the American Civil War.
    </h2>
    <h3>(Click anywhere to continue.)</h3>
  </EnterExitSlide>
  <EnterExitSlide ref="instructionsCardP1" cancellable>
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
  <EnterExitSlide ref="instructionsCardP2" cancellable>
    <h1>Instructions (Cont.)</h1>
    <h2>
      You will need to make decisions about how to handle the civilians you
      encounter. Will you treat them with kindness, or will you treat them with
      cruelty?
      <br />
      <br />
      Your decisions will affect how the civilians respond to you, and how
      quickly you can move through the South.
    </h2>
    <h3>(Click anywhere to continue.)</h3>
  </EnterExitSlide>
  <EnterExitSlide ref="transitionToGameCard" cancellable :duration="2e3">
    <h2> How will you march? Will you be a hero, or will you be a villain? </h2>
  </EnterExitSlide>
</template>

<script lang="ts" setup>
  import EnterExitSlide from '@/components/Animation/EnterExitSlide.vue';
  import { ref } from 'vue';
  import useGame from '@/stores/GameStateMachine';
  import GameState from '@/data/GameState';

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
    await welcomeCard.value?.begin();
    // Because welcomeCard has no duration, this promise will not resolve until the user clicks.
    await instructionsCardP1.value?.begin();
    await instructionsCardP2.value?.begin();
    await transitionToGameCard.value?.begin();
    game.state = GameState.REQUISITION_SUPPLIES;
  }

  game.subscribe(show, GameState.GAME_INTRO);
</script>

<style scoped>
  h2 {
    margin: 0 5rem;
  }
</style>
