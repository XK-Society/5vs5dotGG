// src/components/match/match-simulator.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamAccount, PlayerAccount } from '@/lib/types/program';
import { simulateMatch, SimulatedMatchResult } from '@/lib/simulation/engine';
import MatchEvents from './match-events';
import MatchResults from './match-results';
import { useWallet } from '@/providers/WalletProvider';
import { getMyTeams } from '@/lib/api/team-service';
import { getMyPlayers } from '@/lib/api/player-service';

export type SimulatedPlayerPerformance = {
  playerMint: string;
  mechanicalChange: number;
  gameKnowledgeChange: number;
  teamCommunicationChange: number;
  adaptabilityChange: number;
  consistencyChange: number;
  formChange: number;
  expGained: number;
  isMVP: boolean;
  matchStats?: Uint8Array;
};
// Mock data for demonstration
const mockTeamA: TeamAccount = {
  owner: "TeamAOwner123456789",
  name: "Cyber Knights",
  logo_uri: "https://example.com/logos/cyber_knights.png",
  created_at: Date.now() - 10000000,
  last_updated: Date.now() - 1000000,
  roster: [
    { player_mint: "player1", position: "Mid Laner", added_at: Date.now() - 5000000 },
    { player_mint: "player2", position: "Support", added_at: Date.now() - 5000000 },
    { player_mint: "player3", position: "Carry", added_at: Date.now() - 5000000 },
    { player_mint: "player4", position: "Jungler", added_at: Date.now() - 5000000 },
    { player_mint: "player5", position: "Captain", added_at: Date.now() - 5000000 }
  ],
  statistics: {
    matches_played: 120,
    wins: 78,
    losses: 42,
    tournament_wins: 5,
    avg_mechanical: 75,
    avg_game_knowledge: 80,
    avg_team_communication: 85,
    synergy_score: 82
  },
  match_history: []
};

const mockTeamB: TeamAccount = {
  owner: "TeamBOwner123456789",
  name: "Digital Dragons",
  logo_uri: "https://example.com/logos/digital_dragons.png",
  created_at: Date.now() - 12000000,
  last_updated: Date.now() - 800000,
  roster: [
    { player_mint: "player6", position: "Mid Laner", added_at: Date.now() - 6000000 },
    { player_mint: "player7", position: "Support", added_at: Date.now() - 6000000 },
    { player_mint: "player8", position: "Carry", added_at: Date.now() - 6000000 },
    { player_mint: "player9", position: "Jungler", added_at: Date.now() - 6000000 },
    { player_mint: "player10", position: "Captain", added_at: Date.now() - 6000000 }
  ],
  statistics: {
    matches_played: 110,
    wins: 70,
    losses: 40,
    tournament_wins: 4,
    avg_mechanical: 78,
    avg_game_knowledge: 76,
    avg_team_communication: 80,
    synergy_score: 79
  },
  match_history: []
};

// Mock players for Team A
const mockPlayersA: PlayerAccount[] = [
  {
    owner: "Owner1",
    mint: "player1",
    name: "CyberKnight1",
    position: "Mid Laner",
    created_at: Date.now() - 10000000,
    last_updated: Date.now() - 1000000,
    uri: "https://example.com/players/cyberknight1",
    mechanical: 85,
    game_knowledge: 90,
    team_communication: 80,
    adaptability: 75,
    consistency: 82,
    special_abilities: [{ name: "Clutch Factor", value: 85 }],
    game_specific_data: new Uint8Array(),
    experience: 5000,
    matches_played: 150,
    wins: 95,
    mvp_count: 12,
    form: 85,
    potential: 92,
    rarity: 3, // Epic
    is_exclusive: false,
    performance_history: []
  },
  {
    owner: "Owner2",
    mint: "player2",
    name: "CyberKnight2",
    position: "Support",
    created_at: Date.now() - 9000000,
    last_updated: Date.now() - 900000,
    uri: "https://example.com/players/cyberknight2",
    mechanical: 75,
    game_knowledge: 88,
    team_communication: 92,
    adaptability: 80,
    consistency: 85,
    special_abilities: [{ name: "Shot Caller", value: 90 }],
    game_specific_data: new Uint8Array(),
    experience: 4800,
    matches_played: 140,
    wins: 90,
    mvp_count: 5,
    form: 82,
    potential: 88,
    rarity: 2, // Rare
    is_exclusive: false,
    performance_history: []
  },
  {
    owner: "Owner3",
    mint: "player3",
    name: "CyberKnight3",
    position: "Carry",
    created_at: Date.now() - 11000000,
    last_updated: Date.now() - 950000,
    uri: "https://example.com/players/cyberknight3",
    mechanical: 92,
    game_knowledge: 85,
    team_communication: 78,
    adaptability: 70,
    consistency: 88,
    special_abilities: [{ name: "Perfect Execution", value: 92 }],
    game_specific_data: new Uint8Array(),
    experience: 5200,
    matches_played: 160,
    wins: 105,
    mvp_count: 20,
    form: 90,
    potential: 95,
    rarity: 4, // Legendary
    is_exclusive: true,
    performance_history: []
  },
  {
    owner: "Owner4",
    mint: "player4",
    name: "CyberKnight4",
    position: "Jungler",
    created_at: Date.now() - 8500000,
    last_updated: Date.now() - 800000,
    uri: "https://example.com/players/cyberknight4",
    mechanical: 80,
    game_knowledge: 92,
    team_communication: 75,
    adaptability: 85,
    consistency: 78,
    special_abilities: [],
    game_specific_data: new Uint8Array(),
    experience: 4600,
    matches_played: 135,
    wins: 82,
    mvp_count: 8,
    form: 80,
    potential: 90,
    rarity: 2, // Rare
    is_exclusive: false,
    performance_history: []
  },
  {
    owner: "Owner5",
    mint: "player5",
    name: "CyberKnight5",
    position: "Captain",
    created_at: Date.now() - 12000000,
    last_updated: Date.now() - 1100000,
    uri: "https://example.com/players/cyberknight5",
    mechanical: 82,
    game_knowledge: 95,
    team_communication: 94,
    adaptability: 88,
    consistency: 90,
    special_abilities: [{ name: "Shot Caller", value: 95 }],
    game_specific_data: new Uint8Array(),
    experience: 6000,
    matches_played: 180,
    wins: 120,
    mvp_count: 15,
    form: 88,
    potential: 93,
    rarity: 3, // Epic
    is_exclusive: false,
    performance_history: []
  }
];

