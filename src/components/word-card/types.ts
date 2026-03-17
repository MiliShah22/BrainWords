export type LevelConfig = {
    size: number;
    words: number;
    pool: number;
    diagonal?: boolean;
    requireCrossing?: boolean;
    minIntersections?: number;
};

export type Pos = { r: number; c: number };

