// src/services/matchSimulationService.ts
import { TeamAccount, PlayerAccount } from '@/types/program-types';
import { MatchSimulationEngine } from '@/simulation/matchSimulationEngine';
import { MatchCommentator } from '@/simulation/matchCommentator';
import { SimulationEvent, MatchStats, Commentary } from '@/simulation/types';
import audioCommentaryService from '@/services/audioCommentaryService';

/**
 * Service for simulating matches between teams
 */
class MatchSimulationService {
  private engine: MatchSimulationEngine;
  private commentator: MatchCommentator;
  
  constructor() {
    this.engine = new MatchSimulationEngine();
    this.commentator = new MatchCommentator();
  }
  
  /**
   * Simulates a match between two teams and returns the result
   */
  async simulateMatch(
    teamA: TeamAccount,
    teamB: TeamAccount,
    teamAPlayers: PlayerAccount[],
    teamBPlayers: PlayerAccount[]
  ): Promise<{
    winner: TeamAccount;
    loser: TeamAccount;
    score: [number, number];
    events: SimulationEvent[];
    stats: MatchStats;
    commentary: Commentary[];
  }> {
    // Ensure we have adequate player data
    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      throw new Error('Both teams must have at least one player to simulate a match');
    }
    
    // Run the match simulation
    const result = this.engine.simulateMatch(
      teamA,
      teamB,
      teamAPlayers,
      teamBPlayers
    );
    
    // Generate match commentary
    const commentary = this.commentator.generateMatchCommentary(
      result.events,
      teamA,
      teamB,
      result.stats
    );
    
    return {
      ...result,
      commentary
    };
  }
  
  /**
   * Simulates a tournament round and returns the results of all matches
   */
  async simulateTournamentRound(
    matches: Array<{
      teamA: TeamAccount;
      teamB: TeamAccount;
      teamAPlayers: PlayerAccount[];
      teamBPlayers: PlayerAccount[];
    }>
  ): Promise<Array<{
    matchId: string;
    teamA: TeamAccount;
    teamB: TeamAccount;
    winner: TeamAccount;
    loser: TeamAccount;
    score: [number, number];
    events: SimulationEvent[];
    stats: MatchStats;
    commentary: Commentary[];
  }>> {
    // Simulate each match in the round
    const results = await Promise.all(
      matches.map(async (match, index) => {
        const result = await this.simulateMatch(
          match.teamA,
          match.teamB,
          match.teamAPlayers,
          match.teamBPlayers
        );
        
        return {
          matchId: `match-${index}-${Date.now()}`,
          teamA: match.teamA,
          teamB: match.teamB,
          ...result
        };
      })
    );
    
    return results;
  }
  
  /**
   * Generates audio for a specific commentary line
   * In a real implementation, this would call an API
   */
  async generateCommentaryAudio(commentary: Commentary): Promise<string> {
    try {
      // Use our audio commentary service to get the audio URL
      const audioUrl = await audioCommentaryService.generateAudio(commentary);
      return audioUrl;
    } catch (error) {
      console.error('Error generating audio commentary:', error);
      return '';
    }
  }
}

// Create singleton instance
const matchSimulationService = new MatchSimulationService();
export default matchSimulationService;