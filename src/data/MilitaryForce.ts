import { calibrateLinear } from '@/utils/Range';

interface Units {
  alive: number;
  injured: {
    exhaustion: number;
    wounded: number;
    infected: number;
  } | null;
  dead: number;
}

export default class MilitaryForce {
  private _units: Units = {
    alive: 0,
    injured: {
      exhaustion: 0,
      wounded: 0,
      infected: 0,
    },
    dead: 0,
  };
  private _morale: number;
  private _nutrition: number = 100;

  private _baseStrength: number;
  private _baseAccuracy: number;
  private _baseRetreatThreshold: number;

  constructor(
    alive: number,
    morale: number,
    baseStrength: number,
    baseAccuracy: number,
    baseRetreatThreshold: number,
    trackInjuries: boolean = false,
  ) {
    this._units.alive = alive;
    this._morale = morale;
    this._baseRetreatThreshold = baseRetreatThreshold;
    this._baseStrength = baseStrength;
    this._baseAccuracy = baseAccuracy;
    if (!trackInjuries) this._units.injured = null;
  }

  public get alive(): number {
    return this._units.alive;
  }

  public get exhausted(): number {
    return this._units.injured?.exhaustion ?? 0;
  }

  public get wounded(): number {
    return this._units.injured?.wounded ?? 0;
  }

  public get infected(): number {
    return this._units.injured?.infected ?? 0;
  }

  public get dead(): number {
    return this._units.dead;
  }

  public set alive(alive: number) {
    this._units.alive = alive;
  }

  public set exhausted(exhausted: number) {
    if (this._units.injured) this._units.injured.exhaustion = exhausted;
  }

  public set wounded(wounded: number) {
    if (this._units.injured) this._units.injured.wounded = wounded;
  }

  public set infected(infected: number) {
    if (this._units.injured) this._units.injured.infected = infected;
  }

  public set dead(dead: number) {
    this._units.dead = dead;
  }

  public get morale(): number {
    return this._morale;
  }

  public set morale(morale: number) {
    this._morale = morale;
    if (this._morale > 100) this._morale = 100;
    else if (this._morale < 0) this._morale = 0;
  }

  public get nutrition(): number {
    return this._nutrition;
  }

  public set nutrition(nutrition: number) {
    this._nutrition = nutrition;
  }

  public get strength(): number {
    return (
      this._baseStrength *
      ((this._morale + 50) / 100) *
      ((this._nutrition + 50) / 100)
    );
  }

  // No setters for strength, accuracy, or retreatThreshold, as they are computed values.

  public get accuracy(): number {
    return Math.min(this._baseAccuracy * ((this._morale + 25) / 100), 100);
  }

  public get retreatThreshold(): number {
    return (
      this._baseRetreatThreshold +
      Math.floor(this._baseRetreatThreshold * ((this._morale + 25) / 100))
    );
  }

  public get susceptibilityMultiplier(): number {
    return calibrateLinear(this._nutrition, [
      { input: 0, output: 2 },
      { input: 100, output: 0.5 },
    ]);
  }

  public onDayAdvance() {
    this._nutrition -= 2;
    if (this._nutrition < 0) this._nutrition = 0;
  }

  public ration(count: number) {
    const addend = count * 10;
    const commit = () => {
      this._nutrition += addend;
      if (this._nutrition > 0) this._nutrition = 100;
    };
    return {
      cost:
        (this._units.alive +
          (this._units.injured?.exhaustion ?? 0) +
          (this._units.injured?.infected ?? 0) +
          (this._units.injured?.wounded ?? 0)) *
        count,
      result: this._nutrition + addend,
      commit,
    };
  }
}
