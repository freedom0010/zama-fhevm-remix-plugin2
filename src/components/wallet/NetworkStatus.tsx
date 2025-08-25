import { useWallet, SEPOLIA_CHAIN_ID } from '../../hooks/useWallet';

export function NetworkStatus() {
  const { chainId, isConnected } = useWallet();

  const getNetworkName = (id: string | null) => {
    if (!id) return 'Unknown';

    switch (id.toLowerCase()) {
      case '0x1':
        return 'Ethereum Mainnet';
      case SEPOLIA_CHAIN_ID.toLowerCase():
        return 'Sepolia Testnet (FHEVM-ready)';
      case '0x89':
        return 'Polygon';
      case '0xa':
        return 'Optimism';
      default:
        return `Unknown (${id})`;
    }
  };

  const getStatusColor = (id: string | null) => {
    if (!isConnected) return 'bg-gray-500';
    return id?.toLowerCase() === SEPOLIA_CHAIN_ID.toLowerCase()
      ? 'bg-green-500'
      : 'bg-yellow-500';
  };

  const handleSwitchToSepolia = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (error: any) {
        // 如果链不存在，尝试添加
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Testnet (FHEVM-ready)',
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'SEP',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
          } catch (addError) {
            console.error('添加网络失败:', addError);
          }
        } else {
          console.error('切换网络失败:', error);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(chainId)}`} />
        <div>
          <h3 className="font-medium text-gray-800">网络状态</h3>
          <p className="text-sm text-gray-600">
            {isConnected ? getNetworkName(chainId) : '未连接'}
          </p>
          {chainId && (
            <p className="text-xs text-gray-500 font-mono">
              Chain ID: {chainId}
            </p>
          )}
        </div>
      </div>

      {isConnected &&
        chainId?.toLowerCase() !== SEPOLIA_CHAIN_ID.toLowerCase() && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <div className="flex items-center justify-between">
              <span>⚠️ 建议切换到 Sepolia 测试网以获得最佳 FHEVM 体验</span>
              <button
                onClick={handleSwitchToSepolia}
                className="ml-2 px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs font-medium transition-colors"
              >
                切换网络
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

// 扩展 Window 接口以包含 ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      removeListener: (event: string, callback: (data: any) => void) => void;
    };
  }
}
