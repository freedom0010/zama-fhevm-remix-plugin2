// Key Manager hook
import { useState, useEffect } from 'react';
import { safeGet, safeSet, safeRemove } from '../utils/storage';
import { encryptText, decryptText, EncryptionResult } from '../utils/encryption';

interface UserKey {
  id: string;
  name: string;
  publicKey: string;
  privateKey: EncryptionResult;
  createdAt: number;
}

interface KeyBackup {
  version: string;
  keys: UserKey[];
  createdAt: number;
}

export function useKeyManager() {
  const [keys, setKeys] = useState<UserKey[]>([]);
  const [hasKeys, setHasKeys] = useState(false);

  const loadKeys = (): void => {
    const savedKeys = safeGet<UserKey[]>('user-keys', []);
    setKeys(savedKeys);
    setHasKeys(savedKeys.length > 0);
  };

  const generateKey = (name: string, passphrase: string): UserKey => {
    const id = `key-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const privateKeyRaw = `private-key-${id}`;
    const publicKey = `public-key-${id}`;
    
    const encryptedPrivateKey = encryptText(privateKeyRaw, passphrase);

    const newKey: UserKey = {
      id,
      name,
      publicKey,
      privateKey: encryptedPrivateKey,
      createdAt: Date.now()
    };

    const updatedKeys = [...keys, newKey];
    setKeys(updatedKeys);
    setHasKeys(true);
    safeSet('user-keys', updatedKeys);

    return newKey;
  };

  const importKey = (keyData: string, passphrase: string): UserKey => {
    try {
      const parsedKey = JSON.parse(keyData) as Partial<UserKey>;
      
      if (!parsedKey.id || !parsedKey.publicKey || !parsedKey.privateKey) {
        throw new Error('Invalid key format');
      }

      // Verify passphrase by attempting to decrypt
      decryptText(parsedKey.privateKey, passphrase);

      const importedKey: UserKey = {
        id: parsedKey.id,
        name: parsedKey.name || 'Imported Key',
        publicKey: parsedKey.publicKey,
        privateKey: parsedKey.privateKey,
        createdAt: parsedKey.createdAt || Date.now()
      };

      const updatedKeys = [...keys, importedKey];
      setKeys(updatedKeys);
      setHasKeys(true);
      safeSet('user-keys', updatedKeys);

      return importedKey;
    } catch (error) {
      throw new Error('Failed to import key: Invalid format or passphrase');
    }
  };

  const exportKey = (keyId: string): string => {
    const key = keys.find(k => k.id === keyId);
    if (!key) {
      throw new Error('Key not found');
    }
    return JSON.stringify(key, null, 2);
  };

  const removeKey = (keyId: string): void => {
    const updatedKeys = keys.filter(k => k.id !== keyId);
    setKeys(updatedKeys);
    setHasKeys(updatedKeys.length > 0);
    safeSet('user-keys', updatedKeys);
  };

  const createBackup = (): KeyBackup => {
    return {
      version: '1.0.0',
      keys,
      createdAt: Date.now()
    };
  };

  const restoreBackup = (backupData: string): void => {
    try {
      const backup = JSON.parse(backupData) as KeyBackup;
      
      if (!backup.keys || !Array.isArray(backup.keys)) {
        throw new Error('Invalid backup format');
      }

      setKeys(backup.keys);
      setHasKeys(backup.keys.length > 0);
      safeSet('user-keys', backup.keys);
    } catch (error) {
      throw new Error('Failed to restore backup: Invalid format');
    }
  };

  const clearAllKeys = (): void => {
    setKeys([]);
    setHasKeys(false);
    safeRemove('user-keys');
  };

  useEffect(() => {
    loadKeys();
  }, []);

  return {
    keys,
    hasKeys,
    generateKey,
    importKey,
    exportKey,
    removeKey,
    createBackup,
    restoreBackup,
    clearAllKeys
  };
}