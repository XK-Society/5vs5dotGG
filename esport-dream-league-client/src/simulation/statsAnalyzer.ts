// src/simulation/statsAnalyzer.ts
import { PlayerAccount, TeamAccount } from '@/types/program-types';
import { SimulationEvent, MatchStats, PlayerPerformance } from './types';

/**
 * Analyzes events to produce detailed match statistics
 */
export function analyzeMatchStats(
  events: SimulationEvent[],
  teamA: TeamAccount,
  teamB: TeamAccount,
  teamAPlayers: PlayerAccount[],
  teamBPlayers: PlayerAccount[]
): MatchStats {
  // Initialize match stats
  const stats: MatchStats = {
    duration: events[events.length - 1]?.time + 5 || 30, // Last event time + 5 minutes or default 30
    teamStats: {
      teamA: {
        objectives: 0,
        teamfights: 0,
        plays: 0,
        earlyGameScore: 0,
        midGameScore: 0,
        lateGameScore: 0,
        mvp: null
      },
      teamB: {
        objectives: 0,
        teamfights: 0,
        plays: 0,
        earlyGameScore: 0,
        midGameScore: 0,
        lateGameScore: 0,
        mvp: null
      }
    },
    playerPerformances: {}
  };
  
  // Count event types per team
  events.forEach(event => {
    const team = event.favoredTeam === 'teamA' ? 'teamA' : 'teamB';
    
    // Increment event counters
    if (event.type === 'objective') {
      stats.teamStats[team].objectives++;
    } else if (event.type === 'teamfight') {
      stats.teamStats[team].teamfights++;
    } else if (event.type === 'play') {
      stats.teamStats[team].plays++;
    }
    
    // Increment phase scores
    if (event.phase === 'early_game') {
      stats.teamStats[team].earlyGameScore += event.impact;
    } else if (event.phase === 'mid_game') {
      stats.teamStats[team].midGameScore += event.impact;
    } else if (event.phase === 'late_game') {
      stats.teamStats[team].lateGameScore += event.impact;
    }
  });
  
  // Calculate player performances
  const playerPerformances = generatePlayerPerformances(events, teamAPlayers, teamBPlayers);
  stats.playerPerformances = playerPerformances;
  
  // Determine MVPs
  const teamAPlayerPerformances = teamAPlayers.map(player => {
    const performance = playerPerformances[player.publicKey?.toString() || ''];
    return { player, performance };
  });
  
  const teamBPlayerPerformances = teamBPlayers.map(player => {
    const performance = playerPerformances[player.publicKey?.toString() || ''];
    return { player, performance };
  });
  
  // Sort by performance score (descending)
  teamAPlayerPerformances.sort((a, b) => 
    (b.performance?.performanceScore || 0) - (a.performance?.performanceScore || 0)
  );
  
  teamBPlayerPerformances.sort((a, b) => 
    (b.performance?.performanceScore || 0) - (a.performance?.performanceScore || 0)
  );
  
  // Assign MVPs (if players exist)
  if (teamAPlayerPerformances.length > 0) {
    stats.teamStats.teamA.mvp = teamAPlayerPerformances[0].player;
  }
  
  if (teamBPlayerPerformances.length > 0) {
    stats.teamStats.teamB.mvp = teamBPlayerPerformances[0].player;
  }
  
  return stats;
}

/**
 * Generates player performance metrics based on match events and baseline stats
 */
function generatePlayerPerformances(
  events: SimulationEvent[],
  teamAPlayers: PlayerAccount[],
  teamBPlayers: PlayerAccount[]
): Record<string, PlayerPerformance> {
  const performances: Record<string, PlayerPerformance> = {};
  
  // Process Team A players
  teamAPlayers.forEach(player => {
    const performance = generatePlayerPerformance(player, events, 'teamA');
    performances[player.publicKey?.toString() || ''] = performance;
  });
  
  // Process Team B players
  teamBPlayers.forEach(player => {
    const performance = generatePlayerPerformance(player, events, 'teamB');
    performances[player.publicKey?.toString() || ''] = performance;
  });
  
  return performances;
}

/**
 * Generate performance metrics for a single player
 */
function generatePlayerPerformance(
  player: PlayerAccount,
  events: SimulationEvent[],
  team: 'teamA' | 'teamB'
): PlayerPerformance {
  // Use player stats to calculate base performance probability
  const basePerformance = (
    player.mechanical * 0.25 +
    player.gameKnowledge * 0.25 +
    player.teamCommunication * 0.2 +
    (player.adaptability || 50) * 0.15 +
    player.consistency * 0.1 +
    (player.form || 50) * 0.05
  ) / 100;
  
  // Filter team events
  const teamEvents = events.filter(e => e.favoredTeam === team);
  
  // Performance score based on player performance and team events
  const performanceScore = basePerformance * 7 + Math.random() * 3; // 0-10 scale
  
  // Generate kills, deaths, assists based on position and performance
  let kills, deaths, assists;
  
  // Determine stats based on player position
  if (player.position?.toLowerCase().includes('carry') || 
      player.position?.toLowerCase().includes('mid')) {
    // Carries and mid laners get more kills
    kills = Math.floor(performanceScore * 2 + Math.random() * 3);
    deaths = Math.floor((10 - performanceScore) / 2 + Math.random() * 2);
    assists = Math.floor(performanceScore + Math.random() * 5);
  } else if (player.position?.toLowerCase().includes('jungle')) {
    // Junglers get balanced kills and assists
    kills = Math.floor(performanceScore + Math.random() * 3);
    deaths = Math.floor((10 - performanceScore) / 2 + Math.random() * 2);
    assists = Math.floor(performanceScore * 1.5 + Math.random() * 3);
  } else if (player.position?.toLowerCase().includes('support')) {
    // Supports get fewer kills, more assists
    kills = Math.floor(performanceScore * 0.5 + Math.random() * 2);
    deaths = Math.floor((10 - performanceScore) / 1.5 + Math.random() * 2);
    assists = Math.floor(performanceScore * 2.5 + Math.random() * 4);
  } else {
    // Top laners / other positions
    kills = Math.floor(performanceScore + Math.random() * 2);
    deaths = Math.floor((10 - performanceScore) / 2 + Math.random() * 2);
    assists = Math.floor(performanceScore + Math.random() * 3);
  }
  
  // Ensure stats are reasonable (no negative values)
  kills = Math.max(0, kills);
  deaths = Math.max(1, deaths); // At least 1 death for realism
  assists = Math.max(0, assists);
  
  return {
    performanceScore,
    kills,
    deaths,
    assists,
    goldEarned: Math.floor(5000 + performanceScore * 500 + Math.random() * 2000),
    goldSpent: Math.floor(4500 + performanceScore * 500 + Math.random() * 1800),
    damageDealt: Math.floor(10000 + performanceScore * 3000 + Math.random() * 5000),
    damageTaken: Math.floor(8000 + (10 - performanceScore) * 1000 + Math.random() * 4000),
    visionScore: Math.floor(10 + performanceScore * 3 + Math.random() * 5)
  };
}