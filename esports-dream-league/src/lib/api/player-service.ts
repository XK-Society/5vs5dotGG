// src/lib/api/player-service.ts
import { signAndSendTransaction, findPlayerPda, getWallet } from './solana-service';
import { createInitializePlayerInstruction } from './idl-client';
import { Rarity } from '@/lib/types/program';

// Initialize a new player NFT
export async function initializePlayer(
  mintAddress: string,
  name: string,
  position: string,
  uri: string
) {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    
    // Find the player PDA
    const { pda: playerPda } = await findPlayerPda(mintAddress);
    
    // Initialize with empty game-specific data
    const gameSpecificData = new Uint8Array();
    
    // Create instruction to initialize a player
    const instruction = createInitializePlayerInstruction(
      walletAddress,
      mintAddress,
      playerPda,
      name,
      position,
      gameSpecificData,
      uri
    );
    
    // Sign and send transaction
    const { signature, status } = await signAndSendTransaction(instruction);
    
    return {
      success: true,
      signature,
      status,
      playerPda
    };
  } catch (error) {
    console.error('Failed to initialize player:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get all players owned by the connected wallet (mock implementation for now)
export async function getMyPlayers() {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, you would fetch this data from the blockchain
    // For now, we'll return mock data
    return [
      {
        mint: "player1",
        name: "CyberKnight1",
        position: "Mid Laner",
        mechanical: 85,
        game_knowledge: 90,
        team_communication: 80,
        adaptability: 75,
        consistency: 82,
        form: 85,
        rarity: Rarity.Epic,
        experience: 5000,
        matches_played: 150,
        wins: 95,
        mvp_count: 12
      },
      {
        mint: "player2",
        name: "CyberKnight2",
        position: "Support",
        mechanical: 75,
        game_knowledge: 88,
        team_communication: 92,
        adaptability: 80,
        consistency: 85,
        form: 82,
        rarity: Rarity.Rare,
        experience: 4800,
        matches_played: 140,
        wins: 90,
        mvp_count: 5
      },
      {
        mint: "player3",
        name: "CyberKnight3",
        position: "Carry",
        mechanical: 92,
        game_knowledge: 85,
        team_communication: 78,
        adaptability: 70,
        consistency: 88,
        form: 90,
        rarity: Rarity.Legendary,
        experience: 5200,
        matches_played: 160,
        wins: 105,
        mvp_count: 20
      }
    ];
  } catch (error) {
    console.error('Failed to get players:', error);
    throw error;
  }
}

// Get player details (mock implementation for now)
export async function getPlayerDetails(playerMint: string) {
  try {
    // In a real implementation, you would fetch this data from the blockchain
    // For now, we'll return mock data based on the playerMint
    const players = await getMyPlayers();
    const player = players.find(p => p.mint === playerMint);
    
    if (!player) {
      throw new Error('Player not found');
    }
    
    return player;
  } catch (error) {
    console.error('Failed to get player details:', error);
    throw error;
  }
}