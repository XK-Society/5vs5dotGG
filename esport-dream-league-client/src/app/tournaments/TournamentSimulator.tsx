'use client';

import React, { useState } from 'react';
import { TeamAccount, PlayerAccount, TournamentAccount } from '@/types/program-types';
import { PublicKey } from '@solana/web3.js';
import TournamentMatchViewer from './TournamentMatchViewer';
import TournamentBracket from './TournamentBracket';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { usePlayerOperations } from '@/hooks/usePlayerOperations';

interface TournamentSimulatorProps {
  tournament: TournamentAccount;
  registeredTeams: TeamAccount[];
}

// Mock players data generator (for demo purposes)
const generateMockPlayers = (team: TeamAccount): PlayerAccount[] => {
  const positions = ['Top Laner', 'Jungler', 'Mid Laner', 'AD Carry', 'Support'];
  
  return positions.map((position, index) => {
    // Generate random stats based on synergy score
    const baseValue = 50 + (team.statistics.synergyScore / 2);
    const randomFactor = Math.floor(Math.random() * 15);
    
    return {
      publicKey: new PublicKey(team.publicKey || '11111111111111111111111111111111'),
      owner: team.owner,
      mint: new PublicKey('11111111111111111111111111111111'),
      name: `${team.name} ${position}`,
      position,
      mechanical: Math.min(99, Math.floor(baseValue + randomFactor)),
      gameKnowledge: Math.min(99, Math.floor(baseValue + randomFactor - 5)),
      teamCommunication: Math.min(99, Math.floor(baseValue + randomFactor + 5)),
      adaptability: Math.min(99, Math.floor(baseValue + randomFactor - 10)),
      consistency: Math.min(99, Math.floor(baseValue + randomFactor + 10)),
      form: Math.floor(70 + Math.random() * 30),
      createdAt: Date.now() / 1000,
      lastUpdated: Date.now() / 1000,
      rarity: Math.floor(Math.random() * 5),
      experience: Math.floor(Math.random() * 10000),
      matchesPlayed: Math.floor(Math.random() * 50),
      wins: Math.floor(Math.random() * 30),
      mvpCount: Math.floor(Math.random() * 10),
      potential: Math.floor(Math.random() * 30) + 70,
      specialAbilities: [],
      gameSpecificData: new Uint8Array(),
      isExclusive: false,
      uri: ''
    };
  });
};

