"use client";

import { StoreProvider } from '@/store/provider';
import type { ReactNode } from 'react';

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
        });
    }
    return <StoreProvider>{children}</StoreProvider>;
}

