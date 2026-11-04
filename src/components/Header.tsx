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
  Lock,
  Trophy,
} from 'lucide-react';
import { isFeatureUnlocked } from '../utils/progression';
import { APP_VERSION } from '../version';

interface HeaderProps {
  gameState: GameSaveData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSpaceElevator: () => void;
  onOpenPowerGrid: () => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onToggleBoombox: () => void;
  isBoomboxOpen?: boolean;
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
  onOpenAchievements,
  onToggleBoombox,
  isBoomboxOpen,
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

  const isAutomationUnlocked = isFeatureUnlocked(gameState, 'automation');
  const isPowerUnlocked = isFeatureUnlocked(gameState, 'power_grid');
  const isMAMUnlocked = isFeatureUnlocked(gameState, 'mam_research');
  const isSinkUnlocked = isFeatureUnlocked(gameState, 'awesome_sink');
  const isLogisticsUnlocked = isFeatureUnlocked(gameState, 'logistics');
  const isSpaceElevatorUnlocked = isFeatureUnlocked(gameState, 'space_elevator');

  const navTabs = [
    { id: 'extraction', label: 'Ore Extraction', shortLabel: 'Mining', unlocked: true },
    { id: 'craft_bench', label: 'Craft Bench', shortLabel: 'Craft', unlocked: true },
    { id: 'milestones', label: 'HUB Milestones', shortLabel: 'Milestones', unlocked: true },
    {
      id: 'factory',
      label: 'Automation',
      shortLabel: 'Factory',
      unlocked: isAutomationUnlocked,
      lockHint: 'Locked: Requires HUB Upgrade 1',
    },
    {
      id: 'power',
      label: 'Power Grid',
      shortLabel: 'Power',
      unlocked: isPowerUnlocked,
      lockHint: 'Locked: Requires HUB Upgrade 5 (Power Generation)',
    },
    {
      id: 'mam',
      label: 'MAM Research',
      shortLabel: 'MAM',
      unlocked: isMAMUnlocked,
      lockHint: 'Locked: Requires Tier 1 Field Research',
    },
    {
      id: 'sink',
      label: 'AWESOME Sink',
      shortLabel: 'Sink',
      unlocked: isSinkUnlocked,
      lockHint: 'Locked: Requires Tier 2 Resource Sink',
    },
    {
      id: 'stats',
      label: 'Logistics',
      shortLabel: 'Stats',
      unlocked: isLogisticsUnlocked,
      lockHint: 'Locked: Requires Tier 1 Logistics',
    },
  ];

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
            <div className="flex items-center gap-2">
              <span className="font-industrial text-xl tracking-wider text-white whitespace-nowrap">
                CLICKFACTORY
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b232c] text-[#fa9549] border border-[#2b3542]">
                v{APP_VERSION}
              </span>
            </div>
            <span className="text-[10px] text-[#8e9ca8] font-mono-numbers tracking-widest uppercase">
              FICSIT Pioneer Automation
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line tabs) */}
        <nav className="hidden lg:flex items-center gap-2 overflow-x-auto">
          {navTabs.map(tab => {
            const isTabActive = activeTab === tab.id;
            if (!tab.unlocked) {
              return (
                <button
                  key={tab.id}
                  disabled
                  title={tab.lockHint}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 text-slate-600 bg-transparent opacity-40 cursor-not-allowed flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  audio.playCraftPress();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-[#fa9549] text-black shadow'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#1a2027]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action (Space Elevator Project Launcher) */}
        <div className="flex items-center gap-3 shrink-0">
          {isSpaceElevatorUnlocked ? (
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
          ) : (
            <div
              title="Space Elevator: Complete Tier 0 HUB Upgrades to construct orbital tether"
              className="flex items-center gap-2 px-3 py-2 bg-[#161c23] border border-[#232b36] text-slate-500 text-xs font-semibold rounded-md cursor-not-allowed opacity-60"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Elevator Locked (Tier 0)</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Header Industrial Telemetry Ribbon */}
      <div className="border-t border-[#1e252d] bg-[#0d1014] px-4 lg:px-6 py-1.5 text-xs font-mono-numbers">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Mobile tabs row for small screens */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto w-full pb-1">
            {navTabs.map(tab => {
              if (!tab.unlocked) {
                return (
                  <button
                    key={tab.id}
                    disabled
                    title={tab.lockHint}
                    className="px-2.5 py-1 text-[11px] rounded whitespace-nowrap bg-[#12161b] text-slate-600 opacity-40 cursor-not-allowed flex items-center gap-1"
                  >
                    <Lock className="w-2.5 h-2.5 text-slate-600" />
                    <span>{tab.shortLabel}</span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#fa9549] text-black font-bold'
                      : 'bg-[#181f27] text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 text-[#94a3b8]">
            {/* Power Grid Button / Meter */}
            {isPowerUnlocked ? (
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
            ) : (
              <div
                title="Power Substation: Complete HUB Upgrade 5 (Power Generation)"
                className="flex items-center gap-2 px-2 py-0.5 text-slate-600 text-[11px]"
              >
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Power Grid: Locked</span>
              </div>
            )}

            {/* FICSIT Coupons */}
            <div className="flex items-center gap-1.5 text-amber-400">
              <Ticket className="w-3.5 h-3.5" />
              <span>{gameState.ficsitCoupons} Coupons</span>
            </div>

            {/* FICSIT Pioneer Accolades / Achievements */}
            <button
              onClick={onOpenAchievements}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18202a] hover:bg-[#222c3a] border border-[#263445] text-amber-300 hover:text-amber-200 transition-colors text-xs font-mono-numbers"
              title="Open FICSIT Pioneer Accolades & Achievements"
            >
              <Trophy className="w-3.5 h-3.5 text-[#fa9549]" />
              <span>Accolades: <strong className="text-white">{(gameState.unlockedAchievements || []).length}</strong>/14</span>
            </button>

            {/* Active MAM Research badge */}
            {gameState.activeResearch && (
              <div className="hidden sm:flex items-center gap-1.5 text-cyan-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>MAM Researching...</span>
              </div>
            )}

            {/* Fan project disclaimer badge */}
            <span
              title="ClickFactory is an unofficial fan game. Not affiliated with Satisfactory or Coffee Stain Studios."
              className="hidden xl:inline-block text-[10px] text-slate-500 font-mono-numbers px-2 py-0.5 rounded bg-[#101419] border border-[#1d2530]"
            >
              Satisfactory Fan Game
            </span>
          </div>

          {/* Utilities: Audio toggles, Boombox, and Settings */}
          <div className="flex items-center gap-2">
            {/* Boombox player button (when unlocked) */}
            {gameState.shopPurchases.includes('shop_boombox') && (
              <button
                onClick={onToggleBoombox}
                title={isBoomboxOpen ? 'Close Boombox Deck' : 'Open FICSIT Factory Boombox'}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 text-xs font-mono-numbers ${
                  isBoomboxOpen
                    ? 'bg-[#fa9549] text-black font-bold shadow-md'
                    : 'bg-[#19222c] text-[#fa9549] hover:bg-[#232f3d] border border-[#fa9549]/40'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-bold">Boombox</span>
              </button>
            )}

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
