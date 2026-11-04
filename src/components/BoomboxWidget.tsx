import React, { useState, useEffect } from 'react';
import { GameSaveData } from '../types/game';
import { audio } from '../utils/audio';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc3,
  X,
  Music,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BoomboxWidgetProps {
  gameState: GameSaveData;
  isOpen: boolean;
  onClose: () => void;
}

export const BoomboxWidget: React.FC<BoomboxWidgetProps> = ({
  gameState,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(audio.isBoomboxPlaying());
  const [currentTrackId, setCurrentTrackId] = useState<string>(audio.getCurrentBoomboxTrack());
  const [volume, setVolume] = useState<number>(audio.getBoomboxVolume());
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const tracks = audio.getBoomboxTracks();
  const currentTrack = tracks.find(t => t.id === currentTrackId) || tracks[0];

  useEffect(() => {
    const unsubscribe = audio.subscribeBoombox(() => {
      setIsPlaying(audio.isBoomboxPlaying());
      setCurrentTrackId(audio.getCurrentBoomboxTrack());
      setVolume(audio.getBoomboxVolume());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const isUnlocked = gameState.shopPurchases.includes('shop_boombox');

  if (!isUnlocked || !isOpen) return null;

  const handleTogglePlay = () => {
    audio.toggleBoombox(currentTrackId);
  };

  const handleSelectTrack = (trackId: string) => {
    setCurrentTrackId(trackId);
    audio.playBoombox(trackId);
  };

  const handleNextTrack = () => {
    const curIdx = tracks.findIndex(t => t.id === currentTrackId);
    const nextIdx = (curIdx + 1) % tracks.length;
    handleSelectTrack(tracks[nextIdx].id);
  };

  const handlePrevTrack = () => {
    const curIdx = tracks.findIndex(t => t.id === currentTrackId);
    const prevIdx = (curIdx - 1 + tracks.length) % tracks.length;
    handleSelectTrack(tracks[prevIdx].id);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audio.setBoomboxVolume(val);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#12171e] border-2 border-[#fa9549]/80 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] w-84 sm:w-96 overflow-hidden font-sans">
        {/* Top Industrial Hazard Grip Strip */}
        <div className="bg-[#19212c] border-b border-[#293544] px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fa9549] animate-pulse" />
            <span className="font-bold tracking-wider text-white text-[11px] uppercase font-mono-numbers">
              FICSIT BB-84 Cassette Boombox
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:bg-[#253242] text-slate-400 hover:text-white transition-colors"
              title={isMinimized ? 'Expand Boombox' : 'Minimize Boombox'}
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#253242] text-slate-400 hover:text-white transition-colors"
              title="Close Boombox"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cassette Tape Deck Header (Visible even when minimized) */}
        <div className="p-4 bg-[#0d1217]">
          {/* Cassette tape chassis */}
          <div className="bg-[#161d26] border border-[#2b3848] rounded-xl p-3 relative shadow-inner">
            {/* Magnetic Tape Viewport */}
            <div className="bg-[#090d12] border border-[#232c38] rounded-lg p-2.5 flex items-center justify-between relative overflow-hidden">
              {/* Left reel */}
              <div className="flex items-center gap-3 z-10">
                <div
                  className={`w-9 h-9 rounded-full border-2 border-slate-600 bg-[#161c24] flex items-center justify-center transition-transform duration-700 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '3s' }}
                >
                  <Disc3 className="w-6 h-6 text-slate-400" />
                </div>

                {/* Tape Counter */}
                <div className="bg-black/60 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono-numbers text-[#fa9549]">
                  {isPlaying ? 'REC ▶ 04:20' : 'STOP ■ 00:00'}
                </div>
              </div>

              {/* Central window label */}
              <div className="text-center z-10 px-2">
                <div className="text-[10px] uppercase font-mono-numbers text-slate-400">Tape Side A</div>
                <div className="text-xs font-bold text-white truncate max-w-[130px]">
                  {currentTrack.title}
                </div>
              </div>

              {/* Right reel */}
              <div className="z-10">
                <div
                  className={`w-9 h-9 rounded-full border-2 border-slate-600 bg-[#161c24] flex items-center justify-center transition-transform duration-700 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '3s' }}
                >
                  <Disc3 className="w-6 h-6 text-slate-400" />
                </div>
              </div>

              {/* Tape ribbon animation background */}
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fa9549]/10 to-transparent pointer-events-none animate-pulse" />
              )}
            </div>

            {/* Track Info Badge */}
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] font-semibold text-white block">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-[#fa9549] font-mono-numbers">
                  {currentTrack.genre} • {currentTrack.bpm} BPM
                </span>
              </div>

              {/* Equalizer animation bars */}
              <div className="flex items-end gap-0.5 h-4">
                {[1, 2, 3, 4, 5].map(bar => (
                  <div
                    key={bar}
                    className={`w-1 bg-[#fa9549] rounded-t transition-all ${
                      isPlaying ? 'animate-pulse' : 'h-1 opacity-30'
                    }`}
                    style={{
                      height: isPlaying ? `${(bar * 20) % 100}%` : '4px',
                      animationDelay: `${bar * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Play Controls */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevTrack}
                className="p-2 rounded-lg bg-[#1b232e] hover:bg-[#253140] text-slate-300 hover:text-white transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className={`p-2.5 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center ${
                  isPlaying
                    ? 'bg-[#fa9549] text-black shadow-lg shadow-[#fa9549]/30'
                    : 'bg-white hover:bg-slate-200 text-black'
                }`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 rounded-lg bg-[#1b232e] hover:bg-[#253140] text-slate-300 hover:text-white transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-2 flex-1 max-w-[130px]">
              <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-[#fa9549] h-1.5 bg-[#253242] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Expanded Cassette Selector Tray */}
        {!isMinimized && (
          <div className="bg-[#10141a] border-t border-[#1f2835] p-3 max-h-48 overflow-y-auto space-y-1.5">
            <div className="text-[10px] uppercase font-mono-numbers text-slate-500 font-bold px-1 mb-1">
              Cassette Library ({tracks.length} Tapes)
            </div>

            {tracks.map(t => {
              const isSelected = t.id === currentTrackId;

              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrack(t.id)}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#1b2532] border-[#fa9549]/60 text-white shadow-sm'
                      : 'bg-[#141a22] border-[#222b37] text-slate-400 hover:text-slate-200 hover:bg-[#18202a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Music className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#fa9549]' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <div className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {t.description}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-numbers shrink-0 ${
                    isSelected && isPlaying
                      ? 'bg-[#fa9549]/20 text-[#fa9549] border border-[#fa9549]/40 font-bold'
                      : 'bg-[#0e1217] text-slate-500'
                  }`}>
                    {isSelected && isPlaying ? 'PLAYING' : `${t.bpm} BPM`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
