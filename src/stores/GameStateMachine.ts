import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

// === Constants ===
import GameState from '@/data/GameState';
import MARCHING_SPEEDS, { MarchingSpeed } from '@/data/MarchingSpeeds';
import RATION_FREQUENCIES, { RationFrequency } from '@/data/RationFrequency';
import SUPPLY_COSTS, { SupplyType } from '@/data/SupplyCosts';
import DESTINATIONS, { Destination } from '@/data/Destinations';
import DestinationActions from '@/data/DestinationActions';
import MilitaryForce from '@/data/MilitaryForce';
import GameDate, { Months } from '@/data/GameDate';
import Constants from '@/data/Constants';
import { chanceMultiple, randomInt } from '@/utils/Random';
import { calibrateLinear } from '@/utils/Range';
import TownFeatures from '@/data/TownFeatures';
import { wait } from '@/utils/Wait';

// === Types ===
// K/V pair of destination name and another K/V pair of destination actions and any data that may be associated with them.
type DestinationActionsPerformedDestination = {
  [key in DestinationActions]?: any;
};

type DestinationActionsPerformed = {
  [key in Destination['name']]?: DestinationActionsPerformedDestination;
};

const useGame = defineStore('game-state-machine', () => {
  // Game State Variables & Methods
  // === Refs ===
  const state = ref(GameState.INTRO),
    stateSubscribers: Array<(state: GameState, oldState: GameState) => void> =
      [],
    // == Military Forces ==
    // Union data
    union = ref<MilitaryForce>(new MilitaryForce(62_000, 100, 1, 29, 65, true)),
    // Confederacy data
    confederacy = ref<MilitaryForce>(
      new MilitaryForce(16_000, 75, 2, 34, 55, false),
    ),
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
    // Actions that have been taken at each destination
    destinationActionsPerformed = ref<DestinationActionsPerformed>({}),
    skipRationing = ref(false),
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
    }),
    confederacySupplyAvailability = computed<number>(() => {
      let baseline = 100; // 100% supply availability baseline
      let destinationsWithKilledCivilians = 0;
      for (const destination of visitedDestinations.value) {
        if (
          getDestinationAction(
            destination,
            DestinationActions.KILL_ALL_CIVILIANS,
          )?.affectsSupplyAvailability
        ) {
          destinationsWithKilledCivilians++;
        }
      }
      let destinationsWithDestroyedSupplyDepots = 0;
      for (const destination of visitedDestinations.value) {
        if (
          getDestinationAction(
            destination,
            DestinationActions.DESTROY_SUPPLY_DEPOT,
          )
        ) {
          destinationsWithDestroyedSupplyDepots++;
        }
      }

      return (
        baseline -
        destinationsWithKilledCivilians -
        destinationsWithDestroyedSupplyDepots * 14
      );
    });

  // == Subscriptions ==
  // Subscribe to changes in the game state
  function subscribe(
    callback: (state: GameState, oldState: GameState) => void,
    state?: GameState,
  ) {
    stateSubscribers.push((newState, oldState) => {
      if (state === undefined || state === newState)
        callback(newState, oldState);
    });
  }

  // Game state watcher
  watch(state, (newState, oldState) => {
    stateSubscribers.forEach((subscriber) => subscriber(newState, oldState));
  });

  // == Destination Actions Manager Methods ==
  // Add an action to the list of actions performed at the current destination
  function addDestinationAction(
    dest: Destination,
    action: DestinationActions,
    data: any,
  ): DestinationActionsPerformedDestination {
    if (destinationActionsPerformed.value[dest.name] === undefined)
      destinationActionsPerformed.value[dest.name] = {};
    if (destinationActionsPerformed.value[dest.name]![action] === undefined)
      destinationActionsPerformed.value[dest.name]![action] = data;
    return destinationActionsPerformed.value[dest.name]!;
  }

  // Get all actions performed at a destination
  function getDestinationActions(
    dest: Destination,
  ): DestinationActionsPerformedDestination | undefined {
    return destinationActionsPerformed.value[dest.name];
  }

  // Get specific action performed at a destination
  function getDestinationAction(
    dest: Destination,
    action: DestinationActions,
  ): any | null {
    if (destinationActionsPerformed.value[dest.name] === undefined) return null;
    return destinationActionsPerformed.value[dest.name]![action] ?? null;
  }

  // == Game State Methods ==
  // Purchase supplies during REQUISITION_SUPPLIES state
  function purchaseSupplies(type: SupplyType, amount: number) {
    supplies.value[type] += amount * SUPPLY_COSTS[type].amount;
    money.value -= amount * SUPPLY_COSTS[type].value;
  }

  // March and calculate the results of the march.
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

    // Calculate the number of exhausted soldiers who will die.
    // We do this first so that the newly exhausted soldiers don't immediately die.
    const deadExhaustedSoldiers = chanceMultiple(
      exhaustionChance,
      union.value.exhausted,
    );
    // Subtract the newly dead soldiers from the number of exhausted soldiers.
    union.value.exhausted -= deadExhaustedSoldiers;
    // Add the newly dead soldiers to the number of dead soldiers.
    union.value.dead += deadExhaustedSoldiers;

    // Calculate the number of soldiers who become exhausted.
    const exhaustedSoldiers = chanceMultiple(
      exhaustionChance,
      union.value.alive,
    );
    // Subtract the newly exhausted soldiers from the number of alive soldiers.
    union.value.alive -= exhaustedSoldiers;
    // Add the newly exhausted soldiers to the number of exhausted soldiers.
    union.value.exhausted += exhaustedSoldiers;

    // TODO: Add a chance for the Union to encounter a Confederate force and engage in combat.

    // If we have reached the next destination, set the game state to DESTINATION_INTRO.
    if (currentDestination.value !== null)
      state.value = GameState.DESTINATION_INTRO;

    // Advance the day.
    advanceDay();
    // Return the results of the march.
    return {
      distanceTraveled,
      exhaustedSoldiers,
      deadExhaustedSoldiers,
    };
  }

  // Advance the day and calculate the results of the day.
  function advanceDay() {
    let results = {
      fedSoldiers: false,
      deadInfectedSoldiers: 0,
      recoveredWoundedSoldiers: 0,
      infectedWoundedSoldiers: 0,
    };
    if (!skipRationing.value) {
      const { cost, commit } = union.value.ration(
        RATION_FREQUENCIES[rationFrequency.value].amount,
      );

      if (supplies.value.food >= cost) {
        results.fedSoldiers = true;
        supplies.value.food -= cost;
        commit();
      } else {
        showToast(
          'You do not have enough food to feed all of your soldiers. None of your soldiers were fed yesterday.',
          10000,
        );
      }
    } else
      showToast(
        'You have chosen to skip rationing. None of your soldiers were fed yesterday.',
        10000,
      );
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
    // Allow the Confederacy to recover a small amount of morale.
    confederacy.value.morale += 2;
    // Call onDayAdvance functions for both forces.
    union.value.onDayAdvance();
    confederacy.value.onDayAdvance();
    // Advance the day.
    days.value.step();
    // Set skipRationing for the next day according to the ration frequency.
    skipRationing.value = !RATION_FREQUENCIES[
      rationFrequency.value
    ].rationRequirement(days.value.elapsed);
    // Return the results of the day.
    return results;
  }

  // Search for supplies at a destination and calculate the results of the search.
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
    // Save the action performed, and the supplies found.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.SEARCH_FOR_SUPPLIES,
      results,
    );
    // Return the results of the search.
    return results;
  }

  // Kill civilians at a destination and calculate the results of the killing.
  function killCivilians(leadersOnly: boolean = false) {
    const results = {
      civiliansKilled: 0,
      moraleChange: 0,
      affectsSupplyAvailability: !leadersOnly,
    };
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no population, return early.
    if (currentDestination.value.population === 0) return 0;
    // Calculate the number of civilians to kill.
    results.civiliansKilled = leadersOnly
      ? randomInt(1, 5)
      : randomInt(
          currentDestination.value.population -
            currentDestination.value.population / 3,
          currentDestination.value.population,
        );
    // Calculate how much that affects the Confederacy's morale.
    const moraleChange =
      results.civiliansKilled / currentDestination.value.population;
    results.moraleChange = Math.floor(
      calibrateLinear(moraleChange, [
        {
          input: 0,
          output: 0,
        },
        {
          input: 1,
          output: confederacy.value.morale / 8,
        },
      ]),
    );
    confederacy.value.morale -= results.moraleChange;
    advanceDay();
    // Save the action performed, and the number of civilians killed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.KILL_ALL_CIVILIANS,
      results,
    );
    // Return the number of civilians killed.
    return results;
  }

  // Destroy a destination's railroad and calculate the results of the destruction.
  function destroyRailroad() {
    const results = {
      moraleChange: 0,
    };
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no railroad, return early.
    if (!(currentDestination.value.features & TownFeatures.RAILROADS)) return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    advanceDay();
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_RAILROAD,
      results,
    );
    // Return the results of the destruction.
    return results;
  }

  // Destroy a destination's supply depot and calculate the results of the destruction.
  function destroySupplyDepot() {
    const results = {
      moraleChange: 0,
    };
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no supply depot, return early.
    if (!(currentDestination.value.features & TownFeatures.SUPPLY_DEPOT))
      return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    advanceDay();
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_SUPPLY_DEPOT,
      results,
    );
    // Return the results of the destruction.
    return results;
  }

  // Destroy a destination's agriculture and calculate the results of the destruction.
  function destroyAgriculture() {
    const results = {
      moraleChange: 0,
    };
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no agriculture, return early.
    if (!(currentDestination.value.features & TownFeatures.AGRICULTURE))
      return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    advanceDay();
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_AGRICULTURE,
      results,
    );
    // Return the results of the destruction.
    return results;
  }

  // Destroy a destination's industry and calculate the results of the destruction.
  function destroyIndustry() {
    const results = {
      moraleChange: 0,
    };
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no industry, return early.
    if (!(currentDestination.value.features & TownFeatures.INDUSTRY)) return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    advanceDay();
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_INDUSTRY,
      results,
    );
    // Return the results of the destruction.
    return results;
  }

  function useMedkits(amount: number, injuriesToHeal: 'wounded' | 'infected') {
    if (supplies.value.medkits < amount) return false;
    supplies.value.medkits -= amount;
    if (injuriesToHeal === 'wounded') {
      union.value.wounded -= amount;
      union.value.alive += amount;
    } else if (injuriesToHeal === 'infected') {
      union.value.infected -= amount;
      union.value.alive += amount;
    }
    return true;
  }

  // === Toast Variables & Methods ===
  const toast = ref(false),
    toastMessage = ref(''),
    toastTimeout = ref<ReturnType<typeof setTimeout>>();

  async function showToast(message: string, duration: number = 5000) {
    // If a toast is already showing, hide it.
    if (toast.value) await hideToast();
    toastMessage.value = message;
    toast.value = true;
    await wait(100);
    toastTimeout.value = setTimeout(hideToast, duration);
  }

  async function hideToast() {
    clearTimeout(toastTimeout.value!);
    await wait(100);
    toast.value = false;
  }

  return {
    // Game State Variables & Methods
    state,
    union,
    confederacy,
    confederacySupplyAvailability,
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
    destinationActionsPerformed,
    skipRationing,
    subscribe,
    addDestinationAction,
    getDestinationActions,
    getDestinationAction,
    purchaseSupplies,
    march,
    advanceDay,
    searchForSupplies,
    killCivilians,
    destroyRailroad,
    destroySupplyDepot,
    destroyAgriculture,
    destroyIndustry,
    useMedkits,
    // Toast Variables & Methods
    toast,
    toastMessage,
    showToast,
    hideToast,
  };
});

export default useGame;
