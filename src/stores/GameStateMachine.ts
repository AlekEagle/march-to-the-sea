import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export enum GameState {
  INTRO,
  START_MENU,
  GAME_INTRO,
  GAME,
  ABOUT,
}

// ===== Constants =====

// === Random Event Chances ===

// === Marching Speeds ===
export const MARCHING_SPEEDS = {
  leisurely: {
    value: 2, // Miles per day
    injuryChance: 0, // Percent chance of a soldier injuring themselves at this pace while marching
  },
  normal: {
    value: 4,
    injuryChance: 2,
  },
  fast: {
    value: 6,
    injuryChance: 8,
  },
  grueling: {
    value: 8,
    injuryChance: 20,
  },
};

// === Supply Costs ===
export const SUPPLY_COSTS = {
  food: {
    value: 25, // Dollars per unit
    amount: 62_000, // Amount of supplies per unit
  },
  bullets: {
    value: 9.5,
    amount: 62_000,
  },
  powder: {
    value: 7.5,
    amount: 62_000,
  },
  medkits: {
    value: 35,
    amount: 50,
  },
};

export const IntermediateDestinations = [
  {
    name: 'Atlanta', // The name of the destination
    distance: 0, // Miles from Atlanta
  },
  {
    name: 'Decatur',
    distance: 6,
  },
  {
    name: 'McDonough',
    distance: 36,
  },
  {
    name: 'Covington',
    distance: 58,
  },
  {
    name: 'Monticello',
    distance: 84,
  },
  {
    name: 'Madison',
    distance: 110,
  },
  {
    name: 'Eatonton',
    distance: 133,
  },
  {
    name: 'Milledgeville',
    distance: 154,
  },
  {
    name: 'Gordon',
    distance: 170,
  },
  {
    name: 'Irwinton',
    distance: 182,
  },
  {
    name: 'Sandersville',
    distance: 224,
  },
  {
    name: 'Louisville',
    distance: 240,
  },
  {
    name: 'Millen',
    distance: 275,
  },
  {
    name: 'Fort McAllister',
    distance: 371,
  },
  {
    name: 'Savannah',
    distance: 400,
  },
];

const useGameState = defineStore('game-state-machine', () => {
  // Game State Variables & Methods
  const state = ref(GameState.INTRO),
    soldiers = ref({
      alive: 62_000,
      injured: {
        exhaustion: 0,
      },
      dead: 0,
    }),
    money = ref(500),
    distance = ref(0), // Miles from Atlanta
    marchSpeed = ref<keyof typeof MARCHING_SPEEDS>('leisurely'),
    visitedDestinations = computed(() =>
      IntermediateDestinations.filter(
        (destination) => destination.distance <= distance.value,
      ),
    ),
    unvisitedDestinations = computed(() =>
      IntermediateDestinations.filter(
        (destination) =>
          !visitedDestinations.value.some(
            (visitedDestination) =>
              visitedDestination.name === destination.name,
          ),
      ),
    ),
    previousDestination = computed(
      () => visitedDestinations.value[visitedDestinations.value.length - 1],
    ),
    nextDestination = computed(() => unvisitedDestinations.value[0]),
    confederatePower = ref(100), // 100% = 100% power
    supplies = ref({
      food: 0, // 1 unit of food = 1 day of food for 1 soldier
      bullets: 0, // 1 unit of bullets = 1 pouch of bullets for 1 soldier (1 pouch = 20 bullets)
      powder: 0, // 1 unit of powder = 1 pouch of powder for 1 soldier (1 pouch = 20 shots)
      medkits: 0, // 1 unit of medkits = 1 medkit for 1 soldier
    });

  function purchaseSupplies(type: keyof typeof supplies.value, amount: number) {
    supplies.value[type] += amount * SUPPLY_COSTS[type].amount;
    money.value -= amount * SUPPLY_COSTS[type].value;
  }

  // Speech Box Variables & Methods
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
    // Game State Variables & Methods
    state,
    soldiers,
    money,
    distance,
    marchSpeed,
    visitedDestinations,
    unvisitedDestinations,
    previousDestination,
    nextDestination,
    confederatePower,
    supplies,
    purchaseSupplies,
    // Speech Box Variables & Methods
    speechBox,
    speechBoxTitle,
    speechBoxTextToDisplay,
    showSpeechBox,
    hideSpeechBox,
  };
});

export default useGameState;
