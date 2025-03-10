# Esport Dream League

A blockchain-based esports management simulation where players collect athlete NFTs, form teams, and compete in AI-driven tournaments.


## Overview

Esport Dream League combines NFT collectibles with AI match simulation to create an immersive esports management experience. The platform allows users to:

- Collect and train esports athlete NFTs
- Form teams with complementary player skills
- Compete in tournaments against other users
- Earn rewards through victories and progression
- Create exclusive athletes as verified creators

## Architecture

The project uses a hybrid architecture that combines Solana blockchain for NFTs and game state with an off-chain AI engine for match simulations.

### Core Components

#### Blockchain Layer (Solana)
- **Player NFT System**: A dual-structure approach with Metaplex NFTs for marketplace compatibility and custom PDAs for game data
- **Team Management**: Create teams, manage rosters, and track performance
- **Tournament System**: Run competitive structures with entry requirements and prizes
- **Creator System**: Allow authorized creators to mint exclusive athlete NFTs

#### Off-Chain Components
- **Match Simulation Engine**: JavaScript-based simulation that processes player and team data
- **Web & Mobile Interface**: React-based UI for managing NFTs, teams, and tournaments

## Getting Started

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install) 1.65+
- [Node.js](https://nodejs.org/en/download/) 16+
- [Solana Tool Suite](https://docs.solana.com/cli/install-solana-cli-tools) 1.14+
- [Anchor Framework](https://project-serum.github.io/anchor/getting-started/installation.html) 0.27+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/esport-dream-league.git
cd esport-dream-league

# Install dependencies
yarn install

# Build the Solana program
anchor build

# Deploy to localnet
anchor deploy

# Start the frontend
cd app
yarn start
```

## Smart Contract Overview

### Player NFT System

Players are represented as NFTs with their game data stored in PDAs:

```rust
pub struct PlayerAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,  // Link to Metaplex NFT
    pub name: String,
    pub position: String,
    
    // Core stats (0-100 scale)
    pub mechanical: u8,
    pub game_knowledge: u8,
    pub team_communication: u8,
    pub adaptability: u8,
    pub consistency: u8,
    
    // Special abilities and performance metrics
    pub special_abilities: Vec<SpecialAbility>,
    pub experience: u32,
    pub matches_played: u32,
    pub wins: u32,
    pub mvp_count: u32,
    pub form: u8,
    pub potential: u8,
    
    // Other metadata
    pub team: Option<Pubkey>,
    pub creator: Option<Pubkey>,
    pub is_exclusive: bool,
}
```

### Team Management

Teams group players together for competitions:

```rust
pub struct TeamAccount {
    pub owner: Pubkey,
    pub name: String,
    pub collection_mint: Option<Pubkey>,
    pub logo_uri: String,
    pub roster: Vec<RosterPosition>,
    pub statistics: TeamStatistics,
}
```

### Tournament System

Tournaments provide competitive structures with brackets and prizes:

```rust
pub struct TournamentAccount {
    pub authority: Pubkey,
    pub name: String,
    pub entry_fee: u64,
    pub prize_pool: u64,
    pub max_teams: u8,
    pub registered_teams: Vec<Pubkey>,
    pub matches: Vec<TournamentMatch>,
    pub status: TournamentStatus,
}
```

### Creator System

Verified creators can mint exclusive athlete NFTs:

```rust
pub struct CreatorAccount {
    pub authority: Pubkey,
    pub name: String,
    pub verified: bool,
    pub creator_fee_basis_points: u16,
    pub collections_created: Vec<Pubkey>,
    pub total_athletes_created: u32,
}
```

## Simulation Engine

The Match Simulation Engine uses JavaScript to process player and team metadata to generate realistic match outcomes. The engine:

1. Calculates team performance based on player attributes
2. Generates significant events throughout the match
3. Determines outcomes based on performance differentials
4. Produces commentary and statistics
5. Generates metadata updates for blockchain transactions

## API Reference

### Player Management

```rust
// Initialize a new player NFT
initialize_player(name, position, game_specific_data, uri)

// Update player after a match
update_player_performance(match_id, win, mvp, exp_gained, stat_changes)

// Train a specific player stat
train_player(training_type, intensity)
```

### Team Management

```rust
// Create a new team
create_team(name, logo_uri)

// Add player to team
add_player_to_team(player_mint, position)

// Remove player from team
remove_player_from_team(player_mint)
```

### Tournament System

```rust
// Create a tournament
create_tournament(name, entry_fee, start_time, max_teams)

// Register team for tournament
register_team_for_tournament(tournament_id, team_id)

// Record match result
record_match_result(match_id, winner_id, loser_id, score, match_data)
```

### Creator System

```rust
// Register as a creator
register_creator(name, fee_basis_points)

// Create exclusive athlete NFT
create_exclusive_athlete(name, position, uri, predefined_stats)
```

## Development Roadmap

### Phase 1: Core System (Current)
- Player NFT framework
- Team management
- Basic tournament structure
- Simulation engine prototype

### Phase 2: Enhanced Gameplay
- Advanced tournament system
- Creator exclusive athletes
- Upgraded simulation engine
- Performance analytics

### Phase 3: Economy & Scale
- In-game token economy
- Governance system
- Performance optimizations
- Mobile application

### Phase 4: Community & Growth
- Community tournaments
- Esports brand partnerships
- Enhanced graphics and UI
- New game modes

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Solana](https://solana.com/)
- [Metaplex](https://www.metaplex.com/)
- [Anchor Framework](https://project-serum.github.io/anchor/)