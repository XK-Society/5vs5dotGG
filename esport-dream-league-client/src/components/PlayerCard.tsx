import { FC } from 'react';
import { Rarity } from '@/types/program-types';
import Image from 'next/image';

interface PlayerCardProps {
  name: string;
  position: string;
  mechanical: number;
  gameKnowledge: number;
  teamCommunication: number;
  adaptability: number;
  consistency: number;
  form: number;
  rarity: Rarity;
  uri: string;
  onTrainClick?: () => void;
  onAddToTeamClick?: () => void;
}

export const PlayerCard: FC<PlayerCardProps> = ({
  name,
  position,
  mechanical,
  gameKnowledge,
  teamCommunication,
  adaptability,
  consistency,
  form,
  rarity,
  uri,
  onTrainClick,
  onAddToTeamClick,
}) => {
  const rarityColors = {
    [Rarity.Common]: 'bg-gray-100',
    [Rarity.Uncommon]: 'bg-green-100',
    [Rarity.Rare]: 'bg-blue-100',
    [Rarity.Epic]: 'bg-purple-100',
    [Rarity.Legendary]: 'bg-yellow-100',
  };

  const rarityNames = {
    [Rarity.Common]: 'Common',
    [Rarity.Uncommon]: 'Uncommon',
    [Rarity.Rare]: 'Rare',
    [Rarity.Epic]: 'Epic',
    [Rarity.Legendary]: 'Legendary',
  };

  return (
    <div className={`${rarityColors[rarity]} rounded-lg overflow-hidden shadow-lg max-w-sm`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{name}</h2>
          <span className="text-sm font-medium bg-blue-500 text-white px-2 py-1 rounded">
            {rarityNames[rarity]}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">Position: {position}</p>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Mechanical</span>
            <span>{mechanical}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${mechanical}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Game Knowledge</span>
            <span>{gameKnowledge}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${gameKnowledge}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Team Communication</span>
            <span>{teamCommunication}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: `${teamCommunication}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Adaptability</span>
            <span>{adaptability}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${adaptability}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Consistency</span>
            <span>{consistency}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full"
              style={{ width: `${consistency}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span>Form</span>
            <span>{form}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full"
              style={{ width: `${form}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          {onTrainClick && (
            <button
              onClick={onTrainClick}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Train
            </button>
          )}
          
          {onAddToTeamClick && (
            <button
              onClick={onAddToTeamClick}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Add to Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
};