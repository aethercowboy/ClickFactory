import React from 'react';
import { GameSaveData, ItemId } from '../types/game';
import { SPACE_ELEVATOR_PHASES } from '../data/spaceElevator';
import { audio } from '../utils/audio';
import {
  Zap,
  Ticket,
  Rocket,
  Volume2,
  VolumeX,
  Radio,
  Settings,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  gameState: GameSaveData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSpaceElevator: () => void;
  onOpenPowerGrid: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleAmbient: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  activeTab,
  setActiveTab,
  onOpenSpaceElevator,
  onOpenPowerGrid,
  onOpenSettings,
  onToggleSound,
  onToggleAmbient,
}) => {
  const currentPhaseNum = gameState.completedPhases.length + 1;
  const currentPhase = SPACE_ELEVATOR_PHASES.find(p => p.phase === currentPhaseNum);

  // Calculate current phase delivery completion %
  let phasePercent = 0;
  if (currentPhase) {
    let totalReq = 0;
    let totalDelivered = 0;
    currentPhase.requirements.forEach(r => {
      totalReq += r.amount;
      const delivered = gameState.elevatorDeliveries[currentPhaseNum]?.[r.itemId] || 0;
      totalDelivered += Math.min(r.amount, delivered);
    });
    phasePercent = totalReq > 0 ? Math.min(100, Math.round((totalDelivered / totalReq) * 100)) : 100;
  } else {
    phasePercent = 100;
  }

  const { capacity, consumption, isTripped } = gameState.powerGrid;
  const isPowerLow = capacity > 0 && consumption >= capacity;

  return (
    <header className="sticky top-0 z-40 bg-[#12161b]/95 backdrop-blur-md border-b border-[#252c35]">
      {/* Primary Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-[#fa9549] flex items-center justify-center font-industrial text-black font-bold text-lg shadow-sm">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-industrial text-xl tracking-wider text-white whitespace-nowrap">
              FICSIT PIONEER
            </span>
            <span className="text-[10px] text-[#8e9ca8] font-mono-numbers tracking-widest uppercase">
              Sector MASSAGE-2(A-B)b
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line tabs) */}
        <nav className="hidden lg:flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'extraction', label: 'Ore Extraction' },
            { id: 'craft_bench', label: 'Craft Bench' },
            { id: 'factory', label: 'Automation' },
            { id: 'power', label: 'Power Grid' },
            { id: 'milestones', label: 'HUB Milestones' },
            { id: 'mam', label: 'MAM Research' },
            { id: 'sink', label: 'AWESOME Sink' },
            { id: 'stats', label: 'Logistics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                audio.playCraftPress();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#fa9549] text-black shadow'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1a2027]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action (Space Elevator Project Launcher) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onOpenSpaceElevator();
              audio.playCraftPress();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#fa9549] hover:bg-[#fb8533] text-black font-semibold text-xs rounded-md shadow transition-colors whitespace-nowrap shrink-0 group"
          >
            <Rocket className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>
              {currentPhase ? `Elevator: Phase ${currentPhaseNum} (${phasePercent}%)` : 'Endgame Completed'}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Header Industrial Telemetry Ribbon */}
      <div className="border-t border-[#1e252d] bg-[#0d1014] px-4 lg:px-6 py-1.5 text-xs font-mono-numbers">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Mobile tabs row for small screens */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto w-full pb-1">
            {[
              { id: 'extraction', label: 'Mining' },
              { id: 'craft_bench', label: 'Craft' },
              { id: 'factory', label: 'Factory' },
              { id: 'power', label: 'Power' },
              { id: 'milestones', label: 'Milestones' },
              { id: 'mam', label: 'MAM' },
              { id: 'sink', label: 'Sink' },
              { id: 'stats', label: 'Stats' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-[11px] rounded transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#fa9549] text-black font-bold'
                    : 'bg-[#181f27] text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 text-[#94a3b8]">
            {/* Power Grid Button / Meter */}
            <button
              onClick={onOpenPowerGrid}
              className={`flex items-center gap-2 px-2.5 py-1 rounded transition-colors ${
                isTripped
                  ? 'bg-red-950/80 text-red-300 border border-red-500/50 animate-pulse'
                  : isPowerLow
                  ? 'bg-amber-950/50 text-amber-300 border border-amber-600/40'
                  : 'hover:bg-[#1a212a] text-slate-300'
              }`}
            >
              {isTripped ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold text-red-400">BREAKER TRIPPED</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#fa9549]" />
                  <span>
                    Power: <strong className="text-white">{consumption}</strong> / {capacity} MW
                  </span>
                </>
              )}
            </button>

            {/* FICSIT Coupons */}
            <div className="flex items-center gap-1.5 text-amber-400">
              <Ticket className="w-3.5 h-3.5" />
              <span>{gameState.ficsitCoupons} Coupons</span>
            </div>

            {/* Active MAM Research badge */}
            {gameState.activeResearch && (
              <div className="hidden sm:flex items-center gap-1.5 text-cyan-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>MAM Researching...</span>
              </div>
            )}
          </div>

          {/* Utilities: Audio toggles and Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              title={gameState.audioMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              className="p-1.5 rounded hover:bg-[#1b222a] text-[#8e9ca8] hover:text-white transition-colors"
            >
              {gameState.audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onToggleAmbient}
              title={gameState.ambientTrack ? 'Stop Factory Ambient Audio' : 'Play Factory Ambient Audio'}
              className={`p-1.5 rounded transition-colors ${
                gameState.ambientTrack ? 'bg-cyan-950 text-cyan-400' : 'hover:bg-[#1b222a] text-[#8e9ca8] hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Factory Settings & Save/Load"
              className="p-1.5 rounded hover:bg-[#1b222a] text-[#8e9ca8] hover:text-white transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
