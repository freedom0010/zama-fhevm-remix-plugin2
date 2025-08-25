export {};

declare global {
  interface EthereumProvider {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
    on(event: 'chainChanged', handler: (chainId: string) => void): void;
    removeListener(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
    removeListener(event: 'chainChanged', handler: (chainId: string) => void): void;
  }

  interface Window {
    ethereum?: EthereumProvider;
  }

  // 👇 新增 tokenInfo 全局声明
  interface TokenInfo {
    symbol: string;
    decimals: number;
    address?: string;
  }

  const tokenInfo: TokenInfo;
}
