import { ItemId } from '../types/game';

/**
 * Standard solid mineral deposits extractable by mechanical rotary drills and portable miners.
 */
export const SOLID_MINERAL_ORES: ItemId[] = [
  'iron_ore',
  'copper_ore',
  'limestone',
  'coal',
  'caterium_ore',
  'raw_quartz',
  'bauxite',
  'uranium',
  'sam_ore',
  'leaves',
  'alien_remains',
];

/**
 * Fluid and liquid reservoirs requiring specialized hydraulic and wellhead pumps.
 */
export const FLUID_ORES: ItemId[] = ['water', 'crude_oil'];

/**
 * Returns the permissible ItemIds that a specific extractor building is engineered to extract.
 * - Water Extractor -> Water only
 * - Oil Extractor -> Crude Oil only
 * - FICSMAS Gift Tree -> FICSMAS Gifts only
 * - Portable Miner & Miner Mk.1/2/3 -> Solid mineral ores only
 */
export function getValidOresForExtractor(buildingId: string): ItemId[] {
  switch (buildingId) {
    case 'water_extractor':
      return ['water'];
    case 'oil_extractor':
      return ['crude_oil'];
    case 'ficsmas_gift_tree':
      return ['ficsmas_gift'];
    case 'portable_miner':
    case 'miner_mk1':
    case 'miner_mk2':
    case 'miner_mk3':
      return SOLID_MINERAL_ORES;
    default:
      return [];
  }
}

/**
 * Validates whether an extractor building can extract the given resource node.
 */
export function isValidExtractorTarget(buildingId: string, oreId: ItemId): boolean {
  const allowed = getValidOresForExtractor(buildingId);
  return allowed.includes(oreId);
}
