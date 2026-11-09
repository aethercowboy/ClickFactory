import React, { useState } from 'react';
import { GameSaveData, ItemId } from '../types/game';
import { ALL_ITEMS } from '../data/items';
import { LizardDoggoIllustration } from './LizardDoggoIllustration';
import { getDoggoMood } from '../utils/doggo';
import {
  X,
  Heart,
  Sparkles,
  Gift,
  AlertTriangle,
  Edit2,
  Check,
  Smile,
  Clock,
  Apple,
  Leaf,
} from 'lucide-react';

interface DoggoSanctuaryModalProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
  onPet: () => void;
  onFeed: (itemId: ItemId) => void;
  onCollectItem: () => void;
  onRename: (name: string) => void;
}

export const DoggoSanctuaryModal: React.FC<DoggoSanctuaryModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onPet,
  onFeed,
  onCollectItem,
  onRename,
}) => {
  const doggo = gameState.doggo;
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(doggo?.name || 'Lizard Doggo');
  const [pettingAnim, setPettingAnim] = useState(false);

  if (!isOpen || !doggo) return null;

  const mood = getDoggoMood(doggo.happiness);
  const heldItem = doggo.heldItem;
  const heldItemDef = heldItem ? ALL_ITEMS[heldItem.itemId] : null;
  const paleberryCount = Math.floor(gameState.inventory.paleberry || 0);
  const leavesCount = Math.floor(gameState.inventory.leaves || 0);

  const handlePetClick = () => {
    setPettingAnim(true);
    onPet();
    setTimeout(() => setPettingAnim(false), 500);
  };

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nameInput.trim()) {
      onRename(nameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-neutral-900/95 border-b border-neutral-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <span className="text-xl">🐶</span>
            </div>
            <div>
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={20}
                    className="px-2 py-1 text-base font-bold bg-neutral-800 border border-amber-500 rounded text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1 text-emerald-400 hover:text-emerald-300"
                    title="Save name"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                    {doggo.name}
                  </h2>
                  <button
                    onClick={() => {
                      setNameInput(doggo.name);
                      setIsEditingName(true);
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                    title="Rename companion"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-neutral-400">
                Pioneer Native Companion • Species: <span className="text-amber-400 font-mono">Canine Reptilia</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Doggo Showcase & Petting Center */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-neutral-800/80 to-neutral-900 border border-neutral-800 relative overflow-hidden group">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Mood indicator pill */}
            <div className="mb-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-700/60 flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className={mood.color}>{mood.label}</span>
            </div>

            {/* Interactive Animated SVG */}
            <div className="relative my-2">
              <LizardDoggoIllustration
                happiness={doggo.happiness}
                isPetting={pettingAnim}
                onPetClick={handlePetClick}
                size="lg"
                hasItem={!!heldItem}
              />
            </div>

            <p className="text-xs text-neutral-400 text-center max-w-sm italic mb-4">
              "{mood.description}"
            </p>

            {/* Happiness Bar */}
            <div className="w-full max-w-xs space-y-1 mb-5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 flex items-center gap-1 font-medium">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Happiness
                </span>
                <span className="font-mono text-rose-400 font-bold">
                  {Math.round(doggo.happiness)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-700/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(4, Math.min(100, doggo.happiness))}%` }}
                />
              </div>
            </div>

            {/* Big Pet Button */}
            <button
              onClick={handlePetClick}
              className="w-full max-w-xs px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 bg-[length:200%_auto] hover:bg-right font-bold text-white shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform duration-200" />
              <span>Pet {doggo.name}!</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/30 font-normal">
                {doggo.petsCount} pets
              </span>
            </button>
          </div>

          {/* Retrieved Treasure Pouch Section */}
          <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" /> Companion Delivery Pouch
              </h3>
              {heldItem && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse font-medium">
                  Ready to Collect!
                </span>
              )}
            </div>

            {heldItem ? (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  heldItem.itemId === 'nuclear_waste'
                    ? 'bg-rose-950/40 border-rose-600/60 text-rose-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                      heldItem.itemId === 'nuclear_waste'
                        ? 'bg-rose-900/40 border-rose-500/60'
                        : 'bg-emerald-900/40 border-emerald-500/60'
                    }`}
                  >
                    {heldItem.itemId === 'nuclear_waste' ? '☢️' : '📦'}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-100 flex items-center gap-2">
                      <span>{heldItemDef?.name || heldItem.itemId}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40 text-amber-400 font-bold">
                        +{heldItem.amount}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {heldItem.itemId === 'nuclear_waste'
                        ? '⚠️ Glowing radioactive rock! Sink it quick!'
                        : heldItemDef?.description || 'Found foraging in the wild!'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onCollectItem}
                  className="px-4 py-2 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Collect
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500 animate-spin" /> Foraging in the wild...
                  </span>
                  <span className="font-mono text-amber-400">
                    {Math.max(1, Math.ceil(doggo.retrievalTimerMs / 1000))}s remaining
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(5, Math.min(100, 100 - (doggo.retrievalTimerMs / 32000) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 italic">
                  💡 Tip: Petting or feeding treats to {doggo.name} speeds up its foraging journey!
                </p>
              </div>
            )}
          </div>

          {/* Treat Feeding Section */}
          <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-3">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" /> Feed Treats
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paleberry */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                    🫐
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-200">Paleberry</div>
                    <div className="text-[10px] text-rose-400">+25% Happiness • -14s Forage</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      In Bag: <span className={paleberryCount > 0 ? 'text-neutral-200' : 'text-neutral-500'}>{paleberryCount}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onFeed('paleberry')}
                  disabled={paleberryCount <= 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  Feed
                </button>
              </div>

              {/* Leaves */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    🌿
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-200">Fresh Leaves</div>
                    <div className="text-[10px] text-emerald-400">+8% Happiness • -4s Forage</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      In Bag: <span className={leavesCount > 0 ? 'text-neutral-200' : 'text-neutral-500'}>{leavesCount}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onFeed('leaves')}
                  disabled={leavesCount <= 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  Feed
                </button>
              </div>
            </div>
          </div>

          {/* Lifetime Companion Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-lg font-bold font-mono text-rose-400">
                {doggo.petsCount}
              </div>
              <div className="text-[11px] text-neutral-400">Total Pets Given</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="text-lg font-bold font-mono text-amber-400">
                {doggo.itemsRetrievedCount}
              </div>
              <div className="text-[11px] text-neutral-400">Treasures Retrieved</div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 px-6 py-3.5 bg-neutral-900/95 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Smile className="w-4 h-4 text-amber-400" />
            Satisfactory Pioneer Companion
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors"
          >
            Close Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
