'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import Link from 'next/link';
import { SafeImage } from '@/components/SafeImage';
import { PublicKey } from '@solana/web3.js';
import TeamNameGenerator from '@/components/TeamNameGenerator';
import { TeamAccount } from '@/types/program-types';

// Define type for team data
interface TeamData {
  publicKey: PublicKey;
  account: TeamAccount;
  formattedCreatedAt?: string;
  formattedLastUpdated?: string;
}

export default function TeamsPage() {
  const { publicKey } = useWallet();
  const { fetchUserTeams, createTeam, checkTeamExists } = useTeamOperations();

  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createTeamMode, setCreateTeamMode] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamLogo, setNewTeamLogo] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadTeams = async () => {
    if (!publicKey) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userTeams = await fetchUserTeams();
      
      // Add type assertion to make TypeScript happy
      const typedTeams = userTeams as unknown as TeamData[]; 

      const formattedTeams = typedTeams.map((team) => ({
        ...team,
        formattedCreatedAt: formatDate(team.account.createdAt),
        formattedLastUpdated: formatDate(team.account.lastUpdated),
      }));

      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      loadTeams();
    } else {
      setTeams([]);
    }
  }, [publicKey]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setNameError('');
    
    // Basic validation
    if (!newTeamName.trim()) {
      setNameError('Please enter a team name');
      return;
    }
    
    // Check for minimum length
    if (newTeamName.trim().length < 3) {
      setNameError('Team name must be at least 3 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if team name already exists
      const exists = await checkTeamExists(newTeamName);
      if (exists) {
        setNameError('A team with this name already exists. Please choose a different name.');
        setIsSubmitting(false);
        return;
      }
      
      const teamPDA = await createTeam(newTeamName, newTeamLogo || '/images/placeholder-team-logo.png');
      if (teamPDA) {
        await loadTeams();
        setCreateTeamMode(false);
        setNewTeamName('');
        setNewTeamLogo('');
      }
    } catch (error: any) {
      console.error('Error creating team:', error);
      
      // Check for specific error types
      if (error.message && error.message.includes("already in use")) {
        setNameError('A team with this name already exists. Please choose a different name.');
      } else {
        setNameError('Failed to create team. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle selecting a generated name
  const handleSelectName = (name: string) => {
    setNewTeamName(name);
    // Clear any previous errors
    setNameError('');
  };

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
              <Link href="/teams" className="text-blue-400 font-semibold">Teams</Link>
              <Link href="/tournaments" className="text-gray-400 hover:text-blue-400">Tournaments</Link>
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
              <div className="text-xs uppercase text-gray-500 mb-2">Team Management</div>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setCreateTeamMode(true)}
                    className="flex items-center w-full text-left text-gray-400 hover:text-blue-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Team
                  </button>
                </li>
                <li>
                  <Link href="/teams" className="flex items-center text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    All Teams
                  </Link>
                </li>
                <li>
                  <Link href="/tournaments" className="flex items-center text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Tournaments
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="py-4 border-t border-gray-800">
              <div className="text-xs uppercase text-gray-500 mb-2">Statistics</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Teams:</span>
                  <span>{teams.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tournaments:</span>
                  <span>2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className="text-green-400">68%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Teams</h1>
            
            {publicKey && !createTeamMode && (
              <button
                onClick={() => setCreateTeamMode(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Team
              </button>
            )}
            
            {createTeamMode && (
              <button
                onClick={() => setCreateTeamMode(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Create Team Form */}
          {createTeamMode && (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
              <form onSubmit={handleCreateTeam}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="teamName">
                        Team Name
                      </label>
                      <input
                        type="text"
                        id="teamName"
                        value={newTeamName}
                        onChange={(e) => {
                          setNewTeamName(e.target.value);
                          if (nameError) setNameError('');
                        }}
                        placeholder="Enter team name"
                        className={`bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 ${nameError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      />
                      {nameError && (
                        <p className="text-red-500 text-xs mt-1">{nameError}</p>
                      )}
                      
                      {/* Add Team Name Generator component */}
                      <TeamNameGenerator onSelectName={handleSelectName} />
                    </div>

                    <div className="mb-6">
                      <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="logoUri">
                        Team Logo URL (Optional)
                      </label>
                      <input
                        type="text"
                        id="logoUri"
                        value={newTeamLogo}
                        onChange={(e) => setNewTeamLogo(e.target.value)}
                        className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave blank for default logo"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        If left blank, a default logo will be used
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCreateTeamMode(false)}
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
                        ) : 'Create Team'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Team Preview</h3>
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden">
                        {newTeamLogo ? (
                          <SafeImage
                            src={newTeamLogo}
                            alt={newTeamName || "Team Logo"}
                            className="w-24 h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-purple-800">
                            <span className="text-3xl font-bold">{newTeamName ? newTeamName.charAt(0) : '?'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold">{newTeamName || "Team Name"}</h4>
                      <p className="text-gray-400 text-sm">
                        {publicKey ? `Owner: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : "Owner: Not connected"}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-400 text-sm mb-2">Team roster will be empty. You'll need to add players after creation.</p>
                      <div className="flex items-center space-x-3 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Participate in tournaments</span>
                      </div>
                      <div className="flex items-center space-x-3 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Add up to 5 players</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Earn rewards from wins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Team Cards */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Loading teams...</span>
            </div>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <div key={index} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition duration-300 border border-gray-700">
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4">
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-gray-700 rounded-full overflow-hidden mr-4">
                        <SafeImage
                          src={team.account.logoUri || '/images/placeholder-team-logo.png'}
                          alt={team.account.name}
                          className="h-16 w-16 object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{team.account.name}</h2>
                        <p className="text-blue-300 text-sm">
                          Created: {team.formattedCreatedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between mb-4">
                      <div className="text-center px-3 py-2 bg-gray-900 rounded-lg">
                        <div className="text-sm text-gray-400">Players</div>
                        <div className="text-xl font-bold">{team.account.roster.length}/5</div>
                      </div>
                      <div className="text-center px-3 py-2 bg-gray-900 rounded-lg">
                        <div className="text-sm text-gray-400">Matches</div>
                        <div className="text-xl font-bold">{team.account.statistics?.matchesPlayed || 0}</div>
                      </div>
                      <div className="text-center px-3 py-2 bg-gray-900 rounded-lg">
                        <div className="text-sm text-gray-400">Win Rate</div>
                        <div className="text-xl font-bold text-green-400">
                          {team.account.statistics?.matchesPlayed > 0 
                            ? Math.round((team.account.statistics?.wins / team.account.statistics?.matchesPlayed) * 100)
                            : 0}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-semibold mb-1">Team Synergy</div>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${team.account.statistics?.synergyScore || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{team.account.statistics?.synergyScore || 0}%</span>
                      </div>
                    </div>
                    
                    <Link href={`/teams/${team.publicKey.toString()}`}>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                        Manage Team
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
              <div className="inline-block p-4 rounded-full bg-blue-900 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">You don't have any teams yet</h2>
              <p className="text-gray-400 mb-6">Create your first team to start participating in tournaments</p>
              {!createTeamMode && publicKey && (
                <button
                  onClick={() => setCreateTeamMode(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  Create Your First Team
                </button>
              )}
              {!publicKey && (
                <div>
                  <p className="mb-4 text-gray-400">Connect your wallet to create a team</p>
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