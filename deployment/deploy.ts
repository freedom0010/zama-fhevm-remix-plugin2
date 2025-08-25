// Deploy contracts
export const DEPLOYMENT_CONFIG = {
  sepolia: {
    chainId: 11155111,
    confirmations: 2,
    gasPrice: 20000000000, // 20 gwei
  },
  mainnet: {
    chainId: 1,
    confirmations: 5,
    gasPrice: 30000000000, // 30 gwei
  },
} as const;

export enum ContractName {
  FHE_TOKEN = "FHEToken",
  FHE_NFT = "FHENFT",
}

export interface DeploymentParams {
  FHEToken: {
    name: string;
    symbol: string;
    decimals: number;
  };
  FHENFT: {
    name: string;
    symbol: string;
  };
}

export const DEFAULT_PARAMS: DeploymentParams = {
  FHEToken: {
    name: "Zama FHE Token",
    symbol: "ZFHE",
    decimals: 18,
  },
  FHENFT: {
    name: "Zama FHE NFT",
    symbol: "ZFHENFT",
  },
};