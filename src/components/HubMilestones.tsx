import React, { useState, useMemo } from 'react';
import { GameSaveData, ItemId, MilestoneDef } from '../types/game';
import { ALL_MILESTONES } from '../data/milestones';
import { ALL_ITEMS } from '../data/items';
import {
  Compass,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  PackageCheck,
  Send,
} from 'lucide-react';
import { audio } from '../utils/audio';

interface HubMilestonesProps {
  gameState: GameSaveData;
  onSelectMilestone: (milestoneId: string) => void;
  onContribute: (itemId: ItemId, amount: number) => void;
}

export const HubMilestones: React.FC<HubMilestonesProps> = ({
  gameState,
  onSelectMilestone,
  onContribute,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(0);

  // Group milestones by tier
  const milestonesByTier = useMemo(() => {
    const grouped: Record<number, MilestoneDef[]> = {};
    ALL_MILESTONES.forEach(m => {
      if (!grouped[m.tier]) grouped[m.tier] = [];
      grouped[m.tier].push(m);
    });
    return grouped;
  }, []);

  const activeMilestone = ALL_MILESTONES.find(m => m.id === gameState.currentMilestoneId) || ALL_MILESTONES[0];

  // Maximum tier unlocked: Tier 0, Tier 1-2 unlocked, Tier 3-4 unlocked after Phase 1, Tier 5-6 after Phase 2, etc.
  const maxTierAllowed = useMemo(() => {
    const phases = gameState.completedPhases;
    if (phases.includes(4)) return 9;
    if (phases.includes(3)) return 8;
    if (phases.includes(2)) return 6;
    if (phases.includes(1)) return 4;
    return 2; // Tiers 0, 1, 2 initially available
  }, [gameState.completedPhases]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-[#fa9549]" />
            <h2 className="text-lg font-bold font-industrial tracking-wide text-white">
              HUB Terminal & Milestone Progression
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Complete sequential FICSIT Pioneer milestones across Tiers 0 through 9 to unlock new manufacturing tiers, advanced alloy foundries, refineries, and nuclear reactors.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0d1014] px-4 py-2.5 rounded-lg border border-[#202732] shrink-0 font-mono-numbers text-xs">
          <span className="text-slate-400">Milestones Done:</span>
          <span className="font-bold text-white">
            {gameState.completedMilestones.length} / {ALL_MILESTONES.length}
          </span>
        </div>
      </div>

      {/* Tier Selector Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(tier => {
          const isLocked = tier > maxTierAllowed;
          const isSelected = selectedTier === tier;
          const tierMilestones = milestonesByTier[tier] || [];
          const allCompletedInTier = tierMilestones.length > 0 && tierMilestones.every(m => gameState.completedMilestones.includes(m.id));

          return (
            <button
              key={tier}
              disabled={isLocked}
              onClick={() => {
                setSelectedTier(tier);
                audio.playCraftPress();
              }}
              className={`px-3 py-2 rounded-lg font-mono-numbers whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isLocked
                  ? 'bg-[#101317] text-slate-600 cursor-not-allowed border border-[#1b2129]'
                  : isSelected
                  ? 'bg-[#fa9549] text-black font-bold shadow'
                  : 'bg-[#181f27] text-slate-300 hover:text-white hover:bg-[#202832]'
              }`}
            >
              <span>Tier {tier}</span>
              {isLocked ? (
                <Lock className="w-3 h-3 text-slate-600" />
              ) : allCompletedInTier ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Milestone List & Active Milestone Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Milestones in Selected Tier */}
        <div className="lg:col-span-6 space-y-3">
          {(milestonesByTier[selectedTier] || []).map(milestone => {
            const isCompleted = gameState.completedMilestones.includes(milestone.id);
            const isActive = gameState.currentMilestoneId === milestone.id;

            return (
              <div
                key={milestone.id}
                onClick={() => {
                  if (!isCompleted) {
                    onSelectMilestone(milestone.id);
                    audio.playCraftPress();
                  }
                }}
                className={`bg-[#141920] border rounded-xl p-4 cursor-pointer transition-all ${
                  isCompleted
                    ? 'border-emerald-600/40 bg-emerald-950/10'
                    : isActive
                    ? 'border-[#fa9549] bg-[#1a212b] shadow-md ring-1 ring-[#fa9549]/40'
                    : 'border-[#242c36] hover:border-slate-500 hover:bg-[#181e26]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-industrial text-base font-bold text-white tracking-wide">
                        {milestone.name}
                      </h4>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>

                  {isActive && !isCompleted && (
                    <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-[#fa9549] text-black font-bold uppercase shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {/* Rewards preview */}
                <div className="mt-3 pt-3 border-t border-[#1f2732] flex flex-wrap gap-1.5 text-[11px] font-mono-numbers">
                  <span className="text-slate-500">Unlocks:</span>
                  {milestone.rewards.map(r => (
                    <span key={r} className="text-[#fa9549] bg-[#0d1014] px-1.5 py-0.5 rounded border border-[#202732]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Milestone Submission Pod */}
        <div className="lg:col-span-6 bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg space-y-5 sticky top-24">
          {activeMilestone ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono-numbers text-[#fa9549] font-semibold">
                    HUB Freighter Pod Loaded
                  </span>
                  <span className="text-xs font-mono-numbers text-slate-400">
                    Tier {activeMilestone.tier}
                  </span>
                </div>
                <h3 className="font-industrial text-xl font-bold text-white tracking-wide">
                  {activeMilestone.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activeMilestone.description}
                </p>
              </div>

              {/* Requirement Deposit Slots */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono-numbers">
                  Deposit Required Components:
                </span>

                <div className="space-y-2">
                  {activeMilestone.cost.map(cost => {
                    const item = ALL_ITEMS[cost.itemId];
                    const deposited = gameState.milestoneContributions[activeMilestone.id]?.[cost.itemId] || 0;
                    const inStock = Math.floor(gameState.inventory[cost.itemId] || 0);
                    const remaining = Math.max(0, cost.amount - deposited);
                    const isDone = deposited >= cost.amount;

                    return (
                      <div
                        key={cost.itemId}
                        className={`bg-[#0d1015] border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-numbers text-xs ${
                          isDone ? 'border-emerald-600/50 bg-emerald-950/10' : 'border-[#222b37]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item?.color || '#fa9549' }}
                          />
                          <div>
                            <span className="text-white font-medium block">
                              {item?.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Stock: {inStock}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={isDone ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                            {deposited} / {cost.amount}
                          </span>

                          {!isDone && (
                            <button
                              disabled={inStock <= 0}
                              onClick={() => onContribute(cost.itemId, remaining)}
                              className="px-3 py-1 bg-[#fa9549] hover:bg-[#fb8533] disabled:opacity-40 text-black font-semibold text-xs rounded transition-colors"
                            >
                              Deposit Max
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pod Launch Status */}
              <div className="pt-2 border-t border-[#1f2732]">
                <div className="bg-[#0e1216] border border-[#202732] rounded-lg p-3 flex items-center justify-between text-xs font-mono-numbers">
                  <span className="text-slate-400">Pod Status:</span>
                  <span className="text-[#fa9549] font-bold">
                    Depositing components completes milestone automatically
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a milestone from the list on the left to review requirements and launch the pod.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
