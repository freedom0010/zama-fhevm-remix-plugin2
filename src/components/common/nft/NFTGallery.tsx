// src/components/nft/NFTGallery.tsx
import React, { useState } from 'react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

export function TokenBalance() {
  const { getBalance, loadContract, tokenInfo, isLoading, error } = useTokenContract();
  const [contractAddress, setContractAddress] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleLoadContract = async () => {
    if (!contractAddress) return;
    try {
      await loadContract(contractAddress);
    } catch (err) {
      console.error('Failed to load contract:', err);
    }
  };

  const handleGetBalance = async () => {
    if (!userAddress || !tokenInfo) return;
    
    setIsQuerying(true);
    try {
      const bal = await getBalance(userAddress);
      setBalance(bal);
    } catch (err) {
      console.error('Failed to get balance:', err);
      setBalance(null);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Token Balance</h2>
      
      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contract Address
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
            />
            <button
              onClick={handleLoadContract}
              disabled={!contractAddress || isLoading}
              className={`px-4 py-2 rounded-md font-medium ${
                !contractAddress || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Load'}
            </button>
          </div>
        </div>

        {tokenInfo && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>{tokenInfo.name}</strong> ({tokenInfo.symbol}) - {tokenInfo.decimals} decimals
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Address
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
            />
            <button
              onClick={handleGetBalance}
              disabled={!userAddress || !tokenInfo || isQuerying}
              className={`px-4 py-2 rounded-md font-medium ${
                !userAddress || !tokenInfo || isQuerying
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isQuerying ? <LoadingSpinner size="sm" /> : 'Get Balance'}
            </button>
          </div>
        </div>

        {balance !== null && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">
              Balance: <strong>{balance} {tokenInfo?.symbol}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}