export enum Months {
  January = 1,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
}

export const daysInMonth: Record<Months, number> = {
  [Months.January]: 31,
  [Months.February]: 28,
  [Months.March]: 31,
  [Months.April]: 30,
  [Months.May]: 31,
  [Months.June]: 30,
  [Months.July]: 31,
  [Months.August]: 31,
  [Months.September]: 30,
  [Months.October]: 31,
  [Months.November]: 30,
  [Months.December]: 31,
};

export type DateTuple = [Months, number];

export type GameDateState = {
  month: Months;
  day: number;
  elapsed: number;
};

export default class GameDate {
  public static fromState(state: GameDateState): GameDate {
    const date = new GameDate(state.month, state.day);
    date._elapsed = state.elapsed;
    return date;
  }

  private _month: Months;
  private _day: number;
  private _elapsed: number = 0;

  constructor(month: Months = Months.January, day: number = 1) {
    this._month = month;
    this._day = day;
  }

  public get month(): Months {
    return this._month;
  }

  public get day(): number {
    return this._day;
  }

  public get elapsed(): number {
    return this._elapsed;
  }

  public get initialDate(): DateTuple {
    // Use elapsed days to calculate the initial day from the current date (this._month and this._day)
    let elapsed = this._elapsed;
    let month = this._month;
    let day = this._day;
    while (elapsed > 0) {
      if (elapsed >= daysInMonth[month]) {
        elapsed -= daysInMonth[month];
        month++;
        if (month > Months.December) {
          month = Months.January;
        }
      } else {
        day += elapsed;
        elapsed = 0;
      }
    }
    return [month, day];
  }

  public get initialMonth(): Months {
    return this.initialDate[0];
  }

  public get initialDay(): number {
    return this.initialDate[1];
  }

  public get state(): GameDateState {
    return {
      month: this._month,
      day: this._day,
      elapsed: this._elapsed,
    };
  }

  public get daysInMonth(): number {
    return daysInMonth[this._month];
  }

  public get isLastDayOfMonth(): boolean {
    return this._day === this.daysInMonth;
  }

  public get isLastDayOfYear(): boolean {
    return this._month === Months.December && this.isLastDayOfMonth;
  }

  public step(): void {
    if (this.isLastDayOfYear) {
      this._month = Months.January;
      this._day = 1;
    } else if (this.isLastDayOfMonth) {
      this._month++;
      this._day = 1;
    } else {
      this._day++;
    }
    this._elapsed++;
  }

  public toString(shorthand: boolean = true): string {
    return shorthand
      ? `${this._month}/${this._day}`
      : `${Months[this._month]} ${this._day}`;
  }
}
