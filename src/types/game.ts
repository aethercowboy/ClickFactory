export type ItemId =
  // Raw Ores & Fluids
  | 'iron_ore'
  | 'copper_ore'
  | 'limestone'
  | 'coal'
  | 'caterium_ore'
  | 'raw_quartz'
  | 'crude_oil'
  | 'bauxite'
  | 'uranium'
  | 'sam_ore'
  | 'water'
  | 'leaves'
  | 'biomass'
  | 'solid_biofuel'
  // Smelted Ingots
  | 'iron_ingot'
  | 'copper_ingot'
  | 'steel_ingot'
  | 'caterium_ingot'
  | 'aluminum_ingot'
  // Basic Parts
  | 'iron_plate'
  | 'iron_rod'
  | 'screw'
  | 'reinforced_plate'
  | 'wire'
  | 'cable'
  | 'copper_sheet'
  | 'concrete'
  // Steel & Mid-Tier
  | 'steel_beam'
  | 'steel_pipe'
  | 'encased_beam'
  | 'rotor'
  | 'stator'
  | 'motor'
  | 'modular_frame'
  // Electronics & Quartz
  | 'quartz_crystal'
  | 'silica'
  | 'crystal_oscillator'
  | 'quickwire'
  | 'circuit_board'
  | 'ai_limiter'
  | 'high_speed_connector'
  | 'computer'
  | 'supercomputer'
  // Oil & Heavy Industry
  | 'plastic'
  | 'rubber'
  | 'fuel'
  | 'turbofuel'
  | 'heavy_modular_frame'
  | 'fused_modular_frame'
  | 'aluminum_scrap'
  | 'aluminum_casing'
  | 'radio_control_unit'
  // Nuclear & Alien
  | 'uranium_fuel_rod'
  | 'nuclear_waste'
  | 'alien_remains'
  | 'alien_dna_capsule'
  | 'power_shard'
  | 'ficsit_coupon'
  // Space Elevator Project Parts
  | 'smart_plating'
  | 'automated_wiring'
  | 'versatile_framework'
  | 'modular_engine'
  | 'adaptive_control_unit'
  | 'magnetic_field_generator'
  | 'thermal_propulsion_rocket'
  | 'assembly_director_system'
  | 'nuclear_pasta'
  // Endgame Quantum
  | 'dark_matter_residue'
  | 'time_crystal'
  | 'singularity_cell';

export type ItemCategory =
  | 'raw'
  | 'standard'
  | 'advanced'
  | 'oil_chem'
  | 'electronics'
  | 'project_part'
  | 'power_fuel'
  | 'alien'
  | 'special';

export interface ItemDef {
  id: ItemId;
  name: string;
  category: ItemCategory;
  description: string;
  tierUnlocked: number;
  sinkPoints: number;
  color: string;
  unit: string;
}

export type MachineBuildingType =
  | 'miner'
  | 'smelter'
  | 'foundry'
  | 'constructor'
  | 'assembler'
  | 'manufacturer'
  | 'refinery'
  | 'blender'
  | 'accelerator'
  | 'quantum_encoder';

export type GeneratorBuildingType =
  | 'biomass_burner'
  | 'coal_generator'
  | 'fuel_generator'
  | 'geothermal_generator'
  | 'nuclear_power_plant';

export interface RecipeInput {
  itemId: ItemId;
  amount: number;
}

export interface RecipeOutput {
  itemId: ItemId;
  amount: number;
}

export interface RecipeDef {
  id: string;
  name: string;
  machineType: MachineBuildingType | 'craft_bench';
  inputs: RecipeInput[];
  outputs: RecipeOutput[];
  craftTime: number; // in seconds
  tierUnlocked: number;
  isAlternate?: boolean;
  altRecipeName?: string;
  unlockedByDefault?: boolean;
}

export interface BuildingDef {
  id: string;
  name: string;
  category: 'extractor' | 'production' | 'power';
  machineType?: MachineBuildingType;
  generatorType?: GeneratorBuildingType;
  description: string;
  cost: Array<{ itemId: ItemId; amount: number }>;
  powerConsumption: number; // in MW
  powerGeneration?: number; // in MW
  fuelRequired?: {
    fuelItems: ItemId[];
    burnRatePerMin: number;
    waterPerMin?: number;
    fuelBurnRates?: Partial<Record<ItemId, number>>;
  };
  tierUnlocked: number;
  icon: string;
}

