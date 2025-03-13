const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID, MINT_SIZE, createInitializeMintInstruction, getMinimumBalanceForRentExemptMint } = require('@solana/spl-token');
const crypto = require('crypto');

// Program ID from your project
const PROGRAM_ID = new PublicKey('2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ');

// Helper function to create a proper Anchor discriminator
function createDiscriminator(name) {
  const data = `global:${name}`;
  const hash = crypto.createHash('sha256').update(data).digest();
  return Buffer.from(hash.slice(0, 8));
}

// Helper function to serialize a string in Borsh format
function serializeString(str) {
  const strBuffer = Buffer.from(str);
  const lenBuffer = Buffer.alloc(4);
  lenBuffer.writeUInt32LE(strBuffer.length, 0);
  return Buffer.concat([lenBuffer, strBuffer]);
}

// Helper function to serialize a vector of bytes
function serializeVector(data) {
  const lenBuffer = Buffer.alloc(4);
  lenBuffer.writeUInt32LE(data.length, 0);
  return Buffer.concat([lenBuffer, Buffer.from(data)]);
}

// Helper function to serialize boolean
function serializeBoolean(value) {
  return Buffer.from([value ? 1 : 0]);
}

// Helper function to serialize u8
function serializeU8(value) {
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value, 0);
  return buffer;
}

// Helper function to serialize u32
function serializeU32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);
  return buffer;
}

// Helper function to serialize i8
function serializeI8(value) {
  const buffer = Buffer.alloc(1);
  buffer.writeInt8(value, 0);
  return buffer;
}

// Helper to find player PDA
function findPlayerPDA(mintPublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('player'), mintPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

// Helper to find team PDA
function findTeamPDA(ownerPublicKey, teamName) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('team'), ownerPublicKey.toBuffer(), Buffer.from(teamName)],
    PROGRAM_ID
  );
}

