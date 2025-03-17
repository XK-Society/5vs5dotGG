// src/simulation/matchSimulationEngine.ts
import { PlayerAccount, TeamAccount } from '@/types/program-types';
import { SimulationEvent, MatchStats, GamePhase, TeamPerformance } from './types';
import { calculateTeamPerformance } from './teamPerformanceCalculator';
import { generateMatchEvents } from './eventGenerator';
import { analyzeMatchStats } from './statsAnalyzer';

export class MatchSimulationEngine {
  private phaseLength = 5; // Each phase consists of roughly 5 events
  private gamePhases: GamePhase[] = [
    'early_game',
    'mid_game',
    'late_game'
  ];

  /**
   * Simulates a match between two teams and returns the result with events and stats
   */
  public simulateMatch(teamA: TeamAccount, teamB: TeamAccount, 
                      teamAPlayers: PlayerAccount[], teamBPlayers: PlayerAccount[]): {
    winner: TeamAccount;
    loser: TeamAccount;
    score: [number, number];
    events: SimulationEvent[];
    stats: MatchStats;
  } {
    // Calculate team performance scores
    const teamAPerformance = calculateTeamPerformance(teamA, teamAPlayers);
    const teamBPerformance = calculateTeamPerformance(teamB, teamBPlayers);

    console.log(`Team ${teamA.name} Performance:`, teamAPerformance);
    console.log(`Team ${teamB.name} Performance:`, teamBPerformance);

    // Generate match events based on team performances
    const events = this.generateMatchEvents(teamA, teamB, teamAPerformance, teamBPerformance);

    // Calculate final score based on events and team performances
    const score = this.calculateFinalScore(events, teamAPerformance, teamBPerformance);

    // Determine winner and loser
    let winner: TeamAccount;
    let loser: TeamAccount;
    if (score[0] > score[1]) {
      winner = teamA;
      loser = teamB;
    } else {
      winner = teamB;
      loser = teamA;
    }

    // Generate match statistics
    const stats = analyzeMatchStats(events, teamA, teamB, teamAPlayers, teamBPlayers);

    return {
      winner,
      loser,
      score,
      events,
      stats
    };
  }

  /**
   * Generates the sequence of events that occur during the match
   */
  private generateMatchEvents(
    teamA: TeamAccount, 
    teamB: TeamAccount, 
    teamAPerformance: TeamPerformance, 
    teamBPerformance: TeamPerformance
  ): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    
    // Generate events for each phase of the game
    this.gamePhases.forEach(phase => {
      const phaseEvents = generateMatchEvents(
        phase,
        this.phaseLength,
        teamA,
        teamB,
        teamAPerformance,
        teamBPerformance
      );
      events.push(...phaseEvents);
    });

    return events;
  }

  /**
   * Calculate the final score based on events and team performances
   */
  private calculateFinalScore(
    events: SimulationEvent[],
    teamAPerformance: TeamPerformance,
    teamBPerformance: TeamPerformance
  ): [number, number] {
    // Count objectives taken by each team
    const teamAObjectives = events.filter(e => e.favoredTeam === 'teamA' && e.type === 'objective').length;
    const teamBObjectives = events.filter(e => e.favoredTeam === 'teamB' && e.type === 'objective').length;
    
    // Base scores on objectives plus team performance advantage
    const performanceDiff = (teamAPerformance.overall - teamBPerformance.overall) / 10;
    
    // Calculate the base score
    let teamAScore = teamAObjectives;
    let teamBScore = teamBObjectives;
    
    // Add performance advantage (could be negative)
    teamAScore += Math.floor(performanceDiff);
    teamBScore -= Math.floor(performanceDiff);
    
    // Ensure scores are always positive
    teamAScore = Math.max(1, teamAScore);
    teamBScore = Math.max(1, teamBScore);
    
    // Add randomness factor for upset potential (1-3 points)
    const upset = Math.floor(Math.random() * 3) + 1;
    
    // 20% chance of an upset
    if (Math.random() < 0.2) {
      if (teamAScore > teamBScore) {
        teamBScore += upset;
      } else {
        teamAScore += upset;
      }
    }
    
    return [teamAScore, teamBScore];
  }
}