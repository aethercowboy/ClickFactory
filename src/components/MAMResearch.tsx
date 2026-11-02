import React, { useState, useMemo } from 'react';
import { GameSaveData, MAMNodeDef } from '../types/game';
import { ALL_MAM_NODES } from '../data/mamTrees';
import { ALL_ITEMS } from '../data/items';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Clock,
  FlaskConical,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { audio } from '../utils/audio';

interface MAMResearchProps {
  gameState: GameSaveData;
  onStartResearch: (nodeId: string) => void;
}

export const MAMResearch: React.FC<MAMResearchProps> = ({
  gameState,
  onStartResearch,
}) => {
  const [selectedTree, setSelectedTree] = useState<'slugs' | 'caterium' | 'alien' | 'quartz' | 'hard_drives'>('slugs');

  const trees = [
    { id: 'slugs', label: 'Power Slugs (Overclocking)' },
    { id: 'caterium', label: 'Caterium & Electronics' },
    { id: 'alien', label: 'Alien Organisms & DNA' },
    { id: 'quartz', label: 'Quartz & Crystals' },
    { id: 'hard_drives', label: 'Hard Drives (Alternate Recipes)' },
  ];

  const currentTreeNodes = useMemo(() => {
    return ALL_MAM_NODES.filter(n => n.tree === selectedTree);
  }, [selectedTree]);

  // Active research timer calculation
  const activeResearchNode = gameState.activeResearch
    ? ALL_MAM_NODES.find(n => n.id === gameState.activeResearch?.nodeId)
    : null;

  let researchProgressPercent = 0;
  let remainingSeconds = 0;
  if (gameState.activeResearch) {
    const elapsed = Date.now() - gameState.activeResearch.startTime;
    researchProgressPercent = Math.min(100, (elapsed / gameState.activeResearch.durationMs) * 100);
    remainingSeconds = Math.max(0, Math.ceil((gameState.activeResearch.durationMs - elapsed) / 1000));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-industrial tracking-wide text-white">
              Molecular Analysis Machine (MAM)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Analyze alien biosamples, piezoelectric crystals, crash telemetry, and rare power slugs to unlock machine overclocking, Blade Runners, and alternate recipes.
          </p>
        </div>

        {/* Active research HUD */}
        {activeResearchNode && (
          <div className="bg-[#0e1216] border border-cyan-500/40 rounded-xl p-3 shrink-0 font-mono-numbers text-xs min-w-[240px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Analyzing:
              </span>
              <span className="text-white font-bold">{remainingSeconds}s</span>
            </div>
            <div className="text-[11px] text-slate-300 truncate mb-2">
              {activeResearchNode.name}
            </div>
            <div className="w-full h-1.5 bg-[#182029] rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${researchProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tree Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {trees.map(tree => (
          <button
            key={tree.id}
            onClick={() => {
              setSelectedTree(tree.id as any);
              audio.playCraftPress();
            }}
            className={`px-3 py-2 rounded-lg font-mono-numbers whitespace-nowrap transition-colors ${
              selectedTree === tree.id
                ? 'bg-cyan-500 text-black font-bold shadow'
                : 'bg-[#181f27] text-slate-300 hover:text-white hover:bg-[#202832]'
            }`}
          >
            {tree.label}
          </button>
        ))}
      </div>

      {/* Nodes in current tech tree */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTreeNodes.map(node => {
          const isCompleted = gameState.completedMAMNodes.includes(node.id);
          const isResearching = gameState.activeResearch?.nodeId === node.id;
          const hasPrereqs = node.prerequisites.every(p => gameState.completedMAMNodes.includes(p));

          const canAfford = node.cost.every(
            c => (gameState.inventory[c.itemId] || 0) >= c.amount
          );

          return (
            <div
              key={node.id}
              className={`bg-[#141920] border rounded-xl p-5 flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'border-emerald-600/40 bg-emerald-950/10'
                  : isResearching
                  ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/40'
                  : !hasPrereqs
                  ? 'border-[#1e242d] opacity-50'
                  : 'border-[#242c36] hover:border-cyan-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-industrial text-base font-bold text-white tracking-wide">
                    {node.name}
                  </h3>

                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : !hasPrereqs ? (
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <span className="text-[10px] font-mono-numbers text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded shrink-0">
                      {node.researchDuration}s
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {node.description}
                </p>

                {/* Perk highlight */}
                {node.unlocks.perkName && (
                  <div className="bg-[#0e1216] border border-[#202732] rounded-lg p-2.5 mb-4 text-xs font-mono-numbers">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Research Breakthrough:
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {node.unlocks.perkName}
                    </span>
                  </div>
                )}
              </div>

              {/* Action & Cost footer */}
              <div>
                {!isCompleted && !isResearching && (
                  <div className="space-y-3 pt-3 border-t border-[#1f2732]">
                    <div className="flex flex-wrap gap-2 text-xs font-mono-numbers">
                      {node.cost.map(c => {
                        const inStock = Math.floor(gameState.inventory[c.itemId] || 0);
                        const hasEnough = inStock >= c.amount;

                        return (
                          <span
                            key={c.itemId}
                            className={`px-2 py-1 rounded bg-[#0e1216] border border-[#202732] ${
                              hasEnough ? 'text-slate-300' : 'text-red-400'
                            }`}
                          >
                            {inStock}/{c.amount} {ALL_ITEMS[c.itemId]?.name}
                          </span>
                        );
                      })}
                    </div>

                    <button
                      disabled={!hasPrereqs || !canAfford || !!gameState.activeResearch}
                      onClick={() => {
                        onStartResearch(node.id);
                        audio.playCraftPress();
                      }}
                      className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-industrial text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>
                        {!hasPrereqs
                          ? 'Prerequisites Required'
                          : gameState.activeResearch
                          ? 'MAM Busy'
                          : 'Begin Research'}
                      </span>
                    </button>
                  </div>
                )}

                {isResearching && (
                  <div className="py-2.5 text-center text-xs font-mono-numbers text-cyan-400 font-bold animate-pulse">
                    Analyzing Sample in Progress...
                  </div>
                )}

                {isCompleted && (
                  <div className="py-2 text-center text-xs font-mono-numbers text-emerald-400 font-semibold">
                    Research Synthesized & Applied
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
