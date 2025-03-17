// src/simulation/eventGenerator.ts
import { TeamAccount } from '@/types/program-types';
import { SimulationEvent, GamePhase, TeamPerformance } from './types';

// Event templates for different game phases
const eventTemplates: Record<GamePhase, Record<string, string[]>> = {
  early_game: {
    objective: [
      "{team} secures the first dragon of the game",
      "{team} takes an early tower advantage",
      "{team} successfully invades the enemy jungle",
      "{team} captures the first herald"
    ],
    teamfight: [
      "A skirmish breaks out in the river with {team} coming out ahead",
      "{team} wins an early 3v3 fight in the top lane",
      "First blood goes to {team} after a jungle invade",
      "{team} wins a close fight near the dragon pit"
    ],
    play: [
      "{team}'s mid laner roams successfully to the bottom lane",
      "{team}'s jungler executes a perfect gank in the top lane",
      "{team} shows superior wave management in the early phase",
      "{team}'s support makes a roaming play to mid lane"
    ]
  },
  mid_game: {
    objective: [
      "{team} secures the second dragon, giving them dragon advantage",
      "{team} takes the mid lane outer tower",
      "{team} uses herald to break open the mid lane",
      "{team} gets complete control of the enemy jungle"
    ],
    teamfight: [
      "{team} comes out ahead in a major teamfight at the dragon pit",
      "A chaotic 5v5 in the mid lane ends with {team} on top",
      "{team} catches two enemies out of position and capitalizes",
      "{team} defends their tier 2 tower with a perfect engage"
    ],
    play: [
      "{team} executes a perfect split push strategy",
      "{team}'s carry begins to show dominant item advantage",
      "{team} demonstrates superior vision control around objectives",
      "{team} makes a bold call to trade objectives across the map"
    ]
  },
  late_game: {
    objective: [
      "{team} secures the Elder Dragon after a tense standoff",
      "{team} takes Baron Nashor and gains the powerful buff",
      "{team} destroys an inhibitor, creating massive map pressure",
      "{team} completes their dragon soul, gaining a huge advantage"
    ],
    teamfight: [
      "A game-changing teamfight goes in {team}'s favor",
      "{team} aces the enemy team in a decisive battle",
      "The final teamfight erupts and {team} emerges victorious",
      "{team} wins a critical 5v5 near the Baron pit"
    ],
    play: [
      "{team} executes a beautiful flanking maneuver",
      "{team}'s carry delivers a pentakill performance",
      "{team} makes the decisive call that changes the game's momentum",
      "{team} shows perfect teamwork in the final moments of the game"
    ]
  }
};

/**
 * Generates match events for a specific game phase
 */
export function generateMatchEvents(
  phase: GamePhase,
  count: number,
  teamA: TeamAccount,
  teamB: TeamAccount,
  teamAPerformance: TeamPerformance,
  teamBPerformance: TeamPerformance
): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  const templates = eventTemplates[phase];
  const eventTypes = Object.keys(templates);
  
  // Time increments in minutes based on phase
  let timeOffset = phase === 'early_game' ? 0 : 
                   phase === 'mid_game' ? 15 : 25;
  
  // Calculate advantage (higher value means team A has advantage)
  const advantage = teamAPerformance.overall - teamBPerformance.overall;
  
  // Adjust probability based on team advantage
  // Transform advantage to a probability between 0.3 and 0.7
  const teamAWinProb = Math.min(0.7, Math.max(0.3, 0.5 + (advantage / 100)));
  
  for (let i = 0; i < count; i++) {
    // Pick a random event type (objective, teamfight, play)
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Determine which team is favored for this event
    const favoredTeam = Math.random() < teamAWinProb ? 'teamA' : 'teamB';
    const team = favoredTeam === 'teamA' ? teamA : teamB;
    
    // Select a random event template and replace {team} with actual team name
    const templates = eventTemplates[phase][eventType];
    let description = templates[Math.floor(Math.random() * templates.length)];
    description = description.replace('{team}', team.name);
    
    // Calculate event time (in minutes)
    const timeVariation = Math.floor(Math.random() * 5); // 0-4 minutes variation
    const time = timeOffset + timeVariation + i;
    
    // Generate the event
    events.push({
      time,
      type: eventType as 'objective' | 'teamfight' | 'play',
      phase,
      description,
      favoredTeam,
      impact: Math.floor(Math.random() * 3) + 1 // Impact from 1-3
    });
  }
  
  // Sort events by time
  events.sort((a, b) => a.time - b.time);
  
  return events;
}