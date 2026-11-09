import { ItemId } from '../types/game';

export interface DoggoTreasure {
  itemId: ItemId;
  amount: number;
  isHazard?: boolean;
  isRare?: boolean;
}

/**
 * Generates a random treasure retrieved by Lizard Doggo from the planetary wilderness.
 * Faithful to Satisfactory mechanics:
 * - Common: Leaves, Paleberries, Iron/Copper Ingots
 * - Uncommon: Caterium, Raw Quartz, Alien Remains, Coal
 * - Rare: Power Shard, SAM Ore
 * - Seasonal: FICSMAS gifts during holiday mode
 * - Hazard / Joke: Nuclear Waste (2% chance)
 */
export function getRandomDoggoTreasure(isFicsmas: boolean): DoggoTreasure {
  const roll = Math.random();

  // Seasonal FICSMAS bonus
  if (isFicsmas && roll < 0.22) {
    return {
      itemId: 'ficsmas_gift',
      amount: 2 + Math.floor(Math.random() * 3),
    };
  }

  // 2% chance of the infamous Uranium / Nuclear Waste gag
  if (roll < 0.02) {
    return {
      itemId: 'nuclear_waste',
      amount: 1,
      isHazard: true,
    };
  }

  // 8% Rare
  if (roll < 0.10) {
    const rarePool: DoggoTreasure[] = [
      { itemId: 'power_shard', amount: 1, isRare: true },
      { itemId: 'sam_ore', amount: 2, isRare: true },
    ];
    return rarePool[Math.floor(Math.random() * rarePool.length)];
  }

  // 35% Uncommon
  if (roll < 0.45) {
    const uncommonPool: DoggoTreasure[] = [
      { itemId: 'caterium_ore', amount: 3 },
      { itemId: 'raw_quartz', amount: 3 },
      { itemId: 'alien_remains', amount: 1 },
      { itemId: 'coal', amount: 4 },
      { itemId: 'paleberry', amount: 2 },
    ];
    return uncommonPool[Math.floor(Math.random() * uncommonPool.length)];
  }

  // 55% Common
  const commonPool: DoggoTreasure[] = [
    { itemId: 'leaves', amount: 15 },
    { itemId: 'paleberry', amount: 1 },
    { itemId: 'iron_ingot', amount: 5 },
    { itemId: 'copper_ingot', amount: 5 },
  ];
  return commonPool[Math.floor(Math.random() * commonPool.length)];
}

/**
 * Base duration (in milliseconds) for Doggo to forage an item.
 * Scales with happiness: happier Doggos forage faster.
 */
export function getDoggoRetrievalTimeMs(happiness: number): number {
  const clampedHappiness = Math.max(0, Math.min(100, happiness));
  // 32 seconds at 0 happiness down to 20 seconds at 100 happiness
  return Math.round(32000 - (clampedHappiness / 100) * 12000);
}

/**
 * Descriptive mood string for Lizard Doggo based on happiness score.
 */
export function getDoggoMood(happiness: number): {
  label: string;
  color: string;
  description: string;
} {
  if (happiness >= 90) {
    return {
      label: 'Ecstatic & Joyful',
      color: 'text-rose-400',
      description: 'Wagging tail at hyper-speed, completely in love with the Pioneer!',
    };
  }
  if (happiness >= 70) {
    return {
      label: 'Happy & Excited',
      color: 'text-emerald-400',
      description: 'Ears flapping with delight, eager to forage for you!',
    };
  }
  if (happiness >= 45) {
    return {
      label: 'Content & Friendly',
      color: 'text-amber-400',
      description: 'Trotting happily around the HUB, ready for treats and pets.',
    };
  }
  if (happiness >= 20) {
    return {
      label: 'Curious & Alert',
      color: 'text-blue-400',
      description: 'Sniffing the alien grass, wondering if you have any Paleberries.',
    };
  }
  return {
    label: 'Needs Affection',
    color: 'text-neutral-400',
    description: 'Looking up with big puppy eyes, waiting for a pet.',
  };
}
