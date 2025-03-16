// src/lib/simulation/engine.ts
import { type PlayerAccount, type TeamAccount, type SpecialAbility } from '../types/program';

// Constants for simulation
const MECHANICAL_WEIGHT = 0.25;
const GAME_KNOWLEDGE_WEIGHT = 0.20;
const TEAM_COMMUNICATION_WEIGHT = 0.20;
const ADAPTABILITY_WEIGHT = 0.15;
const CONSISTENCY_WEIGHT = 0.10;
const FORM_WEIGHT = 0.10;
const SPECIAL_ABILITY_BONUS_MULTIPLIER = 0.15;
const SYNERGY_WEIGHT = 0.25;
const RANDOM_FACTOR_RANGE = 0.15; // +/- 15% random factor

type SimulatedMatchEvent = {
  timestamp: number;
  type: 'kill' | 'objective' | 'teamfight' | 'special';
  description: string;
  teamIndex: 0 | 1;
  playerIndex?: number;
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
export type SimulatedMatchResult = {
  matchId: string;
  timestamp: number;
  winnerIndex: 0 | 1;
  score: [number, number];
  events: SimulatedMatchEvent[];
  playerPerformances: {
    teamA: SimulatedPlayerPerformance[];
    teamB: SimulatedPlayerPerformance[];
  };
  statistics: {
    teamA: {
      totalScore: number;
      averagePerformance: number;
    };
    teamB: {
      totalScore: number;
      averagePerformance: number;
    };
  };
  commentary: string[];
};

// Helper to generate a random number between min and max
function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Calculate player's base performance based on their stats
function calculatePlayerBasePerformance(player: PlayerAccount): number {
  return (
    player.mechanical * MECHANICAL_WEIGHT +
    player.game_knowledge * GAME_KNOWLEDGE_WEIGHT +
    player.team_communication * TEAM_COMMUNICATION_WEIGHT +
    player.adaptability * ADAPTABILITY_WEIGHT +
    player.consistency * CONSISTENCY_WEIGHT +
    player.form * FORM_WEIGHT
  );
}

// Calculate bonus from special abilities
function calculateSpecialAbilitiesBonus(abilities: SpecialAbility[]): number {
  if (!abilities.length) return 0;
  
  // Average ability value multiplied by the bonus multiplier
  const avgAbilityValue = abilities.reduce((sum, ability) => sum + ability.value, 0) / abilities.length;
  return avgAbilityValue * SPECIAL_ABILITY_BONUS_MULTIPLIER;
}

// Calculate team's overall performance
function calculateTeamPerformance(team: TeamAccount, players: PlayerAccount[]): number {
  // Calculate base performance for each player
  const playerPerformances = players.map(player => {
    const basePerformance = calculatePlayerBasePerformance(player);
    const abilitiesBonus = calculateSpecialAbilitiesBonus(player.special_abilities);
    return basePerformance + abilitiesBonus;
  });
  
  // Average player performance
  const avgPlayerPerformance = playerPerformances.reduce((sum, perf) => sum + perf, 0) / playerPerformances.length;
  
  // Add synergy bonus
  const synergyBonus = team.statistics.synergy_score * SYNERGY_WEIGHT;
  
  return avgPlayerPerformance + synergyBonus;
}

// Generate a random stat change based on performance
function generateStatChange(win: boolean, playerPerformance: number): number {
  const baseChange = win ? 2 : -1;
  const performanceModifier = ((playerPerformance / 100) * 2) - 1; // -1 to 1
  
  // Random factor between -2 and 2
  const randomFactor = Math.floor(Math.random() * 5) - 2;
  
  return Math.max(-3, Math.min(5, Math.round(baseChange + performanceModifier + randomFactor)));
}

// Generate random match events
function generateMatchEvents(teamA: TeamAccount, teamB: TeamAccount, 
                            playersA: PlayerAccount[], playersB: PlayerAccount[], 
                            teamAPerformance: number, teamBPerformance: number): SimulatedMatchEvent[] {
  const events: SimulatedMatchEvent[] = [];
  const matchDuration = 30; // 30 minutes
  
  // Performance ratio determines event distribution
  const teamARatio = teamAPerformance / (teamAPerformance + teamBPerformance);
  
  // Generate kill events
  const totalKills = Math.floor(Math.random() * 40) + 20; // 20-60 kills
  for (let i = 0; i < totalKills; i++) {
    const teamIndex = Math.random() < teamARatio ? 0 : 1;
    const killingTeamPlayers = teamIndex === 0 ? playersA : playersB;
    const dyingTeamPlayers = teamIndex === 0 ? playersB : playersA;
    
    if (killingTeamPlayers.length === 0 || dyingTeamPlayers.length === 0) continue;
    
    const killerIndex = Math.floor(Math.random() * killingTeamPlayers.length);
    const victimIndex = Math.floor(Math.random() * dyingTeamPlayers.length);
    
    const killer = killingTeamPlayers[killerIndex];
    const victim = dyingTeamPlayers[victimIndex];
    
    events.push({
      timestamp: Math.floor(Math.random() * matchDuration * 60), // Random time in seconds
      type: 'kill',
      description: `${killer.name} eliminates ${victim.name}`,
      teamIndex: teamIndex as 0 | 1,
      playerIndex: killerIndex
    });
  }
  
  // Generate objective events
  const totalObjectives = Math.floor(Math.random() * 10) + 5; // 5-15 objectives
  for (let i = 0; i < totalObjectives; i++) {
    const teamIndex = Math.random() < teamARatio ? 0 : 1;
    const team = teamIndex === 0 ? teamA : teamB;
    
    events.push({
      timestamp: Math.floor(Math.random() * matchDuration * 60),
      type: 'objective',
      description: `Team ${team.name} secures an objective`,
      teamIndex: teamIndex as 0 | 1
    });
  }
  
  // Generate teamfight events
  const totalTeamfights = Math.floor(Math.random() * 5) + 2; // 2-7 teamfights
  for (let i = 0; i < totalTeamfights; i++) {
    // Teamfight winner is more heavily influenced by team performance
    const teamfightRatio = (teamARatio * 2 + Math.random()) / 3; // Weighted random
    const teamIndex = teamfightRatio > 0.5 ? 0 : 1;
    const team = teamIndex === 0 ? teamA : teamB;
    
    events.push({
      timestamp: Math.floor(Math.random() * matchDuration * 60),
      type: 'teamfight',
      description: `Team ${team.name} wins a teamfight`,
      teamIndex: teamIndex as 0 | 1
    });
  }
  
  // Generate special ability events
  const specialPlayers = [...playersA, ...playersB].filter(p => p.special_abilities.length > 0);
  for (const player of specialPlayers) {
    if (Math.random() < 0.7) { // 70% chance for a special ability to trigger
      const teamIndex = playersA.includes(player) ? 0 : 1;
      const playerIndex = (teamIndex === 0 ? playersA : playersB).indexOf(player);
      const ability = player.special_abilities[Math.floor(Math.random() * player.special_abilities.length)];
      
      events.push({
        timestamp: Math.floor(Math.random() * matchDuration * 60),
        type: 'special',
        description: `${player.name} activates ${ability.name}`,
        teamIndex: teamIndex as 0 | 1,
        playerIndex
      });
    }
  }
  
  // Sort events by timestamp
  return events.sort((a, b) => a.timestamp - b.timestamp);
}

// src/lib/simulation/engine.ts (continued)

// Generate commentary based on events and results
function generateCommentary(events: SimulatedMatchEvent[], teamA: TeamAccount, teamB: TeamAccount, score: [number, number]): string[] {
    const commentary: string[] = [];
    
    // Opening commentary
    commentary.push(`Welcome to this exciting match between ${teamA.name} and ${teamB.name}!`);
    
    // Mid-game highlights (use 3-5 key events)
    const keyEvents = events.filter(e => e.type === 'teamfight' || e.type === 'special')
                            .sort(() => Math.random() - 0.5)
                            .slice(0, Math.min(5, events.length));
    
    for (const event of keyEvents) {
      const team = event.teamIndex === 0 ? teamA.name : teamB.name;
      const minuteMark = Math.floor(event.timestamp / 60);
      
      let commentLine = `[${minuteMark}:00] `;
      
      switch (event.type) {
        case 'teamfight':
          commentLine += `A decisive teamfight goes in favor of ${team}!`;
          break;
        case 'special':
          commentLine += event.description + ` giving ${team} a big advantage!`;
          break;
        default:
          commentLine += event.description;
      }
      
      commentary.push(commentLine);
    }
    
    // Closing commentary
    const winnerTeam = score[0] > score[1] ? teamA.name : teamB.name;
    const loserTeam = score[0] > score[1] ? teamB.name : teamA.name;
    const scoreLine = `${score[0]}-${score[1]}`;
    
    commentary.push(`And that's game! ${winnerTeam} defeats ${loserTeam} with a score of ${scoreLine}.`);
    
    if (Math.abs(score[0] - score[1]) < 3) {
      commentary.push(`What a close match! Both teams showed incredible skill today.`);
    } else {
      commentary.push(`A dominant performance from ${winnerTeam} today.`);
    }
    
    return commentary;
  }
  
  // Calculate player performance changes and experience gained
  function calculatePlayerPerformance(
    player: PlayerAccount, 
    teamWon: boolean, 
    events: SimulatedMatchEvent[], 
    teamIndex: 0 | 1, 
    playerIndex: number
  ): SimulatedPlayerPerformance {
    // Base performance calculation
    const basePerformance = calculatePlayerBasePerformance(player);
    
    // Count player's kills and special ability activations
    const playerEvents = events.filter(
      e => e.teamIndex === teamIndex && e.playerIndex === playerIndex
    );
    
    const kills = playerEvents.filter(e => e.type === 'kill').length;
    const specials = playerEvents.filter(e => e.type === 'special').length;
    
    // Calculate player's contribution to the match
    const contribution = (basePerformance / 100) * (1 + (kills * 0.05) + (specials * 0.1));
    
    // Experience gained based on contribution and win/loss
    const baseExp = teamWon ? 100 : 50;
    const expGained = Math.round(baseExp * (1 + contribution));
    
    // Determine stat changes
    const mechanicalChange = generateStatChange(teamWon, basePerformance);
    const gameKnowledgeChange = generateStatChange(teamWon, basePerformance);
    const teamCommunicationChange = generateStatChange(teamWon, basePerformance);
    const adaptabilityChange = generateStatChange(teamWon, basePerformance);
    const consistencyChange = generateStatChange(teamWon, basePerformance);
    
    // Form changes more significantly than other stats
    const formChange = teamWon ? 
      Math.floor(Math.random() * 8) + 3 : // 3-10 for winners
      Math.floor(Math.random() * 10) - 7; // -7 to 2 for losers
    
    // Determine MVP (placeholder logic - would be more complex in real implementation)
    const isMVP = false; // Will be set later after comparing all players
    
    return {
      playerMint: player.mint,
      mechanicalChange,
      gameKnowledgeChange,
      teamCommunicationChange,
      adaptabilityChange,
      consistencyChange,
      formChange,
      expGained,
      isMVP
    };
  }
  
  // Main simulation function
  export function simulateMatch(
    teamA: TeamAccount, 
    teamB: TeamAccount, 
    playersA: PlayerAccount[], 
    playersB: PlayerAccount[]
  ): SimulatedMatchResult {
    // Calculate team performances
    const teamAPerformance = calculateTeamPerformance(teamA, playersA);
    const teamBPerformance = calculateTeamPerformance(teamB, playersB);
    
    // Add random factor to each team's performance
    const randomFactorA = getRandomInRange(1 - RANDOM_FACTOR_RANGE, 1 + RANDOM_FACTOR_RANGE);
    const randomFactorB = getRandomInRange(1 - RANDOM_FACTOR_RANGE, 1 + RANDOM_FACTOR_RANGE);
    
    const finalTeamAPerformance = teamAPerformance * randomFactorA;
    const finalTeamBPerformance = teamBPerformance * randomFactorB;
    
    // Generate events
    const events = generateMatchEvents(teamA, teamB, playersA, playersB, finalTeamAPerformance, finalTeamBPerformance);
    
    // Calculate score based on events
    const teamAScore = events.filter(e => e.teamIndex === 0).length;
    const teamBScore = events.filter(e => e.teamIndex === 1).length;
    
    // Determine winner
    const winnerIndex: 0 | 1 = teamAScore > teamBScore ? 0 : 1;
    
    // Calculate player performances
    const teamAPlayerPerformances = playersA.map((player, index) => 
      calculatePlayerPerformance(player, winnerIndex === 0, events, 0, index)
    );
    
    const teamBPlayerPerformances = playersB.map((player, index) => 
      calculatePlayerPerformance(player, winnerIndex === 1, events, 1, index)
    );
    
    // Determine MVP
    const allPerformances = [
      ...teamAPlayerPerformances.map(p => ({ ...p, team: 0 as 0 | 1 })),
      ...teamBPlayerPerformances.map(p => ({ ...p, team: 1 as 0 | 1 }))
    ];
    
    // Sort by exp gained as a simple heuristic for MVP
    allPerformances.sort((a, b) => b.expGained - a.expGained);
    
    // The top player gets MVP status
    if (allPerformances.length > 0) {
      const mvpTeam = allPerformances[0].team;
      const mvpIndex = allPerformances[0].team === 0 
        ? teamAPlayerPerformances.findIndex(p => p.playerMint === allPerformances[0].playerMint)
        : teamBPlayerPerformances.findIndex(p => p.playerMint === allPerformances[0].playerMint);
      
      if (mvpIndex >= 0) {
        if (mvpTeam === 0) {
          teamAPlayerPerformances[mvpIndex].isMVP = true;
        } else {
          teamBPlayerPerformances[mvpIndex].isMVP = true;
        }
      }
    }
    
    // Generate commentary
    const score: [number, number] = [teamAScore, teamBScore];
    const commentary = generateCommentary(events, teamA, teamB, score);
    
    return {
      matchId: `match_${Date.now().toString(36)}`,
      timestamp: Date.now(),
      winnerIndex,
      score,
      events,
      playerPerformances: {
        teamA: teamAPlayerPerformances,
        teamB: teamBPlayerPerformances
      },
      statistics: {
        teamA: {
          totalScore: teamAScore,
          averagePerformance: finalTeamAPerformance
        },
        teamB: {
          totalScore: teamBScore,
          averagePerformance: finalTeamBPerformance
        }
      },
      commentary
    };
  }