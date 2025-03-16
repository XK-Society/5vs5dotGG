'use client';

import { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletConnectButton: FC = () => {
  return (
    <div className="flex justify-end p-4">
      <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-700 text-white font-bold py-2 px-4 rounded" />
    </div>
  );
};