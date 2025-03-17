// src/services/connection-service.ts
import { Connection, ConnectionConfig, PublicKey } from '@solana/web3.js';

// Simple in-memory cache implementation
class RpcCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private TTL = 30000; // 30 seconds cache TTL

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if cache entry is expired
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Queue implementation for rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsInLastSecond = 0;
  private lastRequestTime = 0;
  private maxRequestsPerSecond = 10; // Adjust based on RPC provider limits
  
  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Rate limiting logic
          const now = Date.now();
          const timeElapsed = now - this.lastRequestTime;
          
          if (timeElapsed < 1000) {
            // Still within the same second
            this.requestsInLastSecond++;
            if (this.requestsInLastSecond >= this.maxRequestsPerSecond) {
              // Wait for the rest of the second before making the request
              const delay = 1000 - timeElapsed;
              await new Promise(r => setTimeout(r, delay));
            }
          } else {
            // New second, reset counter
            this.requestsInLastSecond = 1;
          }
          
          this.lastRequestTime = Date.now();
          const result = await request();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const request = this.queue.shift();
    
    try {
      await request!();
    } catch (error) {
      console.error('Error processing request:', error);
    }
    
    this.processQueue();
  }
}

// Enhanced Solana connection service
export class SolanaConnectionService {
  private static instance: SolanaConnectionService;
  private connection: Connection;
  private cache = new RpcCache();
  private queue = new RequestQueue();
  private endpoints = [
    'https://api.testnet.sonic.game/',
    'https://rpc.ankr.com/solana_devnet/859e3dfc5fea2edd45e9dd3fd2748eee4daa40a8a5281a967b0d3d08e87afafe',
    'https://devnet.genesysgo.net',
    'https://devnet.solana.com'
  ];
  private currentEndpointIndex = 0;
  
  private constructor() {
    this.connection = new Connection(this.endpoints[this.currentEndpointIndex], {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    });
  }
  
  public static getInstance(): SolanaConnectionService {
    if (!SolanaConnectionService.instance) {
      SolanaConnectionService.instance = new SolanaConnectionService();
    }
    return SolanaConnectionService.instance;
  }
  
  public getConnection(): Connection {
    return this.connection;
  }
  
  public switchEndpoint(): void {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length;
    console.log(`Switching to RPC endpoint: ${this.endpoints[this.currentEndpointIndex]}`);
    
    this.connection = new Connection(this.endpoints[this.currentEndpointIndex], {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    });
  }
  
  // Enhanced Account fetch with caching and rate limiting
  public async getAccountInfo(pubkey: PublicKey, config?: ConnectionConfig): Promise<any> {
    const cacheKey = `account:${pubkey.toString()}`;
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const fetch = async (retries = 3): Promise<any> => {
      try {
        return await this.queue.add(() => this.connection.getAccountInfo(pubkey, config));
      } catch (error: any) {
        if (error.toString().includes('429') && retries > 0) {
          // Rate limit hit, wait and retry
          await new Promise(r => setTimeout(r, 1000));
          return fetch(retries - 1);
        }
        if (error.toString().includes('429') && retries === 0) {
          // Switch endpoints and try again
          this.switchEndpoint();
          return fetch(3);
        }
        throw error;
      }
    };
    
    const accountInfo = await fetch();
    if (accountInfo) {
      this.cache.set(cacheKey, accountInfo);
    }
    
    return accountInfo;
  }
  
  // Get program accounts with caching and rate limiting
  public async getProgramAccounts(programId: PublicKey, filters?: any): Promise<any[]> {
    const filterStr = filters ? JSON.stringify(filters) : '';
    const cacheKey = `program:${programId.toString()}:${filterStr}`;
    const cachedData = this.cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const fetch = async (retries = 3): Promise<any[]> => {
      try {
        const result = await this.queue.add(() => this.connection.getProgramAccounts(programId, filters));
        // Convert the result to an array if it's not already
        return Array.isArray(result) ? result : [];
      } catch (error: any) {
        if (error.toString().includes('429') && retries > 0) {
          // Rate limit hit, wait and retry
          await new Promise(r => setTimeout(r, 1000));
          return fetch(retries - 1);
        }
        if (error.toString().includes('429') && retries === 0) {
          // Switch endpoints and try again
          this.switchEndpoint();
          return fetch(3);
        }
        throw error;
      }
    };
    
    const accounts = await fetch();
    if (accounts && accounts.length > 0) {
      this.cache.set(cacheKey, accounts);
    }
    
    return accounts;
  }
  
  // Clear cache
  public clearCache(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const solanaConnection = SolanaConnectionService.getInstance();