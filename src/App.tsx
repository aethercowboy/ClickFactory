import React, { useState, useEffect } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { Header } from './components/Header';
import { FactoryVisualizer } from './components/FactoryVisualizer';
import { ExtractionPanel } from './components/ExtractionPanel';
import { CraftBench } from './components/CraftBench';
import { FactoryAutomation } from './components/FactoryAutomation';
import { PowerGridModal } from './components/PowerGridModal';
import { SpaceElevatorModal } from './components/SpaceElevatorModal';
import { HubMilestones } from './components/HubMilestones';
import { MAMResearch } from './components/MAMResearch';
import { AwesomeSink } from './components/AwesomeSink';
import { ProductionStats } from './components/ProductionStats';
import { SettingsModal } from './components/SettingsModal';
import { audio } from './utils/audio';
import { INITIAL_SAVE } from './utils/saveLoad';
import { isFeatureUnlocked } from './utils/progression';
import { ALL_RECIPES } from './data/items';
import { APP_VERSION } from './version';
import { AlertCircle, CheckCircle2, Rocket, Zap, X, Hammer, XOctagon } from 'lucide-react';

export default function App() {
  const {
    gameState,
    setGameState,
    notifications,
    productionRates,
    manualMine,
    manualCraft,
    startCrafting,
    cancelCrafting,
    buildMachine,
    dismantleMachine,
    setMachineOverclock,
    resetPowerBreaker,
    contributeMilestone,
    deliverToSpaceElevator,
    launchSpaceElevator,
    startMAMResearch,
    sinkItem,
    buyShopItem,
    addNotification,
    dismissNotification,
  } = useGameLoop();

  const [activeTab, setActiveTab] = useState<string>('extraction');
  const [isSpaceElevatorOpen, setIsSpaceElevatorOpen] = useState<boolean>(false);
  const [isPowerGridOpen, setIsPowerGridOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Auto-redirect if player is currently on a locked tab
  useEffect(() => {
    if (activeTab === 'factory' && !isFeatureUnlocked(gameState, 'automation')) {
      setActiveTab('extraction');
    }
    if (activeTab === 'power' && !isFeatureUnlocked(gameState, 'power_grid')) {
      setActiveTab('extraction');
    }
    if (activeTab === 'mam' && !isFeatureUnlocked(gameState, 'mam_research')) {
      setActiveTab('extraction');
    }
    if (activeTab === 'sink' && !isFeatureUnlocked(gameState, 'awesome_sink')) {
      setActiveTab('extraction');
    }
    if (activeTab === 'stats' && !isFeatureUnlocked(gameState, 'logistics')) {
      setActiveTab('extraction');
    }
  }, [activeTab, gameState]);

  const toggleSound = () => {
    const nextMuted = !gameState.audioMuted;
    audio.setMuted(nextMuted);
    setGameState(prev => ({ ...prev, audioMuted: nextMuted }));
  };

  const toggleAmbient = () => {
    const nextAmbient = !gameState.ambientTrack;
    audio.toggleAmbientMusic(nextAmbient);
    setGameState(prev => ({ ...prev, ambientTrack: nextAmbient }));
  };

  const handleResetGame = () => {
    setGameState({ ...INITIAL_SAVE, lastTick: Date.now() });
    audio.playPowerTrip();
    addNotification('Factory Reset', 'Pioneer operational state reset to initial colony landing.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0e1217] text-[#e1e7ed] flex flex-col font-sans selection:bg-[#fa9549] selection:text-black">
      {/* Top Bar Navigation */}
      <Header
        gameState={gameState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSpaceElevator={() => setIsSpaceElevatorOpen(true)}
        onOpenPowerGrid={() => setIsPowerGridOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={toggleSound}
        onToggleAmbient={toggleAmbient}
      />

      {/* Global Active Manual Crafting Banner */}
      {gameState.activeCrafting && (
        <div className="bg-[#141a23] border-b border-[#fa9549]/50 px-4 py-2.5 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono-numbers">
            <div className="flex items-center gap-3">
              <Hammer className="w-4 h-4 text-[#fa9549] animate-bounce shrink-0" />
              <span className="font-industrial text-sm font-bold text-white tracking-wide">
                Crafting:{' '}
                {ALL_RECIPES.find(r => r.id === gameState.activeCrafting?.recipeId)?.name || 'Item'}
              </span>
              <span className="text-[#fa9549] font-semibold">
                ({gameState.activeCrafting.completedBatches} / {gameState.activeCrafting.totalBatches})
              </span>
              <div className="w-24 sm:w-36 bg-[#0c1015] h-2 rounded-full overflow-hidden border border-[#2b3542] shrink-0">
                <div
                  className="bg-gradient-to-r from-[#fa9549] to-amber-300 h-full transition-all duration-100"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((gameState.activeCrafting.completedBatches + gameState.activeCrafting.progress) /
                          gameState.activeCrafting.totalBatches) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 hidden sm:inline">
                ~
                {Math.max(
                  0,
                  (gameState.activeCrafting.totalBatches -
                    gameState.activeCrafting.completedBatches -
                    gameState.activeCrafting.progress) *
                    gameState.activeCrafting.batchDurationSeconds
                ).toFixed(1)}
                s remaining
              </span>
              <button
                onClick={cancelCrafting}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow"
              >
                <XOctagon className="w-3.5 h-3.5" />
                <span>Cancel / Interrupt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Factory Visualizer overview (shows on extraction, factory, stats) */}
        {['extraction', 'factory', 'stats'].includes(activeTab) && (
          <FactoryVisualizer
            gameState={gameState}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {/* Tab 1: Extraction & Mining */}
        {activeTab === 'extraction' && (
          <ExtractionPanel
            gameState={gameState}
            onMine={manualMine}
            onBuildMachine={buildMachine}
          />
        )}

        {/* Tab 2: Craft Bench */}
        {activeTab === 'craft_bench' && (
          <CraftBench
            gameState={gameState}
            onCraft={manualCraft}
            onStartCrafting={startCrafting}
            onCancelCrafting={cancelCrafting}
          />
        )}

        {/* Tab 3: Factory Automation */}
        {activeTab === 'factory' && (
          <FactoryAutomation
            gameState={gameState}
            onBuildMachine={buildMachine}
            onDismantleMachine={dismantleMachine}
            onSetOverclock={setMachineOverclock}
            onOpenPowerGrid={() => setIsPowerGridOpen(true)}
          />
        )}

        {/* Tab 4: Power Grid */}
        {activeTab === 'power' && (
          <div className="space-y-6">
            <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="font-industrial text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#fa9549]" />
                  <span>FICSIT Planetary Power Grid Substation</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage generators, monitor electrical draw, and build steam and nuclear plants.
                </p>
              </div>

              <button
                onClick={() => setIsPowerGridOpen(true)}
                className="py-2.5 px-4 bg-[#fa9549] hover:bg-[#fb8533] text-black font-industrial text-xs font-bold rounded-lg shadow uppercase"
              >
                Open Substation Console
              </button>
            </div>

            <FactoryAutomation
              gameState={gameState}
              onBuildMachine={buildMachine}
              onDismantleMachine={dismantleMachine}
              onSetOverclock={setMachineOverclock}
              onOpenPowerGrid={() => setIsPowerGridOpen(true)}
            />
          </div>
        )}

        {/* Tab 5: HUB Milestones */}
        {activeTab === 'milestones' && (
          <HubMilestones
            gameState={gameState}
            onSelectMilestone={milestoneId => {
              setGameState(prev => ({ ...prev, currentMilestoneId: milestoneId }));
            }}
            onContribute={contributeMilestone}
          />
        )}

        {/* Tab 6: MAM Research */}
        {activeTab === 'mam' && (
          <MAMResearch
            gameState={gameState}
            onStartResearch={startMAMResearch}
          />
        )}

        {/* Tab 7: AWESOME Sink & Shop */}
        {activeTab === 'sink' && (
          <AwesomeSink
            gameState={gameState}
            onSinkItem={sinkItem}
            onBuyShopItem={buyShopItem}
          />
        )}

        {/* Tab 8: Logistics & Production Stats */}
        {activeTab === 'stats' && (
          <ProductionStats
            gameState={gameState}
            productionRates={productionRates}
          />
        )}
      </main>

      {/* Notification Toasts (with auto-dismiss and close button) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start justify-between gap-3 backdrop-blur-md font-mono-numbers text-xs transition-all animate-in fade-in slide-in-from-bottom-2 ${
              notif.type === 'power_trip'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : notif.type === 'milestone' || notif.type === 'elevator'
                ? 'bg-amber-950/90 border-[#fa9549] text-amber-200'
                : notif.type === 'research'
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                : 'bg-[#151b22]/95 border-[#2c3744] text-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5 shrink-0">
                {notif.type === 'power_trip' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : notif.type === 'elevator' ? (
                  <Rocket className="w-4 h-4 text-[#fa9549]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="font-bold font-industrial tracking-wide text-white">
                  {notif.title}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5 leading-snug">
                  {notif.message}
                </div>
              </div>
            </div>

            <button
              onClick={() => dismissNotification(notif.id)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Space Elevator Modal */}
      <SpaceElevatorModal
        gameState={gameState}
        isOpen={isSpaceElevatorOpen}
        onClose={() => setIsSpaceElevatorOpen(false)}
        onDeliver={deliverToSpaceElevator}
        onLaunch={launchSpaceElevator}
      />

      {/* Power Grid Modal */}
      <PowerGridModal
        gameState={gameState}
        isOpen={isPowerGridOpen}
        onClose={() => setIsPowerGridOpen(false)}
        onResetBreaker={resetPowerBreaker}
        onBuildGenerator={bId => buildMachine(bId)}
      />

      {/* Settings Modal */}
      <SettingsModal
        gameState={gameState}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onImport={data => setGameState(data)}
        onReset={handleResetGame}
        onToggleSound={toggleSound}
        onToggleAmbient={toggleAmbient}
      />

      {/* Global Footer with Version, Live Links & Legal Disclaimer */}
      <footer className="mt-auto border-t border-[#1e252d] bg-[#0c1015] py-5 px-4 text-center text-xs text-slate-500 font-mono-numbers space-y-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
          <span className="font-semibold text-white">ClickFactory v{APP_VERSION}</span>
          <span>•</span>
          <a
            href="https://aethercowboy.github.io/ClickFactory"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#fa9549] hover:underline"
          >
            Play Live (GitHub Pages)
          </a>
          <span>•</span>
          <a
            href="https://github.com/aethercowboy/ClickFactory"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white hover:underline"
          >
            GitHub Repository
          </a>
        </div>
        <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Disclaimer: ClickFactory is an unofficial, non-commercial fan game inspired by Satisfactory. It is in no way associated with, affiliated with, endorsed by, or sponsored by Coffee Stain Studios or Embracer Group.
        </p>
      </footer>
    </div>
  );
}
