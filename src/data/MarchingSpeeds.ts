const MARCHING_SPEEDS = {
  leisurely: {
    value: 4, // Miles per day
    exhaustionChance: 1, // Percent chance of a soldier becoming exhausted while marching at this pace (out of 100)
  },
  normal: {
    value: 6,
    exhaustionChance: 2,
  },
  fast: {
    value: 8,
    exhaustionChance: 8,
  },
  grueling: {
    value: 10,
    exhaustionChance: 20,
  },
};

export type MarchingSpeed = keyof typeof MARCHING_SPEEDS;

export default MARCHING_SPEEDS;
