'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  MintLayout,
  createInitializeMintInstruction 
} from '@solana/spl-token';
import { usePlayerOperations } from '@/hooks/usePlayerOperations';
import Link from 'next/link';

// Define interfaces for TypeScript
interface RarityPreview {
  mechanical: number;
  gameKnowledge: number;
  teamCommunication: number;
  adaptability: number;
  consistency: number;
  rarity: string;
}

interface RarityColorMap {
  [key: string]: string;
  Common: string;
  Uncommon: string;
  Rare: string;
  Epic: string;
  Legendary: string;
}

export default function CreatePlayer() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { initializePlayer, isLoading } = usePlayerOperations();
  
  const [playerName, setPlayerName] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [uri, setUri] = useState<string>('');
  const [createdPlayer, setCreatedPlayer] = useState<PublicKey | null>(null);
  const [mintKeypair, setMintKeypair] = useState<Keypair | null>(null);
  const [step, setStep] = useState<number>(1);
  
  // Rarity preview state (random values that would be determined during creation)
  const [rarityPreview, setRarityPreview] = useState<RarityPreview>({
    mechanical: Math.floor(Math.random() * 61) + 40, // 40-100 range
    gameKnowledge: Math.floor(Math.random() * 61) + 40,
    teamCommunication: Math.floor(Math.random() * 61) + 40,
    adaptability: Math.floor(Math.random() * 61) + 40,
    consistency: Math.floor(Math.random() * 61) + 40,
    rarity: Math.random() > 0.8 ? 'Epic' : Math.random() > 0.5 ? 'Rare' : 'Common'
  });

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
      // First, create the mint account
      console.log("Creating mint account...");
      const mintTransaction = new Transaction().add(
        // Create mint account instruction
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MintLayout.span,
          lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
          programId: TOKEN_PROGRAM_ID,
        }),
        // Initialize mint instruction
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          0, // Decimals for NFT is 0
          publicKey, // Mint authority
          publicKey, // Freeze authority
          TOKEN_PROGRAM_ID
        )
      );
      
      // Sign and send the transaction
      mintTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      mintTransaction.feePayer = publicKey;
      
      // Need to sign with both wallet and the mint keypair
      mintTransaction.partialSign(mintKeypair);
      
      const mintSignature = await sendTransaction(mintTransaction, connection, {
        signers: [mintKeypair]
      });
      
      console.log("Mint transaction sent:", mintSignature);
      await connection.confirmTransaction(mintSignature, 'confirmed');
      
      console.log("Mint created successfully!");
      
      // Now initialize the player
      const playerPDA = await initializePlayer(
        mintKeypair.publicKey,
        playerName,
        position,
        uri || '/images/placeholder-player.png'
      );
      
      if (playerPDA) {
        setCreatedPlayer(playerPDA);
        setStep(3);
      }
    } catch (error) {
      console.error("Error creating player:", error);
    }
  };

  const rarityColor: RarityColorMap = {
    Common: 'bg-gray-600',
    Uncommon: 'bg-green-600',
    Rare: 'bg-blue-600',
    Epic: 'bg-purple-600',
    Legendary: 'bg-yellow-500'
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
              <Link href="/players" className="text-blue-400 font-semibold">Players</Link>
              <Link href="/teams" className="text-gray-400 hover:text-blue-400">Teams</Link>
              <Link href="/tournaments" className="text-gray-400 hover:text-blue-400">Tournaments</Link>
            </nav>
            <div>
              <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 text-sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Create New Player</h1>
        </div>

        {/* Progress steps */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step >= 1 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                1
              </div>
              <span className="text-sm mt-1">Generate Mint</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step >= 2 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                2
              </div>
              <span className="text-sm mt-1">Player Details</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-400' : 'text-gray-600'}`}>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step >= 3 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                3
              </div>
              <span className="text-sm mt-1">Completion</span>
            </div>
          </div>
        </div>
          
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            {!publicKey ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎮</div>
                <p className="mb-6 text-xl">Please connect your wallet to create a player</p>
                <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg" />
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="text-center py-10">
                    <div className="mb-6">
                      <div className="inline-block p-4 rounded-full bg-blue-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold mb-2">Generate Player NFT</h2>
                      <p className="mb-6 text-gray-400 max-w-lg mx-auto">
                        First, we'll generate a new keypair that will represent your player's NFT mint.
                        We'll create the mint account on the blockchain.
                      </p>
                    </div>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
                      onClick={generateMint}
                    >
                      Generate NFT Mint
                    </button>
                  </div>
                )}
                
                {step === 2 && mintKeypair && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Enter Player Details</h2>
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 mb-6">
                      <p className="text-sm text-gray-300 font-mono">
                        Mint Address: {mintKeypair.publicKey.toString()}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div>
                            <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="playerName">
                              Player Name
                            </label>
                            <input
                              className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              id="playerName"
                              type="text"
                              placeholder="Enter player name"
                              value={playerName}
                              onChange={(e) => setPlayerName(e.target.value)}
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="position">
                              Position
                            </label>
                            <select
                              className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <label className="block text-blue-300 text-sm font-semibold mb-2" htmlFor="uri">
                              NFT URI (optional)
                            </label>
                            <input
                              className="bg-gray-700 text-white w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              id="uri"
                              type="text"
                              placeholder="Arweave or IPFS URI for NFT metadata"
                              value={uri}
                              onChange={(e) => setUri(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-1">
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
                              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Creating...
                                </span>
                              ) : (
                                'Create Player'
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                      
                      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Player Preview</h3>
                          <span className={`text-xs font-medium px-3 py-1 rounded-full ${rarityColor[rarityPreview.rarity]} text-white`}>
                            {rarityPreview.rarity}
                          </span>
                        </div>
                        
                        <div className="mb-4 flex justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-3xl font-bold">{playerName ? playerName.charAt(0) : '?'}</span>
                          </div>
                        </div>
                        
                        <p className="text-center text-xl font-bold mb-1">
                          {playerName || 'Player Name'}
                        </p>
                        <p className="text-center text-gray-400 mb-4">
                          {position || 'Position'}
                        </p>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Mechanical</span>
                              <span>{rarityPreview.mechanical}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${rarityPreview.mechanical}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Game Knowledge</span>
                              <span>{rarityPreview.gameKnowledge}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${rarityPreview.gameKnowledge}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Team Communication</span>
                              <span>{rarityPreview.teamCommunication}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-yellow-600 h-2 rounded-full"
                                style={{ width: `${rarityPreview.teamCommunication}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Adaptability</span>
                              <span>{rarityPreview.adaptability}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${rarityPreview.adaptability}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Consistency</span>
                              <span>{rarityPreview.consistency}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${rarityPreview.consistency}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 3 && createdPlayer && (
                  <div className="text-center py-10">
                    <div className="mb-6">
                      <div className="inline-block p-4 rounded-full bg-green-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold mb-2">Player Created Successfully!</h2>
                      <div className="bg-green-900 bg-opacity-30 border border-green-800 text-green-300 px-4 py-3 rounded-lg mb-4 inline-block">
                        <p className="font-mono text-sm break-all">{createdPlayer.toString()}</p>
                      </div>
                      <p className="text-gray-400 mb-6">
                        Your player has been created and is ready to be added to a team!
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link 
                        href="/teams"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
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
                          setRarityPreview({
                            mechanical: Math.floor(Math.random() * 61) + 40,
                            gameKnowledge: Math.floor(Math.random() * 61) + 40,
                            teamCommunication: Math.floor(Math.random() * 61) + 40,
                            adaptability: Math.floor(Math.random() * 61) + 40,
                            consistency: Math.floor(Math.random() * 61) + 40,
                            rarity: Math.random() > 0.8 ? 'Epic' : Math.random() > 0.5 ? 'Rare' : 'Common'
                          });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
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
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}