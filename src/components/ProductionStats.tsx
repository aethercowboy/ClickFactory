import React, { useState, useMemo } from 'react';
import { GameSaveData, ItemId } from '../types/game';
import { ALL_ITEMS } from '../data/items';
import { ProductionRates } from '../hooks/useGameLoop';
import { BarChart3, TrendingUp, TrendingDown, Search, Award, Clock } from 'lucide-react';

interface ProductionStatsProps {
  gameState: GameSaveData;
  productionRates: ProductionRates;
}

export const ProductionStats: React.FC<ProductionStatsProps> = ({
  gameState,
  productionRates,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { producedPerMin, consumedPerMin, netPerMin } = productionRates;

  // Filter items that have inventory, production, or consumption
  const activeItems = useMemo(() => {
    return Object.values(ALL_ITEMS).filter(item => {
      const stock = gameState.inventory[item.id] || 0;
      const prod = producedPerMin[item.id] || 0;
      const cons = consumedPerMin[item.id] || 0;
      const isRelevant = stock > 0 || prod > 0 || cons > 0;
      if (!isRelevant) return false;

      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q);
      }

      return true;
    });
  }, [gameState.inventory, producedPerMin, consumedPerMin, categoryFilter, searchQuery]);

  const totalMachinesCount = gameState.machines.reduce((acc, m) => acc + m.count, 0);
  const playTimeMins = Math.floor(gameState.pioneerStats.playtimeSeconds / 60);

  return (
    <div className="space-y-6">
      {/* Top Career Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Total Ore Mined
          </span>
          <span className="text-xl font-bold text-white mt-1 block">
            {gameState.pioneerStats.totalOreMined.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">Manual chiseled</span>
        </div>

        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Active Factory Units
          </span>
          <span className="text-xl font-bold text-[#fa9549] mt-1 block">
            {totalMachinesCount} machines
          </span>
          <span className="text-[11px] text-slate-400">Deployed on world</span>
        </div>

        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Coupons Printed
          </span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">
            {gameState.totalCouponsPrinted}
          </span>
          <span className="text-[11px] text-slate-400">AWESOME Sink yield</span>
        </div>

        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Pioneer Service Time
          </span>
          <span className="text-xl font-bold text-cyan-400 mt-1 block">
            {playTimeMins} mins
          </span>
          <span className="text-[11px] text-slate-400">Planetary deployment</span>
        </div>
      </div>

      {/* Logistics & Rate Balance Table */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#fa9549]" />
            <h3 className="font-industrial text-lg font-bold text-white tracking-wide">
              Production Logistics & Bottleneck Monitor
            </h3>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1014] border border-[#252d37] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fa9549]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-numbers text-xs">
            <thead>
              <tr className="border-b border-[#242c36] text-[11px] uppercase text-slate-400">
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Stock Available</th>
                <th className="py-2.5 px-3">Production Rate</th>
                <th className="py-2.5 px-3">Consumption Rate</th>
                <th className="py-2.5 px-3">Net Flow Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b222a]">
              {activeItems.map(item => {
                const stock = Math.floor(gameState.inventory[item.id] || 0);
                const prod = producedPerMin[item.id] || 0;
                const cons = consumedPerMin[item.id] || 0;
                const net = netPerMin[item.id] || 0;

                return (
                  <tr key={item.id} className="hover:bg-[#161c24] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-white">{item.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {stock.toLocaleString()} {item.unit}
                    </td>

                    <td className="py-3 px-3 text-emerald-400">
                      {prod > 0 ? `+${prod}/min` : '0/min'}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {cons > 0 ? `-${cons}/min` : '0/min'}
                    </td>

                    <td className="py-3 px-3">
                      {net > 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{net}/min
                        </span>
                      ) : net < 0 ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {net}/min
                        </span>
                      ) : (
                        <span className="text-slate-500">0/min</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {activeItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No components currently produced or in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
