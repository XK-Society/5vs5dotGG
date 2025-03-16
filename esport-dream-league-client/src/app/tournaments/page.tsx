'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { TournamentStatus } from '@/types/program-types';

export default function Tournaments() {
  const { publicKey } = useWallet();
  const { createTournament, fetchAllTournaments, getStatusString, isLoading } = useTournamentOperations();
  const { fetchUserTeams } = useTeamOperations();
  
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [isCreatingTournament, setIsCreatingTournament] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Form state
  const [tournamentName, setTournamentName] = useState('');
  const [entryFee, setEntryFee] = useState('0.01');
  const [startDate, setStartDate] = useState('');
  const [maxTeams, setMaxTeams] = useState('8');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      await loadTournaments();
      
      if (publicKey) {
        await loadUserTeams();
      }
      
      setIsLoadingData(false);
    };
    
    loadData();
    
    // Set default start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
  }, [publicKey]);

  const loadTournaments = async () => {
    const allTournaments = await fetchAllTournaments();
    setTournaments(allTournaments);
  };

  const loadUserTeams = async () => {
    if (!publicKey) return;
    
    const teams = await fetchUserTeams();
    setUserTeams(teams);
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      return;
    }
    
    // Convert entry fee from SOL to lamports
    const entryFeeLamports = parseFloat(entryFee) * 1_000_000_000;
    
    // Convert start date to Unix timestamp
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    
    const tournamentPDA = await createTournament(
      tournamentName,
      entryFeeLamports,
      startTimestamp,
      parseInt(maxTeams)
    );
    
    if (tournamentPDA) {
      setTournamentName('');
      setEntryFee('0.01');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);
      setMaxTeams('8');
      setIsCreatingTournament(false);
      await loadTournaments();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <WalletConnectButton />
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg text-gray-600">
              Browse and join esports tournaments
            </div>
            
            <div className="flex space-x-4">
              <Link href="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Back to Home
              </Link>
              
              {publicKey && !isCreatingTournament && (
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setIsCreatingTournament(true)}
                >
                  Create Tournament
                </button>
              )}
            </div>
          </div>
          
          {isCreatingTournament && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Create New Tournament</h2>
              
              <form onSubmit={handleCreateTournament}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tournamentName">
                      Tournament Name
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="tournamentName"
                      type="text"
                      placeholder="Enter tournament name"
                      value={tournamentName}
                      onChange={(e) => setTournamentName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="entryFee">
                      Entry Fee (SOL)
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="entryFee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Entry fee in SOL"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxTeams">
                      Maximum Teams
                    </label>
                    <select
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="maxTeams"
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(e.target.value)}
                      required
                    >
                      <option value="4">4 Teams</option>
                      <option value="8">8 Teams</option>
                      <option value="16">16 Teams</option>
                      <option value="32">32 Teams</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTournament(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Tournament'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {isLoadingData ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading tournaments...</p>
            </div>
          ) : (
            <>
              {tournaments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-lg mb-4">No tournaments found</p>
                  <p className="text-gray-600">
                    {publicKey 
                      ? "Be the first to create a tournament!"
                      : "Connect your wallet to create a tournament"}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tournament
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entry Fee
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teams
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tournaments.map((tournament) => {
                        const startDate = new Date(tournament.account.startTime.toNumber() * 1000);
                        const status = tournament.account.status ? getStatusString(tournament.account.status) : 'Registration';
                        const registeredTeams = tournament.account.registeredTeams?.length || 0;
                        
                        return (
                          <tr key={tournament.publicKey.toString()}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {tournament.account.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {tournament.publicKey.toString().slice(0, 8)}...
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {(tournament.account.entryFee / 1_000_000_000).toFixed(2)} SOL
                              </div>
                              <div className="text-xs text-gray-500">
                                Prize: {(tournament.account.prizePool / 1_000_000_000).toFixed(2)} SOL
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {startDate.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {startDate.toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {registeredTeams}/{tournament.account.maxTeams}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${status === 'Registration' ? 'bg-blue-100 text-blue-800' : ''}
                                ${status === 'In Progress' ? 'bg-green-100 text-green-800' : ''}
                                ${status === 'Completed' ? 'bg-gray-100 text-gray-800' : ''}
                                ${status === 'Canceled' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {status === 'Registration' && userTeams.length > 0 && (
                                <button
                                  onClick={() => {
                                    // In a complete implementation, this would open a modal to select a team
                                    // For now, we'll just show a message
                                    alert(`To register for this tournament, you would select one of your teams to join. This would require ${(tournament.account.entryFee / 1_000_000_000).toFixed(2)} SOL.`);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  Register Team
                                </button>
                              )}
                              <Link
                                href={`/tournaments/${tournament.publicKey.toString()}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {publicKey && userTeams.length === 0 && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        You need to create a team before you can register for tournaments.
                      </p>
                      <p className="mt-2">
                        <Link
                          href="/teams"
                          className="text-yellow-700 font-medium underline hover:text-yellow-600"
                        >
                          Create a team
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}