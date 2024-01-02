const RATION_FREQUENCIES = {
  scarce: {
    label: 'Scarce',
    description: 'Feed soldiers every 3 days',
    rationRequirement: (day: number) => day % 3 === 0,
    amount: 1,
  },
  meager: {
    label: 'Meager',
    description: 'Feed soldiers every other day',
    rationRequirement: (day: number) => day % 2 === 0,
    amount: 1,
  },
  normal: {
    label: 'Normal',
    description: 'Feed soldiers every day',
    rationRequirement: () => true,
    amount: 1,
  },
  plentiful: {
    label: 'Plentiful',
    description: 'Feed soldiers twice a day',
    rationRequirement: () => true,
    amount: 2,
  },
};

export type RationFrequency = keyof typeof RATION_FREQUENCIES;

export default RATION_FREQUENCIES;
