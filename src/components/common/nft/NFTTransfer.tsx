import React, { useState, useEffect } from 'react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface DeployedToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  deployedAt: number;
}

export function TokenList() {
  const [tokens, setTokens] = useState<DeployedToken[]>([]);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    const saved = JSON.parse(localStorage.getItem('deployed-tokens') || '[]');
    setTokens(saved);
  };

  const handleDelete = (address: string) => {
    const updated = tokens.filter(token => token.address !== address);
    setTokens(updated);
    localStorage.setItem('deployed-tokens', JSON.stringify(updated));
    setDeleteToken(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Deployed Tokens</h2>
        <button
          onClick={loadTokens}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {tokens.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tokens deployed yet</p>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.address}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {token.name} ({token.symbol})
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500 font-mono">
                      {formatAddress(token.address)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(token.address)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Deployed: {new Date(token.deployedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Decimals: {token.decimals}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteToken(token.address)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteToken !== null}
        title="Remove Token"
        message="Are you sure you want to remove this token from the list? This won't affect the deployed contract."
        confirmText="Remove"
        onConfirm={() => deleteToken && handleDelete(deleteToken)}
        onCancel={() => setDeleteToken(null)}
        isDestructive
      />
    </div>
  );
}