// Helper to find creator PDA
function findCreatorPDA(authorityPublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('creator'), authorityPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

// Main test function
async function runTests() {
  // Connect to the local test validator
  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  // Create a new keypair for the payer
  const payer = Keypair.generate();
  
  // Airdrop SOL to the payer
  console.log('Requesting airdrop for payer...');
  const airdropSignature = await connection.requestAirdrop(payer.publicKey, 1000000000);
  await connection.confirmTransaction(airdropSignature);
  
  // Test 1: Initialize Player
  console.log('\n=== Test 1: Initialize Player ===');
  const playerMint = await initializePlayerTest(connection, payer);
  
  // Test 2: Update Player Performance
  if (playerMint) {
    console.log('\n=== Test 2: Update Player Performance ===');
    await updatePlayerPerformanceTest(connection, payer, playerMint);
  }
  
  // Test 3: Create Team
  console.log('\n=== Test 3: Create Team ===');
  const teamName = await createTeamTest(connection, payer);
  
  // Test 4: Add Player to Team
  if (playerMint && teamName) {
    console.log('\n=== Test 4: Add Player to Team ===');
    await addPlayerToTeamTest(connection, payer, playerMint, teamName);
  }
  
  // Test 5: Register Creator
  console.log('\n=== Test 5: Register Creator ===');
  await registerCreatorTest(connection, payer);
}

// Test 1: Initialize player
async function initializePlayerTest(connection, payer) {
  try {
    // Create a mint keypair
    const mintKeypair = Keypair.generate();
    
    // Initialize the mint
    console.log('Initializing mint account...');
    
    // Get minimum balance for rent exemption
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    
    // Create the mint account
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize the mint
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        0,
        payer.publicKey,
        payer.publicKey,
        TOKEN_PROGRAM_ID
      )
    );
    
    await sendAndConfirmTransaction(
      connection,
      createAccountTransaction,
      [payer, mintKeypair]
    );
    console.log('Mint initialized successfully:', mintKeypair.publicKey.toString());
    
    // Find player PDA
    const [playerPDA] = findPlayerPDA(mintKeypair.publicKey);
    console.log('Player PDA:', playerPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('initialize_player');
    const nameData = serializeString("ProGamer123");
    const positionData = serializeString("Mid Laner");
    const gameSpecificData = serializeVector([]);
    const uriData = serializeString("https://arweave.net/sample");
    
    const instructionData = Buffer.concat([
      discriminator,
      nameData,
      positionData,
      gameSpecificData,
      uriData
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Initializing player...');
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Player initialized! Signature:', txSignature);
    
    // Verify player account was created
    const playerAccount = await connection.getAccountInfo(playerPDA);
    if (playerAccount) {
      console.log('Player account exists with data size:', playerAccount.data.length);
      return mintKeypair.publicKey;
    } else {
      console.log('Player account not found');
      return null;
    }
  } catch (error) {
    console.error('Initialize player test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return null;
  }
}

// Test 2: Update Player Performance
async function updatePlayerPerformanceTest(connection, payer, mintPublicKey) {
  try {
    // Find player PDA
    const [playerPDA] = findPlayerPDA(mintPublicKey);
    console.log('Updating player performance for:', playerPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('update_player_performance');
    const matchId = serializeString("match_12345");
    const win = serializeBoolean(true);
    const mvp = serializeBoolean(false);
    const expGained = serializeU32(100);
    const mechanicalChange = serializeI8(2);
    const gameKnowledgeChange = serializeI8(1);
    const teamCommunicationChange = serializeI8(0);
    const adaptabilityChange = serializeI8(1);
    const consistencyChange = serializeI8(-1);
    const formChange = serializeI8(5);
    const matchStats = serializeVector([1, 2, 3, 4]);
    
    const instructionData = Buffer.concat([
      discriminator,
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
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: playerPDA, isSigner: false, isWritable: true }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Sending transaction...');
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Player performance updated! Signature:', txSignature);
    
    return true;
  } catch (error) {
    console.error('Update player performance test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Test 3: Create Team
async function createTeamTest(connection, payer) {
  try {
    const teamName = "Dream Team";
    
    // Find team PDA
    const [teamPDA] = findTeamPDA(payer.publicKey, teamName);
    console.log('Team PDA:', teamPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('create_team');
    const nameData = serializeString(teamName);
    const logoUriData = serializeString("https://arweave.net/team-logo");
    
    const instructionData = Buffer.concat([
      discriminator,
      nameData,
      logoUriData
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: teamPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Creating team...');
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Team created! Signature:', txSignature);
    
    // Verify team account was created
    const teamAccount = await connection.getAccountInfo(teamPDA);
    if (teamAccount) {
      console.log('Team account exists with data size:', teamAccount.data.length);
      return teamName;
    } else {
      console.log('Team account not found');
      return null;
    }
  } catch (error) {
    console.error('Create team test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return null;
  }
}

// Test 4: Add Player to Team
async function addPlayerToTeamTest(connection, payer, mintPublicKey, teamName) {
  try {
    // Find team PDA
    const [teamPDA] = findTeamPDA(payer.publicKey, teamName);
    
    // Find player PDA
    const [playerPDA] = findPlayerPDA(mintPublicKey);
    
    console.log('Adding player to team...');
    console.log('- Team PDA:', teamPDA.toString());
    console.log('- Player Mint:', mintPublicKey.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('add_player_to_team');
    const playerMintData = Buffer.from(mintPublicKey.toBuffer());
    const positionData = serializeString("Mid Laner");
    
    const instructionData = Buffer.concat([
      discriminator,
      playerMintData,
      positionData
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: teamPDA, isSigner: false, isWritable: true },
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: mintPublicKey, isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Sending transaction...');
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Player added to team! Signature:', txSignature);
    
    return true;
  } catch (error) {
    console.error('Add player to team test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Test 5: Register Creator
async function registerCreatorTest(connection, payer) {
  try {
    // Find creator PDA
    const [creatorPDA] = findCreatorPDA(payer.publicKey);
    console.log('Creator PDA:', creatorPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('register_creator');
    const nameData = serializeString("EliteCreator");
    const feeBasisPoints = Buffer.alloc(2);
    feeBasisPoints.writeUInt16LE(500, 0); // 5% fee (500 basis points)
    
    const instructionData = Buffer.concat([
      discriminator,
      nameData,
      feeBasisPoints
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: creatorPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Registering creator...');
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Creator registered! Signature:', txSignature);
    
    // Verify creator account was created
    const creatorAccount = await connection.getAccountInfo(creatorPDA);
    if (creatorAccount) {
      console.log('Creator account exists with data size:', creatorAccount.data.length);
      return true;
    } else {
      console.log('Creator account not found');
      return false;
    }
  } catch (error) {
    console.error('Register creator test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Run all tests
runTests().catch(err => {
  console.error("Tests failed with error:", err);
});