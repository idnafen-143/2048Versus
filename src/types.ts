export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export type GameMode = 'RACE' | 'SURVIVOR';

export interface GameSettings {
  mode: GameMode;
  targetValue: number;      // Initial target for Race Mode (e.g., 2048)
  lapsEnabled: boolean;      // If true, target scales: 2048 -> 4096 -> 8192
  maxLaps: number;          // Number of laps (1 to 5)
  syncedRNG: boolean;        // Both boards spawn identical tile sequences for perfect skill balance
  p1Layout: 'WASD' | 'ZSQD'; // QWERTY WASD or AZERTY ZSQD for Player 1
  aiEnabled: boolean;        // Player 2 is controlled by AI
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'GOD'; // AI intelligence/speed levels
  audioMuted: boolean;       // Mute synthesizers
}

export interface PlayerState {
  id: 'p1' | 'p2';
  name: string;
  board: Tile[];
  score: number;
  movesCount: number;
  maxTile: number;
  currentLap: number;        // Track current lap (1-indexed)
  lapTarget: number;         // Current lap's target tile value (e.g. 2048)
  isGameOver: boolean;       // Board is locked (no valid moves)
  isWon: boolean;            // Reached target/final lap target
  eliminated: boolean;       // Disqualified from Survivor inactivity
  lastMoveTime: number;      // Epoch timestamp of last valid move
  inactivityTimer: number;   // 15 seconds ticking down: 10s silent, 5s urgent hazard
}

export type MoveDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
