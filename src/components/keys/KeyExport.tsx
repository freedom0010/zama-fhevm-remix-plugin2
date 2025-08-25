// src/components/keys/KeyExport.tsx
import React, { useState } from 'react';
import { useKeyManager } from '../../hooks/useKeyManager';

export function KeyExport() {
  const { keys, exportKey } = useKeyManager();
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [exportedData, setExportedData] = useState('');
  const [showData, setShowData] = useState(false);

  const handleExport = () => {
    if (!selectedKeyId) return;

    const data = exportKey(selectedKeyId);
    if (data) {
      setExportedData(data);
      setShowData(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportedData);
      alert('密钥数据已复制到剪贴板！');
    } catch (error) {
      console.error('Copy error:', error);
      alert('复制失败，请手动选择并复制');
    }
  };

  const resetExport = () => {
    setSelectedKeyId('');
    setExportedData('');
    setShowData(false);
  };

  if (keys.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">导出密钥</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📤</div>
          <p>暂无可导出的密钥</p>
          <p className="text-sm mt-2">请先生成或导入密钥</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">导出密钥</h2>
        {showData && (
          <button
            onClick={resetExport}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← 返回选择
          </button>
        )}
      </div>

      {!showData ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="keySelect" className="block text-sm font-medium text-gray-700 mb-2">
              选择要导出的密钥
            </label>
            <select
              id="keySelect"
              value={selectedKeyId}
              onChange={(e) => setSelectedKeyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择密钥...</option>
              {keys.map((key) => (
                <option key={key.id} value={key.id}>
                  {key.name} ({key.type === 'generated' ? '已生成' : '已导入'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={!selectedKeyId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            导出选中的密钥
          </button>

          <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 p-3 rounded">
            ⚠️ 注意：导出的密钥数据包含敏感信息，请妥善保管
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              密钥数据（JSON 格式）
            </span>
            <button
              onClick={handleCopy}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              📋 复制
            </button>
          </div>

          <textarea
            value={exportedData}
            readOnly
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs"
          />

          <div className="text-xs text-gray-500 bg-green-50 border border-green-200 p-3 rounded">
            ✅ 密钥导出完成！您可以将此数据保存到安全的位置，或复制到其他设备进行导入。
          </div>
        </div>
      )}
    </div>
  );
}