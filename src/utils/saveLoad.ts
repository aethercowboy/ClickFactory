import { GameSaveData, ItemId, LizardDoggoState } from '../types/game';
import { isValidExtractorTarget, getValidOresForExtractor } from './extractors';
import { ALL_BUILDINGS } from '../data/items';
import { ALL_MILESTONES } from '../data/milestones';

const SAVE_KEY = 'FICSIT_PIONEER_SAVE_V1';

export const INITIAL_DOGGO: LizardDoggoState = {
  isTamed: true,
  name: 'Lizard Doggo',
  petsCount: 0,
  happiness: 80,
  lastPetTime: Date.now(),
  heldItem: null,
  itemsRetrievedCount: 0,
  retrievalTimerMs: 25000,
};

export const INITIAL_SAVE: GameSaveData = {
  version: 1,
  lastTick: Date.now(),
  inventory: {
    iron_ore: 12,
    leaves: 30,
    copper_ore: 0,
    limestone: 0,
    coal: 0,
    caterium_ore: 0,
    raw_quartz: 0,
    crude_oil: 0,
    bauxite: 0,
    uranium: 0,
    sam_ore: 0,
    water: 0,
    biomass: 0,
    solid_biofuel: 0,
    iron_ingot: 4,
    copper_ingot: 0,
    steel_ingot: 0,
    caterium_ingot: 0,
    aluminum_ingot: 0,
    iron_plate: 4,
    iron_rod: 4,
    screw: 0,
    reinforced_plate: 0,
    wire: 0,
    cable: 0,
    copper_sheet: 0,
    concrete: 0,
    steel_beam: 0,
    steel_pipe: 0,
    encased_beam: 0,
    rotor: 0,
    stator: 0,
    motor: 0,
    modular_frame: 0,
    quartz_crystal: 0,
    silica: 0,
    crystal_oscillator: 0,
    quickwire: 0,
    circuit_board: 0,
    ai_limiter: 0,
    high_speed_connector: 0,
    computer: 0,
    supercomputer: 0,
    plastic: 0,
    rubber: 0,
    fuel: 0,
    turbofuel: 0,
    heavy_modular_frame: 0,
    fused_modular_frame: 0,
    aluminum_scrap: 0,
    aluminum_casing: 0,
    radio_control_unit: 0,
    uranium_fuel_rod: 0,
    nuclear_waste: 0,
    alien_remains: 0,
    alien_dna_capsule: 0,
    power_shard: 1,
    ficsit_coupon: 0,
    smart_plating: 0,
    automated_wiring: 0,
    versatile_framework: 0,
    modular_engine: 0,
    adaptive_control_unit: 0,
    magnetic_field_generator: 0,
    thermal_propulsion_rocket: 0,
    assembly_director_system: 0,
    nuclear_pasta: 0,
    dark_matter_residue: 0,
    time_crystal: 0,
    singularity_cell: 0,
    ficsmas_gift: 0,
    ficsmas_tree_branch: 0,
    ficsmas_ornament_red: 0,
    ficsmas_ornament_blue: 0,
    ficsmas_ornament_copper: 0,
    ficsmas_ornament_iron: 0,
    ficsmas_bow: 0,
    ficsmas_candy_cane: 0,
    ficsmas_snowball: 0,
    ficsmas_wonder_star: 0,
    paleberry: 3,
  },
  unlockedOres: ['iron_ore', 'leaves'],
  unlockedRecipes: [
    'recipe_iron_ingot',
  ],
  unlockedBuildings: [],
  unlockedFeatures: [],
  machines: [],
  generators: [],
  powerGrid: {
    capacity: 0,
    consumption: 0,
    isTripped: false,
    batteryStored: 0,
    maxBatteryStorage: 100,
  },
  completedMilestones: [],
  currentMilestoneId: 'tier0_upgrade_1',
  milestoneContributions: {},
  completedMAMNodes: [],
  activeResearch: null,
  activeCrafting: null,
  hardDriveScanning: null,
  completedPhases: [],
  elevatorDeliveries: {},
  sinkPoints: 0,
  ficsitCoupons: 0,
  totalCouponsPrinted: 0,
  shopPurchases: [],
  unlockedAchievements: [],
  selectedBiome: 'grass_fields',
  ficsmasMode: 'auto',
  ficsmasPresentsCollected: 0,
  overclockCap: 1.0,
  doggo: INITIAL_DOGGO,
  pioneerStats: {
    manualClicks: 0,
    manualCrafts: 0,
    totalOreMined: 0,
    totalPartsMade: 0,
    powerTripsCount: 0,
    playtimeSeconds: 0,
    doggoPets: 0,
  },
  audioMuted: false,
  ambientTrack: false,
};

