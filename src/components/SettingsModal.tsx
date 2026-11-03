import React, { useState } from 'react';
import { GameSaveData } from '../types/game';
import { exportSave, importSave, INITIAL_SAVE } from '../utils/saveLoad';
import { Settings, Download, Upload, RotateCcw, Volume2, VolumeX, Check, ExternalLink } from 'lucide-react';
import { audio } from '../utils/audio';
import { APP_VERSION } from '../version';

interface SettingsModalProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
  onImport: (newData: GameSaveData) => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleAmbient: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onImport,
  onReset,
  onToggleSound,
  onToggleAmbient,
}) => {
  const [importText, setImportText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141920] border border-[#242c36] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#242c36] pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#fa9549]" />
            <h3 className="font-industrial text-lg font-bold text-white tracking-wide">
              Pioneer Terminal Settings
            </h3>
            <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-[#1f2834] text-[#fa9549] font-semibold border border-[#2e3b4d]">
              v{APP_VERSION}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-mono-numbers px-2 py-1 rounded hover:bg-[#1c232c]"
          >
            Close
          </button>
        </div>

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
    </div>
  );
};
