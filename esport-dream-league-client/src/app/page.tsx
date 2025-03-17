// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';

export default function Home() {
  const { publicKey } = useWallet();
  const { fetchUserTeams } = useTeamOperations();
  const { fetchAllTournaments } = useTournamentOperations();

  const [userTeamsCount, setUserTeamsCount] = useState(0);
  const [activeTournamentsCount, setActiveTournamentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (publicKey) {
        setIsLoading(true);
        try {
          const teams = await fetchUserTeams();
          setUserTeamsCount(teams?.length || 0); // Use optional chaining and fallback to 0

          const tournaments = await fetchAllTournaments();
          setActiveTournamentsCount(tournaments?.length || 0); // Use optional chaining and fallback to 0
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadData();
  }, [publicKey, fetchUserTeams, fetchAllTournaments]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Esport Dream League</h1>
          <WalletConnectButton />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-12">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold mb-4">Welcome to Esport Dream League</h2>
              <p className="text-xl mb-6">
                Build your dream esports team, compete in tournaments, and rise to the top of the
                rankings in this blockchain-powered esports management simulation.
              </p>
              {!publicKey ? (
                <div>
                  <p className="mb-4">Connect your wallet to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-2">Your Teams</h3>
                    <p className="text-3xl font-bold">{isLoading ? '...' : userTeamsCount}</p>
                    <Link 
                      href="/teams" 
                      className="mt-3 inline-block bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50"
                    >
                      Manage Teams
                    </Link>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-2">Active Tournaments</h3>
                    <p className="text-3xl font-bold">{isLoading ? '...' : activeTournamentsCount}</p>
                    <Link 
                      href="/tournaments" 
                      className="mt-3 inline-block bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50"
                    >
                      View Tournaments
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">Players</h3>
              <p className="text-gray-600 mb-4">
                Collect and train esports athlete NFTs with unique stats and abilities.
              </p>
              <Link 
                href="/create-player" 
                className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Create Player
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">Teams</h3>
              <p className="text-gray-600 mb-4">
                Form teams with complementary skills and build team synergy over time.
              </p>
              <Link 
                href="/teams" 
                className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Manage Teams
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">Tournaments</h3>
              <p className="text-gray-600 mb-4">
                Compete in tournaments with entry fees and prizes for the victors.
              </p>
              <Link 
                href="/tournaments" 
                className="inline-block bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                View Tournaments
              </Link>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-lg shadow p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold mb-2">Create Players</h3>
                <p className="text-gray-600">Mint athlete NFTs with unique stats and abilities</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold mb-2">Form Teams</h3>
                <p className="text-gray-600">Combine players into balanced, synergistic teams</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold mb-2">Join Tournaments</h3>
                <p className="text-gray-600">Enter your team into competitive tournaments</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                <h3 className="font-semibold mb-2">Win Rewards</h3>
                <p className="text-gray-600">Earn prizes and improve your team's reputation</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Esports Dynasty?</h2>
            <p className="text-xl mb-6">
              Connect your wallet and begin building your dream team today!
            </p>
            {!publicKey && (
              <div className="inline-block">
                <WalletConnectButton />
              </div>
            )}
            {publicKey && (
              <Link 
                href="/create-player" 
                className="inline-block bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-50"
              >
                Create Your First Player
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}