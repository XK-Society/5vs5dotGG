export type EsportsManager = {
    "version": "0.1.0",
    "name": "esports_manager",
    "instructions": [
      {
        "name": "initializePlayer",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "mint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "position",
            "type": "string"
          },
          {
            "name": "gameSpecificData",
            "type": "bytes"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      },
      {
        "name": "updatePlayerPerformance",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "win",
            "type": "bool"
          },
          {
            "name": "mvp",
            "type": "bool"
          },
          {
            "name": "expGained",
            "type": "u32"
          },
          {
            "name": "mechanicalChange",
            "type": "i8"
          },
          {
            "name": "gameKnowledgeChange",
            "type": "i8"
          },
          {
            "name": "teamCommunicationChange",
            "type": "i8"
          },
          {
            "name": "adaptabilityChange",
            "type": "i8"
          },
          {
            "name": "consistencyChange",
            "type": "i8"
          },
          {
            "name": "formChange",
            "type": "i8"
          },
          {
            "name": "matchStats",
            "type": "bytes"
          }
        ]
      },
      {
        "name": "trainPlayer",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "trainingType",
            "type": {
              "defined": "TrainingType"
            }
          },
          {
            "name": "intensity",
            "type": "u8"
          }
        ]
      },
      {
        "name": "addSpecialAbility",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "abilityName",
            "type": "string"
          },
          {
            "name": "abilityValue",
            "type": "u8"
          }
        ]
      },
      {
        "name": "createTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "logoUri",
            "type": "string"
          }
        ]
      },
      {
        "name": "addPlayerToTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerMint",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "playerMint",
            "type": "publicKey"
          },
          {
            "name": "position",
            "type": "string"
          }
        ]
      },
      {
        "name": "removePlayerFromTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerMint",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "playerMint",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "registerCreator",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "feeBasisPoints",
            "type": "u16"
          }
        ]
      },
      {
        "name": "verifyCreator",
        "accounts": [
          {
            "name": "admin",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "createExclusiveAthlete",
        "accounts": [
          {
            "name": "creator",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "mint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "position",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "predefinedStats",
            "type": {
              "option": {
                "defined": "PlayerStats"
              }
            }
          },
          {
            "name": "collectionId",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "maxEditions",
            "type": {
              "option": "u64"
            }
          }
        ]
      },
      {
        "name": "createTournament",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "entryFee",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "maxTeams",
            "type": "u8"
          }
        ]
      },
      {
        "name": "registerTeamForTournament",
        "accounts": [
          {
            "name": "teamOwner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "tournamentId",
            "type": "publicKey"
          },
          {
            "name": "teamId",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "recordMatchResult",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "winnerTeam",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "loserTeam",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "winnerId",
            "type": "publicKey"
          },
          {
            "name": "loserId",
            "type": "publicKey"
          },
          {
            "name": "score",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "matchData",
            "type": "bytes"
          }
        ]
      }
    ]
  }
            "type": {
              "defined": "TrainingType"
            }
          },
          {
            "name": "intensity",
            "type": "u8"
          }
        ]
      },
      {
        "name": "addSpecialAbility",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "abilityName",
            "type": "string"
          },
          {
            "name": "abilityValue",
            "type": "u8"
          }
        ]
      },
      {
        "name": "createTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "logoUri",
            "type": "string"
          }
        ]
      },
      {
        "name": "addPlayerToTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerMint",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "playerMint",
            "type": "publicKey"
          },
          {
            "name": "position",
            "type": "string"
          }
        ]
      },
      {
        "name": "removePlayerFromTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerMint",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "playerMint",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "registerCreator",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "feeBasisPoints",
            "type": "u16"
          }
        ]
      },
      {
        "name": "verifyCreator",
        "accounts": [
          {
            "name": "admin",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "createExclusiveAthlete",
        "accounts": [
          {
            "name": "creator",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "mint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "position",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "predefinedStats",
            "type": {
              "option": {
                "defined": "PlayerStats"
              }
            }
          },
          {
            "name": "collectionId",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "maxEditions",
            "type": {
              "option": "u64"
            }
          }
        ]
      },
      {
        "name": "createTournament",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "entryFee",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "maxTeams",
            "type": "u8"
          }
        ]
      },
      {
        "name": "registerTeamForTournament",
        "accounts": [
          {
            "name": "teamOwner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "tournamentId",
            "type": "publicKey"
          },
          {
            "name": "teamId",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "recordMatchResult",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "winnerTeam",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "loserTeam",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "winnerId",
            "type": "publicKey"
          },
          {
            "name": "loserId",
            "type": "publicKey"
          },
          {
            "name": "score",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "matchData",
            "type": "bytes"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "CreatorAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "verified",
              "type": "bool"
            },
            {
              "name": "creatorFeeBasisPoints",
              "type": "u16"
            },
            {
              "name": "collectionsCreated",
              "type": {
                "vec": "publicKey"
              }
            },
            {
              "name": "totalAthletesCreated",
              "type": "u32"
            },
            {
              "name": "createdAt",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "PlayerAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "mint",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "position",
              "type": "string"
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "lastUpdated",
              "type": "i64"
            },
            {
              "name": "team",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "uri",
              "type": "string"
            },
            {
              "name": "mechanical",
              "type": "u8"
            },
            {
              "name": "gameKnowledge",
              "type": "u8"
            },
            {
              "name": "teamCommunication",
              "type": "u8"
            },
            {
              "name": "adaptability",
              "type": "u8"
            },
            {
              "name": "consistency",
              "type": "u8"
            },
            {
              "name": "specialAbilities",
              "type": {
                "vec": {
                  "defined": "SpecialAbility"
                }
              }
            },
            {
              "name": "gameSpecificData",
              "type": "bytes"
            },
            {
              "name": "experience",
              "type": "u32"
            },
            {
              "name": "matchesPlayed",
              "type": "u32"
            },
            {
              "name": "wins",
              "type": "u32"
            },
            {
              "name": "mvpCount",
              "type": "u32"
            },
            {
              "name": "form",
              "type": "u8"
            },
            {
              "name": "potential",
              "type": "u8"
            },
            {
              "name": "rarity",
              "type": {
                "defined": "Rarity"
              }
            },
            {
              "name": "creator",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "isExclusive",
              "type": "bool"
            },
            {
              "name": "performanceHistory",
              "type": {
                "vec": {
                  "defined": "MatchPerformance"
                }
              }
            }
          ]
        }
      },
      {
        "name": "TeamAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "collectionMint",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "logoUri",
              "type": "string"
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "lastUpdated",
              "type": "i64"
            },
            {
              "name": "roster",
              "type": {
                "vec": {
                  "defined": "RosterPosition"
                }
              }
            },
            {
              "name": "statistics",
              "type": {
                "defined": "TeamStatistics"
              }
            },
            {
              "name": "matchHistory",
              "type": {
                "vec": {
                  "defined": "TeamMatchResult"
                }
              }
            }
          ]
        }
      },
      {
        "name": "TournamentAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "entryFee",
              "type": "u64"
            },
            {
              "name": "prizePool",
              "type": "u64"
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "maxTeams",
              "type": "u8"
            },
            {
              "name": "registeredTeams",
              "type": {
                "vec": "publicKey"
              }
            },
            {
              "name": "matches",
              "type": {
                "vec": {
                  "defined": "TournamentMatch"
                }
              }
            },
            {
              "name": "status",
              "type": {
                "defined": "TournamentStatus"
              }
            },
            {
              "name": "createdAt",
              "type": "i64"
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "MatchPerformance",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchId",
              "type": "string"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "win",
              "type": "bool"
            },
            {
              "name": "mvp",
              "type": "bool"
            },
            {
              "name": "expGained",
              "type": "u32"
            },
            {
              "name": "stats",
              "type": "bytes"
            }
          ]
        }
      },
      {
        "name": "PlayerStats",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "mechanical",
              "type": "u8"
            },
            {
              "name": "gameKnowledge",
              "type": "u8"
            },
            {
              "name": "teamCommunication",
              "type": "u8"
            },
            {
              "name": "adaptability",
              "type": "u8"
            },
            {
              "name": "consistency",
              "type": "u8"
            },
            {
              "name": "potential",
              "type": "u8"
            },
            {
              "name": "form",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "RosterPosition",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "playerMint",
              "type": "publicKey"
            },
            {
              "name": "position",
              "type": "string"
            },
            {
              "name": "addedAt",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "SpecialAbility",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "value",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "TeamStatistics",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchesPlayed",
              "type": "u32"
            },
            {
              "name": "wins",
              "type": "u32"
            },
            {
              "name": "losses",
              "type": "u32"
            },
            {
              "name": "tournamentWins",
              "type": "u32"
            },
            {
              "name": "avgMechanical",
              "type": "u8"
            },
            {
              "name": "avgGameKnowledge",
              "type": "u8"
            },
            {
              "name": "avgTeamCommunication",
              "type": "u8"
            },
            {
              "name": "synergyScore",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "TeamMatchResult",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchId",
              "type": "string"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "opponent",
              "type": "publicKey"
            },
            {
              "name": "win",
              "type": "bool"
            },
            {
              "name": "score",
              "type": {
                "array": [
                  "u8",
                  2
                ]
              }
            },
            {
              "name": "tournamentId",
              "type": {
                "option": "publicKey"
              }
            }
          ]
        }
      },
      {
        "name": "TournamentMatch",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchId",
              "type": "string"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "teamA",
              "type": "publicKey"
            },
            {
              "name": "teamB",
              "type": "publicKey"
            },
            {
              "name": "winner",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "score",
              "type": {
                "array": [
                  "u8",
                  2
                ]
              }
            },
            {
              "name": "round",
              "type": "u8"
            },
            {
              "name": "completed",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "Rarity",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Common"
            },
            {
              "name": "Uncommon"
            },
            {
              "name": "Rare"
            },
            {
              "name": "Epic"
            },
            {
              "name": "Legendary"
            }
          ]
        }
      },
      {
        "name": "TournamentStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Registration"
            },
            {
              "name": "InProgress"
            },
            {
              "name": "Completed"
            },
            {
              "name": "Canceled"
            }
          ]
        }
      },
      {
        "name": "TrainingType",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Mechanical"
            },
            {
              "name": "GameKnowledge"
            },
            {
              "name": "TeamCommunication"
            },
            {
              "name": "Adaptability"
            },
            {
              "name": "Consistency"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "UnauthorizedAccess",
        "msg": "Unauthorized access to account"
      },
      {
        "code": 6001,
        "name": "AbilityAlreadyExists",
        "msg": "Player already has this ability"
      },
      {
        "code": 6002,
        "name": "PlayerAlreadyOnTeam",
        "msg": "Player is already on a team"
      },
      {
        "code": 6003,
        "name": "PlayerNotOnTeam",
        "msg": "Player is not on this team"
      },
      {
        "code": 6004,
        "name": "TeamRosterFull",
        "msg": "Team roster is full"
      },
      {
        "code": 6005,
        "name": "PositionAlreadyFilled",
        "msg": "Position is already filled on this team"
      },
      {
        "code": 6006,
        "name": "TournamentFull",
        "msg": "Tournament is already full"
      },
      {
        "code": 6007,
        "name": "TournamentAlreadyStarted",
        "msg": "Tournament has already started"
      },
      {
        "code": 6008,
        "name": "TeamAlreadyRegistered",
        "msg": "Team is already registered for this tournament"
      },
      {
        "code": 6009,
        "name": "CreatorNotVerified",
        "msg": "Creator is not verified"
      },
      {
        "code": 6010,
        "name": "InvalidFeeBasisPoints",
        "msg": "Fee basis points must be between 0-1000 (0-10%)"
      },
      {
        "code": 6011,
        "name": "MatchAlreadyRecorded",
        "msg": "Match has already been recorded"
      },
      {
        "code": 6012,
        "name": "InvalidTournamentParameters",
        "msg": "Invalid tournament parameters"
      },
      {
        "code": 6013,
        "name": "MatchNotFound",
        "msg": "Match not found in tournament"
      },
      {
        "code": 6014,
        "name": "InvalidTeamId",
        "msg": "Invalid team ID"
      },
      {
        "code": 6015,
        "name": "InvalidTournamentId",
        "msg": "Invalid tournament ID"
      }
    ]
  };
  
  export const IDL: EsportsManager = {
    "version": "0.1.0",
    "name": "esports_manager",
    "instructions": [
      {
        "name": "initializePlayer",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "mint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "position",
            "type": "string"
          },
          {
            "name": "gameSpecificData",
            "type": "bytes"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      },
      {
        "name": "updatePlayerPerformance",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "win",
            "type": "bool"
          },
          {
            "name": "mvp",
            "type": "bool"
          },
          {
            "name": "expGained",
            "type": "u32"
          },
          {
            "name": "mechanicalChange",
            "type": "i8"
          },
          {
            "name": "gameKnowledgeChange",
            "type": "i8"
          },
          {
            "name": "teamCommunicationChange",
            "type": "i8"
          },
          {
            "name": "adaptabilityChange",
            "type": "i8"
          },
          {
            "name": "consistencyChange",
            "type": "i8"
          },
          {
            "name": "formChange",
            "type": "i8"
          },
          {
            "name": "matchStats",
            "type": "bytes"
          }
        ]
      },
      {
        "name": "trainPlayer",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "trainingType",
            "type": {
              "defined": "TrainingType"
            }
          },
          {
            "name": "intensity",
            "type": "u8"
          }
        ]
      },
      {
        "name": "addSpecialAbility",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "abilityName",
            "type": "string"
          },
          {
            "name": "abilityValue",
            "type": "u8"
          }
        ]
      },
      {
        "name": "createTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "logoUri",
            "type": "string"
          }
        ]
      },
      {
        "name": "addPlayerToTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerMint",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "playerMint",
            "type": "publicKey"
          },
          {
            "name": "position",
            "type": "string"
          }
        ]
      },
      {
        "name": "removePlayerFromTeam",
        "accounts": [
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "playerMint",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "playerMint",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "registerCreator",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "feeBasisPoints",
            "type": "u16"
          }
        ]
      },
      {
        "name": "verifyCreator",
        "accounts": [
          {
            "name": "admin",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "createExclusiveAthlete",
        "accounts": [
          {
            "name": "creator",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "creatorAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "mint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "playerAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "position",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "predefinedStats",
            "type": {
              "option": {
                "defined": "PlayerStats"
              }
            }
          },
          {
            "name": "collectionId",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "maxEditions",
            "type": {
              "option": "u64"
            }
          }
        ]
      },
      {
        "name": "createTournament",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "entryFee",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "maxTeams",
            "type": "u8"
          }
        ]
      },
      {
        "name": "registerTeamForTournament",
        "accounts": [
          {
            "name": "teamOwner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "teamAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "tournamentId",
            "type": "publicKey"
          },
          {
            "name": "teamId",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "recordMatchResult",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tournamentAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "winnerTeam",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "loserTeam",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "winnerId",
            "type": "publicKey"
          },
          {
            "name": "loserId",
            "type": "publicKey"
          },
          {
            "name": "score",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "matchData",
            "type": "bytes"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "CreatorAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "verified",
              "type": "bool"
            },
            {
              "name": "creatorFeeBasisPoints",
              "type": "u16"
            },
            {
              "name": "collectionsCreated",
              "type": {
                "vec": "publicKey"
              }
            },
            {
              "name": "totalAthletesCreated",
              "type": "u32"
            },
            {
              "name": "createdAt",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "PlayerAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "mint",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "position",
              "type": "string"
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "lastUpdated",
              "type": "i64"
            },
            {
              "name": "team",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "uri",
              "type": "string"
            },
            {
              "name": "mechanical",
              "type": "u8"
            },
            {
              "name": "gameKnowledge",
              "type": "u8"
            },
            {
              "name": "teamCommunication",
              "type": "u8"
            },
            {
              "name": "adaptability",
              "type": "u8"
            },
            {
              "name": "consistency",
              "type": "u8"
            },
            {
              "name": "specialAbilities",
              "type": {
                "vec": {
                  "defined": "SpecialAbility"
                }
              }
            },
            {
              "name": "gameSpecificData",
              "type": "bytes"
            },
            {
              "name": "experience",
              "type": "u32"
            },
            {
              "name": "matchesPlayed",
              "type": "u32"
            },
            {
              "name": "wins",
              "type": "u32"
            },
            {
              "name": "mvpCount",
              "type": "u32"
            },
            {
              "name": "form",
              "type": "u8"
            },
            {
              "name": "potential",
              "type": "u8"
            },
            {
              "name": "rarity",
              "type": {
                "defined": "Rarity"
              }
            },
            {
              "name": "creator",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "isExclusive",
              "type": "bool"
            },
            {
              "name": "performanceHistory",
              "type": {
                "vec": {
                  "defined": "MatchPerformance"
                }
              }
            }
          ]
        }
      },
      {
        "name": "TeamAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "collectionMint",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "logoUri",
              "type": "string"
            },
            {
              "name": "createdAt",
              "type": "i64"
            },
            {
              "name": "lastUpdated",
              "type": "i64"
            },
            {
              "name": "roster",
              "type": {
                "vec": {
                  "defined": "RosterPosition"
                }
              }
            },
            {
              "name": "statistics",
              "type": {
                "defined": "TeamStatistics"
              }
            },
            {
              "name": "matchHistory",
              "type": {
                "vec": {
                  "defined": "TeamMatchResult"
                }
              }
            }
          ]
        }
      },
      {
        "name": "TournamentAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "entryFee",
              "type": "u64"
            },
            {
              "name": "prizePool",
              "type": "u64"
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "maxTeams",
              "type": "u8"
            },
            {
              "name": "registeredTeams",
              "type": {
                "vec": "publicKey"
              }
            },
            {
              "name": "matches",
              "type": {
                "vec": {
                  "defined": "TournamentMatch"
                }
              }
            },
            {
              "name": "status",
              "type": {
                "defined": "TournamentStatus"
              }
            },
            {
              "name": "createdAt",
              "type": "i64"
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "MatchPerformance",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchId",
              "type": "string"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "win",
              "type": "bool"
            },
            {
              "name": "mvp",
              "type": "bool"
            },
            {
              "name": "expGained",
              "type": "u32"
            },
            {
              "name": "stats",
              "type": "bytes"
            }
          ]
        }
      },
      {
        "name": "PlayerStats",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "mechanical",
              "type": "u8"
            },
            {
              "name": "gameKnowledge",
              "type": "u8"
            },
            {
              "name": "teamCommunication",
              "type": "u8"
            },
            {
              "name": "adaptability",
              "type": "u8"
            },
            {
              "name": "consistency",
              "type": "u8"
            },
            {
              "name": "potential",
              "type": "u8"
            },
            {
              "name": "form",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "RosterPosition",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "playerMint",
              "type": "publicKey"
            },
            {
              "name": "position",
              "type": "string"
            },
            {
              "name": "addedAt",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "SpecialAbility",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "value",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "TeamStatistics",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchesPlayed",
              "type": "u32"
            },
            {
              "name": "wins",
              "type": "u32"
            },
            {
              "name": "losses",
              "type": "u32"
            },
            {
              "name": "tournamentWins",
              "type": "u32"
            },
            {
              "name": "avgMechanical",
              "type": "u8"
            },
            {
              "name": "avgGameKnowledge",
              "type": "u8"
            },
            {
              "name": "avgTeamCommunication",
              "type": "u8"
            },
            {
              "name": "synergyScore",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "TeamMatchResult",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchId",
              "type": "string"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "opponent",
              "type": "publicKey"
            },
            {
              "name": "win",
              "type": "bool"
            },
            {
              "name": "score",
              "type": {
                "array": [
                  "u8",
                  2
                ]
              }
            },
            {
              "name": "tournamentId",
              "type": {
                "option": "publicKey"
              }
            }
          ]
        }
      },
      {
        "name": "TournamentMatch",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "matchId",
              "type": "string"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "teamA",
              "type": "publicKey"
            },
            {
              "name": "teamB",
              "type": "publicKey"
            },
            {
              "name": "winner",
              "type": {
                "option": "publicKey"
              }
            },
            {
              "name": "score",
              "type": {
                "array": [
                  "u8",
                  2
                ]
              }
            },
            {
              "name": "round",
              "type": "u8"
            },
            {
              "name": "completed",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "Rarity",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Common"
            },
            {
              "name": "Uncommon"
            },
            {
              "name": "Rare"
            },
            {
              "name": "Epic"
            },
            {
              "name": "Legendary"
            }
          ]
        }
      },
      {
        "name": "TournamentStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Registration"
            },
            {
              "name": "InProgress"
            },
            {
              "name": "Completed"
            },
            {
              "name": "Canceled"
            }
          ]
        }
      },
      {
        "name": "TrainingType",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "Mechanical"
            },
            {
              "name": "GameKnowledge"
            },
            {
              "name": "TeamCommunication"
            },
            {
              "name": "Adaptability"
            },
            {
              "name": "Consistency"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "UnauthorizedAccess",
        "msg": "Unauthorized access to account"
      },
      {
        "code": 6001,
        "name": "AbilityAlreadyExists",
        "msg": "Player already has this ability"
      },
      {
        "code": 6002,
        "name": "PlayerAlreadyOnTeam",
        "msg": "Player is already on a team"
      },
      {
        "code": 6003,
        "name": "PlayerNotOnTeam",
        "msg": "Player is not on this team"
      },
      {
        "code": 6004,
        "name": "TeamRosterFull",
        "msg": "Team roster is full"
      },
      {
        "code": 6005,
        "name": "PositionAlreadyFilled",
        "msg": "Position is already filled on this team"
      },
      {
        "code": 6006,
        "name": "TournamentFull",
        "msg": "Tournament is already full"
      },
      {
        "code": 6007,
        "name": "TournamentAlreadyStarted",
        "msg": "Tournament has already started"
      },
      {
        "code": 6008,
        "name": "TeamAlreadyRegistered",
        "msg": "Team is already registered for this tournament"
      },
      {
        "code": 6009,
        "name": "CreatorNotVerified",
        "msg": "Creator is not verified"
      },
      {
        "code": 6010,
        "name": "InvalidFeeBasisPoints",
        "msg": "Fee basis points must be between 0-1000 (0-10%)"
      },
      {
        "code": 6011,
        "name": "MatchAlreadyRecorded",
        "msg": "Match has already been recorded"
      },
      {
        "code": 6012,
        "name": "InvalidTournamentParameters",
        "msg": "Invalid tournament parameters"
      },
      {
        "code": 6013,
        "name": "MatchNotFound",
        "msg": "Match not found in tournament"
      },
      {
        "code": 6014,
        "name": "InvalidTeamId",
        "msg": "Invalid team ID"
      },
      {
        "code": 6015,
        "name": "InvalidTournamentId",
        "msg": "Invalid tournament ID"
      }
    ]
  }