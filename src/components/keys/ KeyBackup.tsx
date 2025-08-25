// src/components/keys/KeyBackup.tsx
import React, { useState, useRef } from 'react';
import { useKeyManager } from '../../hooks/useKeyManager';

export function KeyBackup() {
  const { keys, exportBackup, importBackup, isLoading } = useKeyManager();
  const [importResult, setImportResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    try {
      const backupData = exportBackup();
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `zama-fhevm-keys-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('导出备份失败');
    }
  };

  const handleImportBackup = async (file: File) => {
    setError(null);
    setImportResult(null);

    try {
      const text = await file.text();
      const importedCount = await importBackup(text);
      setImportResult(`成功导入 ${importedCount} 个新密钥！`);
      setTimeout(() => setImportResult(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入备份失败');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportBackup(file);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearMessages = () => {
    setError(null);
    setImportResult(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">密钥备份</h2>
      
      <div className="space-y-6">
        {/* 导出备份 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">导出备份</h3>
          <p className="text-sm text-gray-600 mb-4">
            将所有密钥导出为 JSON 文件，包含 {keys.length} 个密钥
          </p>
          
          <button
            onClick={handleExportBackup}
            disabled={keys.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            📥 下载备份文件
          </button>
        </div>

        {/* 导入备份 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">导入备份</h3>
          <p className="text-sm text-gray-600 mb-4">
            从备份文件恢复密钥（不会覆盖现有密钥）
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <button
            onClick={triggerFileInput}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? '导入中...' : '📤 选择备份文件'}
          </button>
        </div>

        {/* 消息提示 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
            ❌ {error}
            <button
              onClick={clearMessages}
              className="ml-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              关闭
            </button>
          </div>
        )}

        {importResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
            ✅ {importResult}
            <button
              onClick={clearMessages}
              className="ml-2 text-green-600 hover:text-green-800 text-sm underline"
            >
              关闭
            </button>
          </div>
        )}

        {/* 使用说明 */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded space-y-2">
          <p className="font-medium">💡 备份说明：</p>
          <ul className="space-y-1 ml-4">
            <li>• 备份文件包含所有密钥的完整信息</li>
            <li>• 导入时会自动跳过重复的密钥</li>
            <li>• 请将备份文件保存在安全的位置</li>
            <li>• 建议定期进行备份以防数据丢失</li>
          </ul>
        </div>
      </div>
    </div>
  );
}