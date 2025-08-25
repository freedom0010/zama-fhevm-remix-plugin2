// src/components/wallet/NetworkSwitch.tsx
import { useState } from 'react';
import { useWallet, SEPOLIA_CHAIN_ID } from '../../hooks/useWallet';

export function NetworkSwitch() {
  const { chainId, isConnected, switchNetwork } = useWallet();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchToSepolia = async () => {
    setIsSwitching(true);
    try {
      await switchNetwork(SEPOLIA_CHAIN_ID);
    } catch (error) {
      console.error('Switch network error:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const isOnSepolia = chainId?.toLowerCase() === SEPOLIA_CHAIN_ID.toLowerCase();

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        请先连接钱包
      </div>
    );
  }

  if (isOnSepolia) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-green-800 font-medium">
            已连接到 Sepolia 测试网
          </span>
        </div>
        <p className="text-sm text-green-600 mt-1">
          网络配置正确，可以使用 FHEVM 功能
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-medium text-gray-800 mb-3">网络切换</h3>
      <p className="text-sm text-gray-600 mb-4">
        当前网络不是 Sepolia 测试网，建议切换以获得最佳体验
      </p>
      
      <button
        onClick={handleSwitchToSepolia}
        disabled={isSwitching}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isSwitching ? '切换中...' : '切换到 Sepolia'}
      </button>
    </div>
  );
}