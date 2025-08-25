// src/components/token/TokenBalance.tsx
import React, { useState } from 'react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface TokenBalanceProps {
  contractAddress?: string;
}

export function TokenBalance({ contractAddress }: TokenBalanceProps) {
  const { balanceOf, tokenInfo, isLoading, error, clearError } = useTokenContract(contractAddress);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<{ balance: string; formatted: string } | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsQuerying(true);
    clearError();
    
    try {
      const result = await balanceOf(address.trim());
      setBalance(result);
    } catch (err) {
      console.error('Balance query error:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Token 余额查询</h3>
      
      {tokenInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            查询合约: {tokenInfo.name} ({tokenInfo.symbol})
          </p>
          <p className="text-xs text-blue-600 font-mono">
            {formatAddress(tokenInfo.address)}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorMessage error={error} onClose={clearError} />
        </div>
      )}

      <form onSubmit={handleQuery} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            查询地址
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="输入钱包地址 (0x...)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!address.trim() || isQuerying || !contractAddress}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isQuerying ? <LoadingSpinner size="sm" message="查询中..." /> : '🔍 查询余额'}
        </button>
      </form>

      {balance && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">余额查询结果</p>
              <p className="text-xs text-green-600">
                地址: {formatAddress(address)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-900">
                {balance.formatted} {tokenInfo?.symbol || 'TOKEN'}
              </p>
              <p className="text-xs text-green-600 font-mono">
                原始值: {balance.balance}
              </p>
            </div>
          </div>
        </div>
      )}

      {!contractAddress && (
        <div className="mt-4 text-center text-gray-500">
          <p className="text-sm">请先选择或部署一个 Token 合约</p>
        </div>
      )}
    </div>
  );
}