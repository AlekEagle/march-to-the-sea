import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// === Constants ===
import GameState from '@/data/GameState';
import MARCHING_SPEEDS, { MarchingSpeed } from '@/data/MarchingSpeeds';
import RATION_FREQUENCIES, { RationFrequency } from '@/data/RationFrequency';
import SUPPLY_COSTS, { SupplyType } from '@/data/SupplyCosts';
import DESTINATIONS, { Destination } from '@/data/Destinations';
import DestinationActions from '@/data/DestinationActions';
import MilitaryForce from '@/data/MilitaryForce';
import GameDate, { Months, GameDateState } from '@/data/GameDate';
import Constants from '@/data/Constants';
import { chanceMultiple, randomInt } from '@/utils/Random';
import { calibrateExponential, calibrateLinear } from '@/utils/Range';
import TownFeatures from '@/data/TownFeatures';
import SubscriptionService, {
  StateSubscriptionId,
  StateSubscriptionCallback,
} from '@/utils/SubscriptionService';
import { useToast, TYPE as ToastType, POSITION } from 'vue-toastification';
import { ToastID } from 'vue-toastification/dist/types/types';

// === Types ===

// K/V pair of destination name and another K/V pair of destination actions and any data that may be associated with them.
export type DestinationActionsPerformedDestination = {
  [key in DestinationActions]?: any;
};

export type DestinationActionsPointer = {
  location: (typeof DESTINATIONS)[number]['name'];
  action: DestinationActions;
};

export type DestinationActionsPerformed = {
  [key in (typeof DESTINATIONS)[number]['name']]?: DestinationActionsPerformedDestination;
};

export type DayResults = {
  fedSoldiers: number;
  deadInfectedSoldiers: number;
  recoveredWoundedSoldiers: number;
  infectedWoundedSoldiers: number;
  recoveredExhaustedSoldiers: number;
  starvedUnits: {
    alive: number;
    exhausted: number;
    wounded: number;
    infected: number;
  };
};

export type MarchResults = {
  distanceTraveled: number;
  exhaustedSoldiers: number;
  deadExhaustedSoldiers: number;
};

export type MedkitResults = {
  healedWounded: number;
  healedInfected: number;
};

// TODO: EncounterResults type

export type DailyResults = {
  day: DayResults | null;
  march: MarchResults | null;
  destinationAction: DestinationActionsPointer | null;
  medkit: MedkitResults | null;
  encounter: any | null; // TODO: EncounterResults type
};

export type DailyResultsRecord = [GameDateState, DailyResults];

