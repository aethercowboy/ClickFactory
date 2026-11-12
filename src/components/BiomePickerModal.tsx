import React from 'react';
import { BiomeId } from '../types/game';
import { BIOMES, BiomeDef } from '../data/biomes';
import {
  X,
  Check,
  Compass,
  Trees,
  Mountain,
  Sun,
  Sparkles,
  MapPin,
  Wind,
} from 'lucide-react';

interface BiomePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBiomeId: BiomeId;
  onSelectBiome: (biomeId: BiomeId) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Trees,
  Mountain,
  Compass,
  Sun,
  Sparkles,
};

export const BiomePickerModal: React.FC<BiomePickerModalProps> = ({
  isOpen,
  onClose,
  currentBiomeId,
  onSelectBiome,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11161d] border border-[#273241] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="shrink-0 bg-[#17202b] border-b border-[#243140] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fa9549]/15 border border-[#fa9549]/40 flex items-center justify-center text-[#fa9549]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                FICSIT Planetary Survey: Biome Sectors
                <span className="text-xs px-2 py-0.5 rounded bg-[#1e2937] text-slate-300 border border-[#2e3e52] font-mono-numbers">
                  5 Sectors Surveyed
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure your colony drop zone theme across planetary sectors of MASSAGE-2(A-B)b.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1e2735] hover:bg-[#283547] text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biomes List / Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-xs text-slate-400 flex items-center justify-between font-mono-numbers border-b border-[#1f2835] pb-2">
            <span>AVAILABLE COLONY DROP SECTORS</span>
            <span>REAL-TIME ATMOSPHERIC & TOPOGRAPHIC THEMES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BIOMES.map(biome => {
              const isCurrent = currentBiomeId === biome.id;
              const IconComp = ICON_MAP[biome.icon] || MapPin;

              return (
                <div
                  key={biome.id}
                  onClick={() => onSelectBiome(biome.id)}
                  className={`group relative rounded-xl border p-4.5 cursor-pointer transition-all flex flex-col justify-between gap-3 text-left overflow-hidden ${
                    isCurrent
                      ? 'bg-gradient-to-br from-[#192330] to-[#121822] shadow-xl'
                      : 'bg-[#131922] border-[#222b38] hover:border-slate-500 hover:bg-[#161f2a]'
                  }`}
                  style={{
                    borderColor: isCurrent ? biome.accentColor : undefined,
                    boxShadow: isCurrent ? `0 0 25px ${biome.accentColor}25` : undefined,
                  }}
                >
                  {/* Subtle top ambient glow strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
                    style={{
                      backgroundColor: biome.accentColor,
                      opacity: isCurrent ? 1 : 0.4,
                    }}
                  />

                  <div>
                    {/* Sector & Icon Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: biome.badgeBg,
                            borderColor: biome.badgeBorder,
                            color: biome.accentColor,
                          }}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono-numbers font-bold text-slate-400 uppercase tracking-wider block">
                            {biome.sector}
                          </span>
                          <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                            {biome.name}
                          </h3>
                        </div>
                      </div>

                      {/* Active Status Badge */}
                      {isCurrent ? (
                        <div
                          className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded font-mono-numbers"
                          style={{
                            backgroundColor: biome.badgeBg,
                            color: biome.accentColor,
                            border: `1px solid ${biome.badgeBorder}`,
                          }}
                        >
                          <Check className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-mono-numbers transition-colors">
                          Deploy ▶
                        </span>
                      )}
                    </div>

                    {/* Tagline */}
                    <p
                      className="text-xs font-medium mb-1.5"
                      style={{ color: biome.accentColor }}
                    >
                      {biome.tagline}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {biome.description}
                    </p>
                  </div>

                  {/* Terrain & Resource Metadata */}
                  <div className="space-y-2 pt-2 border-t border-[#1f2835] text-xs font-mono-numbers">
                    {/* Environmental traits */}
                    <div className="flex flex-wrap gap-1">
                      {biome.environmentalTraits.map((trait, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[#0f141b] text-slate-400 border border-[#212b38]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>

                    {/* Resource survey note */}
                    <div className="text-[11px] text-slate-400 leading-tight">
                      <strong className="text-slate-300">Survey: </strong>
                      <span>{biome.resourceNotes}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBiome(biome.id);
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'text-black shadow-md'
                          : 'bg-[#1b232e] hover:bg-[#253242] text-slate-200'
                      }`}
                      style={{
                        backgroundColor: isCurrent ? biome.accentColor : undefined,
                      }}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Current Sector Environment</span>
                        </>
                      ) : (
                        <>
                          <span>Deploy Pioneer to {biome.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 bg-[#141b24] border-t border-[#232f3e] px-6 py-3 flex items-center justify-between text-xs text-slate-400 font-mono-numbers">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Planetary Sector Relocation: Instant deployment with zero progress loss</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#222d3b] hover:bg-[#2e3c4f] text-white font-medium transition-colors"
          >
            Confirm & Return
          </button>
        </div>
      </div>
    </div>
  );
};
