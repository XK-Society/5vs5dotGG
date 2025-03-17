'use client';

import React from 'react';
import { TeamAccount, PlayerAccount } from '@/types/program-types';
import { MatchStats } from '@/simulation/types';

interface MatchScoreboardProps {
  teamA: TeamAccount;
  teamB: TeamAccount;
  teamAPlayers: PlayerAccount[];
  teamBPlayers: PlayerAccount[];
  matchStats: MatchStats;
  currentTime: number;
}

const MatchScoreboard: React.FC<MatchScoreboardProps> = ({
  teamA,
  teamB,
  teamAPlayers,
  teamBPlayers,
  matchStats,
  currentTime
}) => {
  // Determine if the match has ended
  const matchEnded = currentTime >= matchStats.duration;
  
  // Get player performances from match stats
  const getPlayerPerformance = (player: PlayerAccount) => {
    if (!player.publicKey) return null;
    return matchStats.playerPerformances[player.publicKey.toString()];
  };
  
  // Scale stats based on current match time
  const scaleStatByTime = (value: number) => {
    if (matchEnded) return value;
    const scaleFactor = Math.min(1, currentTime / matchStats.duration);
    return Math.floor(value * scaleFactor);
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-white">Match Statistics</h3>
      
      {/* Team comparison */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-1">
          <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
            <h4 className="text-center font-bold text-blue-300 mb-2">{teamA.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-right text-white">{scaleStatByTime(matchStats.teamStats.teamA.objectives)}</div>
              <div className="text-gray-400">Objectives</div>
              
              <div className="text-right text-white">{scaleStatByTime(matchStats.teamStats.teamA.teamfights)}</div>
              <div className="text-gray-400">Teamfights</div>
              
              <div className="text-right text-white">{scaleStatByTime(matchStats.teamStats.teamA.plays)}</div>
              <div className="text-gray-400">Plays</div>
              
              {matchEnded && matchStats.teamStats.teamA.mvp && (
                <>
                  <div className="text-right text-white">{matchStats.teamStats.teamA.mvp.name}</div>
                  <div className="text-gray-400">MVP</div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="text-blue-400 font-bold text-lg">{scaleStatByTime(matchStats.teamStats.teamA.earlyGameScore)}</div>
              <div className="text-white font-bold">Early</div>
              <div className="text-red-400 font-bold text-lg">{scaleStatByTime(matchStats.teamStats.teamB.earlyGameScore)}</div>
              
              <div className="text-blue-400 font-bold text-lg">{scaleStatByTime(matchStats.teamStats.teamA.midGameScore)}</div>
              <div className="text-white font-bold">Mid</div>
              <div className="text-red-400 font-bold text-lg">{scaleStatByTime(matchStats.teamStats.teamB.midGameScore)}</div>
              
              <div className="text-blue-400 font-bold text-lg">{scaleStatByTime(matchStats.teamStats.teamA.lateGameScore)}</div>
              <div className="text-white font-bold">Late</div>
              <div className="text-red-400 font-bold text-lg">{scaleStatByTime(matchStats.teamStats.teamB.lateGameScore)}</div>
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="bg-red-900 bg-opacity-50 rounded-lg p-4">
            <h4 className="text-center font-bold text-red-300 mb-2">{teamB.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Objectives</div>
              <div className="text-white">{scaleStatByTime(matchStats.teamStats.teamB.objectives)}</div>
              
              <div className="text-gray-400">Teamfights</div>
              <div className="text-white">{scaleStatByTime(matchStats.teamStats.teamB.teamfights)}</div>
              
              <div className="text-gray-400">Plays</div>
              <div className="text-white">{scaleStatByTime(matchStats.teamStats.teamB.plays)}</div>
              
              {matchEnded && matchStats.teamStats.teamB.mvp && (
                <>
                  <div className="text-gray-400">MVP</div>
                  <div className="text-white">{matchStats.teamStats.teamB.mvp.name}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Player performance tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A players */}
        <div>
          <h4 className="text-blue-300 font-bold mb-2">{teamA.name} Players</h4>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-2 px-3 text-left">Player</th>
                  <th className="py-2 px-2 text-center">K</th>
                  <th className="py-2 px-2 text-center">D</th>
                  <th className="py-2 px-2 text-center">A</th>
                  <th className="py-2 px-2 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {teamAPlayers.map((player, index) => {
                  const performance = getPlayerPerformance(player);
                  if (!performance) return null;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="py-2 px-3">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.position}</div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">{scaleStatByTime(performance.kills)}</td>
                      <td className="py-2 px-2 text-center">{scaleStatByTime(performance.deaths)}</td>
                      <td className="py-2 px-2 text-center">{scaleStatByTime(performance.assists)}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={
                          performance.performanceScore >= 8 ? 'text-green-400' :
                          performance.performanceScore >= 6 ? 'text-blue-400' :
                          performance.performanceScore >= 4 ? 'text-yellow-400' : 'text-red-400'
                        }>
                          {matchEnded ? performance.performanceScore.toFixed(1) : '...'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Team B players */}
        <div>
          <h4 className="text-red-300 font-bold mb-2">{teamB.name} Players</h4>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-2 px-3 text-left">Player</th>
                  <th className="py-2 px-2 text-center">K</th>
                  <th className="py-2 px-2 text-center">D</th>
                  <th className="py-2 px-2 text-center">A</th>
                  <th className="py-2 px-2 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {teamBPlayers.map((player, index) => {
                  const performance = getPlayerPerformance(player);
                  if (!performance) return null;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="py-2 px-3">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.position}</div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">{scaleStatByTime(performance.kills)}</td>
                      <td className="py-2 px-2 text-center">{scaleStatByTime(performance.deaths)}</td>
                      <td className="py-2 px-2 text-center">{scaleStatByTime(performance.assists)}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={
                          performance.performanceScore >= 8 ? 'text-green-400' :
                          performance.performanceScore >= 6 ? 'text-blue-400' :
                          performance.performanceScore >= 4 ? 'text-yellow-400' : 'text-red-400'
                        }>
                          {matchEnded ? performance.performanceScore.toFixed(1) : '...'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchScoreboard;