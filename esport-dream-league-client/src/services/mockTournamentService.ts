// src/services/mockTournamentService.ts
import { TeamAccount, TournamentAccount, TournamentStatus, RosterPosition, PlayerAccount, Rarity } from '@/types/program-types';
import { PublicKey } from '@solana/web3.js';

// Valid Solana public keys for mock data
const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');
const OWNER_KEY = new PublicKey('7py6RA32AoBFcEuqzSUxYf56pehYRkB5VzSUxYf56peh');
const TEAM_A_KEY = new PublicKey('ASpJBf2XSvt1d8ELr2VJnQmfKr5rPcBZpjqTLScWBPQM');
const TEAM_B_KEY = new PublicKey('HzdveFgWNpzMpCTPr9bLwPNKbtkUWwMTVrg9C8vVdVrk');
const TOURNAMENT_KEY = new PublicKey('2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ');

// Generate mock players for a team
const generateMockPlayers = (team: TeamAccount, count: number = 5): PlayerAccount[] => {
  const positions = ['Top Laner', 'Jungler', 'Mid Laner', 'AD Carry', 'Support'];
  
  return Array(count).fill(null).map((_, index) => {
    const playerNumber = index + 1;
    const position = positions[index % positions.length];
    
    // Base stats with some randomization
    const baseScore = 60 + Math.floor(Math.random() * 20);
    
    return {
      publicKey: new PublicKey(SYSTEM_PROGRAM_ID.toBase58()), // Using system program ID as a placeholder
      owner: team.owner,
      mint: new PublicKey(SYSTEM_PROGRAM_ID.toBase58()),
      name: `${team.name} ${position}`,
      position,
      createdAt: team.createdAt,
      lastUpdated: team.lastUpdated,
      uri: '/images/placeholder-player.png',
      mechanical: baseScore + Math.floor(Math.random() * 10),
      gameKnowledge: baseScore + Math.floor(Math.random() * 10),
      teamCommunication: baseScore + Math.floor(Math.random() * 10),
      adaptability: baseScore - Math.floor(Math.random() * 10),
      consistency: baseScore - Math.floor(Math.random() * 5),
      specialAbilities: [],
      gameSpecificData: new Uint8Array(),
      experience: 1000 * playerNumber,
      matchesPlayed: 10 * playerNumber,
      wins: 6 * playerNumber,
      mvpCount: playerNumber,
      form: 75 + Math.floor(Math.random() * 15),
      potential: 85 + Math.floor(Math.random() * 10),
      rarity: Math.random() > 0.8 ? Rarity.Epic : Math.random() > 0.6 ? Rarity.Rare : Rarity.Common,
      isExclusive: false
    };
  });
};

// Create roster positions for a team
const createRosterPositions = (players: PlayerAccount[]): RosterPosition[] => {
  return players.map(player => ({
    playerMint: player.mint,
    position: player.position || 'Unknown',
    addedAt: Math.floor(Date.now() / 1000) - 86400 // Added 1 day ago
  }));
};

// Generate mock teams
export const generateMockTeams = (): TeamAccount[] => {
  // Team A - Higher stats
  const teamA: TeamAccount = {
    publicKey: TEAM_A_KEY,
    owner: OWNER_KEY,
    name: 'Phantom Legends',
    logoUri: '/images/placeholder-team-logo.png',
    createdAt: Math.floor(Date.now() / 1000) - 30 * 86400, // Created 30 days ago
    lastUpdated: Math.floor(Date.now() / 1000) - 2 * 86400, // Updated 2 days ago
    roster: [], // Will be filled after player generation
    statistics: {
      matchesPlayed: 25,
      wins: 18,
      losses: 7,
      tournamentWins: 3,
      avgMechanical: 85,
      avgGameKnowledge: 82,
      avgTeamCommunication: 78,
      synergyScore: 88
    },
    matchHistory: []
  };

  // Team B - Lower stats
  const teamB: TeamAccount = {
    publicKey: TEAM_B_KEY,
    owner: OWNER_KEY,
    name: 'Cyber Wolves',
    logoUri: '/images/placeholder-team-logo.png',
    createdAt: Math.floor(Date.now() / 1000) - 20 * 86400, // Created 20 days ago
    lastUpdated: Math.floor(Date.now() / 1000) - 1 * 86400, // Updated 1 day ago
    roster: [], // Will be filled after player generation
    statistics: {
      matchesPlayed: 18,
      wins: 11,
      losses: 7,
      tournamentWins: 1,
      avgMechanical: 78,
      avgGameKnowledge: 75,
      avgTeamCommunication: 82,
      synergyScore: 80
    },
    matchHistory: []
  };

  // Generate players for teams
  const teamAPlayers = generateMockPlayers(teamA);
  const teamBPlayers = generateMockPlayers(teamB);

  // Update team rosters
  teamA.roster = createRosterPositions(teamAPlayers);
  teamB.roster = createRosterPositions(teamBPlayers);

  return [teamA, teamB];
};

// Create a mock tournament
export const createMockTournament = (teams: TeamAccount[]): TournamentAccount => {
  return {
    publicKey: TOURNAMENT_KEY,
    authority: OWNER_KEY,
    name: 'Solana Champions Cup',
    entryFee: 10000000, // 0.01 SOL
    prizePool: 80000000, // 0.08 SOL
    startTime: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
    maxTeams: 8,
    registeredTeams: teams.map(team => team.publicKey as PublicKey),
    matches: [],
    status: TournamentStatus.Registration,
    createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  };
};

// Get all mock data for tournament simulation
export function getMockTournamentData(): {
  tournament: TournamentAccount;
  teams: TeamAccount[];
  teamAPlayers: PlayerAccount[];
  teamBPlayers: PlayerAccount[];
} {
  const teams = generateMockTeams();
  const tournament = createMockTournament(teams);
  
  const teamAPlayers = generateMockPlayers(teams[0]);
  const teamBPlayers = generateMockPlayers(teams[1]);
  
  return {
    tournament,
    teams,
    teamAPlayers,
    teamBPlayers
  };
}