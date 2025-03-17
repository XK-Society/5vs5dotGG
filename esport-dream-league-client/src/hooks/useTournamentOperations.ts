// src/hooks/useTournamentOperations.ts
'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProgram, findTournamentPDA } from '@/contexts/ProgramContextProvider';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from 'react-toastify';
import * as anchor from '@project-serum/anchor';
import { TeamAccount, TournamentAccount } from '@/types/account-types';

// Helper to add delay between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useTournamentOperations() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program } = useProgram();
  const [isLoading, setIsLoading] = useState(false);

  const createTournament = async (
    name: string,
    entryFee: number,
    startTime: number,
    maxTeams: number
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const [tournamentPDA] = findTournamentPDA(publicKey, name);
      
      const tx = await program.methods
        .createTournament(
          name, 
          new anchor.BN(entryFee), 
          new anchor.BN(startTime), 
          maxTeams
        )
        .accounts({
          authority: publicKey,
          tournamentAccount: tournamentPDA,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Tournament created successfully!');
      return tournamentPDA;
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registerTeamForTournament = async (
    tournamentPDA: PublicKey,
    teamPDA: PublicKey
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const tx = await program.methods
        .registerTeamForTournament(tournamentPDA, teamPDA)
        .accounts({
          teamOwner: publicKey,
          teamAccount: teamPDA,
          tournamentAccount: tournamentPDA,
          payer: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Team registered for tournament!');
      return true;
    } catch (error) {
      console.error('Error registering team for tournament:', error);
      toast.error('Failed to register team');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const recordMatchResult = async (
    tournamentPDA: PublicKey,
    matchId: string,
    winnerTeamPDA: PublicKey,
    loserTeamPDA: PublicKey,
    score: [number, number],
    matchData: Buffer
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const tx = await program.methods
        .recordMatchResult(
          matchId,
          winnerTeamPDA,
          loserTeamPDA,
          score,
          matchData
        )
        .accounts({
          authority: publicKey,
          tournamentAccount: tournamentPDA,
          winnerTeam: winnerTeamPDA,
          loserTeam: loserTeamPDA,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Match result recorded!');
      return true;
    } catch (error) {
      console.error('Error recording match result:', error);
      toast.error('Failed to record match result');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Improved tournament account fetching with exponential backoff retry
  const fetchTournamentAccount = async (tournamentPDA: PublicKey, retries = 3, initialDelay = 300): Promise<TournamentAccount | null> => {
    if (!program) return null;
    
    let currentRetry = 0;
    let delay = initialDelay;
    
    while (currentRetry <= retries) {
      try {
        if (!program.account || !program.account.tournamentAccount) {
          console.warn("Tournament account is not properly initialized in the program");
          return null;
        }
        
        const account = await program.account.tournamentAccount.fetch(tournamentPDA);
        return account as unknown as TournamentAccount;
      } catch (error: any) {
        // Check if the error is a 429 rate limit error
        const isRateLimitError = error?.message?.includes('429') || 
                                error?.toString()?.includes('429') ||
                                error?.toString()?.includes('Too many requests');
                                
        // If we've used all retries or it's not a rate limit error, throw
        if (currentRetry >= retries || !isRateLimitError) {
          console.error('Error fetching tournament account:', error);
          return null;
        }
        
        // Wait before retrying with exponential backoff
        console.log(`Rate limit hit, retrying after ${delay}ms... (${currentRetry + 1}/${retries})`);
        await sleep(delay);
        
        // Increase delay for next retry (exponential backoff)
        delay *= 2;
        currentRetry++;
      }
    }
    
    return null;
  };

  // Improved team account fetching with retry logic
  const fetchTeamAccount = async (teamPDA: PublicKey, retries = 3, initialDelay = 300): Promise<TeamAccount | null> => {
    if (!program) return null;
    
    let currentRetry = 0;
    let delay = initialDelay;
    
    while (currentRetry <= retries) {
      try {
        if (!program.account || !program.account.teamAccount) {
          console.warn("Team account is not properly initialized in the program");
          return null;
        }
        
        const account = await program.account.teamAccount.fetch(teamPDA);
        return account as unknown as TeamAccount;
      } catch (error: any) {
        // Check if the error is a 429 rate limit error
        const isRateLimitError = error?.message?.includes('429') || 
                                error?.toString()?.includes('429') ||
                                error?.toString()?.includes('Too many requests');
                                
        // If we've used all retries or it's not a rate limit error, throw
        if (currentRetry >= retries || !isRateLimitError) {
          console.error('Error fetching team account:', error);
          return null;
        }
        
        // Wait before retrying with exponential backoff
        console.log(`Rate limit hit, retrying after ${delay}ms... (${currentRetry + 1}/${retries})`);
        await sleep(delay);
        
        // Increase delay for next retry (exponential backoff)
        delay *= 2;
        currentRetry++;
      }
    }
    
    return null;
  };

  // Improved fetchAllTournaments with caching and retry logic
  const fetchAllTournaments = async (retries = 3, initialDelay = 500) => {
    if (!program) return [];
    
    let currentRetry = 0;
    let delay = initialDelay;
    
    while (currentRetry <= retries) {
      try {
        if (!program.account || !program.account.tournamentAccount) {
          console.warn("Tournament account is not properly initialized in the program");
          return [];
        }
        
        const tournaments = await program.account.tournamentAccount.all();
        return tournaments || [];
      } catch (error: any) {
        // Check if the error is a 429 rate limit error
        const isRateLimitError = error?.message?.includes('429') || 
                                error?.toString()?.includes('429') ||
                                error?.toString()?.includes('Too many requests');
                                
        // If we've used all retries or it's not a rate limit error, throw
        if (currentRetry >= retries || !isRateLimitError) {
          console.error('Error fetching all tournaments:', error);
          return [];
        }
        
        // Wait before retrying with exponential backoff
        console.log(`Rate limit hit when fetching tournaments, retrying after ${delay}ms... (${currentRetry + 1}/${retries})`);
        await sleep(delay);
        
        // Increase delay for next retry (exponential backoff)
        delay *= 2;
        currentRetry++;
      }
    }
    
    return [];
  };

  // Add this function to fix the missing getStatusString error
  const getStatusString = (statusEnum: any) => {
    if (!statusEnum) return 'Registration';
    
    const statusMap = [
      'Registration',
      'In Progress',
      'Completed',
      'Canceled'
    ];
    
    return statusMap[statusEnum] || 'Unknown';
  };

  return {
    fetchTeamAccount,
    createTournament,
    registerTeamForTournament,
    recordMatchResult,
    fetchTournamentAccount,
    fetchAllTournaments,
    getStatusString,
    isLoading,
  };
}