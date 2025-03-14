// src/app/match-simulation/connect-wallet-card.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/providers/WalletProvider';

export function ConnectWalletCard() {
  const { connected, connecting, connectWallet, disconnect, publicKey, walletName } = useWallet();

  if (connected) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Wallet Connected</CardTitle>
          <CardDescription>
            You're connected with {walletName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground break-all">
              {publicKey}
            </p>
            <Button variant="outline" onClick={disconnect} className="self-start">
              Disconnect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect your wallet to record match results on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={connectWallet} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </CardContent>
    </Card>
  );
}