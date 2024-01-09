import {
  RANK_SIZE,
  RANGED_ATTACK_LETHALITY_RATE,
  RANKS_AVAILABLE_TO_FIGHT,
} from '@/data/Constants';
import { chance, chanceMultiple } from '@/utils/Random';
import { SupplyInventory } from '@/stores/GameStateMachine';
import { Ref } from 'vue';
import MilitaryForce from './MilitaryForce';

// The possible states of an encounter.
export enum EncounterState {
  RANGED_ONLY, // Only ranged engagement, no melee.
  RANGED_MELEE, // Ranged engagement as well as melee with the first rank.
  MELEE_ONLY, // Only melee engagement, no ranged.
}

// The possible outcomes of an encounter.
export enum EncounterVictory {
  UNION_VICTORY,
  CONFEDERATE_VICTORY,
  DRAW, // I don't think I'll allow draws, but I'll leave it here for now.
}

// [round one, round two]
// true = union victory, false = confederate victory
export type MeleeResult = [boolean, boolean];

// Military data for each side of the encounter.
export type EncounterMilitary<T extends 'union' | 'confederate'> =
  T extends 'union'
    ? {
        engaged: number; // Number of soldiers engaged.
        casualties: number; // Number of soldiers killed.
        wounded: number; // Number of soldiers wounded.
        bullets: number; // Number of bullets used.
        powder: number; // Number of powder used.
      }
    : {
        engaged: number; // Number of soldiers engaged.
        casualties: number; // Number of soldiers killed.
      };

// The results of an encounter.
export interface EncounterResults {
  victory: EncounterVictory | null;
  union: EncounterMilitary<'union'>;
  confederate: EncounterMilitary<'confederate'>;
  timeStepResults: TimeStepResults<EncounterState>[];
  duration: number; // Number of time steps the encounter lasted.
}

// Melee advantage.
export enum MeleeAdvantage {
  NONE,
  UNION,
  CONFEDERATE,
}

// Melee results stub.
export interface MeleeResultsStub {
  union: {
    casualties: number;
    wounded: number;
  };
  confederacy: {
    casualties: number;
  };
}

// Military data for time steps.
export type TimeStepMilitary<T extends 'union' | 'confederate'> = {
  ranged: T extends 'union'
    ? {
        engaged: number; // Number of soldiers engaged.
        casualties: number; // Number of soldiers killed.
        wounded: number; // Number of soldiers wounded.
        bullets: number; // Number of bullets used.
        powder: number; // Number of powder used.
      }
    : {
        engaged: number; // Number of soldiers engaged.
        casualties: number; // Number of soldiers killed.
      };
  melee: T extends 'union'
    ? {
        engaged: number; // Number of soldiers engaged.
        casualties: number; // Number of soldiers killed.
        wounded: number; // Number of soldiers wounded.
      }
    : {
        engaged: number; // Number of soldiers engaged.
        casualties: number; // Number of soldiers killed.
      };
};

// Time step results.
export interface TimeStepResults<T extends EncounterState> {
  state: T;
  union: Omit<
    TimeStepMilitary<'union'>,
    T extends EncounterState.RANGED_ONLY
      ? 'melee'
      : T extends EncounterState.MELEE_ONLY
      ? 'ranged'
      : never
  >;
  confederate: Omit<
    TimeStepMilitary<'confederate'>,
    T extends EncounterState.RANGED_ONLY
      ? 'melee'
      : T extends EncounterState.MELEE_ONLY
      ? 'ranged'
      : never
  >;
}

// Add step results parameter type.
export type AddStepResults<T extends EncounterState> = Omit<
  TimeStepResults<T>,
  'state'
>;

export interface RangedSubroutineResults {
  union: TimeStepMilitary<'union'>['ranged'];
  confederate: TimeStepMilitary<'confederate'>['ranged'];
}

export interface MeleeSubroutineResults {
  union: TimeStepMilitary<'union'>['melee'];
  confederate: TimeStepMilitary<'confederate'>['melee'];
}

