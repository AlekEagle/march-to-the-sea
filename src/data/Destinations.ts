import TownFeatures from '@/data/TownFeatures';

export interface Destination {
  name: string; // The name of the destination
  distance: number; // Miles from Atlanta
  features: TownFeatures | 0; // Features of this town (see TownFeatures enum) (0 if none)
  encounter: {
    chance: number; // Percent chance of encountering this encounter (out of 100)
    min: number; // Minimum number of Confederate units in the encounter
    max: number; // Maximum number of Confederate units in the encounter
  } | null; // Encounter details at this destination (null if none)
  description: string;
  population: number; // Civilian population
  supplies: {
    food: {
      min: number;
      max: number;
    };
    bullets: {
      min: number;
      max: number;
    };
    powder: {
      min: number;
      max: number;
    };
    medkits: {
      min: number;
      max: number;
    };
  };
}

const DESTINATIONS: Destination[] = [
  {
    name: 'Atlanta',
    distance: 0,
    features: TownFeatures.RAILROADS | TownFeatures.SUPPLY_DEPOT,
    encounter: null,
    description:
      'Atlanta is the capital of Georgia, it was an important rail and commercial hub for the Confederacy. But now it is under control of the Union.',
    population: 3_000,
    supplies: {
      food: {
        min: 270,
        max: 46_000,
      },
      bullets: {
        min: 340,
        max: 12_000,
      },
      powder: {
        min: 300,
        max: 8_000,
      },
      medkits: {
        min: 2,
        max: 36,
      },
    },
  },
  {
    name: 'Decatur',
    distance: 6,
    features: TownFeatures.RAILROADS | TownFeatures.AGRICULTURE,
    encounter: {
      chance: 4,
      min: 12,
      max: 36,
    },
    description:
      'Decatur is a small town just outside of Atlanta. It is home to a Confederate supply depot, and is the first stop on your journey.',
    population: 5_985,
    supplies: {
      food: {
        min: 12,
        max: 2_600,
      },
      bullets: {
        min: 25,
        max: 850,
      },
      powder: {
        min: 25,
        max: 850,
      },
      medkits: {
        min: 0,
        max: 14,
      },
    },
  },
  {
    name: 'McDonough',
    distance: 36,
    features: 0,
    encounter: null,
    description:
      "A tiny town with less than 250 people. The confederates aren't to be seen anywhere here.",
    population: 290,
    supplies: {
      food: {
        min: 0,
        max: 600,
      },
      bullets: {
        min: 0,
        max: 90,
      },
      powder: {
        min: 0,
        max: 300,
      },
      medkits: {
        min: 0,
        max: 6,
      },
    },
  },
  {
    name: 'Covington',
    distance: 58,
    features: TownFeatures.SUPPLY_DEPOT,
    encounter: null,
    description: 'A small supplies town with barely 1,000 people.',
    population: 1_000,
    supplies: {
      food: {
        min: 30,
        max: 2_000,
      },
      bullets: {
        min: 12,
        max: 120,
      },
      powder: {
        min: 6,
        max: 80,
      },
      medkits: {
        min: 1,
        max: 6,
      },
    },
  },
  {
    name: 'Monticello',
    distance: 84,
    features: 0,
    encounter: null,
    description: 'More of a point on the map than a town.',
    population: 0,
    supplies: {
      food: {
        min: 0,
        max: 0,
      },
      bullets: {
        min: 0,
        max: 0,
      },
      powder: {
        min: 0,
        max: 0,
      },
      medkits: {
        min: 0,
        max: 0,
      },
    },
  },
  {
    name: 'Madison',
    distance: 110,
    features: TownFeatures.RAILROADS | TownFeatures.SUPPLY_DEPOT,
    encounter: {
      chance: 46,
      min: 24,
      max: 48,
    },
    description:
      'A decently sized town. It is home to a Confederate supply depot.',
    population: 3_924,
    supplies: {
      food: {
        min: 30,
        max: 2_000,
      },
      bullets: {
        min: 10,
        max: 110,
      },
      powder: {
        min: 7,
        max: 90,
      },
      medkits: {
        min: 1,
        max: 6,
      },
    },
  },
  {
    name: 'Eatonton',
    distance: 133,
    features: TownFeatures.RAILROADS | TownFeatures.INDUSTRY,
    encounter: {
      chance: 35,
      min: 40,
      max: 80,
    },
    description:
      'A decently sized town. It is home to cotton and general manufacturing factories.',
    population: 2_009,
    supplies: {
      food: {
        min: 0,
        max: 2_000,
      },
      bullets: {
        min: 0,
        max: 90,
      },
      powder: {
        min: 0,
        max: 50,
      },
      medkits: {
        min: 0,
        max: 6,
      },
    },
  },
  {
    name: 'Milledgeville',
    distance: 154,
    features:
      TownFeatures.RAILROADS |
      TownFeatures.SUPPLY_DEPOT |
      TownFeatures.AGRICULTURE,
    encounter: {
      chance: 20,
      min: 60,
      max: 120,
    },
    description:
      'A decently sized town. It is home to a Confederate supply depot and a cotton plantation.',
    population: 2_480,
    supplies: {
      food: {
        min: 40,
        max: 3_000,
      },
      bullets: {
        min: 12,
        max: 115,
      },
      powder: {
        min: 14,
        max: 125,
      },
      medkits: {
        min: 2,
        max: 12,
      },
    },
  },
  {
    name: 'Griswoldville',
    distance: 185,
    features: TownFeatures.RAILROADS | TownFeatures.INDUSTRY,
    encounter: {
      chance: 100,
      min: 2_800,
      max: 3_200,
    },
    description:
      'A town on the smaller side, but home to a significant Confederate stronghold.',
    population: 911,
    supplies: {
      food: {
        min: 0,
        max: 9_000,
      },
      bullets: {
        min: 0,
        max: 615,
      },
      powder: {
        min: 0,
        max: 585,
      },
      medkits: {
        min: 0,
        max: 30,
      },
    },
  },
  {
    name: 'Gordon',
    distance: 201,
    features: TownFeatures.RAILROADS | TownFeatures.SUPPLY_DEPOT,
    encounter: {
      chance: 40,
      min: 10,
      max: 100,
    },
    description:
      'A small company town for a depot on the Central of Georgia Railroad.',
    population: 250,
    supplies: {
      food: {
        min: 20,
        max: 1_000,
      },
      bullets: {
        min: 5,
        max: 40,
      },
      powder: {
        min: 5,
        max: 40,
      },
      medkits: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    name: 'Irwinton',
    distance: 213,
    features: 0,
    encounter: null,
    description: 'A small town with less than 200 people.',
    population: 180,
    supplies: {
      food: {
        min: 0,
        max: 200,
      },
      bullets: {
        min: 0,
        max: 4,
      },
      powder: {
        min: 0,
        max: 6,
      },
      medkits: {
        min: 1,
        max: 4,
      },
    },
  },
  {
    name: 'Sandersville',
    distance: 255,
    features: 0,
    encounter: {
      chance: 10,
      min: 10,
      max: 80,
    },
    description: 'A small town with less than 1,000 people.',
    population: 800,
    supplies: {
      food: {
        min: 0,
        max: 1_000,
      },
      bullets: {
        min: 0,
        max: 40,
      },
      powder: {
        min: 0,
        max: 30,
      },
      medkits: {
        min: 1,
        max: 8,
      },
    },
  },
  {
    name: 'Louisville',
    distance: 271,
    features: 0,
    encounter: null,
    description: 'A small town with less than 1,000 people.',
    population: 800,
    supplies: {
      food: {
        min: 0,
        max: 1_000,
      },
      bullets: {
        min: 0,
        max: 40,
      },
      powder: {
        min: 0,
        max: 30,
      },
      medkits: {
        min: 1,
        max: 8,
      },
    },
  },
  {
    name: 'Millen',
    distance: 306,
    features: TownFeatures.RAILROADS | TownFeatures.SUPPLY_DEPOT,
    encounter: {
      chance: 20,
      min: 10,
      max: 100,
    },
    description:
      'A small town with less than 1,000 people. It is home to a Confederate supply depot and prison camp.',
    population: 500,
    supplies: {
      food: {
        min: 10,
        max: 800,
      },
      bullets: {
        min: 2,
        max: 28,
      },
      powder: {
        min: 2,
        max: 25,
      },
      medkits: {
        min: 2,
        max: 18,
      },
    },
  },
  {
    name: 'Fort McAllister',
    distance: 402,
    features: TownFeatures.FORT,
    encounter: {
      chance: 100,
      min: 120,
      max: 250,
    },
    description:
      'A Confederate fort on the Ogeechee River. It is home to a significant Confederate stronghold.',
    population: 0,
    supplies: {
      food: {
        min: 0,
        max: 800,
      },
      bullets: {
        min: 0,
        max: 60,
      },
      powder: {
        min: 0,
        max: 72,
      },
      medkits: {
        min: 3,
        max: 24,
      },
    },
  },
  {
    name: 'Savannah',
    distance: 431,
    features: TownFeatures.FORT, // Consider this a fort, since it is the final destination and last Confederate stronghold
    encounter: {
      chance: 100,
      min: Infinity,
      max: Infinity, // Use Infinity to indicate that the rest of the Confederate forces are here
    },
    description:
      'The final destination. It is home to a significant Confederate stronghold. The Union is closing in.',
    population: 15_511,
    supplies: {
      food: {
        min: 0,
        max: 800,
      },
      bullets: {
        min: 0,
        max: 60,
      },
      powder: {
        min: 0,
        max: 72,
      },
      medkits: {
        min: 3,
        max: 24,
      },
    },
  },
];

export default DESTINATIONS;