// Mock players for Team B
const mockPlayersB: PlayerAccount[] = [
  {
    owner: "Owner6",
    mint: "player6",
    name: "DragPlayer1",
    position: "Mid Laner",
    created_at: Date.now() - 9500000,
    last_updated: Date.now() - 950000,
    uri: "https://example.com/players/dragplayer1",
    mechanical: 88,
    game_knowledge: 85,
    team_communication: 82,
    adaptability: 78,
    consistency: 85,
    special_abilities: [{ name: "Clutch Factor", value: 88 }],
    game_specific_data: new Uint8Array(),
    experience: 5100,
    matches_played: 155,
    wins: 98,
    mvp_count: 14,
    form: 86,
    potential: 91,
    rarity: 3, // Epic
    is_exclusive: false,
    performance_history: []
  },
  {
    owner: "Owner7",
    mint: "player7",
    name: "DragPlayer2",
    position: "Support",
    created_at: Date.now() - 10200000,
    last_updated: Date.now() - 980000,
    uri: "https://example.com/players/dragplayer2",
    mechanical: 78,
    game_knowledge: 90,
    team_communication: 94,
    adaptability: 82,
    consistency: 88,
    special_abilities: [{ name: "Shot Caller", value: 92 }],
    game_specific_data: new Uint8Array(),
    experience: 4900,
    matches_played: 145,
    wins: 92,
    mvp_count: 6,
    form: 84,
    potential: 89,
    rarity: 2, // Rare
    is_exclusive: false,
    performance_history: []
  },
  {
    owner: "Owner8",
    mint: "player8",
    name: "DragPlayer3",
    position: "Carry",
    created_at: Date.now() - 11500000,
    last_updated: Date.now() - 1000000,
    uri: "https://example.com/players/dragplayer3",
    mechanical: 94,
    game_knowledge: 86,
    team_communication: 75,
    adaptability: 72,
    consistency: 84,
    special_abilities: [{ name: "Perfect Execution", value: 94 }],
    game_specific_data: new Uint8Array(),
    experience: 5300,
    matches_played: 165,
    wins: 108,
    mvp_count: 22,
    form: 92,
    potential: 96,
    rarity: 4, // Legendary
    is_exclusive: true,
    performance_history: []
  },
  {
    owner: "Owner9",
    mint: "player9",
    name: "DragPlayer4",
    position: "Jungler",
    created_at: Date.now() - 9000000,
    last_updated: Date.now() - 850000,
    uri: "https://example.com/players/dragplayer4",
    mechanical: 83,
    game_knowledge: 90,
    team_communication: 77,
    adaptability: 87,
    consistency: 80,
    special_abilities: [],
    game_specific_data: new Uint8Array(),
    experience: 4700,
    matches_played: 138,
    wins: 85,
    mvp_count: 9,
    form: 82,
    potential: 88,
    rarity: 2, // Rare
    is_exclusive: false,
    performance_history: []
  },
  {
    owner: "Owner10",
    mint: "player10",
    name: "DragPlayer5",
    position: "Captain",
    created_at: Date.now() - 12500000,
    last_updated: Date.now() - 1150000,
    uri: "https://example.com/players/dragplayer5",
    mechanical: 84,
    game_knowledge: 93,
    team_communication: 92,
    adaptability: 86,
    consistency: 88,
    special_abilities: [{ name: "Shot Caller", value: 93 }],
    game_specific_data: new Uint8Array(),
    experience: 5800,
    matches_played: 175,
    wins: 115,
    mvp_count: 13,
    form: 86,
    potential: 92,
    rarity: 3, // Epic
    is_exclusive: false,
    performance_history: []
  }
];

