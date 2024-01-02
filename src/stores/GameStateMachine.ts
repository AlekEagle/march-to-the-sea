import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

// === Constants ===
import GameState from '@/data/GameState';
import MARCHING_SPEEDS, { MarchingSpeed } from '@/data/MarchingSpeeds';
import RATION_FREQUENCIES, { RationFrequency } from '@/data/RationFrequency';
import SUPPLY_COSTS, { SupplyType } from '@/data/SupplyCosts';
import DESTINATIONS, { Destination } from '@/data/Destinations';
import MilitaryForce from '@/data/MilitaryForce';
import GameDate, { Months } from '@/data/GameDate';
import Constants from '@/data/Constants';
import { chanceMultiple, randomInt } from '@/utils/Random';
import { calibrateLinear } from '@/utils/Range';

const useGame = defineStore('game-state-machine', () => {
  // Game State Variables & Methods
  // === Refs ===
  const state = ref(GameState.INTRO),
    stateSubscribers: Array<(state: GameState) => void> = [],
    // == Military Forces ==
    // Union data
    union = ref<MilitaryForce>(new MilitaryForce(62_000, 100, 1, 85, 65, true)),
    // Confederacy data
    confederacy = ref<MilitaryForce>(
      new MilitaryForce(16_000, 75, 2, 89, 55, false),
    ), // Create a clone of the Confederacy object since we'll be modifying it
    // == Game State Variables ==
    money = ref(Constants.DEFAULT_MONEY),
    days = ref(new GameDate(Months.November, 15)),
    distance = ref(0), // Miles from Atlanta
    marchSpeed = ref<MarchingSpeed>(Constants.DEFAULT_MARCH_SPEED),
    rationFrequency = ref<RationFrequency>(Constants.DEFAULT_RATION_FREQUENCY),
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
    ),
    distanceToNextDestination = computed<number>(() => {
      if (nextDestination.value === undefined) return 0;
      return nextDestination.value.distance - distance.value;
    }),
    // The current destination, if any
    currentDestination = computed<Destination | null>(() => {
      const destination = DESTINATIONS.find(
        (destination) => destination.distance === distance.value,
      );
      return destination ?? null;
    });

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

  // == Game State Methods ==
  // Purchase supplies during REQUISITION_SUPPLIES state
  function purchaseSupplies(type: SupplyType, amount: number) {
    supplies.value[type] += amount * SUPPLY_COSTS[type].amount;
    money.value -= amount * SUPPLY_COSTS[type].value;
  }

  function march() {
    // Calculate the distance we'll travel.
    const distanceTraveled = Math.min(
      MARCHING_SPEEDS[marchSpeed.value].value,
      distanceToNextDestination.value,
    );
    // Update the distance.
    distance.value += distanceTraveled;
    // Update the nutrition of the soldiers based on the distance traveled. (1 mile = 1 nutrition)
    union.value.nutrition -= distanceTraveled;

    // Calculate the number of soldiers who become exhausted.
    const exhaustionChance =
      union.value.susceptibilityMultiplier *
      MARCHING_SPEEDS[marchSpeed.value].exhaustionChance;
    // Calculate the number of soldiers who become exhausted.
    const exhaustedSoldiers = chanceMultiple(
      exhaustionChance,
      union.value.alive,
    );
    // Subtract the newly exhausted soldiers from the number of alive soldiers.
    union.value.alive -= exhaustedSoldiers;
    // Add the newly exhausted soldiers to the number of exhausted soldiers.
    union.value.exhausted += exhaustedSoldiers;
    // Calculate the number of exhausted soldiers who will die.
    const deadExhaustedSoldiers = chanceMultiple(
      exhaustionChance,
      exhaustedSoldiers,
    );
    // Subtract the newly dead soldiers from the number of exhausted soldiers.
    union.value.exhausted -= deadExhaustedSoldiers;
    // Add the newly dead soldiers to the number of dead soldiers.
    union.value.dead += deadExhaustedSoldiers;

    // Advance the day.
    // Return the results of the march.
    return {
      distanceTraveled,
      exhaustedSoldiers,
      deadExhaustedSoldiers,
    };
  }

  function advanceDay() {
    let results = {
      fedSoldiers: false,
      deadInfectedSoldiers: 0,
      recoveredWoundedSoldiers: 0,
      infectedWoundedSoldiers: 0,
    };
    if (
      RATION_FREQUENCIES[rationFrequency.value].rationRequirement(
        days.value.day,
      )
    ) {
      const { cost, commit } = union.value.ration(
        RATION_FREQUENCIES[rationFrequency.value].amount,
      );

      // TODO: Give the user the ability to decide if they ration for the day or not.

      if (supplies.value.food >= cost) {
        results.fedSoldiers = true;
        supplies.value.food -= cost;
        commit();
      }
    }
    // Kill infected soldiers from yesterday
    results.deadInfectedSoldiers = union.value.infected;
    union.value.dead += union.value.infected;
    union.value.infected = 0;
    // Calculate the number of soldiers who become infected.
    results.infectedWoundedSoldiers = chanceMultiple(
      Constants.WOUNDED_INFECTION_CHANCE,
      union.value.wounded,
    );
    // Calculate the number of soldiers who recover from their wounds.
    results.recoveredWoundedSoldiers =
      union.value.wounded - results.infectedWoundedSoldiers;
    // Set wounded to 0, as they are either recovered or infected now.
    union.value.wounded = 0;
    union.value.infected = results.infectedWoundedSoldiers;
    union.value.alive += results.recoveredWoundedSoldiers;
    // Advance the day.
    days.value.step();
    // Return the results of the day.
    return results;
  }

  function searchForSupplies() {
    const results = {
      food: 0,
      bullets: 0,
      powder: 0,
      medkits: 0,
    };
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return results;
    // Calculate how many supplies we will find.
    results.food = randomInt(
      currentDestination.value.supplies.food.min,
      currentDestination.value.supplies.food.max,
    );
    results.bullets = randomInt(
      currentDestination.value.supplies.bullets.min,
      currentDestination.value.supplies.bullets.max,
    );
    results.powder = randomInt(
      currentDestination.value.supplies.powder.min,
      currentDestination.value.supplies.powder.max,
    );
    results.medkits = randomInt(
      currentDestination.value.supplies.medkits.min,
      currentDestination.value.supplies.medkits.max,
    );
    // Add the supplies to our inventory.
    supplies.value.food += results.food;
    supplies.value.bullets += results.bullets;
    supplies.value.powder += results.powder;
    supplies.value.medkits += results.medkits;

    // Advance the day.
    advanceDay();
    // Return the results of the search.
    return results;
  }

  function killCivilians(leadersOnly: boolean = false) {
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no population, return early.
    if (currentDestination.value.population === 0) return 0;
    // Calculate the number of civilians to kill.
    const civiliansKilled = leadersOnly
      ? randomInt(1, 5)
      : randomInt(1, currentDestination.value.population);
    // Calculate how much that affects the Confederacy's morale.
    const moraleChange = civiliansKilled / currentDestination.value.population;
    confederacy.value.morale -= Math.floor(
      calibrateLinear(moraleChange, [
        {
          input: 0,
          output: 0,
        },
        {
          input: 1,
          output: confederacy.value.morale / 6,
        },
      ]),
    );
    advanceDay();
  }

  // == Speech Box Variables & Methods ==
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
        await new Promise((resolve) =>
          setTimeout(resolve, Constants.SPEECH_BOX_TEXT_SPEED * 10),
        );
      else
        await new Promise((resolve) =>
          setTimeout(resolve, Constants.SPEECH_BOX_TEXT_SPEED),
        );
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
    rationFrequency,
    visitedDestinations,
    unvisitedDestinations,
    previousDestination,
    nextDestination,
    currentDestination,
    supplies,
    subscribe,
    purchaseSupplies,
    march,
    advanceDay,
    searchForSupplies,
    killCivilians,
    // Speech Box Variables & Methods
    speechBox,
    speechBoxTitle,
    speechBoxTextToDisplay,
    showSpeechBox,
    hideSpeechBox,
  };
});

export default useGame;
