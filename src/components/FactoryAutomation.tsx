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
  Check,
  CheckCircle2,
} from 'lucide-react';
import { audio } from '../utils/audio';
import { getValidOresForExtractor, isValidExtractorTarget } from '../utils/extractors';
import { isFicsmasActive } from '../utils/ficsmas';

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

  const isHolidayActive = isFicsmasActive(gameState);

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

  // Overall building count map (how many of each architecture the player owns)
  const buildingCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of gameState.machines) {
      counts[m.buildingId] = (counts[m.buildingId] || 0) + m.count;
    }
    return counts;
  }, [gameState.machines]);

  // Extractor counts per ore node: counts[buildingId][oreId] and total[oreId]
  const { extractorOreCountMap, totalOreExtractorCountMap } = useMemo(() => {
    const byBuilding: Record<string, Partial<Record<ItemId, number>>> = {};
    const totalByOre: Partial<Record<ItemId, number>> = {};

    for (const m of gameState.machines) {
      const b = ALL_BUILDINGS[m.buildingId];
      if (b && b.category === 'extractor') {
        const ore = (m.targetOre || (m.buildingId === 'ficsmas_gift_tree' ? 'ficsmas_gift' : undefined)) as ItemId | undefined;
        if (ore) {
          if (!byBuilding[m.buildingId]) byBuilding[m.buildingId] = {};
          byBuilding[m.buildingId][ore] = (byBuilding[m.buildingId][ore] || 0) + m.count;
          totalByOre[ore] = (totalByOre[ore] || 0) + m.count;
        }
      }
    }
    return { extractorOreCountMap: byBuilding, totalOreExtractorCountMap: totalByOre };
  }, [gameState.machines]);

  // Recipe counts per building: counts[buildingId][recipeId]
  const machineRecipeCountMap = useMemo(() => {
    const byBuilding: Record<string, Record<string, number>> = {};
    for (const m of gameState.machines) {
      if (m.recipeId) {
        if (!byBuilding[m.buildingId]) byBuilding[m.buildingId] = {};
        byBuilding[m.buildingId][m.recipeId] = (byBuilding[m.buildingId][m.recipeId] || 0) + m.count;
      }
    }
    return byBuilding;
  }, [gameState.machines]);

  // Permissible ores for the selected extractor architecture
  const availableOresForSelectedExtractor = useMemo(() => {
    if (!selectedDeployBuilding || selectedDeployBuilding.category !== 'extractor') return [];
    const validOres = getValidOresForExtractor(selectedDeployBuilding.id);
    return validOres.filter(
      oreId => gameState.unlockedOres.includes(oreId) || (oreId === 'ficsmas_gift' && isHolidayActive)
    );
  }, [selectedDeployBuilding, gameState.unlockedOres, isHolidayActive]);

  // Recipes suitable for the selected building
  const suitableRecipes = useMemo(() => {
    if (!selectedDeployBuilding || !selectedDeployBuilding.machineType) return [];
    const mType = selectedDeployBuilding.machineType;
    return ALL_RECIPES.filter(
      r => r.machineType === mType && (r.unlockedByDefault || gameState.unlockedRecipes.includes(r.id))
    );
  }, [selectedDeployBuilding, gameState.unlockedRecipes]);

  // Synchronize ore selection whenever switching building architectures
  const handleSelectBuildingArchitecture = (buildingId: string) => {
    setDeployBuildingId(buildingId);
    setDeployRecipeId('');
    const b = ALL_BUILDINGS[buildingId];
    if (b && b.category === 'extractor') {
      const valid = getValidOresForExtractor(b.id).filter(
        o => gameState.unlockedOres.includes(o) || (o === 'ficsmas_gift' && isHolidayActive)
      );
      if (!valid.includes(deployOreId)) {
        setDeployOreId(valid[0] || 'iron_ore');
      }
    }
  };

  const handleOpenDeploy = (buildingId?: string) => {
    const targetBuildingId = buildingId || deployBuildingId;
    if (buildingId) {
      setDeployBuildingId(buildingId);
    }
    const b = ALL_BUILDINGS[targetBuildingId] || unlockedBuildingsList[0];
    if (b && b.category === 'extractor') {
      const valid = getValidOresForExtractor(b.id).filter(
        o => gameState.unlockedOres.includes(o) || (o === 'ficsmas_gift' && isHolidayActive)
      );
      if (!valid.includes(deployOreId)) {
        setDeployOreId(valid[0] || 'iron_ore');
      }
    }
    setShowDeployModal(true);
    audio.playCraftPress();
  };

  const handleConfirmDeploy = () => {
    if (!selectedDeployBuilding) return;
    if (selectedDeployBuilding.category === 'extractor') {
      // Validate extractor target compatibility
      let targetToDeploy = deployOreId;
      if (!isValidExtractorTarget(selectedDeployBuilding.id, targetToDeploy)) {
        const valid = getValidOresForExtractor(selectedDeployBuilding.id);
        const fallback = valid.find(o => gameState.unlockedOres.includes(o)) || valid[0];
        if (fallback) {
          targetToDeploy = fallback;
        }
      }
      onBuildMachine(selectedDeployBuilding.id, undefined, targetToDeploy);
    } else {
      const targetRecipe = deployRecipeId || suitableRecipes[0]?.id;
      if (targetRecipe) {
        onBuildMachine(selectedDeployBuilding.id, targetRecipe);
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-industrial text-base font-bold text-white tracking-wide">
                        {isExtractor && targetItem ? `${targetItem.name} Extractor` : building.name}
                      </h3>
                      <span className="text-xs font-mono-numbers px-2 py-0.5 rounded bg-[#1f2732] text-[#fa9549] font-bold">
                        x{machine.count}
                      </span>
                      {isExtractor && targetItem && (
                        <span className="text-[10px] text-slate-400 font-mono-numbers bg-[#161c24] border border-[#242c36] px-1.5 py-0.5 rounded">
                          {building.name}
                        </span>
                      )}
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 font-mono-numbers">
                  Select Machine Architecture:
                </label>
                <span className="text-[11px] font-mono-numbers text-slate-500">
                  {unlockedBuildingsList.length} architecture{unlockedBuildingsList.length === 1 ? '' : 's'} unlocked
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unlockedBuildingsList.map(b => {
                  const count = buildingCountMap[b.id] || 0;
                  const isNone = count === 0;
                  const isSelected = deployBuildingId === b.id;

                  return (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBuildingArchitecture(b.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#fa9549] bg-[#1e2530] text-white shadow-lg ring-1 ring-[#fa9549]/50'
                          : isNone
                          ? 'border-amber-500/40 bg-gradient-to-b from-[#181d24] to-[#0e1216] text-slate-300 hover:border-amber-400 hover:text-white'
                          : 'border-[#242c36] bg-[#0e1216] text-slate-400 hover:text-white hover:bg-[#161c24]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-industrial text-xs font-bold tracking-wide truncate">
                            {b.name}
                          </div>
                          {isNone ? (
                            <span className="text-[9px] font-mono-numbers font-bold text-amber-300 bg-amber-500/25 border border-amber-500/60 px-1.5 py-0.5 rounded shrink-0 shadow-sm shadow-amber-950">
                              0 Owned
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono-numbers font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 rounded shrink-0">
                              x{count}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono-numbers mt-0.5 truncate">
                          {b.powerConsumption} MW · Tier {b.tierUnlocked}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Extractor, choose Target Ore Node (restricted to engineered types) */}
            {selectedDeployBuilding?.category === 'extractor' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 font-mono-numbers">
                    Assign Target Mineral Node:
                  </label>
                  <span className="text-[11px] font-mono-numbers text-amber-400/90 font-medium">
                    {selectedDeployBuilding.id === 'water_extractor'
                      ? '💧 Water Reservoir Only'
                      : selectedDeployBuilding.id === 'oil_extractor'
                      ? '🛢️ Crude Oil Wellhead Only'
                      : selectedDeployBuilding.id === 'ficsmas_gift_tree'
                      ? '🎁 Holiday Orbit Gift Drop Only'
                      : '⛏️ Solid Mineral Outcrops Only'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableOresForSelectedExtractor.map(oreId => {
                    const ore = ALL_ITEMS[oreId];
                    if (!ore) return null;
                    const isSelected = deployOreId === oreId;
                    const thisModelCount = extractorOreCountMap[selectedDeployBuilding.id]?.[oreId] || 0;
                    const isNone = thisModelCount === 0;

                    return (
                      <button
                        key={oreId}
                        onClick={() => setDeployOreId(oreId)}
                        className={`p-2.5 rounded-lg border text-left font-mono-numbers text-xs transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#fa9549] bg-[#1e2530] text-white shadow-md ring-1 ring-[#fa9549]/40'
                            : isNone
                            ? 'border-amber-500/40 bg-gradient-to-b from-[#181d24] to-[#0f1318] text-slate-300 hover:border-amber-400 hover:text-white'
                            : 'border-[#242c36] bg-[#0e1216] text-slate-400 hover:text-white hover:bg-[#161c24]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 w-full">
                          <div className="flex items-center gap-1.5 font-medium truncate">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: ore.color }}
                            />
                            <span className="truncate">{ore.name}</span>
                          </div>
                          {isNone ? (
                            <span className="text-[9px] font-bold text-amber-300 bg-amber-500/25 border border-amber-500/60 px-1 py-0.5 rounded shrink-0 shadow-sm shadow-amber-950">
                              0 Deployed
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-1 py-0.5 rounded shrink-0">
                              x{thisModelCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate">
                          {isNone ? (
                            <span className="text-amber-300/80">0 {ore.name} Extractors</span>
                          ) : (
                            <span>{ore.name} Extractors: <strong className="text-white">x{thisModelCount}</strong></span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {availableOresForSelectedExtractor.length === 0 && (
                  <div className="p-4 bg-amber-950/20 border border-amber-600/40 rounded-lg text-center text-xs text-amber-300 font-mono-numbers">
                    No compatible resource deposits are currently surveyed for this extractor. Unlock milestones to discover compatible deposits!
                  </div>
                )}
              </div>
            ) : (
              /* If Production Machine, choose Recipe */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 font-mono-numbers">
                    Assign Blueprint Recipe:
                  </label>
                  <span className="text-[11px] font-mono-numbers text-slate-400">
                    {suitableRecipes.length} blueprint{suitableRecipes.length === 1 ? '' : 's'} available
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {suitableRecipes.map(r => {
                    const isSelected = (deployRecipeId || suitableRecipes[0]?.id) === r.id;
                    const count = machineRecipeCountMap[selectedDeployBuilding.id]?.[r.id] || 0;
                    const isNone = count === 0;

                    return (
                      <button
                        key={r.id}
                        onClick={() => setDeployRecipeId(r.id)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs font-mono-numbers transition-all ${
                          isSelected
                            ? 'border-[#fa9549] bg-[#1e2530] text-white shadow-md ring-1 ring-[#fa9549]/40'
                            : isNone
                            ? 'border-amber-500/35 bg-gradient-to-r from-[#171b22] to-[#0f1217] text-slate-300 hover:border-amber-400 hover:text-white'
                            : 'border-[#242c36] bg-[#0e1216] text-slate-400 hover:text-white hover:bg-[#161c24]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{r.name}</span>
                          <span className="text-slate-500 text-[11px]">
                            ({r.inputs.map(i => `${i.amount} ${ALL_ITEMS[i.itemId]?.name}`).join(' + ')})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isNone ? (
                            <span className="text-[9px] font-bold text-amber-300 bg-amber-500/25 border border-amber-500/60 px-1.5 py-0.5 rounded shadow-sm shadow-amber-950">
                              0 Active (None)
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                              x{count} Active
                            </span>
                          )}
                        </div>
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

            {/* Active Device Fleet Status Banner */}
            {(() => {
              const isExtractor = selectedDeployBuilding?.category === 'extractor';
              const targetRecipe = !isExtractor
                ? (ALL_RECIPES.find(r => r.id === (deployRecipeId || suitableRecipes[0]?.id)) || suitableRecipes[0])
                : null;

              const activeCount = isExtractor
                ? (extractorOreCountMap[selectedDeployBuilding.id]?.[deployOreId] || 0)
                : targetRecipe
                ? (machineRecipeCountMap[selectedDeployBuilding.id]?.[targetRecipe.id] || 0)
                : 0;

              const deviceLabel = isExtractor
                ? `${ALL_ITEMS[deployOreId]?.name || 'Resource'} Extractor (${selectedDeployBuilding.name})`
                : targetRecipe
                ? `${selectedDeployBuilding.name} producing ${targetRecipe.name}`
                : selectedDeployBuilding.name;

              const isZero = activeCount === 0;

              return (
                <div
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono-numbers text-xs transition-all ${
                    isZero
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                      : 'bg-[#0f141a] border-cyan-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isZero
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      }`}
                    >
                      {isZero ? <Sparkles className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400">Device Status:</span>
                        <span className="text-white font-bold tracking-wide">{deviceLabel}</span>
                      </div>
                      <div className={`text-[11px] ${isZero ? 'text-amber-300 font-semibold' : 'text-slate-400'}`}>
                        {isZero
                          ? '★ 0 currently owned — Constructing will deploy your 1st of this device!'
                          : `You currently have ${activeCount} active in your factory.`}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {isZero ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 bg-amber-500/30 border border-amber-500/70 px-2.5 py-1 rounded-md shadow-sm">
                        <span>0 Owned</span>
                        <span className="text-[10px] text-amber-300 font-normal">(None)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-200 bg-cyan-950/80 border border-cyan-700/60 px-2.5 py-1 rounded-md">
                        <span>x{activeCount}</span>
                        <span className="text-[10px] text-cyan-400 font-normal">Deployed</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

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
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="py-2 px-4 rounded-lg text-xs font-mono-numbers text-slate-400 hover:text-white hover:bg-[#1a212b] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeploy}
                className="py-2.5 px-6 bg-[#fa9549] hover:bg-[#fb8533] text-black font-industrial text-sm font-bold rounded-lg shadow-lg hover:shadow-[#fa9549]/20 transition-all active:scale-[0.98] cursor-pointer"
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
