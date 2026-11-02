import React, { useState, useMemo } from 'react';
import { GameSaveData, ItemId, FactoryMachineState } from '../types/game';
import { ALL_BUILDINGS, ALL_RECIPES, ALL_ITEMS } from '../data/items';
import {
  Factory,
  Plus,
  Minus,
  Trash2,
  Pause,
  Play,
  Zap,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { audio } from '../utils/audio';

interface FactoryAutomationProps {
  gameState: GameSaveData;
  onBuildMachine: (buildingId: string, recipeId?: string, targetOre?: ItemId) => boolean;
  onDismantleMachine: (machineId: string) => void;
  onSetOverclock: (machineId: string, shards: number) => void;
  onOpenPowerGrid: () => void;
}

export const FactoryAutomation: React.FC<FactoryAutomationProps> = ({
  gameState,
  onBuildMachine,
  onDismantleMachine,
  onSetOverclock,
  onOpenPowerGrid,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [deployBuildingId, setDeployBuildingId] = useState<string>('constructor_machine');
  const [deployRecipeId, setDeployRecipeId] = useState<string>('');
  const [deployOreId, setDeployOreId] = useState<ItemId>('iron_ore');

  // Filtered active machines
  const filteredMachines = useMemo(() => {
    return gameState.machines.filter(m => {
      const b = ALL_BUILDINGS[m.buildingId];
      if (!b) return false;
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'extractor') return b.category === 'extractor';
      if (selectedFilter === 'smelter') return b.machineType === 'smelter' || b.machineType === 'foundry';
      if (selectedFilter === 'constructor') return b.machineType === 'constructor';
      if (selectedFilter === 'assembler') return b.machineType === 'assembler';
      if (selectedFilter === 'advanced') {
        return b.machineType === 'manufacturer' || b.machineType === 'refinery' || b.machineType === 'blender' || b.machineType === 'accelerator';
      }
      return true;
    });
  }, [gameState.machines, selectedFilter]);

  // Unlocked production buildings for the deploy modal
  const unlockedBuildingsList = useMemo(() => {
    return Object.values(ALL_BUILDINGS).filter(
      b => b.category !== 'power' && gameState.unlockedBuildings.includes(b.id)
    );
  }, [gameState.unlockedBuildings]);

  const selectedDeployBuilding = ALL_BUILDINGS[deployBuildingId] || unlockedBuildingsList[0];

  // Recipes suitable for the selected building
  const suitableRecipes = useMemo(() => {
    if (!selectedDeployBuilding || !selectedDeployBuilding.machineType) return [];
    const mType = selectedDeployBuilding.machineType;
    return ALL_RECIPES.filter(
      r => r.machineType === mType && (r.unlockedByDefault || gameState.unlockedRecipes.includes(r.id))
    );
  }, [selectedDeployBuilding, gameState.unlockedRecipes]);

  const handleOpenDeploy = (buildingId?: string) => {
    if (buildingId) {
      setDeployBuildingId(buildingId);
    }
    setShowDeployModal(true);
    audio.playCraftPress();
  };

  const handleConfirmDeploy = () => {
    if (!selectedDeployBuilding) return;
    if (selectedDeployBuilding.category === 'extractor') {
      onBuildMachine(selectedDeployBuilding.id, undefined, deployOreId);
    } else {
      if (!deployRecipeId && suitableRecipes[0]) {
        onBuildMachine(selectedDeployBuilding.id, suitableRecipes[0].id);
      } else {
        onBuildMachine(selectedDeployBuilding.id, deployRecipeId);
      }
    }
    setShowDeployModal(false);
  };

  const { isTripped } = gameState.powerGrid;

  return (
    <div className="space-y-6">
      {/* Breaker Trip Warning Banner */}
      {isTripped && (
        <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-hazard-stripes-danger animate-pulse shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-industrial text-base font-bold text-white tracking-wide">
                CIRCUIT BREAKER TRIPPED! ALL POWERED FACTORY LINES HALTED
              </h3>
              <p className="text-xs text-red-200">
                Electrical consumption exceeded grid capacity. Add more generators or reduce machine load, then pull the breaker lever to restart.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPowerGrid}
            className="py-2.5 px-5 bg-white hover:bg-slate-200 text-black font-industrial font-bold text-xs rounded-lg shrink-0 shadow uppercase"
          >
            Open Power Grid
          </button>
        </div>
      )}

      {/* Intro & Top Actions */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-5 h-5 text-[#fa9549]" />
            <h2 className="text-lg font-bold font-industrial tracking-wide text-white">
              Automated Factory Lines
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure autonomous conveyor networks, induction smelters, robotic constructors, and heavy manufacturers. Overclock production with alien Power Shards up to 250%!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleOpenDeploy()}
            className="flex items-center gap-2 py-2 px-4 bg-[#fa9549] hover:bg-[#fb8533] text-black font-industrial text-sm font-bold rounded-lg shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Machine</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Machines' },
          { id: 'extractor', label: 'Extractors' },
          { id: 'smelter', label: 'Smelters & Foundries' },
          { id: 'constructor', label: 'Constructors' },
          { id: 'assembler', label: 'Assemblers' },
          { id: 'advanced', label: 'Heavy Manufacturing & Chem' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedFilter === filter.id
                ? 'bg-[#fa9549] text-black font-semibold'
                : 'bg-[#181f27] text-slate-400 hover:text-white hover:bg-[#202832]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Machine Lines Grid */}
      <div className="space-y-3">
        {filteredMachines.map(machine => {
          const building = ALL_BUILDINGS[machine.buildingId];
          if (!building) return null;

          const isExtractor = building.category === 'extractor';
          const targetItem = isExtractor
            ? ALL_ITEMS[machine.targetOre as ItemId]
            : ALL_RECIPES.find(r => r.id === machine.recipeId)?.outputs[0]
            ? ALL_ITEMS[ALL_RECIPES.find(r => r.id === machine.recipeId)!.outputs[0].itemId]
            : null;

          const recipe = ALL_RECIPES.find(r => r.id === machine.recipeId);
          const powerUsedMW = Math.round(building.powerConsumption * machine.count * Math.pow(machine.clockSpeed, 1.3));

          // Calculate rates per minute
          let outputRatePerMin = 0;
          if (isExtractor) {
            let baseRate = 2;
            if (building.id === 'miner_mk1') baseRate = 10;
            if (building.id === 'miner_mk2') baseRate = 30;
            if (building.id === 'miner_mk3') baseRate = 90;
            if (building.id === 'oil_extractor') baseRate = 20;
            if (building.id === 'water_extractor') baseRate = 25;
            outputRatePerMin = baseRate * 60 * machine.clockSpeed * machine.count;
          } else if (recipe) {
            const batchPerMin = (60 / recipe.craftTime) * machine.clockSpeed * machine.count;
            outputRatePerMin = batchPerMin * (recipe.outputs[0]?.amount || 1);
          }

          return (
            <div
              key={machine.id}
              className={`bg-[#141920] border rounded-xl p-4 shadow transition-all ${
                machine.isPaused
                  ? 'border-slate-800 opacity-60'
                  : isTripped && building.powerConsumption > 0
                  ? 'border-red-500/50 bg-red-950/20'
                  : 'border-[#242c36] hover:border-[#fa9549]/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left info: Building name, Recipe, and Output */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1f2732] border border-[#2c3744] flex items-center justify-center font-industrial text-sm font-bold text-[#fa9549] shrink-0">
                    {building.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-industrial text-base font-bold text-white tracking-wide">
                        {building.name}
                      </h3>
                      <span className="text-xs font-mono-numbers px-2 py-0.5 rounded bg-[#1f2732] text-[#fa9549] font-bold">
                        x{machine.count}
                      </span>
                      {recipe?.isAlternate && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded font-mono-numbers">
                          ALT
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 font-mono-numbers mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        Target: <strong className="text-white">{isExtractor ? targetItem?.name : recipe?.name}</strong>
                      </span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">
                        +{Math.round(outputRatePerMin)} {targetItem?.unit || 'items'}/min
                      </span>
                      <span>·</span>
                      <span className="text-[#fa9549] flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {powerUsedMW} MW
                      </span>
                    </div>

                    {/* Inputs needed if production machine */}
                    {recipe && (
                      <div className="text-[11px] text-slate-400 font-mono-numbers mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-slate-500">Inputs:</span>
                        {recipe.inputs.map(i => {
                          const item = ALL_ITEMS[i.itemId];
                          const inRate = Math.round((60 / recipe.craftTime) * i.amount * machine.clockSpeed * machine.count);
                          return (
                            <span key={i.itemId} className="text-slate-300 bg-[#0d1014] px-1.5 py-0.5 rounded border border-[#202732]">
                              -{inRate} {item?.name}/min
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Overclocking Shards & Machine Count */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 shrink-0 font-mono-numbers text-xs">
                  {/* Overclocking Shard Sockets */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>Clock: {Math.round(machine.clockSpeed * 100)}%</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map(shardIndex => {
                        const isInstalled = machine.powerShards >= shardIndex;
                        const canUnlock = gameState.overclockCap >= 1.0 + shardIndex * 0.5;

                        return (
                          <button
                            key={shardIndex}
                            disabled={!canUnlock}
                            onClick={() => {
                              if (isInstalled) {
                                onSetOverclock(machine.id, shardIndex - 1);
                              } else {
                                onSetOverclock(machine.id, shardIndex);
                              }
                            }}
                            title={
                              !canUnlock
                                ? 'Research Power Slugs in the MAM to unlock shard sockets'
                                : isInstalled
                                ? 'Click to remove Power Shard'
                                : 'Click to socket Power Shard (+50% clock speed)'
                            }
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              !canUnlock
                                ? 'border-[#242c36] bg-[#0e1216] opacity-30 cursor-not-allowed'
                                : isInstalled
                                ? 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-sm shadow-cyan-500/20'
                                : 'border-[#2e3846] bg-[#161c24] hover:border-cyan-400 text-slate-500'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity adjustments: +1 / -1 / Dismantle */}
                  <div className="flex items-center gap-1 bg-[#0d1014] p-1 rounded-lg border border-[#202732]">
                    <button
                      onClick={() => onDismantleMachine(machine.id)}
                      title="Dismantle 1 unit (100% refund)"
                      className="p-1.5 rounded hover:bg-[#1a212b] text-slate-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-8 text-center font-bold text-white text-xs">
                      {machine.count}
                    </span>

                    <button
                      onClick={() => {
                        if (isExtractor) {
                          onBuildMachine(building.id, undefined, machine.targetOre);
                        } else {
                          onBuildMachine(building.id, machine.recipeId);
                        }
                      }}
                      title="Construct +1 machine"
                      className="p-1.5 rounded hover:bg-[#1a212b] text-[#fa9549] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMachines.length === 0 && (
          <div className="bg-[#141920] border border-[#242c36] rounded-xl p-12 text-center text-slate-500">
            <Factory className="w-10 h-10 mx-auto text-slate-600 mb-3 opacity-60" />
            <h4 className="font-industrial text-base font-semibold text-slate-400 mb-1">
              No Active Factory Lines in this Category
            </h4>
            <p className="text-xs max-w-md mx-auto mb-4">
              Click the Deploy Machine button above to commission automated miners, smelters, constructors, or assemblers.
            </p>
            <button
              onClick={() => handleOpenDeploy()}
              className="py-2 px-4 bg-[#fa9549] hover:bg-[#fb8533] text-black font-industrial text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy First Machine</span>
            </button>
          </div>
        )}
      </div>

      {/* Deploy Machine Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141920] border border-[#242c36] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#242c36] pb-3">
              <h3 className="font-industrial text-lg font-bold text-white tracking-wide">
                Deploy Automated Production Line
              </h3>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono-numbers px-2 py-1 rounded hover:bg-[#1c232c]"
              >
                Close
              </button>
            </div>

            {/* Select Machine Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-mono-numbers">
                Select Machine Architecture:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unlockedBuildingsList.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setDeployBuildingId(b.id);
                      setDeployRecipeId('');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      deployBuildingId === b.id
                        ? 'border-[#fa9549] bg-[#1e2530] text-white shadow'
                        : 'border-[#242c36] bg-[#0e1216] text-slate-400 hover:text-white hover:bg-[#161c24]'
                    }`}
                  >
                    <div className="font-industrial text-xs font-bold tracking-wide">
                      {b.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono-numbers mt-0.5">
                      {b.powerConsumption} MW · Tier {b.tierUnlocked}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* If Extractor, choose Target Ore Node */}
            {selectedDeployBuilding?.category === 'extractor' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono-numbers">
                  Assign Target Mineral Node:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gameState.unlockedOres.map(oreId => {
                    const ore = ALL_ITEMS[oreId];
                    if (!ore) return null;
                    return (
                      <button
                        key={oreId}
                        onClick={() => setDeployOreId(oreId)}
                        className={`p-2 rounded-lg border text-left font-mono-numbers text-xs transition-all ${
                          deployOreId === oreId
                            ? 'border-[#fa9549] bg-[#1e2530] text-white'
                            : 'border-[#242c36] bg-[#0e1216] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="font-medium">{ore.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* If Production Machine, choose Recipe */
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 font-mono-numbers">
                  Assign Blueprint Recipe:
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {suitableRecipes.map(r => {
                    const isSelected = (deployRecipeId || suitableRecipes[0]?.id) === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setDeployRecipeId(r.id)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs font-mono-numbers transition-all ${
                          isSelected
                            ? 'border-[#fa9549] bg-[#1e2530] text-white'
                            : 'border-[#242c36] bg-[#0e1216] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-slate-500">
                          {r.inputs.map(i => `${i.amount} ${ALL_ITEMS[i.itemId]?.name}`).join(' + ')}
                        </span>
                      </button>
                    );
                  })}

                  {suitableRecipes.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-4">
                      No recipes unlocked for this machine yet. Complete HUB Milestones to unlock recipes!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Building Construction Cost Preview */}
            <div className="bg-[#0e1216] border border-[#202732] rounded-lg p-3 font-mono-numbers text-xs">
              <span className="text-slate-400 block mb-2 font-semibold">Construction Cost:</span>
              <div className="flex flex-wrap gap-3">
                {selectedDeployBuilding?.cost.map(c => {
                  const item = ALL_ITEMS[c.itemId];
                  const inStock = Math.floor(gameState.inventory[c.itemId] || 0);
                  const canAfford = inStock >= c.amount;

                  return (
                    <div key={c.itemId} className="flex items-center gap-1.5">
                      <span className={canAfford ? 'text-emerald-400' : 'text-red-400'}>
                        {inStock}
                      </span>
                      <span className="text-slate-500">/ {c.amount}</span>
                      <span className="text-white">{item?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deploy Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="py-2 px-4 rounded-lg text-xs font-mono-numbers text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeploy}
                className="py-2.5 px-6 bg-[#fa9549] hover:bg-[#fb8533] text-black font-industrial text-sm font-bold rounded-lg shadow transition-colors"
              >
                Construct Machine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
