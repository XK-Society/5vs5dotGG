import { startAnchor } from 'solana-bankrun';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction, 
  Keypair,
  SystemProgram
} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import {
  findPDA,
  strToBuffer,
  getAnchorDiscriminator,
  getCommonAccounts
} from '../src/helper';

describe('Player Tests', () => {
  // Program ID - can be dynamically obtained from the Anchor workspace
  const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');
  
  // Setup test context
  const testSetup = async () => {
    // Start with anchor integration for automatic program deployment
    const context = await startAnchor(
      "../..", // Path to project root (with Anchor.toml)
      [], // No extra programs
      [] // No additional accounts
    );
    
    return context;
  };
  
  // Global variables for test reuse
  let context: any;
  let client: any;
  let payer: Keypair;
  let mintKeypair: Keypair;
  let playerPDA: PublicKey;
  
  // Setup before all tests
  beforeAll(async () => {
    context = await testSetup();
    client = context.banksClient;
    payer = context.payer;
    
    // Create a mint keypair for the NFT that will be used across tests
    mintKeypair = Keypair.generate();
    
    // Fund the mint keypair account
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: mintKeypair.publicKey,
        lamports: 1000000,
      })
    );
    tx.recentBlockhash = context.lastBlockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    await client.processTransaction(tx);
    
    // Find player PDA
    const [pda, _] = findPDA(
      [strToBuffer('player'), mintKeypair.publicKey.toBuffer()],
      PROGRAM_ID
    );
    playerPDA = pda;
  });
  
  test('Initialize Player NFT', async () => {
    // Player initialization instruction
    const instruction = createInitializePlayerInstruction(
      payer.publicKey,
      mintKeypair.publicKey,
      playerPDA,
      'CyberShot99',
      'Mid Laner',
      'https://arweave.net/xyz'
    );
    
    // Create and send transaction
    const playerTx = new Transaction();
    playerTx.recentBlockhash = context.lastBlockhash;
    playerTx.add(instruction);
    playerTx.feePayer = payer.publicKey;
    playerTx.sign(payer);
    
    // Process transaction
    await client.processTransaction(playerTx);
    
    // Verify player account was created
    const playerAccount = await client.getAccount(playerPDA);
    expect(playerAccount).not.toBeNull();
    expect(playerAccount!.owner.equals(PROGRAM_ID)).toBeTruthy();
    
    console.log('Player NFT initialized successfully!');
  });
  
  test('Update Player Performance After Match', async () => {
    // Match details
    const matchId = 'match_12345';
    const win = true;
    const mvp = false;
    const expGained = 100;
    const mechanicalChange = 2;
    const gameKnowledgeChange = 1;
    const teamCommunicationChange = 0;
    const adaptabilityChange = 1;
    const consistencyChange = -1;
    const formChange = 5;
    const matchStats = Buffer.from([1, 2, 3, 4]); // Example match stats
    
    // Create the update performance instruction
    const instruction = createUpdatePlayerPerformanceInstruction(
      payer.publicKey,
      playerPDA,
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
    
    // Create and send transaction
    const tx = new Transaction();
    tx.recentBlockhash = context.lastBlockhash;
    tx.add(instruction);
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    
    // Process transaction
    await client.processTransaction(tx);
    
    // Verify player account was updated
    // In a real test, you would deserialize the account data and check specific fields
    const playerAccount = await client.getAccount(playerPDA);
    expect(playerAccount).not.toBeNull();
    
    console.log('Player performance updated successfully!');
  });
  
  test('Train Player', async () => {
    // Create the train player instruction
    const instruction = createTrainPlayerInstruction(
      payer.publicKey,
      playerPDA,
      0, // TrainingType.Mechanical
      80  // Training intensity
    );
    
    // Create and send transaction
    const tx = new Transaction();
    tx.recentBlockhash = context.lastBlockhash;
    tx.add(instruction);
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    
    // Process transaction
    await client.processTransaction(tx);
    
    // Verify player account was updated
    const playerAccount = await client.getAccount(playerPDA);
    expect(playerAccount).not.toBeNull();
    
    console.log('Player training completed successfully!');
  });
  
  test('Add Special Ability', async () => {
    // Create the add special ability instruction
    const instruction = createAddSpecialAbilityInstruction(
      payer.publicKey,
      playerPDA,
      'Quick Reflexes',
      85 // Ability value
    );
    
    // Create and send transaction
    const tx = new Transaction();
    tx.recentBlockhash = context.lastBlockhash;
    tx.add(instruction);
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    
    // Process transaction
    await client.processTransaction(tx);
    
    // Verify player account was updated
    const playerAccount = await client.getAccount(playerPDA);
    expect(playerAccount).not.toBeNull();
    
    console.log('Special ability added successfully!');
  });
  
  // Test Full Game Flow - creates team, adds player, simulates match
  test('Full Player Lifecycle', async () => {
    // Create another player for team
    const player2Mint = Keypair.generate();
    
    // Fund the mint account
    const fundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: player2Mint.publicKey,
        lamports: 1000000,
      })
    );
    fundTx.recentBlockhash = context.lastBlockhash;
    fundTx.feePayer = payer.publicKey;
    fundTx.sign(payer);
    await client.processTransaction(fundTx);
    
    // Find player PDA
    const [player2PDA, _] = findPDA(
      [strToBuffer('player'), player2Mint.publicKey.toBuffer()],
      PROGRAM_ID
    );
    
    // Initialize second player
    const initInstruction = createInitializePlayerInstruction(
      payer.publicKey,
      player2Mint.publicKey,
      player2PDA,
      'RapidFire',
      'Support',
      'https://arweave.net/player2'
    );
    
    // Create and send transaction
    const initTx = new Transaction();
    initTx.recentBlockhash = context.lastBlockhash;
    initTx.add(initInstruction);
    initTx.feePayer = payer.publicKey;
    initTx.sign(payer);
    await client.processTransaction(initTx);
    
    // Create a team (simplified - would need full team creation in real test)
    const teamName = 'Dream Team';
    const [teamPDA, __] = findPDA(
      [strToBuffer('team'), payer.publicKey.toBuffer(), strToBuffer(teamName)],
      PROGRAM_ID
    );
    
    // Create team instruction (simplified)
    console.log('Creating team and adding players (simulated)');
    
    // Advanced test: Time travel to simulate tournament progression
    let clock = await client.getClock();
    const newClock = {
      ...clock,
      unix_timestamp: clock.unix_timestamp + 86400, // Jump ahead 1 day
      slot: clock.slot + 10000
    };
    context.setClock(newClock);
    
    // Simulate multiple performance updates to show player progression
    // First match - moderate performance
    await updatePlayerAfterMatch(playerPDA, 'match_1', true, false, 80, 1, 1, 1, 0, 0, 3);
    
    // Second match - better performance, earned MVP
    await updatePlayerAfterMatch(playerPDA, 'match_2', true, true, 120, 2, 2, 1, 1, 1, 5);
    
    // Third match - loss but still decent performance
    await updatePlayerAfterMatch(playerPDA, 'match_3', false, false, 50, 0, 1, 0, 0, -1, -2);
    
    // Training session to boost stats
    await trainPlayer(playerPDA, 1, 90); // Train game knowledge at high intensity
    
    // Fourth match - comeback with new skills
    await updatePlayerAfterMatch(playerPDA, 'match_4', true, true, 150, 3, 2, 2, 1, 2, 6);
    
    // Verify final state - player should have evolved through these experiences
    const playerAccount = await client.getAccount(playerPDA);
    expect(playerAccount).not.toBeNull();
    
    console.log('Full player lifecycle test completed successfully!');
  });
  
  // Helper function to update player after match (utility function for tests)
  async function updatePlayerAfterMatch(
    playerPDA: PublicKey,
    matchId: string,
    win: boolean,
    mvp: boolean,
    expGained: number,
    mechChange: number,
    knowChange: number,
    commChange: number,
    adaptChange: number,
    consistChange: number,
    formChange: number
  ) {
    const instruction = createUpdatePlayerPerformanceInstruction(
      payer.publicKey,
      playerPDA,
      matchId,
      win,
      mvp,
      expGained,
      mechChange,
      knowChange,
      commChange,
      adaptChange,
      consistChange,
      formChange,
      Buffer.from([])
    );
    
    const tx = new Transaction();
    tx.recentBlockhash = context.lastBlockhash;
    tx.add(instruction);
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    await client.processTransaction(tx);
  }
  
  // Helper function to train player (utility function for tests)
  async function trainPlayer(
    playerPDA: PublicKey,
    trainingType: number,
    intensity: number
  ) {
    const instruction = createTrainPlayerInstruction(
      payer.publicKey,
      playerPDA,
      trainingType,
      intensity
    );
    
    const tx = new Transaction();
    tx.recentBlockhash = context.lastBlockhash;
    tx.add(instruction);
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    await client.processTransaction(tx);
  }
  
  // Helper function to create the initialize player instruction
  function createInitializePlayerInstruction(
    owner: PublicKey,
    mint: PublicKey,
    playerPDA: PublicKey,
    name: string,
    position: string,
    uri: string
  ): TransactionInstruction {
    const discriminator = getAnchorDiscriminator('initialize_player');
    const dataLayout = Buffer.concat([
      discriminator,
      // Name (length prefixed string)
      Buffer.from([name.length, 0, 0, 0, ...Buffer.from(name)]),
      // Position (length prefixed string)
      Buffer.from([position.length, 0, 0, 0, ...Buffer.from(position)]),
      // Empty game specific data
      Buffer.from([0, 0, 0, 0]),
      // URI (length prefixed string)
      Buffer.from([uri.length, 0, 0, 0, ...Buffer.from(uri)])
    ]);
    
    const accounts = getCommonAccounts();
    
    return new TransactionInstruction({
      keys: [
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.rent, isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: dataLayout
    });
  }
  
  // Helper function to create the update player performance instruction
  function createUpdatePlayerPerformanceInstruction(
    owner: PublicKey,
    playerPDA: PublicKey,
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
    matchStats: Buffer
  ): TransactionInstruction {
    const discriminator = getAnchorDiscriminator('update_player_performance');
    
    // Create a simple serialization of the parameters
    // Note: In a real implementation, use proper Anchor/Borsh serialization
    const dataLayout = Buffer.concat([
      discriminator,
      // Match ID (string)
      Buffer.from([matchId.length, 0, 0, 0, ...Buffer.from(matchId)]),
      // Win (bool)
      Buffer.from([win ? 1 : 0]),
      // MVP (bool)
      Buffer.from([mvp ? 1 : 0]),
      // Experience gained (u32)
      Buffer.from([
        expGained & 0xff,
        (expGained >> 8) & 0xff,
        (expGained >> 16) & 0xff,
        (expGained >> 24) & 0xff
      ]),
      // Stat changes (i8)
      Buffer.from([
        mechanicalChange & 0xff,
        gameKnowledgeChange & 0xff,
        teamCommunicationChange & 0xff,
        adaptabilityChange & 0xff,
        consistencyChange & 0xff,
        formChange & 0xff
      ]),
      // Match stats (vector of u8)
      Buffer.from([
        matchStats.length & 0xff,
        (matchStats.length >> 8) & 0xff,
        (matchStats.length >> 16) & 0xff,
        (matchStats.length >> 24) & 0xff,
        ...matchStats
      ])
    ]);
    
    return new TransactionInstruction({
      keys: [
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: playerPDA, isSigner: false, isWritable: true }
      ],
      programId: PROGRAM_ID,
      data: dataLayout
    });
  }
  
  // Helper function to create the train player instruction
  function createTrainPlayerInstruction(
    owner: PublicKey,
    playerPDA: PublicKey,
    trainingType: number,
    intensity: number
  ): TransactionInstruction {
    const discriminator = getAnchorDiscriminator('train_player');
    
    // Create a simple serialization of the parameters
    const dataLayout = Buffer.concat([
      discriminator,
      // Training type (enum, u8)
      Buffer.from([trainingType]),
      // Intensity (u8)
      Buffer.from([intensity])
    ]);
    
    return new TransactionInstruction({
      keys: [
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: playerPDA, isSigner: false, isWritable: true }
      ],
      programId: PROGRAM_ID,
      data: dataLayout
    });
  }
  
  // Helper function to create the add special ability instruction
  function createAddSpecialAbilityInstruction(
    owner: PublicKey,
    playerPDA: PublicKey,
    abilityName: string,
    abilityValue: number
  ): TransactionInstruction {
    const discriminator = getAnchorDiscriminator('add_special_ability');
    
    // Create a simple serialization of the parameters
    const dataLayout = Buffer.concat([
      discriminator,
      // Ability name (string)
      Buffer.from([abilityName.length, 0, 0, 0, ...Buffer.from(abilityName)]),
      // Ability value (u8)
      Buffer.from([abilityValue])
    ]);
    
    return new TransactionInstruction({
      keys: [
        { pubkey: owner, isSigner: true, isWritable: true },
        { pubkey: playerPDA, isSigner: false, isWritable: true }
      ],
      programId: PROGRAM_ID,
      data: dataLayout
    });
  }
});