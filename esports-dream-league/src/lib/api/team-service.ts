// src/lib/api/team-service.ts
import { signAndSendTransaction, findTeamPda, findPlayerPda, getWallet } from './solana-service';
import { createTeamInstruction, addPlayerToTeamInstruction, removePlayerFromTeamInstruction } from './idl-client';

// Create a new team on the blockchain
export async function createTeam(teamName: string, logoUri: string) {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    
    // Find the team PDA
    const { pda: teamPda } = await findTeamPda(walletAddress, teamName);
    
    // Create instruction to create a team
    const instruction = createTeamInstruction(
      walletAddress,
      teamPda,
      teamName,
      logoUri
    );
    
    // Sign and send transaction
    const { signature, status } = await signAndSendTransaction(instruction);
    
    return {
      success: true,
      signature,
      status,
      teamPda
    };
  } catch (error) {
    console.error('Failed to create team:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Add a player to a team
export async function addPlayerToTeam(teamPda: string, playerMint: string, position: string) {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    
    // Find the player PDA
    const { pda: playerPda } = await findPlayerPda(playerMint);
    
    // Create instruction to add player to team
    const instruction = addPlayerToTeamInstruction(
      walletAddress,
      teamPda,
      playerPda,
      playerMint,
      position
    );
    
    // Sign and send transaction
    const { signature, status } = await signAndSendTransaction(instruction);
    
    return {
      success: true,
      signature,
      status
    };
  } catch (error) {
    console.error('Failed to add player to team:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Remove a player from a team
export async function removePlayerFromTeam(teamPda: string, playerMint: string) {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    
    // Find the player PDA
    const { pda: playerPda } = await findPlayerPda(playerMint);
    
    // Create instruction to remove player from team
    const instruction = removePlayerFromTeamInstruction(
      walletAddress,
      teamPda,
      playerPda,
      playerMint
    );
    
    // Sign and send transaction
    const { signature, status } = await signAndSendTransaction(instruction);
    
    return {
      success: true,
      signature,
      status
    };
  } catch (error) {
    console.error('Failed to remove player from team:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get all teams owned by the connected wallet (mock implementation for now)
export async function getMyTeams() {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, you would fetch this data from the blockchain
    // For now, we'll return mock data
    return [
      {
        pda: "team1",
        name: "Cyber Knights",
        logo_uri: "https://example.com/logo1.png",
        statistics: {
          matches_played: 30,
          wins: 18,
          losses: 12,
          tournament_wins: 2,
          avg_mechanical: 76,
          avg_game_knowledge: 78,
          avg_team_communication: 74,
          synergy_score: 80
        }
      },
      {
        pda: "team2",
        name: "Digital Dragons",
        logo_uri: "https://example.com/logo2.png",
        statistics: {
          matches_played: 25,
          wins: 15,
          losses: 10,
          tournament_wins: 1,
          avg_mechanical: 74,
          avg_game_knowledge: 75,
          avg_team_communication: 76,
          synergy_score: 77
        }
      }
    ];
  } catch (error) {
    console.error('Failed to get teams:', error);
    throw error;
  }
}