// src/components/WalletConnectButton.tsx
import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const WalletConnectButton = () => {
  return (
    <div className="flex justify-end p-4">
      <WalletMultiButtonDynamic className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
    </div>
  );
};