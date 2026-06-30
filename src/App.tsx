import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tile, GameSettings, PlayerState, MoveDirection } from './types';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { 
  initializeBoard, 
  executeMove, 
  canMove, 
  selectBestAIMove, 
  FairSpawnGenerator 
} from './engine';
import { 
  playSlideSound, 
  playMergeSound, 
  playWarningTickSound, 
  playDefeatSound, 
  playVictorySound, 
  playStartSound, 
  toggleAudioMute 
} from './audio';
import { 
  Trophy, 
  Flame, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Home, 
  Zap, 
  AlertOctagon,
  Tv,
  HelpCircle,
  X
} from 'lucide-react';

export default function App() {
  // 1. Core Settings & App State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('2048_vs_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [settings, setSettings] = useState<GameSettings>({
    mode: 'RACE',
    targetValue: 2048,
    lapsEnabled: false,
    maxLaps: 3,
    syncedRNG: true,
    p1Layout: 'WASD',
    aiEnabled: false,
    aiDifficulty: 'MEDIUM',
    audioMuted: false
  });

  // Player Grid States
  const [p1, setP1] = useState<PlayerState>({
    id: 'p1',
    name: 'Player 1',
    board: [],
    score: 0,
    movesCount: 0,
    maxTile: 0,
    currentLap: 1,
    lapTarget: 2048,
    isGameOver: false,
    isWon: false,
    eliminated: false,
    lastMoveTime: 0,
    inactivityTimer: 15.0
  });

  const [p2, setP2] = useState<PlayerState>({
    id: 'p2',
    name: 'Player 2',
    board: [],
    score: 0,
    movesCount: 0,
    maxTile: 0,
    currentLap: 1,
    lapTarget: 2048,
    isGameOver: false,
    isWon: false,
    eliminated: false,
    lastMoveTime: 0,
    inactivityTimer: 15.0
  });

  // Match Overlord States
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string>('Welcome to 2048 VS! Choose your parameters and launch.');
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const formatElapsed = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);
    const hundredths = Math.floor((ms % 1000) / 10);
    const pad = (val: number) => val.toString().padStart(2, '0');
    return `${pad(m)}:${pad(s)}.${pad(hundredths)}`;
  };

  // Synced Seed References
  const fairGenRef = useRef<FairSpawnGenerator | null>(null);
  const audioInitializedRef = useRef<boolean>(false);

  // Sync refs to avoid interval teardown in high-frequency loops
  const p1Ref = useRef(p1);
  const p2Ref = useRef(p2);

  useEffect(() => {
    p1Ref.current = p1;
  }, [p1]);

  useEffect(() => {
    p2Ref.current = p2;
  }, [p2]);

  // 2. Initialize Audio preference from settings
  useEffect(() => {
    toggleAudioMute(settings.audioMuted);
  }, [settings.audioMuted]);

  // 2.2 Global Match Elapsed Ticker
  useEffect(() => {
    if (!isPlaying || matchWinner) return;
    const start = Date.now() - elapsedMs;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 47);
    return () => clearInterval(interval);
  }, [isPlaying, matchWinner]);

  // Push elegant alerts to the commentators feed
  const postCommentary = (text: string) => {
    setCommentary(text);
  };

  // 3. Start a Fresh Game Match
  const handleStartGame = () => {
    setElapsedMs(0);
    // Lazy audio context trigger
    if (!audioInitializedRef.current) {
      playStartSound();
      audioInitializedRef.current = true;
    } else {
      playStartSound();
    }

    // Set up Fair Seed Generator if required
    const randomSeed = Math.floor(Math.random() * 99999) + 1;
    fairGenRef.current = settings.syncedRNG ? new FairSpawnGenerator(randomSeed) : null;

    // Build fresh boards
    // If synced RNG is enabled, use offset 0 for P1 and offset 0 for P2 (they get the exact same sequence!)
    const p1InitialBoard = initializeBoard(fairGenRef.current || undefined, 0);
    const p2InitialBoard = initializeBoard(fairGenRef.current || undefined, 0);

    const initialP1State: PlayerState = {
      id: 'p1',
      name: 'Player 1',
      board: p1InitialBoard,
      score: 0,
      movesCount: 0,
      maxTile: Math.max(...p1InitialBoard.map(t => t.value)),
      currentLap: 1,
      lapTarget: settings.targetValue,
      isGameOver: false,
      isWon: false,
      eliminated: false,
      lastMoveTime: Date.now(),
      inactivityTimer: 15.0
    };

    const initialP2State: PlayerState = {
      id: 'p2',
      name: settings.aiEnabled ? 'Computer AI' : 'Player 2',
      board: p2InitialBoard,
      score: 0,
      movesCount: 0,
      maxTile: Math.max(...p2InitialBoard.map(t => t.value)),
      currentLap: 1,
      lapTarget: settings.targetValue,
      isGameOver: false,
      isWon: false,
      eliminated: false,
      lastMoveTime: Date.now(),
      inactivityTimer: 15.0
    };

    setP1(initialP1State);
    setP2(initialP2State);
    setMatchWinner(null);
    setIsPlaying(true);

    const modeLabel = settings.mode === 'RACE' 
      ? `Race Mode (First to reach ${settings.targetValue} wins!)` 
      : 'Survivor Mode (Keep moving or face instant timeout elimination!)';
    postCommentary(`Match launched: ${modeLabel}. Fight!`);
  };

  // Quit match and return to parameters panel
  const handleQuitGame = () => {
    setIsPlaying(false);
    setMatchWinner(null);
    postCommentary('Welcome back to the match lobby. Adjust settings and replay!');
  };

  // 4. Game-over evaluation logic
  const evaluateWinner = useCallback(() => {
    // If a winner is already locked, skip
    if (matchWinner) return;

    const state1 = p1;
    const state2 = p2;

    // Scenario A: Double victory
    if (state1.isWon && state2.isWon) {
      if (state1.score > state2.score) {
        setMatchWinner('Player 1 Wins (Higher Score!)');
        playVictorySound();
        postCommentary('Epic! Both reached the target, but Player 1 conquers via higher score!');
      } else if (state2.score > state1.score) {
        setMatchWinner(`${state2.name} Wins (Higher Score!)`);
        playVictorySound();
        postCommentary(`Epic! Both reached the target, but ${state2.name} conquers via higher score!`);
      } else {
        setMatchWinner('Match Tied! Perfect Symmetry.');
        playVictorySound();
        postCommentary('Double flawless! The score is identical. A perfect draw!');
      }
      return;
    }

    // Scenario B: Single victory
    if (state1.isWon) {
      setMatchWinner('Player 1 Wins!');
      playVictorySound();
      postCommentary('VICTORY! Player 1 reached the ultimate target tile! Stellar match.');
      return;
    }
    if (state2.isWon) {
      setMatchWinner(`${state2.name} Wins!`);
      playVictorySound();
      postCommentary(`VICTORY! ${state2.name} reached the ultimate target tile! Massive play.`);
      return;
    }

    // Scenario C: Timeout/Disqualification (Survivor Mode)
    if (settings.mode === 'SURVIVOR') {
      if (state1.eliminated && state2.eliminated) {
        setMatchWinner('Double DQ! Draw.');
        playDefeatSound();
        postCommentary('Unbelievable! Both players timed out in the danger zone. No winners.');
        return;
      }
      if (state1.eliminated) {
        setMatchWinner(`${state2.name} Wins!`);
        playVictorySound();
        postCommentary(`Match Over: Player 1 was disqualified for inactivity! ${state2.name} survives.`);
        return;
      }
      if (state2.eliminated) {
        setMatchWinner('Player 1 Wins!');
        playVictorySound();
        postCommentary(`Match Over: ${state2.name} was disqualified for inactivity! Player 1 survives.`);
        return;
      }
    }

    // Scenario D: Grid locks (No moves left)
    if (state1.isGameOver && state2.isGameOver) {
      if (state1.score > state2.score) {
        setMatchWinner('Player 1 Wins (Grid Locked!)');
        playVictorySound();
        postCommentary('Both grids locked! Player 1 secures the crown with a superior score.');
      } else if (state2.score > state1.score) {
        setMatchWinner(`${state2.name} Wins (Grid Locked!)`);
        playVictorySound();
        postCommentary(`Both grids locked! ${state2.name} secures the crown with a superior score.`);
      } else {
        setMatchWinner('Match Tied (Both Grids Locked!)');
        playDefeatSound();
        postCommentary('Absolute grid deadlock with identical scores! A tie for the history books.');
      }
      return;
    }

    if (state1.isGameOver && !state2.isGameOver && settings.mode === 'RACE') {
      // In race mode, if one grid locks, the other keeps playing until they win or lock
      postCommentary('Player 1 grid locked! Player 2 can secure the lead unhindered.');
    }
    if (state2.isGameOver && !state1.isGameOver && settings.mode === 'RACE') {
      postCommentary(`${state2.name} grid locked! Player 1 can secure the lead unhindered.`);
    }
  }, [p1, p2, settings.mode, matchWinner]);

  // Reactive Match Evaluator Hook
  useEffect(() => {
    if (!isPlaying || matchWinner) return;
    evaluateWinner();
  }, [p1, p2, isPlaying, matchWinner, evaluateWinner]);

  // 5. Core Player Move dispatcher
  const performMove = useCallback((playerId: 'p1' | 'p2', dir: MoveDirection) => {
    if (matchWinner) return;

    const isP1 = playerId === 'p1';

    const updateState = (player: PlayerState): PlayerState => {
      if (player.isGameOver || player.isWon || player.eliminated) return player;

      // Execute core physics movement
      const offset = player.movesCount + 2;
      const { nextBoard, scoreGain, moved } = executeMove(
        player.board,
        dir,
        offset,
        fairGenRef.current || undefined
      );

      if (!moved) return player; // grid state did not change

      // Play slide audio sound
      playSlideSound();

      // Calculate score and maximum tile values
      const newScore = player.score + scoreGain;
      const newMaxTile = Math.max(...nextBoard.map(t => t.value));
      const nextMovesCount = player.movesCount + 1;

      // Trigger merge feedback sounds
      if (scoreGain > 0) {
        playMergeSound(newMaxTile);
        if (newMaxTile >= 128 && newMaxTile > player.maxTile) {
          postCommentary(`${player.name} crafted a massive ${newMaxTile} tile! Awesome!`);
        }
      }

      // Persistent high-score synchronization
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('2048_vs_highscore', newScore.toString());
      }

      // Formulate updated player profile
      let updatedPlayer: PlayerState = {
        ...player,
        board: nextBoard,
        score: newScore,
        maxTile: newMaxTile,
        movesCount: nextMovesCount,
        lastMoveTime: Date.now(),
        inactivityTimer: 15.0 // reset survivor clock
      };

      // Check game logic limits (RACE MODE)
      if (settings.mode === 'RACE') {
        if (newMaxTile >= player.lapTarget) {
          if (settings.lapsEnabled) {
            if (player.currentLap < settings.maxLaps) {
              // Next lap escalation
              const nextLap = player.currentLap + 1;
              const nextTarget = player.lapTarget * 2;
              updatedPlayer.currentLap = nextLap;
              updatedPlayer.lapTarget = nextTarget;
              postCommentary(`🏁 Laps: ${player.name} finished Lap ${player.currentLap}! Target is now ${nextTarget}!`);
            } else {
              // Reached final lap target!
              updatedPlayer.isWon = true;
            }
          } else {
            // No laps, reach target value wins
            updatedPlayer.isWon = true;
          }
        }
      } else {
        // SURVIVOR MODE: reach 2048 is also a standard insta-win if it happens!
        if (newMaxTile >= 2048) {
          updatedPlayer.isWon = true;
        }
      }

      // Check lock states
      if (!canMove(nextBoard)) {
        updatedPlayer.isGameOver = true;
      }

      return updatedPlayer;
    };

    if (isP1) {
      setP1(prev => updateState(prev));
    } else {
      setP2(prev => updateState(prev));
    }
  }, [matchWinner, highScore, settings]);

  // 6. Local Keydown Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || matchWinner) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      // Keyboard standard prevention to avoid screen-scrolling behaviors in the iFrame preview
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }

      // PLAYER 1 (WASD or ZSQD mapping)
      if (settings.p1Layout === 'WASD') {
        if (code === 'KeyW' || key === 'w') performMove('p1', 'UP');
        else if (code === 'KeyS' || key === 's') performMove('p1', 'DOWN');
        else if (code === 'KeyA' || key === 'a') performMove('p1', 'LEFT');
        else if (code === 'KeyD' || key === 'd') performMove('p1', 'RIGHT');
      } else { // AZERTY (ZSQD)
        if (code === 'KeyW' || code === 'KeyZ' || key === 'z' || key === 'w') performMove('p1', 'UP');
        else if (code === 'KeyS' || key === 's') performMove('p1', 'DOWN');
        else if (code === 'KeyA' || code === 'KeyQ' || key === 'q' || key === 'a') performMove('p1', 'LEFT');
        else if (code === 'KeyD' || key === 'd') performMove('p1', 'RIGHT');
      }

      // PLAYER 2 (Arrows - strictly disabled if AI is handling Player 2)
      if (!settings.aiEnabled) {
        if (code === 'ArrowUp') performMove('p2', 'UP');
        else if (code === 'ArrowDown') performMove('p2', 'DOWN');
        else if (code === 'ArrowLeft') performMove('p2', 'LEFT');
        else if (code === 'ArrowRight') performMove('p2', 'RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, settings.p1Layout, settings.aiEnabled, matchWinner, performMove]);

  // 7. Computer AI Bot Ticker Loop
  useEffect(() => {
    if (!isPlaying || !settings.aiEnabled || matchWinner) return;

    // Match tick speed based on customizable difficulty setup
    let tickSpeed = 500;
    let randomMoveProbability = 0.2;
    let lookaheadDepth = 1;

    switch (settings.aiDifficulty) {
      case 'EASY':
        tickSpeed = 750;
        randomMoveProbability = 0.45;
        lookaheadDepth = 1;
        break;
      case 'MEDIUM':
        tickSpeed = 450;
        randomMoveProbability = 0.15;
        lookaheadDepth = 1;
        break;
      case 'HARD':
        tickSpeed = 300;
        randomMoveProbability = 0.0;
        lookaheadDepth = 1;
        break;
      case 'GOD':
        tickSpeed = 120; // Blazing fast
        randomMoveProbability = 0.0;
        lookaheadDepth = 2; // Deep lookahead corner-weights
        break;
    }

    const executeAIMove = (depth: number, randomProb: number) => {
      const p2State = p2Ref.current;
      if (p2State.isGameOver || p2State.isWon || p2State.eliminated) return;

      // Decides whether to throw a random move or heuristic best move
      if (Math.random() < randomProb) {
        const directions: MoveDirection[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const validDirs = directions.filter(d => {
          const sim = executeMove(p2State.board, d, 0);
          return sim.moved;
        });
        if (validDirs.length > 0) {
          const picked = validDirs[Math.floor(Math.random() * validDirs.length)];
          performMove('p2', picked);
          return;
        }
      }

      const bestMove = selectBestAIMove(p2State.board, depth);
      if (bestMove) {
        performMove('p2', bestMove);
      }
    };

    const aiTick = setInterval(() => {
      const p2State = p2Ref.current;
      if (p2State.isGameOver || p2State.isWon || p2State.eliminated) return;

      // In Survivor mode, if the clock is in the critical warning state, AI speed increases to handle emergency!
      const emergencyState = settings.mode === 'SURVIVOR' && p2State.inactivityTimer <= 5;
      if (emergencyState) {
        executeAIMove(lookaheadDepth, randomMoveProbability);
        return;
      }

      executeAIMove(lookaheadDepth, randomMoveProbability);
    }, tickSpeed);

    return () => clearInterval(aiTick);
  }, [isPlaying, settings.aiEnabled, settings.aiDifficulty, settings.mode, matchWinner, performMove]);

  // 8. Survivor Mode Inactivity Timer Decrement Loop (Ticking at 100ms)
  useEffect(() => {
    if (!isPlaying || matchWinner || settings.mode !== 'SURVIVOR') return;

    const decrementInterval = setInterval(() => {
      setP1(prevP1 => {
        if (prevP1.eliminated || prevP1.isWon || prevP1.isGameOver) return prevP1;

        const nextTimer = Math.max(0, prevP1.inactivityTimer - 0.1);
        const newlyEliminated = nextTimer === 0;

        // Play warning beeps on whole seconds under 5s
        const prevSec = Math.ceil(prevP1.inactivityTimer);
        const currSec = Math.ceil(nextTimer);
        if (currSec <= 5 && currSec < prevSec && !newlyEliminated) {
          playWarningTickSound(currSec <= 2 ? 1.0 : 0.6);
        }

        const updated = {
          ...prevP1,
          inactivityTimer: nextTimer,
          eliminated: newlyEliminated
        };

        if (newlyEliminated) {
          playDefeatSound();
        }

        return updated;
      });

      setP2(prevP2 => {
        if (prevP2.eliminated || prevP2.isWon || prevP2.isGameOver) return prevP2;

        const nextTimer = Math.max(0, prevP2.inactivityTimer - 0.1);
        const newlyEliminated = nextTimer === 0;

        // Play warning beeps on whole seconds under 5s
        const prevSec = Math.ceil(prevP2.inactivityTimer);
        const currSec = Math.ceil(nextTimer);
        if (currSec <= 5 && currSec < prevSec && !newlyEliminated) {
          playWarningTickSound(currSec <= 2 ? 1.0 : 0.6);
        }

        const updated = {
          ...prevP2,
          inactivityTimer: nextTimer,
          eliminated: newlyEliminated
        };

        if (newlyEliminated) {
          playDefeatSound();
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(decrementInterval);
  }, [isPlaying, settings.mode, matchWinner]);

  return (
    <div className={`bg-[#0A0A0B] text-[#EDEDEF] flex flex-col font-sans select-none selection:bg-orange-500 ${
      isPlaying ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen overflow-y-auto pb-6'
    }`}>
      
      {/* 1. Global Navigation Bar */}
      <header className="flex justify-between items-center px-4 md:px-8 py-2.5 sm:py-3.5 border-b border-white/5 shrink-0 select-none">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-[0.3em] text-orange-500 font-bold leading-none mb-1">Versus Mode</span>
          <h1 className="text-lg sm:text-2xl font-black italic tracking-tighter uppercase leading-none text-[#EDEDEF]">
            2048 <span className="text-orange-500">VS</span>
          </h1>
        </div>
        
        <div className="flex gap-4 sm:gap-6 text-right items-center">
          <div className="hidden sm:block text-right">
            <p className="text-[8px] uppercase tracking-widest opacity-40 leading-none">Game Mode</p>
            <p className="text-xs font-black tracking-tight uppercase text-orange-500 leading-none mt-1">
              {settings.mode === 'SURVIVOR' ? 'Survivor' : 'Race'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-widest opacity-40 leading-none">Time Elapsed</p>
            <p className="text-sm font-mono font-bold text-orange-500 tracking-tighter leading-none mt-1">
              {formatElapsed(elapsedMs)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSettings(prev => ({ ...prev, audioMuted: !prev.audioMuted }))}
              className="p-1 bg-white/5 border border-white/10 hover:border-orange-500 text-white/50 hover:text-orange-500 transition-all cursor-pointer"
              title={settings.audioMuted ? 'Unmute' : 'Mute'}
            >
              {settings.audioMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-mono tracking-widest text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer uppercase"
            >
              Guide
            </button>
            {isPlaying && (
              <button
                onClick={handleQuitGame}
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-500 text-black text-[8px] sm:text-[9px] font-mono tracking-widest font-black transition-all cursor-pointer uppercase hover:bg-white"
              >
                Quit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Primary Layout Center */}
      <main className={`flex-1 max-w-6xl w-full mx-auto px-2 md:px-4 py-2 md:py-4 flex flex-col justify-center items-center ${
        isPlaying ? 'overflow-hidden' : 'overflow-y-auto'
      }`}>
        
        {/* Responsive Board Container */}
        <div className={`w-full bg-gradient-to-b from-[#0F0F12] to-[#050507] border-2 sm:border-4 border-zinc-900 rounded-lg p-2.5 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative ring-1 ring-white/10 ${
          isPlaying ? 'overflow-hidden' : 'overflow-y-auto'
        }`}>
          
          {!isPlaying ? (
            /* CONFIGURATION LOBBY */
            <div className="w-full flex flex-col items-center justify-center gap-4 py-1">
              {/* Beautiful landing banner */}
              <div className="text-center max-w-xl">
                <span className="text-[10px] uppercase tracking-[0.4em] text-orange-500 font-bold">Arcade Versus Setup</span>
                <h2 className="text-2xl sm:text-3xl font-black italic text-[#EDEDEF] tracking-tight uppercase leading-none mt-1.5">
                  Competitive <span className="text-orange-500">Versus Match</span>
                </h2>
                <p className="text-[10px] sm:text-xs font-mono mt-1 text-white/40 max-w-xs sm:max-w-sm mx-auto leading-normal">
                  Play head-to-head. Merge tiles quickly to reach the target value or stay ahead of the countdown timer.
                </p>
              </div>

              <GameControls
                settings={settings}
                setSettings={setSettings}
                onStartGame={handleStartGame}
                highScore={highScore}
              />
            </div>
          ) : (
            /* ACTIVE MATCH LAYOUT */
            <div className="w-full flex flex-col gap-3">
              
              {/* Split Screen Grids */}
              <div className="w-full flex flex-row gap-2 sm:gap-4 md:gap-6 justify-center items-center">
                
                {/* Player 1 Left */}
                <GameBoard 
                  player={p1} 
                  settings={settings} 
                  isP1={true} 
                  onMove={(dir) => performMove('p1', dir)}
                />
 
                {/* Dynamic Battle Status Central HUD */}
                <div className="hidden lg:flex flex-col items-center justify-center gap-3 px-2 shrink-0 self-center">
                  <div className="relative w-[90px] h-[90px] border-4 border-orange-500 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase tracking-wider text-orange-500 leading-none mb-1">
                        {settings.mode === 'SURVIVOR' ? 'Time Left' : 'Top Tile'}
                      </p>
                      <p className="text-2xl font-black italic tracking-tighter leading-none text-[#EDEDEF]">
                        {settings.mode === 'SURVIVOR' 
                          ? `${Math.ceil(Math.min(p1.inactivityTimer, p2.inactivityTimer))}`.padStart(2, '0')
                          : `${Math.max(p1.maxTile, p2.maxTile)}`
                        }
                      </p>
                      <p className="text-[7px] uppercase tracking-tighter opacity-50 mt-1 leading-none">
                        {settings.mode === 'SURVIVOR' ? 'Move Timer' : 'Highest Tile'}
                      </p>
                    </div>
                  </div>
 
                  <div className="text-center space-y-2 w-[100px]">
                    <div className="px-2 py-1 bg-white/5 border border-white/10">
                      <p className="text-[8px] uppercase tracking-wider opacity-60 mb-0.5 leading-none">Goal Tile</p>
                      <p className="text-lg font-black tracking-tighter italic text-orange-500 font-mono leading-none">
                        {settings.mode === 'RACE' ? (settings.lapsEnabled ? p1.lapTarget : settings.targetValue) : '2048'}
                      </p>
                    </div>
                    <div className="h-[1px] w-full bg-white/10"></div>
                    <div className="flex flex-col gap-0.5 w-full">
                      <div className="h-1 w-full bg-white/10">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-300" 
                          style={{ 
                            width: `${Math.min(100, (Math.max(p1.maxTile, p2.maxTile) / (settings.mode === 'RACE' ? (settings.lapsEnabled ? p1.lapTarget : settings.targetValue) : 2048)) * 100)}%` 
                          }} 
                        />
                      </div>
                      <p className="text-[7px] uppercase tracking-[0.2em] opacity-40 leading-none">Progress</p>
                    </div>
                  </div>
                </div>
 
                {/* Player 2 Right */}
                <GameBoard 
                  player={p2} 
                  settings={settings} 
                  isP1={false} 
                  onMove={(dir) => performMove('p2', dir)}
                />
 
              </div>
 
              {/* Controls Bar */}
              <div className="w-full max-w-xs mx-auto flex justify-center gap-2 mt-1 sm:mt-2">
                <button
                  onClick={handleStartGame}
                  className="bg-white text-black font-black italic uppercase tracking-tighter text-[10px] sm:text-xs px-4 py-2.5 skew-x-[-12deg] hover:bg-orange-500 hover:text-black transition-all duration-300 cursor-pointer flex items-center gap-1"
                >
                  <span className="block skew-x-[12deg] flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Restart Match
                  </span>
                </button>
              </div>
            </div>
          )}
          
        </div>
      </main>

      {/* 3. Global End-of-Match Announcement Modal overlay */}
      <AnimatePresence>
        {matchWinner && (
          <div className="fixed inset-0 bg-[#0A0A0B]/95 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div className="bg-black border border-white/10 rounded-none p-8 max-w-md w-full text-center relative overflow-hidden">
              <div className="bg-orange-500 text-black px-4 py-1.5 skew-x-[-12deg] w-fit mx-auto mb-4">
                <span className="block skew-x-[12deg] font-black text-xs uppercase tracking-widest">Match Over</span>
              </div>

              <h2 className="text-3xl font-black text-[#EDEDEF] italic tracking-tighter uppercase leading-tight mt-1 mb-2">
                {matchWinner}
              </h2>
              
              <div className="bg-white/5 border border-white/10 p-4 my-5 flex justify-around items-center gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-white/40 font-mono tracking-widest uppercase">Player 1 Score</span>
                  <span className="text-xl font-black text-orange-500 font-mono italic">{p1.score}</span>
                  <span className="text-[8px] text-white/30 font-mono">Max: {p1.maxTile}</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-white/40 font-mono tracking-widest uppercase">{p2.name} Score</span>
                  <span className="text-xl font-black text-orange-500 font-mono italic">{p2.score}</span>
                  <span className="text-[8px] text-white/30 font-mono">Max: {p2.maxTile}</span>
                </div>
              </div>

              <p className="text-xs text-white/60 font-mono leading-relaxed max-w-xs mx-auto italic mb-6">
                "{commentary}"
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleStartGame}
                  className="bg-white text-black font-black italic uppercase tracking-tighter text-xs px-5 py-3 skew-x-[-12deg] hover:bg-orange-500 hover:text-black transition-all duration-300 cursor-pointer"
                >
                  <span className="block skew-x-[12deg]">Play Again</span>
                </button>
                <button
                  onClick={handleQuitGame}
                  className="bg-white/10 text-white font-black italic uppercase tracking-tighter text-xs px-5 py-3 skew-x-[-12deg] hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                >
                  <span className="block skew-x-[12deg]">Exit to Menu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Global "How to Play" Drawer/Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 bg-[#0A0A0B]/95 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div className="bg-black border border-white/10 rounded-none p-6 md:p-8 max-w-xl w-full relative">
              {/* Close Button */}
              <button
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-5 right-5 p-1 bg-white/5 border border-white/10 hover:border-orange-500 text-white/50 hover:text-orange-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-500 text-black px-3 py-1 skew-x-[-12deg]">
                  <span className="block skew-x-[12deg] font-black text-[10px] tracking-wider uppercase">How to Play</span>
                </div>
                <h3 className="text-base font-black text-[#EDEDEF] italic uppercase tracking-tight">
                  Game Guide
                </h3>
              </div>

              <div className="space-y-4 text-xs font-mono text-white/50 leading-relaxed max-h-[360px] overflow-y-auto pr-2">
                <div className="border-b border-white/5 pb-2.5">
                  <h4 className="text-orange-500 font-black mb-1 uppercase tracking-wider text-[10px]">
                    General Rules
                  </h4>
                  <p>Both grids run side-by-side in real time. Slide tiles to merge matching values and double them. Move instantly with zero turn-based pauses!</p>
                </div>

                <div className="border-b border-white/5 pb-2.5">
                  <h4 className="text-orange-500 font-black mb-1 uppercase tracking-wider text-[10px]">
                    Race Mode
                  </h4>
                  <p>Be the first to hit the target tile. If Multi-Lap is active, the target value doubles on completion of each lap.</p>
                </div>

                <div className="border-b border-white/5 pb-2.5">
                  <h4 className="text-orange-500 font-black mb-1 uppercase tracking-wider text-[10px]">
                    Survivor Mode
                  </h4>
                  <p>A countdown timer. Each valid move resets it. Settle below 5 seconds to activate the emergency warning. Fail to move in time, and face immediate KO!</p>
                </div>

                <div>
                  <h4 className="text-orange-500 font-black mb-1.5 uppercase tracking-wider text-[10px]">
                    Layout Keys
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 border border-white/10">
                    <div>
                      <span className="text-[#EDEDEF] font-bold block mb-1">Player 1</span>
                      <span className="text-[11px]">{settings.p1Layout === 'WASD' ? 'W (Up), S (Down), A (Left), D (Right)' : 'Z (Up), S (Down), Q (Left), D (Right)'}</span>
                    </div>
                    <div>
                      <span className="text-orange-500 font-bold block mb-1">Player 2</span>
                      <span className="text-[11px]">{settings.aiEnabled ? 'Smart Bot AI (Automated)' : 'Arrow Keys: ↑, ↓, ←, →'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 bg-white text-black font-black italic uppercase tracking-tighter text-sm py-3 skew-x-[-12deg] hover:bg-orange-500 transition-all duration-300 cursor-pointer"
              >
                <span className="block skew-x-[12deg]">Close</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Footer */}
      <footer className="border-t border-white/5 py-2 px-6 shrink-0 text-center select-none">
        <p className="text-[9px] font-mono tracking-widest text-white/20 uppercase">
          2048 Versus Arcade • Made by Idnafen
        </p>
      </footer>

    </div>
  );
}
