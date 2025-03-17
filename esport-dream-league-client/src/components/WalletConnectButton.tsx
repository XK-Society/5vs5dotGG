'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with ssr: false
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { 
    ssr: false,
    loading: () => (
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">
        Loading Wallet...
      </button>
    )
  }
);

export const WalletConnectButton = () => {
  return (
    <div className="flex justify-end p-4">
      <WalletMultiButtonDynamic className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
    </div>
  );
};

export default WalletConnectButton;