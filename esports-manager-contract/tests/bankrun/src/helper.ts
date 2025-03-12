import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js';
import { BanksClient, ProgramTestContext } from 'solana-bankrun';
import * as anchor from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';

// Replace with your program ID or use a dynamic one for testing
export const PROGRAM_ID = new PublicKey('57wMKYdCPiA8tn28t2ucZkxEz9Lvd9eMLDLXf5kJzR1h');

// Token program ID
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// Find a PDA address
export function findPDA(seeds: Buffer[], programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(seeds, programId);
}

// Convert string to buffer
export function strToBuffer(str: string): Buffer {
  return Buffer.from(str);
}

// Fund an account with SOL by sending a transfer transaction
export async function fundAccount(
  context: ProgramTestContext, 
  destination: PublicKey,
  lamports: number | bigint = 10_000_000_000
): Promise<void> {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: context.payer.publicKey,
      toPubkey: destination,
      lamports: BigInt(lamports),
    })
  );
  
  tx.recentBlockhash = context.lastBlockhash;
  tx.feePayer = context.payer.publicKey;
  tx.sign(context.payer);
  
  await context.banksClient.processTransaction(tx);
}

// Load the program for testing
export function loadProgram(programPath: string): { name: string, programId: PublicKey } {
  // Adjust the path based on your project structure
  const defaultProgramPath = path.resolve(__dirname, '../../../target/deploy/esports_manager_contract.so');
  const finalPath = programPath || defaultProgramPath;
  
  // We don't directly load program data here - instead we'll use programId
  // and let solana-bankrun handle loading the program
  
  return {
    name: 'Esport Dream League',
    programId: PROGRAM_ID
  };
}

// Helper to create instruction data with discriminator
export function createInstructionData(discriminator: number, ...args: any[]): Buffer {
  // For real implementation, use proper Anchor serialization
  // This is a simplified version
  const discriminatorBuffer = Buffer.alloc(8);
  discriminatorBuffer.writeUInt8(discriminator, 0);
  
  const serializedArgs = args.map(arg => {
    if (typeof arg === 'string') {
      const strBuffer = Buffer.from(arg);
      const lenBuffer = Buffer.alloc(4);
      lenBuffer.writeUInt32LE(strBuffer.length, 0);
      return Buffer.concat([lenBuffer, strBuffer]);
    } else if (arg instanceof Buffer) {
      const lenBuffer = Buffer.alloc(4);
      lenBuffer.writeUInt32LE(arg.length, 0);
      return Buffer.concat([lenBuffer, arg]);
    } else if (typeof arg === 'number') {
      const numBuffer = Buffer.alloc(8);
      if (Number.isInteger(arg)) {
        numBuffer.writeBigUInt64LE(BigInt(arg), 0);
      } else {
        numBuffer.writeDoubleLE(arg, 0);
      }
      return numBuffer;
    } else if (typeof arg === 'boolean') {
      return Buffer.from([arg ? 1 : 0]);
    } else if (arg instanceof PublicKey) {
      return arg.toBuffer();
    } else if (Array.isArray(arg)) {
      // Handle array serialization (e.g., for Vec<u8>)
      const elementsBuffer = Buffer.concat(arg.map(el => {
        if (typeof el === 'number') {
          const numBuf = Buffer.alloc(1);
          numBuf.writeUInt8(el, 0);
          return numBuf;
        }
        return Buffer.from([0]); // Default
      }));
      const lenBuffer = Buffer.alloc(4);
      lenBuffer.writeUInt32LE(arg.length, 0);
      return Buffer.concat([lenBuffer, elementsBuffer]);
    }
    
    // Default empty buffer for unsupported types
    return Buffer.alloc(0);
  });
  
  return Buffer.concat([discriminatorBuffer, ...serializedArgs]);
}

// Generate the correct Anchor discriminator for an instruction
export function getAnchorDiscriminator(name: string): Buffer {
  return Buffer.from(anchor.utils.sha256.hash(`instruction:${name}`).slice(0, 8));
}

// Common accounts needed for most instructions
export function getCommonAccounts() {
  return {
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    rent: SYSVAR_RENT_PUBKEY
  };
}