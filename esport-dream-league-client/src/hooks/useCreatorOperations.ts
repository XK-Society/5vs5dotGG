'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProgram, findCreatorPDA, findPlayerPDA } from '@/contexts/ProgramContextProvider';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PlayerStats } from '@/types/program-types';
import * as anchor from '@project-serum/anchor';

export function useCreatorOperations() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program } = useProgram();
  const [isLoading, setIsLoading] = useState(false);

  const registerCreator = async (name: string, feeBasisPoints: number) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const [creatorPDA] = findCreatorPDA(publicKey);
      
      const tx = await program.methods
        .registerCreator(name, feeBasisPoints)
        .accounts({
          authority: publicKey,
          creatorAccount: creatorPDA,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Creator registered successfully!');
      return creatorPDA;
    } catch (error) {
      console.error('Error registering creator:', error);
      toast.error('Failed to register creator');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCreator = async (adminKeypair: any, creatorPDA: PublicKey) => {
    if (!program) return;
    
    setIsLoading(true);
    
    try {
      // NOTE: This function requires admin privileges and typically would be done through a backend service
      // We're including it for completeness, but it should be implemented on a trusted server
      const tx = await program.methods
        .verifyCreator()
        .accounts({
          admin: adminKeypair.publicKey,
          creatorAccount: creatorPDA,
        })
        .transaction();
      
      // In a real application, this would be signed by the admin on a backend
      // This is just for demonstration purposes
      toast.warning('Creator verification requires admin privileges');
      return false;
      
    } catch (error) {
      console.error('Error verifying creator:', error);
      toast.error('Failed to verify creator');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createExclusiveAthlete = async (
    mintPublicKey: PublicKey,
    name: string,
    position: string,
    uri: string,
    predefinedStats?: PlayerStats,
    collectionId?: PublicKey,
    maxEditions?: number
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const [creatorPDA] = findCreatorPDA(publicKey);
      const [playerPDA] = findPlayerPDA(mintPublicKey);
      
      const tx = await program.methods
        .createExclusiveAthlete(
          name,
          position,
          uri,
          predefinedStats || null,
          collectionId || null,
          maxEditions ? new anchor.BN(maxEditions) : null
        )
        .accounts({
          creator: publicKey,
          creatorAccount: creatorPDA,
          mint: mintPublicKey,
          playerAccount: playerPDA,
          payer: publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Exclusive athlete created successfully!');
      return playerPDA;
    } catch (error) {
      console.error('Error creating exclusive athlete:', error);
      toast.error('Failed to create exclusive athlete');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreatorAccount = async (creatorPDA: PublicKey) => {
    if (!program) return null;
    
    try {
      return await program.account.CreatorAccount.fetch(creatorPDA);
    } catch (error) {
      console.error('Error fetching creator account:', error);
      return null;
    }
  };

  return {
    registerCreator,
    verifyCreator,
    createExclusiveAthlete,
    fetchCreatorAccount,
    isLoading,
  };
}