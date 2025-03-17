'use client';

import { WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import dynamic from 'next/dynamic';
import { ReactNode, useCallback, useMemo } from 'react';
import { ProgramProvider } from '@/contexts/ProgramContextProvider';
import { solanaConnection } from '@/services/connection-service';

export const WalletButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
const DEFAULT_ENDPOINT = 'https://api.testnet.sonic.game/';

export function SolanaProvider({ children }: { children: ReactNode }) {
  // Use connection from your service instead of creating a new one
  const connection = useMemo(() => solanaConnection.getConnection(), []);
  
  // Get the endpoint from the connection for ConnectionProvider
  const endpoint = connection.rpcEndpoint || DEFAULT_ENDPOINT;
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  const onError = useCallback((error: WalletError) => {
    console.error(error);
    // Consider adding error handling that might switch endpoints on certain errors
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      solanaConnection.switchEndpoint();
    }
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