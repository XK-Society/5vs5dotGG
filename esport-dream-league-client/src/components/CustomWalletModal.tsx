// src/components/CustomWalletModal.tsx
'use client';

import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export const CustomWalletModal: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { wallets, select } = useWallet();
  
  // Listen for the modal trigger click
  useEffect(() => {
    const handler = () => setIsOpen(true);
    document.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('wallet-adapter-modal-trigger')) {
        handler();
      }
    });
    return () => document.removeEventListener('click', handler);
  }, []);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Connect Wallet</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => {
                select(wallet.adapter.name);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              {wallet.adapter.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};