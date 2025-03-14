// src/providers/WalletProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type WalletContextType = {
  publicKey: string | null;
  connecting: boolean;
  connected: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  walletName: string | null;
  loading: boolean;
};

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  connecting: false,
  connected: false,
  connectWallet: async () => {},
  disconnect: () => {},
  walletName: null,
  loading: false,
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [walletName, setWalletName] = useState<string | null>(null);

  // Get a reference to the wallet adapter (Backpack, Phantom, Solflare)
  const getWallet = () => {
    if (typeof window === 'undefined') return null;

    // Try different wallet adapters in order of preference
    return (
      (window as any).backpack || 
      (window as any).phantom?.solana || 
      (window as any).solflare || 
      (window as any).solana // Generic adapter used by some wallets
    );
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        setLoading(true);
        const wallet = getWallet();
        
        if (wallet) {
          // For wallets with isConnected property
          if (wallet.isConnected) {
            const address = wallet.publicKey?.toString();
            if (address) {
              setPublicKey(address);
              setConnected(true);
              
              // Try to get the wallet name
              if ((window as any).backpack) {
                setWalletName('Backpack');
              } else if ((window as any).phantom?.solana) {
                setWalletName('Phantom');
              } else if ((window as any).solflare) {
                setWalletName('Solflare');
              } else {
                setWalletName('Solana Wallet');
              }
            }
          } 
          // For wallets with connected property
          else if (wallet.connected) {
            const address = wallet.publicKey?.toString();
            if (address) {
              setPublicKey(address);
              setConnected(true);
              
              // Try to get wallet name
              if ((window as any).backpack) {
                setWalletName('Backpack');
              } else if ((window as any).phantom?.solana) {
                setWalletName('Phantom');
              } else if ((window as any).solflare) {
                setWalletName('Solflare');
              } else {
                setWalletName('Solana Wallet');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setLoading(false);
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setConnecting(true);
      const wallet = getWallet();
      
      if (!wallet) {
        alert("Please install a Solana wallet like Backpack, Phantom, or Solflare");
        return;
      }
      
      // Different wallets have different connection methods
      if (wallet.connect) {
        await wallet.connect();
      } else if (wallet.isSolana && wallet.connect) {
        await wallet.connect();
      } else {
        await wallet.connect({ onlyIfTrusted: false });
      }
      
      const address = wallet.publicKey?.toString();
      
      if (address) {
        setPublicKey(address);
        setConnected(true);
        
        // Set wallet name
        if ((window as any).backpack) {
          setWalletName('Backpack');
        } else if ((window as any).phantom?.solana) {
          setWalletName('Phantom');
        } else if ((window as any).solflare) {
          setWalletName('Solflare');
        } else {
          setWalletName('Solana Wallet');
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert(`Error connecting wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    try {
      const wallet = getWallet();
      if (wallet && wallet.disconnect) {
        wallet.disconnect();
      }
      setPublicKey(null);
      setConnected(false);
      setWalletName(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connecting,
        connected,
        connectWallet,
        disconnect,
        walletName,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}