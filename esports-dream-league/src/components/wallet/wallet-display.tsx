'use client';

import React from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { shortenAddress, getExplorerUrl } from '@/lib/utils/solana-utils';
import { Button } from '@/components/ui/button';

export function WalletDisplay() {
  const { connected, connecting, connectWallet, disconnect, publicKey, walletName } = useWallet();

  if (!connected) {
    return (
      <Button 
        onClick={connectWallet} 
        disabled={connecting}
        variant="outline"
        className="w-full"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="bg-secondary/20 rounded-lg p-4 w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="text-sm font-bold">{walletName?.[0] || 'W'}</span>
            </div>
            <span className="ml-2 text-sm font-semibold">{walletName || 'Wallet'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Address:</span>
          <a 
            href={getExplorerUrl('address', publicKey || '')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {shortenAddress(publicKey, 4)}
          </a>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Connected to Solana Devnet
        </p>
      </div>
    </div>
  );
}