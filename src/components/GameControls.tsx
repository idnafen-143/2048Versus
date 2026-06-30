import React from 'react';
import { GameSettings, GameMode } from '../types';
import { 
  Trophy, 
  Flame, 
  Settings2, 
  HelpCircle, 
  Keyboard, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Shuffle,
  Play
} from 'lucide-react';

interface GameControlsProps {
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  onStartGame: () => void;
  highScore: number;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  settings, 
  setSettings, 
  onStartGame,
  highScore 
}) => {

  const handleModeChange = (mode: GameMode) => {
    setSettings(prev => ({
      ...prev,
      mode,
      // Default to logical values
      targetValue: mode === 'RACE' ? 2048 : prev.targetValue
    }));
  };

  const toggleLaps = () => {
    setSettings(prev => ({ ...prev, lapsEnabled: !prev.lapsEnabled }));
  };

  const handleP1Layout = (layout: 'WASD' | 'ZSQD') => {
    setSettings(prev => ({ ...prev, p1Layout: layout }));
  };

  const toggleAI = () => {
    setSettings(prev => ({ ...prev, aiEnabled: !prev.aiEnabled }));
  };

  const handleAIDifficulty = (diff: 'EASY' | 'MEDIUM' | 'HARD' | 'GOD') => {
    setSettings(prev => ({ ...prev, aiDifficulty: diff }));
  };

  const toggleAudio = () => {
    setSettings(prev => ({ ...prev, audioMuted: !prev.audioMuted }));
  };

  const toggleSyncedRNG = () => {
    setSettings(prev => ({ ...prev, syncedRNG: !prev.syncedRNG }));
  };

  const handleTargetValue = (val: number) => {
    setSettings(prev => ({ ...prev, targetValue: val }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0A0A0B] border border-white/10 rounded-none p-4 md:p-5 relative">
      {/* Header */}
      <div className="relative z-10 flex justify-between items-end border-b border-white/5 pb-3 mb-4">
        <div className="flex flex-col">
          {/* Skewed Badge Title */}
          <div className="bg-orange-500 text-black px-3 py-1 skew-x-[-12deg] w-fit">
            <span className="block skew-x-[12deg] font-black text-[10px] uppercase tracking-widest">Match Rules</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none mt-1.5">
            Game Setup
          </h1>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[8px] uppercase tracking-widest opacity-40 leading-none mb-1">Global High Score</p>
          <p className="text-lg font-mono font-bold text-orange-500 tracking-tighter underline underline-offset-4 decoration-1">
            {highScore.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* LEFT COLUMN: GAME MODE SELECTOR */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-orange-500 uppercase font-mono">
              Game Mode
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Race Mode Button */}
              <button
                type="button"
                onClick={() => handleModeChange('RACE')}
                className={`relative flex flex-col items-start p-4 rounded-none border text-left transition-all cursor-pointer ${
                  settings.mode === 'RACE'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#111] border-white/10 text-[#EDEDEF]/60 hover:text-[#EDEDEF] hover:border-white/20'
                }`}
              >
                <Trophy className="w-5 h-5 mb-2" />
                <span className="text-xs font-black uppercase tracking-wide">Race Mode</span>
                <span className="text-[9px] font-mono mt-1 opacity-60">First to target tile wins</span>
              </button>

              {/* Survivor Mode Button */}
              <button
                type="button"
                onClick={() => handleModeChange('SURVIVOR')}
                className={`relative flex flex-col items-start p-4 rounded-none border text-left transition-all cursor-pointer ${
                  settings.mode === 'SURVIVOR'
                    ? 'bg-orange-500 text-black border-orange-500'
                    : 'bg-[#111] border-white/10 text-[#EDEDEF]/60 hover:text-[#EDEDEF] hover:border-white/20'
                }`}
              >
                <Flame className="w-5 h-5 mb-2" />
                <span className="text-xs font-black uppercase tracking-wide">Survivor</span>
                <span className="text-[9px] font-mono mt-1 opacity-60">15s countdown rules</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC MODE CONFIGS */}
          <div className="bg-white/5 border border-white/10 rounded-none p-4 min-h-[145px] flex flex-col justify-center">
            {settings.mode === 'RACE' ? (
              <div className="flex flex-col gap-4">
                {/* Target Score Choice */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black font-mono text-white/40 uppercase tracking-widest">
                      Target Tile
                    </span>
                    <span className="text-xs font-black text-orange-500 font-mono italic">{settings.targetValue}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[512, 1024, 2048, 4096].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleTargetValue(val)}
                        className={`py-1 text-[10px] font-black font-mono rounded-none border transition-all cursor-pointer ${
                          settings.targetValue === val
                            ? 'bg-orange-500 text-black border-orange-500'
                            : 'bg-[#111] border-white/5 text-white/50 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Laps (escalating targets) */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                      Multi-Lap Mode
                    </span>
                    <span className="text-[8px] text-white/30 font-mono">Target doubles on each completion</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleLaps}
                    className={`relative w-10 h-5 rounded-none transition-colors cursor-pointer ${
                      settings.lapsEnabled ? 'bg-orange-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black transition-transform ${
                        settings.lapsEnabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center gap-1.5 text-orange-500 font-black text-xs font-mono uppercase">
                  <Flame className="w-3.5 h-3.5" /> Survival Mode
                </div>
                <p className="text-[10px] text-white/60 font-mono leading-relaxed mt-1">
                  Both players have a 15-second timer. Each move resets your countdown.
                </p>
                <p className="text-[10px] text-white/30 font-mono leading-relaxed mt-1">
                  If the timer hits zero or you run out of valid moves, you are eliminated. Last player surviving wins!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PLAYER & GAMEPLAY SETTINGS */}
        <div className="flex flex-col gap-5">
          {/* PLAYER 1 CONTROLS CONFIG */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-orange-500 uppercase font-mono flex items-center gap-1.5">
              Player 1 Controls
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleP1Layout('WASD')}
                className={`py-2 px-3 text-xs font-black font-mono rounded-none border transition-all cursor-pointer ${
                  settings.p1Layout === 'WASD'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#111] border-white/5 text-white/50 hover:text-white'
                }`}
              >
                QWERTY (WASD)
              </button>
              <button
                type="button"
                onClick={() => handleP1Layout('ZSQD')}
                className={`py-2 px-3 text-xs font-black font-mono rounded-none border transition-all cursor-pointer ${
                  settings.p1Layout === 'ZSQD'
                    ? 'bg-white text-black border-white'
                    : 'bg-[#111] border-white/5 text-white/50 hover:text-white'
                }`}
              >
                AZERTY (ZSQD)
              </button>
            </div>
          </div>

          {/* PLAYER 2 / AI TOGGLE */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black tracking-widest text-orange-500 uppercase font-mono flex items-center gap-1.5">
                Opponent Setup
              </label>
              <button
                type="button"
                onClick={toggleAI}
                className={`text-[9px] font-black font-mono uppercase px-2 py-0.5 rounded-none border ${
                  settings.aiEnabled
                    ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                    : 'bg-white/10 border-white/10 text-white/50'
                }`}
              >
                {settings.aiEnabled ? 'VS Bot' : 'Local 2P'}
              </button>
            </div>

            {settings.aiEnabled ? (
              <div className="grid grid-cols-4 gap-1">
                {(['EASY', 'MEDIUM', 'HARD', 'GOD'] as const).map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => handleAIDifficulty(diff)}
                    className={`py-1.5 text-[9px] font-black font-mono rounded-none border transition-all cursor-pointer ${
                      settings.aiDifficulty === diff
                        ? 'bg-orange-500 text-black border-orange-500'
                        : 'bg-[#111] border-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-white/40 font-mono bg-white/5 rounded-none p-2.5 border border-white/10 leading-relaxed">
                Play locally split-screen. Player 2 uses Arrow Keys (↑ ↓ ← →).
              </div>
            )}
          </div>

          {/* SYNCED SEED / FAIR RNG TOGGLE */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-none p-3">
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-[9px] font-black font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                Synced Tile Spawns
              </span>
              <span className="text-[8px] text-white/30 font-mono leading-tight">
                Both boards spawn identical tiles in the same locations for a fair matchup.
              </span>
            </div>
            <button
              type="button"
              onClick={toggleSyncedRNG}
              className={`relative w-10 h-5 rounded-none transition-colors shrink-0 cursor-pointer ${
                settings.syncedRNG ? 'bg-orange-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black transition-transform ${
                  settings.syncedRNG ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM CONTROL RAMP (Mute + Play) */}
      <div className="relative z-10 border-t border-white/5 mt-6 pt-5 flex items-center justify-between gap-4 flex-wrap">
        {/* Sound Toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/40 hover:text-white cursor-pointer transition-all bg-white/5 border border-white/10 rounded-none px-3 py-2"
        >
          {settings.audioMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-orange-500" />
              <span>Sound Effects: OFF</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-white" />
              <span>Sound Effects: ON</span>
            </>
          )}
        </button>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="bg-white text-black font-black italic uppercase tracking-tighter text-sm px-6 py-3.5 skew-x-[-12deg] hover:bg-orange-500 hover:text-black transition-all duration-300 cursor-pointer flex items-center gap-2"
        >
          <span className="block skew-x-[12deg] flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-black stroke-none" /> Start Game
          </span>
        </button>
      </div>
    </div>
  );
};