export default function MatchSimulator() {
  const [matchResult, setMatchResult] = useState<SimulatedMatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'results'>('events');
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [userPlayers, setUserPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { connected, publicKey } = useWallet();

  // Load user's teams and players when wallet connects
  useEffect(() => {
    const loadUserData = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true);
          
          // In a real application, you would fetch real data from the blockchain
          // For now, we'll use our mock functions
          const teams = await getMyTeams();
          const players = await getMyPlayers();
          
          setUserTeams(teams);
          setUserPlayers(players);
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [connected, publicKey]);

  // In simulateMatch function or where you create the match result and process it
// In match-simulator.tsx where you run the simulation
// In match-simulator.tsx where you run the simulation


// In match-simulator.tsx, update the runSimulation function
// In match-simulator.tsx where you create the match result
const runSimulation = () => {
  setIsSimulating(true);
  
  setTimeout(() => {
    // Create the simulation result
    const result = simulateMatch(mockTeamA, mockTeamB, mockPlayersA, mockPlayersB);
    
    // Update player mints
    result.playerPerformances.teamA.forEach((perf, i) => {
      perf.playerMint = mockPlayersA[i].mint;
    });
    
    result.playerPerformances.teamB.forEach((perf, i) => {
      perf.playerMint = mockPlayersB[i].mint;
    });
    
    // Create simple match stats - just a binary representation of the score
    // [teamAScore, teamBScore]
    const matchStats = new Uint8Array([
      result.score[0], 
      result.score[1]
    ]);
    
    console.log(`Match score: ${result.score[0]}-${result.score[1]}`);
    console.log(`Match stats bytes: [${matchStats[0]}, ${matchStats[1]}]`);
    
    // Add matchStats to all player performances
    [...result.playerPerformances.teamA, ...result.playerPerformances.teamB]
      .forEach(perf => {
        perf.matchStats = matchStats.slice(); // Create a copy
      });
    
    setMatchResult(result);
    setIsSimulating(false);
  }, 2000);
};
  const resetSimulation = () => {
    setMatchResult(null);
  };

  // Show loading state when data is being fetched
  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="ml-3">Loading team and player data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Simulation</CardTitle>
          <CardDescription>
            Simulate a match between two esports teams and see the results updated on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team A</h3>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold">{mockTeamA.name[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{mockTeamA.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {mockTeamA.statistics.wins}W - {mockTeamA.statistics.losses}L
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="text-sm">Mechanical: <span className="font-medium">{mockTeamA.statistics.avg_mechanical}</span></div>
                  <div className="text-sm">Game Knowledge: <span className="font-medium">{mockTeamA.statistics.avg_game_knowledge}</span></div>
                  <div className="text-sm">Communication: <span className="font-medium">{mockTeamA.statistics.avg_team_communication}</span></div>
                  <div className="text-sm">Synergy: <span className="font-medium">{mockTeamA.statistics.synergy_score}</span></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team B</h3>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold">{mockTeamB.name[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{mockTeamB.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {mockTeamB.statistics.wins}W - {mockTeamB.statistics.losses}L
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="text-sm">Mechanical: <span className="font-medium">{mockTeamB.statistics.avg_mechanical}</span></div>
                  <div className="text-sm">Game Knowledge: <span className="font-medium">{mockTeamB.statistics.avg_game_knowledge}</span></div>
                  <div className="text-sm">Communication: <span className="font-medium">{mockTeamB.statistics.avg_team_communication}</span></div>
                  <div className="text-sm">Synergy: <span className="font-medium">{mockTeamB.statistics.synergy_score}</span></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!matchResult ? (
            <Button 
              onClick={runSimulation} 
              disabled={isSimulating || !connected}
            >
              {isSimulating ? "Simulating..." : "Run Simulation"}
            </Button>
          ) : (
            <Button 
              onClick={resetSimulation}
              variant="outline"
            >
              Reset Simulation
            </Button>
          )}

          {!connected && (
            <p className="text-sm text-muted-foreground">
              Connect your wallet to run simulations
            </p>
          )}
        </CardFooter>
      </Card>

      {matchResult && (
        <div className="space-y-4">
          <div className="flex space-x-2 border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'events' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('events')}
            >
              Match Events
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'results' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('results')}
            >
              Match Results
            </button>
          </div>

          {activeTab === 'events' ? (
            <MatchEvents matchResult={matchResult} teamA={mockTeamA} teamB={mockTeamB} />
          ) : (
            <MatchResults 
              matchResult={matchResult} 
              teamA={mockTeamA} 
              teamB={mockTeamB} 
              playersA={mockPlayersA}
              playersB={mockPlayersB}
            />
          )}
        </div>
      )}
    </div>
  );
}