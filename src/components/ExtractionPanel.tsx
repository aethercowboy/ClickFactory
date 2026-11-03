import React, { useState } from 'react';
import { GameSaveData, ItemId } from '../types/game';
import { ALL_ITEMS, ALL_BUILDINGS } from '../data/items';
import { Pickaxe, Drill, Droplet, Sparkles, Plus, Check } from 'lucide-react';
import { audio } from '../utils/audio';

interface ExtractionPanelProps {
  gameState: GameSaveData;
  onMine: (oreId: ItemId) => void;
  onBuildMachine: (buildingId: string, recipeId?: string, targetOre?: ItemId) => boolean;
}

interface MiningNodeConfig {
  id: ItemId;
  name: string;
  purity: 'Impure' | 'Normal' | 'Pure';
  icon: string;
  gradient: string;
  particleColor: string;
}

const MINING_NODES: MiningNodeConfig[] = [
  {
    id: 'iron_ore',
    name: 'Iron Ore Deposit',
    purity: 'Pure',
    icon: 'Hammer',
    gradient: 'from-slate-700/40 to-slate-900/60 border-slate-600/50',
    particleColor: '#cbd5e1',
  },
  {
    id: 'copper_ore',
    name: 'Copper Ore Vein',
    purity: 'Normal',
    icon: 'Zap',
    gradient: 'from-amber-900/30 to-amber-950/60 border-amber-700/50',
    particleColor: '#ea580c',
  },
  {
    id: 'limestone',
    name: 'Limestone Outcrop',
    purity: 'Pure',
    icon: 'Layers',
    gradient: 'from-stone-700/30 to-stone-900/60 border-stone-600/50',
    particleColor: '#d6d3d1',
  },
  {
    id: 'leaves',
    name: 'Alien Biomass & Foliage',
    purity: 'Pure',
    icon: 'Leaf',
    gradient: 'from-emerald-900/30 to-emerald-950/60 border-emerald-700/50',
    particleColor: '#84cc16',
  },
  {
    id: 'coal',
    name: 'Coal Deposit',
    purity: 'Normal',
    icon: 'Flame',
    gradient: 'from-zinc-800/40 to-black/80 border-zinc-600/50',
    particleColor: '#71717a',
  },
  {
    id: 'water',
    name: 'Water Reservoir',
    purity: 'Pure',
    icon: 'Droplet',
    gradient: 'from-cyan-900/40 to-blue-950/70 border-cyan-600/50',
    particleColor: '#38bdf8',
  },
  {
    id: 'caterium_ore',
    name: 'Caterium Gold Node',
    purity: 'Pure',
    icon: 'Sparkles',
    gradient: 'from-yellow-900/30 to-yellow-950/60 border-yellow-600/50',
    particleColor: '#eab308',
  },
  {
    id: 'raw_quartz',
    name: 'Quartz Crystal Cluster',
    purity: 'Normal',
    icon: 'Compass',
    gradient: 'from-pink-900/30 to-pink-950/60 border-pink-700/50',
    particleColor: '#ec4899',
  },
  {
    id: 'crude_oil',
    name: 'Crude Oil Well',
    purity: 'Pure',
    icon: 'Droplet',
    gradient: 'from-neutral-900/60 to-black border-cyan-900/50',
    particleColor: '#38bdf8',
  },
  {
    id: 'bauxite',
    name: 'Bauxite Ore Shelf',
    purity: 'Normal',
    icon: 'Box',
    gradient: 'from-amber-800/30 to-yellow-950/60 border-amber-600/50',
    particleColor: '#ca8a04',
  },
  {
    id: 'uranium',
    name: 'Uranium Ore Node',
    purity: 'Impure',
    icon: 'Radioactive',
    gradient: 'from-green-950/50 to-black border-green-500/50',
    particleColor: '#22c55e',
  },
];

