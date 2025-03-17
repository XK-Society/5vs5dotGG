'use client';

import { WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import dynamic from 'next/dynamic';
import { ReactNode, useCallback, useMemo } from 'react';
import { ProgramProvider } from '@/contexts/ProgramContextProvider';
import { Connection } from '@solana/web3.js';

// Don't try to import the CSS file that doesn't exist

export const WalletButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function SolanaProvider({ children }: { children: ReactNode }) {
  // We use a fixed endpoint for devnet with custom configuration
  const endpoint = 'https://rpc.ankr.com/solana_devnet/859e3dfc5fea2edd45e9dd3fd2748eee4daa40a8a5281a967b0d3d08e87afafe';
  
  // Custom connection configuration to handle rate limiting
  const connection = useMemo(() => {
    return new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000, // 60 seconds
      disableRetryOnRateLimit: false, // Enable built-in retry on rate limit
      // Lower the request batch size to reduce rate limit issues
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        });
      }
    });
  }, []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <WalletModalProvider>
          <ProgramProvider>
            {children}
          </ProgramProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}