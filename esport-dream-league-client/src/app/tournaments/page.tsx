'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import Link from 'next/link';
import { PublicKey } from '@solana/web3.js';
import { SafeImage } from '@/components/SafeImage';
import { TeamAccount, TournamentAccount } from '@/types/program-types';

// Define interfaces for TypeScript
interface TeamData {
  publicKey: PublicKey;
  account: TeamAccount;
}

interface TournamentData {
  publicKey: PublicKey;
  account: TournamentAccount;
  formattedStartDate?: string;
  formattedEndDate?: string;
  formattedEntryFee?: string;
  formattedPrizePool?: string;
  remainingSlots?: number;
  status?: string;
  isRegistered?: boolean;
}

export default function TournamentsPage() {
  const { publicKey } = useWallet();
  const { createTournament, fetchAllTournaments, getStatusString, registerTeamForTournament, isLoading: isTournamentLoading } = useTournamentOperations();
  const { fetchUserTeams } = useTeamOperations();
  
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);
  const [userTeams, setUserTeams] = useState<TeamData[]>([]);
  const [isCreatingTournament, setIsCreatingTournament] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>('');
  
  // Form state for creating a tournament
  const [tournamentName, setTournamentName] = useState<string>('');
  const [entryFee, setEntryFee] = useState<string>('0.01');
  const [startDate, setStartDate] = useState<string>('');
  const [maxTeams, setMaxTeams] = useState<string>('8');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  
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
    try {
      const allTournaments = await fetchAllTournaments();
      
      // Type assertion for TypeScript
      const typedTournaments = allTournaments as unknown as TournamentData[];
      
      // Process tournament data
      const processedTournaments = typedTournaments.map(tournament => {
        // Calculate prize pool (entry fee * max teams)
        const entryFeeSOL = tournament.account.entryFee / 1_000_000_000;
        const prizePool = entryFeeSOL * tournament.account.maxTeams;
        
        // Format dates
        const startDate = new Date(tournament.account.startTime * 1000);
        const endDateEstimate = new Date(startDate);
        endDateEstimate.setDate(endDateEstimate.getDate() + 3); // Assuming tournaments last 3 days
        
        // Calculate remaining slots
        const remainingSlots = tournament.account.maxTeams - tournament.account.registeredTeams.length;
        
        // Get status string
        const status = getStatusString(tournament.account);
        
        // Check if user has a team registered
        const isRegistered = publicKey ? tournament.account.registeredTeams.some(
          (          team: { toString: () => string; }) => userTeams.some(userTeam => userTeam.publicKey.toString() === team.toString())
        ) : false;
        
        return {
          ...tournament,
          formattedStartDate: startDate.toLocaleDateString(),
          formattedEndDate: endDateEstimate.toLocaleDateString(),
          formattedEntryFee: `${entryFeeSOL} SOL`,
          formattedPrizePool: `${prizePool} SOL`,
          remainingSlots,
          status,
          isRegistered
        };
      });
      
      setTournaments(processedTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      setTournaments([]);
    }
  };

  const loadUserTeams = async () => {
    if (!publicKey) return;
    
    try {
      const teams = await fetchUserTeams();
      // Type assertion for TypeScript
      setUserTeams(teams as unknown as TeamData[]);
    } catch (error) {
      console.error('Error loading user teams:', error);
      setUserTeams([]);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      return;
    }
    
    // Form validation
    if (!tournamentName.trim()) {
      setFormError('Please enter a tournament name');
      return;
    }
    
    if (parseFloat(entryFee) <= 0) {
      setFormError('Entry fee must be greater than 0');
      return;
    }
    
    if (!startDate) {
      setFormError('Please select a start date');
      return;
    }
    
    if (parseInt(maxTeams) < 2) {
      setFormError('Tournament must allow at least 2 teams');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Convert entry fee from SOL to lamports
      const entryFeeLamports = Math.round(parseFloat(entryFee) * 1_000_000_000);
      
      // Convert start date to Unix timestamp
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      
      const tournamentPDA = await createTournament(
        tournamentName,
        entryFeeLamports,
        startTimestamp,
        parseInt(maxTeams)
      );
      
      if (tournamentPDA) {
        // Reset form fields
        setTournamentName('');
        setEntryFee('0.01');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setStartDate(tomorrow.toISOString().split('T')[0]);
        setMaxTeams('8');
        setIsCreatingTournament(false);
        
        // Reload tournaments
        await loadTournaments();
      }
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      setFormError(error.message || 'Failed to create tournament. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !selectedTeam || !selectedTournament) {
      return;
    }
    
    setIsRegistering(true);
    setRegisterError('');
    
    try {
      const teamPubkey = new PublicKey(selectedTeam);
      const tournamentPubkey = new PublicKey(selectedTournament);
      
      await registerTeamForTournament(teamPubkey, tournamentPubkey);
      
      // Reload tournaments
      await loadTournaments();
      
      // Close registration modal by resetting selection
      setSelectedTeam('');
      setSelectedTournament('');
    } catch (error: any) {
      console.error('Error registering team:', error);
      setRegisterError(error.message || 'Failed to register team. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Filter tournaments based on active tab
  const filteredTournaments = tournaments.filter(tournament => {
    const now = Math.floor(Date.now() / 1000);
    
    if (activeTab === 'upcoming') {
      return tournament.account.startTime > now && !tournament.account.ended;
    } else if (activeTab === 'active') {
      return tournament.account.startTime <= now && !tournament.account.ended;
    } else if (activeTab === 'completed') {
      return tournament.account.ended;
    } else if (activeTab === 'registered') {
      return tournament.isRegistered;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="text-xl font-bold text-yellow-500 mr-2">5VS5</div>
                <div className="text-xl font-bold text-blue-400">dotGG</div>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-400 hover:text-blue-400">Home</Link>
              <Link href="/players" className="text-gray-400 hover:text-blue-400">Players</Link>
              <Link href="/teams" className="text-gray-400 hover:text-blue-400">Teams</Link>
              <Link href="/tournaments" className="text-blue-400 font-semibold">Tournaments</Link>
            </nav>
            <div>
              <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 text-sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-16 md:w-64 bg-gray-900 border-r border-gray-800 min-h-screen hidden md:block">
          <div className="p-4">
            <div className="py-4 border-b border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">My Account</div>
                  {publicKey ? (
                    <div className="text-xs text-gray-500">{publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</div>
                  ) : (
                    <div className="text-xs text-gray-500">Not connected</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="py-4">
              <div className="text-xs uppercase text-gray-500 mb-2">Tournament Actions</div>
              <ul className="space-y-2">
                {publicKey && (
                  <li>
                    <button 
                      onClick={() => setIsCreatingTournament(true)}
                      className="flex items-center w-full text-left text-gray-400 hover:text-blue-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Tournament
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex items-center w-full text-left ${activeTab === 'upcoming' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upcoming Tournaments
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center w-full text-left ${activeTab === 'active' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Live Tournaments
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex items-center w-full text-left ${activeTab === 'completed' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Completed
                  </button>
                </li>
                {publicKey && (
                  <li>
                    <button
                      onClick={() => setActiveTab('registered')}
                      className={`flex items-center w-full text-left ${activeTab === 'registered' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      My Tournaments
                    </button>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="py-4 border-t border-gray-800">
              <div className="text-xs uppercase text-gray-500 mb-2">Statistics</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Tournaments:</span>
                  <span>{tournaments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-green-400">
                    {tournaments.filter(t => 
                      t.account.startTime <= Math.floor(Date.now() / 1000) && !t.account.ended
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your Teams:</span>
                  <span>{userTeams.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header with Tabs (Mobile) */}
          <div className="md:hidden mb-6">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                Live
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                Completed
              </button>
              {publicKey && (
                <button
                  onClick={() => setActiveTab('registered')}
                  className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === 'registered' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  My Tournaments
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {activeTab === 'upcoming' && 'Upcoming Tournaments'}
              {activeTab === 'active' && 'Live Tournaments'}
              {activeTab === 'completed' && 'Completed Tournaments'}
              {activeTab === 'registered' && 'My Tournaments'}
            </h1>
            
            {publicKey && !isCreatingTournament && (
              <button
                onClick={() => setIsCreatingTournament(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Tournament
              </button>
            )}
            
            {isCreatingTournament && (
              <button
                onClick={() => setIsCreatingTournament(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Create Tournament Form */}
          {isCreatingTournament && (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
              <form onSubmit={handleCreateTournament}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="tournamentName">
                        Tournament Name
                      </label>
                      <input
                        type="text"
                        id="tournamentName"
                        value={tournamentName}
                        onChange={(e) => setTournamentName(e.target.value)}
                        className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter tournament name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="entryFee">
                        Entry Fee (SOL)
                      </label>
                      <input
                        type="number"
                        id="entryFee"
                        value={entryFee}
                        onChange={(e) => setEntryFee(e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="startDate">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="maxTeams">
                        Maximum Teams
                      </label>
                      <select
                        id="maxTeams"
                        value={maxTeams}
                        onChange={(e) => setMaxTeams(e.target.value)}
                        className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="2">2 Teams</option>
                        <option value="4">4 Teams</option>
                        <option value="8">8 Teams</option>
                        <option value="16">16 Teams</option>
                        <option value="32">32 Teams</option>
                      </select>
                    </div>
                    
                    {formError && (
                      <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
                        {formError}
                      </div>
                    )}
                    
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingTournament(false)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </span>
                        ) : 'Create Tournament'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Tournament Preview</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Tournament Name</div>
                        <div className="text-xl font-bold">{tournamentName || 'Tournament Name'}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Entry Fee</div>
                          <div className="text-lg font-medium text-yellow-500">{entryFee} SOL</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Prize Pool</div>
                          <div className="text-lg font-medium text-yellow-500">
                            {(parseFloat(entryFee) * parseInt(maxTeams || '0')).toFixed(2)} SOL
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Start Date</div>
                          <div className="text-lg font-medium">
                            {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Team Capacity</div>
                          <div className="text-lg font-medium">{maxTeams} Teams</div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                        <div className="text-sm text-gray-400 mb-2">After creation:</div>
                        <div className="flex items-center space-x-3 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Teams can register until start date</span>
                        </div>
                        <div className="flex items-center space-x-3 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Entry fees form the prize pool</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Winner takes all prize distribution</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Tournament Registration Modal */}
          {selectedTeam && selectedTournament && (
            <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-80 flex items-center justify-center p-4">
              <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-700">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Register for Tournament</h3>
                  
                  <form onSubmit={handleRegisterTeam}>
                    <div className="mb-4">
                      <p className="text-gray-300 mb-4">
                        You are about to register your team for this tournament. The entry fee will be deducted from your wallet.
                      </p>
                      
                      <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <div className="text-sm text-gray-400 mb-1">Selected Team</div>
                        <div className="font-medium">
                          {userTeams.find(team => team.publicKey.toString() === selectedTeam)?.account.name || 'Unknown Team'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Tournament</div>
                        <div className="font-medium">
                          {tournaments.find(t => t.publicKey.toString() === selectedTournament)?.account.name || 'Unknown Tournament'}
                        </div>
                        <div className="text-yellow-500 mt-1">
                          Entry Fee: {tournaments.find(t => t.publicKey.toString() === selectedTournament)?.formattedEntryFee || '0 SOL'}
                        </div>
                      </div>
                    </div>
                    
                    {registerError && (
                      <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4">
                        {registerError}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeam('');
                          setSelectedTournament('');
                          setRegisterError('');
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                        disabled={isRegistering}
                      >
                        {isRegistering ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </span>
                        ) : 'Confirm Registration'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Tournament Cards */}
          {isLoadingData ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Loading tournaments...</span>
            </div>
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament, index) => (
                <div key={index} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition duration-300 border border-gray-700">
                  <div className={`p-4 ${tournament.account.ended ? 'bg-gray-700' : tournament.account.startTime <= Math.floor(Date.now() / 1000) ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gradient-to-r from-blue-900 to-indigo-900'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold mb-1">{tournament.account.name}</h2>
                        <p className="text-sm">
                          {tournament.account.ended ? (
                            <span className="text-gray-400">Completed</span>
                          ) : tournament.account.startTime <= Math.floor(Date.now() / 1000) ? (
                            <span className="text-green-400">Live Now</span>
                          ) : (
                            <span className="text-blue-300">Starts: {tournament.formattedStartDate}</span>
                          )}
                        </p>
                      </div>
                      {tournament.isRegistered && (
                        <div className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                          Registered
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between mb-4">
                      <div className="text-center px-3 py-2 bg-gray-900 rounded-lg">
                        <div className="text-sm text-gray-400">Teams</div>
                        <div className="text-lg font-bold">{tournament.account.registeredTeams.length}/{tournament.account.maxTeams}</div>
                      </div>
                      <div className="text-center px-3 py-2 bg-gray-900 rounded-lg">
                        <div className="text-sm text-gray-400">Entry</div>
                        <div className="text-lg font-bold text-yellow-500">{tournament.formattedEntryFee}</div>
                      </div>
                      <div className="text-center px-3 py-2 bg-gray-900 rounded-lg">
                        <div className="text-sm text-gray-400">Prize</div>
                        <div className="text-lg font-bold text-yellow-500">{tournament.formattedPrizePool}</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-semibold mb-1">Registration</div>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (tournament.account.registeredTeams.length / tournament.account.maxTeams) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.min(100, Math.floor((tournament.account.registeredTeams.length / tournament.account.maxTeams) * 100))}%
                        </span>
                      </div>
                    </div>
                    
                    {publicKey && !tournament.account.ended && !tournament.isRegistered && tournament.account.startTime > Math.floor(Date.now() / 1000) && tournament.account.registeredTeams.length < tournament.account.maxTeams ? (
                      userTeams.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedTournament(tournament.publicKey.toString());
                            setSelectedTeam(userTeams[0].publicKey.toString()); // Default to first team
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                        >
                          Register Team
                        </button>
                      ) : (
                        <Link href="/teams">
                          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                            Create Team First
                          </button>
                        </Link>
                      )
                    ) : tournament.account.ended ? (
                      <button
                        className="w-full bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Tournament Ended
                      </button>
                    ) : tournament.isRegistered ? (
                      <button
                        className="w-full bg-green-900 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                      >
                        View Details
                      </button>
                    ) : tournament.account.registeredTeams.length >= tournament.account.maxTeams ? (
                      <button
                        className="w-full bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Fully Registered
                      </button>
                    ) : (
                      <button
                        className="w-full bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Registration Closed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
              <div className="inline-block p-4 rounded-full bg-blue-900 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No tournaments found</h2>
              <p className="text-gray-400 mb-6">
                {activeTab === 'upcoming' && 'There are no upcoming tournaments currently scheduled.'}
                {activeTab === 'active' && 'There are no tournaments currently in progress.'}
                {activeTab === 'completed' && 'There are no completed tournaments.'}
                {activeTab === 'registered' && 'You haven\'t registered for any tournaments yet.'}
              </p>
              {publicKey && activeTab !== 'active' && activeTab !== 'completed' && !isCreatingTournament && (
                <button
                  onClick={() => setIsCreatingTournament(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  Create Tournament
                </button>
              )}
              {!publicKey && (
                <div>
                  <p className="mb-4 text-gray-400">Connect your wallet to create or join tournaments</p>
                  <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}