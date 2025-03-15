// src/lib/api/idl-client.ts
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from './solana-service';

// Enum definitions from the IDL
export enum Rarity {
  Common = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 4
}

export enum TrainingType {
  Mechanical = 0,
  GameKnowledge = 1,
  TeamCommunication = 2,
  Adaptability = 3,
  Consistency = 4
}

export enum TournamentStatus {
  Registration = 0,
  InProgress = 1,
  Completed = 2,
  Canceled = 3
}

// Account flag types
export const AccountFlags = {
  CreatorAccount: [222, 163, 32, 169, 204, 8, 200, 32],
  PlayerAccount: [224, 184, 224, 50, 98, 72, 48, 236],
  TeamAccount: [174, 133, 172, 53, 28, 209, 165, 72],
  TournamentAccount: [60, 80, 64, 99, 120, 6, 22, 117]
};

// Instruction discriminators
export const EsportsManagerInstruction = {
  AddPlayerToTeam: [171, 84, 106, 209, 207, 108, 255, 216],
  AddSpecialAbility: [40, 25, 207, 183, 71, 26, 58, 226],
  CreateExclusiveAthlete: [148, 18, 163, 71, 88, 94, 161, 240],
  CreateTeam: [122, 161, 98, 67, 178, 128, 116, 113],
  CreateTournament: [158, 137, 233, 231, 73, 132, 191, 68],
  InitializePlayer: [79, 249, 88, 177, 220, 62, 56, 128],
  RecordMatchResult: [37, 251, 4, 178, 56, 184, 50, 210],
  RegisterCreator: [85, 3, 194, 210, 164, 140, 160, 195],
  RegisterTeamForTournament: [224, 136, 57, 37, 8, 79, 74, 89],
  RemovePlayerFromTeam: [22, 196, 177, 237, 211, 16, 213, 155],
  TrainPlayer: [137, 16, 65, 189, 87, 131, 44, 220],
  UpdatePlayerPerformance: [112, 173, 136, 202, 11, 116, 149, 196],
  VerifyCreator: [52, 17, 96, 132, 71, 4, 85, 194]
};

// Data structure types
export type SpecialAbility = {
  name: string;
  value: number;
};

export type PlayerStats = {
  mechanical: number;
  game_knowledge: number;
  team_communication: number;
  adaptability: number;
  consistency: number;
  potential: number;
  form: number;
};

export type RosterPosition = {
  player_mint: string;
  position: string;
  added_at: number;
};

export type TeamStatistics = {
  matches_played: number;
  wins: number;
  losses: number;
  tournament_wins: number;
  avg_mechanical: number;
  avg_game_knowledge: number;
  avg_team_communication: number;
  synergy_score: number;
};

export type TeamMatchResult = {
  match_id: string;
  timestamp: number;
  opponent: string;
  win: boolean;
  score: [number, number];
  tournament_id?: string;
};

export type TournamentMatch = {
  match_id: string;
  timestamp: number;
  team_a: string;
  team_b: string;
  winner?: string;
  score: [number, number];
  round: number;
  completed: boolean;
};

// Helper functions to serialize data for instructions
function serializeString(str: string): Buffer {
  const strBuffer = Buffer.from(str);
  const lenBuffer = Buffer.alloc(4);
  lenBuffer.writeUInt32LE(strBuffer.length, 0);
  return Buffer.concat([lenBuffer, strBuffer]);
}

function serializeBytes(data: Uint8Array): Buffer {
  const lenBuffer = Buffer.alloc(4);
  lenBuffer.writeUInt32LE(data.length, 0);
  return Buffer.concat([lenBuffer, Buffer.from(data)]);
}

function serializeU8(value: number): Buffer {
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value, 0);
  return buffer;
}

function serializeU32(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);
  return buffer;
}

function serializeI8(value: number): Buffer {
  const buffer = Buffer.alloc(1);
  buffer.writeInt8(value, 0);
  return buffer;
}

function serializeI64(value: number): Buffer {
  const buffer = Buffer.alloc(8);
  const bigintValue = BigInt(value);
  buffer.writeBigInt64LE(bigintValue, 0);
  return buffer;
}

