'use client';

import { FC } from 'react';
import { RosterPosition, TeamStatistics } from '@/types/program-types';
import Image from 'next/image';
import { PublicKey } from '@solana/web3.js';

interface TeamCardProps {
  name: string;
  logoUri: string;
  statistics: TeamStatistics;
  roster: RosterPosition[];
  onViewDetailsClick?: () => void;
  onRegisterForTournamentClick?: () => void;
}

export const TeamCard: FC<TeamCardProps> = ({
  name,
  logoUri,
  statistics,
  roster,
  onViewDetailsClick,
  onRegisterForTournamentClick,
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-16 w-16 relative rounded-full overflow-hidden mr-4 bg-gray-200">
            {logoUri && (
              <Image 
                src={logoUri} 
                alt={`${name} logo`} 
                fill 
                className="object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = '/placeholder-team-logo.jpg';
                }}
              />
            )}
          </div>
          <h2 className="text-xl font-bold">{name}</h2>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Team Statistics</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-500">Matches</p>
              <p className="font-medium">{statistics.matchesPlayed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wins</p>
              <p className="font-medium">{statistics.wins}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Losses</p>
              <p className="font-medium">{statistics.losses}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tournaments Won</p>
              <p className="font-medium">{statistics.tournamentWins}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Team Synergy</h3>
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>Synergy Score</span>
              <span>{statistics.synergyScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${statistics.synergyScore}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Roster ({roster.length}/5)</h3>
          <ul className="space-y-2">
            {roster.map((position, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{position.position}</span>
                <span className="text-sm text-gray-500">
                  {position.playerMint.toString().slice(0, 4)}...{position.playerMint.toString().slice(-4)}
                </span>
              </li>
            ))}
            {roster.length === 0 && (
              <li className="text-gray-500">No players on the roster</li>
            )}
          </ul>
        </div>
        
        <div className="flex space-x-4">
          {onViewDetailsClick && (
            <button
              onClick={onViewDetailsClick}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Details
            </button>
          )}
          
          {onRegisterForTournamentClick && (
            <button
              onClick={onRegisterForTournamentClick}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Register for Tournament
            </button>
          )}
        </div>
      </div>
    </div>
  );
};