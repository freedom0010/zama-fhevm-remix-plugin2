/**
 * 网络配置类型定义
 */

export interface NetworkConfig {
  name: string
  chainId: string // hex format
  chainIdNumber: number
  rpcUrl: string
  blockExplorer?: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  fhevmConfig: FHEVMConfig
  isTestnet: boolean
  isSupported: boolean
}

export interface FHEVMConfig {
  gatewayUrl: string
  aclAddress: string
  kmsVerifierAddress: string
  inputVerifierAddress: string
}

export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  account: string | null
  balance: string | null
  chainId: number | null
  provider: any | null
  signer: any | null
  error: string | null
}

export interface NetworkState {
  currentNetwork: NetworkConfig | null
  isConnected: boolean
  isConnecting: boolean
  blockNumber: number | null
  gasPrice: string | null
  error: string | null
  healthStatus: 'healthy' | 'degraded' | 'down' | 'unknown'
}

export interface FHEVMInstance {
  instance: any | null
  publicKey: string | null
  isInitialized: boolean
  isInitializing: boolean
  error: string | null
}

export interface EncryptionResult {
  ciphertext: string
  type: string
  success: boolean
  error?: string
}

export interface DecryptionResult {
  plaintext: string
  success: boolean
  error?: string
}

export interface TransactionState {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: number
  gasUsed?: string
  error?: string
}

export interface ContractInteraction {
  address: string
  abi: any[]
  instance: any | null
}

// MetaMask 相关类型
export interface MetaMaskError {
  code: number
  message: string
  data?: any
}

export interface AddEthereumChainParameter {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[]
}

// FHEVM 加密类型
export type FHEVMType = 
  | 'ebool'
  | 'euint4'
  | 'euint8' 
  | 'euint16'
  | 'euint32'
  | 'euint64'
  | 'euint128'
  | 'euint256'
  | 'eaddress'
  | 'ebytes64'
  | 'ebytes128'
  | 'ebytes256'

export interface EncryptedValue {
  data: string
  type: FHEVMType
  handles: string[]
}

// 网络健康检查
export interface NetworkHealth {
  rpcStatus: 'online' | 'offline' | 'slow'
  gatewayStatus: 'online' | 'offline' | 'slow'
  latency: number
  lastChecked: number
}

// Hook 返回类型
export interface UseWalletReturn {
  wallet: WalletState
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (networkKey: string) => Promise<void>
  refreshBalance: () => Promise<void>
}

export interface UseNetworkReturn {
  network: NetworkState
  switchNetwork: (networkKey: string) => Promise<void>
  refreshNetworkState: () => Promise<void>
  checkNetworkHealth: () => Promise<NetworkHealth>
}

export interface UseFHEVMReturn {
  fhevm: FHEVMInstance
  encrypt: (value: any, type: FHEVMType) => Promise<EncryptionResult>
  decrypt: (ciphertext: string, type: FHEVMType) => Promise<DecryptionResult>
  reencrypt: (ciphertext: string, publicKey: string, privateKey: string) => Promise<string>
  initializeFHEVM: (networkConfig: NetworkConfig) => Promise<void>
  refreshPublicKey: () => Promise<void>
}