export type CombinedSubroutineResults = RangedSubroutineResults &
  MeleeSubroutineResults;

// The encounter class.
export default class Encounter {
  private _state: EncounterState = EncounterState.RANGED_ONLY; // All encounters start ranged only.
  private _victory: EncounterVictory | null = null;
  private _union: EncounterMilitary<'union'> = {
    engaged: 0,
    casualties: 0,
    wounded: 0,
    bullets: 0,
    powder: 0,
  };
  private _confederate: EncounterMilitary<'confederate'> = {
    engaged: 0,
    casualties: 0,
  };
  private _duration: number = 0; // Number of time steps the encounter lasted.
  private _timeStepResults: TimeStepResults<EncounterState>[] = [];

  constructor(unionUnits: number, confederateUnits: number) {
    this._union.engaged = unionUnits;
    this._confederate.engaged = confederateUnits;
  }

  public get state(): EncounterState {
    return this._state;
  }

  public get union(): EncounterMilitary<'union'> {
    return this._union;
  }

  public get confederate(): EncounterMilitary<'confederate'> {
    return this._confederate;
  }

  public get duration(): number {
    return this._duration;
  }

  public get victory(): EncounterVictory | null {
    return this._victory;
  }

  public get results(): EncounterResults {
    return {
      victory: this.victory,
      union: this.union,
      confederate: this.confederate,
      timeStepResults: this.timeStepResults,
      duration: this.duration,
    };
  }

  public get timeStepResults(): TimeStepResults<EncounterState>[] {
    return this._timeStepResults;
  }

  private addTimeStepResults(
    results:
      | RangedSubroutineResults
      | MeleeSubroutineResults
      | CombinedSubroutineResults,
  ) {
    this._timeStepResults.push({
      state: this._state,
      ...results,
    });
    return true;
  }

  private forcedRetreat(
    unionRef: Ref<MilitaryForce>,
    confederacyRef: Ref<MilitaryForce>,
  ): EncounterVictory | null {
    if (
      ((this.union.casualties + this.union.wounded) / this.union.engaged) *
        100 >=
      unionRef.value.retreatThreshold
    ) {
      return EncounterVictory.CONFEDERATE_VICTORY;
    }
    if (
      (this.confederate.casualties / this.confederate.engaged) * 100 >=
      confederacyRef.value.retreatThreshold
    ) {
      return EncounterVictory.UNION_VICTORY;
    }
    return null;
  }

  public step(
    unionRef: Ref<MilitaryForce>,
    confederacyRef: Ref<MilitaryForce>,
    suppliesRef: Ref<SupplyInventory>,
  ): void {
    // Check if either force met their forced retreat condition.
    this._victory = this.forcedRetreat(unionRef, confederacyRef);

    // Decide how to handle the combat this step.
    switch (this._state) {
      case EncounterState.RANGED_ONLY:
        this.rangedOnly(unionRef, confederacyRef, suppliesRef);
        break;
      case EncounterState.RANGED_MELEE:
        this.rangedMelee(unionRef, confederacyRef, suppliesRef);
        break;
      case EncounterState.MELEE_ONLY:
        this.meleeOnly(unionRef, confederacyRef);
        break;
    }
    this._duration++;
  }

