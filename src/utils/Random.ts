// Generate a random integer between min and max (inclusive)
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// A function to choose a random element from an array/list of parameters
export function choose<T>(...args: T[]): T {
  return args[Math.floor(Math.random() * args.length)];
}

// A function to determine if a random event should occur based on a percentage
// Percent should be an integer between 0 and 100
export function chance(percent: number): boolean {
  return Math.random() < percent / 100;
}
