'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { TeamCard } from '@/components/TeamCard';
import { PlayerSelectionModal } from '@/components/PlayerSelectionModal';
import { PublicKey } from '@solana/web3.js';
import { TeamStatistics, RosterPosition } from '@/types/program-types';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Teams() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { createTeam, fetchUserTeams, addPlayerToTeam, isLoading } = useTeamOperations();
  const { fetchAllTournaments } = useTournamentOperations();
  
  const [teams, setTeams] = useState<any[]>([]);
  const [teamName, setTeamName] = useState('');
  const [logoUri, setLogoUri] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<PublicKey | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (publicKey) {
        setIsLoadingData(true);
        await loadTeams();
        await loadTournaments();
        setIsLoadingData(false);
      }
    };
    
    loadData();
  }, [publicKey]);

  const loadTeams = async () => {
    if (!publicKey) return;
    
    const userTeams = await fetchUserTeams();
    setTeams(userTeams);
  };

  const loadTournaments = async () => {
    const allTournaments = await fetchAllTournaments();
    setTournaments(allTournaments);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      return;
    }
    
    const teamPDA = await createTeam(
      teamName,
      logoUri || 'https://arweave.net/placeholder-team-logo'
    );
    
    if (teamPDA) {
      setTeamName('');
      setLogoUri('');
      setIsCreatingTeam(false);
      await loadTeams();
    }
  };

  const handleAddPlayerToTeam = (teamPDA: PublicKey) => {
    setSelectedTeam(teamPDA);
    setIsPlayerModalOpen(true);
  };

  const handlePlayerSelected = async (playerMint: PublicKey, position: string) => {
    if (!selectedTeam) return;
    
    const success = await addPlayerToTeam(selectedTeam, playerMint, position);
    if (success) {
      await loadTeams();
    }
  };

  const handleViewDetails = (teamPDA: PublicKey) => {
    // In a full implementation, you might navigate to a team details page
    router.push(`/teams/${teamPDA.toString()}`);
  };

  const handleRegisterForTournament = (teamPDA: PublicKey) => {
    setSelectedTeam(teamPDA);
    setIsTournamentModalOpen(true);
  };

  const defaultTeamStats: TeamStatistics = {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    tournamentWins: 0,
    avgMechanical: 0,
    avgGameKnowledge: 0,
    avgTeamCommunication: 0,
    synergyScore: 0,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6">
          <WalletConnectButton />
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Teams</h1>
            
            <div className="flex space-x-4">
              <Link href="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Back to Home
              </Link>
              
              {publicKey && !isCreatingTeam && (
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setIsCreatingTeam(true)}
                >
                  Create New Team
                </button>
              )}
            </div>
          </div>
          
          {!publicKey ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="mb-4">Please connect your wallet to view your teams</p>
            </div>
          ) : isLoadingData ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading your teams...</p>
            </div>
          ) : (
            <>
              {isCreatingTeam && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Create New Team</h2>
                  
                  <form onSubmit={handleCreateTeam}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamName">
                        Team Name
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="teamName"
                        type="text"
                        placeholder="Enter team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logoUri">
                        Logo URI (optional)
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="logoUri"
                        type="text"
                        placeholder="Arweave or IPFS URI for logo"
                        value={logoUri}
                        onChange={(e) => setLogoUri(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsCreatingTeam(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating...' : 'Create Team'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <TeamCard
                      key={team.publicKey.toString()}
                      name={team.account.name}
                      logoUri={team.account.logoUri}
                      statistics={team.account.statistics || defaultTeamStats}
                      roster={team.account.roster || []}
                      onViewDetailsClick={() => handleViewDetails(team.publicKey)}
                      onRegisterForTournamentClick={() => handleRegisterForTournament(team.publicKey)}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
                    <p>You don't have any teams yet. Create your first team to get started!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSelectPlayer={handlePlayerSelected}
      />
      
      {/* Tournament Selection Modal - Implementation omitted for brevity */}
      {isTournamentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Tournament</h2>
              <button onClick={() => setIsTournamentModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {tournaments.length === 0 ? (
              <div className="text-center py-10">
                <p>No tournaments available for registration.</p>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entry Fee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teams
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tournaments.map((tournament) => (
                        <tr 
                          key={tournament.publicKey.toString()}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            // Here you would register the team for the tournament
                            // For demo purposes we'll just close the modal
                            setIsTournamentModalOpen(false);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tournament.account.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(tournament.account.entryFee / 1_000_000_000).toFixed(2)} SOL
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(tournament.account.startTime * 1000).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tournament.account.registeredTeams?.length || 0}/{tournament.account.maxTeams}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tournament.account.status ? tournament.account.status : 'Registration'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsTournamentModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}