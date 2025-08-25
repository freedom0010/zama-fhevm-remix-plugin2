import { useState, useCallback, useEffect } from 'react';
import { ethers } from "ethers";

// 导出其他有用的类型
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface TokenBalance {
  balance: string;
  formatted: string;
}

// 导出接口供其他文件使用
export interface UseTokenContractReturn {
  contract: ethers.Contract | null;
  tokenInfo: TokenInfo | null;
  isLoading: boolean;
  error: string | null;
  deploy: (name: string, symbol: string) => Promise<string | null>;
  loadTokenInfo: () => Promise<void>;
  balanceOf: (address: string) => Promise<TokenBalance | null>;
  transfer: (to: string, amount: string) => Promise<boolean>;
  mint: (to: string, amount: string) => Promise<boolean>;
  approve: (spender: string, amount: string) => Promise<boolean>;
  getAllowance: (owner: string, spender: string) => Promise<TokenBalance | null>;
  encryptedBalanceOf: (encryptedQuery: string) => Promise<string | null>;
  encryptedTransfer: (to: string, encryptedAmount: string) => Promise<boolean>;
  clearError: () => void;
  isDeployed: boolean;
}

// ERC20 基础 ABI
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function mint(address, uint256) returns (bool)",
  // FHE 相关函数（如果需要）
  "function encryptedBalanceOf(bytes) view returns (bytes)",
  "function encryptedTransfer(address, bytes) returns (bool)"
];

export function useTokenContract(contractAddress?: string) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 检查钱包连接状态
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            setIsConnected(true);
          }
        } catch (err) {
          console.error('Failed to check wallet connection:', err);
        }
      }
    };
    checkConnection();
  }, []);

  // 初始化合约
  const initializeContract = useCallback(async (address: string) => {
    if (!window.ethereum) {
      setError('MetaMask not found');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contractInstance = new ethers.Contract(address, ERC20_ABI, provider);
      setContract(contractInstance);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize contract';
      setError(errorMsg);
    }
  }, []);

  // 加载代币信息
  const loadTokenInfo = useCallback(async () => {
    if (!contract) return;

    try {
      const [tokenName, tokenSymbol, decimals, totalSupply] = await Promise.all([
        (contract as any).name(),
        (contract as any).symbol(), 
        (contract as any).decimals(),
        (contract as any).totalSupply()
      ]);

      setTokenInfo({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString()
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load token info';
      setError(errorMsg);
    }
  }, [contract]);

  // 部署新合约（简化版本，实际部署需要合约字节码）
  const deploy = useCallback(async (tokenName: string, tokenSymbol: string): Promise<string | null> => {
    // 这里应该实现合约部署逻辑
    // 目前只是一个占位符实现
    console.log(`Deploy token: ${tokenName} (${tokenSymbol})`);
    setError('Deploy function needs to be implemented with actual contract bytecode');
    return null;
  }, []);

  // 获取余额
  const balanceOf = useCallback(async (address: string): Promise<TokenBalance | null> => {
    if (!contract) return null;

    try {
      const balance = await (contract as any).balanceOf(address);
      const decimals = tokenInfo?.decimals || 18;
      
      return {
        balance: balance.toString(),
        formatted: ethers.formatUnits(balance, decimals),
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get balance';
      setError(errorMsg);
      return null;
    }
  }, [contract, tokenInfo]);

  // 转账
  const transfer = useCallback(async (to: string, amount: string): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const decimals = tokenInfo?.decimals || 18;
      const amountBN = ethers.parseUnits(amount, decimals);
      
      const tx = await (contractWithSigner as any).transfer(to, amountBN);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMsg);
      return false;
    }
  }, [contract, account, tokenInfo]);

  // 铸造代币
  const mint = useCallback(async (to: string, amount: string): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const decimals = tokenInfo?.decimals || 18;
      const amountBN = ethers.parseUnits(amount, decimals);
      
      const tx = await (contractWithSigner as any).mint(to, amountBN);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Mint failed';
      setError(errorMsg);
      return false;
    }
  }, [contract, account, tokenInfo]);

  // 授权代币
  const approve = useCallback(async (spender: string, amount: string): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const decimals = tokenInfo?.decimals || 18;
      const amountBN = ethers.parseUnits(amount, decimals);
      
      const tx = await (contractWithSigner as any).approve(spender, amountBN);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Approve failed';
      setError(errorMsg);
      return false;
    }
  }, [contract, account, tokenInfo]);

  // 获取授权额度
  const getAllowance = useCallback(async (owner: string, spender: string): Promise<TokenBalance | null> => {
    if (!contract) return null;

    try {
      const allowance = await (contract as any).allowance(owner, spender);
      const decimals = tokenInfo?.decimals || 18;
      
      return {
        balance: allowance.toString(),
        formatted: ethers.formatUnits(allowance, decimals),
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get allowance';
      setError(errorMsg);
      return null;
    }
  }, [contract, tokenInfo]);

  // FHE 加密余额查询
  const encryptedBalanceOf = useCallback(async (encryptedQuery: string): Promise<string | null> => {
    if (!contract) return null;

    try {
      const queryBytes = ethers.getBytes(encryptedQuery);
      const result = await (contract as any).encryptedBalanceOf(queryBytes);
      return ethers.hexlify(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Encrypted balance query failed';
      setError(errorMsg);
      return null;
    }
  }, [contract]);

  // FHE 加密转账
  const encryptedTransfer = useCallback(async (to: string, encryptedAmount: string): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const amountBytes = ethers.getBytes(encryptedAmount);
      const tx = await (contractWithSigner as any).encryptedTransfer(to, amountBytes);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Encrypted transfer failed';
      setError(errorMsg);
      return false;
    }
  }, [contract, account]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 当提供合约地址时初始化合约
  useEffect(() => {
    if (contractAddress && isConnected) {
      initializeContract(contractAddress).catch(console.error);
    }
  }, [contractAddress, isConnected, initializeContract]);

  // 当合约可用时加载代币信息
  useEffect(() => {
    if (contract) {
      loadTokenInfo().catch(console.error);
    }
  }, [contract, loadTokenInfo]);

  return {
    contract,
    tokenInfo,
    isLoading,
    error,
    deploy,
    loadTokenInfo,
    balanceOf,
    transfer,
    mint,
    approve,
    getAllowance,
    encryptedBalanceOf,
    encryptedTransfer,
    clearError,
    isDeployed: !!contract,
  };
}