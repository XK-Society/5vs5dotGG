const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID, MINT_SIZE, createInitializeMintInstruction, getMinimumBalanceForRentExemptMint } = require('@solana/spl-token');
const crypto = require('crypto');

// Program ID from your project
const PROGRAM_ID = new PublicKey('2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ');
const SYSVAR_RENT_PUBKEY = new PublicKey('SysvarRent111111111111111111111111111111111');

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

// Helper function to serialize u16
function serializeU16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value, 0);
  return buffer;
}

// Helper function to serialize u32
function serializeU32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);
  return buffer;
}

// Helper function to serialize u64
function serializeU64(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value), 0);
  return buffer;
}

// Helper function to serialize i8
function serializeI8(value) {
  const buffer = Buffer.alloc(1);
  buffer.writeInt8(value, 0);
  return buffer;
}

// Helper function to serialize i64 (timestamp)
function serializeI64(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64LE(BigInt(value), 0);
  return buffer;
}

// Helper function to serialize enum (like TrainingType)
function serializeEnum(enumType, variantIndex) {
  // Enum with 0 data is serialized as a single byte variant index
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(variantIndex, 0);
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

// Helper to find tournament PDA
function findTournamentPDA(authorityPublicKey, tournamentName) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('tournament'), authorityPublicKey.toBuffer(), Buffer.from(tournamentName)],
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
  const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2000000000);
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
  
  // Test 6: Train Player
  if (playerMint) {
    console.log('\n=== Test 6: Train Player ===');
    await trainPlayerTest(connection, payer, playerMint);
  }
  
  // Test 7: Add Special Ability
  if (playerMint) {
    console.log('\n=== Test 7: Add Special Ability ===');
    await addSpecialAbilityTest(connection, payer, playerMint);
  }
  
  // Test 8: Create Tournament
  console.log('\n=== Test 8: Create Tournament ===');
  const tournamentName = await createTournamentTest(connection, payer);
  
  // Test 9: Register Team for Tournament
  if (teamName && tournamentName) {
    console.log('\n=== Test 9: Register Team for Tournament ===');
    await registerTeamForTournamentTest(connection, payer, teamName, tournamentName);
  }
  
  // Test 10: Remove Player from Team
  if (playerMint && teamName) {
    console.log('\n=== Test 10: Remove Player from Team ===');
    await removePlayerFromTeamTest(connection, payer, playerMint, teamName);
  }
  
  // Create an admin keypair for verification
  console.log('\n=== Creating Admin Keypair ===');
  const adminKeypair = Keypair.generate();
  
  // Fund the admin
  console.log('Requesting airdrop for admin...');
  const adminAirdropSignature = await connection.requestAirdrop(adminKeypair.publicKey, 1000000000);
  console.log('Waiting for admin funding to confirm...');
  await connection.confirmTransaction(adminAirdropSignature, 'confirmed');
  
  // Double-check the admin balance
  const adminBalance = await connection.getBalance(adminKeypair.publicKey);
  console.log(`Admin balance: ${adminBalance} lamports`);
  console.log('Admin keypair funded:', adminKeypair.publicKey.toString());
  
  // Verify Creator (admin only)
  console.log('\n=== Test 11: Verify Creator ===');
  const creatorVerified = await verifyCreatorTest(connection, payer, adminKeypair);
  
  // Test 12: Create Exclusive Athlete
  if (creatorVerified) {
    console.log('\n=== Test 12: Create Exclusive Athlete ===');
    await createExclusiveAthleteTest(connection, payer);
  } else {
    console.log('\n=== Test 12: Create Exclusive Athlete ===');
    console.log('Skipping exclusive athlete test because creator verification failed');
  }
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
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
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
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
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
    const playerMintData = mintPublicKey.toBuffer();
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
    const feeBasisPoints = serializeU16(500); // 5% fee (500 basis points)
    
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
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
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

