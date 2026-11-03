import React, { useState, useMemo } from 'react';
import { GameSaveData, ItemId, RecipeDef } from '../types/game';
import { ALL_ITEMS, ALL_RECIPES } from '../data/items';
import { Wrench, Hammer, Search, ArrowRight, Zap, CheckCircle2, Clock, XOctagon, Loader2 } from 'lucide-react';
import { audio } from '../utils/audio';

interface CraftBenchProps {
  gameState: GameSaveData;
  onCraft?: (recipeId: string, amount: number) => boolean;
  onStartCrafting: (recipeId: string, amount: number) => boolean;
  onCancelCrafting: () => void;
}

export const CraftBench: React.FC<CraftBenchProps> = ({
  gameState,
  onCraft,
  onStartCrafting,
  onCancelCrafting,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('recipe_iron_plate');


  // Available recipes unlocked
  const availableRecipes = useMemo(() => {
    return ALL_RECIPES.filter(recipe => {
      // Must be unlocked by default or in player's unlockedRecipes
      const isUnlocked = recipe.unlockedByDefault || gameState.unlockedRecipes.includes(recipe.id);
      if (!isUnlocked) return false;

      // Filter by category
      if (selectedCategory !== 'all') {
        const primaryOutput = ALL_ITEMS[recipe.outputs[0]?.itemId];
        if (primaryOutput && primaryOutput.category !== selectedCategory) {
          return false;
        }
      }

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = recipe.name.toLowerCase().includes(q);
        const matchesOutput = recipe.outputs.some(o =>
          ALL_ITEMS[o.itemId]?.name.toLowerCase().includes(q)
        );
        return matchesName || matchesOutput;
      }

      return true;
    });
  }, [gameState.unlockedRecipes, selectedCategory, searchQuery]);

  const selectedRecipe = ALL_RECIPES.find(r => r.id === selectedRecipeId) || availableRecipes[0];

  // Calculate how many times this recipe can be crafted right now
  const maxCraftable = useMemo(() => {
    if (!selectedRecipe) return 0;
    let max = Infinity;
    for (const input of selectedRecipe.inputs) {
      const available = gameState.inventory[input.itemId] || 0;
      const count = Math.floor(available / input.amount);
      if (count < max) max = count;
    }
    return max === Infinity ? 0 : max;
  }, [selectedRecipe, gameState.inventory]);

  const hasBladeRunners = gameState.completedMAMNodes.includes('mam_cat_blade_runners');
  const unitCraftTime = selectedRecipe
    ? hasBladeRunners
      ? Math.max(0.2, (selectedRecipe.craftTime || 2) / 2)
      : (selectedRecipe.craftTime || 2)
    : 2;

  const activeCrafting = gameState.activeCrafting;
  const activeRecipe = activeCrafting ? ALL_RECIPES.find(r => r.id === activeCrafting.recipeId) : null;

  const handleCraft = (amount: number) => {
    if (!selectedRecipe || amount <= 0) return;
    const toCraft = Math.min(amount, maxCraftable);
    if (toCraft <= 0) return;

    onStartCrafting(selectedRecipe.id, toCraft);
  };

  const categories = [
    { id: 'all', label: 'All Recipes' },
    { id: 'standard', label: 'Basic Parts' },
    { id: 'advanced', label: 'Steel & Frames' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'oil_chem', label: 'Chemicals' },
    { id: 'project_part', label: 'Project Parts' },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-[#fa9549]" />
            <h2 className="text-lg font-bold font-industrial tracking-wide text-white">
              FICSIT Pioneer Craft Bench
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Manual workbench for prototyping components, assembling intermediate rods and plates, and fabricating emergency Project Assembly parts.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0d1014] px-4 py-2.5 rounded-lg border border-[#202732] shrink-0 font-mono-numbers text-xs">
          <span className="text-slate-400">Total Hand Crafts:</span>
          <span className="font-bold text-white">
            {gameState.pioneerStats.manualCrafts.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List: Recipe Browser */}
        <div className="lg:col-span-7 bg-[#141920] border border-[#242c36] rounded-xl p-5 space-y-4 shadow-lg">
          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search blueprints & components..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1014] border border-[#252d37] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fa9549]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#fa9549] text-black font-semibold'
                      : 'bg-[#181f27] text-slate-400 hover:text-white hover:bg-[#202832]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe List */}
          <div className="divide-y divide-[#1e252e] max-h-[500px] overflow-y-auto pr-1">
            {availableRecipes.map(recipe => {
              const isSelected = selectedRecipe?.id === recipe.id;
              const outputItem = ALL_ITEMS[recipe.outputs[0]?.itemId];
              const canAfford = recipe.inputs.every(
                i => (gameState.inventory[i.itemId] || 0) >= i.amount
              );

              return (
                <button
                  key={recipe.id}
                  onClick={() => {
                    setSelectedRecipeId(recipe.id);
                    audio.playCraftPress();
                  }}
                  className={`w-full text-left py-3 px-3 rounded-lg flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#1d242e] border-l-2 border-[#fa9549]'
                      : 'hover:bg-[#181f27]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs shrink-0"
                      style={{
                        backgroundColor: `${outputItem?.color || '#94a3b8'}20`,
                        color: outputItem?.color || '#94a3b8',
                      }}
                    >
                      {outputItem?.name.substring(0, 2).toUpperCase() || 'IT'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white font-industrial tracking-wide">
                          {recipe.name}
                        </span>
                        {recipe.isAlternate && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded font-mono-numbers">
                            ALT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                        Produces: {recipe.outputs.map(o => `${o.amount} ${ALL_ITEMS[o.itemId]?.name}`).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono-numbers text-xs">
                    <span className={canAfford ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {canAfford ? 'Ready' : 'Missing Ore'}
                    </span>
                  </div>
                </button>
              );
            })}

            {availableRecipes.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No matching recipes unlocked. Progress HUB Milestones to expand your crafting capabilities.
              </div>
            )}
          </div>
        </div>

        {/* Right Showcase: Selected Recipe Action Box */}
        {selectedRecipe ? (
          <div className="lg:col-span-5 bg-[#141920] border border-[#242c36] rounded-xl p-5 space-y-6 shadow-lg sticky top-24">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-mono-numbers text-[#fa9549]">
                  Fabrication Blueprint
                </span>
                <span className="text-[10px] font-mono-numbers text-slate-400">
                  Batch: {selectedRecipe.craftTime}s
                </span>
              </div>
              <h3 className="font-industrial text-xl font-bold text-white tracking-wide">
                {selectedRecipe.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {ALL_ITEMS[selectedRecipe.outputs[0]?.itemId]?.description}
              </p>
            </div>

            {/* Ingredients Needed */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono-numbers">
                Required Ingredients:
              </span>
              <div className="space-y-1.5">
                {selectedRecipe.inputs.map(input => {
                  const item = ALL_ITEMS[input.itemId];
                  const inStock = Math.floor(gameState.inventory[input.itemId] || 0);
                  const hasEnough = inStock >= input.amount;

                  return (
                    <div
                      key={input.itemId}
                      className="bg-[#0e1216] border border-[#202732] rounded-lg p-2.5 flex items-center justify-between text-xs font-mono-numbers"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item?.color || '#fa9549' }}
                        />
                        <span className="text-white font-medium">{item?.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={hasEnough ? 'text-slate-300' : 'text-red-400'}>
                          {inStock}
                        </span>
                        <span className="text-slate-500">/ {input.amount} req</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Output preview */}
            <div className="bg-[#0d1014] border border-[#fa9549]/30 rounded-lg p-3 text-xs font-mono-numbers flex items-center justify-between">
              <span className="text-slate-400">Yield per batch:</span>
              <span className="font-bold text-[#fa9549]">
                {selectedRecipe.outputs.map(o => `+${o.amount} ${ALL_ITEMS[o.itemId]?.name}`).join(', ')}
              </span>
            </div>

            {/* Batch Craft Controls or Active Progress */}
            {activeCrafting ? (
              <div className="bg-[#10141a] border border-[#fa9549]/60 rounded-xl p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hammer className="w-5 h-5 text-[#fa9549] animate-bounce" />
                    <span className="font-industrial text-sm font-bold text-white tracking-wide">
                      FABRICATING: {activeRecipe?.name || 'Item'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-numbers text-amber-400 font-semibold">
                    {activeCrafting.completedBatches} / {activeCrafting.totalBatches} done
                  </span>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono-numbers text-slate-300">
                    <span>Overall Progress</span>
                    <span>
                      {Math.round(
                        ((activeCrafting.completedBatches + activeCrafting.progress) /
                          activeCrafting.totalBatches) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#1b222c] h-3 rounded-full overflow-hidden border border-[#263140]">
                    <div
                      className="bg-gradient-to-r from-[#fa9549] to-amber-300 h-full transition-all duration-100"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((activeCrafting.completedBatches + activeCrafting.progress) /
                              activeCrafting.totalBatches) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Current Unit Sub-Progress */}
                <div className="space-y-1 bg-[#0b0e12] p-2.5 rounded-lg border border-[#1e2530]">
                  <div className="flex justify-between text-[10px] font-mono-numbers text-slate-400">
                    <span>Current Unit</span>
                    <span>{Math.round(activeCrafting.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#161c24] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-100"
                      style={{ width: `${Math.round(activeCrafting.progress * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono-numbers text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Speed: {activeCrafting.batchDurationSeconds.toFixed(1)}s / unit
                    </span>
                    <span className="text-[#fa9549] font-semibold">
                      ~
                      {Math.max(
                        0,
                        (activeCrafting.totalBatches -
                          activeCrafting.completedBatches -
                          activeCrafting.progress) *
                          activeCrafting.batchDurationSeconds
                      ).toFixed(1)}
                      s left
                    </span>
                  </div>
                </div>

                {/* Prominent Interrupt / Cancel Button */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={onCancelCrafting}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-industrial text-sm font-bold rounded-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XOctagon className="w-5 h-5 text-white" />
                    <span>INTERRUPT / CANCEL CRAFTING</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center font-mono-numbers leading-tight">
                    Finished items ({activeCrafting.completedBatches}) are safely in inventory. Canceling halts immediately with zero resource waste.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono-numbers text-slate-400 px-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {unitCraftTime.toFixed(1)}s / unit
                    {hasBladeRunners && (
                      <span className="text-amber-400 font-semibold ml-1">⚡ 2x Speed</span>
                    )}
                  </span>
                  {maxCraftable > 0 && (
                    <span>Max: {(maxCraftable * unitCraftTime).toFixed(1)}s</span>
                  )}
                </div>

                <button
                  disabled={maxCraftable <= 0}
                  onClick={() => handleCraft(1)}
                  className="w-full py-3.5 px-4 bg-[#fa9549] hover:bg-[#fb8533] disabled:opacity-40 disabled:hover:bg-[#fa9549] text-black font-industrial text-base font-bold rounded-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Hammer className="w-5 h-5 text-black" />
                  <span>CRAFT 1x ({selectedRecipe.outputs[0]?.amount} items)</span>
                </button>

                <div className="grid grid-cols-3 gap-2 font-mono-numbers text-xs">
                  <button
                    disabled={maxCraftable < 5}
                    onClick={() => handleCraft(5)}
                    className="py-2 bg-[#1b222c] hover:bg-[#252f3d] disabled:opacity-40 text-slate-300 rounded font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Craft 5x
                  </button>
                  <button
                    disabled={maxCraftable < 10}
                    onClick={() => handleCraft(10)}
                    className="py-2 bg-[#1b222c] hover:bg-[#252f3d] disabled:opacity-40 text-slate-300 rounded font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Craft 10x
                  </button>
                  <button
                    disabled={maxCraftable <= 0}
                    onClick={() => handleCraft(maxCraftable)}
                    className="py-2 bg-[#1b222c] hover:bg-[#252f3d] disabled:opacity-40 text-[#fa9549] rounded font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Max ({maxCraftable})
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