  private rangedSubroutine(
    unionRef: Ref<MilitaryForce>,
    confederacyRef: Ref<MilitaryForce>,
    unionUnitsFiring: number,
    confederateUnitsFiring: number,
  ): RangedSubroutineResults {
    // Create the interim results object.
    let rangedResults: RangedSubroutineResults = {
      union: {
        engaged: unionUnitsFiring,
        casualties: 0,
        wounded: 0,
        bullets: 0,
        powder: 0,
      },
      confederate: {
        engaged: confederateUnitsFiring,
        casualties: 0,
      },
    };
    // Add the number of bullets and powder used to the encounter's totals.
    rangedResults.union.powder += rangedResults.union.bullets +=
      unionUnitsFiring;
    // Calculate the number of shots that hit.
    const unionShotsHit = chanceMultiple(
        unionRef.value.accuracy,
        unionUnitsFiring * 20, // 20 shots per soldier per step.
      ),
      confederateShotsHit = chanceMultiple(
        confederacyRef.value.accuracy,
        confederateUnitsFiring * 20,
      );
    // Calculate the number of casualties.
    rangedResults.union.casualties += chanceMultiple(
      RANGED_ATTACK_LETHALITY_RATE,
      confederateShotsHit,
    );
    rangedResults.confederate.casualties += chanceMultiple(
      RANGED_ATTACK_LETHALITY_RATE,
      unionShotsHit,
    );
    // Calculate the number of wounded.
    rangedResults.union.wounded += confederateShotsHit - this._union.casualties;
    return rangedResults;
  }

  private meleeSubroutine(
    unionRef: Ref<MilitaryForce>,
    confederacyRef: Ref<MilitaryForce>,
    unionUnitsFighting: number,
    confederateUnitsFighting: number,
  ): MeleeSubroutineResults {
    // Create the interim results object.
    let meleeResults = {
      union: {
        engaged: unionUnitsFighting,
        casualties: 0,
        wounded: 0,
      },
      confederate: {
        engaged: confederateUnitsFighting,
        casualties: 0,
      },
    };
    // Calculate the number of 2v1s that will occur if the forces are uneven.
    const twoOnOne = Math.abs(unionUnitsFighting - confederateUnitsFighting),
      unionAdvantage = unionUnitsFighting > confederateUnitsFighting;
    // Calculate the odds of a 2v1 resulting in a victory.
    const unionTwoOnOneStrength = unionRef.value.strength * 2,
      confederateTwoOnOneStrength = confederacyRef.value.strength * 2,
      unionTwoOnOneOdds =
        unionTwoOnOneStrength /
        (unionTwoOnOneStrength + confederacyRef.value.strength),
      confederateTwoOnOneOdds =
        unionRef.value.strength /
        (unionRef.value.strength + confederateTwoOnOneStrength);

    // Get ready to keep track of the number of soldiers left to fight.
    let unionUnitsLeft = unionUnitsFighting,
      confederateUnitsLeft = confederateUnitsFighting;

    // If there are 2v1s, calculate the number of casualties and wounded for each respective side.
    if (twoOnOne > 0) {
      // The Union has the greater number of soldiers, and thus the advantage.
      if (unionAdvantage) {
        // Calculate the number of casualties and wounded for the Union.
        let twoOnOneResults = new Array(twoOnOne).fill(0).map(() => {
          return [chance(unionTwoOnOneOdds), chance(unionTwoOnOneOdds)];
        }) as MeleeResult[];
        // Use the results to calculate the number of casualties and wounded for each side.
        const twoOnOneStub = this.processMeleeResults(
          twoOnOneResults,
          MeleeAdvantage.UNION,
        );
        meleeResults.union.casualties += twoOnOneStub.union.casualties;
        meleeResults.union.wounded += twoOnOneStub.union.wounded;
        meleeResults.confederate.casualties +=
          twoOnOneStub.confederacy.casualties;
        // Update the number of soldiers left to fight.
        unionUnitsLeft = unionUnitsFighting - twoOnOne * 2; // Multiply by 2 because each 2v1 had 2 Union soldiers.
        confederateUnitsLeft = confederateUnitsFighting - twoOnOne; // Don't multiply because there was only 1 Confederate soldier in each 2v1.
      } else {
        // Calculate the number of casualties and wounded for the Confederacy.
        let twoOnOneResults = new Array(twoOnOne).fill(0).map(() => {
          return [
            chance(confederateTwoOnOneOdds),
            chance(confederateTwoOnOneOdds),
          ];
        }) as MeleeResult[];
        // Use the results to calculate the number of casualties and wounded for each side.
        const twoOnOneStub = this.processMeleeResults(
          twoOnOneResults,
          MeleeAdvantage.CONFEDERATE,
        );
        meleeResults.union.casualties += twoOnOneStub.union.casualties;
        meleeResults.confederate.casualties +=
          twoOnOneStub.confederacy.casualties;
        // Update the number of soldiers left to fight.
        unionUnitsLeft = unionUnitsFighting - twoOnOne; // Vice versa from above.
        confederateUnitsLeft = confederateUnitsFighting - twoOnOne * 2;
      }
    }

    // Sanity check for me to make sure I didn't mess up the math.
    if (unionUnitsLeft !== confederateUnitsLeft)
      throw new Error(
        `Union units left (${unionUnitsLeft}) does not equal Confederate units left (${confederateUnitsLeft}).`,
      );

    // Calculate the number of casualties and wounded for the remaining soldiers.
    let remainingResults = new Array(unionUnitsLeft).fill(0).map(() => {
      return [chance(unionRef.value.strength), chance(unionRef.value.strength)];
    }) as MeleeResult[];

    const remainingStub = this.processMeleeResults(remainingResults);
    meleeResults.union.casualties += remainingStub.union.casualties;
    meleeResults.union.wounded += remainingStub.union.wounded;
    meleeResults.confederate.casualties += remainingStub.confederacy.casualties;

    // Finally, return the melee results.
    return meleeResults;
  }

