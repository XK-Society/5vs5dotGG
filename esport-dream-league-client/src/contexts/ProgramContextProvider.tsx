'use client';

import { FC, ReactNode, createContext, useContext, useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { IDL } from '../types/esports-manager';
import { solanaConnection } from '@/services/connection-service';

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
  program: Program<any> | null;
  provider: AnchorProvider | null;
  isConnected: boolean;
  clearCache: () => void;
};

const ProgramContext = createContext<ProgramContextType>({
  program: null,
  provider: null,
  isConnected: false,
  clearCache: () => {},
});

export const useProgram = () => useContext(ProgramContext);

// Program Provider Component
interface ProgramProviderProps {
  children: ReactNode;
}

export const ProgramProvider: FC<ProgramProviderProps> = ({ children }) => {
  const { connection } = useConnection(); // Keep this for compatibility
  const wallet = useAnchorWallet();
  
  // Use the enhanced connection service instead of the default connection
  const enhancedConnection = solanaConnection.getConnection();

  const { program, provider, isConnected } = useMemo(() => {
    if (!wallet) {
      return {
        program: null,
        provider: null,
        isConnected: false,
      };
    }
  
    try {
      // Create the provider with enhanced connection
      const provider = new AnchorProvider(
        enhancedConnection,
        wallet,
        { preflightCommitment: 'processed' }
      );
  
      // Create the program
      const program = new Program(
        IDL,
        PROGRAM_ID,
        provider
      );
  
      return {
        program,
        provider,
        isConnected: true,
      };
    } catch (error) {
      console.error("Error creating Anchor program:", error);
      return {
        program: null,
        provider: null,
        isConnected: false,
      };
    }
  }, [enhancedConnection, wallet]);
  
  // Function to clear the connection service cache
  const clearCache = () => {
    solanaConnection.clearCache();
  };

  return (
    <ProgramContext.Provider value={{ program, provider, isConnected, clearCache }}>
      {children}
    </ProgramContext.Provider>
  );
};