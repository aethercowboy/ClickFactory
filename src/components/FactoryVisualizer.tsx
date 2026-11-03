import React from 'react';
import { GameSaveData } from '../types/game';
import { ALL_BUILDINGS } from '../data/items';
import { Factory, Zap, Rocket, Pickaxe, Trash2, ArrowRight, Lock } from 'lucide-react';
import factoryLandscapeImg from '../assets/images/ficsit_factory_landscape_1793641888396.jpg';
import { isFeatureUnlocked } from '../utils/progression';

interface FactoryVisualizerProps {
  gameState: GameSaveData;
  onNavigateTab: (tab: string) => void;
}

export const FactoryVisualizer: React.FC<FactoryVisualizerProps> = ({
  gameState,
  onNavigateTab,
}) => {
  const isAutomationUnlocked = isFeatureUnlocked(gameState, 'automation');
  const isPowerUnlocked = isFeatureUnlocked(gameState, 'power_grid');
  const { capacity, consumption, isTripped } = gameState.powerGrid;
  const activeExtractors = gameState.machines.filter(m => {
    const b = ALL_BUILDINGS[m.buildingId];
    return b && b.category === 'extractor' && !m.isPaused;
  });
  const activeProcessors = gameState.machines.filter(m => {
    const b = ALL_BUILDINGS[m.buildingId];
    return b && b.category === 'production' && !m.isPaused;
  });

  const totalMinersCount = activeExtractors.reduce((acc, m) => acc + m.count, 0);
  const totalProcessorsCount = activeProcessors.reduce((acc, m) => acc + m.count, 0);
  const totalGeneratorsCount = gameState.generators.reduce((acc, g) => acc + g.count, 0);

  return (
    <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Visual background image with scrim */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <img
          src={factoryLandscapeImg}
          alt="Factory Complex"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141920] via-transparent to-[#141920]" />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242c36] pb-3">
          <div>
            <h3 className="font-industrial text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Factory className="w-4 h-4 text-[#fa9549]" />
              <span>Planetary Logistics & Factory Flow Map</span>
            </h3>
            <p className="text-xs text-slate-400">
              Schematic flow of raw minerals from extraction nodes through processing lines to the Space Elevator.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-numbers">
            <span className="text-slate-400">Grid Status:</span>
            <span className={isTripped ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
              {isTripped ? 'OFFLINE (TRIPPED)' : 'SYNCHRONIZED (100%)'}
            </span>
          </div>
        </div>

        {/* 4-Stage Flow Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono-numbers">
          {/* Stage 1: Resource Deposits & Miners */}
          <button
            onClick={() => onNavigateTab('extraction')}
            className="bg-[#0e1216]/90 border border-[#242d38] hover:border-[#fa9549] rounded-xl p-3.5 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#fa9549] uppercase font-bold tracking-wider">
                01. Raw Extraction
              </span>
              <Pickaxe className="w-4 h-4 text-[#fa9549]" />
            </div>
            <div className="text-sm font-industrial font-bold text-white group-hover:text-[#fa9549] transition-colors">
              {totalMinersCount} Automated Drill Rigs
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {gameState.unlockedOres.length} Mineral Nodes Surveyed
            </div>
          </button>

          {/* Stage 2: Processing & Smelters */}
          <button
            onClick={() => onNavigateTab(isAutomationUnlocked ? 'factory' : 'milestones')}
            className={`border rounded-xl p-3.5 text-left transition-all group ${
              isAutomationUnlocked
                ? 'bg-[#0e1216]/90 border-[#242d38] hover:border-[#fa9549]'
                : 'bg-[#0e1216]/50 border-[#1c222b] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isAutomationUnlocked ? 'text-[#fa9549]' : 'text-slate-500'}`}>
                02. Fabrication Matrix
              </span>
              {isAutomationUnlocked ? (
                <Factory className="w-4 h-4 text-[#fa9549]" />
              ) : (
                <Lock className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className={`text-sm font-industrial font-bold ${isAutomationUnlocked ? 'text-white group-hover:text-[#fa9549]' : 'text-slate-400'} transition-colors`}>
              {isAutomationUnlocked ? `${totalProcessorsCount} Processing Units` : 'Automation Locked'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isAutomationUnlocked ? 'Smelters, Constructors, Assemblers' : 'Requires HUB Upgrade 1'}
            </div>
          </button>

          {/* Stage 3: Electrical Power Substation */}
          <button
            onClick={() => onNavigateTab(isPowerUnlocked ? 'power' : 'milestones')}
            className={`border rounded-xl p-3.5 text-left transition-all group ${
              isPowerUnlocked
                ? 'bg-[#0e1216]/90 border-[#242d38] hover:border-cyan-400'
                : 'bg-[#0e1216]/50 border-[#1c222b] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isPowerUnlocked ? 'text-cyan-400' : 'text-slate-500'}`}>
                03. Power Substation
              </span>
              {isPowerUnlocked ? (
                <Zap className="w-4 h-4 text-cyan-400" />
              ) : (
                <Lock className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className={`text-sm font-industrial font-bold ${isPowerUnlocked ? 'text-white group-hover:text-cyan-300' : 'text-slate-400'} transition-colors`}>
              {isPowerUnlocked ? `${capacity} MW Grid Capacity` : 'Power Grid Locked'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isPowerUnlocked ? `${totalGeneratorsCount} Plants (${consumption} MW Load)` : 'Requires HUB Upgrade 5'}
            </div>
          </button>

          {/* Stage 4: Space Elevator & Sinking */}
          <button
            onClick={() => onNavigateTab('milestones')}
            className="bg-[#0e1216]/90 border border-[#242d38] hover:border-amber-400 rounded-xl p-3.5 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                04. Orbital Assembly
              </span>
              <Rocket className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-industrial font-bold text-white group-hover:text-amber-300 transition-colors">
              Phase {gameState.completedPhases.length + 1} Delivery
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Space Elevator Tether Active
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
