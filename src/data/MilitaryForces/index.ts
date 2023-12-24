interface Units {
  alive: number;
  injured: {
    exhaustion: number;
    wounded: number;
    infected: number;
  } | null;
  dead: number;
}

export default interface MilitaryForces {
  units: Units;
  morale: number; // A percentage (out of 100) (Influences statistics like strength, accuracy, and retreatThreshold)
  strength: number; // A K/D ratio of sorts
  accuracy: number; // A percentage (out of 100)
  retreatThreshold: number; // The percentage of units that must be lost during a battle before the army retreats (out of 100)
}
