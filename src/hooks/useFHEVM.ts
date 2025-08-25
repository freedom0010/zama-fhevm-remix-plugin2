import { useState, useEffect } from 'react';
import { fhevmClient } from '../utils/fhevm';

export function useFHEVM() {
  const [networkPublicKey, setNetworkPublicKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = async (): Promise<void> => {
    try {
      await fhevmClient.initialize();
      const key = await fhevmClient.getNetworkKey();
      setNetworkPublicKey(key);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize FHEVM:', error);
    }
  };

  const encrypt = (value: number | bigint): Uint8Array => {
    return fhevmClient.encryptUint64(value);
  };

  const decrypt = (encrypted: Uint8Array): bigint => {
    return fhevmClient.decryptUint64(encrypted);
  };

  useEffect(() => {
    initialize();
  }, []);

  return {
    networkPublicKey,
    isInitialized,
    encrypt,
    decrypt,
    initialize
  };
}