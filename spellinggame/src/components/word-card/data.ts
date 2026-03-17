import type { LevelConfig } from "./types";

export const WORD_POOLS: string[][] = [
    // Level 1-2 (3-4 letters)
    ["CAT", "DOG", "SUN", "HAT", "RED", "BIG", "FUN", "CUP", "BED", "PEN"],
    // Level 3-5 (4-5 letters)
    ["TREE", "FISH", "BIRD", "STAR", "MOON", "BOOK", "BALL", "CAKE", "MILK", "FROG"],
    // Level 6-8 (5-6 letters)
    [
        "APPLE",
        "WATER",
        "HAPPY",
        "MUSIC",
        "TIGER",
        "FLOWER",
        "HOUSE",
        "OCEAN",
        "PIZZA",
        "QUEEN",
    ],
    // Level 9+ (6+ letters)
    [
        "ORANGE",
        "BANANA",
        "YELLOW",
        "PURPLE",
        "GARDEN",
        "RABBIT",
        "MONKEY",
        "SUNFLOWER",
        "RAINBOW",
        "ELEPHANT",
    ],
    // Tricky spellings (silent letters / weird vowels) (6-9 letters)
    [
        "KNIFE",
        "WRITE",
        "WRONG",
        "KNOCK",
        "WHISKEY",
        "RECEIVE",
        "BELIEVE",
        "FRIEND",
        "ENOUGH",
        "THOUGHT",
        "COUGH",
        "DAUGHTER",
        "WOULD",
        "SHOULD",
    ],
    // Harder spellings (8-12 letters)
    [
        "NECESSARY",
        "SEPARATE",
        "BUSINESS",
        "DELICIOUS",
        "BEAUTIFUL",
        "TOMORROW",
        "CALENDAR",
        "FEBRUARY",
        "EMBARRASS",
        "BEGINNING",
        "DISCIPLINE",
        "TEMPERATURE",
        "ENVIRONMENT",
        "ACCOMMODATE",
    ],
];

export const LEVELS: LevelConfig[] = [
    { size: 7, words: 3, pool: 0 },
    { size: 8, words: 4, pool: 0 },
    { size: 8, words: 4, pool: 1 },
    { size: 9, words: 5, pool: 1 },
    { size: 9, words: 5, pool: 2 },
    // Level 6+ starts introducing crossings (intersections) reliably
    { size: 10, words: 6, pool: 2, requireCrossing: true, minIntersections: 1 },
    { size: 10, words: 6, pool: 2, requireCrossing: true, minIntersections: 1 },
    { size: 10, words: 7, pool: 3, requireCrossing: true, minIntersections: 1 },
    { size: 11, words: 8, pool: 3, requireCrossing: true, minIntersections: 2 },
    { size: 12, words: 9, pool: 3, requireCrossing: true, minIntersections: 2 },
    // Advanced (bigger grids + tricky spellings + diagonals)
    { size: 12, words: 9, pool: 4, diagonal: true, requireCrossing: true, minIntersections: 2 },
    { size: 12, words: 10, pool: 4, diagonal: true, requireCrossing: true, minIntersections: 2 },
    { size: 12, words: 10, pool: 5, diagonal: true, requireCrossing: true, minIntersections: 3 },
    { size: 12, words: 11, pool: 5, diagonal: true, requireCrossing: true, minIntersections: 3 },
];

