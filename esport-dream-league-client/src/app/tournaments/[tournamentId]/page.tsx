'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { TeamAccount, TournamentAccount } from '@/types/account-types';
import React from 'react'; 

interface TournamentDetailPageProps {
  params: {
    tournamentId: string;
  };
}

export default function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  
  const { tournamentId } = params;
  const { publicKey } = useWallet();
  const { fetchTournamentAccount, getStatusString } = useTournamentOperations();
  const { fetchTeamAccount } = useTeamOperations();
  
  const [tournament, setTournament] = useState<TournamentAccount | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTournament = async () => {
      try {
        setLoading(true);
        if (!tournamentId) return;
        
        const tournamentPDA = new PublicKey(tournamentId);
        const tournamentAccount = await fetchTournamentAccount(tournamentPDA);
        
        if (tournamentAccount) {
          const typedTournament: TournamentAccount = {
            ...tournamentAccount,
            publicKey: tournamentPDA 
          };
          
          setTournament(typedTournament);
          
          // If there are registered teams, fetch their details
          if (typedTournament.registeredTeams && typedTournament.registeredTeams.length > 0) {
            const teamDetails = await Promise.all(
              typedTournament.registeredTeams.map(async (teamId: PublicKey) => {
                try {
                  const teamAccount = await fetchTeamAccount(teamId);
                  return {
                    ...teamAccount,
                    publicKey: teamId,
                  } as TeamAccount;
                } catch (error) {
                  console.error('Error fetching team:', error);
                  return null;
                }
              })
            );
            
            setTeams(teamDetails.filter(Boolean) as TeamAccount[]);
          }
        }
      } catch (error) {
        console.error('Error loading tournament details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTournament();
  }, [tournamentId, fetchTournamentAccount, fetchTeamAccount]);

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
            <p className="mb-4">Tournament not found or error loading tournament details.</p>
            <Link href="/tournaments" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Back to Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(tournament.startTime.toNumber() * 1000);
  const status = tournament.status ? getStatusString(tournament.status) : 'Registration';
  const registeredTeams = tournament.registeredTeams?.length || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <WalletConnectButton />
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                ${status === 'Registration' ? 'bg-blue-100 text-blue-800' : ''}
                ${status === 'In Progress' ? 'bg-green-100 text-green-800' : ''}
                ${status === 'Completed' ? 'bg-gray-100 text-gray-800' : ''}
                ${status === 'Canceled' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {status}
              </span>
            </div>
            
            <div>
              <Link href="/tournaments" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Back to Tournaments
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tournament Info Card */}
            <div className="col-span-1 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Tournament Info</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Entry Fee</p>
                  <p className="font-medium">{(tournament.entryFee / 1_000_000_000).toFixed(2)} SOL</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Prize Pool</p>
                  <p className="font-medium">{(tournament.prizePool / 1_000_000_000).toFixed(2)} SOL</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{startDate.toLocaleDateString()}</p>
                  <p className="text-sm">{startDate.toLocaleTimeString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Teams</p>
                  <p className="font-medium">{registeredTeams}/{tournament.maxTeams}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(tournament.createdAt * 1000).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Organizer</p>
                  <p className="font-medium break-all">{tournament.authority.toString()}</p>
                </div>
              </div>
            </div>
            
            {/* Registered Teams */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Registered Teams</h2>
              
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No teams have registered for this tournament yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Players
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teams.map((team) => (
                        <tr key={team.publicKey.toString()}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {team.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {team.roster?.length || 0}/5
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {team.owner.toString().slice(0, 4)}...{team.owner.toString().slice(-4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/teams/${team.publicKey.toString()}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Team
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Tournament Bracket or Matches */}
            {tournament.matches && tournament.matches.length > 0 && (
              <div className="lg:col-span-4 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Tournament Matches</h2>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Match
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team A
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team B
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Round
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tournament.matches.map((match: any, index: number) => {
                      // Find team names if possible
                      const teamA = teams.find(team => team.publicKey.equals(match.teamA));
                      const teamB = teams.find(team => team.publicKey.equals(match.teamB));
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {match.matchId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {teamA ? teamA.name : match.teamA.toString().slice(0, 6) + '...'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {teamB ? teamB.name : match.teamB.toString().slice(0, 6) + '...'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Round {match.round}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${match.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {match.completed ? 'Completed' : 'Scheduled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {match.completed ? (
                              <div className="text-sm text-gray-900">
                                {match.score[0]} - {match.score[1]}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Pending
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}