export function loadGame(): GameSaveData {
  if (typeof window === 'undefined') return INITIAL_SAVE;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return INITIAL_SAVE;
    const parsed = JSON.parse(raw);
    const sanitizedMachines = (parsed.machines || []).map((m: any) => {
      const b = ALL_BUILDINGS[m.buildingId];
      if (b && b.category === 'extractor' && m.targetOre) {
        if (!isValidExtractorTarget(m.buildingId, m.targetOre)) {
          const valid = getValidOresForExtractor(m.buildingId);
          return { ...m, targetOre: valid[0] || m.targetOre };
        }
      }
      return m;
    });
    let restoredOres: ItemId[] = parsed.unlockedOres || INITIAL_SAVE.unlockedOres;
    let restoredBuildings: string[] = parsed.unlockedBuildings || INITIAL_SAVE.unlockedBuildings;
    let restoredFeatures: string[] = parsed.unlockedFeatures || [];
    let restoredGenerators = Array.isArray(parsed.generators) ? [...parsed.generators] : [];

    if (parsed.completedMilestones && Array.isArray(parsed.completedMilestones)) {
      let expectedHubBurners = 0;
      parsed.completedMilestones.forEach((mId: string) => {
        const ms = ALL_MILESTONES.find(m => m.id === mId);
        if (ms?.unlocks?.ores) {
          ms.unlocks.ores.forEach(o => {
            if (!restoredOres.includes(o)) {
              restoredOres = [...restoredOres, o];
            }
          });
        }
        if (ms?.unlocks?.buildings) {
          ms.unlocks.buildings.forEach(b => {
            if (!restoredBuildings.includes(b)) {
              restoredBuildings = [...restoredBuildings, b];
            }
          });
        }
        if (ms?.unlocks?.features) {
          ms.unlocks.features.forEach(f => {
            if (!restoredFeatures.includes(f)) {
              restoredFeatures = [...restoredFeatures, f];
            }
          });
        }
        if (ms?.unlocks?.grantGenerators) {
          ms.unlocks.grantGenerators.forEach(grant => {
            if (grant.buildingId === 'hub_biomass_burner') {
              expectedHubBurners = grant.maxTotal !== undefined
                ? Math.min(grant.maxTotal, expectedHubBurners + grant.count)
                : expectedHubBurners + grant.count;
            }
          });
        }
      });

      if (expectedHubBurners > 0) {
        const existingHubIdx = restoredGenerators.findIndex((g: any) => g.buildingId === 'hub_biomass_burner');
        if (existingHubIdx >= 0) {
          const cur = restoredGenerators[existingHubIdx];
          if ((cur.count || 0) < expectedHubBurners) {
            restoredGenerators[existingHubIdx] = { ...cur, count: expectedHubBurners };
          }
        } else {
          restoredGenerators.push({
            id: 'hub_biomass_burner_init',
            buildingId: 'hub_biomass_burner',
            count: expectedHubBurners,
            isPaused: false,
          });
        }
      }
    }

    return {
      ...INITIAL_SAVE,
      ...parsed,
      machines: sanitizedMachines,
      generators: restoredGenerators,
      unlockedOres: restoredOres,
      unlockedBuildings: restoredBuildings,
      inventory: { ...INITIAL_SAVE.inventory, ...parsed.inventory },
      unlockedFeatures: restoredFeatures,
      unlockedAchievements: parsed.unlockedAchievements || [],
      selectedBiome: parsed.selectedBiome || 'grass_fields',
      ficsmasMode: parsed.ficsmasMode || 'auto',
      ficsmasPresentsCollected: parsed.ficsmasPresentsCollected || 0,
      activeCrafting: parsed.activeCrafting || null,
      powerGrid: { ...INITIAL_SAVE.powerGrid, ...parsed.powerGrid },
      pioneerStats: { ...INITIAL_SAVE.pioneerStats, ...parsed.pioneerStats },
      doggo: parsed.doggo ? { ...INITIAL_DOGGO, ...parsed.doggo } : INITIAL_DOGGO,
    };
  } catch (e) {
    console.error('Failed to load save:', e);
    return INITIAL_SAVE;
  }
}

export function saveGame(data: GameSaveData): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify({
      ...data,
      lastTick: Date.now(),
    });
    localStorage.setItem(SAVE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function exportSave(data: GameSaveData): string {
  return JSON.stringify(data, null, 2);
}

export function importSave(jsonStr: string): GameSaveData | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      ...INITIAL_SAVE,
      ...parsed,
      inventory: { ...INITIAL_SAVE.inventory, ...parsed.inventory },
      selectedBiome: parsed.selectedBiome || 'grass_fields',
      ficsmasMode: parsed.ficsmasMode || 'auto',
      ficsmasPresentsCollected: parsed.ficsmasPresentsCollected || 0,
      powerGrid: { ...INITIAL_SAVE.powerGrid, ...parsed.powerGrid },
      pioneerStats: { ...INITIAL_SAVE.pioneerStats, ...parsed.pioneerStats },
      doggo: parsed.doggo ? { ...INITIAL_DOGGO, ...parsed.doggo } : INITIAL_DOGGO,
    };
  } catch (e) {
    return null;
  }
}
