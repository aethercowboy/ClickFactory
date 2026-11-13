import { GameSaveData, MilestoneDef } from '../types/game';
import { ALL_MILESTONES } from '../data/milestones';

/**
 * Checks whether a given milestone has been marked completed in the player's save.
 */
export function isMilestoneCompleted(gameState: GameSaveData, milestoneId: string): boolean {
  return gameState.completedMilestones.includes(milestoneId);
}

/**
 * Determines whether a specific high-level game feature is unlocked.
 */
export function isFeatureUnlocked(gameState: GameSaveData, feature: string): boolean {
  // If explicitly unlocked in unlockedFeatures array
  if (gameState.unlockedFeatures && gameState.unlockedFeatures.includes(feature)) {
    return true;
  }

  switch (feature) {
    case 'automation':
      // Automation unlocks with Tier 0 Upgrade 1 (Portable Miner)
      return (
        gameState.unlockedBuildings.length > 0 ||
        isMilestoneCompleted(gameState, 'tier0_upgrade_1')
      );

    case 'power_grid':
      // Power Grid unlocks with Tier 0 Upgrade 2 (1st HUB Biomass Burner) or Upgrade 5
      return (
        isMilestoneCompleted(gameState, 'tier0_upgrade_2') ||
        isMilestoneCompleted(gameState, 'tier0_upgrade_5')
      );

    case 'mam_research':
      // MAM Research unlocks with Tier 1 Field Research
      return isMilestoneCompleted(gameState, 'tier1_field_research');

    case 'awesome_sink':
    case 'awesome_shop':
      // AWESOME Sink and Shop unlock with Tier 2 Resource Sink
      return isMilestoneCompleted(gameState, 'tier2_awesome_sink');

    case 'space_elevator':
      // Space Elevator accessible after completing Tier 0 or reaching Tier 2
      return (
        isMilestoneCompleted(gameState, 'tier0_upgrade_5') ||
        isMilestoneCompleted(gameState, 'tier2_part_assembly') ||
        gameState.completedPhases.length > 0
      );

    case 'logistics':
      // Conveyor logistics and production stats unlock with Tier 1 Logistics or once machines exist
      return (
        isMilestoneCompleted(gameState, 'tier1_logistics') ||
        gameState.machines.length > 0
      );

    default:
      return false;
  }
}

/**
 * Calculates the maximum HUB Milestone Tier currently accessible to the player.
 * - Tier 0 is the starting tier.
 * - Tiers 1 and 2 are unlocked only after all Tier 0 HUB upgrades are completed.
 * - Subsequent tiers require Space Elevator Project Assembly phase launches.
 */
export function getMaxTierAllowed(gameState: GameSaveData): number {
  const tier0MilestoneIds = [
    'tier0_upgrade_1',
    'tier0_upgrade_2',
    'tier0_upgrade_3',
    'tier0_upgrade_4',
    'tier0_upgrade_5',
  ];

  const isTier0Complete = tier0MilestoneIds.every(id =>
    gameState.completedMilestones.includes(id)
  );

  // If onboarding in Tier 0 is not yet finished, only Tier 0 is accessible
  if (!isTier0Complete) {
    return 0;
  }

  const phases = gameState.completedPhases;
  if (phases.includes(4)) return 9;
  if (phases.includes(3)) return 8;
  if (phases.includes(2)) return 6;
  if (phases.includes(1)) return 4;

  // After Tier 0 completion, Tiers 1 and 2 are available
  return 2;
}

/**
 * Checks whether an individual milestone is currently unlocked and selectable.
 */
export function isMilestoneUnlocked(gameState: GameSaveData, milestone: MilestoneDef): boolean {
  // If already completed, it was unlocked
  if (gameState.completedMilestones.includes(milestone.id)) {
    return true;
  }

  const maxTier = getMaxTierAllowed(gameState);
  if (milestone.tier > maxTier) {
    return false;
  }

  // Tier 0 upgrades must be completed sequentially:
  if (milestone.tier === 0) {
    if (milestone.id === 'tier0_upgrade_1') return true;
    if (milestone.id === 'tier0_upgrade_2') return gameState.completedMilestones.includes('tier0_upgrade_1');
    if (milestone.id === 'tier0_upgrade_3') return gameState.completedMilestones.includes('tier0_upgrade_2');
    if (milestone.id === 'tier0_upgrade_4') return gameState.completedMilestones.includes('tier0_upgrade_3');
    if (milestone.id === 'tier0_upgrade_5') return gameState.completedMilestones.includes('tier0_upgrade_4');
  }

  // In higher tiers, tier must be within allowed bounds
  return milestone.tier <= maxTier;
}

/**
 * Returns a human-readable reason why a milestone is locked, or null if unlocked.
 */
export function getMilestoneLockReason(gameState: GameSaveData, milestone: MilestoneDef): string | null {
  if (isMilestoneUnlocked(gameState, milestone)) {
    return null;
  }

  if (milestone.tier === 0) {
    if (milestone.id === 'tier0_upgrade_2') return 'Requires HUB Upgrade 1 completion';
    if (milestone.id === 'tier0_upgrade_3') return 'Requires HUB Upgrade 2 completion';
    if (milestone.id === 'tier0_upgrade_4') return 'Requires HUB Upgrade 3 completion';
    if (milestone.id === 'tier0_upgrade_5') return 'Requires HUB Upgrade 4 completion';
  }

  const maxTier = getMaxTierAllowed(gameState);
  if (maxTier === 0) {
    return 'Complete all Tier 0 HUB Upgrades to unlock Tier 1 & 2';
  }

  if (milestone.tier > maxTier) {
    if (milestone.tier <= 4) return 'Complete Space Elevator Phase 1 (Smart Plating)';
    if (milestone.tier <= 6) return 'Complete Space Elevator Phase 2 (Modular Engines)';
    if (milestone.tier <= 8) return 'Complete Space Elevator Phase 3 (Adaptive Control Units)';
    return 'Complete Space Elevator Phase 4 (Endgame Assembly)';
  }

  return 'Locked by planetary progression protocol';
}