  private processMeleeResults(
    meleeResults: MeleeResult[],
    advantage: MeleeAdvantage = MeleeAdvantage.NONE,
  ): MeleeResultsStub {
    const unionUnitCost = advantage === MeleeAdvantage.UNION ? 2 : 1,
      confederateUnitCost = advantage === MeleeAdvantage.CONFEDERATE ? 2 : 1;

    let resultsStub = {
      union: {
        casualties: 0,
        wounded: 0,
      },
      confederacy: {
        casualties: 0,
      },
    };

    meleeResults.forEach((result) => {
      // Union victory in first round.
      if (result[0]) {
        // Union victory in second round.
        if (result[1])
          resultsStub.confederacy.casualties += confederateUnitCost;
        // Union defeat in second round.
        // Since the Confederate unit did not die, but the Confederacy does not track wounded, the Confederate is considered fine.
        else resultsStub.union.wounded += unionUnitCost;
      }
      // Union defeat in first round.
      else {
        // Union victory in second round.
        // Since the Confederate unit did not die, but the Confederacy does not track wounded, the Confederate is considered fine.
        if (result[1]) resultsStub.union.wounded += unionUnitCost;
        // Union defeat in second round.
        else resultsStub.union.casualties += unionUnitCost;
      }
    });

    return resultsStub;
  }