const TournamentSimulator: React.FC<TournamentSimulatorProps> = ({
  tournament,
  registeredTeams
}) => {
  const { recordMatchResult } = useTournamentOperations();
  const { fetchTeamAccount } = useTeamOperations();
  const { fetchPlayerAccount } = usePlayerOperations();
  
  const [simulationStep, setSimulationStep] = useState<'bracket' | 'match'>('bracket');
  const [selectedMatch, setSelectedMatch] = useState<{
    teamA: TeamAccount;
    teamB: TeamAccount;
    teamAPlayers: PlayerAccount[];
    teamBPlayers: PlayerAccount[];
  } | null>(null);
  
  const [bracketData, setBracketData] = useState<{
    rounds: Array<{
      name: string;
      matches: Array<{
        id: string;
        teamA: TeamAccount | null;
        teamB: TeamAccount | null;
        winner: TeamAccount | null;
        score: [number, number] | null;
      }>;
    }>;
  }>({
    rounds: []
  });
  
  // Initialize or update the tournament bracket
  const initializeBracket = () => {
    // For simplicity in this demo, let's just create a single-elimination bracket
    // In a real application, we would get this from the tournament state
    
    const teams = [...registeredTeams];
    
    // If we don't have enough teams, pad with nulls
    while (teams.length < tournament.maxTeams) {
      teams.push(null as unknown as TeamAccount);
    }
    
    // Create a power-of-two bracket based on team count
    const roundCount = Math.ceil(Math.log2(teams.length));
    const matchCount = Math.pow(2, roundCount - 1);
    
    // Create rounds
    const rounds = [];
    
    // First round (initial matches)
    const firstRoundMatches = [];
    for (let i = 0; i < matchCount; i++) {
      const teamAIndex = i * 2;
      const teamBIndex = i * 2 + 1;
      
      firstRoundMatches.push({
        id: `match-r1-${i}`,
        teamA: teamAIndex < teams.length ? teams[teamAIndex] : null,
        teamB: teamBIndex < teams.length ? teams[teamBIndex] : null,
        winner: null,
        score: null
      });
    }
    
    rounds.push({
      name: 'Round 1',
      matches: firstRoundMatches
    });
    
    // Create subsequent rounds
    let currentRoundMatches = matchCount;
    for (let round = 2; round <= roundCount; round++) {
      const matches = [];
      currentRoundMatches = currentRoundMatches / 2;
      
      for (let i = 0; i < currentRoundMatches; i++) {
        matches.push({
          id: `match-r${round}-${i}`,
          teamA: null,
          teamB: null,
          winner: null,
          score: null
        });
      }
      
      rounds.push({
        name: round === roundCount ? 'Final' : `Round ${round}`,
        matches
      });
    }
    
    setBracketData({ rounds });
  };
  
  // Start the tournament simulation
  const startTournament = () => {
    initializeBracket();
  };
  
  // Handle match selection from the bracket
  const handleSelectMatch = (matchId: string) => {
    // Find the match in the bracket
    for (const round of bracketData.rounds) {
      const match = round.matches.find(m => m.id === matchId);
      if (match && match.teamA && match.teamB && !match.winner) {
        // Create mock players for the teams
        const teamAPlayers = generateMockPlayers(match.teamA);
        const teamBPlayers = generateMockPlayers(match.teamB);
        
        setSelectedMatch({
          teamA: match.teamA,
          teamB: match.teamB,
          teamAPlayers,
          teamBPlayers
        });
        
        setSimulationStep('match');
        return;
      }
    }
  };
  
  // Handle match completion
  const handleMatchComplete = (winner: TeamAccount, score: [number, number]) => {
    if (!selectedMatch) return;
    
    // Update the bracket with match results
    const newBracketData = { ...bracketData };
    
    // Find the current match and update it
    let currentMatchFound = false;
    let currentRoundIndex = -1;
    let currentMatchIndex = -1;
    
    for (let r = 0; r < newBracketData.rounds.length; r++) {
      const round = newBracketData.rounds[r];
      for (let m = 0; m < round.matches.length; m++) {
        const match = round.matches[m];
        if (match.teamA?.publicKey?.toString() === selectedMatch.teamA.publicKey?.toString() &&
            match.teamB?.publicKey?.toString() === selectedMatch.teamB.publicKey?.toString() &&
            !match.winner) {
          match.winner = winner;
          match.score = score;
          currentMatchFound = true;
          currentRoundIndex = r;
          currentMatchIndex = m;
          break;
        }
      }
      if (currentMatchFound) break;
    }
    
    // If we found the current match and it's not the final, propagate the winner to the next round
    if (currentMatchFound && currentRoundIndex < newBracketData.rounds.length - 1) {
      const nextRound = newBracketData.rounds[currentRoundIndex + 1];
      const nextMatchIndex = Math.floor(currentMatchIndex / 2);
      const nextMatch = nextRound.matches[nextMatchIndex];
      
      // Determine if this winner goes to teamA or teamB slot in the next match
      const isTeamASlot = currentMatchIndex % 2 === 0;
      
      if (isTeamASlot) {
        nextMatch.teamA = winner;
      } else {
        nextMatch.teamB = winner;
      }
    }
    
    setBracketData(newBracketData);
    
    // Record the match result on-chain (would be implemented in a real app)
    // This is simplified for the demo
    const recordMatch = async () => {
      /*
      try {
        if (!tournament.publicKey) return;
        
        await recordMatchResult(
          tournament.publicKey,
          `match-${Date.now()}`,
          winner.publicKey!,
          winner.publicKey === selectedMatch.teamA.publicKey
            ? selectedMatch.teamB.publicKey!
            : selectedMatch.teamA.publicKey!,
          score,
          new Uint8Array()
        );
      } catch (error) {
        console.error('Error recording match result:', error);
      }
      */
    };
    
    recordMatch();
  };
  
  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Tournament Simulation</h2>
      
      {simulationStep === 'bracket' && (
        <>
          {bracketData.rounds.length === 0 ? (
            <div className="text-center py-10">
              <p className="mb-6">Ready to start the tournament simulation?</p>
              <button
                onClick={startTournament}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Start Tournament
              </button>
            </div>
          ) : (
            <TournamentBracket
              rounds={bracketData.rounds}
              onSelectMatch={handleSelectMatch}
            />
          )}
        </>
      )}
      
      {simulationStep === 'match' && selectedMatch && (
        <>
          <div className="mb-4">
            <button
              onClick={() => setSimulationStep('bracket')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Bracket
            </button>
          </div>
          
          <TournamentMatchViewer
            teamA={selectedMatch.teamA}
            teamB={selectedMatch.teamB}
            teamAPlayers={selectedMatch.teamAPlayers}
            teamBPlayers={selectedMatch.teamBPlayers}
            onMatchComplete={handleMatchComplete}
            autoPlay={true}
          />
        </>
      )}
    </div>
  );
};

export default TournamentSimulator;