import React, { useState } from 'react';
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
import { AlertCircle, CheckCircle2, Rocket, Zap, X } from 'lucide-react';

export default function App() {
  const {
    gameState,
    setGameState,
    notifications,
    productionRates,
    manualMine,
    manualCraft,
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
  } = useGameLoop();

  const [activeTab, setActiveTab] = useState<string>('extraction');
  const [isSpaceElevatorOpen, setIsSpaceElevatorOpen] = useState<boolean>(false);
  const [isPowerGridOpen, setIsPowerGridOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

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

      {/* Persistent Notification Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md font-mono-numbers text-xs transition-all ${
              notif.type === 'power_trip'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : notif.type === 'milestone' || notif.type === 'elevator'
                ? 'bg-amber-950/90 border-[#fa9549] text-amber-200'
                : notif.type === 'research'
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                : 'bg-[#151b22]/95 border-[#2c3744] text-slate-200'
            }`}
          >
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
    </div>
  );
}
