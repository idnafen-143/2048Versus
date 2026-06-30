import { Tile, MoveDirection } from './types';

// Generate a random stable tile ID
export function generateId(): string {
  return 'tile-' + Math.random().toString(36).substring(2, 11);
}

// Simple Seeded Pseudo-Random Number Generator (LCG)
export class SeededRNG {
  private seed: number;

  constructor(seed: number = 1) {
    this.seed = seed;
  }

  // Returns number in [0, 1)
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Preset spawns list to guarantee 100% fair, identical random tiles per move index
export class FairSpawnGenerator {
  private rng: SeededRNG;
  private spawns: { value: number; cellRatio: number }[] = [];

  constructor(seed: number) {
    this.rng = new SeededRNG(seed);
    // Pre-generate a list of 1000 moves
    for (let i = 0; i < 1000; i++) {
      const isFour = this.rng.next() < 0.1; // 10% chance of 4
      this.spawns.push({
        value: isFour ? 4 : 2,
        cellRatio: this.rng.next(), // Used to select relative empty cell index
      });
    }
  }

  getSpawn(moveIndex: number): { value: number; cellRatio: number } {
    if (moveIndex >= this.spawns.length) {
      // Fallback LCG on the fly if game goes insanely long
      const isFour = this.rng.next() < 0.1;
      return { value: isFour ? 4 : 2, cellRatio: this.rng.next() };
    }
    return this.spawns[moveIndex];
  }
}

// Check if any tile moves or merges are possible
export function canMove(board: Tile[]): boolean {
  if (board.length < 16) return true;

  // Build a 2D grid for lookup
  const grid: (number | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
  board.forEach(tile => {
    if (tile.row >= 0 && tile.row < 4 && tile.col >= 0 && tile.col < 4) {
      grid[tile.row][tile.col] = tile.value;
    }
  });

  // Check for adjacent merges
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid[r][c];
      if (val === null) return true;
      // Check right
      if (c < 3 && grid[r][c + 1] === val) return true;
      // Check down
      if (r < 3 && grid[r + 1][c] === val) return true;
    }
  }
  return false;
}

// Initialize a fresh board state with 2 starting tiles
export function initializeBoard(fairGen?: FairSpawnGenerator, boardSeedOffset: number = 0): Tile[] {
  let board: Tile[] = [];
  
  if (fairGen) {
    // Deterministic spawns
    const first = fairGen.getSpawn(boardSeedOffset);
    const second = fairGen.getSpawn(boardSeedOffset + 1);

    // Pick two distinct cells using cellRatio
    const c1 = Math.floor(first.cellRatio * 16);
    let c2 = Math.floor(second.cellRatio * 15);
    if (c2 >= c1) c2 += 1;

    board.push({
      id: `init-1-${generateId()}`,
      value: first.value,
      row: Math.floor(c1 / 4),
      col: c1 % 4,
      isNew: true,
    });

    board.push({
      id: `init-2-${generateId()}`,
      value: second.value,
      row: Math.floor(c2 / 4),
      col: c2 % 4,
      isNew: true,
    });
  } else {
    // Regular random spawns
    const p1 = Math.floor(Math.random() * 16);
    let p2 = Math.floor(Math.random() * 15);
    if (p2 >= p1) p2 += 1;

    board.push({
      id: generateId(),
      value: Math.random() < 0.1 ? 4 : 2,
      row: Math.floor(p1 / 4),
      col: p1 % 4,
      isNew: true,
    });

    board.push({
      id: generateId(),
      value: Math.random() < 0.1 ? 4 : 2,
      row: Math.floor(p2 / 4),
      col: p2 % 4,
      isNew: true,
    });
  }

  return board;
}

