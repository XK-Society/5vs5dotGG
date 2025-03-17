'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProgram, findTeamPDA, findPlayerPDA } from '@/contexts/ProgramContextProvider';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from 'react-toastify';

export function useTeamOperations() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const {   program } = useProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
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

  const fetchTeamAccount = async (teamPDA: PublicKey) => {
    if (!program) return null;
    
    try {
      return await program.account.teamAccount.fetch(teamPDA);
    } catch (error) {
      console.error('Error fetching team account:', error);
      return null;
    }
  };

  const fetchUserTeams = async () => {
    if (!program || !publicKey) {
      console.log("No program or publicKey available");
      return [];
    }
    
    try {
      // Check if the program account exists
      if (!program.account || !program.account.teamAccount) {
        console.warn("Team account is not properly initialized in the program");
        return [];
      }
      
      console.log("Fetching teams for wallet:", publicKey.toString());
      
      // This will fetch all team accounts filtered by owner
      const teams = await program.account.teamAccount.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: publicKey.toBase58(),
          },
        },
      ]);
      
      console.log("Fetched teams:", teams.length, teams);
      return teams;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }
  };

  const fetchAllTeams = async () => {
    if (!program) return [];
    
    try {
      return await program.account.teamAccount.all();
    } catch (error) {
      console.error('Error fetching all teams:', error);
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