// src/lib/utils/solana-utils.ts

/**
 * Utility functions for Solana blockchain operations
 */

// Shortens a Solana address for display
export function shortenAddress(address: string | null, chars = 4): string {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
  
  // Format Sol amount for display
  export function formatSol(lamports: number): string {
    return (lamports / 1_000_000_000).toFixed(4);
  }
  
  // Converts a Buffer or Uint8Array to a hex string
  export function toHex(buffer: Buffer | Uint8Array): string {
    return Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Converts a hex string to a Buffer
  export function fromHex(hex: string): Buffer {
    return Buffer.from(
      hex.startsWith('0x') ? hex.substring(2) : hex,
      'hex'
    );
  }
  
 // Encode data to Base58
export function toBase58(data: Buffer | Uint8Array): string {
  const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  const bytes = Buffer.from(data);
  
  const d: number[] = [];
  let s = '';
  let i,
    j = 0,
    c,
    n;
  
  for (i = 0; i < bytes.length; i++) {
    j = 0;
    c = bytes[i];
    
    s += c || s.length ^ i ? '' : 1;
    
    while (j in d || c) {
      n = d[j] || 0;
      n = n * 256 + (c || 0);
      c = Math.floor(n / 58);
      d[j] = n % 58;
      j++;
    }
  }
  
  while (j--) {
    s += BASE58_ALPHABET[d[j] || 0];
  }
  
  return s;
}
  
  // Helper to create explorer links
  export function getExplorerUrl(type: 'address' | 'tx', value: string): string {
    return `https://explorer.solana.com/${type}/${value}?cluster=devnet`;
  }