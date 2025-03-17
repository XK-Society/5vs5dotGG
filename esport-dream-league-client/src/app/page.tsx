'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTeamOperations } from '@/hooks/useTeamOperations';
import { useTournamentOperations } from '@/hooks/useTournamentOperations';

export default function HomePage() {
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
          setUserTeamsCount(teams?.length || 0);

          const tournaments = await fetchAllTournaments();
          setActiveTournamentsCount(tournaments?.length || 0);
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-xl font-bold text-yellow-500 mr-2">5VS5</div>
              <div className="text-xl font-bold text-blue-400">dotGG</div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-blue-400 font-semibold">Home</Link>
              <Link href="/players" className="text-gray-400 hover:text-blue-400">Players</Link>
              <Link href="/teams" className="text-gray-400 hover:text-blue-400">Teams</Link>
              <Link href="/tournaments" className="text-gray-400 hover:text-blue-400">Tournaments</Link>
              <Link href="/marketplace" className="text-gray-400 hover:text-blue-400">Marketplace</Link>
            </nav>
            <div>
              <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 text-sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content Layout */}
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
              
              {publicKey && (
                <div className="flex items-center mb-1">
                  <div className="text-yellow-500 text-sm mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    100,000
                  </div>
                  <button className="ml-auto bg-yellow-500 text-xs text-black px-2 py-1 rounded">Get More</button>
                </div>
              )}
            </div>
            
            <div className="py-4">
              <div className="text-xs uppercase text-gray-500 mb-2">Quick Links</div>
              <ul className="space-y-2">
                <li>
                  <Link href="/create-player" className="flex items-center text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Player
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="flex items-center text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    My Teams
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
                <li>
                  <Link href="/marketplace" className="flex items-center text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Marketplace
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="py-4 border-t border-gray-800">
              <div className="text-xs uppercase text-gray-500 mb-2">Rewards</div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-sm mb-2">Daily Bonuses</div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">3/5 claimed</span>
                  <span className="text-xs text-green-400">+500 coins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M47.7,-57.2C59.9,-45.8,67.1,-28.6,70.2,-10.3C73.4,8,72.5,27.3,62.7,40.9C53,54.5,34.3,62.4,15.8,65.8C-2.7,69.2,-21,68.1,-35.3,60.3C-49.7,52.5,-60.1,38,-65.3,21.5C-70.5,5,-70.4,-13.6,-63.3,-28.7C-56.2,-43.8,-42.1,-55.3,-27.5,-65.2C-12.9,-75.1,2.2,-83.4,15.9,-79.9C29.7,-76.4,42,-68.1,47.7,-57.2Z" transform="translate(100 100)" />
              </svg>
            </div>
            
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-bold mb-3">Welcome to 5vs5.GG</h1>
              <p className="text-xl mb-6 text-blue-100">
                Build your dream esports team, compete in tournaments, and rise to the top in this blockchain-powered esports simulation.
              </p>
              
              {!publicKey ? (
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg">
                  Connect Wallet to Start
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-blue-300 font-semibold mb-1">Your Teams</div>
                    <div className="text-3xl mb-2">{isLoading ? '...' : userTeamsCount}</div>
                    <Link href="/teams" className="text-sm text-yellow-500 hover:text-yellow-400 font-medium">
                      View Teams →
                    </Link>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-blue-300 font-semibold mb-1">Active Tournaments</div>
                    <div className="text-3xl mb-2">{isLoading ? '...' : activeTournamentsCount}</div>
                    <Link href="/tournaments" className="text-sm text-yellow-500 hover:text-yellow-400 font-medium">
                      View Tournaments →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Statistics Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Your Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-sm mb-1">Players Owned</div>
                <div className="text-2xl font-bold text-white">12</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-sm mb-1">Matches Played</div>
                <div className="text-2xl font-bold text-white">48</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-sm mb-1">Win Rate</div>
                <div className="text-2xl font-bold text-green-500">62%</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-sm mb-1">Prize Earnings</div>
                <div className="text-2xl font-bold text-yellow-500">3.2 SOL</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-sm mb-1">Player Rating</div>
                <div className="text-2xl font-bold text-blue-400">A+</div>
              </div>
            </div>
          </div>
          
          {/* Feature Cards */}
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-5 hover:shadow-lg hover:from-blue-700 transition duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Players</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Collect and train esports athlete NFTs with unique stats and abilities.
              </p>
              <Link href="/create-player" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                Create Player
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-5 hover:shadow-lg hover:from-green-700 transition duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Teams</h3>
              </div>
              <p className="text-green-100 text-sm mb-4">
                Form teams with complementary skills and build team synergy over time.
              </p>
              <Link href="/teams" className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                Manage Teams
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-5 hover:shadow-lg hover:from-purple-700 transition duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Tournaments</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Compete in tournaments with entry fees and prizes for the victors.
              </p>
              <Link href="/tournaments" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                View Tournaments
              </Link>
            </div>
          </div>
          
          {/* Upcoming Tournaments */}
          <h2 className="text-xl font-bold mb-4">Upcoming Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
              <div className="bg-blue-900 p-3">
                <div className="text-sm text-blue-300">Starting in 2 days</div>
                <div className="text-xl font-bold">Spring Championship</div>
              </div>
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="font-medium">0.5 SOL</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="font-medium text-yellow-500">5 SOL</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Teams</span>
                  <span className="font-medium">8/16</span>
                </div>
                <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium">
                  Register Team
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
              <div className="bg-purple-900 p-3">
                <div className="text-sm text-purple-300">Starting in 5 days</div>
                <div className="text-xl font-bold">Pro Division Cup</div>
              </div>
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="font-medium">1 SOL</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="font-medium text-yellow-500">10 SOL</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Teams</span>
                  <span className="font-medium">4/8</span>
                </div>
                <button className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-medium">
                  Register Team
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
              <div className="bg-green-900 p-3">
                <div className="text-sm text-green-300">Starting in 7 days</div>
                <div className="text-xl font-bold">Rookie Tournament</div>
              </div>
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="font-medium">0.2 SOL</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="font-medium text-yellow-500">2 SOL</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Teams</span>
                  <span className="font-medium">12/16</span>
                </div>
                <button className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium">
                  Register Team
                </button>
              </div>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-center font-semibold mb-2">Create Players</h3>
                <p className="text-center text-sm text-gray-400">
                  Mint athlete NFTs with unique stats and abilities
                </p>
              </div>
              
              <div>
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-center font-semibold mb-2">Form Teams</h3>
                <p className="text-center text-sm text-gray-400">
                  Combine players into balanced, synergistic teams
                </p>
              </div>
              
              <div>
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-center font-semibold mb-2">Join Tournaments</h3>
                <p className="text-center text-sm text-gray-400">
                  Enter your team into competitive tournaments
                </p>
              </div>
              
              <div>
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-900 flex items-center justify-center text-xl font-bold">
                    4
                  </div>
                </div>
                <h3 className="text-center font-semibold mb-2">Win Rewards</h3>
                <p className="text-center text-sm text-gray-400">
                  Earn prizes and improve your team's reputation
                </p>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Start Your Esports Dynasty?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Connect your wallet and begin building your dream team today!
            </p>
            {!publicKey ? (
              <div className="inline-block">
                <WalletMultiButton className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg text-lg" />
              </div>
            ) : (
              <Link href="/create-player" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg text-lg">
                Create Your First Player
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}