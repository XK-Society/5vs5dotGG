'use client';

import React from 'react';
import { WalletProvider as WalletProviderInternal } from '@/providers/WalletProvider';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <WalletProviderInternal>{children}</WalletProviderInternal>;
}