// src/lib/api/match-service.ts
import { signAndSendTransaction, findPlayerPda, getWallet, getConnection } from './solana-service';
import { createUpdatePlayerPerformanceInstruction } from './idl-client';
import { SimulatedMatchResult } from '../simulation/engine';
import { config } from '../config';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Record a single player's performance on the blockchain
export async function recordSinglePlayerOnChain(
  playerMint: string,
  matchId: string,
  win: boolean,
  mvp: boolean,
  expGained: number,
  mechanicalChange: number,
  gameKnowledgeChange: number,
  teamCommunicationChange: number,
  adaptabilityChange: number,
  consistencyChange: number,
  formChange: number,
  matchStats: Uint8Array
): Promise<{
  success: boolean;
  signature: string;
  error?: string;
}> {
  // Use mock mode only if explicitly configured
  if (config.mockTransactions === true) {
    console.log(`DEV MODE: Recording player ${playerMint} with match ID ${matchId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      signature: `mock-tx-${Date.now()}-${playerMint.substring(0, 8)}`
    };
  }
  
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    console.log(`Updating player ${playerMint} on Devnet with wallet ${walletAddress}`);
    
    // Get player PDA
    const { pda: playerPda } = await findPlayerPda(playerMint);
    console.log(`Using player PDA: ${playerPda}`);
    
    // Log all parameters we're sending to the instruction
    console.log('UpdatePlayerPerformance parameters:', {
      owner: walletAddress,
      playerPda,
      matchId,
      win,
      mvp,
      expGained,
      mechanicalChange,
      gameKnowledgeChange,
      teamCommunicationChange,
      adaptabilityChange,
      consistencyChange, 
      formChange,
      matchStats: Array.from(matchStats)
    });
    
    // Create instruction to update player performance
    const instruction = createUpdatePlayerPerformanceInstruction(
      walletAddress,
      playerPda,
      matchId,
      win,
      mvp,
      expGained,
      mechanicalChange,
      gameKnowledgeChange,
      teamCommunicationChange,
      adaptabilityChange,
      consistencyChange,
      formChange,
      matchStats
    );
    
    // Log instruction details for debugging
    console.log('Instruction details:', {
      programId: instruction.programId.toString(),
      keys: instruction.keys.map(k => ({
        pubkey: k.pubkey.toString(),
        isSigner: k.isSigner,
        isWritable: k.isWritable
      })),
      dataHex: Buffer.from(instruction.data).toString('hex'),
      dataLength: instruction.data.length
    });
    
    // Sign and send transaction
    console.log(`Sending transaction to Devnet...`);
    
    try {
      const result = await signAndSendTransaction(instruction);
      console.log(`Transaction sent with signature: ${result.signature}`);
      
      return {
        success: true,
        signature: result.signature || `tx-${Date.now()}`
      };
    } catch (txError: unknown) {
      let errorMessage = 'Unknown transaction error';
      if (txError instanceof Error) {
        errorMessage = txError.message;
      }
      
      console.error(`Transaction error details:`, txError);
      
      // If it's a simulation error related to instruction data, provide more details
      if (errorMessage.includes('invalid instruction data')) {
        console.error('This likely means the instruction format does not match what the program expects');
        console.error('Check the account setup and instruction data format');
        
        // Try to log more details about the player account
        try {
          const connection = getConnection();
          const playerPdaPublicKey = new PublicKey(playerPda);
          const accountInfo = await connection.getAccountInfo(playerPdaPublicKey);
          console.log('Player account exists:', !!accountInfo);
          if (accountInfo) {
            console.log('Player account data size:', accountInfo.data.length);
          }
        } catch (accError) {
          console.error('Failed to check player account:', accError);
        }
      }
      
      throw new Error(`Transaction failed: ${errorMessage}`);
    }
  } catch (error: unknown) {
    console.error('Failed to record player on chain:', error);
    
    // Properly handle the unknown error type
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    
    return {
      success: false,
      signature: `error-tx-${Date.now()}`,
      error: errorMessage
    };
  }
}

// Record match result on chain with improved error handling
export async function recordMatchResultOnChain(matchResult: SimulatedMatchResult) {
  // Use mock mode only if explicitly configured
  if (config.mockTransactions === true) {
    console.log('DEV MODE: Using mock transactions');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock transaction signatures
    const mockSignatures = Array(matchResult.playerPerformances.teamA.length + 
                               matchResult.playerPerformances.teamB.length)
      .fill(0)
      .map((_, i) => `mock-tx-${Date.now()}-${i}-${matchResult.matchId.substring(0, 8)}`);
    
    return {
      success: true,
      transactions: mockSignatures
    };
  }
  
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    console.log('Using wallet address:', walletAddress);
    
    // Add a wallet connection check
    if (!wallet.isConnected && typeof wallet.isConnected !== 'undefined') {
      console.log('Wallet is not connected, reconnecting...');
      try {
        await wallet.connect();
      } catch (connErr) {
        console.error('Failed to reconnect wallet:', connErr);
        throw new Error('Wallet connection lost, please reconnect manually');
      }
    }
    
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
      
      // Sign and send transaction with retry mechanism
      try {
        return await signAndSendTransaction(instruction);
      } catch (transactionError) {
        console.error('Transaction failed, retrying once:', transactionError);
        // Wait a moment and retry once
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await signAndSendTransaction(instruction);
      }
    });
    
    // Execute all transactions
    const results = await Promise.allSettled(transactionPromises);
    
    // Process results
    const successful = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);
      
    if (successful.length === 0) {
      return {
        success: false,
        error: 'All transactions failed'
      };
    }
    
    return {
      success: true,
      transactions: successful.map(r => r.signature).filter(Boolean) as string[]
    };
  } catch (error: unknown) {
    console.error('Failed to record match result on chain:', error);
    
    // Properly handle the unknown error type
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Test a simple memo transaction to verify basic Solana connectivity
export async function testMemoTransaction(): Promise<{
  success: boolean;
  signature: string;
  error?: string;
}> {
  try {
    const wallet = getWallet();
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const walletAddress = wallet.publicKey.toString();
    console.log(`Testing simple memo transaction with wallet ${walletAddress}`);
    
    // Create a simple memo instruction
    const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from('Test memo from Esports Dream League', 'utf-8')
    });
    
    // Sign and send transaction
    console.log(`Sending test memo transaction...`);
    const result = await signAndSendTransaction(memoInstruction);
    console.log(`Test memo transaction sent with signature: ${result.signature}`);
    
    return {
      success: true,
      signature: result.signature || `tx-${Date.now()}`
    };
  } catch (error: unknown) {
    console.error('Failed to send test memo transaction:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      signature: `error-tx-${Date.now()}`,
      error: errorMessage
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