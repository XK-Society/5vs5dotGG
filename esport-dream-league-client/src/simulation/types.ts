// src/simulation/types.ts
import { PlayerAccount } from '@/types/program-types';

// Game phases
export type GamePhase = 'early_game' | 'mid_game' | 'late_game';

// Team side in the match
export type TeamSide = 'teamA' | 'teamB';

// Event types that can occur in a match
export type EventType = 'objective' | 'teamfight' | 'play';

// Represents a single event that occurred during the match
export interface SimulationEvent {
  time: number; // In minutes
  type: EventType;
  phase: GamePhase;
  description: string;
  favoredTeam: TeamSide;
  impact: number; // 1-3 scale of how impactful this event was
}

// Performance metrics for a single player
export interface PlayerPerformance {
  performanceScore: number; // 0-10 rating of overall performance
  kills: number;
  deaths: number;
  assists: number;
  goldEarned: number;
  goldSpent: number;
  damageDealt: number;
  damageTaken: number;
  visionScore: number;
}

// Team performance metrics calculated from player stats and synergy
export interface TeamPerformance {
  mechanical: number;
  gameKnowledge: number;
  teamCommunication: number;
  adaptability: number;
  consistency: number;
  form: number;
  synergy: number;
  overall: number; // Overall performance score
}

// Team statistics for the match
export interface TeamMatchStats {
  objectives: number; // Count of objectives secured
  teamfights: number; // Count of teamfights won
  plays: number; // Count of successful plays
  earlyGameScore: number;
  midGameScore: number;
  lateGameScore: number;
  mvp: PlayerAccount | null; // Team MVP
}

// Overall match statistics
export interface MatchStats {
  duration: number; // In minutes
  teamStats: {
    teamA: TeamMatchStats;
    teamB: TeamMatchStats;
  };
  playerPerformances: Record<string, PlayerPerformance>; // Keyed by player public key
}

// Match commentary
export interface Commentary {
  time: number;
  text: string;
  phase: GamePhase;
  excitement: number; // 1-5 scale
}