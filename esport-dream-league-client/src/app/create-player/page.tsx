'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { usePlayerOperations } from '@/hooks/usePlayerOperations';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function CreatePlayer() {
  const { publicKey } = useWallet();
  const { initializePlayer, isLoading } = usePlayerOperations();
  
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('');
  const [uri, setUri] = useState('');
  const [createdPlayer, setCreatedPlayer] = useState<PublicKey | null>(null);
  const [mintKeypair, setMintKeypair] = useState<Keypair | null>(null);
  const [step, setStep] = useState(1);

  // Generate a new mint keypair for the player NFT
  const generateMint = () => {
    const newMint = Keypair.generate();
    setMintKeypair(newMint);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !mintKeypair) {
      return;
    }
    
    try {
      // In a real app, you would create the NFT first and then initialize the player
      // For this example, we're just generating a keypair to simulate the mint
      const playerPDA = await initializePlayer(
        mintKeypair.publicKey,
        playerName,
        position,
        uri || 'https://arweave.net/placeholder-uri'
      );
      
      if (playerPDA) {
        setCreatedPlayer(playerPDA);
        setStep(3);
        toast.success("Player created successfully!");
      }
    } catch (error) {
      console.error("Error creating player:", error);
      toast.error("Failed to create player. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 px-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New Player</h1>
          <WalletConnectButton />
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Progress steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="text-sm mt-1">Generate Mint</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="text-sm mt-1">Player Details</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
                <span className="text-sm mt-1">Completion</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            {!publicKey ? (
              <div className="text-center py-10">
                <p className="mb-4">Please connect your wallet to create a player</p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="text-center py-8">
                    <h2 className="text-xl font-semibold mb-4">Generate Player NFT</h2>
                    <p className="mb-6 text-gray-600">
                      First, we'll generate a new keypair that will represent your player's NFT mint.
                      In a full implementation, this would mint an actual NFT token.
                    </p>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                      onClick={generateMint}
                    >
                      Generate NFT Mint
                    </button>
                  </div>
                )}
                
                {step === 2 && mintKeypair && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Enter Player Details</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Mint Address: {mintKeypair.publicKey.toString()}
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="playerName">
                          Player Name
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="playerName"
                          type="text"
                          placeholder="Enter player name"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                          Position
                        </label>
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="position"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          required
                        >
                          <option value="">Select position</option>
                          <option value="Mid Laner">Mid Laner</option>
                          <option value="Top Laner">Top Laner</option>
                          <option value="Jungler">Jungler</option>
                          <option value="AD Carry">AD Carry</option>
                          <option value="Support">Support</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="uri">
                          NFT URI (optional)
                        </label>
                        <input
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="uri"
                          type="text"
                          placeholder="Arweave or IPFS URI for NFT metadata"
                          value={uri}
                          onChange={(e) => setUri(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          If left blank, a placeholder URI will be used
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setMintKeypair(null);
                            setStep(1);
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Creating...' : 'Create Player'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {step === 3 && createdPlayer && (
                  <div className="text-center py-8">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                      <p className="font-bold">Player Created Successfully!</p>
                      <p className="text-sm">Player Account: {createdPlayer.toString()}</p>
                    </div>
                    
                    <p className="mb-6">
                      Your player has been created and is ready to be added to a team!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link 
                        href="/teams"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                      >
                        Go to Teams
                      </Link>
                      <button
                        onClick={() => {
                          setMintKeypair(null);
                          setPlayerName('');
                          setPosition('');
                          setUri('');
                          setCreatedPlayer(null);
                          setStep(1);
                        }}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
                      >
                        Create Another Player
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}