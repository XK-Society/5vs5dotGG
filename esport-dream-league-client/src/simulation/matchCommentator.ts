// src/simulation/matchCommentator.ts
import { PlayerAccount, TeamAccount } from '@/types/program-types';
import { SimulationEvent, Commentary, MatchStats, GamePhase } from './types';

/**
 * The MatchCommentator generates real-time commentary for match events
 */
export class MatchCommentator {
  private commentaryStyle = 'esports'; // Default style
  private commentators = ['PastryTime', 'CaptainFlowers']; // Default commentators
  
  constructor(style?: string, commentators?: string[]) {
    if (style) this.commentaryStyle = style;
    if (commentators) this.commentators = commentators;
  }
  
  /**
   * Generate commentary for a match based on all events
   */
  public generateMatchCommentary(
    events: SimulationEvent[],
    teamA: TeamAccount,
    teamB: TeamAccount,
    stats?: MatchStats
  ): Commentary[] {
    const commentary: Commentary[] = [];
    
    // Add introduction
    commentary.push({
      time: 0,
      text: `Welcome to today's match between ${teamA.name} and ${teamB.name}! I'm ${this.commentators[0]} joined by ${this.commentators[1]}, and we're excited to bring you all the action.`,
      phase: 'early_game',
      excitement: 4
    });
    
    // Generate commentary for each event
    events.forEach(event => {
      const commentText = this.generateEventCommentary(event, teamA, teamB);
      
      commentary.push({
        time: event.time,
        text: commentText,
        phase: event.phase,
        excitement: this.calculateExcitement(event)
      });
    });
    
    // If we have stats, add conclusion
    if (stats) {
      const teamAMvp = stats.teamStats.teamA.mvp;
      const teamBMvp = stats.teamStats.teamB.mvp;
      const winningTeam = stats.teamStats.teamA.objectives + 
                          stats.teamStats.teamA.teamfights > 
                          stats.teamStats.teamB.objectives + 
                          stats.teamStats.teamB.teamfights ? teamA : teamB;
      
      // Add game conclusion
      commentary.push({
        time: stats.duration,
        text: `And that's going to be GG! ${winningTeam.name} takes the victory in ${stats.duration} minutes. What an incredible match!`,
        phase: 'late_game',
        excitement: 5
      });
      
      // Add MVP comments if available
      if (teamAMvp || teamBMvp) {
        const mvp = stats.teamStats.teamA.objectives + 
                    stats.teamStats.teamA.teamfights > 
                    stats.teamStats.teamB.objectives + 
                    stats.teamStats.teamB.teamfights ? teamAMvp : teamBMvp;
        
        if (mvp) {
          commentary.push({
            time: stats.duration + 1,
            text: `Our MVP of the match is ${mvp.name} with an outstanding performance on ${mvp.position}. They really showed up huge today!`,
            phase: 'late_game',
            excitement: 4
          });
        }
      }
    }
    
    return commentary;
  }
  
  /**
   * Generate commentary text for a single event
   */
  private generateEventCommentary(
    event: SimulationEvent,
    teamA: TeamAccount,
    teamB: TeamAccount
  ): string {
    // Get event description
    const baseDescription = event.description;
    
    // Add commentary flavor based on event type and impact
    let commentary = '';
    const team = event.favoredTeam === 'teamA' ? teamA.name : teamB.name;
    const otherTeam = event.favoredTeam === 'teamA' ? teamB.name : teamA.name;
    
    // Add intro phrase based on event type
    if (event.type === 'objective') {
      commentary = this.getRandomPhrase([
        `OH! ${team} manages to secure `,
        `In a brilliant play, ${team} has taken `,
        `${team} finds the perfect timing to claim `,
        `With superior positioning, ${team} grabs `
      ]);
    } else if (event.type === 'teamfight') {
      commentary = this.getRandomPhrase([
        `WHAT A FIGHT! ${team} absolutely dominates `,
        `The teamfight erupts and ${team} comes out on top during `,
        `${team} showcases their superior coordination in `,
        `An incredible display of mechanics as ${team} wins `
      ]);
    } else { // play
      commentary = this.getRandomPhrase([
        `Beautiful execution by ${team} with `,
        `${team} is showing why they're feared with `,
        `That's the kind of play we expect from ${team}! `,
        `${otherTeam} had no answer for ${team}'s `
      ]);
    }
    
    // Add the base description
    commentary += baseDescription.toLowerCase();
    
    // Add excitement based on impact
    if (event.impact >= 3) {
      commentary += this.getRandomPhrase([
        "! INCREDIBLE!",
        "! That's going to be MASSIVE!",
        "! This could be a game-changing moment!",
        "! The crowd is going wild!"
      ]);
    } else if (event.impact === 2) {
      commentary += this.getRandomPhrase([
        "! That's a significant advantage!",
        "! They're looking strong now!",
        "! What a great play!",
        "! This puts them in a great position!"
      ]);
    } else {
      commentary += this.getRandomPhrase([
        ". A solid play.",
        ". They'll be happy with that.",
        ". That should help them moving forward.",
        ". A nice bit of map control."
      ]);
    }
    
    // Add color commentary based on game phase
    if (event.phase === 'early_game') {
      commentary += this.getRandomPhrase([
        " This early advantage could set the tone for the entire match.",
        " Getting ahead early is exactly what they needed.",
        " A great start for them in this important match.",
        " The early game is going according to plan."
      ]);
    } else if (event.phase === 'mid_game') {
      commentary += this.getRandomPhrase([
        " They're really hitting their power spike now.",
        " The mid game is where this team composition really shines.",
        " This is where the game can really swing one way or the other.",
        " Momentum is definitely on their side right now."
      ]);
    } else { // late_game
      commentary += this.getRandomPhrase([
        " This late in the game, every move is critical.",
        " We're approaching those decisive moments now.",
        " With game-ending objectives on the map, this is huge.",
        " The tension is palpable as we reach the late game."
      ]);
    }
    
    return commentary;
  }
  
  /**
   * Calculate excitement level for an event
   */
  private calculateExcitement(event: SimulationEvent): number {
    // Base excitement on event impact (1-3)
    let excitement = event.impact;
    
    // Late game events are more exciting
    if (event.phase === 'late_game') excitement += 1;
    
    // Teamfights are typically more exciting than other events
    if (event.type === 'teamfight') excitement += 1;
    
    // Cap at 5
    return Math.min(5, excitement);
  }
  
  /**
   * Utility to get a random phrase from an array of options
   */
  private getRandomPhrase(phrases: string[]): string {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  /**
   * Generate audio commentary using Claude API (simulated for demo)
   * In a real implementation, this would connect to Claude or another API
   */
  public async generateAudioCommentary(commentary: Commentary): Promise<string> {
    // This would normally call the Claude API or another text-to-speech service
    // For demo purposes, we'll return a simulated URL
    
    const commentaryText = commentary.text;
    const excitement = commentary.excitement;
    
    // In a real implementation, we would:
    // 1. Call Claude API with the commentary text and excitement level
    // 2. Process the response to generate audio
    // 3. Return the URL to the generated audio file
    
    console.log(`Generating audio for commentary: "${commentaryText}" (Excitement: ${excitement})`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return a mock audio URL
    return `/api/audio/commentary-${Date.now()}.mp3`;
  }
}