import React, { useState } from 'react';
import { GameSaveData } from '../types/game';
import { ACHIEVEMENTS, AchievementCategory, AchievementDef } from '../data/achievements';
import {
  Trophy,
  X,
  Lock,
  CheckCircle2,
  Factory,
  Box,
  ZapOff,
  Pickaxe,
  Hammer,
  Flame,
  Gauge,
  Rocket,
  Ticket,
  Radio,
  Coffee,
  Zap,
  Shield,
  Award,
  Sparkles,
  Filter,
  Gift,
  TreePine,
  Star,
  Heart,
  Dog,
  Smile,
} from 'lucide-react';

interface AchievementsModalProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Factory,
  Box,
  ZapOff,
  Pickaxe,
  Hammer,
  Flame,
  Gauge,
  Rocket,
  Ticket,
  Radio,
  Coffee,
  Zap,
  Shield,
  Trophy,
  Sparkles,
  Gift,
  TreePine,
  Star,
  Heart,
  Dog,
  Smile,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  gameState,
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const unlockedIds = new Set(gameState.unlockedAchievements || []);
  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Achievements' },
    { id: 'automation', label: 'Automation' },
    { id: 'production', label: 'Production' },
    { id: 'power', label: 'Power Grid' },
    { id: 'progression', label: 'Progression' },
    { id: 'special', label: 'Special' },
  ];

  const filteredAchievements = ACHIEVEMENTS.filter(a => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12161c] border border-[#2b3542] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="shrink-0 bg-[#181f28] border-b border-[#273240] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fa9549]/15 border border-[#fa9549]/40 flex items-center justify-center text-[#fa9549]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                FICSIT Pioneer Accolades
                <span className="text-xs px-2 py-0.5 rounded bg-[#fa9549]/20 text-[#fa9549] border border-[#fa9549]/40 font-mono-numbers">
                  {unlockedCount} / {totalCount}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Performance milestones recorded in corporate pioneer service records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#202936] hover:bg-[#2b3749] text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="shrink-0 bg-[#151b22] px-6 py-3 border-b border-[#232d3b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-slate-400 shrink-0 font-medium">Accolade Completion:</span>
            <div className="flex-1 max-w-md bg-[#0d1117] h-3 rounded-full overflow-hidden border border-[#2b3542]">
              <div
                className="bg-gradient-to-r from-[#fa9549] via-amber-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono-numbers font-bold text-white shrink-0">
              {progressPercent}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono-numbers text-[11px]">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>FICSIT Pioneer Class: <strong className="text-amber-400">{unlockedCount >= 10 ? 'Senior Foreman' : unlockedCount >= 5 ? 'Junior Specialist' : 'Field Surveyor'}</strong></span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-2.5 bg-[#12161c] border-b border-[#1f2835] flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {categories.map(cat => {
            const countInCat = ACHIEVEMENTS.filter(a => cat.id === 'all' || a.category === cat.id).length;
            const earnedInCat = ACHIEVEMENTS.filter(a => (cat.id === 'all' || a.category === cat.id) && unlockedIds.has(a.id)).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-all font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#fa9549] text-black font-bold shadow-sm'
                    : 'bg-[#1a212b] text-slate-300 hover:bg-[#222c3a] hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono-numbers ${
                  isSelected ? 'bg-black/25 text-black' : 'bg-[#12161c] text-slate-400'
                }`}>
                  {earnedInCat}/{countInCat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map(ach => {
            const isUnlocked = unlockedIds.has(ach.id);
            const progress = ach.getProgress(gameState);
            const IconComponent = ICON_MAP[ach.icon] || Trophy;

            return (
              <div
                key={ach.id}
                className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-[#161f2b] to-[#121821] border-[#fa9549]/40 shadow-lg'
                    : 'bg-[#10141a] border-[#222a36] opacity-75 hover:opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? 'bg-[#fa9549]/20 border-[#fa9549]/60 text-[#fa9549] shadow-[0_0_15px_rgba(250,149,73,0.25)]'
                        : 'bg-[#19202a] border-[#2b3544] text-slate-500'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm font-bold truncate ${
                          isUnlocked ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {ach.title}
                      </h3>

                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-[#161d26] px-2 py-0.5 rounded border border-[#232b38] shrink-0 font-mono-numbers">
                          <Lock className="w-3 h-3 text-slate-500" />
                          LOCKED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar and reward footnote */}
                <div className="pt-2 border-t border-[#1e2633] flex flex-col gap-1.5 text-xs font-mono-numbers">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Progress:</span>
                    <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {isUnlocked ? 'Completed' : progress.formatted}
                    </span>
                  </div>

                  {!isUnlocked && (
                    <div className="w-full bg-[#0a0d11] h-1.5 rounded-full overflow-hidden border border-[#212936]">
                      <div
                        className="bg-[#fa9549] h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            progress.target > 0 ? (progress.current / progress.target) * 100 : 0
                          )}%`,
                        }}
                      />
                    </div>
                  )}

                  {ach.rewardCoupons && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                      <Ticket className="w-3 h-3" />
                      <span>Reward: +{ach.rewardCoupons} FICSIT Coupon{ach.rewardCoupons > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-[#141a22] border-t border-[#232c3a] px-6 py-3 flex items-center justify-between text-xs text-slate-400 font-mono-numbers">
          <span>MASSAGE-2(A-B)b Orbital Operations Ledger</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#242f3e] hover:bg-[#303e52] text-white font-medium transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
