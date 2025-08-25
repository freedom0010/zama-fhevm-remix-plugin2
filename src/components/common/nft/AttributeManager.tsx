import React, { useState } from 'react';
import { useNFTContract } from '../../hooks/useNFTContract';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { SuccessMessage } from '../common/SuccessMessage';

export function NFTMint() {
  const { mint, loadContract, nftInfo, isLoading, error } = useNFTContract();
  const [contractAddress, setContractAddress] = useState('');
  const [formData, setFormData] = useState({
    to: '',
    tokenURI: ''
  });
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleLoadContract = async () => {
    if (!contractAddress) return;
    try {
      await loadContract(contractAddress);
    } catch (err) {
      console.error('Failed to load contract:', err);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to || !formData.tokenURI || !nftInfo) return;

    try {
      const hash = await mint(formData.to, formData.tokenURI);
      setTxHash(hash);
      setFormData({ to: '', tokenURI: '' });
    } catch (err) {
      console.error('Mint failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Mint NFT</h2>
      
      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}
      
      {txHash && (
        <SuccessMessage
          message={`NFT minted successfully! Tx: ${txHash}`}
          onClose={() => setTxHash(null)}
          className="mb-4"
        />
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

        {nftInfo && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Ready to mint <strong>{nftInfo.name}</strong> ({nftInfo.symbol})
            </p>
          </div>
        )}

        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Address
            </label>
            <input
              type="text"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token URI
            </label>
            <input
              type="text"
              value={formData.tokenURI}
              onChange={(e) => setFormData(prev => ({ ...prev, tokenURI: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring