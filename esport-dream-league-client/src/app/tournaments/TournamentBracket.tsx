'use client';

import React from 'react';
import { TeamAccount } from '@/types/program-types';

interface TournamentBracketProps {
  rounds: Array<{
    name: string;
    matches: Array<{
      id: string;
      teamA: TeamAccount | null;
      teamB: TeamAccount | null;
      winner: TeamAccount | null;
      score: [number, number] | null;
    }>;
  }>;
  onSelectMatch: (matchId: string) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  rounds,
  onSelectMatch
}) => {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex" style={{ minWidth: rounds.length * 240 + 'px' }}>
        {rounds.map((round, roundIndex) => (
          <div 
            key={round.name} 
            className="flex-1 px-2"
          >
            <h3 className="text-center font-bold text-blue-400 mb-4">{round.name}</h3>
            
            <div 
              className="space-y-6" 
              style={{ 
                // Add increasing margin to center matches vertically
                marginTop: Math.pow(2, roundIndex) * 20 + 'px' 
              }}
            >
              {round.matches.map((match, matchIndex) => (
                <div 
                  key={match.id}
                  className="relative"
                  style={{
                    height: 80 + Math.pow(2, roundIndex) * 40 + 'px',
                    marginBottom: roundIndex === 0 ? '0' : Math.pow(2, roundIndex) * 40 + 'px'
                  }}
                >
                  {/* Match box */}
                  <div 
                    className={`
                      border rounded-md p-2 bg-gray-800 
                      ${match.winner ? 'border-green-600' : 'border-gray-700'} 
                      ${!match.teamA || !match.teamB ? 'opacity-50' : ''}
                      hover:border-blue-500 hover:bg-gray-700 transition-colors duration-200
                      ${match.teamA && match.teamB && !match.winner ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => {
                      if (match.teamA && match.teamB && !match.winner) {
                        onSelectMatch(match.id);
                      }
                    }}
                  >
                    {/* Team A */}
                    <div className={`
                      flex justify-between p-1 rounded-t-sm
                      ${match.winner === match.teamA ? 'bg-green-900 bg-opacity-30' : ''}
                    `}>
                      <div className="font-medium truncate">
                        {match.teamA ? match.teamA.name : 'TBD'}
                      </div>
                      <div className="font-bold">
                        {match.score ? match.score[0] : '-'}
                      </div>
                    </div>
                    
                    {/* Team B */}
                    <div className={`
                      flex justify-between p-1 rounded-b-sm
                      ${match.winner === match.teamB ? 'bg-green-900 bg-opacity-30' : ''}
                    `}>
                      <div className="font-medium truncate">
                        {match.teamB ? match.teamB.name : 'TBD'}
                      </div>
                      <div className="font-bold">
                        {match.score ? match.score[1] : '-'}
                      </div>
                    </div>
                    
                    {/* Match status indicator */}
                    {match.teamA && match.teamB && !match.winner && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    
                    {match.winner && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full" />
                    )}
                  </div>
                  
                  {/* Connector lines to next round */}
                  {roundIndex < rounds.length - 1 && (
                    <>
                      {/* Vertical line from current match */}
                      <div 
                        className="absolute bg-gray-700" 
                        style={{
                          width: '2px',
                          height: Math.pow(2, roundIndex) * 40 + 'px',
                          right: '-1px',
                          top: '40px'
                        }}
                      />
                      
                      {/* Horizontal line to next match */}
                      <div 
                        className="absolute bg-gray-700" 
                        style={{
                          height: '2px',
                          width: '16px',
                          right: '-16px',
                          top: 40 + Math.pow(2, roundIndex) * 20 + 'px'
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-6 text-gray-400 text-sm">
        <p>Click on a match with two teams to simulate the match</p>
        <div className="flex justify-center mt-2 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Ready to Play</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;