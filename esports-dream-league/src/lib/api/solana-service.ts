// src/lib/api/solana-service.ts
import { createSolanaRpc, pipe, address } from '@solana/kit';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { AccountFlags, EsportsManagerInstruction } from './idl-client';

// Program ID of the deployed contract
export const PROGRAM_ID = '2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ';

// RPC endpoint for Solana devnet
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

// Create RPC client
export const getRpc = () => createSolanaRpc(DEVNET_ENDPOINT);

// Create Connection (used for some operations)
export const getConnection = () => new Connection(DEVNET_ENDPOINT);

// Get the Wallet adapter
export const getWallet = () => {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).backpack || 
    (window as any).phantom?.solana || 
    (window as any).solflare || 
    (window as any).solana
  );
};

// Sign and send transaction
// src/lib/api/solana-service.ts (partial update for the signAndSendTransaction function)

// Sign and send transaction
export async function signAndSendTransaction(instruction: TransactionInstruction) {
  try {
    const wallet = getWallet();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Add wallet state check and reconnection attempt
    if (wallet.disconnected || (wallet.connected === false)) {
      console.log('Wallet disconnected, attempting to reconnect...');
      try {
        if (wallet.connect) {
          await wallet.connect();
        }
      } catch (connErr) {
        console.error('Failed to reconnect wallet:', connErr);
        throw new Error('Wallet disconnected. Please reconnect manually.');
      }
    }
    
    const connection = getConnection();
    
    // Create a transaction
    const transaction = new Transaction();
    
    // Add compute budget instruction (manually created for compatibility)
    const computeBudgetProgramId = new PublicKey('ComputeBudget111111111111111111111111111111');
    const unitLimitData = Buffer.from([0, ...new Uint8Array(new Uint32Array([300000]).buffer)]);
    const computeBudgetInstruction = new TransactionInstruction({
      keys: [],
      programId: computeBudgetProgramId,
      data: unitLimitData,
    });
    
    transaction.add(computeBudgetInstruction);
    
    // Add the main instruction
    transaction.add(instruction);
    
    // Get FRESH recent blockhash
    console.log('Getting fresh blockhash...');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({
      commitment: 'finalized'
    });
    console.log('Using blockhash:', blockhash, 'valid until height:', lastValidBlockHeight);
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign transaction
    console.log('Requesting wallet to sign transaction...');
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send transaction immediately with proper options for Devnet
    console.log('Sending signed transaction to Devnet...');
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,  // Run preflight checks
      preflightCommitment: 'confirmed',  // Use confirmed commitment for preflight
      maxRetries: 5  // Increase retries for Devnet
    });
    
    console.log('Transaction sent with signature:', signature);
    
    // Confirm transaction with appropriate parameters for Devnet
    const confirmationStrategy = {
      signature,
      blockhash,
      lastValidBlockHeight
    };
    
    // Use a longer timeout for Devnet confirmations (30 seconds)
    const timeoutId = setTimeout(() => {
      console.warn('Transaction confirmation taking longer than expected...');
    }, 15000);
    
    try {
      const status = await connection.confirmTransaction(confirmationStrategy, 'confirmed');
      clearTimeout(timeoutId);
      return { signature, status };
    } catch (confirmError) {
      clearTimeout(timeoutId);
      console.error('Transaction confirmation error:', confirmError);
      // Check if the transaction is still valid despite confirmation timeout
      try {
        const response = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
        if (response?.value?.confirmationStatus) {
          return { signature, status: { context: { slot: 0 }, value: response.value } };
        }
      } catch (statusError) {
        console.error('Failed to get signature status:', statusError);
      }
      throw confirmError;
    }
  } catch (error) {
    console.error('Transaction error:', error);
    
    // Improve error classification
    if (
      typeof error === 'object' && 
      error !== null && 
      'message' in error && 
      typeof (error as any).message === 'string'
    ) {
      const errorMsg = (error as any).message;
      if (errorMsg.includes('Plugin Closed') || errorMsg.includes('wallet disconnected')) {
        throw new Error('Wallet connection lost. Please reconnect your wallet and try again.');
      } else if (errorMsg.includes('Blockhash not found')) {
        throw new Error('Transaction timed out. Please try again.');
      } else if (errorMsg.includes('invalid instruction data')) {
        console.error('Invalid instruction data error. Program may not understand the transaction format.');
        throw new Error('Invalid transaction format. This may indicate a program version mismatch.');
      }
    }
    
    throw error;
  }
}

// Find a PDA (Program Derived Address)
export async function findProgramAddress(seeds: (Buffer | Uint8Array)[], programId: string) {
  const programPubkey = new PublicKey(programId);
  
  const [pda, bump] = await PublicKey.findProgramAddress(
    seeds,
    programPubkey
  );
  
  return { pda: pda.toString(), bump };
}

// Find Team PDA address
export async function findTeamPda(owner: string, teamName: string) {
  const ownerPubkey = new PublicKey(owner);
  
  return findProgramAddress(
    [
      Buffer.from('team'),
      ownerPubkey.toBuffer(),
      Buffer.from(teamName)
    ],
    PROGRAM_ID
  );
}

// Updated findPlayerPda function with improved mock data handling
export async function findPlayerPda(mintPublicKey: string) {
  try {
    // Check if we're using mock data
    const isMockData = !mintPublicKey.includes('/') && 
                       (mintPublicKey.startsWith('player') || mintPublicKey.length < 32);
    
    let mintPubkey;
    
    if (isMockData) {
      // Generate consistent PDAs for mock data
      const mockSeed = new TextEncoder().encode(`mock-${mintPublicKey}`);
      const hash = await crypto.subtle.digest('SHA-256', mockSeed);
      mintPubkey = new PublicKey(new Uint8Array(hash).slice(0, 32));
      console.log(`Using mock key for ${mintPublicKey}: ${mintPubkey.toString()}`);
    } else {
      try {
        mintPubkey = new PublicKey(mintPublicKey);
      } catch (error) {
        console.error('Invalid mint address format:', mintPublicKey);
        throw error;
      }
    }
    
    // We need to use the correct seed structure based on the IDL
    // The seeds for PlayerAccount are ['player', mint]
    return findProgramAddress(
      [
        Buffer.from('player'),
        mintPubkey.toBuffer()
      ],
      PROGRAM_ID
    );
  } catch (error) {
    console.error('Error finding player PDA:', error);
    throw error;
  }
}