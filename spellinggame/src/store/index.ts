import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import gameReducer from './gameSlice';

const persistConfig = {
    key: 'word_hunt_progress',
    storage,
};

const persistedGameReducer = persistReducer(persistConfig, gameReducer);

export const store = configureStore({
    reducer: {
        game: persistedGameReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);

