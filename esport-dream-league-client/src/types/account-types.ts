// src/types/account-types.ts
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { TournamentStatus } from './program-types';

// Tournament Account Type
export interface TournamentAccount {
  authority: PublicKey;
  name: string;
  entryFee: anchor.BN;
  prizePool: anchor.BN;
  startTime: anchor.BN;
  endTime?: anchor.BN;
  maxTeams: number;
  registeredTeams: PublicKey[];
  matches?: TournamentMatch[];
  status: TournamentStatus;
  createdAt: number;
  publicKey?: PublicKey; // Add this for convenience when working with the account
}

// Tournament Match Type
export interface TournamentMatch {
  matchId: string;
  timestamp: anchor.BN;
  teamA: PublicKey;
  teamB: PublicKey;
  winner?: PublicKey;
  score: [number, number];
  round: number;
  completed: boolean;
}

// Team Account Type
export interface TeamAccount {
  publicKey?: PublicKey; // PDA of the team
  owner: PublicKey; // Team owner wallet
  name: string;
  collectionMint?: PublicKey; // NFT collection mint (optional)
  logoUri: string; // Ensure this is explicitly defined
  createdAt: number;
  lastUpdated: number;
  roster: RosterPosition[]; // Players in the team
  statistics: TeamStatistics;
  matchHistory?: TeamMatchResult[];
}

// Reuse your existing types or define them here
export interface RosterPosition {
  playerMint: PublicKey;
  position: string;
  addedAt: number;
}

export interface TeamStatistics {
  matchesPlayed: number;
  wins: number;
  losses: number;
  tournamentWins: number;
  avgMechanical: number;
  avgGameKnowledge: number;
  avgTeamCommunication: number;
  synergyScore: number;
}

export interface TeamMatchResult {
  matchId: string;
  timestamp: number;
  opponent: PublicKey;
  win: boolean;
  score: [number, number];
  tournamentId?: PublicKey;
}