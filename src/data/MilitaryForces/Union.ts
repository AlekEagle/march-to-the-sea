import MilitaryForces from '@/data/MilitaryForces';

// Default values for the Union army
const Union: MilitaryForces = {
  units: {
    alive: 62_000,
    injured: {
      exhaustion: 0,
      wounded: 0,
      infected: 0,
    },
    dead: 0,
  },
  morale: 100, // Default morale for the Union is 100% after capturing Atlanta
  accuracy: 85,
  strength: 1,
  retreatThreshold: 65,
};

export default Union;
