// src/components/token/TokenList.tsx
import React, { useState, useEffect } from 'react';
import { TokenBalance } from './TokenBalance';
import { TokenTransfer } from './TokenTransfer';

interface DeployedToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  deployedAt: number;
}

export function TokenList() {
  const [tokens, setTokens] = useState<DeployedToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'balance' | 'transfer'>('balance');

  useEffect(() => {
    const loadTokens = () => {
      try {
        const stored = localStorage.getItem('deployed-tokens');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTokens(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Failed to load tokens:', error);
      }
    };

    loadTokens();
    // 监听存储变化（如果在其他组件中添加了新token）
    const handleStorageChange = () => loadTokens();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRemoveToken = (address: string) => {
    if (!confirm('确定要从列表中移除此 Token 吗？（不会影响链上合约）')) {
      return;
    }

    const updatedTokens = tokens.filter(token => token.address !== address);
    setTokens(updatedTokens);
    localStorage.setItem('deployed-tokens', JSON.stringify(updatedTokens));
    
    if (selectedToken === address) {
      setSelectedToken(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">已部署的 Token 合约</h2>
          <span className="text-sm text-gray-600">共 {tokens.length} 个合约</span>
        </div>

        {tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p>暂无已部署的 Token 合约</p>
            <p className="text-sm mt-2">部署新合约后会自动显示在这里</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div key={token.address} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-800">{token.name}</h3>
                      <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-gray-500">
                        {token.decimals} 位小数
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">合约地址:</span>
                        <span className="ml-2 font-mono">{formatAddress(token.address)}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(token.address)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          复制
                        </button>
                      </p>
                      <p>
                        <span className="font-medium">部署时间:</span>
                        <span className="ml-2">{formatDate(token.deployedAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedToken(selectedToken === token.address ? null : token.address)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        selectedToken === token.address
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedToken === token.address ? '收起' : '管理'}
                    </button>
                    <button
                      onClick={() => handleRemoveToken(token.address)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                    >
                      移除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Token 操作面板 */}
      {selectedToken && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Token 操作</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'balance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                余额查询
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'transfer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                转账
              </button>
            </div>
          </div>

          {activeTab === 'balance' && <TokenBalance contractAddress={selectedToken} />}
          {activeTab === 'transfer' && <TokenTransfer contractAddress={selectedToken} />}
        </div>
      )}
    </div>
  );
}