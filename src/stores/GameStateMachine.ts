import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export enum GameState {
  INTRO,
  START_MENU,
  GAME,
  ABOUT,
}

const useGameState = defineStore('game-state-machine', () => {
  const state = ref(GameState.INTRO);

  const speechBox = ref(false),
    speechBoxTitle = ref(''),
    speechBoxText = ref(''),
    speechBoxIndex = ref(0),
    speechBoxTextToDisplay = computed(() => {
      return speechBoxText.value
        .slice(0, speechBoxIndex.value)
        .replace('\t', '');
    });

  async function showSpeechBox(title: string, text: string) {
    speechBoxIndex.value = 0;
    speechBoxTitle.value = title;
    speechBoxText.value = text;
    if (!speechBox.value) {
      speechBox.value = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    // Animate the text as if it was being typed
    while (speechBoxIndex.value < text.length) {
      speechBoxIndex.value++;
      // If the character is a tab, wait a bit longer
      if (text[speechBoxIndex.value - 1] === '\t')
        await new Promise((resolve) => setTimeout(resolve, 1000));
      else await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async function hideSpeechBox() {
    speechBox.value = false;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return {
    state,
    speechBox,
    speechBoxTitle,
    speechBoxTextToDisplay,
    showSpeechBox,
    hideSpeechBox,
  };
});

export default useGameState;
