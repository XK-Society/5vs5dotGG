// src/components/match/match-results.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamAccount, PlayerAccount, Rarity } from '@/lib/types/program';
import { SimulatedMatchResult } from '@/lib/simulation/engine';
import { useWallet } from '@/providers/WalletProvider';

interface MatchResultsProps {
  matchResult: SimulatedMatchResult;
  teamA: TeamAccount;
  teamB: TeamAccount;
  playersA: PlayerAccount[];
  playersB: PlayerAccount[];
}

// Map rarity to a display string
const getRarityDisplay = (rarity: Rarity): string => {
  switch (rarity) {
    case Rarity.Common:
      return 'Common';
    case Rarity.Uncommon:
      return 'Uncommon';
    case Rarity.Rare:
      return 'Rare';
    case Rarity.Epic:
      return 'Epic';
    case Rarity.Legendary:
      return 'Legendary';
    default:
      return 'Unknown';
  }
};

// Map rarity to a color
const getRarityColor = (rarity: Rarity): string => {
  switch (rarity) {
    case Rarity.Common:
      return 'text-gray-400';
    case Rarity.Uncommon:
      return 'text-green-400';
    case Rarity.Rare:
      return 'text-blue-400';
    case Rarity.Epic:
      return 'text-purple-400';
    case Rarity.Legendary:
      return 'text-amber-400';
    default:
      return 'text-gray-400';
  }
};

export default function MatchResults({ 
  matchResult, 
  teamA, 
  teamB, 
  playersA, 
  playersB 
}: MatchResultsProps) {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { connected } = useWallet();

  const recordMatchOnChain = async () => {
    if (!connected) {
      setErrorMessage('Please connect your wallet to record the match results on-chain.');
      return;
    }

    try {
      setRecordingState('recording');
      
      // In a real implementation, you would call your match service here
      // to record the match results on the blockchain
      
      // Simulate delay and success for demo purposes
      setTimeout(() => {
        setRecordingState('success');
      }, 2000);
    } catch (error) {
      console.error('Error recording match on chain:', error);
      setRecordingState('error');
      setErrorMessage('An error occurred while recording the match on-chain.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Results</CardTitle>
          <CardDescription>
            Player performance statistics and stat changes from the match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8">
            {/* Team A Results */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-500">{teamA.name}</h3>
              <div className="grid gap-4">
                {playersA.map((player, index) => {
                  const performance = matchResult.playerPerformances.teamA[index];
                  if (!performance) return null;
                  
                  return (
                    <div key={player.mint} className="bg-secondary/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-bold">{player.name}</h4>
                            {performance.isMVP && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                                MVP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm">{player.position}</p>
                            <span className={`text-xs ${getRarityColor(player.rarity)}`}>
                              {getRarityDisplay(player.rarity)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Experience gained: <span className="font-medium text-green-500">+{performance.expGained}</span></p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          Mechanical: <span className={performance.mechanicalChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.mechanicalChange >= 0 ? '+' : ''}{performance.mechanicalChange}
                          </span>
                        </div>
                        <div>
                          Game Knowledge: <span className={performance.gameKnowledgeChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.gameKnowledgeChange >= 0 ? '+' : ''}{performance.gameKnowledgeChange}
                          </span>
                        </div>
                        <div>
                          Team Communication: <span className={performance.teamCommunicationChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.teamCommunicationChange >= 0 ? '+' : ''}{performance.teamCommunicationChange}
                          </span>
                        </div>
                        <div>
                          Adaptability: <span className={performance.adaptabilityChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.adaptabilityChange >= 0 ? '+' : ''}{performance.adaptabilityChange}
                          </span>
                        </div>
                        <div>
                          Consistency: <span className={performance.consistencyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.consistencyChange >= 0 ? '+' : ''}{performance.consistencyChange}
                          </span>
                        </div>
                        <div>
                          Form: <span className={performance.formChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.formChange >= 0 ? '+' : ''}{performance.formChange}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Team B Results */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-500">{teamB.name}</h3>
              <div className="grid gap-4">
                {playersB.map((player, index) => {
                  const performance = matchResult.playerPerformances.teamB[index];
                  if (!performance) return null;
                  
                  return (
                    <div key={player.mint} className="bg-secondary/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-bold">{player.name}</h4>
                            {performance.isMVP && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                                MVP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm">{player.position}</p>
                            <span className={`text-xs ${getRarityColor(player.rarity)}`}>
                              {getRarityDisplay(player.rarity)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Experience gained: <span className="font-medium text-green-500">+{performance.expGained}</span></p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          Mechanical: <span className={performance.mechanicalChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.mechanicalChange >= 0 ? '+' : ''}{performance.mechanicalChange}
                          </span>
                        </div>
                        <div>
                          Game Knowledge: <span className={performance.gameKnowledgeChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.gameKnowledgeChange >= 0 ? '+' : ''}{performance.gameKnowledgeChange}
                          </span>
                        </div>
                        <div>
                          Team Communication: <span className={performance.teamCommunicationChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.teamCommunicationChange >= 0 ? '+' : ''}{performance.teamCommunicationChange}
                          </span>
                        </div>
                        <div>
                          Adaptability: <span className={performance.adaptabilityChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.adaptabilityChange >= 0 ? '+' : ''}{performance.adaptabilityChange}
                          </span>
                        </div>
                        <div>
                          Consistency: <span className={performance.consistencyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.consistencyChange >= 0 ? '+' : ''}{performance.consistencyChange}
                          </span>
                        </div>
                        <div>
                          Form: <span className={performance.formChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {performance.formChange >= 0 ? '+' : ''}{performance.formChange}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Match On-Chain</CardTitle>
          <CardDescription>
            Submit these match results to the blockchain to permanently record player performance changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recordingState === 'idle' && (
              <Button onClick={recordMatchOnChain} disabled={!connected}>
                Record Match Results
              </Button>
            )}
            
            {recordingState === 'recording' && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <p>Recording match results on-chain...</p>
              </div>
            )}
            
            {recordingState === 'success' && (
              <div className="flex items-center space-x-2 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>Match results successfully recorded on the blockchain!</p>
              </div>
            )}
            
            {recordingState === 'error' && (
              <div className="flex items-center space-x-2 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p>{errorMessage || 'An error occurred while recording the match results.'}</p>
              </div>
            )}
            
            {!connected && (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to record match results on-chain
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}