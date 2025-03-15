import { signAndSendTransaction, findPlayerPda, getWallet } from './solana-service';
import { createUpdatePlayerPerformanceInstruction } from './idl-client';
import { SimulatedMatchResult } from '../simulation/engine';

// src/lib/api/match-service.ts - inside recordMatchResultOnChain function
export async function recordMatchResultOnChain(matchResult: SimulatedMatchResult) {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    
    // Get all players with their performance changes
    const allPerformances = [
      ...matchResult.playerPerformances.teamA,
      ...matchResult.playerPerformances.teamB
    ];
    
    console.log('Processing player performances:', allPerformances);
    
    const transactionPromises = allPerformances.map(async (playerPerf) => {
      // Make sure we have a valid mint 
      if (!playerPerf.playerMint) {
        console.error('Missing playerMint for a performance entry');
        throw new Error('Invalid player mint');
      }
      
      console.log('Processing player with mint:', playerPerf.playerMint);
      
      // Get player PDA
      const { pda: playerPda } = await findPlayerPda(playerPerf.playerMint);
      
      console.log('Found player PDA:', playerPda);
      
      // Determine win/loss status based on team
      const teamAPlayer = matchResult.playerPerformances.teamA.some(
        p => p.playerMint === playerPerf.playerMint
      );
      const isWinner = teamAPlayer 
        ? matchResult.winnerIndex === 0 
        : matchResult.winnerIndex === 1;
      
      // Create match stats (simple for now)
      const matchStats = new Uint8Array([
        matchResult.score[0], 
        matchResult.score[1]
      ]);
      
      // Create instruction to update player performance
      const instruction = createUpdatePlayerPerformanceInstruction(
        walletAddress,
        playerPda,
        matchResult.matchId,
        isWinner,
        playerPerf.isMVP,
        playerPerf.expGained,
        playerPerf.mechanicalChange,
        playerPerf.gameKnowledgeChange,
        playerPerf.teamCommunicationChange,
        playerPerf.adaptabilityChange,
        playerPerf.consistencyChange,
        playerPerf.formChange,
        matchStats
      );
      
      // Sign and send transaction
      return signAndSendTransaction(instruction);
    });
    
    // Execute all transactions
    const results = await Promise.all(transactionPromises);
    return {
      success: true,
      transactions: results.map(r => r.signature)
    };
  } catch (error) {
    console.error('Failed to record match result on chain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get player details from the blockchain (mock implementation for now)
export async function getPlayerDetails(playerMint: string) {
  try {
    // In a real implementation, you would fetch this data from the blockchain
    // For now, we'll return mock data
    return {
      owner: "mockOwner",
      mint: playerMint,
      name: "Player" + playerMint.substring(0, 4),
      position: "Mid Laner",
      mechanical: 75,
      game_knowledge: 80,
      team_communication: 70,
      adaptability: 65,
      consistency: 72,
      form: 85,
      experience: 1200,
      matches_played: 20,
      wins: 14,
      mvp_count: 3
    };
  } catch (error) {
    console.error('Failed to get player details:', error);
    throw error;
  }
}

// Get team details from the blockchain (mock implementation for now)
export async function getTeamDetails(teamAddress: string) {
  try {
    // In a real implementation, you would fetch this data from the blockchain
    // For now, we'll return mock data
    return {
      owner: "mockOwner",
      name: "Team" + teamAddress.substring(0, 4),
      logo_uri: "https://example.com/logo.png",
      roster: [],
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
    };
  } catch (error) {
    console.error('Failed to get team details:', error);
    throw error;
  }
}