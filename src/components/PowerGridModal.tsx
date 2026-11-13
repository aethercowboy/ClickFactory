import React from 'react';
import { GameSaveData, GeneratorBuildingType } from '../types/game';
import { ALL_BUILDINGS, ALL_ITEMS } from '../data/items';
import { Zap, AlertTriangle, Plus, Power, Flame, Waves, ShieldAlert, Pause, Play } from 'lucide-react';
import { audio } from '../utils/audio';

interface PowerGridModalProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
  onResetBreaker: () => void;
  onBuildGenerator: (buildingId: string) => boolean;
  onToggleGeneratorPause?: (buildingId: string) => void;
}

export const PowerGridModal: React.FC<PowerGridModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onResetBreaker,
  onBuildGenerator,
  onToggleGeneratorPause,
}) => {
  if (!isOpen) return null;

  const { capacity, consumption, isTripped } = gameState.powerGrid;
  const loadPercentage = capacity > 0 ? Math.min(100, Math.round((consumption / capacity) * 100)) : 0;
  const isOverloaded = consumption > capacity && capacity > 0;

  // Unlocked power generators (including integrated HUB Biomass Burners when unlocked or present)
  const powerGenerators = [
    ALL_BUILDINGS.hub_biomass_burner,
    ALL_BUILDINGS.biomass_burner,
    ALL_BUILDINGS.coal_generator,
    ALL_BUILDINGS.fuel_generator,
    ALL_BUILDINGS.nuclear_power_plant,
  ].filter(
    g =>
      gameState.unlockedBuildings.includes(g.id) ||
      gameState.generators.some(gen => gen.buildingId === g.id && gen.count > 0)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#141920] border border-[#242c36] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Pinned Header */}
        <div className="shrink-0 bg-[#181f28] border-b border-[#242c36] px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#fa9549]" />
            <h3 className="font-industrial text-lg sm:text-xl font-bold text-white tracking-wide">
              FICSIT Electrical Power Substation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-mono-numbers px-2.5 py-1 rounded hover:bg-[#222c3a] transition-colors"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 font-mono-numbers">

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

              let hasFuel = true;
              let hasWater = true;
              if (gen.fuelRequired) {
                hasFuel = gen.fuelRequired.fuelItems.some(
                  f => (gameState.inventory[f] || 0) > 0
                );
                if (gen.fuelRequired.waterPerMin) {
                  hasWater = (gameState.inventory.water || 0) > 0;
                }
              }

              const isHubBurner = gen.id === 'hub_biomass_burner';
              const isPaused = Boolean(currentGenState?.isPaused);
              const isOperational = count > 0 && hasFuel && hasWater && !isPaused;
              const operatingOutput = isOperational ? (gen.powerGeneration || 0) * count : 0;

              let fuelStatusText = 'Operational';
              let fuelColor = 'text-emerald-400';
              if (count === 0) {
                fuelStatusText = '0 Built';
                fuelColor = 'text-slate-500';
              } else if (isPaused) {
                fuelStatusText = 'Standby (Paused)';
                fuelColor = 'text-amber-400';
              } else if (!hasFuel && !hasWater) {
                fuelStatusText = 'Missing Fuel & Water';
                fuelColor = 'text-red-400';
              } else if (!hasWater) {
                fuelStatusText = 'No Water (Requires Water Extractor)';
                fuelColor = 'text-cyan-400';
              } else if (!hasFuel) {
                fuelStatusText = 'No Fuel Available';
                fuelColor = 'text-red-400';
              }

              return (
                <div
                  key={gen.id}
                  className={`bg-[#0e1216] border rounded-xl p-4 flex flex-col justify-between space-y-3 ${
                    isHubBurner ? 'border-amber-500/35' : 'border-[#202732]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-industrial text-sm font-bold text-white tracking-wide">
                            {gen.name}
                          </h5>
                          {isHubBurner && (
                            <span className="text-[9px] font-mono-numbers font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              HUB Integrated
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                          Rating: +{gen.powerGeneration} MW per unit
                          {isHubBurner && ' (Lower Efficiency)'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onToggleGeneratorPause && count > 0 && (
                          <button
                            onClick={() => onToggleGeneratorPause(gen.id)}
                            title={isPaused ? 'Resume generator operation' : 'Pause generator to conserve fuel'}
                            className={`p-1.5 rounded border text-xs transition-colors ${
                              isPaused
                                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300 hover:bg-amber-900/60'
                                : 'bg-[#161c24] border-[#26303d] text-slate-400 hover:text-white hover:border-slate-500'
                            }`}
                          >
                            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                          </button>
                        )}

                        <span
                          className={`font-mono-numbers text-xs px-2 py-0.5 rounded font-bold ${
                            isOperational
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/40'
                              : isPaused
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-700/40'
                              : count > 0
                              ? 'bg-red-950/60 text-red-300 border border-red-700/40'
                              : 'bg-[#1f2732] text-slate-400'
                          }`}
                        >
                          {isHubBurner
                            ? `${count}/2 ${isOperational ? 'Online' : isPaused ? 'Paused' : 'Offline'}`
                            : count > 0
                            ? isOperational
                              ? `x${count} Online`
                              : isPaused
                              ? `x${count} Paused`
                              : `x${count} Offline`
                            : '0 Built'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono-numbers bg-[#141920] p-2 rounded">
                      <span className="text-slate-400">Current Grid Contribution:</span>
                      <strong className={isOperational ? 'text-cyan-400' : 'text-slate-500'}>
                        +{operatingOutput} MW
                      </strong>
                    </div>

                    {gen.fuelRequired && (
                      <div className="mt-2 space-y-1 text-[11px] font-mono-numbers">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">
                            Fuel: {gen.fuelRequired.fuelItems.map(f => ALL_ITEMS[f]?.name).join(' / ')}
                            {gen.fuelRequired.waterPerMin ? ` + Water (${gen.fuelRequired.waterPerMin}/m)` : ''}
                            {isHubBurner ? ' · 1.5× burn rate' : ''}
                          </span>
                          <span className={`font-semibold shrink-0 ${fuelColor}`}>{fuelStatusText}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Build Generator Button or Integrated HUB Status */}
                  <div className="pt-2 border-t border-[#1c232c]">
                    {isHubBurner ? (
                      <div className="p-2 rounded bg-[#141920] border border-[#222a35] text-[11px] text-slate-400 font-mono-numbers leading-relaxed">
                        {count < 2
                          ? 'Built into the HUB chassis (1/2 installed). Complete HUB Upgrade 4 to unlock the 2nd HUB Burner.'
                          : 'Both integrated HUB Biomass Burners installed (2/2 max). Build standalone 30 MW Biomass Burners for higher output and fuel efficiency.'}
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        {/* Pinned Modal Footer */}
        <div className="shrink-0 bg-[#101419] border-t border-[#242c36] px-5 sm:px-6 py-3.5 flex items-center justify-between text-xs font-mono-numbers">
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            FICSIT Power Network · Real-time Generator Telemetry
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#fa9549] hover:bg-[#fb8533] text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            Close Substation
          </button>
        </div>
      </div>
    </div>
  );
};
