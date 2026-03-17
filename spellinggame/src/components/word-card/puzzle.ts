import type { LevelConfig, Pos } from "./types";

export type Puzzle = {
    grid: string[][];
    placedWords: string[];
};

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
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
): { placed: false } | { placed: true; intersections: number } {
    const size = grid.length;
    const directions: Pos[] = diagonal
        ? [
            { r: 0, c: 1 }, // horizontal
            { r: 1, c: 0 }, // vertical
            { r: 1, c: 1 }, // diagonal down-right
            { r: 1, c: -1 }, // diagonal down-left
        ]
        : [
            { r: 0, c: 1 }, // horizontal
            { r: 1, c: 0 }, // vertical
        ];

    for (let attempts = 0; attempts < 140; attempts++) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startR = Math.floor(Math.random() * size);
        const startC = Math.floor(Math.random() * size);

        const endR = startR + (word.length - 1) * dir.r;
        const endC = startC + (word.length - 1) * dir.c;
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

        let canPlace = true;
        let intersections = 0;
        for (let i = 0; i < word.length; i++) {
            const ch = grid[startR + i * dir.r][startC + i * dir.c];
            if (ch !== "" && ch !== word[i]) {
                canPlace = false;
                break;
            }
            if (ch !== "" && ch === word[i]) intersections++;
        }
        if (!canPlace) continue;

        for (let i = 0; i < word.length; i++) {
            grid[startR + i * dir.r][startC + i * dir.c] = word[i];
        }
        return { placed: true, intersections };
    }
    return { placed: false };
}

export function buildPuzzle(cfg: LevelConfig, pool: string[]): Puzzle {
    const words = shuffle(pool).slice(0, cfg.words).sort((a, b) => b.length - a.length);

    for (let attempt = 0; attempt < 30; attempt++) {
        const grid = initGrid(cfg.size);
        const placedWords: string[] = [];
        let totalIntersections = 0;

        let ok = true;
        for (const w of words) {
            const res = tryPlaceWord(grid, w, Boolean(cfg.diagonal));
            if (!res.placed) {
                ok = false;
                break;
            }
            totalIntersections += res.intersections;
            placedWords.push(w);
        }
        if (!ok) continue;

        // From level 6 onwards (and any other cfg requiring it), force at least one crossing.
        const requireCrossing = Boolean(cfg.requireCrossing);
        if (requireCrossing && totalIntersections < (cfg.minIntersections ?? 1)) continue;

        fillRandom(grid);
        return { grid, placedWords };
    }

    // Fallback: return a filled random grid with whatever words were requested.
    const grid = initGrid(cfg.size);
    fillRandom(grid);
    return { grid, placedWords: words };
}

