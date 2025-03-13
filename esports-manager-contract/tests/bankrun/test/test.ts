import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('Direct Solana Test', () => {
  const PROGRAM_ID = new PublicKey('2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ');
  
  test('Test with validator', async () => {
    // Start a local validator (you'll need solana-test-validator installed)
    console.log('Starting local validator...');
    const validatorProcess = execSync('solana-test-validator --reset');
    
    // Wait for validator to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Load the program
    console.log('Loading program...');
    const programPath = path.resolve(__dirname, '../fixtures/esports_manager_contract.so');
    execSync(`solana program deploy ${programPath} --program-id ${PROGRAM_ID.toString()}`);
    
    // Now test with the deployed program
    const connection = new Connection('http://localhost:8899', 'confirmed');
    const payer = Keypair.generate();
    
    // Airdrop some SOL
    await connection.requestAirdrop(payer.publicKey, 1000000000);
    
    // Test your instruction here
    // ...
    
    // Clean up
    execSync('pkill -f solana-test-validator');
  });
});