'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import Link from 'next/link';
import { SafeImage } from '@/components/SafeImage';
import { PublicKey } from '@solana/web3.js';

// ✅ TeamAccount and Team Interface
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

const DEFAULT_TEAM_LOGO = 'https://via.placeholder.com/150';

export default function TeamsPage() {
  const { publicKey } = useWallet();
  const { fetchUserTeams, createTeam } = useTeamOperations();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTeamMode, setCreateTeamMode] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');

  // ✅ Store the previous publicKey to prevent unnecessary refetch
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
    if (!newTeamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    try {
      const teamPDA = await createTeam(newTeamName, newTeamLogo || DEFAULT_TEAM_LOGO);
      if (teamPDA) {
        await loadTeams();
        setCreateTeamMode(false);
        setNewTeamName('');
        setNewTeamLogo('');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Teams</h1>
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamName">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />

              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logoUri">
                Team Logo URL (Optional)
              </label>
              <input
                type="text"
                id="logoUri"
                value={newTeamLogo}
                onChange={(e) => setNewTeamLogo(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Create Team
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading teams...</p>
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
            <p>You don't have any teams yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
