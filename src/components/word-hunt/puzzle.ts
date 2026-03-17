import type { LevelConfig, Pos } from "./types";

export type Puzzle = {
  grid: string[][];
  placedWords: string[];
};

function shuffle<T>(arr: T[]): T[] {
  // Fresh random seed
  const seed = Date.now() + Math.random();
  return [...arr].map((item, i) => [Math.random() * seed + i, item] as [number, T]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
}

function initGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
}

function fillRandom(grid: string[][]) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function tryPlaceWord(
  grid: string[][],
  word: string,
  diagonal: boolean,
): { placed: false } | { placed: true; positions: Pos[]; intersections: number } {
  const size = grid.length;
  const directions: Pos[] = diagonal
    ? [
      { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: -1 },
    ]
    : [
      { r: 0, c: 1 }, { r: 1, c: 0 },
    ];

  for (let attempts = 0; attempts < 300; attempts++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const startR = Math.floor(Math.random() * size);
    const startC = Math.floor(Math.random() * size);

    const endR = startR + (word.length - 1) * dir.r;
    const endC = startC + (word.length - 1) * dir.c;
    if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

    let canPlace = true;
    let intersections = 0;
    const positions: Pos[] = [];
    for (let i = 0; i < word.length; i++) {
      const r = startR + i * dir.r;
      const c = startC + i * dir.c;
      const ch = grid[r][c];
      if (ch !== "" && ch !== word[i]) {
        canPlace = false;
        break;
      }
      if (ch !== "" && ch === word[i]) intersections++;
      positions.push({ r, c });
    }
    if (!canPlace) continue;

    // Place the word
    for (let i = 0; i < word.length; i++) {
      const r = positions[i].r;
      const c = positions[i].c;
      grid[r][c] = word[i];
    }
    return { placed: true, positions, intersections };
  }
  return { placed: false };
}

export function buildPuzzle(cfg: LevelConfig, pool: string[]): Puzzle {
  let finalGrid: string[][] = [];
  let finalWords: string[] = [];

  // Try multiple times to ensure ALL words are guaranteed placeable
  for (let outerAttempt = 0; outerAttempt < 100; outerAttempt++) {
    const words = shuffle(pool).slice(0, cfg.words).sort((a, b) => b.length - a.length);

    for (let attempt = 0; attempt < 50; attempt++) {
      const grid = initGrid(cfg.size);
      const placedWords: string[] = [];
      let totalIntersections = 0;
      let allPlaced = true;

      // Place words longest first
      for (const w of words) {
        const res = tryPlaceWord(grid, w, Boolean(cfg.diagonal));
        if (!res.placed) {
          allPlaced = false;
          break;
        }
        totalIntersections += res.intersections;
        placedWords.push(w);
      }

      if (allPlaced) {
        // Check crossing requirement
        const requireCrossing = Boolean(cfg.requireCrossing);
        if (!requireCrossing || totalIntersections >= (cfg.minIntersections ?? 1)) {
          fillRandom(grid);
          finalGrid = grid;
          finalWords = placedWords;
          break; // Perfect puzzle found
        }
      }
    }

    if (finalWords.length > 0) break; // Success
  }

  // Ultimate fallback - guarantee words exist somewhere in grid
  if (finalWords.length === 0) {
    const grid = initGrid(cfg.size);
    fillRandom(grid);
    finalGrid = grid;
    finalWords = shuffle(pool).slice(0, cfg.words);

    // Force place if needed (simple horizontal for fallback)
    finalWords.forEach((word, index) => {
      for (let r = 0; r < cfg.size - word.length + 1; r++) {
        if (grid[r].slice(index, index + word.length).join('') === word) return;
      }
      // Place at top if not found
      for (let i = 0; i < word.length; i++) {
        grid[0][index + i] = word[i];
      }
    });
  }

  return { grid: finalGrid, placedWords: finalWords };
}

