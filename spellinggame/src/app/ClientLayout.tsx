"use client";

import { StoreProvider } from '@/store/provider';
import type { ReactNode } from 'react';

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return <StoreProvider>{children}</StoreProvider>;
}