function serializeU64(value: number): Buffer {
  const buffer = Buffer.alloc(8);
  const bigintValue = BigInt(value);
  buffer.writeBigUInt64LE(bigintValue, 0);
  return buffer;
}

function serializeBoolean(value: boolean): Buffer {
  return Buffer.from([value ? 1 : 0]);
}

function serializePublicKey(pubkey: string): Buffer {
  return new PublicKey(pubkey).toBuffer();
}

function serializeEnum(value: number): Buffer {
  const buffer = Buffer.alloc(1);
  buffer.writeUInt8(value, 0);
  return buffer;
}

// Instruction builders - using web3.js TransactionInstruction directly
export function createInitializePlayerInstruction(
  owner: string,
  mint: string,
  playerPda: string,
  name: string,
  position: string,
  gameSpecificData: Uint8Array,
  uri: string
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from(EsportsManagerInstruction.InitializePlayer),
    serializeString(name),
    serializeString(position),
    serializeBytes(gameSpecificData),
    serializeString(uri)
  ]);

  return new TransactionInstruction({
    programId: new PublicKey(PROGRAM_ID),
    data,
    keys: [
      { pubkey: new PublicKey(owner), isSigner: true, isWritable: true },
      { pubkey: new PublicKey(mint), isSigner: false, isWritable: false },
      { pubkey: new PublicKey(playerPda), isSigner: false, isWritable: true },
      { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false }, // System Program
      { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false }, // Token Program
      { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false } // Rent Sysvar
    ]
  });
}

export function createUpdatePlayerPerformanceInstruction(
  owner: string,
  playerPda: string,
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
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from(EsportsManagerInstruction.UpdatePlayerPerformance),
    serializeString(matchId),
    serializeBoolean(win),
    serializeBoolean(mvp),
    serializeU32(expGained),
    serializeI8(mechanicalChange),
    serializeI8(gameKnowledgeChange),
    serializeI8(teamCommunicationChange),
    serializeI8(adaptabilityChange),
    serializeI8(consistencyChange),
    serializeI8(formChange),
    serializeBytes(matchStats)
  ]);

  return new TransactionInstruction({
    programId: new PublicKey(PROGRAM_ID),
    data,
    keys: [
      { pubkey: new PublicKey(owner), isSigner: true, isWritable: true },
      { pubkey: new PublicKey(playerPda), isSigner: false, isWritable: true }
    ]
  });
}

export function createTeamInstruction(
  owner: string,
  teamPda: string,
  name: string,
  logoUri: string
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from(EsportsManagerInstruction.CreateTeam),
    serializeString(name),
    serializeString(logoUri)
  ]);

  return new TransactionInstruction({
    programId: new PublicKey(PROGRAM_ID),
    data,
    keys: [
      { pubkey: new PublicKey(owner), isSigner: true, isWritable: true },
      { pubkey: new PublicKey(teamPda), isSigner: false, isWritable: true },
      { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false }, // System Program
      { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false } // Rent Sysvar
    ]
  });
}

export function addPlayerToTeamInstruction(
  owner: string,
  teamPda: string,
  playerPda: string,
  playerMint: string,
  position: string
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from(EsportsManagerInstruction.AddPlayerToTeam),
    serializePublicKey(playerMint),
    serializeString(position)
  ]);

  return new TransactionInstruction({
    programId: new PublicKey(PROGRAM_ID),
    data,
    keys: [
      { pubkey: new PublicKey(owner), isSigner: true, isWritable: true },
      { pubkey: new PublicKey(teamPda), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(playerPda), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(playerMint), isSigner: false, isWritable: false }
    ]
  });
}

export function removePlayerFromTeamInstruction(
  owner: string,
  teamPda: string,
  playerPda: string,
  playerMint: string
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from(EsportsManagerInstruction.RemovePlayerFromTeam),
    serializePublicKey(playerMint)
  ]);

  return new TransactionInstruction({
    programId: new PublicKey(PROGRAM_ID),
    data,
    keys: [
      { pubkey: new PublicKey(owner), isSigner: true, isWritable: true },
      { pubkey: new PublicKey(teamPda), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(playerPda), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(playerMint), isSigner: false, isWritable: false }
    ]
  });
}