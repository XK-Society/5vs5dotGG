# 5vs5.gg - Blockchain-based Esports Management Simulation

5vs5.gg is a decentralized esports management platform built on the Solana blockchain, where players can collect athlete NFTs, form teams, and compete in AI-driven tournaments.

![5vs5.gg Logo](./public/images/5vs5-logo.png)

## Overview

5vs5.gg combines NFT collectibles with AI match simulation to create an immersive esports management experience. The platform allows users to:

- Collect and train esports athlete NFTs with unique stats and abilities
- Form teams with complementary player skills
- Compete in tournaments against other users
- Earn rewards through victories and progression
- Create exclusive athletes as verified creators

## Features

### Player NFT System
- Create and collect unique esports athlete NFTs
- Each player has individual stats: mechanical skill, game knowledge, team communication, adaptability, and consistency
- Players improve through training and match experience
- Special abilities and rarities affect performance

### Team Management
- Create teams and manage rosters of up to 5 players
- Team synergy affects match performance
- Track team statistics and performance history
- Optimize team composition based on player strengths

### Tournament System
- Join tournaments with entry fees and prize pools
- Single-elimination bracket formats
- AI-driven match simulations
- Detailed match statistics and play-by-play commentary

### Match Simulation
- Advanced simulation engine that factors in player stats, team synergy, and match events
- Real-time commentary with excitement levels
- Visual timeline of match events
- Detailed post-match statistics

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) 16+
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/getting-started/install)
- Solana wallet (like [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/5vs5-gg.git
cd 5vs5-gg

# Install dependencies
npm install
# or
yarn install

# Create a .env.local file (see .env.example for required variables)
cp .env.example .env.local

# Start the development server
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Connect to Testnet

5vs5.gg connects to the Sonic testnet by default. Make sure your wallet is configured to use this network:

```
RPC URL: https://api.testnet.sonic.game/
Chain ID: Sonic
```

## Smart Contract Architecture

The platform is built on a Solana program with the following key components:

### Player Account
- Stores player metadata, stats, and performance history
- Links to NFT mint address
- Tracks training and match history

### Team Account
- Contains roster of players
- Tracks team statistics and match history
- Calculates synergy based on player compatibility

### Tournament Account
- Manages tournament registration and brackets
- Handles entry fees and prize distribution
- Records match results and tournament progress

### Creator Account
- Enables verified creators to mint exclusive athlete NFTs
- Supports revenue sharing for creators
- Manages collections and editions

## Development Roadmap

### Phase 1: Core Features (Current)
- Player NFT creation and management
- Team formation and management
- Basic tournament structure
- Match simulation engine

### Phase 2: Enhanced Gameplay
- Advanced tournament formats
- Creator marketplace
- Improved simulation engine
- Performance analytics

### Phase 3: Economy & Growth
- Token economy and staking
- Mobile application
- Community tournaments
- Esports partnerships

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Blockchain integration with [Solana Web3.js](https://github.com/solana-labs/solana-web3.js)
- Smart contracts with [Anchor](https://github.com/project-serum/anchor)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Hosting on [Vercel](https://vercel.com)

---

© 2025 5vs5.gg. All rights reserved.