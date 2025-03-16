// src/lib/types/program.ts
import { Address } from '@solana/kit';

// Enums
export enum Rarity {
  Common = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 4
}

export enum TrainingType {
  Mechanical = 0,
  GameKnowledge = 1,
  TeamCommunication = 2,
  Adaptability = 3,
  Consistency = 4
}

export enum TournamentStatus {
  Registration = 0,
  InProgress = 1,
  Completed = 2,
  Canceled = 3
}

// Structs
export type SpecialAbility = {
  name: string;
  value: number;
};

export type MatchPerformance = {
  match_id: string;
  timestamp: number;
  win: boolean;
  mvp: boolean;
  exp_gained: number;
  stats: Uint8Array;
};

export type RosterPosition = {
  player_mint: string;
  position: string;
  added_at: number;
};

export type TeamStatistics = {
  matches_played: number;
  wins: number;
  losses: number;
  tournament_wins: number;
  avg_mechanical: number;
  avg_game_knowledge: number;
  avg_team_communication: number;
  synergy_score: number;
};

export type TeamMatchResult = {
  match_id: string;
  timestamp: number;
  opponent: string;
  win: boolean;
  score: [number, number];
  tournament_id?: string;
};

export type TournamentMatch = {
  match_id: string;
  timestamp: number;
  team_a: string;
  team_b: string;
  winner?: string;
  score: [number, number];
  round: number;
  completed: boolean;
};

// Account structures
export type PlayerAccount = {
  owner: string; 
  mint: string;
  name: string;
  position: string;
  created_at: number;
  last_updated: number;
  team?: string;
  uri: string;
  
  // Basic stats (0-100 scale)
  mechanical: number;
  game_knowledge: number;
  team_communication: number;
  adaptability: number;
  consistency: number;
  
  // Special abilities
  special_abilities: SpecialAbility[];
  
  // Game-specific data
  game_specific_data: Uint8Array;
  
  // Performance metrics
  experience: number;
  matches_played: number;
  wins: number;
  mvp_count: number;
  form: number;
  potential: number;
  rarity: Rarity;
  
  // Creator information
  creator?: string;
  is_exclusive: boolean;
  
  // Match history
  performance_history: MatchPerformance[];
};

export type TeamAccount = {
  owner: string;
  name: string;
  collection_mint?: string;
  logo_uri: string;
  created_at: number;
  last_updated: number;
  roster: RosterPosition[];
  statistics: TeamStatistics;
  match_history: TeamMatchResult[];
};

export type CreatorAccount = {
  authority: string;
  name: string;
  verified: boolean;
  creator_fee_basis_points: number;
  collections_created: string[];
  total_athletes_created: number;
  created_at: number;
};

export type TournamentAccount = {
  authority: string;
  name: string;
  entry_fee: bigint;
  prize_pool: bigint;
  start_time: number;
  end_time?: number;
  max_teams: number;
  registered_teams: string[];
  matches: TournamentMatch[];
  status: TournamentStatus;
  created_at: number;
};

// Type for IDL Interface
export type EsportsManagerIDL = {
  version: string;
  name: string;
  instructions: Instruction[];
  accounts: Account[];
  types: Type[];
};

type Instruction = {
  name: string;
  accounts: { name: string; isMut: boolean; isSigner: boolean }[];
  args: { name: string; type: string }[];
};

type Account = {
  name: string;
  type: {
    kind: string;
    fields: { name: string; type: string }[];
  };
};

type Type = {
  name: string;
  type: {
    kind: string;
    fields?: { name: string; type: string }[];
    variants?: { name: string }[];
  };
};
type SimulatedPlayerPerformance = {
  playerMint: string;
  mechanicalChange: number;
  gameKnowledgeChange: number;
  teamCommunicationChange: number;
  adaptabilityChange: number;
  consistencyChange: number;
  formChange: number;
  expGained: number;
  isMVP: boolean;
  matchStats?: Uint8Array; // Add this field
};