const useGame = defineStore('game-state-machine', () => {
  // Internal Toast Variables & Methods
  const toast = useToast();
  // Game State Variables & Methods
  // === Refs ===
  const state = ref(GameState.INTRO),
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
    // Daily results for historical data
    dailyResults = ref<DailyResultsRecord[]>([]),
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
    }),
    isDebug = computed<boolean>(() => import.meta.env.DEV);

  // == Subscriptions ==

  // Create a subscription service for the game state.
  const subscriptionService = new SubscriptionService(state);

  // Function to allow components to subscribe to the game state.
  function subscribe(
    callback: StateSubscriptionCallback<GameState>,
    stateToMatch?: GameState,
    callbackOnNoMatch?: StateSubscriptionCallback<GameState>,
  ): StateSubscriptionId {
    return subscriptionService.subscribe(
      callback,
      stateToMatch,
      callbackOnNoMatch,
    );
  }

  // Function to allow components to unsubscribe from the game state.
  function unsubscribe(subscriptionId: StateSubscriptionId): void {
    subscriptionService.unsubscribe(subscriptionId);
  }

  // Debugging function to print changes to the game state to the console.
  subscribe((newState, oldState) => {
    console.log(
      `Game State Changed: ${GameState[oldState]}(${oldState}) -> ${GameState[newState]}(${newState})`,
    );
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
    // Add the action to the daily results.
    addDailyDestinationActionResults(
      {
        location: dest.name,
        action,
      },
      days.value.state,
    );
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

  // == Daily Results Manager Methods ==
  // Add the results of a day to the daily results
  function addDailyDayResults(results: DayResults, day: GameDateState) {
    // Check if there are already results for this day
    const existingResults = dailyResults.value.find(
      (dailyResults) => dailyResults[0].elapsed === day.elapsed,
    );
    // If there are, check they already have a day result
    if (existingResults !== undefined) {
      if (existingResults[1].day !== null) {
        // If they do, throw an error
        throw new Error(
          `Attempted to add day results for day ${day.elapsed}, but day results already exist for that day.`,
        );
      } else {
        // If they don't, add the day results
        existingResults[1].day = results;
      }
    } else {
      // If there aren't, add the day results
      dailyResults.value.push([
        day,
        {
          day: results,
          march: null,
          destinationAction: null,
          encounter: null,
          medkit: null,
        },
      ]);
    }
  }

  // Add the results of a march to the daily results
  function addDailyMarchResults(results: MarchResults, day: GameDateState) {
    // Check if there are already results for this day
    const existingResults = dailyResults.value.find(
      (dailyResults) => dailyResults[0].elapsed === day.elapsed,
    );
    // If there are, check they already have a march result
    if (existingResults !== undefined) {
      if (existingResults[1].march !== null) {
        // If they do, throw an error
        throw new Error(
          `Attempted to add march results for day ${day.elapsed}, but march results already exist for that day.`,
        );
      } else {
        // If they don't, add the march results
        existingResults[1].march = results;
      }
    } else {
      // If there aren't, add the march results
      dailyResults.value.push([
        day,
        {
          day: null,
          march: results,
          destinationAction: null,
          encounter: null,
          medkit: null,
        },
      ]);
    }
  }

  // Add the results of a medkit use to the daily results
  function addDailyMedkitResults(results: MedkitResults, day: GameDateState) {
    // Check if there are already results for this day
    const existingResults = dailyResults.value.findIndex(
      (dailyResults) => dailyResults[0].elapsed === day.elapsed,
    );
    // If there are, check they already have a medkit result
    if (existingResults !== -1) {
      if (dailyResults.value[existingResults][1].medkit !== null) {
        // If they do, sum the existing results with the new results
        dailyResults.value[existingResults][1].medkit!.healedWounded +=
          results.healedWounded;
        dailyResults.value[existingResults][1].medkit!.healedInfected +=
          results.healedInfected;
      } else {
        // If they don't, add the medkit results
        dailyResults.value[existingResults][1].medkit = results;
      }
    } else {
      // If there aren't, add the medkit results
      dailyResults.value.push([
        day,
        {
          day: null,
          march: null,
          destinationAction: null,
          encounter: null,
          medkit: results,
        },
      ]);
    }
  }

  // Add the results of a destination action to the daily results
  function addDailyDestinationActionResults(
    results: DestinationActionsPointer,
    day: GameDateState,
  ) {
    // Check if there are already results for this day
    const existingResults = dailyResults.value.find(
      (dailyResults) => dailyResults[0].elapsed === day.elapsed,
    );
    // If there are, check they already have a destination action result
    if (existingResults !== undefined) {
      if (existingResults[1].destinationAction !== null) {
        // If they do, throw an error
        throw new Error(
          `Attempted to add destination action results for day ${day.elapsed}, but destination action results already exist for that day.`,
        );
      } else {
        // If they don't, add the destination action results
        existingResults[1].destinationAction = results;
      }
    } else {
      // If there aren't, add the destination action results
      dailyResults.value.push([
        day,
        {
          day: null,
          march: null,
          destinationAction: results,
          encounter: null,
          medkit: null,
        },
      ]);
    }
  }

  function getDailyResults(day: GameDateState) {
    const results = dailyResults.value.find(
      (dailyResults) => dailyResults[0].elapsed === day.elapsed,
    );
    return results?.[1];
  }

  // TODO: Add encounter results

  // == Game State Methods ==
  // Purchase supplies during REQUISITION_SUPPLIES state
  function purchaseSupplies(type: SupplyType, amount: number) {
    supplies.value[type] += amount * SUPPLY_COSTS[type].amount;
    money.value -= amount * SUPPLY_COSTS[type].value;
  }

  // March and calculate the results of the march.
  function march() {
    // Debounce the march button.
    if (state.value !== GameState.MARCHING) return;
    // Create a variable to store the results of the march.
    const results = {
      distanceTraveled: 0,
      exhaustedSoldiers: 0,
      deadExhaustedSoldiers: 0,
    };
    // Calculate the distance we'll travel.
    results.distanceTraveled = Math.min(
      MARCHING_SPEEDS[marchSpeed.value].value,
      distanceToNextDestination.value,
    );
    // Update the distance.
    distance.value += results.distanceTraveled;
    // Update the nutrition of the soldiers based on the distance traveled. (1 mile = 1 nutrition)
    union.value.nutrition -= results.distanceTraveled;

    // Calculate the number of soldiers who become exhausted.
    const exhaustionChance = Math.floor(
      union.value.exhaustionSusceptibilityMultiplier *
        MARCHING_SPEEDS[marchSpeed.value].exhaustionChance,
    );

    // Calculate the number of exhausted soldiers who will die.
    // We do this first so that the newly exhausted soldiers don't immediately die.
    results.deadExhaustedSoldiers = chanceMultiple(
      exhaustionChance,
      union.value.exhausted,
    );
    // Subtract the newly dead soldiers from the number of exhausted soldiers.
    union.value.exhausted -= results.deadExhaustedSoldiers;
    // Add the newly dead soldiers to the number of dead soldiers.
    union.value.dead += results.deadExhaustedSoldiers;

    // Calculate the number of soldiers who become exhausted.
    results.exhaustedSoldiers = chanceMultiple(
      exhaustionChance,
      union.value.alive,
    );
    // Subtract the newly exhausted soldiers from the number of alive soldiers.
    union.value.alive -= results.exhaustedSoldiers;
    // Add the newly exhausted soldiers to the number of exhausted soldiers.
    union.value.exhausted += results.exhaustedSoldiers;

    // TODO: Add a chance for the Union to encounter a Confederate force and engage in combat.

    // If we have reached the next destination, set the game state to DESTINATION_INTRO.
    if (currentDestination.value !== null)
      state.value = GameState.DESTINATION_INTRO;

    // Add march results to the daily results.
    addDailyMarchResults(results, days.value.state);
    // Advance the day.
    advanceDay();
    // Return the results of the march.
    return results;
  }

  // Advance the day and calculate the results of the day.
  function advanceDay() {
    let results = {
      fedSoldiers: 0,
      deadInfectedSoldiers: 0,
      recoveredWoundedSoldiers: 0,
      infectedWoundedSoldiers: 0,
      recoveredExhaustedSoldiers: 0,
      starvedUnits: {
        alive: 0,
        exhausted: 0,
        wounded: 0,
        infected: 0,
      },
    };
    // Ration food for the day.
    if (!skipRationing.value) {
      const { cost, commit } = union.value.ration(
        RATION_FREQUENCIES[rationFrequency.value].amount,
      );

      if (supplies.value.food >= cost) {
        results.fedSoldiers = RATION_FREQUENCIES[rationFrequency.value].amount;
        supplies.value.food -= cost;
        commit();
      } else {
        showToast(
          'You do not have enough food to feed all of your soldiers. None of your soldiers were fed yesterday.',
          'WARNING',
        );
      }
    } else
      showToast(
        'You have chosen to skip rationing. None of your soldiers were fed yesterday.',
        'WARNING',
      );
    // Do starvation calculations.
    results.starvedUnits = union.value.doStarve();
    // Get daily results from today (we haven't advanced the day yet)
    const yesterdayResults = getDailyResults(days.value);
    // Don't allow exhaustion recovery if they marched today.
    if (!yesterdayResults?.march) {
      // Calculate the rate at which soldiers recover from exhaustion.
      const exhaustionRecoveryRate = Math.floor(
        calibrateExponential(union.value.nutrition, [
          {
            input: 50,
            output: 0,
          },
          {
            input: 100,
            output: 95,
          },
        ]),
      );
      // Calculate the number of soldiers who recover from exhaustion.
      results.recoveredExhaustedSoldiers = chanceMultiple(
        exhaustionRecoveryRate,
        union.value.exhausted,
      );
      // Subtract the newly recovered soldiers from the number of exhausted soldiers.
      union.value.exhausted -= results.recoveredExhaustedSoldiers;
      // Add the newly recovered soldiers to the number of alive soldiers.
      union.value.alive += results.recoveredExhaustedSoldiers;
    } else results.recoveredExhaustedSoldiers = 0;

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
    // Notify the player if any soldiers recovered from their wounds.
    // Set wounded to 0, as they are either recovered or infected now.
    union.value.wounded = 0;
    union.value.infected = results.infectedWoundedSoldiers;
    union.value.alive += results.recoveredWoundedSoldiers;
    // Allow the Confederacy to recover a small amount of morale.
    confederacy.value.morale += 2;
    // Add day results to the daily results.
    addDailyDayResults(results, days.value.state);
    // Advance the day.
    days.value.step();
    // Set skipRationing for the next day according to the ration frequency.
    skipRationing.value = !RATION_FREQUENCIES[
      rationFrequency.value
    ].rationRequirement(days.value.elapsed);
    // Run the end of day summary toast function.
    endOfDaySummaryToast();
    // Return the results of the day.
    return results;
  }

  function endOfDaySummaryToast() {
    // Get yesterday's results.
    const yesterdayResults = dailyResults.value[dailyResults.value.length - 1];

    // If any of the soldiers had their health status changed, notify the player.
    if (
      (yesterdayResults[1].day &&
        (yesterdayResults[1].day.recoveredWoundedSoldiers > 0 ||
          yesterdayResults[1].day.infectedWoundedSoldiers > 0 ||
          yesterdayResults[1].day.recoveredExhaustedSoldiers > 0 ||
          yesterdayResults[1].day.deadInfectedSoldiers > 0 ||
          yesterdayResults[1].day.starvedUnits.alive > 0 ||
          yesterdayResults[1].day.starvedUnits.exhausted > 0 ||
          yesterdayResults[1].day.starvedUnits.wounded > 0 ||
          yesterdayResults[1].day.starvedUnits.infected > 0)) ||
      (yesterdayResults[1].march &&
        (yesterdayResults[1].march.exhaustedSoldiers > 0 ||
          yesterdayResults[1].march.deadExhaustedSoldiers > 0))
    ) {
      showToast(
        'Yesterday, your soldiers experienced some changes in their health status. You can view the details in the military status panel.',
        'INFO',
      );
    }
  }

  // Search for supplies at a destination and calculate the results of the search.
  function searchForSupplies() {
    const results = {
      food: 0,
      bullets: 0,
      powder: 0,
      medkits: 0,
    };
    // If for some reason we already searched for supplies at this destination, return early.
    if (
      getDestinationAction(
        currentDestination.value!,
        DestinationActions.SEARCH_FOR_SUPPLIES,
      ) !== null
    )
      return results;
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

    // Save the action performed, and the supplies found.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.SEARCH_FOR_SUPPLIES,
      results,
    );
    // Advance the day.
    advanceDay();
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
    // If for some reason we already killed civilians at this destination, return early.
    if (
      getDestinationAction(
        currentDestination.value!,
        DestinationActions.KILL_ALL_CIVILIANS,
      ) !== null
    )
      return results;
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
    // Save the action performed, and the number of civilians killed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.KILL_ALL_CIVILIANS,
      results,
    );
    advanceDay();
    // Return the number of civilians killed.
    return results;
  }

  // Destroy a destination's railroad and calculate the results of the destruction.
  function destroyRailroad() {
    const results = {
      moraleChange: 0,
    };
    // If for some reason we already destroyed a railroad at this destination, return early.
    if (
      getDestinationAction(
        currentDestination.value!,
        DestinationActions.DESTROY_RAILROAD,
      ) !== null
    )
      return results;
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no railroad, return early.
    if (!(currentDestination.value.features & TownFeatures.RAILROADS)) return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_RAILROAD,
      results,
    );
    advanceDay();
    // Return the results of the destruction.
    return results;
  }

  // Destroy a destination's supply depot and calculate the results of the destruction.
  function destroySupplyDepot() {
    const results = {
      moraleChange: 0,
    };
    // If for some reason we already destroyed a supply depot at this destination, return early.
    if (
      getDestinationAction(
        currentDestination.value!,
        DestinationActions.DESTROY_SUPPLY_DEPOT,
      ) !== null
    )
      return results;
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no supply depot, return early.
    if (!(currentDestination.value.features & TownFeatures.SUPPLY_DEPOT))
      return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_SUPPLY_DEPOT,
      results,
    );
    advanceDay();
    // Return the results of the destruction.
    return results;
  }

  // Destroy a destination's agriculture and calculate the results of the destruction.
  function destroyAgriculture() {
    const results = {
      moraleChange: 0,
    };
    // If for some reason we already destroyed agriculture at this destination, return early.
    if (
      getDestinationAction(
        currentDestination.value!,
        DestinationActions.DESTROY_AGRICULTURE,
      ) !== null
    )
      return results;
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no agriculture, return early.
    if (!(currentDestination.value.features & TownFeatures.AGRICULTURE))
      return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_AGRICULTURE,
      results,
    );
    advanceDay();
    // Return the results of the destruction.
    return results;
  }

  // Destroy a destination's industry and calculate the results of the destruction.
  function destroyIndustry() {
    const results = {
      moraleChange: 0,
    };
    // If for some reason we already destroyed industry at this destination, return early.
    if (
      getDestinationAction(
        currentDestination.value!,
        DestinationActions.DESTROY_INDUSTRY,
      ) !== null
    )
      return results;
    // If we are for some reason not at a destination, return early.
    if (currentDestination.value === null) return 0;
    // If the destination has no industry, return early.
    if (!(currentDestination.value.features & TownFeatures.INDUSTRY)) return 0;
    // Calculate how much that affects the Confederacy's morale.
    results.moraleChange = Math.floor(confederacy.value.morale / 8 / 2);
    confederacy.value.morale -= results.moraleChange;
    // Save the action performed.
    addDestinationAction(
      currentDestination.value,
      DestinationActions.DESTROY_INDUSTRY,
      results,
    );
    advanceDay();
    // Return the results of the destruction.
    return results;
  }

  function useMedkits(amount: number, injuriesToHeal: 'wounded' | 'infected') {
    let results = {
      healedWounded: 0,
      healedInfected: 0,
    };
    if (supplies.value.medkits < amount) return false;
    supplies.value.medkits -= amount;
    if (injuriesToHeal === 'wounded') {
      union.value.wounded -= amount;
      union.value.alive += amount;
      results.healedWounded = amount;
    } else if (injuriesToHeal === 'infected') {
      union.value.infected -= amount;
      union.value.alive += amount;
      results.healedInfected = amount;
    }
    addDailyMedkitResults(results, days.value.state);
    return true;
  }

  // === Toast Methods ===
  // Show a toast message.
  function showToast(
    message: string,
    type: keyof typeof ToastType = 'DEFAULT',
    duration: number = 5000,
  ) {
    return toast(message, {
      position: POSITION.BOTTOM_CENTER,
      type: ToastType[type],
      timeout: duration,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
    });
  }

  // Hide a toast message.
  function hideToast(id: ToastID) {
    toast.dismiss(id);
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
    supplies,
    destinationActionsPerformed,
    skipRationing,
    dailyResults,
    visitedDestinations,
    unvisitedDestinations,
    previousDestination,
    nextDestination,
    distanceToNextDestination,
    currentDestination,
    isDebug,
    subscribe,
    unsubscribe,
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
    showToast,
    hideToast,
  };
});

export default useGame;
