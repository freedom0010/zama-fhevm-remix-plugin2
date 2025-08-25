import { useState, useEffect } from 'react';
import { SEPOLIA_CHAIN_ID } from '../utils/fhevm';

interface WalletState {
  account: string | null;
  chainId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    account: null,
    chainId: null,
    isConnected: false,
    isConnecting: false
  });

  const connect = async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts'
  })) as string[];

  const chainId = (await window.ethereum.request({
    method: 'eth_chainId'
  })) as string;

  setState({
    account: accounts[0],
    chainId,
    isConnected: true,
    isConnecting: false
  });
} catch (error) {
  setState(prev => ({ ...prev, isConnecting: false }));
  throw error;
}

  };

  const disconnect = (): void => {
    setState({
      account: null,
      chainId: null,
      isConnected: false,
      isConnecting: false
    });
  };

 const switchNetwork = async (targetChainId: string = SEPOLIA_CHAIN_ID): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: targetChainId,
            chainName: 'Sepolia Test Network',
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'SEP',
              decimals: 18
            }
          }]
        });
      } else {
        throw error;
      }
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setState(prev => ({
        ...prev,
        account: accounts[0] || null,
        isConnected: !!accounts[0]
      }));
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork
  };
}

export { SEPOLIA_CHAIN_ID };
