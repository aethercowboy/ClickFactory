import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  ReferenceLine,
  Tooltip,
} from 'recharts';

interface SparklineChartProps {
  itemId: string;
  history?: number[]; // raw values in /min
  currentNetMin: number;
  unit: 'min' | 'sec';
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  itemId,
  history,
  currentNetMin,
  unit,
}) => {
  // Construct a continuous history of 12-24 data points
  const { chartData, color, trendLabel, trendColor, isZero } = useMemo(() => {
    // Current net rate in active unit
    const currentRate = unit === 'sec' ? currentNetMin / 60 : currentNetMin;
    const roundedCurrent = unit === 'sec'
      ? Math.round(currentRate * 100) / 100
      : Math.round(currentRate * 10) / 10;

    let rawPoints: number[] = [];
    if (history && history.length > 0) {
      rawPoints = history.map(v => (unit === 'sec' ? v / 60 : v));
    }

    // If history is too short, pad with the current value to form a clean baseline
    if (rawPoints.length < 12) {
      const paddingCount = 12 - rawPoints.length;
      const pad = Array(paddingCount).fill(roundedCurrent);
      rawPoints = [...pad, ...rawPoints];
    } else {
      rawPoints = rawPoints.slice(-20);
    }

    const data = rawPoints.map((val, idx) => ({
      index: idx,
      value: unit === 'sec' ? Math.round(val * 100) / 100 : Math.round(val * 10) / 10,
    }));

    // Analyze trend & stability
    const firstQuarter = rawPoints.slice(0, Math.max(2, Math.floor(rawPoints.length / 3)));
    const lastQuarter = rawPoints.slice(-Math.max(2, Math.floor(rawPoints.length / 3)));

    const firstAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
    const diff = lastAvg - firstAvg;

    const minVal = Math.min(...rawPoints);
    const maxVal = Math.max(...rawPoints);
    const range = maxVal - minVal;

    const allZero = Math.abs(maxVal) < 0.01 && Math.abs(minVal) < 0.01;
    const allPositive = minVal >= -0.01 && maxVal > 0.01;
    const allNegative = maxVal <= 0.01 && minVal < -0.01;
    const crossesZero = minVal < -0.05 && maxVal > 0.05;

    let chosenColor = '#10b981'; // emerald
    let label = 'Steady';
    let labelColor = 'text-slate-400';

    if (allZero) {
      chosenColor = '#64748b'; // slate
      label = 'Zero';
      labelColor = 'text-slate-500';
    } else if (allNegative) {
      chosenColor = '#f43f5e'; // rose
      labelColor = 'text-rose-400';
      if (diff < -0.5) {
        label = 'Dropping ↘';
      } else if (diff > 0.5) {
        label = 'Recovering ↗';
      } else {
        label = 'Deficit —';
      }
    } else if (crossesZero) {
      chosenColor = '#f59e0b'; // amber
      label = 'Fluctuating ∿';
      labelColor = 'text-amber-400';
    } else if (allPositive) {
      chosenColor = '#10b981'; // emerald
      labelColor = 'text-emerald-400';
      if (diff > 0.5) {
        label = 'Rising ↗';
      } else if (diff < -0.5) {
        label = 'Slowing ↘';
      } else {
        label = 'Stable —';
      }
    } else {
      if (range > 1.5) {
        chosenColor = '#38bdf8'; // cyan
        label = 'Varying';
        labelColor = 'text-cyan-400';
      }
    }

    return {
      chartData: data,
      color: chosenColor,
      trendLabel: label,
      trendColor: labelColor,
      isZero: allZero,
    };
  }, [history, currentNetMin, unit]);

  // Safe unique ID for SVG gradient
  const gradientId = `sparkline-grad-${itemId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  // Domain calculation for smooth vertical scaling
  const domain = useMemo<[number | string, number | string]>(() => {
    if (isZero) return [-1, 1];
    const vals = chartData.map(d => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    if (min === max) {
      if (min > 0) return [0, min * 1.5];
      if (min < 0) return [min * 1.5, 0];
      return [-1, 1];
    }

    // Add 10% breathing room above and below
    const padding = Math.max(0.1, (max - min) * 0.15);
    return [
      Math.min(min < 0 ? min - padding : 0, min - padding),
      Math.max(max > 0 ? max + padding : 0, max + padding),
    ];
  }, [chartData, isZero]);

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 sm:w-28 h-8 relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <YAxis domain={domain} hide />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="2 2" strokeWidth={1} />

            <Tooltip
              isAnimationActive={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  const formatted = val > 0 ? `+${val}` : `${val}`;
                  return (
                    <div className="bg-[#0c1015] border border-[#2b3542] rounded px-1.5 py-0.5 text-[10px] font-mono text-white shadow-xl pointer-events-none whitespace-nowrap z-50">
                      <span className="text-slate-400">Net: </span>
                      <span className={val > 0 ? 'text-emerald-400 font-bold' : val < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {formatted}/{unit}
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 2.5, fill: color, stroke: '#ffffff', strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stability Trend Pill */}
      <span className={`text-[10px] font-mono font-medium whitespace-nowrap ${trendColor}`}>
        {trendLabel}
      </span>
    </div>
  );
};
