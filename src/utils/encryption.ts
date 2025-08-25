export interface EncryptionResult {
  data: string;
  iv: string;
  timestamp: number;
}

export function encryptText(text: string, key: string): EncryptionResult {
  // Mock text encryption
  const iv = Math.random().toString(36).substring(7);
  const encoded = btoa(text + key + iv);
  
  return {
    data: encoded,
    iv,
    timestamp: Date.now()
  };
}

export function decryptText(encrypted: EncryptionResult, key: string): string {
  // Mock text decryption
  try {
    const decoded = atob(encrypted.data);
    return decoded.replace(key + encrypted.iv, '');
  } catch (error) {
    throw new Error('Failed to decrypt text');
  }
}

export function serializeEncrypted(encrypted: EncryptionResult): string {
  return JSON.stringify(encrypted);
}

export function deserializeEncrypted(serialized: string): EncryptionResult {
  return JSON.parse(serialized);
}