export const ExtractionPanel: React.FC<ExtractionPanelProps> = ({
  gameState,
  onMine,
  onBuildMachine,
}) => {
  const [clickAnim, setClickAnim] = useState<Record<string, number>>({});

  const handleManualClick = (oreId: ItemId) => {
    onMine(oreId);
    setClickAnim(prev => ({ ...prev, [oreId]: (prev[oreId] || 0) + 1 }));
  };

  // Determine click multiplier description
  const hasCup = gameState.shopPurchases.includes('shop_coffee_cup');
  const hasBlades = gameState.completedMAMNodes.includes('mam_cat_blade_runners');
  const clickMultiplier = (hasCup ? 5 : 1) * (hasBlades ? 1.5 : 1);

  return (
    <div className="space-y-6">
      {/* Overview & Pioneer status card */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Pickaxe className="w-5 h-5 text-[#fa9549]" />
              <h2 className="text-lg font-bold font-industrial tracking-wide text-white">
                Planetary Resource Survey & Extraction
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Survey and tap native mineral nodes across planetary sector MASSAGE-2(A-B)b.
              Click resource nodes directly to chisel by hand, or deploy automated Portable Miners and Drill Rigs to feed your processing lines.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0d1014] px-4 py-2.5 rounded-lg border border-[#202732] shrink-0 font-mono-numbers text-xs">
            <span className="text-slate-400">Manual Yield:</span>
            <span className="font-bold text-[#fa9549]">+{clickMultiplier} ore/click</span>
            {hasCup && <span className="text-[10px] text-amber-300">· Coffee Cup active</span>}
          </div>
        </div>
      </div>

      {/* Grid of Resource Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MINING_NODES.map(node => {
          const isUnlocked = gameState.unlockedOres.includes(node.id);
          const itemDef = ALL_ITEMS[node.id];
          const currentCount = Math.floor(gameState.inventory[node.id] || 0);

          // Find automated extractors stationed on this ore
          const activeDrills = gameState.machines.filter(
            m => m.targetOre === node.id && !m.isPaused
          );
          let automatedRatePerSec = 0;
          activeDrills.forEach(d => {
            const b = ALL_BUILDINGS[d.buildingId];
            if (!b) return;
            let baseRate = 2;
            if (b.id === 'miner_mk1') baseRate = 10;
            if (b.id === 'miner_mk2') baseRate = 30;
            if (b.id === 'miner_mk3') baseRate = 90;
            if (b.id === 'oil_extractor') baseRate = 20;
            if (b.id === 'water_extractor') baseRate = 25;
            automatedRatePerSec += baseRate * d.clockSpeed * d.count;
          });

          if (!isUnlocked) {
            return (
              <div
                key={node.id}
                className="bg-[#12151a]/40 border border-[#1e242d] border-dashed rounded-xl p-5 flex flex-col justify-between opacity-50 text-slate-500"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-industrial text-sm tracking-wide text-slate-500">
                      {node.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono-numbers text-slate-600">
                      Survey Locked
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Reach higher HUB Milestones or MAM Research to unlock surveying for this mineral deposit.
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={node.id}
              className={`bg-[#141920] border ${node.gradient} rounded-xl p-5 flex flex-col justify-between shadow-md transition-all hover:border-[#fa9549]/60`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-industrial text-base font-semibold text-white tracking-wide">
                      {node.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                      <span>Purity: {node.purity}</span>
                      <span>·</span>
                      <span className="text-[#fa9549]">
                        +{automatedRatePerSec > 0 ? automatedRatePerSec.toFixed(1) : 0}/sec auto
                      </span>
                    </div>
                  </div>

                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: `${itemDef.color}25`, color: itemDef.color }}
                  >
                    {itemDef.unit}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {itemDef.description}
                </p>

                {/* Stock readout */}
                <div className="bg-[#0e1216] border border-[#202732] rounded-lg p-2.5 mb-4 flex items-center justify-between font-mono-numbers">
                  <span className="text-xs text-slate-400">Inventory Stock:</span>
                  <span className="text-base font-bold text-white">
                    {currentCount.toLocaleString()} {itemDef.unit}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Manual Mine Button */}
                <button
                  onClick={() => handleManualClick(node.id)}
                  className="w-full py-2.5 px-4 bg-[#1f2732] hover:bg-[#fa9549] text-white hover:text-black font-semibold text-xs rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group shadow"
                >
                  <Pickaxe className="w-4 h-4 text-[#fa9549] group-hover:text-black transition-colors" />
                  <span>Manual Extract (+{clickMultiplier})</span>
                </button>

                {/* Quick Deploy Stationed Extractor */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {node.id === 'water' ? (
                    gameState.unlockedBuildings.includes('water_extractor') ? (
                      <button
                        onClick={() => onBuildMachine('water_extractor', undefined, node.id)}
                        className="flex-1 py-1.5 px-2 bg-[#0d1014] hover:bg-[#1a212b] border border-cyan-800/60 text-[11px] font-mono-numbers text-cyan-200 rounded hover:text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-cyan-400" />
                        <span>Water Extractor</span>
                      </button>
                    ) : null
                  ) : node.id === 'crude_oil' ? (
                    gameState.unlockedBuildings.includes('oil_extractor') ? (
                      <button
                        onClick={() => onBuildMachine('oil_extractor', undefined, node.id)}
                        className="flex-1 py-1.5 px-2 bg-[#0d1014] hover:bg-[#1a212b] border border-[#242d38] text-[11px] font-mono-numbers text-slate-300 rounded hover:text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-[#fa9549]" />
                        <span>Oil Extractor</span>
                      </button>
                    ) : null
                  ) : (
                    <>
                      {gameState.unlockedBuildings.includes('portable_miner') && (
                        <button
                          onClick={() => onBuildMachine('portable_miner', undefined, node.id)}
                          className="flex-1 py-1.5 px-2 bg-[#0d1014] hover:bg-[#1a212b] border border-[#242d38] text-[11px] font-mono-numbers text-slate-300 rounded hover:text-white transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-[#fa9549]" />
                          <span>Portable Miner</span>
                        </button>
                      )}

                      {gameState.unlockedBuildings.includes('miner_mk1') && (
                        <button
                          onClick={() => onBuildMachine('miner_mk1', undefined, node.id)}
                          className="flex-1 py-1.5 px-2 bg-[#0d1014] hover:bg-[#1a212b] border border-[#242d38] text-[11px] font-mono-numbers text-slate-300 rounded hover:text-white transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-[#fa9549]" />
                          <span>Miner Mk.1</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
