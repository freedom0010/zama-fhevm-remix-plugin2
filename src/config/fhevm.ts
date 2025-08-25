import type { NetworkConfig } from '@/types/network'

/**
 * FHEVM 网络配置
 */
export const FHEVM_NETWORKS: Record<string, NetworkConfig> = {
  // Zama Devnet (主要测试网络)
  zamaDevnet: {
    name: 'Zama Devnet',
    chainId: '0x1F51', // 8017 in hex
    chainIdNumber: 8017,
    rpcUrl: 'https://devnet.zama.ai',
    blockExplorer: 'https://main.explorer.zama.ai',
    nativeCurrency: {
      name: 'ZAMA',
      symbol: 'ZAMA',
      decimals: 18
    },
    fhevmConfig: {
      gatewayUrl: 'https://gateway.devnet.zama.ai',
      aclAddress: '0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92',
      kmsVerifierAddress: '0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c',
      inputVerifierAddress: '0x49a1223a1270a735c6ae4110E948e2734C11b9e7'
    },
    isTestnet: true,
    isSupported: true
  },

  // Sepolia FHEVM (如果存在)
  sepoliaFhevm: {
    name: 'Sepolia FHEVM',
    chainId: '0xAA36A7', // 11155111 in hex (Sepolia)
    chainIdNumber: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // 需要替换
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SepoliaETH',
      decimals: 18
    },
    fhevmConfig: {
      gatewayUrl: 'https://gateway.sepolia.zama.ai',
      aclAddress: '0x0000000000000000000000000000000000000000', // 待配置
      kmsVerifierAddress: '0x0000000000000000000000000000000000000000', // 待配置
      inputVerifierAddress: '0x0000000000000000000000000000000000000000' // 待配置
    },
    isTestnet: true,
    isSupported: false // 暂不支持，待 Zama 官方发布
  },

  // 本地开发网络
  localFhevm: {
    name: 'Local FHEVM',
    chainId: '0x1F90', // 8080 in hex
    chainIdNumber: 8080,
    rpcUrl: 'http://localhost:8545',
    blockExplorer: '',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    fhevmConfig: {
      gatewayUrl: 'http://localhost:7077',
      aclAddress: '0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92',
      kmsVerifierAddress: '0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c',
      inputVerifierAddress: '0x49a1223a1270a735c6ae4110E948e2734C11b9e7'
    },
    isTestnet: true,
    isSupported: true
  }
}

/**
 * 默认网络配置
 */
export const DEFAULT_NETWORK = FHEVM_NETWORKS.zamaDevnet

/**
 * 支持的网络列表
 */
export const SUPPORTED_NETWORKS = Object.values(FHEVM_NETWORKS).filter(
  network => network.isSupported
)

/**
 * FHEVM 相关常量
 */
export const FHEVM_CONSTANTS = {
  // 加密类型
  ENCRYPTION_TYPES: {
    BOOL: 'ebool',
    UINT4: 'euint4',
    UINT8: 'euint8',
    UINT16: 'euint16',
    UINT32: 'euint32',
    UINT64: 'euint64',
    UINT128: 'euint128',
    UINT256: 'euint256',
    ADDRESS: 'eaddress',
    BYTES64: 'ebytes64',
    BYTES128: 'ebytes128',
    BYTES256: 'ebytes256'
  },

  // 网关超时时间
  GATEWAY_TIMEOUT: 30000, // 30 seconds

  // 重试配置
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2
  },

  // 缓存配置
  CACHE_CONFIG: {
    publicKeyTTL: 1000 * 60 * 60, // 1 hour
    networkStateTTL: 1000 * 60 * 5 // 5 minutes
  }
}

/**
 * MetaMask 网络添加参数
 */
export function getMetaMaskNetworkParams(networkKey: string) {
  const network = FHEVM_NETWORKS[networkKey]
  if (!network) {
    throw new Error(`Network ${networkKey} not found`)
  }

  return {
    chainId: network.chainId,
    chainName: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : []
  }
}

/**
 * 验证网络配置
 */
export function validateNetworkConfig(network: NetworkConfig): boolean {
  try {
    // 检查必需字段
    const requiredFields = ['name', 'chainId', 'chainIdNumber', 'rpcUrl', 'nativeCurrency']
    for (const field of requiredFields) {
      if (!network[field as keyof NetworkConfig]) {
        console.error(`Missing required field: ${field}`)
        return false
      }
    }

    // 检查 FHEVM 特定配置
    if (!network.fhevmConfig) {
      console.error('Missing FHEVM configuration')
      return false
    }

    const fhevmRequiredFields = ['gatewayUrl', 'aclAddress', 'kmsVerifierAddress', 'inputVerifierAddress']
    for (const field of fhevmRequiredFields) {
      if (!network.fhevmConfig[field as keyof typeof network.fhevmConfig]) {
        console.error(`Missing FHEVM field: ${field}`)
        return false
      }
    }

    // 验证地址格式
    const addressFields = ['aclAddress', 'kmsVerifierAddress', 'inputVerifierAddress']
    for (const field of addressFields) {
      const address = network.fhevmConfig[field as keyof typeof network.fhevmConfig]
      if (typeof address === 'string' && !isValidEthereumAddress(address)) {
        console.error(`Invalid address format for ${field}: ${address}`)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Network validation error:', error)
    return false
  }
}

/**
 * 检查是否为有效的以太坊地址
 */
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * 获取网络状态检查 URL
 */
export function getNetworkHealthCheckUrl(network: NetworkConfig): string {
  try {
    const url = new URL(network.rpcUrl)
    return `${url.protocol}//${url.host}/health`
  } catch {
    return `${network.rpcUrl}/health`
  }
}