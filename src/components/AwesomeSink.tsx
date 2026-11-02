import React, { useState } from 'react';
import { GameSaveData, ItemId } from '../types/game';
import { ALL_ITEMS } from '../data/items';
import { AWESOME_SHOP_ITEMS } from '../data/awesomeShop';
import { Ticket, Sparkles, Check, ArrowRight, Trash2, Coffee, Radio, Award } from 'lucide-react';
import { audio } from '../utils/audio';

interface AwesomeSinkProps {
  gameState: GameSaveData;
  onSinkItem: (itemId: ItemId, amount: number) => void;
  onBuyShopItem: (itemId: string) => boolean;
}

export const AwesomeSink: React.FC<AwesomeSinkProps> = ({
  gameState,
  onSinkItem,
  onBuyShopItem,
}) => {
  const [selectedSinkOre, setSelectedSinkOre] = useState<ItemId>('iron_plate');
  const [sinkQuantity, setSinkQuantity] = useState<number>(10);

  // Available items in inventory with sink value > 0
  const sinkableItems = Object.entries(gameState.inventory)
    .filter(([id, count]) => {
      const item = ALL_ITEMS[id as ItemId];
      return item && item.sinkPoints > 0 && (count || 0) > 0;
    })
    .map(([id, count]) => ({
      id: id as ItemId,
      name: ALL_ITEMS[id as ItemId].name,
      count: Math.floor(count),
      sinkPoints: ALL_ITEMS[id as ItemId].sinkPoints,
      color: ALL_ITEMS[id as ItemId].color,
    }));

  const currentSinkItem = ALL_ITEMS[selectedSinkOre];
  const itemInStock = Math.floor(gameState.inventory[selectedSinkOre] || 0);

  const pointsPerCoupon = 1000 + gameState.totalCouponsPrinted * 250;
  const progressPercent = Math.min(100, Math.round((gameState.sinkPoints / pointsPerCoupon) * 100));

  const handleSink = (amount: number) => {
    if (!selectedSinkOre || amount <= 0) return;
    onSinkItem(selectedSinkOre, amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-industrial tracking-wide text-white">
              AWESOME Sink & Corporate Shop
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Feed surplus components and materials into the shredder to earn FICSIT Coupons. Redeem coupons for permanent upgrades, Golden trophies, and the legendary FICSIT Coffee Cup.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0d1014] px-4 py-2.5 rounded-lg border border-amber-500/30 shrink-0 font-mono-numbers text-xs">
          <Ticket className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Coupons Available:</span>
          <span className="font-bold text-amber-400 text-sm">{gameState.ficsitCoupons}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: AWESOME Sink Shredder Section */}
        <div className="lg:col-span-5 bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg space-y-5">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono-numbers text-[#fa9549] font-semibold">
              FICSIT Material Destruction Matrix
            </span>
            <h3 className="font-industrial text-xl font-bold text-white tracking-wide mt-0.5">
              AWESOME Sink Shredder
            </h3>
          </div>

          {/* Ticket Printing Progress */}
          <div className="bg-[#0e1216] border border-[#202732] rounded-xl p-4 space-y-2 font-mono-numbers text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Coupon Printing Progress:</span>
              <span className="text-amber-400 font-bold">{progressPercent}%</span>
            </div>

            <div className="w-full h-3 bg-[#182029] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-[#fa9549] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{Math.round(gameState.sinkPoints).toLocaleString()} pts</span>
              <span>{pointsPerCoupon.toLocaleString()} pts / coupon</span>
            </div>
          </div>

          {/* Item Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono-numbers">
              Select Item to Sink:
            </label>
            <select
              value={selectedSinkOre}
              onChange={e => setSelectedSinkOre(e.target.value as ItemId)}
              className="w-full bg-[#0d1014] border border-[#242d38] rounded-lg px-3 py-2 text-xs font-mono-numbers text-white focus:outline-none focus:border-[#fa9549]"
            >
              {sinkableItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.count} in stock) · {item.sinkPoints} pts each
                </option>
              ))}
              {sinkableItems.length === 0 && (
                <option value="">No sinkable items currently in stock</option>
              )}
            </select>
          </div>

          {/* Sink Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              disabled={itemInStock <= 0}
              onClick={() => handleSink(10)}
              className="w-full py-3 px-4 bg-[#1e2530] hover:bg-[#fa9549] disabled:opacity-40 text-white hover:text-black font-industrial text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sink 10x ({currentSinkItem?.name})</span>
            </button>

            <div className="grid grid-cols-2 gap-2 font-mono-numbers text-xs">
              <button
                disabled={itemInStock < 50}
                onClick={() => handleSink(50)}
                className="py-2 bg-[#0e1216] hover:bg-[#1a212b] disabled:opacity-40 text-slate-300 rounded border border-[#202732]"
              >
                Sink 50x
              </button>
              <button
                disabled={itemInStock <= 0}
                onClick={() => handleSink(itemInStock)}
                className="py-2 bg-[#0e1216] hover:bg-[#1a212b] disabled:opacity-40 text-amber-400 rounded border border-[#202732] font-semibold"
              >
                Sink All ({itemInStock})
              </button>
            </div>
          </div>
        </div>

        {/* Right: AWESOME Shop Catalog */}
        <div className="lg:col-span-7 bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-mono-numbers text-amber-400 font-semibold">
              FICSIT Corporate Rewards
            </span>
            <h3 className="font-industrial text-xl font-bold text-white tracking-wide mt-0.5">
              AWESOME Shop Shelf
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AWESOME_SHOP_ITEMS.map(item => {
              const isPurchased = gameState.shopPurchases.includes(item.id);
              const canAfford = gameState.ficsitCoupons >= item.couponCost;

              return (
                <div
                  key={item.id}
                  className={`bg-[#0d1015] border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                    isPurchased
                      ? 'border-emerald-600/40 bg-emerald-950/10'
                      : 'border-[#222b37] hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-industrial text-base font-semibold text-white tracking-wide">
                        {item.name}
                      </h4>
                      {isPurchased && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1a222c] flex items-center justify-between font-mono-numbers text-xs">
                    <span className="text-amber-400 font-bold">
                      {item.couponCost} Coupons
                    </span>

                    {isPurchased ? (
                      <span className="text-emerald-400 font-semibold text-xs">
                        Owned
                      </span>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => onBuyShopItem(item.id)}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold text-xs rounded transition-colors"
                      >
                        Purchase
                      </button>
                    )}
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
