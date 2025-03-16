'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useProgram, findTournamentPDA } from '@/contexts/ProgramContextProvider';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { toast } from 'react-toastify';
import * as anchor from '@project-serum/anchor';

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

  const fetchTournamentAccount = async (tournamentPDA: PublicKey) => {
    if (!program) return null;
    
    try {
      return await program.account.TournamentAccount.fetch(tournamentPDA);
    } catch (error) {
      console.error('Error fetching tournament account:', error);
      return null;
    }
  };

  const fetchAllTournaments = async () => {
    if (!program) return [];
    
    try {
      return await program.account.TournamentAccount.all();
    } catch (error) {
      console.error('Error fetching all tournaments:', error);
      return [];
    }
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
    createTournament,
    registerTeamForTournament,
    recordMatchResult,
    fetchTournamentAccount,
    fetchAllTournaments,
    getStatusString,
    isLoading,
  };
}