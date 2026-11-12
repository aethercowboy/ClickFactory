import React, { useState } from 'react';
import { GameSaveData, ItemId } from '../types/game';
import { SPACE_ELEVATOR_PHASES } from '../data/spaceElevator';
import { ALL_ITEMS } from '../data/items';
import { Rocket, CheckCircle2, ChevronRight, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audio } from '../utils/audio';
import spaceElevatorImg from '../assets/images/ficsit_space_elevator_1793641888982.jpg';

interface SpaceElevatorModalProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
  onDeliver: (itemId: ItemId, amount: number) => void;
  onLaunch: () => boolean;
}

export const SpaceElevatorModal: React.FC<SpaceElevatorModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onDeliver,
  onLaunch,
}) => {
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  if (!isOpen) return null;

  const currentPhaseNum = gameState.completedPhases.length + 1;
  const currentPhase = SPACE_ELEVATOR_PHASES.find(p => p.phase === currentPhaseNum);

  // Check if all deliveries for current phase are satisfied
  let isReadyToLaunch = false;
  if (currentPhase) {
    isReadyToLaunch = currentPhase.requirements.every(r => {
      const delivered = gameState.elevatorDeliveries[currentPhaseNum]?.[r.itemId] || 0;
      return delivered >= r.amount;
    });
  }

  const handleLaunchSequence = () => {
    if (!isReadyToLaunch || isLaunching) return;

    setIsLaunching(true);
    // Fire confetti bursts!
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#fa9549', '#ffffff', '#00e5ff', '#ffd700'],
      });
    } catch (_) {}

    setTimeout(() => {
      onLaunch();
      setIsLaunching(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12161b] border border-[#2a333f] rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Hero image banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#0a0d10] shrink-0 border-b border-[#242d38]">
          <img
            src={spaceElevatorImg}
            alt="FICSIT Orbital Space Elevator Tether"
            className="w-full h-full object-cover object-center opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12161b] via-[#12161b]/40 to-transparent" />

          {/* Banner text overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="w-4 h-4 text-[#fa9549]" />
                <span className="text-xs font-mono-numbers uppercase tracking-widest text-[#fa9549] font-semibold">
                  Orbital Megastructure Project Assembly
                </span>
              </div>
              <h2 className="font-industrial text-2xl font-bold text-white tracking-wide">
                Space Elevator Terminal
              </h2>
            </div>

            <button
              onClick={onClose}
              className="bg-[#0e1216]/80 hover:bg-[#1a212b] border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono-numbers"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {currentPhase ? (
            <>
              {/* Phase Overview */}
              <div className="bg-[#161c24] border border-[#252e3b] rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between font-mono-numbers text-xs">
                  <span className="text-[#fa9549] font-bold uppercase">
                    Phase {currentPhase.phase} of 4
                  </span>
                  <span className="text-slate-400">
                    Unlocks: Tiers {currentPhase.unlocksTiers.join(' & ')}
                  </span>
                </div>
                <h3 className="font-industrial text-lg font-bold text-white">
                  {currentPhase.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentPhase.description}
                </p>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono-numbers font-semibold text-slate-400 uppercase tracking-wider">
                  Required Project Components:
                </h4>

                <div className="space-y-3">
                  {currentPhase.requirements.map(req => {
                    const item = ALL_ITEMS[req.itemId];
                    const delivered = gameState.elevatorDeliveries[currentPhaseNum]?.[req.itemId] || 0;
                    const inStock = Math.floor(gameState.inventory[req.itemId] || 0);
                    const remaining = Math.max(0, req.amount - delivered);
                    const isDone = delivered >= req.amount;
                    const percent = Math.min(100, Math.round((delivered / req.amount) * 100));

                    return (
                      <div
                        key={req.itemId}
                        className={`bg-[#0d1015] border rounded-xl p-4 transition-all ${
                          isDone ? 'border-emerald-600/50 bg-emerald-950/10' : 'border-[#222b37]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1f2732] flex items-center justify-center font-bold text-xs text-[#fa9549] shrink-0 font-mono-numbers">
                              {percent}%
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-industrial text-sm font-semibold text-white tracking-wide">
                                  {item?.name}
                                </span>
                                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono-numbers">
                                Stock in Inventory: {inStock}
                              </span>
                            </div>
                          </div>

                          {/* Quick delivery buttons */}
                          {!isDone && (
                            <div className="flex items-center gap-2 font-mono-numbers text-xs">
                              <button
                                disabled={inStock <= 0}
                                onClick={() => onDeliver(req.itemId, 10)}
                                className="px-2.5 py-1 bg-[#1a212b] hover:bg-[#252f3d] disabled:opacity-40 text-slate-300 rounded"
                              >
                                +10
                              </button>
                              <button
                                disabled={inStock <= 0}
                                onClick={() => onDeliver(req.itemId, 50)}
                                className="px-2.5 py-1 bg-[#1a212b] hover:bg-[#252f3d] disabled:opacity-40 text-slate-300 rounded"
                              >
                                +50
                              </button>
                              <button
                                disabled={inStock <= 0}
                                onClick={() => onDeliver(req.itemId, remaining)}
                                className="px-3 py-1 bg-[#fa9549] hover:bg-[#fb8533] disabled:opacity-40 text-black font-bold rounded"
                              >
                                Deliver Max
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 font-mono-numbers text-xs">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Delivered: {delivered}</span>
                            <span>Target: {req.amount}</span>
                          </div>
                          <div className="w-full h-2 bg-[#182029] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#fa9549] transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Master Launch Button */}
              <div className="pt-2">
                <button
                  disabled={!isReadyToLaunch || isLaunching}
                  onClick={handleLaunchSequence}
                  className={`w-full py-4 px-6 rounded-xl font-industrial text-lg font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl transition-all ${
                    isReadyToLaunch
                      ? 'bg-gradient-to-r from-[#fa9549] to-[#fb8533] hover:from-[#fb8533] hover:to-[#fa9549] text-black active:scale-[0.99] cursor-pointer'
                      : 'bg-[#181f28] text-slate-500 cursor-not-allowed border border-[#242d38]'
                  }`}
                >
                  <Send className={`w-5 h-5 ${isLaunching ? 'animate-bounce' : ''}`} />
                  <span>
                    {isLaunching
                      ? 'ORBITAL THRUSTERS FIRING...'
                      : isReadyToLaunch
                      ? `SEAL POD & LAUNCH PHASE ${currentPhase.phase} TO ORBIT`
                      : 'DELIVER ALL REQUIRED COMPONENTS TO LAUNCH'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            /* Endgame Completed */
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-industrial text-2xl font-bold text-white tracking-wide">
                PROJECT ASSEMBLY COMPLETE!
              </h3>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                You have fulfilled all FICSIT directives and supplied the orbital megastructure with advanced quantum and relativistic parts. You are officially certified as:
              </p>
              <div className="inline-block py-2 px-6 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500 font-industrial text-xl font-bold text-amber-300 tracking-wider">
                FICSIT EMPLOYEE OF THE PLANET
              </div>
            </div>
          )}
        </div>

        {/* Pinned Modal Footer */}
        <div className="shrink-0 bg-[#0d1014] border-t border-[#242d38] px-6 py-3.5 flex items-center justify-between text-xs font-mono-numbers">
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Project Assembly Tether Terminal · MASSAGE-2(A-B)b Orbit
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#202732] hover:bg-[#2c3746] text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
