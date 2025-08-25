// src/components/wallet/WalletConnect.tsx
import React from 'react';
import { useWallet } from '../../hooks/useWallet';

export function WalletConnect() {
  const { account, isConnected, isConnecting, connect, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">钱包连接</h2>
      
      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">连接您的钱包以开始使用 FHEVM 功能</p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isConnecting ? '连接中...' : '连接 MetaMask'}
          </button>
          {!window.ethereum && (
            <p className="text-sm text-red-600">
              请先安装 MetaMask 浏览器扩展
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">已连接账户:</span>
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
              {formatAddress(account!)}
            </span>
          </div>
          
          <button
            onClick={disconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            断开连接
          </button>
        </div>
      )}
    </div>
  );
}