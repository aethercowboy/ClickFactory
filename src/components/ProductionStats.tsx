import React, { useState, useMemo } from 'react';
import { GameSaveData, ItemId } from '../types/game';
import { ALL_ITEMS } from '../data/items';
import { ProductionRates } from '../hooks/useGameLoop';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  MinusCircle,
  Filter,
  Check,
  Activity,
} from 'lucide-react';
import { SparklineChart } from './SparklineChart';

interface ProductionStatsProps {
  gameState: GameSaveData;
  productionRates: ProductionRates;
}

type RateUnit = 'min' | 'sec';
type ComparisonOperator = '<=' | '<';
type SortField = 'name' | 'stock' | 'prod' | 'cons' | 'net';
type SortDirection = 'asc' | 'desc';

export const ProductionStats: React.FC<ProductionStatsProps> = ({
  gameState,
  productionRates,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [unit, setUnit] = useState<RateUnit>('min');

  // Net flow rate filter controls
  const [isNetFilterActive, setIsNetFilterActive] = useState<boolean>(false);
  const [netFilterOp, setNetFilterOp] = useState<ComparisonOperator>('<=');
  const [netFilterValue, setNetFilterValue] = useState<number>(60); // In current unit
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('net');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc'); // Default asc: biggest deficits first

  const { producedPerMin, consumedPerMin, netPerMin } = productionRates;

  // Handle unit switch and convert existing filter value cleanly
  const handleUnitChange = (newUnit: RateUnit) => {
    if (newUnit === unit) return;
    if (newUnit === 'sec') {
      // /min to /sec: e.g. 60/min -> 1/sec
      setNetFilterValue(prev => Math.round((prev / 60) * 100) / 100);
    } else {
      // /sec to /min: e.g. 1/sec -> 60/min
      setNetFilterValue(prev => Math.round(prev * 60));
    }
    setUnit(newUnit);
  };

  // Preset handlers
  const applyPreset = (preset: 'all' | 'deficit' | 'zero_or_deficit' | 'belt_mk1' | 'sixty_per_sec') => {
    if (preset === 'all') {
      setIsNetFilterActive(false);
      return;
    }

    setIsNetFilterActive(true);

    if (preset === 'deficit') {
      setNetFilterOp('<');
      setNetFilterValue(0);
    } else if (preset === 'zero_or_deficit') {
      setNetFilterOp('<=');
      setNetFilterValue(0);
    } else if (preset === 'belt_mk1') {
      // 60/min (or 1/sec)
      setNetFilterOp('<=');
      setNetFilterValue(unit === 'sec' ? 1 : 60);
    } else if (preset === 'sixty_per_sec') {
      // 60/sec (or 3,600/min)
      setNetFilterOp('<=');
      setNetFilterValue(unit === 'sec' ? 60 : 3600);
    }
  };

  // Base list of items with pre-calculated rates
  const allItemStats = useMemo(() => {
    return Object.values(ALL_ITEMS).map(item => {
      const stock = gameState.inventory[item.id] || 0;
      const pMin = producedPerMin[item.id] || 0;
      const cMin = consumedPerMin[item.id] || 0;
      const nMin = netPerMin[item.id] || 0;

      const pSec = pMin / 60;
      const cSec = cMin / 60;
      const nSec = nMin / 60;

      const hasActivity = stock > 0 || pMin > 0 || cMin > 0;
      const history = productionRates.netHistory?.[item.id] || [];

      return {
        item,
        stock,
        prodMin: pMin,
        consMin: cMin,
        netMin: nMin,
        prodSec: pSec,
        consSec: cSec,
        netSec: nSec,
        hasActivity,
        history,
      };
    });
  }, [gameState.inventory, producedPerMin, consumedPerMin, netPerMin, productionRates.netHistory]);

  // Aggregate breakdown metrics across active items
  const metrics = useMemo(() => {
    let deficitCount = 0;
    let zeroCount = 0;
    let surplusCount = 0;
    let totalActive = 0;

    allItemStats.forEach(entry => {
      if (entry.hasActivity) {
        totalActive++;
        if (entry.netMin < 0) deficitCount++;
        else if (entry.netMin === 0) zeroCount++;
        else surplusCount++;
      }
    });

    return { deficitCount, zeroCount, surplusCount, totalActive };
  }, [allItemStats]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return allItemStats
      .filter(({ item, hasActivity, netMin, netSec }) => {
        // Scope filter: active only unless showInactive is checked
        if (!showInactive && !hasActivity) return false;

        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) {
          return false;
        }

        // Search text query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!item.name.toLowerCase().includes(q)) return false;
        }

        // Net flow rate threshold filter
        if (isNetFilterActive) {
          const currentNet = unit === 'sec' ? netSec : netMin;
          if (netFilterOp === '<') {
            if (!(currentNet < netFilterValue)) return false;
          } else {
            if (!(currentNet <= netFilterValue)) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'name') {
          diff = a.item.name.localeCompare(b.item.name);
        } else if (sortField === 'stock') {
          diff = a.stock - b.stock;
        } else if (sortField === 'prod') {
          diff = a.prodMin - b.prodMin;
        } else if (sortField === 'cons') {
          diff = a.consMin - b.consMin;
        } else if (sortField === 'net') {
          diff = a.netMin - b.netMin;
        }

        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [
    allItemStats,
    showInactive,
    categoryFilter,
    searchQuery,
    isNetFilterActive,
    unit,
    netFilterOp,
    netFilterValue,
    sortField,
    sortDirection,
  ]);

  // Sort click handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // For net flow, default to ascending (deficits first); for others default descending
      setSortDirection(field === 'net' ? 'asc' : 'desc');
    }
  };

  const totalMachinesCount = gameState.machines.reduce((acc, m) => acc + m.count, 0);
  const playTimeMins = Math.floor(gameState.pioneerStats.playtimeSeconds / 60);

  // Dynamic slider bounds
  const sliderConfig = useMemo(() => {
    if (unit === 'sec') {
      return {
        min: -60,
        max: 60,
        step: 0.5,
      };
    }
    return {
      min: -3600,
      max: 3600,
      step: 10,
    };
  }, [unit]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'raw', label: 'Raw Ores & Fluids' },
    { id: 'standard', label: 'Standard Parts' },
    { id: 'advanced', label: 'Advanced Heavy' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'oil_chem', label: 'Oil & Chemicals' },
    { id: 'project_part', label: 'Project Assembly' },
    { id: 'ficsmas', label: 'FICSMAS Holiday' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Career Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Total Ore Mined
          </span>
          <span className="text-xl font-bold text-white mt-1 block">
            {gameState.pioneerStats.totalOreMined.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">Manual chiseled</span>
        </div>

        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Active Factory Units
          </span>
          <span className="text-xl font-bold text-[#fa9549] mt-1 block">
            {totalMachinesCount} machines
          </span>
          <span className="text-[11px] text-slate-400">Deployed on world</span>
        </div>

        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Coupons Printed
          </span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">
            {gameState.totalCouponsPrinted}
          </span>
          <span className="text-[11px] text-slate-400">AWESOME Sink yield</span>
        </div>

        <div className="bg-[#141920] border border-[#242c36] rounded-xl p-4 font-mono-numbers shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Pioneer Service Time
          </span>
          <span className="text-xl font-bold text-cyan-400 mt-1 block">
            {playTimeMins} mins
          </span>
          <span className="text-[11px] text-slate-400">Planetary deployment</span>
        </div>
      </div>

      {/* Main Logistics & Bottleneck Monitor Console */}
      <div className="bg-[#141920] border border-[#242c36] rounded-xl p-5 shadow-lg space-y-5">
        {/* Header & Unit Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#242c36] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#fa9549]/10 border border-[#fa9549]/30 text-[#fa9549]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-industrial text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Production Logistics & Flow Rate Monitor
              </h3>
              <p className="text-xs text-slate-400">
                Filter by net flow rate to detect factory bottlenecks, deficits, and low throughput.
              </p>
            </div>
          </div>

          {/* Unit Toggle and Inactive Scope Switch */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Display Rate Unit Switcher */}
            <div className="flex items-center bg-[#0d1014] border border-[#252d37] rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-2 font-mono text-[11px] uppercase">Unit:</span>
              <button
                onClick={() => handleUnitChange('min')}
                className={`px-3 py-1 rounded font-mono font-bold transition-colors cursor-pointer ${
                  unit === 'min'
                    ? 'bg-[#fa9549] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                /min
              </button>
              <button
                onClick={() => handleUnitChange('sec')}
                className={`px-3 py-1 rounded font-mono font-bold transition-colors cursor-pointer ${
                  unit === 'sec'
                    ? 'bg-[#fa9549] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                /sec
              </button>
            </div>

            {/* Scope: Show inactive */}
            <label className="flex items-center gap-2 text-xs text-slate-400 bg-[#0d1014] border border-[#252d37] px-3 py-1.5 rounded-lg cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#fa9549] bg-neutral-900 border-neutral-700 focus:ring-0 cursor-pointer"
              />
              <span>Include Stagnant (0-stock)</span>
            </label>
          </div>
        </div>

        {/* Quick Flow Breakdown Metric Cards (Interactive Presets) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-numbers">
          <button
            onClick={() => applyPreset('all')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              !isNetFilterActive
                ? 'bg-[#1b2430] border-[#fa9549] shadow-md ring-1 ring-[#fa9549]/40'
                : 'bg-[#0e1217] border-[#222a35] hover:bg-[#151c24] text-slate-300'
            }`}
          >
            <span className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>All Components</span>
              {!isNetFilterActive && <Check className="w-3.5 h-3.5 text-[#fa9549]" />}
            </span>
            <span className="text-base font-bold text-white mt-1">
              {metrics.totalActive} active
            </span>
            <span className="text-[10px] text-slate-500">No flow filter</span>
          </button>

          <button
            onClick={() => applyPreset('deficit')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isNetFilterActive && netFilterOp === '<' && netFilterValue === 0
                ? 'bg-rose-950/50 border-rose-500 shadow-md ring-1 ring-rose-500/40 text-rose-200'
                : 'bg-[#0e1217] border-[#222a35] hover:bg-rose-950/20 text-slate-300'
            }`}
          >
            <span className="text-rose-400 text-[11px] flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Deficit Only
              </span>
              {isNetFilterActive && netFilterOp === '<' && netFilterValue === 0 && (
                <Check className="w-3.5 h-3.5 text-rose-400" />
              )}
            </span>
            <span className="text-base font-bold text-rose-400 mt-1">
              {metrics.deficitCount} items
            </span>
            <span className="text-[10px] text-rose-300/70">Net Flow &lt; 0</span>
          </button>

          <button
            onClick={() => applyPreset('zero_or_deficit')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              isNetFilterActive && netFilterOp === '<=' && netFilterValue === 0
                ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/40 text-amber-200'
                : 'bg-[#0e1217] border-[#222a35] hover:bg-amber-950/20 text-slate-300'
            }`}
          >
            <span className="text-amber-400 text-[11px] flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1">
                <MinusCircle className="w-3.5 h-3.5 text-amber-400" /> Zero or Deficit
              </span>
              {isNetFilterActive && netFilterOp === '<=' && netFilterValue === 0 && (
                <Check className="w-3.5 h-3.5 text-amber-400" />
              )}
            </span>
            <span className="text-base font-bold text-amber-400 mt-1">
              {metrics.deficitCount + metrics.zeroCount} items
            </span>
            <span className="text-[10px] text-amber-300/70">Net Flow &le; 0</span>
          </button>

          <div className="p-3 rounded-xl bg-[#0e1217] border border-[#222a35] text-slate-300 flex flex-col justify-between">
            <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Surplus Growing
            </span>
            <span className="text-base font-bold text-emerald-400 mt-1">
              {metrics.surplusCount} items
            </span>
            <span className="text-[10px] text-emerald-300/70">Net Flow &gt; 0</span>
          </div>
        </div>

        {/* Dedicated Flow Filter & Slider Control Deck */}
        <div className="p-4 rounded-xl bg-[#0d1014] border border-[#252d37] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#fa9549]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Max Net Flow Rate Filter:
              </span>
              {isNetFilterActive ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Active: Net {netFilterOp} {netFilterValue}/{unit}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-[#141920] border border-[#222b36]">
                  Filter Inactive (Showing All)
                </span>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
              <button
                onClick={() => applyPreset('all')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  !isNetFilterActive
                    ? 'bg-[#fa9549] text-black font-bold'
                    : 'bg-[#151c24] text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => applyPreset('deficit')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  isNetFilterActive && netFilterOp === '<' && netFilterValue === 0
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-[#151c24] text-rose-300 hover:text-white'
                }`}
              >
                &lt; 0
              </button>
              <button
                onClick={() => applyPreset('zero_or_deficit')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  isNetFilterActive && netFilterOp === '<=' && netFilterValue === 0
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-[#151c24] text-amber-300 hover:text-white'
                }`}
              >
                &le; 0
              </button>
              <button
                onClick={() => applyPreset('belt_mk1')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  isNetFilterActive &&
                  netFilterOp === '<=' &&
                  netFilterValue === (unit === 'sec' ? 1 : 60)
                    ? 'bg-[#fa9549] text-black font-bold'
                    : 'bg-[#151c24] text-slate-300 hover:text-white'
                }`}
              >
                {unit === 'sec' ? '< 1/s (60/m)' : '< 60/m'}
              </button>
              <button
                onClick={() => applyPreset('sixty_per_sec')}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  isNetFilterActive &&
                  netFilterOp === '<=' &&
                  netFilterValue === (unit === 'sec' ? 60 : 3600)
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#151c24] text-cyan-300 hover:text-white'
                }`}
              >
                {unit === 'sec' ? '< 60/s' : '< 3,600/m (60/s)'}
              </button>

              {isNetFilterActive && (
                <button
                  onClick={() => setIsNetFilterActive(false)}
                  className="px-2 py-1 rounded bg-[#202936] hover:bg-[#2c384a] text-slate-300 flex items-center gap-1 cursor-pointer ml-1"
                  title="Clear Net Flow Filter"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Slider and Arbitrary Numeric Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
            {/* Operator Select */}
            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">Condition:</span>
              <select
                value={netFilterOp}
                onChange={e => {
                  setNetFilterOp(e.target.value as ComparisonOperator);
                  setIsNetFilterActive(true);
                }}
                className="w-full bg-[#141920] border border-[#2b3542] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#fa9549] cursor-pointer"
              >
                <option value="<=">&le; Less than or equal to</option>
                <option value="<">&lt; Strictly less than</option>
              </select>
            </div>

            {/* Slider */}
            <div className="md:col-span-6 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{sliderConfig.min}/{unit}</span>
                <span className="text-slate-400">
                  Slide to scrub threshold: <strong className="text-white">{netFilterValue}/{unit}</strong>
                </span>
                <span>+{sliderConfig.max}/{unit}</span>
              </div>
              <input
                type="range"
                min={sliderConfig.min}
                max={sliderConfig.max}
                step={sliderConfig.step}
                value={Math.min(sliderConfig.max, Math.max(sliderConfig.min, netFilterValue))}
                onChange={e => {
                  setNetFilterValue(parseFloat(e.target.value));
                  setIsNetFilterActive(true);
                }}
                className="w-full h-2 bg-[#1b232c] rounded-lg appearance-none cursor-pointer accent-[#fa9549]"
              />
            </div>

            {/* Arbitrary Value Field */}
            <div className="md:col-span-3 flex items-center gap-2">
              <div className="relative w-full">
                <input
                  type="number"
                  step={unit === 'sec' ? '0.1' : '1'}
                  placeholder="Enter rate..."
                  value={isNaN(netFilterValue) ? '' : netFilterValue}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setNetFilterValue(isNaN(val) ? 0 : val);
                    setIsNetFilterActive(true);
                  }}
                  className="w-full bg-[#141920] border border-[#2b3542] rounded-lg pl-3 pr-10 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#fa9549]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  /{unit}
                </span>
              </div>

              {!isNetFilterActive ? (
                <button
                  onClick={() => setIsNetFilterActive(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#fa9549] hover:bg-[#fb8533] text-black text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={() => setIsNetFilterActive(false)}
                  className="p-1.5 rounded-lg bg-[#202936] hover:bg-[#2c384a] text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Turn off net flow filter"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills & Search Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-[#2b3542] text-white font-semibold'
                    : 'bg-[#101419] text-slate-400 hover:text-white hover:bg-[#181f27]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full lg:w-64 shrink-0">
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

        {/* Matching Count Ribbon */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-[#1e252d] pt-3">
          <span>
            Showing <strong className="text-white">{filteredItems.length}</strong> of{' '}
            <strong className="text-slate-300">{allItemStats.length}</strong> components
            {isNetFilterActive && (
              <span className="text-amber-400 ml-1">
                (Filtered by Net {netFilterOp} {netFilterValue}/{unit})
              </span>
            )}
          </span>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click column headers to toggle sorting order.
          </span>
        </div>

        {/* Flow Rates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-numbers text-xs">
            <thead>
              <tr className="border-b border-[#242c36] text-[11px] uppercase text-slate-400 select-none">
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Item Name</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#fa9549]" /> : <ArrowDown className="w-3 h-3 text-[#fa9549]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('stock')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stock</span>
                    {sortField === 'stock' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#fa9549]" /> : <ArrowDown className="w-3 h-3 text-[#fa9549]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('prod')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Production Rate ({unit === 'sec' ? '/s' : '/m'})</span>
                    {sortField === 'prod' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#fa9549]" /> : <ArrowDown className="w-3 h-3 text-[#fa9549]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('cons')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Consumption Rate ({unit === 'sec' ? '/s' : '/m'})</span>
                    {sortField === 'cons' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#fa9549]" /> : <ArrowDown className="w-3 h-3 text-[#fa9549]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('net')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors bg-[#18202a]/60 rounded-t-lg"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#fa9549]">
                    <span>Net Flow Rate ({unit === 'sec' ? '/s' : '/m'})</span>
                    {sortField === 'net' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#fa9549]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#fa9549]" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </div>
                </th>

                <th className="py-2.5 px-3 text-slate-400 select-none">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Stability Trend</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b222a]">
              {filteredItems.map(({ item, stock, prodMin, consMin, netMin, prodSec, consSec, netSec, history }) => {
                const primaryProd = unit === 'sec' ? prodSec : prodMin;
                const secondaryProd = unit === 'sec' ? prodMin : prodSec;
                const primaryCons = unit === 'sec' ? consSec : consMin;
                const secondaryCons = unit === 'sec' ? consMin : consSec;
                const primaryNet = unit === 'sec' ? netSec : netMin;
                const secondaryNet = unit === 'sec' ? netMin : netSec;

                const isDeficit = netMin < 0;
                const isZero = netMin === 0;

                // Format values nicely
                const formatVal = (v: number) => {
                  if (unit === 'sec') {
                    return Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2);
                  }
                  return Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1);
                };

                const formatSecondary = (v: number) => {
                  if (unit === 'sec') {
                    // Secondary is /min
                    return `${v.toFixed(1)}/m`;
                  }
                  // Secondary is /sec
                  return `${v.toFixed(2)}/s`;
                };

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isDeficit
                        ? 'bg-rose-950/20 hover:bg-rose-950/30'
                        : 'hover:bg-[#161c24]'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <span className="font-semibold text-white block">{item.name}</span>
                          <span className="text-[10px] text-slate-500 capitalize">{item.category}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-medium">
                      <span>{Math.floor(stock).toLocaleString()}</span>{' '}
                      <span className="text-slate-500 text-[10px]">{item.unit}</span>
                    </td>

                    <td className="py-3 px-3 text-emerald-400">
                      {primaryProd > 0 ? (
                        <div>
                          <span className="font-semibold">+{formatVal(primaryProd)}/{unit}</span>
                          <span className="block text-[10px] text-slate-500 font-normal">
                            ({formatSecondary(secondaryProd)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">0/{unit}</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {primaryCons > 0 ? (
                        <div>
                          <span className="font-semibold">-{formatVal(primaryCons)}/{unit}</span>
                          <span className="block text-[10px] text-slate-500 font-normal">
                            ({formatSecondary(secondaryCons)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">0/{unit}</span>
                      )}
                    </td>

                    <td className="py-3 px-3 bg-[#18202a]/30">
                      {isDeficit ? (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                              {formatVal(primaryNet)}/{unit}
                            </span>
                            <span className="block text-[10px] text-rose-300/60 font-normal">
                              ({formatSecondary(secondaryNet)})
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
                            Deficit
                          </span>
                        </div>
                      ) : isZero ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>0/{unit}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                            +{formatVal(primaryNet)}/{unit}
                          </span>
                          <span className="block text-[10px] text-emerald-300/60 font-normal">
                            ({formatSecondary(secondaryNet)})
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <SparklineChart
                        itemId={item.id}
                        history={history}
                        currentNetMin={netMin}
                        unit={unit}
                      />
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-3">
                    <p className="text-sm">No components match the current logistics flow filters.</p>
                    <div className="flex items-center justify-center gap-2">
                      {isNetFilterActive && (
                        <button
                          onClick={() => setIsNetFilterActive(false)}
                          className="px-3 py-1.5 rounded-lg bg-[#202936] hover:bg-[#2c384a] text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Clear Net Flow Filter
                        </button>
                      )}
                      {categoryFilter !== 'all' && (
                        <button
                          onClick={() => setCategoryFilter('all')}
                          className="px-3 py-1.5 rounded-lg bg-[#202936] hover:bg-[#2c384a] text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Reset Category
                        </button>
                      )}
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-3 py-1.5 rounded-lg bg-[#202936] hover:bg-[#2c384a] text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
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
