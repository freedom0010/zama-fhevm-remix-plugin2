// src/components/keys/KeyImport.tsx
import React, { useState } from 'react';
import { useKeyManager } from '../../hooks/useKeyManager';

export function KeyImport() {
  const { importKey, isLoading } = useKeyManager();
  const [keyData, setKeyData] = useState('');
  const [keyName, setKeyName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!keyData.trim()) {
      setError('请输入密钥数据');
      return;
    }

    setError(null);
    try {
      const importedKey = await importKey(keyData.trim(), keyName.trim() || undefined);
      setSuccess(`密钥 "${importedKey.name}" 导入成功！`);
      setKeyData('');
      setKeyName('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">导入密钥</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
            密钥名称（可选）
          </label>
          <input
            id="keyName"
            type="text"
            value={keyName}
            onChange={(e) => { setKeyName(e.target.value); clearMessages(); }}
            placeholder="自定义密钥名称..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="keyData" className="block text-sm font-medium text-gray-700 mb-2">
            密钥数据 *
          </label>
          <textarea
            id="keyData"
            value={keyData}
            onChange={(e) => { setKeyData(e.target.value); clearMessages(); }}
            placeholder="粘贴导出的密钥 JSON 数据..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!keyData.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? '导入中...' : '导入密钥'}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
            ✅ {success}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded space-y-1">
          <p>💡 支持的格式：</p>
          <p>• 单个密钥的 JSON 数据</p>
          <p>• 从密钥导出功能生成的数据</p>
          <p>• 如果不指定名称，将使用原始名称或自动生成</p>
        </div>
      </div>
    </div>
  );
}