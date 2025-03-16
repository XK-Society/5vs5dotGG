'use client';

import { FC, ReactNode, createContext, useContext, useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { EsportsManager, IDL } from '../types/esports-manager';

// Program ID from your deployed contract
export const PROGRAM_ID = new PublicKey("2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ");

// Helper functions to find PDAs
export const findPlayerPDA = (mintPublicKey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('player'), mintPublicKey.toBuffer()],
    PROGRAM_ID
  );
};

export const findTeamPDA = (ownerPublicKey: PublicKey, teamName: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('team'), ownerPublicKey.toBuffer(), Buffer.from(teamName)],
    PROGRAM_ID
  );
};

export const findCreatorPDA = (authorityPublicKey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('creator'), authorityPublicKey.toBuffer()],
    PROGRAM_ID
  );
};

export const findTournamentPDA = (authorityPublicKey: PublicKey, tournamentName: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('tournament'), authorityPublicKey.toBuffer(), Buffer.from(tournamentName)],
    PROGRAM_ID
  );
};

// Create Program Context
type ProgramContextType = {
  program: Program<EsportsManager> | null;
  provider: AnchorProvider | null;
  isConnected: boolean;
};

const ProgramContext = createContext<ProgramContextType>({
  program: null,
  provider: null,
  isConnected: false,
});

export const useProgram = () => useContext(ProgramContext);

// Program Provider Component
interface ProgramProviderProps {
  children: ReactNode;
}

export const ProgramProvider: FC<ProgramProviderProps> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const { program, provider, isConnected } = useMemo(() => {
    if (!wallet) {
      return {
        program: null,
        provider: null,
        isConnected: false,
      };
    }

    // Create the provider
    const provider = new AnchorProvider(
      connection,
      wallet,
      { preflightCommitment: 'processed' }
    );

    // Create the program
    const program = new Program<EsportsManager>(
      IDL,
      PROGRAM_ID,
      provider
    );

    return {
      program,
      provider,
      isConnected: true,
    };
  }, [connection, wallet]);

  return (
    <ProgramContext.Provider value={{ program, provider, isConnected }}>
      {children}
    </ProgramContext.Provider>
  );
};