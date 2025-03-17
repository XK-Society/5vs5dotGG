'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with ssr: false
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

// Use a placeholder button for SSR
const WalletConnectButtonSSR = () => {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Connect Wallet
    </button>
  );
};

// Export the client-side only component
export const WalletConnectButton = () => {
  return (
    <div className="flex justify-end p-4">
      <WalletMultiButtonDynamic className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
    </div>
  );
};

// Export the SSR-compatible placeholder for direct imports
export default WalletConnectButtonSSR;