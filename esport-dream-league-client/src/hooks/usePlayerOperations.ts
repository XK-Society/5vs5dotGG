import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProgram, findPlayerPDA } from '@/contexts/ProgramContextProvider';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from 'react-toastify';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TrainingType } from '@/types/program-types';

export function usePlayerOperations() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program } = useProgram();
  const [isLoading, setIsLoading] = useState(false);

  const initializePlayer = async (
    mintPublicKey: PublicKey,
    name: string,
    position: string,
    uri: string
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const [playerPDA] = findPlayerPDA(mintPublicKey);
      
      const gameSpecificData = Buffer.from([]);
      
      const tx = await program.methods
        .initializePlayer(name, position, gameSpecificData, uri)
        .accounts({
          owner: publicKey,
          mint: mintPublicKey,
          playerAccount: playerPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Player initialized successfully!');
      return playerPDA;
    } catch (error) {
      console.error('Error initializing player:', error);
      toast.error('Failed to initialize player');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlayerPerformance = async (
    playerPDA: PublicKey,
    matchId: string,
    win: boolean,
    mvp: boolean,
    expGained: number,
    mechanicalChange: number,
    gameKnowledgeChange: number,
    teamCommunicationChange: number,
    adaptabilityChange: number,
    consistencyChange: number,
    formChange: number
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const matchStats = Buffer.from([]);
      
      const tx = await program.methods
        .updatePlayerPerformance(
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
        )
        .accounts({
          owner: publicKey,
          playerAccount: playerPDA,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Player performance updated!');
      return true;
    } catch (error) {
      console.error('Error updating player performance:', error);
      toast.error('Failed to update player performance');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const trainPlayer = async (
    playerPDA: PublicKey,
    trainingType: TrainingType,
    intensity: number
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const tx = await program.methods
        .trainPlayer(trainingType, intensity)
        .accounts({
          owner: publicKey,
          playerAccount: playerPDA,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Player training completed!');
      return true;
    } catch (error) {
      console.error('Error training player:', error);
      toast.error('Failed to train player');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialAbility = async (
    playerPDA: PublicKey,
    abilityName: string,
    abilityValue: number
  ) => {
    if (!program || !publicKey) return;
    
    setIsLoading(true);
    
    try {
      const tx = await program.methods
        .addSpecialAbility(abilityName, abilityValue)
        .accounts({
          owner: publicKey,
          playerAccount: playerPDA,
        })
        .transaction();
      
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Special ability added!');
      return true;
    } catch (error) {
      console.error('Error adding special ability:', error);
      toast.error('Failed to add special ability');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayerAccount = async (playerPDA: PublicKey) => {
    if (!program) return null;
    
    try {
      return await program.account.PlayerAccount.fetch(playerPDA);
    } catch (error) {
      console.error('Error fetching player account:', error);
      return null;
    }
  };

  return {
    initializePlayer,
    updatePlayerPerformance,
    trainPlayer,
    addSpecialAbility,
    fetchPlayerAccount,
    isLoading,
  };
}