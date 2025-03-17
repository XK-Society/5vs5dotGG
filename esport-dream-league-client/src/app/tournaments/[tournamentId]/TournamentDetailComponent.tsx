'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { usePlayerOperations } from '@/hooks/usePlayerOperations';
import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';

interface TournamentDetailComponentProps {
  tournamentId: string;
}

// Interface for tournament data
interface TournamentData {
  name: string;
  entryFee: number;
  prizePool: number;
  startTime: number;
  status: number;
  registeredTeams: PublicKey[];
  maxTeams: number;
  // Add other tournament properties as needed
}

export default function TournamentDetailComponent({ tournamentId }: TournamentDetailComponentProps) {
  const { publicKey } = useWallet();
  const { fetchTournamentAccount } = useTournamentOperations();
  const { fetchUserTeams } = useTeamOperations();
  
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!tournamentId) return;
        
        const tournamentPDA = new PublicKey(tournamentId);
        const tournamentAccount = await fetchTournamentAccount(tournamentPDA);
        
        if (tournamentAccount) {
          setTournament(tournamentAccount as unknown as TournamentData);
          
          // If user is connected, fetch their teams for registration
          if (publicKey) {
            const teams = await fetchUserTeams();
            setUserTeams(teams);
          }
        }
      } catch (error) {
        console.error('Error loading tournament details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [tournamentId, publicKey, fetchTournamentAccount, fetchUserTeams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-6">
        <div className="mb-6">
          <WalletConnectButton />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <p>Loading tournament details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-6">
        <div className="mb-6">
          <WalletConnectButton />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="mb-4">Tournament not found or error loading details.</p>
            <Link href="/tournaments" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Back to Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate tournament status
  const startDate = new Date(tournament.startTime * 1000);
  const isRegistrationOpen = tournament.status === 0; // Registration status
  const registeredCount = tournament.registeredTeams.length;
  const spotsRemaining = tournament.maxTeams - registeredCount;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6">
          <WalletConnectButton />
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            
            <Link href="/tournaments" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Back to Tournaments
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tournament Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Tournament Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Entry Fee</p>
                  <p className="font-medium">{(tournament.entryFee / 1_000_000_000).toFixed(2)} SOL</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Prize Pool</p>
                  <p className="font-medium">{(tournament.prizePool / 1_000_000_000).toFixed(2)} SOL</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${tournament.status === 0 ? 'bg-blue-100 text-blue-800' : ''}
                      ${tournament.status === 1 ? 'bg-green-100 text-green-800' : ''}
                      ${tournament.status === 2 ? 'bg-gray-100 text-gray-800' : ''}
                      ${tournament.status === 3 ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {tournament.status === 0 && 'Registration'}
                      {tournament.status === 1 && 'In Progress'}
                      {tournament.status === 2 && 'Completed'}
                      {tournament.status === 3 && 'Canceled'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Teams</p>
                  <p className="font-medium">{registeredCount}/{tournament.maxTeams} ({spotsRemaining} spots remaining)</p>
                </div>
              </div>
              
              {isRegistrationOpen && publicKey && userTeams.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Register a Team</h3>
                  <select className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2">
                    <option value="">Select your team</option>
                    {userTeams.map((team, index) => (
                      <option key={index} value={team.publicKey.toString()}>
                        {team.account.name}
                      </option>
                    ))}
                  </select>
                  
                  <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Register Team ({(tournament.entryFee / 1_000_000_000).toFixed(2)} SOL)
                  </button>
                </div>
              )}
              
              {isRegistrationOpen && publicKey && userTeams.length === 0 && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-yellow-700">
                    You need to create a team before you can register for tournaments.
                  </p>
                  <Link href="/teams" className="mt-2 inline-block text-yellow-700 font-medium underline">
                    Create a team
                  </Link>
                </div>
              )}
              
              {isRegistrationOpen && !publicKey && (
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-blue-700">
                    Connect your wallet to register for this tournament.
                  </p>
                </div>
              )}
            </div>
            
            {/* Registered Teams Card */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Registered Teams</h2>
              
              {tournament.registeredTeams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No teams have registered yet.</p>
                  <p className="text-gray-500 mt-2">Be the first to register!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Placeholder for registered teams - would be populated from tournament data */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Team data would be displayed here
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Owner address
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Registration date
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Tournament Bracket Card - only shown for tournaments in progress or completed */}
            {tournament.status > 0 && (
              <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Tournament Bracket</h2>
                
                <div className="text-center py-8">
                  <p className="text-gray-500">Tournament bracket visualization would go here.</p>
                  <p className="text-gray-500 mt-2">This would show the matchups and results.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}