  private rangedMelee(
    unionRef: Ref<MilitaryForce>,
    confederacyRef: Ref<MilitaryForce>,
    suppliesRef: Ref<SupplyInventory>,
  ) {
    // Create the interim results object.
    let combinedResults: CombinedSubroutineResults = {
      union: {
        engaged: 0,
        casualties: 0,
        wounded: 0,
        bullets: 0,
        powder: 0,
      },
      confederate: {
        engaged: 0,
        casualties: 0,
      },
    };
    // Calculate how many soldiers can fire this step.
    const unionUnitsFiring = Math.min(
        suppliesRef.value.bullets,
        suppliesRef.value.powder,
        this.union.engaged - (this.union.casualties + this.union.wounded),
        RANK_SIZE * RANKS_AVAILABLE_TO_FIGHT,
      ),
      confederateUnitsFiring = Math.min(
        this.confederate.engaged - this.confederate.casualties,
        RANK_SIZE * RANKS_AVAILABLE_TO_FIGHT,
      );

    // Run the ranged subroutine.
    const rangedResults = this.rangedSubroutine(
      unionRef,
      confederacyRef,
      unionUnitsFiring,
      confederateUnitsFiring,
    );
    this.addTimeStepResults(rangedResults);
    // Update the interim results.
    combinedResults.union.casualties += rangedResults.union.casualties;
    combinedResults.union.wounded += rangedResults.union.wounded;
    combinedResults.union.bullets += rangedResults.union.bullets;
    combinedResults.union.powder += rangedResults.union.powder;
    combinedResults.confederate.casualties +=
      rangedResults.confederate.casualties;

    // Calculate how many soldiers can fight this step.
    const unionUnitsFighting =
        this.union.engaged - (this.union.casualties + this.union.wounded),
      confederateUnitsFighting =
        this.confederate.engaged - this.confederate.casualties;

    // Run the melee subroutine.
    const meleeResults = this.meleeSubroutine(
      unionRef,
      confederacyRef,
      unionUnitsFighting,
      confederateUnitsFighting,
    );
    this.addTimeStepResults(meleeResults);
    // Update interim results.
    combinedResults.union.casualties += meleeResults.union.casualties;
    combinedResults.union.wounded += meleeResults.union.wounded;
    combinedResults.confederate.casualties +=
      meleeResults.confederate.casualties;

    // Update the encounter's totals.
    this._union.casualties += combinedResults.union.casualties;
    this._union.wounded += combinedResults.union.wounded;
    this._union.bullets += combinedResults.union.bullets;
    this._union.powder += combinedResults.union.powder;
    this._confederate.casualties += combinedResults.confederate.casualties;
  }

  private rangedOnly(
    unionRef: Ref<MilitaryForce>,
    confederacyRef: Ref<MilitaryForce>,
    suppliesRef: Ref<SupplyInventory>,
  ) {
    // Calculate how many soldiers can fire this step.
    const unionUnitsFiring = Math.min(
        suppliesRef.value.bullets,
        suppliesRef.value.powder,
        this.union.engaged - (this.union.casualties + this.union.wounded),
        RANK_SIZE * RANKS_AVAILABLE_TO_FIGHT,
      ),
      confederateUnitsFiring = Math.min(
        this.confederate.engaged - this.confederate.casualties,
        RANK_SIZE * RANKS_AVAILABLE_TO_FIGHT,
      );

    // Run the ranged subroutine.
    const rangedResults = this.rangedSubroutine(
      unionRef,
      confederacyRef,
      unionUnitsFiring,
      confederateUnitsFiring,
    );
    this.addTimeStepResults(rangedResults);
    // Update the encounter's totals.
    this._union.casualties += rangedResults.union.casualties;
    this._union.wounded += rangedResults.union.wounded;
    this._union.bullets += rangedResults.union.bullets;
    this._union.powder += rangedResults.union.powder;
    this._confederate.casualties += rangedResults.confederate.casualties;
  }

  private meleeOnly(
    unionRef: Ref<MilitaryForce>,
    confederacyRef: Ref<MilitaryForce>,
  ) {
    // Calculate how many soldiers can fight this step.
    const unionUnitsFighting = Math.min(
        this.union.engaged - (this.union.casualties + this.union.wounded),
        RANK_SIZE * RANKS_AVAILABLE_TO_FIGHT,
      ),
      confederateUnitsFighting = Math.min(
        this.confederate.engaged - this.confederate.casualties,
      );

    // Run the melee subroutine.
    const meleeResults = this.meleeSubroutine(
      unionRef,
      confederacyRef,
      unionUnitsFighting,
      confederateUnitsFighting,
    );
    this.addTimeStepResults(meleeResults);
    // Update the encounter's totals.
    this._union.casualties += meleeResults.union.casualties;
    this._union.wounded += meleeResults.union.wounded;
    this._confederate.casualties += meleeResults.confederate.casualties;
  }

  public advance() {
    if (++this._state > EncounterState.MELEE_ONLY)
      this._state = EncounterState.MELEE_ONLY;
  }
}
