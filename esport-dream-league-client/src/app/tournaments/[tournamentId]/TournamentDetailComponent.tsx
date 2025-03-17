'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { usePlayerOperations } from '@/hooks/usePlayerOperations';
import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';
import TournamentSimulator from '@/app/tournaments/TournamentSimulator';
import { TeamAccount } from '@/types/program-types';

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
  const { fetchUserTeams, fetchTeamAccount } = useTeamOperations();
  
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [registeredTeams, setRegisteredTeams] = useState<TeamAccount[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'simulator'>('info');
  const [showSimulator, setShowSimulator] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!tournamentId) return;
        
        const tournamentPDA = new PublicKey(tournamentId);
        const tournamentAccount = await fetchTournamentAccount(tournamentPDA);
        
        if (tournamentAccount) {
          setTournament(tournamentAccount as unknown as TournamentData);
          
          // Fetch details for each registered team
          if (tournamentAccount.registeredTeams && tournamentAccount.registeredTeams.length > 0) {
            const teamPromises = tournamentAccount.registeredTeams.map(async (teamPDA: PublicKey) => {
              try {
                return await fetchTeamAccount(teamPDA);
              } catch (error) {
                console.error('Error fetching team:', error);
                return null;
              }
            });
            
            const teams = await Promise.all(teamPromises);
            setRegisteredTeams(teams.filter(Boolean) as TeamAccount[]);
          }
          
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
  }, [tournamentId, publicKey, fetchTournamentAccount, fetchUserTeams, fetchTeamAccount]);

  // Determine if tournament can be simulated
  const canSimulate = () => {
    if (!tournament) return false;
    
    // Must have at least 2 teams registered
    return registeredTeams.length >= 2;
  };

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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="py-6 px-6">
        <div className="mb-6">
          <WalletConnectButton />
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            
            <div className="flex space-x-3">
              <Link href="/tournaments" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                Back to Tournaments
              </Link>
              
              {canSimulate() && (
                <button
                  onClick={() => setShowSimulator(!showSimulator)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {showSimulator ? 'Hide Simulator' : 'Run Tournament Simulation'}
                </button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          {showSimulator && (
            <div className="mb-6 border-b border-gray-800">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-3 px-4 border-b-2 font-medium ${
                    activeTab === 'info' 
                      ? 'border-blue-500 text-blue-500' 
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Tournament Info
                </button>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`py-3 px-4 border-b-2 font-medium ${
                    activeTab === 'simulator' 
                      ? 'border-blue-500 text-blue-500' 
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Simulator
                </button>
              </div>
            </div>
          )}
          
          {/* Tournament Simulator */}
          {showSimulator && activeTab === 'simulator' && (
            <TournamentSimulator 
              tournament={tournament as any}
              registeredTeams={registeredTeams}
            />
          )}
          
          {/* Tournament Info */}
          {(!showSimulator || activeTab === 'info') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tournament Info Card */}
              <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Tournament Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="font-medium">{startDate.toLocaleDateString()} at {startDate.toLocaleTimeString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Entry Fee</p>
                    <p className="font-medium">{(tournament.entryFee / 1_000_000_000).toFixed(2)} SOL</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Prize Pool</p>
                    <p className="font-medium">{(tournament.prizePool / 1_000_000_000).toFixed(2)} SOL</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
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
                    <p className="text-sm text-gray-400">Teams</p>
                    <p className="font-medium">{registeredCount}/{tournament.maxTeams} ({spotsRemaining} spots remaining)</p>
                  </div>
                </div>
                
                {isRegistrationOpen && publicKey && userTeams.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Register a Team</h3>
                    <select className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white mb-2 focus:outline-none focus:border-blue-500">
                      <option value="">Select your team</option>
                      {userTeams.map((team, index) => (
                        <option key={index} value={team.publicKey.toString()}>
                          {team.account.name}
                        </option>
                      ))}
                    </select>
                    
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Register Team ({(tournament.entryFee / 1_000_000_000).toFixed(2)} SOL)
                    </button>
                  </div>
                )}
                
                {isRegistrationOpen && publicKey && userTeams.length === 0 && (
                  <div className="mt-6 bg-gray-700 border-l-4 border-yellow-500 p-4">
                    <p className="text-yellow-200">
                      You need to create a team before you can register for tournaments.
                    </p>
                    <Link href="/teams" className="mt-2 inline-block text-yellow-200 font-medium underline">
                      Create a team
                    </Link>
                  </div>
                )}
                
                {isRegistrationOpen && !publicKey && (
                  <div className="mt-6 bg-gray-700 border-l-4 border-blue-500 p-4">
                    <p className="text-blue-200">
                      Connect your wallet to register for this tournament.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Registered Teams Card */}
              <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Registered Teams</h2>
                
                {registeredTeams.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No teams have registered yet.</p>
                    <p className="text-gray-400 mt-2">Be the first to register!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {registeredTeams.map((team, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="h-10 w-10 bg-blue-900 rounded-full flex items-center justify-center text-lg font-bold mr-3">
                            {team.name.charAt(0)}
                          </div>
                          <h3 className="font-bold truncate">{team.name}</h3>
                        </div>
                        <div className="text-xs text-gray-400">
                          Owner: {team.owner.toString().slice(0, 4)}...{team.owner.toString().slice(-4)}
                        </div>
                        <div className="mt-2 text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Synergy</span>
                            <span>{team.statistics.synergyScore}/100</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${team.statistics.synergyScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show simulator button if enough teams */}
                {!showSimulator && canSimulate() && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setShowSimulator(true);
                        setActiveTab('simulator');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                    >
                      Run Tournament Simulation
                    </button>
                    <p className="text-gray-400 text-sm mt-2">
                      See how the tournament might play out based on team stats
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}