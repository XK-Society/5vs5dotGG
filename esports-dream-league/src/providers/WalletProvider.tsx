'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateKeyPair } from '@solana/kit';

// Define the type correctly
type WalletContextType = {
  keypair: any | null; // Replace 'any' with the correct type when fixed
  publicKey: string | null;
  connecting: boolean;
  connected: boolean;
  createNewWallet: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
};

const WalletContext = createContext<WalletContextType>({
  keypair: null,
  publicKey: null,
  connecting: false,
  connected: false,
  createNewWallet: async () => {},
  disconnect: () => {},
  loading: false,
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [keypair, setKeypair] = useState<any | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
      } catch (error) {
        console.error('Error initializing wallet:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const createNewWallet = async () => {
    try {
      setConnecting(true);
      // Generate a new keypair
      const newKeypair = await generateKeyPair();
      setKeypair(newKeypair);
      
      // Convert the public key to a string
      // In a real implementation, you'd use getAddressFromPublicKey
      setPublicKey(newKeypair.publicKey.toString());
      setConnected(true);
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setKeypair(null);
    setPublicKey(null);
    setConnected(false);
  };

  return (
    <WalletContext.Provider
      value={{
        keypair,
        publicKey,
        connecting,
        connected,
        createNewWallet,
        disconnect,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}