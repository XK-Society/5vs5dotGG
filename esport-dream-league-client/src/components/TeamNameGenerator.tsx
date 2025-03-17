'use client';

import React, { useState } from 'react';
import { useTeamOperations } from '@/hooks/useTeamOperations';

interface TeamNameGeneratorProps {
  onSelectName: (name: string) => void;
}

// Random team name elements
const prefixes = ['Mystic', 'Radiant', 'Quantum', 'Phoenix', 'Thunder', 'Crimson', 'Nova', 'Stellar', 'Cosmic', 'Shadow'];
const suffixes = ['Legion', 'Titans', 'Dragons', 'Warriors', 'Rangers', 'Guardians', 'Knights', 'Legends', 'Specters', 'Wolves'];
const modifiers = ['Prime', 'Alpha', 'Omega', 'Elite', 'Force', 'Squad', 'Team', 'Crew', 'Guild', 'Faction'];

export const TeamNameGenerator: React.FC<TeamNameGeneratorProps> = ({ onSelectName }) => {
  const { checkTeamExists } = useTeamOperations();
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a random team name
  const generateRandomName = (): string => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    // Sometimes add a modifier
    const useModifier = Math.random() > 0.5;
    
    if (useModifier) {
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      return `${prefix} ${modifier} ${suffix}`;
    }
    
    return `${prefix} ${suffix}`;
  };

  // Generate a few random names
  const generateNames = async () => {
    setIsGenerating(true);
    
    try {
      // Generate 5 unique names
      const newNames: string[] = [];
      const candidateNames: string[] = [];
      
      // Generate 10 candidate names
      for (let i = 0; i < 10; i++) {
        candidateNames.push(generateRandomName());
      }
      
      // Check if names already exist
      for (const name of candidateNames) {
        if (newNames.length >= 5) break;
        
        // Check if this name is already taken
        const exists = await checkTeamExists(name);
        if (!exists) {
          newNames.push(name);
        }
      }
      
      // If we couldn't find 5 unique names, add some with random numbers
      while (newNames.length < 5) {
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const name = `${generateRandomName()} ${randomSuffix}`;
        newNames.push(name);
      }
      
      setGeneratedNames(newNames);
    } catch (error) {
      console.error('Error generating team names:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={generateNames}
        disabled={isGenerating}
        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
      >
        {isGenerating ? 'Generating...' : 'Need inspiration? Generate team names'}
      </button>
      
      {generatedNames.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-gray-500">Select a team name:</p>
          <div className="grid grid-cols-1 gap-2">
            {generatedNames.map((name, index) => (
              <button
                key={index}
                onClick={() => onSelectName(name)}
                className="text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamNameGenerator;