Based on the original README and the changes we've made, here's an enhanced version for the 5vs5.gg project:

# 5vs5.gg

A blockchain-based esports management simulation where players collect athlete NFTs, form teams, and compete in AI-driven tournaments.


## Overview

5vs5.gg combines NFT collectibles with AI match simulation to create an immersive esports management experience. The platform allows users to:

- Collect and train esports athlete NFTs
- Form teams with complementary player skills
- Compete in tournaments against other users
- Earn rewards through victories and progression
- Create exclusive athletes as verified creators

## Game contract link
https://explorer.sonic.game/address/2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ?cluster=testnet.v1

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
- **Tournament Commentator**: Real-time commentary system with excitement levels and text-to-speech capability
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
git clone https://github.com/your-org/5vs5-gg.git
cd 5vs5-gg

# Install dependencies
yarn install

# Build the Solana program
anchor build

# Deploy to Sonic testnet
anchor deploy --provider.cluster https://api.testnet.sonic.game/

# Start the frontend
cd app
yarn dev
```

### Connect to Sonic Testnet

5vs5.gg connects to the Sonic testnet by default. Make sure your wallet is configured to use this network:

```
RPC URL: https://api.testnet.sonic.game/
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

### Tournament Commentary System

The platform includes a sophisticated commentary system that:

1. Provides real-time match commentary with varying excitement levels
2. Uses Web Speech API for dynamic text-to-speech
3. Reacts to in-game events with appropriate analysis
4. Highlights key moments and player performances

## Demo Mode

For demonstration purposes, the platform includes a simulation demo that can be accessed at `/demo-simulation`. This allows users to:

1. View tournament brackets and team matchups
2. Watch single match simulations with live commentary
3. Explore the full tournament simulation experience
4. Test the system without blockchain interactions

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

### Phase 1: Core System (Completed)
- Player NFT framework
- Team management
- Basic tournament structure
- Simulation engine prototype

### Phase 2: Enhanced Gameplay (Current)
- Advanced tournament system
- Tournament match simulation with commentary
- Creator exclusive athletes
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
- [Sonic Chain](https://www.sonic.game/)
- [Metaplex](https://www.metaplex.com/)
- [Anchor Framework](https://project-serum.github.io/anchor/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)