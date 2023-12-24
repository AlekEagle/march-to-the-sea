const SUPPLY_COSTS = {
  food: {
    value: 50, // Dollars per unit
    amount: 62_000, // Amount of supplies per unit
    name: 'Food Rations',
    description: '1 unit = 1 day of food for 1 person.',
  },
  bullets: {
    value: 33,
    amount: 62_000,
    name: 'Pouch of Bullets',
    description:
      '1 unit = 1 pouch of 20 bullets. A soldier can go through a pouch in about 20 minutes of combat.',
  },
  powder: {
    value: 27,
    amount: 62_000,
    name: 'Pouch of Gunpowder',
    description:
      '1 unit = 1 pouch of 20 charges of gunpowder. A soldier can go through a pouch in about 20 minutes of combat.',
  },
  medkits: {
    value: 40,
    amount: 50,
    name: 'Medical Kits',
    description:
      "A medical kit can be used to heal a soldier's wounds guaranteeing a full recovery. 1 unit = 1 medical kit.",
  },
};

export type SupplyType = keyof typeof SUPPLY_COSTS;

export default SUPPLY_COSTS;
