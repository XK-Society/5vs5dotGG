'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { usePlayerOperations } from '@/hooks/usePlayerOperations';
import { PlayerSelectionModal } from '@/components/PlayerSelectionModal';
import { PublicKey } from '@solana/web3.js';
import { Rarity } from '@/types/program-types';
import { TeamAccount, RosterPosition, PlayerAccount } from '@/types/program-types';
import Link from 'next/link';
import Image from 'next/image';

interface TeamDetailComponentProps {
  teamId: string;
}

// Safe Image component for handling image loading errors
function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fill = false 
}: { 
  src?: string, 
  alt: string, 
  className?: string,
  fill?: boolean 
}) {
  const [error, setError] = useState(false);
  const initial = (alt || '?').charAt(0).toUpperCase();

  // Process the image src to ensure it's valid
  const imageSrc = useMemo(() => {
    if (!src) return '/images/placeholder-team-logo.png';
    
    // If it's already a full URL, use it
    if (src.startsWith('http') || src.startsWith('https')) return src;
    
    // If it might be an Arweave ID without https://, assume it's a local path
    if (src.startsWith('arweave.net/')) return `/images/placeholder-team-logo.png`;
    
    // If it's a local path that doesn't start with /, add it
    if (!src.startsWith('/')) return `/${src}`;
    
    return src;
  }, [src]);

  // If loading error occurred, show fallback
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-blue-100 text-blue-600 text-xl font-bold ${className}`}>
        {initial}
      </div>
    );
  }

  // Otherwise try to load the image
  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      fill={fill}
      onError={() => setError(true)}
    />
  );
}

export default function TeamDetailComponent({ teamId }: TeamDetailComponentProps) {
  const { publicKey } = useWallet();
  const { fetchTeamAccount, addPlayerToTeam, removePlayerFromTeam } = useTeamOperations();
  const { fetchPlayerAccount } = usePlayerOperations();
  
  const [team, setTeam] = useState<TeamAccount | null>(null);
  const [players, setPlayers] = useState<PlayerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Keep track of loaded team IDs and loading state to prevent redundant fetches
  const loadedTeamIds = useRef(new Set<string>());
  const isLoadingRef = useRef(false);

  // Helper function to find player PDAs
  const findPlayerPDA = useCallback((mintPublicKey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('player'), mintPublicKey.toBuffer()],
      new PublicKey('2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ') // Your program ID
    );
  }, []);

  // Memoize the loadTeam function without including 'team' in dependencies
  const loadTeam = useCallback(async () => {
    // Use ref to prevent concurrent loadings
    if (isLoadingRef.current) return;
    if (!teamId) return;
    
    // Skip loading if we've already loaded this teamId
    if (loadedTeamIds.current.has(teamId)) {
      setLoading(false);
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      console.log("Loading team data for:", teamId);
      const teamPDA = new PublicKey(teamId);
      const teamAccount = await fetchTeamAccount(teamPDA);
      
      if (teamAccount) {
        // Process logo URI to ensure it's valid
        let logoUri = '/images/placeholder-team-logo.png';
        if (teamAccount.logoUri) {
          if (teamAccount.logoUri.startsWith('http') || teamAccount.logoUri.startsWith('/')) {
            logoUri = teamAccount.logoUri;
          } else if (teamAccount.logoUri.startsWith('images/')) {
            logoUri = `/${teamAccount.logoUri}`;
          }
        }

        // Ensure all required properties are present
        const safeTeamAccount: TeamAccount = {
          ...teamAccount,
          logoUri: logoUri,
          roster: teamAccount.roster || [],
          statistics: teamAccount.statistics || {
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            tournamentWins: 0,
            avgMechanical: 0,
            avgGameKnowledge: 0,
            avgTeamCommunication: 0,
            synergyScore: 0
          },
          matchHistory: teamAccount.matchHistory || []
        };

        setTeam(safeTeamAccount);
        
        // Check if current user is the team owner
        if (publicKey) {
          setIsOwner(publicKey.equals(teamAccount.owner));
        }
        
        // Fetch detailed player info for each player in the roster
        if (safeTeamAccount.roster && safeTeamAccount.roster.length > 0) {
          console.log("Loading players for team:", teamId);
          const playerPromises = safeTeamAccount.roster.map(async (position: RosterPosition) => {
            try {
              const [playerPDA] = findPlayerPDA(position.playerMint);
              const playerAccount = await fetchPlayerAccount(playerPDA);
              if (playerAccount) {
                return {
                  ...playerAccount,
                  publicKey: playerPDA,
                  position: position.position,
                } as PlayerAccount;
              }
              return null;
            } catch (error) {
              console.error('Error fetching player:', error);
              return null;
            }
          });
          
          const playerDetails = await Promise.all(playerPromises);
          const validPlayers = playerDetails.filter(Boolean) as PlayerAccount[];
          setPlayers(validPlayers);
        } else {
          setPlayers([]);
        }
        
        // Mark that we've loaded this team ID
        loadedTeamIds.current.add(teamId);
      }
    } catch (error) {
      console.error('Error loading team details:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [teamId, publicKey, fetchTeamAccount, fetchPlayerAccount, findPlayerPDA]);

  // Only run when the component mounts or teamId changes
  useEffect(() => {
    // Reset loading state when teamId changes
    setLoading(true);
    
    // Only load if not already loaded
    if (!loadedTeamIds.current.has(teamId)) {
      loadTeam();
    } else {
      setLoading(false);
    }
    
    // Clean up function to clear the loaded flag when component unmounts or teamId changes
    return () => {
      // Only clean up the specific teamId being unmounted
      if (teamId) {
        loadedTeamIds.current.delete(teamId);
      }
    };
  }, [teamId, loadTeam]);

  const handlePlayerSelected = async (playerMint: PublicKey, position: string) => {
    if (!team || !team.publicKey) return;
    
    const success = await addPlayerToTeam(team.publicKey, playerMint, position);
    if (success) {
      // Remove the teamId from loaded set to force reload
      loadedTeamIds.current.delete(teamId);
      // Reload the team data
      await loadTeam();
      // Close the modal
      setIsPlayerModalOpen(false);
    }
  };

  const handleRemovePlayer = async (playerMint: PublicKey) => {
    if (!team || !team.publicKey) return;
    
    const confirmed = window.confirm('Are you sure you want to remove this player from the team?');
    if (!confirmed) return;
    
    const success = await removePlayerFromTeam(team.publicKey, playerMint);
    if (success) {
      // Remove the teamId from loaded set to force reload
      loadedTeamIds.current.delete(teamId);
      // Reload the team data
      await loadTeam();
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-6">
        <div className="mb-6">
          <Link href="/teams" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Teams</span>
          </Link>
          <WalletConnectButton />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <p>Loading team details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!team) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-6">
        <div className="mb-6">
          <Link href="/teams" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Teams</span>
          </Link>
          <WalletConnectButton />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="mb-4">Team not found or error loading team details.</p>
            <Link href="/teams" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render team details
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6">
          <Link href="/teams" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Teams</span>
          </Link>
          <WalletConnectButton />
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{team.name}</h1>
            
            <div className="flex space-x-4">
              {isOwner && (
                <button
                  onClick={() => setIsPlayerModalOpen(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={team.roster?.length >= 5}
                >
                  Add Player
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Overview Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 relative rounded-full overflow-hidden mr-4 bg-gray-200">
                  <SafeImage 
                    src={team.logoUri} 
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{team.name}</h2>
                  <p className="text-gray-600">Owner: {team.owner.toString().slice(0, 4)}...{team.owner.toString().slice(-4)}</p>
                  <p className="text-gray-600">Created: {new Date(team.createdAt * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Team Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Matches</p>
                    <p className="font-medium">{team.statistics?.matchesPlayed || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wins</p>
                    <p className="font-medium">{team.statistics?.wins || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Losses</p>
                    <p className="font-medium">{team.statistics?.losses || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tournaments Won</p>
                    <p className="font-medium">{team.statistics?.tournamentWins || 0}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Team Synergy</h3>
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span>Synergy Score</span>
                    <span>{team.statistics?.synergyScore || 0}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${team.statistics?.synergyScore || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Roster */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Team Roster ({team.roster?.length || 0}/5)</h2>
              
              {!team.roster || team.roster.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No players on the roster yet.</p>
                  {isOwner && (
                    <button
                      onClick={() => setIsPlayerModalOpen(true)}
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Add Your First Player
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.roster.map((position: RosterPosition, index: number) => {
                    const player = players.find(p => p.mint.equals(position.playerMint));
                    
                    return (
                      <div key={index} className="border rounded-lg p-4 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold">{player?.name || 'Unknown Player'}</h3>
                            <p className="text-sm text-gray-600">{position.position}</p>
                          </div>
                          {player && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {Rarity[player.rarity]}
                            </span>
                          )}
                        </div>
                        
                        {player ? (
                          <>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Mechanical</p>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{ width: `${player.mechanical}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Game Knowledge</p>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-green-600 h-1.5 rounded-full"
                                    style={{ width: `${player.gameKnowledge}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Team Comm</p>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-yellow-600 h-1.5 rounded-full"
                                    style={{ width: `${player.teamCommunication}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Consistency</p>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-red-600 h-1.5 rounded-full"
                                    style={{ width: `${player.consistency}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            {isOwner && (
                              <button
                                onClick={() => handleRemovePlayer(position.playerMint)}
                                className="mt-auto self-end text-sm text-red-600 hover:text-red-800"
                              >
                                Remove Player
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Loading player details...</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Match History */}
            {team.matchHistory && team.matchHistory.length > 0 && (
              <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Match History</h2>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opponent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tournament
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {team.matchHistory.map((match, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(match.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {match.opponent.toString().slice(0, 4)}...{match.opponent.toString().slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${match.win ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {match.win ? 'Win' : 'Loss'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {match.score[0]} - {match.score[1]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {match.tournamentId ? (
                            <span className="text-blue-600">
                              Tournament Match
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Friendly Match
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSelectPlayer={handlePlayerSelected}
      />
    </div>
  );
}