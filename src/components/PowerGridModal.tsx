import React from 'react';
import { GameSaveData, GeneratorBuildingType } from '../types/game';
import { ALL_BUILDINGS, ALL_ITEMS } from '../data/items';
import { Zap, AlertTriangle, Plus, Power, Flame, Waves, ShieldAlert } from 'lucide-react';
import { audio } from '../utils/audio';

interface PowerGridModalProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
  onResetBreaker: () => void;
  onBuildGenerator: (buildingId: string) => boolean;
}

export const PowerGridModal: React.FC<PowerGridModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onResetBreaker,
  onBuildGenerator,
}) => {
  if (!isOpen) return null;

  const { capacity, consumption, isTripped } = gameState.powerGrid;
  const loadPercentage = capacity > 0 ? Math.min(100, Math.round((consumption / capacity) * 100)) : 0;
  const isOverloaded = consumption > capacity && capacity > 0;

  // Unlocked power generators
  const powerGenerators = [
    ALL_BUILDINGS.biomass_burner,
    ALL_BUILDINGS.coal_generator,
    ALL_BUILDINGS.fuel_generator,
    ALL_BUILDINGS.nuclear_power_plant,
  ].filter(g => gameState.unlockedBuildings.includes(g.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141920] border border-[#242c36] rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242c36] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#fa9549]" />
            <h3 className="font-industrial text-xl font-bold text-white tracking-wide">
              FICSIT Electrical Power Substation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-mono-numbers px-2.5 py-1 rounded hover:bg-[#1c232c]"
          >
            Close
          </button>
        </div>

        {/* Breaker Trip Banner or Normal Status */}
        {isTripped ? (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-5 bg-hazard-stripes-danger flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <h4 className="font-industrial text-lg font-bold text-red-200">
                  FUSE TRIPPED: GRID OVERLOAD
                </h4>
                <p className="text-xs text-red-300">
                  Total load ({consumption} MW) exceeded capacity ({capacity} MW).
                  Shut down machines or deploy more generators before engaging the reset lever.
                </p>
              </div>
            </div>

            <button
              onClick={onResetBreaker}
              className="py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-industrial text-sm font-bold rounded-lg shadow-lg uppercase tracking-wider shrink-0 transition-all active:scale-[0.98]"
            >
              Pull Reset Lever
            </button>
          </div>
        ) : (
          <div className="bg-[#0e1216] border border-[#202732] rounded-xl p-4 flex items-center justify-between font-mono-numbers text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Grid Breaker:</span>
              <strong className="text-emerald-400 uppercase">Operational (Engaged)</strong>
            </div>
            <span className="text-slate-400">
              Load: <strong className={loadPercentage > 85 ? 'text-amber-400' : 'text-white'}>{loadPercentage}%</strong>
            </span>
          </div>
        )}

        {/* Power Telemetry Bar Graph */}
        <div className="bg-[#0e1216] border border-[#202732] rounded-xl p-5 space-y-4 font-mono-numbers">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Power Consumption: </span>
              <strong className={isOverloaded ? 'text-red-400 text-sm' : 'text-[#fa9549] text-sm'}>
                {consumption} MW
              </strong>
            </div>

            <div>
              <span className="text-slate-400">Total Generation Capacity: </span>
              <strong className="text-cyan-400 text-sm">{capacity} MW</strong>
            </div>
          </div>

          {/* Dual Bar Graphic */}
          <div className="space-y-1.5">
            <div className="w-full h-4 bg-[#182029] rounded-full overflow-hidden flex relative">
              {/* Consumption fill */}
              <div
                className={`h-full transition-all duration-300 ${
                  isTripped || isOverloaded ? 'bg-red-500' : 'bg-[#fa9549]'
                }`}
                style={{ width: `${Math.min(100, capacity > 0 ? (consumption / capacity) * 100 : 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 MW</span>
              <span>50%</span>
              <span>{capacity} MW (100% Max)</span>
            </div>
          </div>
        </div>

        {/* Generator Plants Management */}
        <div className="space-y-3">
          <h4 className="font-industrial text-base font-semibold text-white tracking-wide">
            Power Generation Infrastructure
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {powerGenerators.map(gen => {
              const currentGenState = gameState.generators.find(g => g.buildingId === gen.id);
              const count = currentGenState?.count || 0;
              const totalOutput = (gen.powerGeneration || 0) * count;

              // Check fuel status
              let fuelStatusText = 'Fueled';
              let fuelColor = 'text-emerald-400';
              if (gen.fuelRequired) {
                const hasFuel = gen.fuelRequired.fuelItems.some(
                  f => (gameState.inventory[f] || 0) > 0
                );
                if (!hasFuel) {
                  fuelStatusText = 'No Fuel Available';
                  fuelColor = 'text-red-400';
                }
              }

              return (
                <div
                  key={gen.id}
                  className="bg-[#0e1216] border border-[#202732] rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-industrial text-sm font-bold text-white tracking-wide">
                          {gen.name}
                        </h5>
                        <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                          Output: +{gen.powerGeneration} MW per unit
                        </div>
                      </div>

                      <span className="font-mono-numbers text-xs px-2 py-0.5 rounded bg-[#1f2732] text-[#fa9549] font-bold">
                        x{count} Active
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono-numbers bg-[#141920] p-2 rounded">
                      <span className="text-slate-400">Total Output:</span>
                      <strong className="text-cyan-400">+{totalOutput} MW</strong>
                    </div>

                    {gen.fuelRequired && (
                      <div className="mt-2 text-[11px] font-mono-numbers flex items-center justify-between">
                        <span className="text-slate-500">Fuel: {gen.fuelRequired.fuelItems.map(f => ALL_ITEMS[f]?.name).join(' / ')}</span>
                        <span className={`font-semibold ${fuelColor}`}>{fuelStatusText}</span>
                      </div>
                    )}
                  </div>

                  {/* Build Generator Button */}
                  <div className="pt-2 border-t border-[#1c232c]">
                    <button
                      onClick={() => onBuildGenerator(gen.id)}
                      className="w-full py-2 px-3 bg-[#1e2530] hover:bg-[#fa9549] text-white hover:text-black font-mono-numbers font-semibold text-xs rounded transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Build +1 ({gen.name})</span>
                    </button>

                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono-numbers mt-1.5">
                      {gen.cost.map(c => (
                        <span key={c.itemId}>
                          {c.amount} {ALL_ITEMS[c.itemId]?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
