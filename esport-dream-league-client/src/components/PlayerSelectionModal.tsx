'use client';

import { FC, useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { usePlayerOperations } from '@/hooks/usePlayerOperations';
import { Rarity } from '@/types/program-types';

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayer: (playerMint: PublicKey, position: string) => void;
}

interface PlayerInfo {
  pubkey: PublicKey;
  account: {
    mint: PublicKey;
    name: string;
    position: string;
    mechanical: number;
    gameKnowledge: number;
    teamCommunication: number;
    adaptability: number;
    consistency: number;
    rarity: Rarity;
    team: PublicKey | null;
  };
}

export const PlayerSelectionModal: FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlayer,
}) => {
  const { fetchPlayerAccount } = usePlayerOperations();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<PublicKey | null>(null);
  const [position, setPosition] = useState('');

  // Simulated function to get player accounts
  // In a real implementation, you would fetch these from the blockchain
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      
      try {
        // Simulated data - in a real app you would fetch from chain
        // This would use your program.account.playerAccount.all() with appropriate filters
        const playerData: PlayerInfo[] = [
          {
            pubkey: new PublicKey('5YfJYToSXr9qMKcNBXpdbSxvP4StsEGf2NRULJ4e9gKZ'),
            account: {
              mint: new PublicKey('5YfJYToSXr9qMKcNBXpdbSxvP4StsEGf2NRULJ4e9gKZ'),
              name: 'Pro Gamer 1',
              position: 'Mid Laner',
              mechanical: 85,
              gameKnowledge: 80,
              teamCommunication: 70,
              adaptability: 75,
              consistency: 78,
              rarity: Rarity.Epic,
              team: null,
            },
          },
          {
            pubkey: new PublicKey('HNpdP2rL6PwdXAVn3qGgGBgKHEZvUKgdL2hkfQzKKrJz'),
            account: {
              mint: new PublicKey('HNpdP2rL6PwdXAVn3qGgGBgKHEZvUKgdL2hkfQzKKrJz'),
              name: 'Pro Gamer 2',
              position: 'Top Laner',
              mechanical: 70,
              gameKnowledge: 90,
              teamCommunication: 85,
              adaptability: 65,
              consistency: 72,
              rarity: Rarity.Rare,
              team: null,
            },
          },
          {
            pubkey: new PublicKey('EBXX95Aqwp9X9FHFuiTUvfLcF8A9PrwHqAB4rNsPjDLP'),
            account: {
              mint: new PublicKey('EBXX95Aqwp9X9FHFuiTUvfLcF8A9PrwHqAB4rNsPjDLP'),
              name: 'Pro Gamer 3',
              position: 'Support',
              mechanical: 65,
              gameKnowledge: 95,
              teamCommunication: 92,
              adaptability: 80,
              consistency: 88,
              rarity: Rarity.Legendary,
              team: null,
            },
          },
        ];
        
        setPlayers(playerData);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen]);

  const handleSelectPlayer = () => {
    if (!selectedPlayer || !position) return;
    
    onSelectPlayer(selectedPlayer, position);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Select Player</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading players...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Position:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              >
                <option value="">Select position</option>
                <option value="Mid Laner">Mid Laner</option>
                <option value="Top Laner">Top Laner</option>
                <option value="Jungler">Jungler</option>
                <option value="AD Carry">AD Carry</option>
                <option value="Support">Support</option>
              </select>
            </div>
            
            <div className="max-h-96 overflow-y-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rarity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player) => (
                    <tr key={player.pubkey.toString()}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="radio"
                          name="selectedPlayer"
                          checked={selectedPlayer?.equals(player.account.mint) || false}
                          onChange={() => setSelectedPlayer(player.account.mint)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {player.account.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {player.account.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {Rarity[player.account.rarity]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectPlayer}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={!selectedPlayer || !position}
              >
                Add Player
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};