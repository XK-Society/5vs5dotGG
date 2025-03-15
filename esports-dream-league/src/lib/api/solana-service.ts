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
export async function signAndSendTransaction(instruction: TransactionInstruction) {
  try {
    const wallet = getWallet();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const connection = getConnection();
    
    // Create a transaction
    const transaction = new Transaction();
    
    // Add compute budget instruction (manually created for compatibility)
    const computeBudgetProgramId = new PublicKey('ComputeBudget111111111111111111111111111111');
    const unitLimitData = Buffer.from([0, ...new Uint8Array(new Uint32Array([200000]).buffer)]);
    const computeBudgetInstruction = new TransactionInstruction({
      keys: [],
      programId: computeBudgetProgramId,
      data: unitLimitData,
    });
    
    transaction.add(computeBudgetInstruction);
    
    // Add the main instruction
    transaction.add(instruction);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    const status = await connection.confirmTransaction(signature, 'confirmed');
    
    return { signature, status };
  } catch (error) {
    console.error('Transaction error:', error);
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

// src/lib/api/solana-service.ts - update findPlayerPda
export async function findPlayerPda(mintPublicKey: string) {
  try {
    // Make sure mintPublicKey is a valid base58 public key
    let mintPubkey;
    
    try {
      mintPubkey = new PublicKey(mintPublicKey);
    } catch (error) {
      console.error('Invalid mint address:', mintPublicKey);
      
      // For development/testing, create a deterministic key based on the string
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(mintPublicKey)
      );
      
      // Convert to a valid Solana public key (32 bytes)
      mintPubkey = new PublicKey(new Uint8Array(hash).slice(0, 32));
    }
    
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