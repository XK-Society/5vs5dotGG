'use client';

import { useState, useRef, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProgram, findTeamPDA, findPlayerPDA } from '@/contexts/ProgramContextProvider';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { TeamAccount } from '@/types/program-types';

// Helper to add delay between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache timeout in milliseconds (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

// Interface for cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useTeamOperations() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program } = useProgram();
  const [isLoading, setIsLoading] = useState(false);
  
  // Team account cache
  const teamAccountCache = useRef<Map<string, CacheEntry<TeamAccount>>>(new Map());

  // Function to clear cache
  const clearCache = useCallback(() => {
    teamAccountCache.current.clear();
    console.log("Team account cache cleared");
  }, []);

  // Function to get from cache with validation
  const getFromCache = useCallback((key: string): TeamAccount | null => {
    const cacheEntry = teamAccountCache.current.get(key);
    
    if (!cacheEntry) return null;
    
    // Check if cache entry is still valid
    const now = Date.now();
    if (now - cacheEntry.timestamp > CACHE_TIMEOUT) {
      // Cache expired
      teamAccountCache.current.delete(key);
      return null;
    }
    
    return cacheEntry.data;
  }, []);
  
  // Function to add to cache
  const addToCache = useCallback((key: string, data: TeamAccount) => {
    teamAccountCache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Create team function (unchanged)
  const createTeam = async (name: string, logoUri: string) => {
    if (!program || !publicKey) return;

    setIsLoading(true);

    try {
      // First check if a team with this name already exists
      const teamExists = await checkTeamExists(name);
      
      if (teamExists) {
        toast.error('A team with this name already exists. Please choose a different name.');
        return null;
      }

      const [teamPDA] = findTeamPDA(publicKey, name);

      const tx = await program.methods
        .createTeam(name, logoUri || '/images/placeholder-team-logo.png')
        .accounts({
          owner: publicKey,
          teamAccount: teamPDA,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Clear cache after team creation
      clearCache();
      
      toast.success('Team created successfully!');
      return teamPDA;
    } catch (error: any) {
      // More specific error handling
      if (error.message && error.message.includes("already in use")) {
        toast.error('A team with this name already exists. Please choose a different name.');
      } else {
        console.error('Error creating team:', error);
        toast.error('Failed to create team. Please try again.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addPlayerToTeam = async (
    teamPDA: PublicKey,
    playerMintPublicKey: PublicKey,
    position: string
  ) => {
    if (!program || !publicKey) return;

    setIsLoading(true);

    try {
      const [playerPDA] = findPlayerPDA(playerMintPublicKey);

      const tx = await program.methods
        .addPlayerToTeam(playerMintPublicKey, position)
        .accounts({
          owner: publicKey,
          teamAccount: teamPDA,
          playerAccount: playerPDA,
          playerMint: playerMintPublicKey,
        })
        .transaction();

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Invalidate cache after player addition
      teamAccountCache.current.delete(teamPDA.toString());
      
      toast.success('Player added to team!');
      return true;
    } catch (error) {
      console.error('Error adding player to team:', error);
      toast.error('Failed to add player to team');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkTeamExists = async (name: string): Promise<boolean> => {
    if (!program || !publicKey) return false;
    
    try {
      const [teamPDA] = findTeamPDA(publicKey, name);
      
      // Check cache first
      const cachedTeam = getFromCache(teamPDA.toString());
      if (cachedTeam) return true;
      
      // Try to fetch the team account to see if it exists
      const account = await connection.getAccountInfo(teamPDA);
      
      // If account is not null, then the team already exists
      return account !== null;
    } catch (error) {
      console.log("Error checking if team exists:", error);
      return false;
    }
  };

  const removePlayerFromTeam = async (
    teamPDA: PublicKey,
    playerMintPublicKey: PublicKey
  ) => {
    if (!program || !publicKey) return;

    setIsLoading(true);

    try {
      const [playerPDA] = findPlayerPDA(playerMintPublicKey);

      const tx = await program.methods
        .removePlayerFromTeam(playerMintPublicKey)
        .accounts({
          owner: publicKey,
          teamAccount: teamPDA,
          playerAccount: playerPDA,
          playerMint: playerMintPublicKey,
        })
        .transaction();

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Invalidate cache after player removal
      teamAccountCache.current.delete(teamPDA.toString());
      
      toast.success('Player removed from team!');
      return true;
    } catch (error) {
      console.error('Error removing player from team:', error);
      toast.error('Failed to remove player from team');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Optimized Team Account Fetching with Cache
  const fetchTeamAccount = useCallback(async (teamPDA: PublicKey, retries = 3, initialDelay = 300): Promise<TeamAccount | null> => {
    if (!program) return null;
    
    // Check if we have this team in cache
    const cachedTeam = getFromCache(teamPDA.toString());
    if (cachedTeam) {
      console.log("Returning cached team data for:", teamPDA.toString());
      return cachedTeam;
    }
    
    console.log("Cache miss for team:", teamPDA.toString());
    
    // Not in cache, fetch from blockchain
    let currentRetry = 0;
    let delay = initialDelay;
  
    while (currentRetry <= retries) {
      try {
        const rawAccount = await program.account.teamAccount.fetch(teamPDA);
        
        // Create properly formatted account
        const teamAccount = {
          ...rawAccount,
          publicKey: teamPDA,
          logoUri: (rawAccount as any).logoUri || '/images/placeholder-team-logo.png',
        } as TeamAccount;
        
        // Add to cache
        addToCache(teamPDA.toString(), teamAccount);
        
        return teamAccount;
      } catch (error: any) {
        const isRateLimitError = error?.message?.includes('429') || error?.toString()?.includes('Too many requests');
        if (currentRetry >= retries || !isRateLimitError) {
          console.error('Error fetching team account:', error);
          return null;
        }
        console.log(`Rate limit hit, retrying after ${delay}ms... (${currentRetry + 1}/${retries})`);
        await sleep(delay);
        delay *= 2;
        currentRetry++;
      }
    }
  
    return null;
  }, [program, getFromCache, addToCache]);

  // Fetch user teams with caching
  const fetchUserTeams = useCallback(async (): Promise<{
    publicKey: PublicKey;
    account: TeamAccount;
  }[]> => {
    if (!program || !publicKey) return [];

    try {
      console.log("Fetching teams for wallet:", publicKey.toString());

      // Get team accounts from blockchain
      const teams = await program.account.teamAccount.all([
        {
          memcmp: {
            offset: 8, // Skip Anchor discriminator
            bytes: publicKey.toBase58(),
          },
        },
      ]);

      console.log("Fetched teams:", teams.length);

      // Process each team and update cache
      const processedTeams = teams.map((team) => {
        const teamAccount = {
          ...team.account,
          logoUri: ((team.account as any).logoUri as string) || '/images/placeholder-team-logo.png',
        } as TeamAccount;
        
        // Update cache for each team
        addToCache(team.publicKey.toString(), teamAccount);
        
        return {
          publicKey: team.publicKey,
          account: teamAccount
        };
      });

      return processedTeams;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }
  }, [program, publicKey, addToCache]);

  const fetchAllTeams = useCallback(async () => {
    if (!program) return [];

    try {
      const teams = await program.account.teamAccount.all();
      
      // Add default logoUri for all teams and update cache
      return teams.map(team => {
        const teamAccount = {
          ...team.account,
          logoUri: ((team.account as any).logoUri as string) || '/images/placeholder-team-logo.png',
        };
        
        // Update cache
        addToCache(team.publicKey.toString(), teamAccount as TeamAccount);
        
        return {
          ...team,
          account: teamAccount
        };
      });
    } catch (error: any) {
      const isRateLimitError = error?.message?.includes('429') || error?.toString()?.includes('Too many requests');

      if (isRateLimitError) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        console.error('Error fetching all teams:', error);
      }
      return [];
    }
  }, [program, addToCache]);

  return {
    createTeam,
    addPlayerToTeam,
    checkTeamExists,
    removePlayerFromTeam,
    fetchTeamAccount,
    fetchUserTeams,
    fetchAllTeams,
    clearCache, // Expose the cache clearing function
    isLoading,
  };
}