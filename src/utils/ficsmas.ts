import { GameSaveData } from '../types/game';

/**
 * Checks if the seasonal FICSMAS event is currently active.
 *
 * Rules:
 * - If state.ficsmasMode === 'enabled', active year-round.
 * - If state.ficsmasMode === 'disabled', inactive.
 * - If state.ficsmasMode === 'auto' or undefined:
 *     Active automatically from December 1st to December 31st (month index 11 in JS Date).
 */
export function isFicsmasActive(state: GameSaveData, testDate?: Date): boolean {
  if (state.ficsmasMode === 'enabled') return true;
  if (state.ficsmasMode === 'disabled') return false;

  const now = testDate || new Date();
  const month = now.getMonth(); // 11 is December
  const date = now.getDate();

  return month === 11 && date >= 1 && date <= 31;
}

export function getFicsmasStatusText(state: GameSaveData): string {
  if (state.ficsmasMode === 'enabled') {
    return 'Holiday Mode Active (Always On Override)';
  }
  if (state.ficsmasMode === 'disabled') {
    return 'Holiday Mode Inactive (Manually Disabled)';
  }
  const isSeasonal = isFicsmasActive(state);
  return isSeasonal
    ? 'Holiday Mode Active (Seasonal: Dec 1 - Dec 31)'
    : 'Holiday Mode Standby (Seasonal: Dec 1 - Dec 31)';
}
