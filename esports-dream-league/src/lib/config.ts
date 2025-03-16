// src/lib/config.ts
export const config = {
  solanaNetwork: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  solanaRpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  // Set mockTransactions to false by default
  mockTransactions: process.env.NEXT_PUBLIC_MOCK_TRANSACTIONS === 'true',
  programId: process.env.NEXT_PUBLIC_PROGRAM_ID || '2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ',
  isDevelopment: process.env.NODE_ENV === 'development'
};