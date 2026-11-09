import React from 'react';
import { GameSaveData } from '../types/game';
import { ALL_ITEMS } from '../data/items';
import { LizardDoggoIllustration } from './LizardDoggoIllustration';
import { Heart, Sparkles, Gift } from 'lucide-react';

interface DoggoDockWidgetProps {
  gameState: GameSaveData;
  onOpenSanctuary: () => void;
  onPet: () => void;
  onCollectItem: () => void;
}

export const DoggoDockWidget: React.FC<DoggoDockWidgetProps> = ({
  gameState,
  onOpenSanctuary,
  onPet,
  onCollectItem,
}) => {
  const doggo = gameState.doggo;
  if (!doggo) return null;

  const heldItem = doggo.heldItem;
  const heldItemDef = heldItem ? ALL_ITEMS[heldItem.itemId] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-md">
      <div className="flex items-center gap-3">
        <div
          onClick={onPet}
          className="cursor-pointer shrink-0"
          title="Click to pet the Lizard Doggo!"
        >
          <LizardDoggoIllustration
            happiness={doggo.happiness}
            onPetClick={onPet}
            size="sm"
            hasItem={!!heldItem}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-neutral-100">{doggo.name}</span>
            <span className="text-[11px] font-mono text-rose-400 flex items-center gap-0.5">
              <Heart className="w-3 h-3 fill-rose-500" /> {Math.round(doggo.happiness)}%
            </span>
          </div>
          <div className="text-xs text-neutral-400">
            {heldItem ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Retrieved {heldItem.amount}x {heldItemDef?.name || heldItem.itemId}!
              </span>
            ) : (
              <span>
                Foraging... ({Math.max(1, Math.ceil(doggo.retrievalTimerMs / 1000))}s)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {heldItem ? (
          <button
            onClick={onCollectItem}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" /> Collect Item
          </button>
        ) : (
          <button
            onClick={onPet}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/90 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-white" /> Pet ({doggo.petsCount})
          </button>
        )}

        <button
          onClick={onOpenSanctuary}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          title="Open Doggo Sanctuary to feed treats and rename"
        >
          Sanctuary 🐶
        </button>
      </div>
    </div>
  );
};
