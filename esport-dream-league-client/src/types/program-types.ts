import { PublicKey } from '@solana/web3.js';

// ✅ Enum for Training Type
export enum TrainingType {
  Mechanical = 0,
  GameKnowledge = 1,
  TeamCommunication = 2,
  Adaptability = 3,
  Consistency = 4,
}

// ✅ Enum for Rarity
export enum Rarity {
  Common = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 4,
}

// ✅ Enum for Tournament Status
export enum TournamentStatus {
  Registration = 0,
  InProgress = 1,
  Completed = 2,
  Canceled = 3,
}

// ✅ Special Ability type
export type SpecialAbility = {
  name: string;
  value: number;
};

// ✅ Player Stats type
export type PlayerStats = {
  mechanical: number;
  gameKnowledge: number;
  teamCommunication: number;
  adaptability: number;
  consistency: number;
  potential: number;
  form: number;
};

// ✅ Roster Position
export type RosterPosition = {
  playerMint: PublicKey;
  position: string;
  addedAt: number;
};

// ✅ Team Statistics
export type TeamStatistics = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  tournamentWins: number;
  avgMechanical: number;
  avgGameKnowledge: number;
  avgTeamCommunication: number;
  synergyScore: number;
};

// ✅ Match Performance
export type MatchPerformance = {
  matchId: string;
  timestamp: number;
  win: boolean;
  mvp: boolean;
  expGained: number;
  stats: Uint8Array;
};

// ✅ Team Match Result
export type TeamMatchResult = {
  matchId: string;
  timestamp: number;
  opponent: PublicKey;
  win: boolean;
  score: [number, number];
  tournamentId: PublicKey | null;
};

// ✅ Tournament Match
export type TournamentMatch = {
  matchId: string;
  timestamp: number;
  teamA: PublicKey;
  teamB: PublicKey;
  winner: PublicKey | null;
  score: [number, number];
  round: number;
  completed: boolean;
};

/// -----------------------------------
/// ✅ Fixed Part: Adding Anchor Account Interfaces
/// -----------------------------------

export type PlayerAccount = {
  publicKey?: PublicKey; // PDA of the player
  owner: PublicKey; // Owner wallet
  mint: PublicKey; // Player NFT mint
  name: string;
  position?: string; // Role (Midlaner, Support, Jungler, etc.)
  createdAt: number;
  lastUpdated: number;
  team?: PublicKey; // Team PDA
  uri: string;
  mechanical: number;
  gameKnowledge: number;
  teamCommunication: number;
  adaptability: number;
  consistency: number;
  specialAbilities: SpecialAbility[];
  gameSpecificData: Uint8Array;
  experience: number;
  matchesPlayed: number;
  wins: number;
  mvpCount: number;
  form: number;
  potential: number;
  rarity: Rarity;
  creator?: PublicKey;
  isExclusive: boolean;
};

export interface TeamAccount {
  publicKey?: PublicKey; // PDA of the team
  owner: PublicKey; // Team owner wallet
  name: string;
  collectionMint?: PublicKey; // NFT collection mint (optional)
  logoUri?: string; // Make it optional
  createdAt: number;
  lastUpdated: number;
  roster: RosterPosition[]; // Players in the team
  statistics: TeamStatistics;
  matchHistory?: TeamMatchResult[];
}

// Added TournamentAccount based on the IDL
export interface TournamentAccount {
  publicKey?: PublicKey; // PDA of the tournament
  authority: PublicKey; // Tournament creator/authority
  name: string;
  entryFee: number; // u64 in the IDL, but we'll use number for simplicity
  prizePool: number; // u64 in the IDL, but we'll use number for simplicity
  startTime: number; // i64 in the IDL (unix timestamp)
  endTime?: number; // optional i64 (unix timestamp)
  maxTeams: number; // u8 in the IDL
  registeredTeams: PublicKey[]; // Vector of team public keys
  matches: TournamentMatch[]; // Tournament matches 
  status: TournamentStatus; // Current tournament status
  createdAt: number; // i64 in the IDL (unix timestamp)
  ended?: boolean; // Additional field for convenience
}

// Helper function to convert lamports (or other large numbers) from chain to a regular number
export function lamportsToSol(lamports: number | bigint): number {
  if (typeof lamports === 'bigint') {
    return Number(lamports) / 1_000_000_000;
  }
  return lamports / 1_000_000_000;
}

// Helper function to convert SOL to lamports for sending to the chain
export function solToLamports(sol: number): number {
  return Math.round(sol * 1_000_000_000);
}