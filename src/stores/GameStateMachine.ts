import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

// === Constants ===
import GameState from '@/data/GameState';
import { MarchingSpeed } from '@/data/MarchingSpeeds';
import SUPPLY_COSTS, { SupplyType } from '@/data/SupplyCosts';
import DESTINATIONS, { Destination } from '@/data/Destinations';
import MilitaryForces from '@/data/MilitaryForces';
import Union from '@/data/MilitaryForces/Union';
import Confederacy from '@/data/MilitaryForces/Confederacy';
import GameDate, { Months } from '@/data/GameDate';

const DEFAULT_MARCH_SPEED = 'leisurely';

const useGame = defineStore('game-state-machine', () => {
  // Game State Variables & Methods
  // === Refs ===
  const state = ref(GameState.INTRO),
    stateSubscribers: Array<(state: GameState) => void> = [],
    // == Military Forces ==
    // Union data
    union = ref<MilitaryForces>(Object.assign({}, Union)), // Create a clone of the Union object since we'll be modifying it
    // Confederacy data
    confederacy = ref<MilitaryForces>(Object.assign({}, Confederacy)), // Create a clone of the Confederacy object since we'll be modifying it
    // == Game State Variables ==
    money = ref(5_000),
    days = ref(new GameDate(Months.November, 15)),
    distance = ref(0), // Miles from Atlanta
    marchSpeed = ref<MarchingSpeed>(DEFAULT_MARCH_SPEED),
    supplies = ref({
      food: 0, // 1 unit of food = 1 day of food for 1 soldier
      bullets: 0, // 1 unit of bullets = 1 pouch of bullets for 1 soldier (1 pouch = 20 bullets)
      powder: 0, // 1 unit of powder = 1 pouch of powder for 1 soldier (1 pouch = 20 shots)
      medkits: 0, // 1 unit of medkits = 1 medkit for 1 soldier
    }),
    // === Computed Values ===
    // == Destinations ==
    // Destinations that have been visited
    visitedDestinations = computed(() =>
      DESTINATIONS.filter(
        (destination) => destination.distance <= distance.value,
      ),
    ),
    // Destinations that have not been visited
    unvisitedDestinations = computed(() =>
      DESTINATIONS.filter(
        (destination) =>
          !visitedDestinations.value.some(
            (visitedDestination) =>
              visitedDestination.name === destination.name,
          ),
      ),
    ),
    // The most recently visited destination
    previousDestination = computed<Destination>(
      () => visitedDestinations.value[visitedDestinations.value.length - 1],
    ),
    // The next destination to visit
    nextDestination = computed<Destination>(
      () => unvisitedDestinations.value[0],
    );

  // == Subscriptions ==
  // Subscribe to changes in the game state
  function subscribe(callback: (state: GameState) => void, state?: GameState) {
    stateSubscribers.push((newState) => {
      if (state === undefined || state === newState) callback(newState);
    });
  }

  // Game state watcher
  watch(state, (newState) => {
    stateSubscribers.forEach((subscriber) => subscriber(newState));
  });

  function purchaseSupplies(type: SupplyType, amount: number) {
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
    union,
    confederacy,
    money,
    days,
    distance,
    marchSpeed,
    visitedDestinations,
    unvisitedDestinations,
    previousDestination,
    nextDestination,
    supplies,
    subscribe,
    purchaseSupplies,
    // Speech Box Variables & Methods
    speechBox,
    speechBoxTitle,
    speechBoxTextToDisplay,
    showSpeechBox,
    hideSpeechBox,
  };
});

export default useGame;
