// A function to choose a random element from an array/list of parameters

export default function choose<T>(...args: T[]): T {
  return args[Math.floor(Math.random() * args.length)];
}