export interface FactoryMachineState {
  id: string;
  buildingId: string;
  recipeId?: string;
  targetOre?: ItemId; // For miners
  count: number;
  clockSpeed: number; // 1.0 = 100%, 1.5 = 150%, 2.0 = 200%, 2.5 = 250%
  powerShards: number; // 0 to 3
  isPaused: boolean;
}

export interface GeneratorState {
  id: string;
  buildingId: string;
  count: number;
  isPaused: boolean;
}

export interface PowerGridState {
  capacity: number; // MW produced
  consumption: number; // MW demanded
  isTripped: boolean;
  trippedAt?: number;
  batteryStored: number; // MWh
  maxBatteryStorage: number;
}

export interface MilestoneDef {
  id: string;
  tier: number;
  name: string;
  description: string;
  cost: Array<{ itemId: ItemId; amount: number }>;
  rewards: string[];
  unlocks: {
    recipes?: string[];
    buildings?: string[];
    ores?: ItemId[];
    features?: string[];
  };
}

export interface MAMNodeDef {
  id: string;
  tree: 'slugs' | 'caterium' | 'alien' | 'quartz' | 'hard_drives';
  name: string;
  description: string;
  researchDuration: number; // seconds
  cost: Array<{ itemId: ItemId; amount: number }>;
  prerequisites: string[];
  unlocks: {
    alternateRecipeId?: string;
    overclockMax?: number; // 1.5, 2.0, 2.5
    manualSpeedMultiplier?: number;
    recipes?: string[];
    ores?: ItemId[];
    perkName?: string;
  };
}

export interface SpaceElevatorPhaseDef {
  phase: number;
  name: string;
  description: string;
  requirements: Array<{ itemId: ItemId; amount: number }>;
  unlocksTiers: number[];
}

export interface AwesomeShopItemDef {
  id: string;
  name: string;
  description: string;
  couponCost: number;
  category: 'equipment' | 'upgrades' | 'statues' | 'perks';
  effect: {
    type: 'click_power' | 'manual_craft_speed' | 'free_power_shards' | 'boombox' | 'coupon_multiplier' | 'golden_trophy';
    value: number;
  };
}

export interface ActiveResearch {
  nodeId: string;
  startTime: number;
  durationMs: number;
}

export interface HardDriveScanning {
  isActive: boolean;
  startTime: number;
  durationMs: number;
  choices?: string[]; // 3 alternate recipes to choose from
}

export interface GameNotification {
  id: string;
  title: string;
  message: string;
  type: 'milestone' | 'power_trip' | 'elevator' | 'research' | 'sink' | 'info';
  timestamp: number;
}

export interface GameSaveData {
  version: number;
  lastTick: number;
  inventory: Record<ItemId, number>;
  unlockedOres: ItemId[];
  unlockedRecipes: string[];
  unlockedBuildings: string[];
  unlockedFeatures: string[];
  machines: FactoryMachineState[];
  generators: GeneratorState[];
  powerGrid: PowerGridState;
  completedMilestones: string[];
  currentMilestoneId: string | null;
  milestoneContributions: Record<string, Record<ItemId, number>>;
  completedMAMNodes: string[];
  activeResearch: ActiveResearch | null;
  hardDriveScanning: HardDriveScanning | null;
  completedPhases: number[];
  elevatorDeliveries: Record<number, Record<ItemId, number>>;
  sinkPoints: number;
  ficsitCoupons: number;
  totalCouponsPrinted: number;
  shopPurchases: string[];
  overclockCap: number; // default 1.0 (100%), can go to 2.5
  pioneerStats: {
    manualClicks: number;
    manualCrafts: number;
    totalOreMined: number;
    totalPartsMade: number;
    powerTripsCount: number;
    playtimeSeconds: number;
  };
  audioMuted: boolean;
  ambientTrack: boolean;
}