// Perform a single move on a board in a direction
export function executeMove(
  board: Tile[],
  direction: MoveDirection,
  moveIndex: number,
  fairGen?: FairSpawnGenerator
): { nextBoard: Tile[]; scoreGain: number; moved: boolean } {
  // Clear "new" and "merged" flags from prior turn
  const cleanedBoard: Tile[] = board.map(tile => ({
    ...tile,
    isNew: false,
    isMerged: false,
  }));

  // Create a copy to manipulate
  let workingBoard = [...cleanedBoard];
  let scoreGain = 0;
  let moved = false;

  // Row and col groupings depending on slide direction
  const isVertical = direction === 'UP' || direction === 'DOWN';
  const isForward = direction === 'DOWN' || direction === 'RIGHT'; // towards higher index

  // We process row-by-row (for horizontal) or col-by-col (for vertical)
  for (let idx = 0; idx < 4; idx++) {
    // Gather all tiles in this line (row or column)
    let lineTiles = workingBoard.filter(t => (isVertical ? t.col : t.row) === idx);

    // Sort tiles by position along slide direction (e.g., left-to-right or top-to-bottom)
    lineTiles.sort((a, b) => {
      const posA = isVertical ? a.row : a.col;
      const posB = isVertical ? b.row : b.col;
      return isForward ? posB - posA : posA - posB; // reverse order if sliding forward
    });

    // Merge tiles inside this line
    const mergedLine: Tile[] = [];
    let skipNext = false;

    for (let i = 0; i < lineTiles.length; i++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      const current = lineTiles[i];
      const next = lineTiles[i + 1];

      if (next && current.value === next.value) {
        // Merge!
        const doubledValue = current.value * 2;
        scoreGain += doubledValue;
        moved = true;

        // Add the primary merged tile
        mergedLine.push({
          ...current,
          value: doubledValue,
          isMerged: true,
        });

        // Mark the secondary tile to slide to this same spot and then disappear
        // To make React slide it, we temporarily set its coords to matches current,
        // but we'll prune it from the final board.
        // We'll mark it with a special flag or just omit it, but to show slide animation,
        // we can set its row/col.
        next.isMerged = true; // mark to slide but not survive
        
        skipNext = true;
      } else {
        mergedLine.push(current);
      }
    }

    // Now position all surviving elements in their slots (0, 1, 2, 3)
    mergedLine.forEach((tile, slotIndex) => {
      const targetPos = isForward ? 3 - slotIndex : slotIndex;
      const currentPos = isVertical ? tile.row : tile.col;

      if (currentPos !== targetPos) {
        moved = true;
      }

      // Update position in-place on working board
      const origTile = workingBoard.find(t => t.id === tile.id);
      if (origTile) {
        if (isVertical) {
          origTile.row = targetPos;
        } else {
          origTile.col = targetPos;
        }
        origTile.value = tile.value;
        origTile.isMerged = tile.isMerged;
      }
    });

    // Also slide the helper merged-out tiles to the target spot before pruning
    for (let i = 0; i < lineTiles.length; i++) {
      if (lineTiles[i].isMerged && !mergedLine.some(t => t.id === lineTiles[i].id)) {
        // This is a tile that was absorbed. Find which slot it was absorbed in.
        // It was merged with the tile before it (due to sorted order).
        const mergeIndex = Math.floor(i / 2); // basic pairing mapping
        const targetPos = isForward ? 3 - mergeIndex : mergeIndex;
        const origTile = workingBoard.find(t => t.id === lineTiles[i].id);
        if (origTile) {
          if (isVertical) {
            origTile.row = targetPos;
          } else {
            origTile.col = targetPos;
          }
          // Mark to prune
          (origTile as any).toPrune = true;
        }
      }
    }
  }

  // Prune absorbed tiles
  workingBoard = workingBoard.filter(t => !(t as any).toPrune);

  // If we actually moved, spawn a new tile
  if (moved) {
    // Find all empty grid positions
    const occupied = new Set(workingBoard.map(t => `${t.row},${t.col}`));
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!occupied.has(`${r},${c}`)) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      if (fairGen) {
        // Guaranteed synced seed spawn
        const spawn = fairGen.getSpawn(moveIndex);
        const cellIndex = Math.floor(spawn.cellRatio * emptyCells.length);
        const cell = emptyCells[cellIndex];
        workingBoard.push({
          id: generateId(),
          value: spawn.value,
          row: cell.r,
          col: cell.c,
          isNew: true,
        });
      } else {
        // Pure random spawn
        const cellIndex = Math.floor(Math.random() * emptyCells.length);
        const cell = emptyCells[cellIndex];
        workingBoard.push({
          id: generateId(),
          value: Math.random() < 0.1 ? 4 : 2,
          row: cell.r,
          col: cell.c,
          isNew: true,
        });
      }
    }
  }

  return { nextBoard: workingBoard, scoreGain, moved };
}

