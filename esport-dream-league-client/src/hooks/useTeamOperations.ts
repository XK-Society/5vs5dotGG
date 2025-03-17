'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProgram, findTeamPDA, findPlayerPDA } from '@/contexts/ProgramContextProvider';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { TeamAccount } from '@/types/program-types';

// Helper to add delay between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useTeamOperations() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program } = useProgram();
  const [isLoading, setIsLoading] = useState(false);

  const createTeam = async (name: string, logoUri: string) => {
    if (!program || !publicKey) return;

    setIsLoading(true);

    try {
      const [teamPDA] = findTeamPDA(publicKey, name);

      const tx = await program.methods
        .createTeam(name, logoUri)
        .accounts({
          owner: publicKey,
          teamAccount: teamPDA,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      toast.success('Team created successfully!');
      return teamPDA;
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
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

  // Improved Team Account Fetching with Exponential Backoff
  const fetchTeamAccount = async (teamPDA: PublicKey, retries = 3, initialDelay = 300): Promise<TeamAccount | null> => {
    if (!program) return null;
  
    let currentRetry = 0;
    let delay = initialDelay;
  
    while (currentRetry <= retries) {
      try {
        const rawAccount = await program.account.teamAccount.fetch(teamPDA);
        
        // Explicitly cast and ensure logoUri
        return {
          ...rawAccount,
          publicKey: teamPDA,
          logoUri: rawAccount.logoUri || '/placeholder-team-logo.png',
        } as TeamAccount;
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
  };

  // ✅ Improved fetchUserTeams function to prevent infinite re-fetching
  const fetchUserTeams = async (): Promise<{
    publicKey: PublicKey;
    account: TeamAccount;
  }[]> => {
    if (!program || !publicKey) return [];

    try {
      console.log("Fetching teams for wallet:", publicKey.toString());

      const teams = await program.account.teamAccount.all([
        {
          memcmp: {
            offset: 8, // Skip Anchor discriminator
            bytes: publicKey.toBase58(),
          },
        },
      ]);

      console.log("Fetched teams:", teams.length);

      // Map teams to ensure type safety and provide default logo
      return teams.map((team) => ({
        publicKey: team.publicKey,
        account: {
          ...team.account,
          logoUri: team.account.logoUri || '/placeholder-team-logo.png',
        } as TeamAccount
      }));
    } catch (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }
  };


  const fetchAllTeams = async () => {
    if (!program) return [];

    try {
      return await program.account.teamAccount.all();
    } catch (error: any) {
      const isRateLimitError = error?.message?.includes('429') || error?.toString()?.includes('Too many requests');

      if (isRateLimitError) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        console.error('Error fetching all teams:', error);
      }
      return [];
    }
  };

  return {
    createTeam,
    addPlayerToTeam,
    removePlayerFromTeam,
    fetchTeamAccount,
    fetchUserTeams,
    fetchAllTeams,
    isLoading,
  };
}
