// src/components/keys/KeyGenerate.tsx
import React, { useState } from 'react';
import { useKeyManager } from '../../hooks/useKeyManager';

export function KeyGenerate() {
  const { generateKey, isLoading } = useKeyManager();
  const [keyName, setKeyName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!keyName.trim()) return;

    try {
      const newKey = await generateKey(keyName.trim());
      setSuccess(`密钥 "${newKey.name}" 生成成功！`);
      setKeyName('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Generate key error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">生成新密钥</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
            密钥名称
          </label>
          <input
            id="keyName"
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="输入密钥名称..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!keyName.trim() || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? '生成中...' : '生成密钥'}
        </button>

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
            ✅ {success}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>💡 提示：生成的密钥将安全存储在本地浏览器中</p>
        </div>
      </div>
    </div>
  );
}