// ----------------------------------------------------
// AI Solver (Heuristic Lookahead Corner Snake)
// ----------------------------------------------------

// Corner Snake weight matrix (aims to accumulate in bottom-right corner)
const WEIGHT_MATRIX = [
  [0.002, 0.004, 0.008, 0.016],
  [0.256, 0.128, 0.064, 0.032],
  [0.512, 1.024, 2.048, 4.096],
  [65.536,32.768,16.384,8.192]
];

// Assess the board quality based on snake layout, empty spaces, and matching adjacent tiles (smoothness)
function evaluateBoard(board: Tile[]): number {
  const grid: number[][] = Array(4).fill(0).map(() => Array(4).fill(0));
  board.forEach(t => {
    if (t.row >= 0 && t.row < 4 && t.col >= 0 && t.col < 4) {
      grid[t.row][t.col] = t.value;
    }
  });

  let score = 0;
  let emptyCount = 0;

  // 1. Position weight
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid[r][c];
      if (val === 0) {
        emptyCount++;
      } else {
        score += val * WEIGHT_MATRIX[r][c];
      }
    }
  }

  // 2. Empty tiles reward (huge value since board survival is key)
  score += emptyCount * 250;

  // 3. Monotonicity & Smoothness (penalize sudden steps between adjacent cells)
  let smoothnessPenalty = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] !== 0) {
        // Right neighbor
        if (c < 3 && grid[r][c + 1] !== 0) {
          smoothnessPenalty += Math.abs(Math.log2(grid[r][c]) - Math.log2(grid[r][c + 1]));
        }
        // Down neighbor
        if (r < 3 && grid[r + 1][c] !== 0) {
          smoothnessPenalty += Math.abs(Math.log2(grid[r][c]) - Math.log2(grid[r + 1][c]));
        }
      }
    }
  }
  score -= smoothnessPenalty * 80;

  return score;
}

// Select the absolute best direction to move
export function selectBestAIMove(board: Tile[], depth: number = 1): MoveDirection | null {
  const directions: MoveDirection[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  let bestScore = -Infinity;
  let bestDir: MoveDirection | null = null;

  for (const dir of directions) {
    // 1st level simulation (no fairGen seed, using a temporary local model)
    const { nextBoard, scoreGain, moved } = executeMove(board, dir, 0);
    if (!moved) continue;

    let score = evaluateBoard(nextBoard) + scoreGain * 1.5;

    // Look ahead depth 2 (simulating opponent or next moves)
    if (depth > 1) {
      let depth2Best = -Infinity;
      for (const dir2 of directions) {
        const sim2 = executeMove(nextBoard, dir2, 0);
        if (sim2.moved) {
          const score2 = evaluateBoard(sim2.nextBoard) + sim2.scoreGain * 1.5;
          if (score2 > depth2Best) {
            depth2Best = score2;
          }
        }
      }
      if (depth2Best !== -Infinity) {
        score += depth2Best * 0.8; // discounted weight for lookahead
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestDir = dir;
    }
  }

  // If no smart moves found, pick first available move
  if (!bestDir) {
    for (const dir of directions) {
      const { moved } = executeMove(board, dir, 0);
      if (moved) return dir;
    }
  }

  return bestDir;
}
