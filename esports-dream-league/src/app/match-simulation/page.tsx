// src/app/match-simulation/page.tsx
'use client';

import { WalletProvider } from '@/providers/WalletProvider';
import MatchSimulator from '@/components/match/match-simulator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/providers/WalletProvider';

function ConnectWalletCard() {
  const { connected, connecting, createNewWallet } = useWallet();

  if (connected) {
    return null;
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
        <Button onClick={createNewWallet} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </CardContent>
    </Card>
  );
}

function MatchSimulationPageContent() {
  return (
    <div className="container py-10 max-w-screen-lg">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Match Simulation</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Run AI-powered simulations of esports matches and record the results on the Solana blockchain
        </p>
      </div>

      <ConnectWalletCard />
      <MatchSimulator />
    </div>
  );
}

export default function MatchSimulationPage() {
  return (
    <WalletProvider>
      <MatchSimulationPageContent />
    </WalletProvider>
  );
}