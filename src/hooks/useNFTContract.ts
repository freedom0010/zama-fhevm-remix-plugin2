// src/hooks/useNFTContract.ts
import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';

// Contract ABI (minimal for our functions)
const FHE_NFT_ABI = [
  // Standard ERC721
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  
  // Transfer functions
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
  
  // Approval functions
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved)',
  
  // Minting functions
  'function mint(address to, string uri) returns (uint256)',
  'function safeMint(address to, string uri) returns (uint256)',
  'function getCurrentTokenId() view returns (uint256)',
  
  // Owner functions
  'function owner() view returns (address)',
  
  // FHE functions
  'function encryptedOwnerOf(uint256 tokenId, bytes encryptedQuery) view returns (bytes)',
  'function encryptedBalanceOf(address owner, bytes encryptedQuery) view returns (bytes)',
  'function encryptedTransferFrom(address from, address to, uint256 tokenId, bytes proof)',
  'function encryptedApprove(address to, uint256 tokenId, bytes proof)',
  'function encryptedTokenURI(uint256 tokenId, bytes encryptedQuery) view returns (bytes)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
  'event EncryptedOwnershipQuery(uint256 indexed tokenId, bytes encryptedResponse)',
  'event EncryptedMint(address indexed to, uint256 indexed tokenId, bytes encryptedMetadata)',
];

export interface NFTInfo {
  name: string;
  symbol: string;
  address: string;
  currentTokenId: number;
}

export interface NFTToken {
  tokenId: number;
  owner: string;
  tokenURI: string;
  approved?: string;
}

export function useNFTContract(contractAddress?: string) {
  const { account, isConnected } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract instance
  const initializeContract = useCallback(async (address: string) => {
    if (!window.ethereum) {
      throw new Error('No wallet provider found');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contractInstance = new ethers.Contract(address, FHE_NFT_ABI, provider);
      setContract(contractInstance);
      return contractInstance;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize contract';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Deploy new NFT contract
  const deploy = useCallback(async (
    name: string,
    symbol: string
  ): Promise<string> => {
    if (!window.ethereum || !account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // In real deployment, you would use ContractFactory
      // For now, we'll simulate with a mock address
      const mockAddress = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
      
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialize the deployed contract
      await initializeContract(mockAddress);
      
      setIsLoading(false);
      return mockAddress;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Deployment failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [account, initializeContract]);

  // Load NFT collection information
  const loadNFTInfo = useCallback(async (): Promise<NFTInfo | null> => {
    if (!contract) return null;

    setIsLoading(true);
    setError(null);

    try {
      const [name, symbol, currentTokenId] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.getCurrentTokenId(),
      ]);

      const info: NFTInfo = {
        name,
        symbol,
        address: await contract.getAddress(),
        currentTokenId: Number(currentTokenId),
      };

      setNftInfo(info);
      setIsLoading(false);
      return info;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load NFT info';
      setError(errorMsg);
      return null;
    }
  }, [contract]);

  // Get balance (number of tokens owned)
  const balanceOf = useCallback(async (address: string): Promise<number | null> => {
    if (!contract) return null;

    try {
      const balance = await contract.balanceOf(address);
      return Number(balance);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get balance';
      setError(errorMsg);
      return null;
    }
  }, [contract]);

  // Get token information
  const getTokenInfo = useCallback(async (tokenId: number): Promise<NFTToken | null> => {
    if (!contract) return null;

    try {
      const [owner, tokenURI, approved] = await Promise.all([
        contract.ownerOf(tokenId).catch(() => null),
        contract.tokenURI(tokenId).catch(() => ''),
        contract.getApproved(tokenId).catch(() => null),
      ]);

      if (!owner) return null;

      return {
        tokenId,
        owner,
        tokenURI,
        approved: approved || undefined,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get token info';
      setError(errorMsg);
      return null;
    }
  }, [contract]);

  // Mint new NFT
  const mint = useCallback(async (to: string, tokenURI: string): Promise<number | null> => {
    if (!contract || !account) return null;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.mint(to, tokenURI);
      const receipt = await tx.wait();
      
      // Find Transfer event to get token ID
      const transferEvent = receipt?.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'Transfer' && parsed.args.from === ethers.ZeroAddress;
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (transferEvent) {
        const parsed = contract.interface.parseLog(transferEvent);
        tokenId = Number(parsed?.args.tokenId);
      }
      
      setIsLoading(false);
      return tokenId;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Mint failed';
      setError(errorMsg);
      return null;
    }
  }, [contract, account]);

  // Safe mint new NFT
  const safeMint = useCallback(async (to: string, tokenURI: string): Promise<number | null> => {
    if (!contract || !account) return null;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.safeMint(to, tokenURI);
      const receipt = await tx.wait();
      
      // Find Transfer event to get token ID
      const transferEvent = receipt?.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'Transfer' && parsed.args.from === ethers.ZeroAddress;
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (transferEvent) {
        const parsed = contract.interface.parseLog(transferEvent);
        tokenId = Number(parsed?.args.tokenId);
      }
      
      setIsLoading(false);
      return tokenId;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Safe mint failed';
      setError(errorMsg);
      return null;
    }
  }, [contract, account]);

  // Transfer NFT
  const transfer = useCallback(async (from: string, to: string, tokenId: number): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.transferFrom(from, to, tokenId);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMsg);
      return false;
    }
  }, [contract, account]);

  // Safe transfer NFT
  const safeTransfer = useCallback(async (from: string, to: string, tokenId: number): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner['safeTransferFrom(address,address,uint256)'](from, to, tokenId);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Safe transfer failed';
      setError(errorMsg);
      return false;
    }
  }, [contract, account]);

  // Approve NFT
  const approve = useCallback(async (to: string, tokenId: number): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const tx = await contractWithSigner.approve(to, tokenId);
      await tx.wait();
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Approve failed';
      setError(errorMsg);
      return false;
    }
  }, [contract, account]);

  // FHE functions (placeholder implementations)
  const encryptedOwnerOf = useCallback(async (tokenId: number, encryptedQuery: string): Promise<string | null> => {
    if (!contract) return null;

    try {
      const queryBytes = ethers.getBytes(encryptedQuery);
      const result = await contract.encryptedOwnerOf(tokenId, queryBytes);
      return ethers.hexlify(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Encrypted owner query failed';
      setError(errorMsg);
      return null;
    }
  }, [contract]);

  const encryptedTransfer = useCallback(async (from: string, to: string, tokenId: number, proof: string): Promise<boolean> => {
    if (!contract || !account) return false;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const proofBytes = ethers.getBytes(proof);
      const tx = await contractWithSigner.encryptedTransferFrom(from, to, tokenId, proofBytes);
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize contract when address is provided
  useEffect(() => {
    if (contractAddress && isConnected) {
      initializeContract(contractAddress).catch(console.error);
    }
  }, [contractAddress, isConnected, initializeContract]);

  // Load NFT info when contract is available
  useEffect(() => {
    if (contract) {
      loadNFTInfo().catch(console.error);
    }
  }, [contract, loadNFTInfo]);

  return {
    contract,
    nftInfo,
    isLoading,
    error,
    deploy,
    loadNFTInfo,
    balanceOf,
    getTokenInfo,
    mint,
    safeMint,
    transfer,
    safeTransfer,
    approve,
    encryptedOwnerOf,
    encryptedTransfer,
    clearError,
    isDeployed: !!contract,
  };
}