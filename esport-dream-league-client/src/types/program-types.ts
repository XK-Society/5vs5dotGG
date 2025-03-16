import { PublicKey } from '@solana/web3.js';

export enum TrainingType {
  Mechanical = 0,
  GameKnowledge = 1,
  TeamCommunication = 2,
  Adaptability = 3,
  Consistency = 4,
}

export enum Rarity {
  Common = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 4,
}

export enum TournamentStatus {
  Registration = 0,
  InProgress = 1,
  Completed = 2,
  Canceled = 3,
}

export type SpecialAbility = {
  name: string;
  value: number;
};

export type PlayerStats = {
  mechanical: number;
  gameKnowledge: number;
  teamCommunication: number;
  adaptability: number;
  consistency: number;
  potential: number;
  form: number;
};

export type RosterPosition = {
  playerMint: PublicKey;
  position: string;
  addedAt: number;
};

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

export type MatchPerformance = {
  matchId: string;
  timestamp: number;
  win: boolean;
  mvp: boolean;
  expGained: number;
  stats: Uint8Array;
};

export type TeamMatchResult = {
  matchId: string;
  timestamp: number;
  opponent: PublicKey;
  win: boolean;
  score: [number, number];
  tournamentId: PublicKey | null;
};

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