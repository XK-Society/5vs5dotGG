# Esports Dream League - Implementation Guide

This guide provides step-by-step instructions for implementing the Esports Dream League Match Simulation Engine with Next.js 14 and Solana Kit.

## Project Overview

Esports Dream League is a blockchain-based esports management simulation where players collect athlete NFTs, form teams, and compete in AI-driven tournaments. The Match Simulation Engine is a key component that simulates matches between teams based on player statistics and updates player performance on the blockchain.

## Technologies Used

- **Next.js 14**: Latest React framework with App Router
- **Solana Kit**: Modern Solana JavaScript SDK replacing web3.js
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Anchor Framework**: For Solana smart contract implementation

## Setup Instructions

### 1. Create a New Next.js Project

```bash
npx create-next-app@latest esports-dream-league --typescript
```

During setup, answer the prompts as follows:
- TypeScript: Yes ✅
- ESLint: Yes ✅
- Tailwind CSS: Yes ✅
- `src/` directory: Yes ✅
- App Router: Yes ✅ (Next.js 14 uses App Router by default)
- Import alias (@/*): Yes ✅

### 2. Install Dependencies

```bash
cd esports-dream-league
npm install @solana/kit @solana/accounts @solana/codecs @solana/crypto @solana/rpc @solana/transactions @solana/web3.js @solana-program/compute-budget lucide-react clsx tailwind-merge class-variance-authority
```

### 3. Project Structure

Organize your project according to this structure:

```
/esports-dream-league
├── public/
│   └── assets/
│       └── icons/
│       └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── match-simulation/
│   │       └── page.tsx        # Match simulation page
│   ├── components/
│   │   ├── ui/                 # UI components
│   │   ├── layout/            # Layout components
│   │   └── match/             # Match simulation components
│   ├── lib/
│   │   ├── types/             # Type definitions
│   │   ├── api/               # API functions
│   │   └── simulation/        # Simulation engine
│   └── providers/             # React context providers
└── package.json
```

### 4. Implementation Order

1. **Set up TypeScript types**
   - Create program types in `src/lib/types/program.ts`

2. **Implement simulation engine**
   - Create the engine in `src/lib/simulation/engine.ts`

3. **Set up Solana API services**
   - Implement `src/lib/api/solana-service.ts` for Solana interactions
   - Create `src/lib/api/idl-client.ts` for contract interactions
   - Implement `src/lib/api/match-service.ts` for match-related operations

4. **Create UI components**
   - Implement basic UI components: Button, Card, etc.
   - Create layout components: Header, Footer
   - Build match simulation components: MatchSimulator, MatchEvents, MatchResults

5. **Set up pages**
   - Create the homepage
   - Implement match simulation page

6. **Create providers**
   - Implement wallet provider for Solana wallet connection

## Key Concepts

### Simulation Engine

The match simulation engine is responsible for:
1. Calculating team performance based on player attributes
2. Generating match events (kills, objectives, teamfights, etc.)
3. Determining match outcome
4. Calculating player performance changes
5. Generating commentary

The engine takes into account various player stats like:
- Mechanical skill
- Game knowledge
- Team communication
- Adaptability
- Consistency
- Form
- Special abilities

### Solana Integration

The application interacts with the Solana blockchain using the new Solana Kit library, which offers:
1. Tree-shakability
2. Composable internals
3. Modern JavaScript features
4. Functional architecture

Key Solana operations include:
- Recording match results on-chain
- Updating player performance after matches
- Registering teams for tournaments

### IDL Integration

The application integrates with the Esports Manager smart contract through its IDL (Interface Definition Language). This allows for:
1. Type-safe interactions with the contract
2. Automatic client generation
3. Composable instruction builders

## Implementation Details

### 1. Simulation Engine Implementation

The simulation engine calculates team performance using weighted player stats:

```typescript
// Calculate team's overall performance
function calculateTeamPerformance(team: TeamAccount, players: PlayerAccount[]): number {
  // Calculate base performance for each player
  const playerPerformances = players.map(player => {
    const basePerformance = calculatePlayerBasePerformance(player);
    const abilitiesBonus = calculateSpecialAbilitiesBonus(player.special_abilities);
    return basePerformance + abilitiesBonus;
  });
  
  // Average player performance
  const avgPlayerPerformance = playerPerformances.reduce((sum, perf) => sum + perf, 0) / playerPerformances.length;
  
  // Add synergy bonus
  const synergyBonus = team.statistics.synergy_score * SYNERGY_WEIGHT;
  
  return avgPlayerPerformance + synergyBonus;
}
```

Match results include:
- Win/loss determination
- Score calculation
- Player performance changes
- Experience gained
- MVP selection
- Match commentary

### 2. Solana Integration

The application interacts with Solana using the Kit's functional approach:

```typescript
// Create transaction message
const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  tx => setTransactionMessageFeePayer(address(authorityKeypair.publicKey as unknown as string), tx),
  tx => setTransactionMessageLifetimeUsingBlockhash({ 
    blockhash: blockhash as any, 
    lastValidBlockHeight 
  }, tx),
  tx => prependTransactionMessageInstruction(
    getSetComputeUnitLimitInstruction({ units: 200000 }),
    tx
  ),
  tx => appendTransactionMessageInstructions([instruction], tx)
);

// Sign and send transaction
const signedTransaction = await signTransaction([authorityKeypair], transactionMessage);
const signature = await sendTransaction(signedTransaction, { rpc });
```

### 3. UI Implementation

The UI is built with React components and Tailwind CSS. Key features include:
- Team comparison view
- Match events timeline
- Match results with player performance changes
- On-chain recording functionality

## Best Practices

1. **Use TypeScript extensively** for type safety and better developer experience
2. **Separate concerns** into logical modules
3. **Use React functional components** with hooks
4. **Leverage the functional approach** of Solana Kit for better tree-shaking
5. **Use mock data** during development before connecting to live Solana network
6. **Implement proper error handling** for blockchain interactions
7. **Add loading states** for all blockchain operations to improve UX
8. **Use client components** strategically in Next.js to optimize performance

## Blockchain Integration Details

### 1. Working with Solana Kit

Solana Kit differs significantly from the older web3.js library, using a functional approach instead of classes:

```typescript
// OLD (web3.js):
const connection = new Connection(endpoint);
const transaction = new Transaction();
transaction.add(instruction);
const signature = await sendAndConfirmTransaction(connection, transaction, [signer]);

// NEW (Solana Kit):
const rpc = createSolanaRpc(endpoint);
const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  tx => setTransactionMessageFeePayer(feePayerAddress, tx),
  tx => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
  tx => appendTransactionMessageInstructions([instruction], tx)
);
const signedTransaction = await signTransaction([signer], transactionMessage);
const signature = await sendAndConfirmTransaction(signedTransaction, { rpc });
```

### 2. IDL Integration

The project uses the IDL to generate strongly-typed instructions:

```typescript
// Create client from IDL
const client = await getEsportsManagerClient();

// Use typed instruction builders
const instruction = client.updatePlayerPerformanceInstruction(
  address(ownerPublicKey),
  address(playerMint),
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
```

### 3. Wallet Integration

For production environments, you should integrate with proper wallet adapters like Solana Wallet Adapter. The current implementation uses a simple wallet provider for demonstration:

```typescript
// Create a proper wallet integration
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Setup
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);
const wallets = [new PhantomWalletAdapter()];

// Provider
<ConnectionProvider endpoint={endpoint}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      {children}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
```

## Performance Optimization

### 1. Component Optimization

- Use `React.memo` for components that don't need frequent re-renders
- Implement proper dependency arrays in `useEffect` and other hooks
- Use dynamic imports for code splitting

### 2. RPC Optimization

- Implement batching for multiple RPC requests
- Use caching for frequently accessed data
- Implement retry and failover mechanisms for RPC calls

```typescript
// Example of a custom transport with retry logic
function createRetryTransport(url: string, maxRetries = 3) {
  const transport = createDefaultRpcTransport({ url });
  
  return async function retryTransport(...args: Parameters<RpcTransport>) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await transport(...args);
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };
}
```

## Testing Strategies

### 1. Unit Testing

Use Jest for testing individual functions, especially the simulation engine:

```typescript
// Example test for the simulation engine
describe('Simulation Engine', () => {
  test('calculatePlayerBasePerformance returns weighted sum of stats', () => {
    const player = {
      mechanical: 80,
      game_knowledge: 70,
      team_communication: 90,
      adaptability: 75,
      consistency: 85,
      form: 80,
      // ...other required fields
    } as PlayerAccount;
    
    const performance = calculatePlayerBasePerformance(player);
    expect(performance).toBeGreaterThan(0);
    expect(performance).toBeLessThanOrEqual(100);
  });
});
```

### 2. Component Testing

Use React Testing Library for testing React components:

```typescript
// Example test for MatchSimulator component
test('MatchSimulator shows teams and allows simulation', async () => {
  render(<MatchSimulator />);
  
  // Check if teams are displayed
  expect(screen.getByText('Cyber Knights')).toBeInTheDocument();
  expect(screen.getByText('Digital Dragons')).toBeInTheDocument();
  
  // Click simulate button
  fireEvent.click(screen.getByText('Run Simulation'));
  
  // Check if simulation is running
  expect(screen.getByText('Simulating...')).toBeInTheDocument();
});
```

### 3. Integration Testing

Use Cypress for end-to-end testing:

```typescript
// Example Cypress test
describe('Match Simulation Page', () => {
  it('should simulate a match and display results', () => {
    cy.visit('/match-simulation');
    cy.contains('Connect Wallet').click();
    cy.contains('Run Simulation').click();
    cy.contains('Match Commentary', { timeout: 10000 }).should('be.visible');
    cy.contains('Match Timeline').should('be.visible');
  });
});
```

## Deployment

### 1. Vercel Deployment

Deploy your Next.js app to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 2. Environment Variables

Set up the following environment variables:

- `NEXT_PUBLIC_SOLANA_RPC_URL`: Your Solana RPC endpoint
- `NEXT_PUBLIC_NETWORK`: Network to use (mainnet, devnet, testnet)

## Further Enhancements

1. **Implement Real Wallet Integration**: Replace the mock wallet with proper Solana wallet adapter
2. **Add Player and Team Management**: Allow users to create and manage their own teams/players
3. **Implement Tournament System**: Create a full tournament bracket system
4. **Add Analytics Dashboard**: Show player/team performance statistics over time
5. **Improve Simulation Algorithm**: Enhance the match simulation with more realistic outcomes
6. **Add Visual Match Replay**: Create a visual representation of match events
7. **Implement Social Features**: Allow commenting, sharing, and following other teams

## Conclusion

This implementation guide provides a comprehensive approach to building the Esports Dream League application using Next.js 14 and Solana Kit. By following these steps and best practices, you can create a robust, scalable, and user-friendly esports management simulation on the Solana blockchain.

The modular architecture allows for easy extension and maintenance, while the modern tech stack ensures optimal performance and developer experience. As Solana Kit continues to evolve, your application can take advantage of new features and improvements with minimal refactoring.

Happy building!