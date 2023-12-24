import MilitaryForces from '@/data/MilitaryForces';

// Default values for the Confederate army
const Confederacy: MilitaryForces = {
  units: {
    alive: 16_000,
    injured: null, // We won't be keeping track of the Confederacy's injured soldiers
    dead: 0,
  },
  morale: 75, // The Confederacy lost the Battle of Atlanta, so their morale is 75% at the start of the game
  accuracy: 75,
  strength: 2, // Even though the Confederacy lacked numbers, they made up for it with superior training compared to the Union
  retreatThreshold: 55, // The Confederacy was slightly more willing to retreat than the Union to preserve their numbers
};

export default Confederacy;
