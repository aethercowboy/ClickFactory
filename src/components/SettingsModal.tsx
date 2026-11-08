import React, { useState, useEffect } from 'react';
import { GameSaveData, BiomeId } from '../types/game';
import { exportSave, importSave, INITIAL_SAVE } from '../utils/saveLoad';
import { Settings, Download, Upload, RotateCcw, Volume2, VolumeX, Check, ExternalLink, Compass, Gift, X } from 'lucide-react';
import { audio } from '../utils/audio';
import { APP_VERSION } from '../version';
import { BIOMES } from '../data/biomes';
import { isFicsmasActive, getFicsmasStatusText } from '../utils/ficsmas';

interface SettingsModalProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
  onImport: (newData: GameSaveData) => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleAmbient: () => void;
  onSelectBiome?: (biomeId: BiomeId) => void;
  onSetFicsmasMode?: (mode: 'auto' | 'enabled' | 'disabled') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onImport,
  onReset,
  onToggleSound,
  onToggleAmbient,
  onSelectBiome,
  onSetFicsmasMode,
}) => {
  const [importText, setImportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Keyboard shortcut: Press Escape to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = exportSave(gameState);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const data = importSave(importText);
    if (data) {
      onImport(data);
      onClose();
    } else {
      alert('Invalid save JSON file format.');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#141920] border border-[#242c36] rounded-xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Sticky Header: Never scrolls out of view */}
        <div className="shrink-0 bg-[#181f28] border-b border-[#242c36] px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#fa9549]" />
            <h3 className="font-industrial text-base sm:text-lg font-bold text-white tracking-wide">
              Pioneer Terminal Settings
            </h3>
            <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-[#1f2834] text-[#fa9549] font-semibold border border-[#2e3b4d]">
              v{APP_VERSION}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-[#141a22] hover:bg-[#222c3a] border border-[#2a3544] flex items-center gap-1.5 text-xs font-mono-numbers transition-colors"
          >
            <span>Close</span>
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono-numbers">

        {/* Audio Toggles */}
        <div className="space-y-3 font-mono-numbers text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Audio Configuration:
          </span>

          <div className="flex items-center justify-between bg-[#0e1216] border border-[#202732] p-3 rounded-lg">
            <span className="text-white">Mechanical Sound FX:</span>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                !gameState.audioMuted ? 'bg-[#fa9549] text-black' : 'bg-[#1b222a] text-slate-400'
              }`}
            >
              {!gameState.audioMuted ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#0e1216] border border-[#202732] p-3 rounded-lg">
            <span className="text-white">Lo-Fi Industrial Synth Drone:</span>
            <button
              onClick={onToggleAmbient}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                gameState.ambientTrack ? 'bg-cyan-500 text-black' : 'bg-[#1b222a] text-slate-400'
              }`}
            >
              {gameState.ambientTrack ? 'Playing' : 'Off'}
            </button>
          </div>
        </div>

        {/* Biome Environment Theme Picker */}
        <div className="space-y-3 font-mono-numbers text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">
              Planetary Biome Theme:
            </span>
            <span className="text-[11px] text-slate-500">MASSAGE-2(A-B)b Sectors</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BIOMES.map(b => {
              const isActive = (gameState.selectedBiome || 'grass_fields') === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBiome?.(b.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isActive
                      ? 'bg-[#1a2330] font-bold shadow-sm'
                      : 'bg-[#0e1216] border-[#202732] text-slate-400 hover:text-white hover:bg-[#151c24]'
                  }`}
                  style={{
                    borderColor: isActive ? b.accentColor : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white truncate">{b.name}</span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: b.accentColor }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 truncate">{b.sector}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seasonal FICSMAS Event Mode */}
        <div className="space-y-3 font-mono-numbers text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-red-400" />
              <span>FICSMAS Seasonal Event:</span>
            </span>
            <span className={`text-[11px] font-semibold ${isFicsmasActive(gameState) ? 'text-red-400' : 'text-slate-500'}`}>
              {getFicsmasStatusText(gameState)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'auto', label: 'Seasonal (Dec 1-31)', desc: 'Automatic in December' },
              { id: 'enabled', label: 'Always Active', desc: 'Force Event On' },
              { id: 'disabled', label: 'Disabled', desc: 'Force Event Off' },
            ].map(opt => {
              const currentMode = gameState.ficsmasMode || 'auto';
              const isSelected = currentMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSetFicsmasMode?.(opt.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1 ${
                    isSelected
                      ? 'bg-red-950/50 border-red-500 text-white font-bold shadow'
                      : 'bg-[#0e1216] border-[#202732] text-slate-400 hover:text-white hover:bg-[#151c24]'
                  }`}
                >
                  <span className="text-[11px] text-white font-semibold">{opt.label}</span>
                  <span className="text-[9px] text-slate-500">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save & Export */}
        <div className="space-y-3 font-mono-numbers text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Save Data Backup:
          </span>

          <button
            onClick={handleExport}
            className="w-full py-2.5 px-3 bg-[#1e2530] hover:bg-[#252f3d] text-white rounded-lg border border-[#242d38] flex items-center justify-center gap-2 transition-colors font-semibold"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-[#fa9549]" />}
            <span>{copied ? 'Save Copied to Clipboard!' : 'Export Save JSON (Copy)'}</span>
          </button>

          {/* Import */}
          <div className="space-y-2 pt-2">
            <textarea
              rows={2}
              placeholder="Paste save JSON string here to import..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full bg-[#0d1014] border border-[#252d37] rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#fa9549]"
            />
            <button
              onClick={handleImport}
              className="w-full py-2 bg-[#181f28] hover:bg-[#202834] text-slate-300 rounded border border-[#242d38] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import & Overwrite Save</span>
            </button>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-3 border-t border-[#242c36] font-mono-numbers text-xs">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2 px-3 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded border border-red-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Wipe Save & Reset New Pioneer Colony</span>
            </button>
          ) : (
            <div className="bg-red-950/60 border border-red-500/50 p-3 rounded-lg space-y-2 text-center">
              <span className="text-red-200 block text-xs">
                Are you sure? All factory infrastructure and milestones will be cleared.
              </span>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onReset();
                    onClose();
                  }}
                  className="px-3 py-1 bg-red-600 text-white font-bold rounded"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer & Links */}
        <div className="pt-3 border-t border-[#242c36] space-y-2 font-mono-numbers text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white font-semibold">ClickFactory v{APP_VERSION}</span>
            <div className="flex items-center gap-3">
              <a
                href="https://aethercowboy.github.io/ClickFactory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fa9549] hover:underline flex items-center gap-1"
              >
                <span>Live Project</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/aethercowboy/ClickFactory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white hover:underline flex items-center gap-1"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed bg-[#0b0e12] p-2.5 rounded-lg border border-[#1b222c]">
            <strong>Disclaimer:</strong> This is an unofficial, non-commercial fan game inspired by Satisfactory. It is in no way associated with, affiliated with, endorsed by, or sponsored by Coffee Stain Studios or Embracer Group. All Satisfactory trademarks, names, and assets references belong solely to Coffee Stain Studios.
          </p>
        </div>
      </div>

      {/* Sticky Footer: Always visible on all screen sizes */}
      <div className="shrink-0 bg-[#101419] border-t border-[#202732] px-5 sm:px-6 py-3 flex items-center justify-between gap-3 text-xs font-mono-numbers">
        <span className="text-slate-500 text-[11px] truncate hidden sm:inline">
          FICSIT Pioneer OS · ClickFactory v{APP_VERSION}
        </span>
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#fa9549] hover:bg-[#fb8533] text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Close Settings</span>
        </button>
      </div>
    </div>
  </div>
);
};
