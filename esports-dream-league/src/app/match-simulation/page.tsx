// src/app/match-simulation/page.tsx
'use client';

import MatchSimulator from '@/components/match/match-simulator';
import { ConnectWalletCard } from './connect-wallet-card';

export default function MatchSimulationPage() {
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