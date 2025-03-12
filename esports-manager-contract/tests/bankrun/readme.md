# Esport Dream League - Bankrun Testing Suite

This directory contains tests for the Esport Dream League smart contracts using solana-bankrun, a fast and efficient testing framework for Solana programs that doesn't require a validator.

## What is Bankrun?

Bankrun provides a lightweight Solana test environment that runs directly against the banking stage, bypassing the overhead of running a full validator. This results in:

- Much faster test execution (often 10-100x faster than validator-based tests)
- Deterministic testing environment
- Direct control over blockchain state for testing edge cases
- Ability to manipulate time, accounts, and other blockchain state

## Setup Instructions

### Prerequisites

- Node.js 16+
- pnpm (preferred) or npm/yarn
- Solana CLI tools

### Installation

```bash
# From the project root
cd bankrun-tests
pnpm install
```

### Configuration

The tests expect your compiled program at `../target/deploy/esports_manager_contract.so`. Make sure to build your program first:

```bash
# From the project root
anchor build
```

If your program is in a different location, update the path in `src/helpers.ts`.

## Running Tests

### Run all tests

```bash
pnpm test
```

### Run a specific test file

```bash
pnpm test -- test/player.test.ts
```

## Test Structure

The tests are organized by contract module:

- `player.test.ts`: Tests for player NFT creation and management
- `team.test.ts`: Tests for team creation and roster management
- `tournament.test.ts`: Tests for tournament creation and match processing
- `integration.test.ts`: End-to-end tests that verify complete workflows

## Key Testing Features

### Time Manipulation

Bankrun allows manipulating the blockchain's clock, which is useful for testing time-dependent features like tournament schedules:

```typescript
// Jump ahead in time
const clock = await client.getClock();
const newClock = {
  ...clock,
  unix_timestamp: clock.unix_timestamp + 3600, // Advance 1 hour
  slot: clock.slot + 10000
};
context.setClock(newClock);
```

### Account State Manipulation

Tests can directly set account data without needing transactions:

```typescript
// Set arbitrary account state
context.setAccount(accountPubkey, {
  executable: false,
  owner: PROGRAM_ID,
  lamports: 1000000,
  data: accountData
});
```

### Anchor Integration

Tests use Anchor's startAnchor function to automatically load programs from the workspace:

```typescript
const context = await startAnchor(
  "../..", // Path to project root (with Anchor.toml)
  [], // No extra programs
  [] // No additional accounts
);
```

## Test Helpers

The tests use several helper functions to make test code more readable:

### Account Finding

```typescript
// Find PDAs for accounts
const [playerPDA, _] = findPDA(
  [strToBuffer('player'), mintKeypair.publicKey.toBuffer()],
  PROGRAM_ID
);
```

### Instruction Creation

```typescript
// Create instruction with proper discriminator and data
const instruction = createInitializePlayerInstruction(
  payer.publicKey,
  mintKeypair.publicKey,
  playerPDA,
  'PlayerName',
  'Position',
  'URI'
);
```

### Transaction Processing

```typescript
// Create and send transaction
const tx = new Transaction();
tx.recentBlockhash = context.lastBlockhash;
tx.add(instruction);
tx.feePayer = payer.publicKey;
tx.sign(payer);
await client.processTransaction(tx);
```

## Creating New Tests

To add a new test:

1. Create a new file in the `test/` directory
2. Import the necessary utilities from `src/helpers.ts`
3. Use the existing tests as a template

Example structure for a new test:

```typescript
import { startAnchor } from 'solana-bankrun';
import { PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { findPDA, strToBuffer } from '../src/helpers';

describe('My New Feature Tests', () => {
  // Setup test context
  const testSetup = async () => {
    const context = await startAnchor("../..", [], []);
    return context;
  };
  
  test('should perform an action', async () => {
    const context = await testSetup();
    // Test implementation
    expect(result).toBeTruthy();
  });
});
```

## Troubleshooting

### Program Not Found

If tests fail with "Program not found" errors:
- Ensure you've built your program with `anchor build`
- Check that the program path in `src/helpers.ts` is correct

### Account Deserialization Errors

If you have trouble deserializing account data:
- Make sure your serialization in tests matches what the contract expects
- Consider using Anchor's IDL for proper serialization/deserialization

### Transaction Simulation Failed

If tests fail with "Transaction simulation failed":
- Check instruction data format
- Ensure all required accounts are included
- Verify signer permissions

## Performance Tips

- Use `context.setAccount()` for test setup instead of transactions when possible
- Group related tests that share setup to avoid redundant initialization
- Use `.skip` for long-running tests during development