import React, { useState } from 'react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { SuccessMessage } from '../common/SuccessMessage';

export function TokenTransfer() {
  const { transfer, loadContract, tokenInfo, isLoading, error } = useTokenContract();
  const [contractAddress, setContractAddress] = useState('');
  const [formData, setFormData] = useState({
    to: '',
    amount: ''
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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to || !formData.amount || !tokenInfo) return;

    try {
      const hash = await transfer(formData.to, formData.amount);
      setTxHash(hash);
      setFormData({ to: '', amount: '' });
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Token Transfer</h2>
      
      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}
      
      {txHash && (
        <SuccessMessage
          message={`Transfer successful! Tx: ${txHash}`}
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

        {tokenInfo && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Ready to transfer <strong>{tokenInfo.symbol}</strong>
            </p>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
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
              Amount
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!tokenInfo || isLoading || !formData.to || !formData.amount}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium ${
              !tokenInfo || isLoading || !formData.to || !formData.amount
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Transferring...
              </>
            ) : (
              'Transfer'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}