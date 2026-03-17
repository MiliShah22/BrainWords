'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import type { RootState } from './index';

interface StoreProviderProps {
    children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
    const didHydrate = useRef(false);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
}