// Test 6: Train Player
async function trainPlayerTest(connection, payer, mintPublicKey) {
  try {
    // Find player PDA
    const [playerPDA] = findPlayerPDA(mintPublicKey);
    console.log('Training player:', playerPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('train_player');
    // Training Type: Mechanical (variant 0)
    const trainingType = serializeEnum("TrainingType", 0);
    
    // Use a lower intensity to avoid overflow
    const intensity = serializeU8(50); // Medium intensity training
    
    const instructionData = Buffer.concat([
      discriminator,
      trainingType,
      intensity
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
    console.log('Player trained! Signature:', txSignature);
    
    return true;
  } catch (error) {
    console.error('Train player test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Test 7: Add Special Ability
async function addSpecialAbilityTest(connection, payer, mintPublicKey) {
  try {
    // Find player PDA
    const [playerPDA] = findPlayerPDA(mintPublicKey);
    console.log('Adding special ability to player:', playerPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('add_special_ability');
    const abilityName = serializeString("Quick Reflexes");
    const abilityValue = serializeU8(85);
    
    const instructionData = Buffer.concat([
      discriminator,
      abilityName,
      abilityValue
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
    console.log('Special ability added! Signature:', txSignature);
    
    return true;
  } catch (error) {
    console.error('Add special ability test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Test 8: Create Tournament
async function createTournamentTest(connection, payer) {
  try {
    const tournamentName = "Grand Championship";
    
    // Find tournament PDA
    const [tournamentPDA] = findTournamentPDA(payer.publicKey, tournamentName);
    console.log('Tournament PDA:', tournamentPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('create_tournament');
    const nameData = serializeString(tournamentName);
    const entryFee = serializeU64(1000000); // 0.001 SOL
    
    // Start time: current time + 1 day
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const startTime = serializeI64(currentTimestamp + 86400);
    
    const maxTeams = serializeU8(8);
    
    const instructionData = Buffer.concat([
      discriminator,
      nameData,
      entryFee,
      startTime,
      maxTeams
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: tournamentPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Creating tournament...');
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Tournament created! Signature:', txSignature);
    
    // Verify tournament account was created
    const tournamentAccount = await connection.getAccountInfo(tournamentPDA);
    if (tournamentAccount) {
      console.log('Tournament account exists with data size:', tournamentAccount.data.length);
      return tournamentName;
    } else {
      console.log('Tournament account not found');
      return null;
    }
  } catch (error) {
    console.error('Create tournament test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return null;
  }
}

// Test 9: Register Team for Tournament
async function registerTeamForTournamentTest(connection, payer, teamName, tournamentName) {
  try {
    // Find team PDA
    const [teamPDA] = findTeamPDA(payer.publicKey, teamName);
    
    // Find tournament PDA
    const [tournamentPDA] = findTournamentPDA(payer.publicKey, tournamentName);
    
    console.log('Registering team for tournament...');
    console.log('- Team PDA:', teamPDA.toString());
    console.log('- Tournament PDA:', tournamentPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('register_team_for_tournament');
    const tournamentId = tournamentPDA.toBuffer();
    const teamId = teamPDA.toBuffer();
    
    const instructionData = Buffer.concat([
      discriminator,
      tournamentId,
      teamId
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: teamPDA, isSigner: false, isWritable: true },
        { pubkey: tournamentPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // payer again
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
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
    console.log('Team registered for tournament! Signature:', txSignature);
    
    return true;
  } catch (error) {
    console.error('Register team for tournament test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Test 10: Remove Player from Team
async function removePlayerFromTeamTest(connection, payer, mintPublicKey, teamName) {
  try {
    // Find team PDA
    const [teamPDA] = findTeamPDA(payer.publicKey, teamName);
    
    // Find player PDA
    const [playerPDA] = findPlayerPDA(mintPublicKey);
    
    console.log('Removing player from team...');
    console.log('- Team PDA:', teamPDA.toString());
    console.log('- Player PDA:', playerPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('remove_player_from_team');
    const playerMintData = mintPublicKey.toBuffer();
    
    const instructionData = Buffer.concat([
      discriminator,
      playerMintData
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
    console.log('Player removed from team! Signature:', txSignature);
    
    return true;
  } catch (error) {
    console.error('Remove player from team test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Test 11: Verify Creator
async function verifyCreatorTest(connection, payer, adminKeypair) {
  try {
    // Find creator PDA
    const [creatorPDA] = findCreatorPDA(payer.publicKey);
    console.log('Verifying creator:', creatorPDA.toString());
    console.log('Admin keypair:', adminKeypair.publicKey.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('verify_creator');
    
    const instructionData = Buffer.concat([
      discriminator
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: adminKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: creatorPDA, isSigner: false, isWritable: true }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create transaction - this is where the error was happening
    const transaction = new Transaction().add(instruction);
    
    console.log('Sending verification transaction...');
    
    // Use sendAndConfirmTransaction for consistency
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [adminKeypair]
    );
    
    console.log('Creator verified! Signature:', txSignature);
    
    return true;
  } catch (error) {
    console.error('Verify creator test failed:', error.message);
    if (error.logs) {
      console.log('Logs:');
      error.logs.forEach(log => console.log('  ' + log));
    }
    return false;
  }
}

// Test 12: Create Exclusive Athlete
async function createExclusiveAthleteTest(connection, payer) {
  try {
    // Create a mint keypair for the exclusive athlete
    const mintKeypair = Keypair.generate();
    
    // Initialize the mint
    console.log('Initializing mint account for exclusive athlete...');
    
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
    
    // Find creator PDA
    const [creatorPDA] = findCreatorPDA(payer.publicKey);
    
    // Find player PDA for the exclusive athlete
    const [playerPDA] = findPlayerPDA(mintKeypair.publicKey);
    console.log('Exclusive Athlete PDA:', playerPDA.toString());
    
    // Create instruction data
    const discriminator = createDiscriminator('create_exclusive_athlete');
    const nameData = serializeString("SuperStar");
    const positionData = serializeString("Carry");
    const uriData = serializeString("https://arweave.net/exclusive-athlete");
    
    // Predefined stats (Option<PlayerStats>) - None in this case
    const predefinedStatsOption = Buffer.from([0]); // 0 for None
    
    // Collection ID (Option<Pubkey>) - None in this case
    const collectionIdOption = Buffer.from([0]); // 0 for None
    
    // Max editions (Option<u64>) - None in this case
    const maxEditionsOption = Buffer.from([0]); // 0 for None
    
    const instructionData = Buffer.concat([
      discriminator,
      nameData,
      positionData,
      uriData,
      predefinedStatsOption,
      collectionIdOption,
      maxEditionsOption
    ]);
    
    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: creatorPDA, isSigner: false, isWritable: true },
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true }, // payer again
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    console.log('Creating exclusive athlete...');
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Exclusive athlete created! Signature:', txSignature);
    
    // Verify player account was created
    const playerAccount = await connection.getAccountInfo(playerPDA);
    if (playerAccount) {
      console.log('Exclusive athlete account exists with data size:', playerAccount.data.length);
      return true;
    } else {
      console.log('Exclusive athlete account not found');
      return false;
    }
  } catch (error) {
    console.error('Create exclusive athlete test failed:', error.message);
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