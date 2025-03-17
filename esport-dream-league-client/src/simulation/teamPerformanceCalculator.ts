// src/simulation/teamPerformanceCalculator.ts
import { PlayerAccount, TeamAccount } from '@/types/program-types';
import { TeamPerformance } from './types';

/**
 * Calculates a team's performance metrics based on player stats and team synergy
 */
export function calculateTeamPerformance(team: TeamAccount, players: PlayerAccount[]): TeamPerformance {
  // Calculate base stats from all players
  const baseStats = players.reduce((acc, player) => {
    return {
      mechanical: acc.mechanical + player.mechanical,
      gameKnowledge: acc.gameKnowledge + player.gameKnowledge,
      teamCommunication: acc.teamCommunication + player.teamCommunication,
      adaptability: acc.adaptability + (player.adaptability || 50), // Default 50 if undefined
      consistency: acc.consistency + player.consistency,
      form: acc.form + (player.form || 50) // Default 50 if undefined
    };
  }, {
    mechanical: 0,
    gameKnowledge: 0,
    teamCommunication: 0,
    adaptability: 0,
    consistency: 0,
    form: 0
  });

  // Calculate averages
  const playerCount = players.length || 1; // Avoid division by zero
  const avgMechanical = baseStats.mechanical / playerCount;
  const avgGameKnowledge = baseStats.gameKnowledge / playerCount;
  const avgTeamCommunication = baseStats.teamCommunication / playerCount;
  const avgAdaptability = baseStats.adaptability / playerCount;
  const avgConsistency = baseStats.consistency / playerCount;
  const avgForm = baseStats.form / playerCount;

  // Apply team synergy bonus (from 0.8 to 1.2 multiplier)
  const synergyMultiplier = 0.8 + (team.statistics.synergyScore / 100) * 0.4;

  // Calculate final performance metrics with synergy bonus
  const teamPerformance: TeamPerformance = {
    mechanical: avgMechanical * synergyMultiplier,
    gameKnowledge: avgGameKnowledge * synergyMultiplier,
    teamCommunication: avgTeamCommunication * synergyMultiplier,
    adaptability: avgAdaptability * synergyMultiplier,
    consistency: avgConsistency * synergyMultiplier,
    form: avgForm,
    synergy: team.statistics.synergyScore,
    overall: 0 // Will be calculated below
  };

  // Calculate overall performance score (weighted average)
  teamPerformance.overall = (
    teamPerformance.mechanical * 0.25 +
    teamPerformance.gameKnowledge * 0.25 +
    teamPerformance.teamCommunication * 0.2 +
    teamPerformance.adaptability * 0.15 +
    teamPerformance.consistency * 0.1 +
    teamPerformance.form * 0.05
  );

  // Add some randomness factor (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  teamPerformance.overall *= randomFactor;

  return teamPerformance;
}