// src/components/match/match-results.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamAccount, PlayerAccount, Rarity } from '@/lib/types/program';
import { SimulatedMatchResult } from '@/lib/simulation/engine';
import { useWallet } from '@/providers/WalletProvider';
import { recordSinglePlayerOnChain } from '@/lib/api/match-service';

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
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B' | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'selecting' | 'processing' | 'success' | 'error'>('idle');
  const [processedPlayers, setProcessedPlayers] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionSignatures, setTransactionSignatures] = useState<string[]>([]);
  const { connected, publicKey } = useWallet();

  const startRecordingProcess = () => {
    if (!connected || !publicKey) {
      setErrorMessage('Please connect your wallet to record the match results on-chain.');
      return;
    }
    
    setRecordingState('selecting');
    // Start with first player from Team A
    setCurrentTeam('A');
    setCurrentPlayerIndex(0);
  };

  const recordCurrentPlayer = async () => {
    if (!connected || !publicKey || currentTeam === null || currentPlayerIndex === -1) {
      return;
    }

    const team = currentTeam === 'A' ? 'teamA' : 'teamB';
    const performance = matchResult.playerPerformances[team][currentPlayerIndex];
    const player = currentTeam === 'A' ? playersA[currentPlayerIndex] : playersB[currentPlayerIndex];

    if (!performance || !player) {
      moveToNextPlayer();
      return;
    }

    setRecordingState('processing');

    try {
      // Determine if this player was on the winning team
      const isWinner = (currentTeam === 'A' && matchResult.winnerIndex === 0) || 
                       (currentTeam === 'B' && matchResult.winnerIndex === 1);
      
      // Create match stats (simple for now)
      const matchStats = new Uint8Array([
        matchResult.score[0], 
        matchResult.score[1]
      ]);

      const result = await recordSinglePlayerOnChain(
        player.mint,
        matchResult.matchId,
        isWinner,
        performance.isMVP,
        performance.expGained,
        performance.mechanicalChange,
        performance.gameKnowledgeChange,
        performance.teamCommunicationChange,
        performance.adaptabilityChange,
        performance.consistencyChange,
        performance.formChange,
        matchStats
      );

      if (result.success) {
        // Add the signature to our list, ensuring it's never undefined
        setTransactionSignatures(prev => [...prev, result.signature || `tx-${Date.now()}`]);
        // Add this player to processed list
        setProcessedPlayers(prev => [...prev, player.mint]);
        // Move to the next player
        moveToNextPlayer();
      } else {
        setRecordingState('error');
        setErrorMessage(result.error || 'Failed to record player data on blockchain');
      }
    } catch (error) {
      console.error('Error recording player performance:', error);
      setRecordingState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const moveToNextPlayer = () => {
    // Determine the next player to process
    if (currentTeam === 'A') {
      if (currentPlayerIndex + 1 < playersA.length) {
        // Move to next player in team A
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setRecordingState('selecting');
      } else {
        // Move to team B
        setCurrentTeam('B');
        setCurrentPlayerIndex(0);
        setRecordingState('selecting');
      }
    } else if (currentTeam === 'B') {
      if (currentPlayerIndex + 1 < playersB.length) {
        // Move to next player in team B
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setRecordingState('selecting');
      } else {
        // Finished all players
        setRecordingState('success');
        setCurrentTeam(null);
        setCurrentPlayerIndex(-1);
      }
    }
  };

  const skipCurrentPlayer = () => {
    moveToNextPlayer();
  };

  const resetRecording = () => {
    setRecordingState('idle');
    setCurrentTeam(null);
    setCurrentPlayerIndex(-1);
    setErrorMessage(null);
  };

  // Helper function to get the current player information
  const getCurrentPlayerInfo = () => {
    if (currentTeam === null || currentPlayerIndex === -1) return null;
    
    const player = currentTeam === 'A' 
      ? playersA[currentPlayerIndex] 
      : playersB[currentPlayerIndex];
      
    const performance = currentTeam === 'A'
      ? matchResult.playerPerformances.teamA[currentPlayerIndex]
      : matchResult.playerPerformances.teamB[currentPlayerIndex];
      
    if (!player || !performance) return null;
    
    return { player, performance, team: currentTeam === 'A' ? teamA : teamB };
  };

  const currentPlayerInfo = getCurrentPlayerInfo();

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
                  
                  const isProcessed = processedPlayers.includes(player.mint);
                  const isCurrentlyRecording = recordingState === 'processing' && 
                                              currentTeam === 'A' && 
                                              currentPlayerIndex === index;
                  
                  return (
                    <div key={player.mint} className={`bg-secondary/30 rounded-lg p-4 
                      ${isProcessed ? 'border-2 border-green-500' : ''} 
                      ${isCurrentlyRecording ? 'border-2 border-blue-500' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-bold">{player.name}</h4>
                            {performance.isMVP && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                                MVP
                              </span>
                            )}
                            {isProcessed && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                                Recorded
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
                  
                  const isProcessed = processedPlayers.includes(player.mint);
                  const isCurrentlyRecording = recordingState === 'processing' && 
                                              currentTeam === 'B' && 
                                              currentPlayerIndex === index;
                  
                  return (
                    <div key={player.mint} className={`bg-secondary/30 rounded-lg p-4 
                      ${isProcessed ? 'border-2 border-green-500' : ''} 
                      ${isCurrentlyRecording ? 'border-2 border-blue-500' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-bold">{player.name}</h4>
                            {performance.isMVP && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                                MVP
                              </span>
                            )}
                            {isProcessed && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                                Recorded
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
            Submit match results to the blockchain to permanently record player performance changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recordingState === 'idle' && (
              <div>
                <Button onClick={startRecordingProcess} disabled={!connected}>
                  Record Match Results
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  You'll record each player's performance individually.
                </p>
              </div>
            )}
            
            {recordingState === 'selecting' && currentPlayerInfo && (
              <div className="space-y-4 border p-4 rounded-md">
                <div className="flex justify-between">
                  <h3 className="font-semibold">Record Player: {currentPlayerInfo.player.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    currentPlayerInfo.team === teamA ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {currentPlayerInfo.team.name}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    Mechanical: <span className={currentPlayerInfo.performance.mechanicalChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {currentPlayerInfo.performance.mechanicalChange >= 0 ? '+' : ''}{currentPlayerInfo.performance.mechanicalChange}
                    </span>
                  </div>
                  <div>
                    Game Knowledge: <span className={currentPlayerInfo.performance.gameKnowledgeChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {currentPlayerInfo.performance.gameKnowledgeChange >= 0 ? '+' : ''}{currentPlayerInfo.performance.gameKnowledgeChange}
                    </span>
                  </div>
                  <div>
                    Team Comm.: <span className={currentPlayerInfo.performance.teamCommunicationChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {currentPlayerInfo.performance.teamCommunicationChange >= 0 ? '+' : ''}{currentPlayerInfo.performance.teamCommunicationChange}
                    </span>
                  </div>
                  <div>
                    Adaptability: <span className={currentPlayerInfo.performance.adaptabilityChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {currentPlayerInfo.performance.adaptabilityChange >= 0 ? '+' : ''}{currentPlayerInfo.performance.adaptabilityChange}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={skipCurrentPlayer}>
                    Skip Player
                  </Button>
                  <Button onClick={recordCurrentPlayer}>
                    Record on Blockchain
                  </Button>
                </div>
              </div>
            )}
            
            {recordingState === 'processing' && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <p>Recording player data on-chain...</p>
              </div>
            )}
            
            {recordingState === 'success' && (
              <div className="flex flex-col space-y-4">
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
                
                <p className="text-sm text-muted-foreground">
                  {processedPlayers.length} player(s) updated on-chain.
                </p>
                
                {transactionSignatures.length > 0 && (
                  <div className="mt-2 text-sm">
                    <p className="text-muted-foreground mb-1">Transaction signatures:</p>
                    <ul className="space-y-1 h-32 overflow-y-auto">
                      {transactionSignatures.map((sig, i) => (
                        <li key={i} className="break-all">
                          <a 
                            href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {sig}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button variant="outline" onClick={resetRecording}>
                  Done
                </Button>
              </div>
            )}
            
            {recordingState === 'error' && (
              <div className="flex flex-col space-y-4">
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
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={resetRecording}>
                    Cancel
                  </Button>
                  {currentPlayerInfo && (
                    <Button onClick={recordCurrentPlayer}>
                      Retry Current Player
                    </Button>
                  )}
                  {currentPlayerInfo && (
                    <Button variant="outline" onClick={skipCurrentPlayer}>
                      Skip & Continue
                    </Button>
                  )}
                </div>
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