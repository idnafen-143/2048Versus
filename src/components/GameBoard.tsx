import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tile, PlayerState, GameSettings } from '../types';
import { Flame, Trophy, Award, Keyboard, AlertTriangle, Cpu } from 'lucide-react';

interface GameBoardProps {
  player: PlayerState;
  settings: GameSettings;
  isP1: boolean;
}

// Function to get tile styling based on value and player theme
const getTileStyles = (val: number, isP1: boolean): { bgClass: string; textClass: string; glowClass: string } => {
  if (isP1) {
    // Player 1: Cyber Cyan & Orange Theme
    switch (val) {
      case 2:
        return {
          bgClass: 'bg-[#111] border border-cyan-500/10 text-cyan-400/40',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 4:
        return {
          bgClass: 'bg-[#111] border border-cyan-500/20 text-cyan-400/60',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 8:
        return {
          bgClass: 'bg-[#111] border border-cyan-500/30 text-cyan-400/80',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 16:
        return {
          bgClass: 'bg-[#1c1c1e] border border-cyan-400/40 text-cyan-300',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 32:
        return {
          bgClass: 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-200',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 64:
        return {
          bgClass: 'bg-cyan-900/40 border border-cyan-400 text-cyan-100',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 128:
        return {
          bgClass: 'bg-cyan-800 border border-cyan-300 text-white',
          textClass: 'text-xs sm:text-base md:text-xl font-black italic',
          glowClass: ''
        };
      case 256:
        return {
          bgClass: 'bg-cyan-700 text-white',
          textClass: 'text-xs sm:text-base md:text-xl font-black italic',
          glowClass: 'shadow-md shadow-cyan-500/10'
        };
      case 512:
        return {
          bgClass: 'bg-cyan-500 text-black',
          textClass: 'text-xs sm:text-base md:text-xl font-black italic',
          glowClass: 'shadow-lg shadow-cyan-500/20'
        };
      case 1024:
        return {
          bgClass: 'bg-orange-500 text-white border border-orange-300',
          textClass: 'text-[10px] sm:text-xs md:text-base lg:text-lg font-black italic tracking-tighter',
          glowClass: 'shadow-xl shadow-orange-500/30'
        };
      case 2048:
        return {
          bgClass: 'bg-white text-orange-500 border-2 border-orange-500',
          textClass: 'text-[10px] sm:text-xs md:text-base lg:text-lg font-black italic tracking-tighter',
          glowClass: 'shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse'
        };
      default:
        // 4096+
        return {
          bgClass: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black',
          textClass: 'text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-black italic tracking-tighter',
          glowClass: 'shadow-[0_0_30px_rgba(249,115,22,0.5)]'
        };
    }
  } else {
    // Player 2: Neon Rose & Orange Theme
    switch (val) {
      case 2:
        return {
          bgClass: 'bg-[#111] border border-rose-500/10 text-rose-400/40',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 4:
        return {
          bgClass: 'bg-[#111] border border-rose-500/20 text-rose-400/60',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 8:
        return {
          bgClass: 'bg-[#111] border border-rose-500/30 text-rose-400/80',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 16:
        return {
          bgClass: 'bg-[#1c1c1e] border border-rose-400/40 text-rose-300',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 32:
        return {
          bgClass: 'bg-rose-950/40 border border-rose-500/50 text-rose-200',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 64:
        return {
          bgClass: 'bg-rose-900/40 border border-rose-400 text-rose-100',
          textClass: 'text-sm sm:text-lg md:text-2xl font-black italic',
          glowClass: ''
        };
      case 128:
        return {
          bgClass: 'bg-rose-800 border border-rose-300 text-white',
          textClass: 'text-xs sm:text-base md:text-xl font-black italic',
          glowClass: ''
        };
      case 256:
        return {
          bgClass: 'bg-rose-700 text-white',
          textClass: 'text-xs sm:text-base md:text-xl font-black italic',
          glowClass: 'shadow-md shadow-rose-500/10'
        };
      case 512:
        return {
          bgClass: 'bg-rose-500 text-black',
          textClass: 'text-xs sm:text-base md:text-xl font-black italic',
          glowClass: 'shadow-lg shadow-rose-500/20'
        };
      case 1024:
        return {
          bgClass: 'bg-orange-500 text-white border border-orange-300',
          textClass: 'text-[10px] sm:text-xs md:text-base lg:text-lg font-black italic tracking-tighter',
          glowClass: 'shadow-xl shadow-orange-500/30'
        };
      case 2048:
        return {
          bgClass: 'bg-white text-orange-500 border-2 border-orange-500',
          textClass: 'text-[10px] sm:text-xs md:text-base lg:text-lg font-black italic tracking-tighter',
          glowClass: 'shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse'
        };
      default:
        // 4096+
        return {
          bgClass: 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black',
          textClass: 'text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-black italic tracking-tighter',
          glowClass: 'shadow-[0_0_30px_rgba(249,115,22,0.5)]'
        };
    }
  }
};

interface GameBoardProps {
  player: PlayerState;
  settings: GameSettings;
  isP1: boolean;
  onMove?: (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ player, settings, isP1, onMove }) => {
  const { board, score, movesCount, maxTile, inactivityTimer, isGameOver, isWon, eliminated, currentLap, lapTarget } = player;

  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !onMove) return;
    if (e.changedTouches.length !== 1) return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < 30) return;

    if (absX > absY) {
      if (deltaX > 0) {
        onMove('RIGHT');
      } else {
        onMove('LEFT');
      }
    } else {
      if (deltaY > 0) {
        onMove('DOWN');
      } else {
        onMove('UP');
      }
    }
  };

  // Survivor Mode variables
  const isSurvivor = settings.mode === 'SURVIVOR';
  const isWarningState = isSurvivor && inactivityTimer <= 5;
  const timerPercentage = isSurvivor ? (inactivityTimer / 15) * 100 : 100;

  const boardBgStyle = 'bg-white/5 border border-white/10 rounded-none';

  // Keyboard configuration prompt helper
  const renderControlsIndicator = () => {
    if (isP1) {
      return (
        <div className="flex gap-1.5 justify-start items-center font-mono text-[10px] uppercase opacity-50">
          <div className="flex gap-1">
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">
              {settings.p1Layout === 'ZSQD' ? 'Z' : 'W'}
            </span>
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">S</span>
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">
              {settings.p1Layout === 'ZSQD' ? 'Q' : 'A'}
            </span>
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">D</span>
          </div>
          <span className="ml-1 text-[9px]">P1 Input</span>
        </div>
      );
    } else {
      if (settings.aiEnabled) {
        return (
          <div className="flex gap-1.5 justify-start items-center font-mono text-[10px] uppercase text-orange-500">
            <Cpu className="w-3 h-3 animate-pulse" />
            <span className="text-[9px]">Bot ({settings.aiDifficulty})</span>
          </div>
        );
      }
      return (
        <div className="flex gap-1.5 justify-start items-center font-mono text-[10px] uppercase opacity-50">
          <div className="flex gap-1">
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">↑</span>
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">↓</span>
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">←</span>
            <span className="w-5 h-5 border border-white/20 flex items-center justify-center text-[9px] bg-white/5">→</span>
          </div>
          <span className="ml-1 text-[9px]">P2 Input</span>
        </div>
      );
    }
  };

  return (
    <div 
      className="flex flex-col w-full mx-auto"
      style={{ maxWidth: 'min(44vw, 34vh)' }}
    >
      {/* 1. Header Information Area */}
      <div className="flex flex-col gap-1 w-full mb-2 px-0.5">
        {/* Main Row: Badge & Score */}
        <div className="flex justify-between items-center w-full gap-2">
          {/* Skewed Badge Title */}
          <div className={`px-2 py-0.5 sm:px-3 sm:py-1 flex items-center justify-center shrink-0 ${
            isP1 
              ? 'bg-white text-black skew-x-[-12deg]' 
              : 'bg-orange-500 text-black skew-x-[12deg]'
          }`}>
            <span className={`block font-black text-[9px] sm:text-xs uppercase tracking-wider ${
              isP1 ? 'skew-x-[12deg]' : 'skew-x-[-12deg]'
            }`}>
              {player.name === 'Player 1' ? 'P1' : player.name === 'Player 2' ? 'P2' : player.name}
            </span>
          </div>

          {/* Score Counter */}
          <div className="text-right flex items-baseline justify-end gap-1 select-none">
            <span className="text-[7px] sm:text-[9px] uppercase tracking-widest opacity-40 font-mono">Score</span>
            <span className="text-sm sm:text-lg md:text-xl font-black italic tabular-nums leading-none text-[#EDEDEF]">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Secondary Row: Moves & Targets */}
        <div className="flex justify-between items-center text-[7.5px] sm:text-[9px] font-mono text-white/40 uppercase font-bold px-0.5">
          <div>Moves: {movesCount}</div>
          <div className="flex gap-2">
            {settings.mode === 'RACE' && settings.lapsEnabled && (
              <span>Lap {currentLap}/{settings.maxLaps}</span>
            )}
            <span>Goal: {settings.mode === 'RACE' ? lapTarget : '2048'}</span>
          </div>
        </div>
      </div>

      {/* 2. Survivor Mode Progress Bar */}
      {isSurvivor && (
        <div className="w-full h-1 bg-white/10 overflow-hidden mb-2 relative">
          <motion.div
            className={`h-full ${
              isWarningState
                ? 'bg-orange-500 animate-pulse'
                : 'bg-white'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${timerPercentage}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      {/* 3. Main Game 4x4 Grid Board */}
      <motion.div
        className={`relative aspect-square w-full p-1 sm:p-1.5 md:p-2 border flex flex-col justify-between overflow-hidden select-none ${boardBgStyle} ${
          isWarningState && !eliminated && !isGameOver && !isWon
            ? 'border-orange-500'
            : 'border-white/10'
        }`}
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        animate={isWarningState && !eliminated && !isGameOver && !isWon ? {
          x: [0, -2, 2, -2, 2, 0],
          y: [0, 1, -1, 1, -1, 0],
          transition: { repeat: Infinity, duration: 0.15 }
        } : {}}
      >
        {/* Background Grid Cells */}
        <div className="absolute inset-0 p-1 sm:p-1.5 md:p-2 grid grid-cols-4 grid-rows-4 gap-1 sm:gap-1.5 md:gap-2 pointer-events-none">
          {Array(16)
            .fill(null)
            .map((_, i) => (
              <div
                key={`empty-${i}`}
                className="bg-[#111] transition-all duration-300"
              />
            ))}
        </div>

        {/* Dynamic Flying/Merging Game Tiles */}
        <div className="absolute inset-0 p-1 sm:p-1.5 md:p-2 grid grid-cols-4 grid-rows-4 gap-1 sm:gap-1.5 md:gap-2">
          <AnimatePresence>
            {board.map((tile) => {
              const { bgClass, textClass, glowClass } = getTileStyles(tile.value, isP1);
              return (
                <motion.div
                  layout
                  key={tile.id}
                  id={`tile-el-${tile.id}`}
                  style={{
                    gridRowStart: tile.row + 1,
                    gridColumnStart: tile.col + 1,
                  }}
                  initial={
                    tile.isNew
                      ? { scale: 0.5, opacity: 0 }
                      : false
                  }
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 30,
                  }}
                  className={`w-full h-full flex items-center justify-center text-center select-none font-bold transition-all ${bgClass} ${glowClass}`}
                >
                  <span className={`${textClass}`}>{tile.value}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 4. Overlay States (Win, Defeat, Eliminated, Game Over) */}
        <AnimatePresence>
          {/* Survivor Inactivity warning flasher overlay */}
          {isSurvivor && inactivityTimer <= 5 && !eliminated && !isGameOver && !isWon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 flex flex-col justify-center items-center pointer-events-none z-10"
            >
              <div className="flex flex-col items-center bg-[#0A0A0B] border border-orange-500 px-6 py-4 text-center">
                <AlertTriangle className="w-8 h-8 text-orange-500 mb-1" />
                <div className="text-[9px] font-mono tracking-widest text-orange-500 font-bold uppercase">
                  Time Warning
                </div>
                <div className="text-5xl font-black text-white font-mono mt-1">
                  {Math.ceil(inactivityTimer)}s
                </div>
              </div>
            </motion.div>
          )}

          {/* Won Overlay */}
          {isWon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0A0A0B]/95 flex flex-col justify-center items-center z-20 p-6 text-center"
            >
              <div className="bg-white text-black px-4 py-1.5 skew-x-[-12deg] mb-3">
                <span className="block skew-x-[12deg] font-black text-xs uppercase tracking-widest">VICTORY</span>
              </div>
              <p className="text-xs text-white/70 max-w-xs mt-2 font-mono">
                Reached target <span className="font-extrabold text-orange-500">{settings.mode === 'RACE' ? lapTarget : '2048'}</span> in {movesCount} moves!
              </p>
              <div className="text-xs text-white/40 font-mono mt-3">
                Score: <span className="text-white font-bold">{score}</span>
              </div>
            </motion.div>
          )}

          {/* Eliminated Overlay */}
          {eliminated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0A0A0B]/95 flex flex-col justify-center items-center z-20 p-6 text-center border border-orange-500"
            >
              <div className="bg-orange-500 text-black px-4 py-1.5 skew-x-[-12deg] mb-3">
                <span className="block skew-x-[12deg] font-black text-xs uppercase tracking-widest">ELIMINATED</span>
              </div>
              <p className="text-xs text-white/70 font-mono mt-1 max-w-xs">
                Time limit reached.
              </p>
            </motion.div>
          )}

          {/* Game Over (Locked Grid) Overlay */}
          {isGameOver && !isWon && !eliminated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0A0A0B]/95 flex flex-col justify-center items-center z-20 p-6 text-center"
            >
              <div className="bg-white/10 text-white px-4 py-1.5 skew-x-[-12deg] mb-3">
                <span className="block skew-x-[12deg] font-black text-xs uppercase tracking-widest">GAME OVER</span>
              </div>
              <p className="text-xs text-white/60 mt-1 max-w-xs font-mono">
                No legal moves remaining on this grid.
              </p>
              <div className="text-xs text-white/40 font-mono mt-3">
                Highest Tile: <span className="text-white font-bold">{maxTile}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 5. Sub-indicator footer showing keybinding help */}
      <div className="mt-1.5 sm:mt-2 flex justify-between items-center px-0.5">
        <div className="hidden sm:block">
          {renderControlsIndicator()}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 ml-auto">
          <span>Max:</span>
          <span className="font-bold text-orange-500">{maxTile}</span>
        </div>
      </div>
    </div>
  );
};
