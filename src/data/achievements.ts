import { GameSaveData, ItemId } from '../types/game';

export type AchievementCategory = 'automation' | 'production' | 'power' | 'progression' | 'special';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string; // Lucide icon name
  rewardCoupons?: number;
  check: (state: GameSaveData) => boolean;
  getProgress: (state: GameSaveData) => { current: number; target: number; formatted: string };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // 1. First Automation
  {
    id: 'first_automation',
    title: 'First Automation',
    description: 'Construct your first automated extractor or factory production machine.',
    category: 'automation',
    icon: 'Factory',
    rewardCoupons: 1,
    check: (state: GameSaveData) => state.machines.some(m => m.count > 0),
    getProgress: (state: GameSaveData) => {
      const count = state.machines.reduce((acc, m) => acc + m.count, 0);
      return {
        current: Math.min(1, count),
        target: 1,
        formatted: `${Math.min(1, count)} / 1 machines`,
      };
    },
  },

  // 2. 1000 Iron Ingots
  {
    id: 'iron_1000',
    title: '1000 Iron Ingots',
    description: 'Accumulate at least 1,000 Iron Ingots in factory storage.',
    category: 'production',
    icon: 'Box',
    rewardCoupons: 2,
    check: (state: GameSaveData) => (state.inventory.iron_ingot || 0) >= 1000,
    getProgress: (state: GameSaveData) => {
      const cur = state.inventory.iron_ingot || 0;
      return {
        current: Math.min(1000, cur),
        target: 1000,
        formatted: `${Math.floor(Math.min(1000, cur)).toLocaleString()} / 1,000 ingots`,
      };
    },
  },

  // 3. Power Trip
  {
    id: 'power_trip',
    title: 'Power Trip',
    description: 'Experience your first electrical grid overload and master circuit breaker trip.',
    category: 'power',
    icon: 'ZapOff',
    rewardCoupons: 1,
    check: (state: GameSaveData) =>
      state.powerGrid.isTripped || (state.pioneerStats.powerTripsCount || 0) > 0,
    getProgress: (state: GameSaveData) => {
      const tripped = state.powerGrid.isTripped || (state.pioneerStats.powerTripsCount || 0) > 0;
      return {
        current: tripped ? 1 : 0,
        target: 1,
        formatted: tripped ? '1 / 1 tripped' : '0 / 1 tripped',
      };
    },
  },

  // 4. Planetfall Pioneer (Manual Mining)
  {
    id: 'first_mining',
    title: 'Planetfall Pioneer',
    description: 'Manually survey and extract 50 raw planetary ore units.',
    category: 'progression',
    icon: 'Pickaxe',
    rewardCoupons: 1,
    check: (state: GameSaveData) => (state.pioneerStats.totalOreMined || 0) >= 50,
    getProgress: (state: GameSaveData) => {
      const cur = state.pioneerStats.totalOreMined || 0;
      return {
        current: Math.min(50, cur),
        target: 50,
        formatted: `${Math.min(50, Math.floor(cur))} / 50 ore mined`,
      };
    },
  },

  // 5. By Pioneer Hands (Manual Crafting)
  {
    id: 'craft_bench_50',
    title: 'By Pioneer Hands',
    description: 'Craft 50 component batches at the Pioneer Craft Bench.',
    category: 'production',
    icon: 'Hammer',
    rewardCoupons: 1,
    check: (state: GameSaveData) => (state.pioneerStats.manualCrafts || 0) >= 50,
    getProgress: (state: GameSaveData) => {
      const cur = state.pioneerStats.manualCrafts || 0;
      return {
        current: Math.min(50, cur),
        target: 50,
        formatted: `${Math.min(50, cur)} / 50 crafts`,
      };
    },
  },

  // 6. Black Gold (Coal Power)
  {
    id: 'coal_power',
    title: 'Black Gold',
    description: 'Construct your first Coal Generator for automated baseload electricity.',
    category: 'power',
    icon: 'Flame',
    rewardCoupons: 2,
    check: (state: GameSaveData) =>
      state.generators.some(g => g.buildingId === 'coal_generator' && g.count > 0),
    getProgress: (state: GameSaveData) => {
      const coalGen = state.generators.find(g => g.buildingId === 'coal_generator');
      const count = coalGen ? coalGen.count : 0;
      return {
        current: Math.min(1, count),
        target: 1,
        formatted: `${Math.min(1, count)} / 1 generator`,
      };
    },
  },

  // 7. Maximum Throughput (Overclocking)
  {
    id: 'overclock_master',
    title: 'Maximum Throughput',
    description: 'Overclock any industrial machine to the absolute 250% limit with 3 Power Shards.',
    category: 'automation',
    icon: 'Gauge',
    rewardCoupons: 3,
    check: (state: GameSaveData) => state.machines.some(m => m.powerShards >= 3),
    getProgress: (state: GameSaveData) => {
      const maxShards = state.machines.reduce((max, m) => Math.max(max, m.powerShards), 0);
      return {
        current: Math.min(3, maxShards),
        target: 3,
        formatted: `${Math.min(3, maxShards)} / 3 shards slotted`,
      };
    },
  },

  // 8. Orbital Lift-Off (Space Elevator Phase 1)
  {
    id: 'elevator_phase_1',
    title: 'Orbital Lift-Off',
    description: 'Complete Phase 1 of Project Assembly and send the Space Elevator capsule to orbit.',
    category: 'progression',
    icon: 'Rocket',
    rewardCoupons: 3,
    check: (state: GameSaveData) => state.completedPhases.includes(1),
    getProgress: (state: GameSaveData) => ({
      current: state.completedPhases.includes(1) ? 1 : 0,
      target: 1,
      formatted: state.completedPhases.includes(1) ? 'Phase 1 Complete' : 'Incomplete',
    }),
  },

  // 9. Coupon Tycoon (AWESOME Sink)
  {
    id: 'coupon_tycoon',
    title: 'Coupon Tycoon',
    description: 'Shred surplus parts in the AWESOME Sink to print at least 10 FICSIT Coupons.',
    category: 'special',
    icon: 'Ticket',
    rewardCoupons: 2,
    check: (state: GameSaveData) => (state.totalCouponsPrinted || 0) >= 10,
    getProgress: (state: GameSaveData) => {
      const cur = state.totalCouponsPrinted || 0;
      return {
        current: Math.min(10, cur),
        target: 10,
        formatted: `${Math.min(10, cur)} / 10 coupons printed`,
      };
    },
  },

  // 10. Audiophile (Unlock Boombox)
  {
    id: 'audiophile',
    title: 'Pocket Jukebox',
    description: 'Purchase the FICSIT Factory Boombox from the AWESOME Shop to play synthwave tapes.',
    category: 'special',
    icon: 'Radio',
    rewardCoupons: 2,
    check: (state: GameSaveData) => state.shopPurchases.includes('shop_boombox'),
    getProgress: (state: GameSaveData) => {
      const unlocked = state.shopPurchases.includes('shop_boombox');
      return {
        current: unlocked ? 1 : 0,
        target: 1,
        formatted: unlocked ? 'Boombox Owned' : 'Not Purchased',
      };
    },
  },

  // 11. Employee of the Planet (Coffee Cup)
  {
    id: 'coffee_break',
    title: 'Employee of the Planet',
    description: 'Acquire the official FICSIT Employee Coffee Cup from the AWESOME Shop.',
    category: 'special',
    icon: 'Coffee',
    rewardCoupons: 2,
    check: (state: GameSaveData) => state.shopPurchases.includes('shop_coffee_cup'),
    getProgress: (state: GameSaveData) => {
      const unlocked = state.shopPurchases.includes('shop_coffee_cup');
      return {
        current: unlocked ? 1 : 0,
        target: 1,
        formatted: unlocked ? 'Coffee Cup Owned' : 'Not Purchased',
      };
    },
  },

  // 12. Speed Demon (Blade Runners)
  {
    id: 'blade_runners',
    title: 'Speed Demon',
    description: 'Research the Caterium tech tree in the MAM and equip the Blade Runners exoskeleton.',
    category: 'progression',
    icon: 'Zap',
    rewardCoupons: 2,
    check: (state: GameSaveData) => state.completedMAMNodes.includes('mam_cat_blade_runners'),
    getProgress: (state: GameSaveData) => {
      const researched = state.completedMAMNodes.includes('mam_cat_blade_runners');
      return {
        current: researched ? 1 : 0,
        target: 1,
        formatted: researched ? 'Researched' : 'Not Researched',
      };
    },
  },

  // 13. Heavy Industry (Automate Reinforced Iron Plates)
  {
    id: 'reinforced_plates_100',
    title: 'Heavy Industry',
    description: 'Accumulate 100 Reinforced Iron Plates in factory inventory.',
    category: 'production',
    icon: 'Shield',
    rewardCoupons: 3,
    check: (state: GameSaveData) => (state.inventory.reinforced_plate || 0) >= 100,
    getProgress: (state: GameSaveData) => {
      const cur = state.inventory.reinforced_plate || 0;
      return {
        current: Math.min(100, cur),
        target: 100,
        formatted: `${Math.floor(Math.min(100, cur))} / 100 plates`,
      };
    },
  },

  // 14. Golden Monument (Golden Nut Trophy)
  {
    id: 'golden_monument',
    title: 'FICSIT Pioneer Legend',
    description: 'Purchase the solid 24k Golden FICSIT Nut Trophy for 100 coupons.',
    category: 'special',
    icon: 'Trophy',
    rewardCoupons: 10,
    check: (state: GameSaveData) => state.shopPurchases.includes('shop_golden_nut'),
    getProgress: (state: GameSaveData) => {
      const unlocked = state.shopPurchases.includes('shop_golden_nut');
      return {
        current: unlocked ? 1 : 0,
        target: 1,
        formatted: unlocked ? 'Golden Nut Erected' : 'Not Purchased',
      };
    },
  },

  // 15. Merry FICSIT (First Gift)
  {
    id: 'ficsmas_first_gift',
    title: 'Merry FICSIT',
    description: 'Harvest or collect your first FICSMAS Gift dropped from planetary orbit.',
    category: 'special',
    icon: 'Gift',
    rewardCoupons: 1,
    check: (state: GameSaveData) =>
      (state.inventory.ficsmas_gift || 0) > 0 || (state.ficsmasPresentsCollected || 0) > 0,
    getProgress: (state: GameSaveData) => {
      const cur = Math.max(state.inventory.ficsmas_gift || 0, state.ficsmasPresentsCollected || 0);
      return {
        current: Math.min(1, cur),
        target: 1,
        formatted: cur > 0 ? '1 / 1 gift collected' : '0 / 1 gift collected',
      };
    },
  },

  // 16. Deck the Factory Halls (50 Decorations)
  {
    id: 'ficsmas_decorations',
    title: 'Deck the Factory Halls',
    description: 'Stockpile at least 50 holiday decorations (ornaments or bows) in factory storage.',
    category: 'production',
    icon: 'Sparkles',
    rewardCoupons: 2,
    check: (state: GameSaveData) => {
      const total =
        (state.inventory.ficsmas_ornament_red || 0) +
        (state.inventory.ficsmas_ornament_blue || 0) +
        (state.inventory.ficsmas_ornament_copper || 0) +
        (state.inventory.ficsmas_ornament_iron || 0) +
        (state.inventory.ficsmas_bow || 0);
      return total >= 50;
    },
    getProgress: (state: GameSaveData) => {
      const total =
        (state.inventory.ficsmas_ornament_red || 0) +
        (state.inventory.ficsmas_ornament_blue || 0) +
        (state.inventory.ficsmas_ornament_copper || 0) +
        (state.inventory.ficsmas_ornament_iron || 0) +
        (state.inventory.ficsmas_bow || 0);
      return {
        current: Math.min(50, total),
        target: 50,
        formatted: `${Math.floor(Math.min(50, total))} / 50 decorations`,
      };
    },
  },

  // 17. Holiday Automation (Gift Tree)
  {
    id: 'ficsmas_gift_tree',
    title: 'Holiday Automation',
    description: 'Construct a FICSMAS Gift Tree to automate orbital present harvesting.',
    category: 'automation',
    icon: 'TreePine',
    rewardCoupons: 3,
    check: (state: GameSaveData) =>
      state.machines.some(m => m.buildingId === 'ficsmas_gift_tree' && m.count > 0),
    getProgress: (state: GameSaveData) => {
      const count = state.machines
        .filter(m => m.buildingId === 'ficsmas_gift_tree')
        .reduce((acc, m) => acc + m.count, 0);
      return {
        current: Math.min(1, count),
        target: 1,
        formatted: `${Math.min(1, count)} / 1 trees built`,
      };
    },
  },

  // 18. A Star in the Sky (Wonder Star)
  {
    id: 'ficsmas_wonder_star',
    title: 'A Star in the Sky',
    description: 'Synthesize the magnificent FICSMAS Wonder Star atop the holiday tech tree.',
    category: 'special',
    icon: 'Star',
    rewardCoupons: 10,
    check: (state: GameSaveData) => (state.inventory.ficsmas_wonder_star || 0) >= 1,
    getProgress: (state: GameSaveData) => {
      const cur = state.inventory.ficsmas_wonder_star || 0;
      return {
        current: Math.min(1, cur),
        target: 1,
        formatted: cur >= 1 ? 'Wonder Star Crafted!' : '0 / 1 crafted',
      };
    },
  },
];
