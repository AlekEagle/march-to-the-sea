import { MarchingSpeed } from '@/data/MarchingSpeeds';
import { RationFrequency } from '@/data/RationFrequency';

export const DEFAULT_MARCH_SPEED: MarchingSpeed = 'normal';
export const DEFAULT_RATION_FREQUENCY: RationFrequency = 'normal';
export const DEFAULT_MONEY = 5_000;
export const WOUNDED_INFECTION_CHANCE = 90;
export const RANK_SIZE = 25;
export const RANKS_AVAILABLE_TO_FIGHT = 2;
export const RANGED_ATTACK_LETHALITY_RATE = 85;

export default {
  DEFAULT_MARCH_SPEED,
  DEFAULT_RATION_FREQUENCY,
  DEFAULT_MONEY,
  WOUNDED_INFECTION_CHANCE,
  RANK_SIZE,
  RANKS_AVAILABLE_TO_FIGHT,
  RANGED_ATTACK_LETHALITY_RATE,
};
