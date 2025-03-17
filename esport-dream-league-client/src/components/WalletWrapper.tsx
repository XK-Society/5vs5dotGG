// src/components/WalletWrapper.tsx
'use client';

import { ClientWalletProvider } from '@/contexts/ClientWalletProvider';
import { ProgramProvider } from '@/contexts/ProgramContextProvider';
import dynamic from 'next/dynamic';

// Import dynamically to avoid SSR issues
const WalletProviderNoSSR = dynamic(
  () => Promise.resolve(ClientWalletProvider),
  {
    ssr: false,
  }
);

export function WalletWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviderNoSSR>
      <ProgramProvider>
        {children}
      </ProgramProvider>
    </WalletProviderNoSSR>
  );
}