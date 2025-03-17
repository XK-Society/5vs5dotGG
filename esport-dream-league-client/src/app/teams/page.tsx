'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import Link from 'next/link';
import { SafeImage } from '@/components/SafeImage';
import { PublicKey } from '@solana/web3.js';
import TeamNameGenerator from '@/components/TeamNameGenerator';

// Team interfaces
interface TeamStatistics {
  matchesPlayed: number;
  wins: number;
  losses: number;
  tournamentWins: number;
  avgMechanical: number;
  avgGameKnowledge: number;
  avgTeamCommunication: number;
  synergyScore: number;
}

interface RosterPosition {
  playerMint: PublicKey;
  position: string;
  addedAt: number;
}

interface TeamAccount {
  owner: PublicKey;
  name: string;
  collectionMint?: PublicKey;
  logoUri: string;
  createdAt: number;
  lastUpdated: number;
  roster: RosterPosition[];
  statistics: TeamStatistics;
  matchHistory: any[];
}

interface Team {
  publicKey: PublicKey;
  account: TeamAccount;
  formattedCreatedAt?: string;
  formattedLastUpdated?: string;
}

// Use local image path instead of external URL
const DEFAULT_TEAM_LOGO = '/images/placeholder-team-logo.png';

export default function TeamsPage() {
  const { publicKey } = useWallet();
  const { fetchUserTeams, createTeam, checkTeamExists } = useTeamOperations();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTeamMode, setCreateTeamMode] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');
  const [nameError, setNameError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store the previous publicKey to prevent unnecessary refetch
  const previousPublicKey = useRef<PublicKey | null>(null);

  const loadTeams = async () => {
    if (!publicKey) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userTeams = await fetchUserTeams();

      const typedTeams = userTeams as unknown as Team[];

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
    if (publicKey && previousPublicKey.current !== publicKey) {
      loadTeams();
      previousPublicKey.current = publicKey;
    }

    if (!publicKey) {
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
      
      const teamPDA = await createTeam(newTeamName, newTeamLogo || DEFAULT_TEAM_LOGO);
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
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Back button to home */}
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold">My Teams</h1>
          </div>
          <WalletConnectButton />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {publicKey ? 'Manage your esports teams' : 'Connect your wallet to manage your teams'}
            </p>

            {publicKey && (
              <button
                onClick={() => setCreateTeamMode(!createTeamMode)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {createTeamMode ? 'Cancel' : 'Create Team'}
              </button>
            )}
          </div>

          {createTeamMode && (
            <form onSubmit={handleCreateTeam} className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamName">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => {
                    setNewTeamName(e.target.value);
                    // Clear error when user types
                    if (nameError) setNameError('');
                  }}
                  placeholder="Enter team name"
                  className={`shadow appearance-none border ${nameError ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  required
                />
                {nameError && (
                  <p className="text-red-500 text-xs italic mt-1">{nameError}</p>
                )}
                
                {/* Add Team Name Generator component */}
                <TeamNameGenerator onSelectName={handleSelectName} />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logoUri">
                  Team Logo URL (Optional)
                </label>
                <input
                  type="text"
                  id="logoUri"
                  value={newTeamLogo}
                  onChange={(e) => setNewTeamLogo(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Leave blank for default logo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left blank, a default logo will be used
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCreateTeamMode(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading teams...</p>
            </div>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <SafeImage
                      src={team.account.logoUri || DEFAULT_TEAM_LOGO}
                      alt={team.account.name}
                      className="w-16 h-16 mr-4 rounded-full"
                    />
                    <h2 className="text-xl font-bold">{team.account.name}</h2>
                  </div>
                  <p className="text-sm text-gray-600">Created: {team.formattedCreatedAt}</p>
                  <p className="text-sm text-gray-600">Players: {team.account.roster.length}/5</p>
                  <Link href={`/teams/${team.publicKey.toString()}`}>
                    <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Manage Team
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center py-10">
              <p className="text-lg text-gray-600 mb-4">You don't have any teams yet.</p>
              {!createTeamMode && publicKey && (
                <button
                  onClick={() => setCreateTeamMode(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create Your First Team
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}