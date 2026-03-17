import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameProgress {
    unlocked: number;
    results: number[];
}

const initialState: GameProgress = {
    unlocked: 1,
    results: [],
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setUnlocked: (state: GameProgress, action: PayloadAction<number>) => {
            state.unlocked = action.payload;
        },
        setStars: (state: GameProgress, action: PayloadAction<{ level: number; stars: number }>) => {
            state.results[action.payload.level] = Math.max(
                state.results[action.payload.level] || 0,
                action.payload.stars
            );
        },
        setProgress: (state: GameProgress, action: PayloadAction<GameProgress>) => {
            state.unlocked = action.payload.unlocked;
            state.results = action.payload.results;
        },
    },
});

export const { setUnlocked, setStars, setProgress } = gameSlice.actions;
export default gameSlice.reducer;

