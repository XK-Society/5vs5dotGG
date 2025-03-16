type PublicKey = string;

type DefinedType<T> = { defined: T };

export type EsportsManager = {
  version: "0.1.0";
  name: "esports_manager";
  instructions: {
    name: string;
    accounts: {
      name: string;
      isMut: boolean;
      isSigner: boolean;
    }[];
    args: {
      name: string;
      type: 
        | string
        | DefinedType<string>
        | { option: string | DefinedType<string> }
        | { array: [string, number] };
    }[];
  }[];
  accounts: {
    name: string;
    type: {
      kind: "struct";
      fields: {
        name: string;
        type: string | DefinedType<string> | { option: string | DefinedType<string> } | { vec: string | DefinedType<string> };
      }[];
    };
  }[];
  errors: {
    code: number;
    name: string;
    msg: string;
  }[];
};

export const IDL: EsportsManager = {
  version: "0.1.0",
  name: "esports_manager",
  instructions: [
    {
      name: "addPlayerToTeam",
      accounts: [
        { name: "owner", isMut: true, isSigner: true },
        { name: "teamAccount", isMut: true, isSigner: false },
        { name: "playerAccount", isMut: true, isSigner: false },
        { name: "playerMint", isMut: false, isSigner: false },
      ],
      args: [
        { name: "playerMint", type: "publicKey" },
        { name: "position", type: "string" },
      ],
    },
    {
      name: "addSpecialAbility",
      accounts: [
        { name: "owner", isMut: true, isSigner: true },
        { name: "playerAccount", isMut: true, isSigner: false },
      ],
      args: [
        { name: "abilityName", type: "string" },
        { name: "abilityValue", type: "u8" },
      ],
    },
    {
      name: "createExclusiveAthlete",
      accounts: [
        { name: "creator", isMut: true, isSigner: true },
        { name: "creatorAccount", isMut: true, isSigner: false },
        { name: "mint", isMut: false, isSigner: false },
        { name: "playerAccount", isMut: true, isSigner: false },
        { name: "payer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "position", type: "string" },
        { name: "uri", type: "string" },
        { name: "predefinedStats", type: { option: { defined: "PlayerStats" } } },
        { name: "collectionId", type: { option: "publicKey" } },
        { name: "maxEditions", type: { option: "u64" } },
      ],
    },
    {
      name: "createTeam",
      accounts: [
        { name: "owner", isMut: true, isSigner: true },
        { name: "teamAccount", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "logoUri", type: "string" },
      ],
    },
    {
      name: "createTournament",
      accounts: [
        { name: "authority", isMut: true, isSigner: true },
        { name: "tournamentAccount", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "entryFee", type: "u64" },
        { name: "startTime", type: "i64" },
        { name: "maxTeams", type: "u8" },
      ],
    },
    {
      name: "initializePlayer",
      accounts: [
        { name: "owner", isMut: true, isSigner: true },
        { name: "mint", isMut: false, isSigner: false },
        { name: "playerAccount", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "position", type: "string" },
        { name: "gameSpecificData", type: "bytes" },
        { name: "uri", type: "string" },
      ],
    },
  ],
  accounts: [
    {
      name: "CreatorAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "name", type: "string" },
          { name: "verified", type: "bool" },
          { name: "creatorFeeBasisPoints", type: "u16" },
        ],
      },
    },
    {
      name: "PlayerAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "mint", type: "publicKey" },
          { name: "name", type: "string" },
          { name: "position", type: "string" },
          { name: "experience", type: "u32" },
        ],
      },
    },
    {
      name: "TeamAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "name", type: "string" },
          { name: "collectionMint", type: { option: "publicKey" } },
          { name: "logoUri", type: "string" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "UnauthorizedAccess", msg: "Unauthorized access to account" },
    { code: 6001, name: "AbilityAlreadyExists", msg: "Player already has this ability" },
    { code: 6002, name: "PlayerAlreadyOnTeam", msg: "Player is already on a team" },
    { code: 6003, name: "PlayerNotOnTeam", msg: "Player is not on this team" },
    { code: 6004, name: "TeamRosterFull", msg: "Team roster is full" },
  ],
};
