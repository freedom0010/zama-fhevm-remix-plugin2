// src/components/token/TokenDeploy.tsx
import React, { useState } from 'react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useWallet } from '../../hooks/useWallet';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { SuccessMessage } from '../common/SuccessMessage';

export function TokenDeploy() {
  const { account, isConnected } = useWallet();
  const { deploy, isLoading, error, clearError } = useTokenContract();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '18',
    initialSupply: '1000000'
  });
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Token 名称不能为空';
    }
    
    if (!formData.symbol.trim()) {
      errors.symbol = 'Token 符号不能为空';
    } else if (formData.symbol.length > 5) {
      errors.symbol = 'Token 符号不应超过 5 个字符';
    }
    
    const decimals = parseInt(formData.decimals);
    if (isNaN(decimals) || decimals < 0 || decimals > 18) {
      errors.decimals = '小数位数应在 0-18 之间';
    }
    
    const initialSupply = parseFloat(formData.initialSupply);
    if (isNaN(initialSupply) || initialSupply < 0) {
      errors.initialSupply = '初始供应量应为非负数';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    clearError();
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const address = await deploy(
        formData.name,
        formData.symbol,
        parseInt(formData.decimals),
        formData.initialSupply
      );
      
      setDeployedAddress(address);
      
      // 保存到本地存储
      const existing = JSON.parse(localStorage.getItem('deployed-tokens') || '[]');
      const newToken = {
        address,
        name: formData.name,
        symbol: formData.symbol,
        decimals: parseInt(formData.decimals),
        deployedAt: Date.now()
      };
      localStorage.setItem('deployed-tokens', JSON.stringify([...existing, newToken]));
      
      // 重置表单
      setFormData({
        name: '',
        symbol: '',
        decimals: '18',
        initialSupply: '1000000'
      });
    } catch (err) {
      console.error('Deploy error:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">部署 Token 合约</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🔌</div>
          <p>请先连接钱包以部署合约</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">部署 Token 合约</h2>
      
      {error && (
        <div className="mb-4">
          <ErrorMessage error={error} onClose={clearError} />
        </div>
      )}
      
      {deployedAddress && (
        <div className="mb-6">
          <SuccessMessage 
            message={`合约已成功部署！地址: ${deployedAddress}`}
            onClose={() => setDeployedAddress(null)}
          />
        </div>
      )}

      <form onSubmit={handleDeploy} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Token 名称 *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="例如: My FHE Token"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              validationErrors.name 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
            Token 符号 *
          </label>
          <input
            id="symbol"
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            placeholder="例如: FHET"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              validationErrors.symbol 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {validationErrors.symbol && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.symbol}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="decimals" className="block text-sm font-medium text-gray-700 mb-2">
              小数位数
            </label>
            <input
              id="decimals"
              type="number"
              value={formData.decimals}
              onChange={(e) => handleInputChange('decimals', e.target.value)}
              min="0"
              max="18"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                validationErrors.decimals 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {validationErrors.decimals && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.decimals}</p>
            )}
          </div>

          <div>
            <label htmlFor="initialSupply" className="block text-sm font-medium text-gray-700 mb-2">
              初始供应量
            </label>
            <input
              id="initialSupply"
              type="number"
              value={formData.initialSupply}
              onChange={(e) => handleInputChange('initialSupply', e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                validationErrors.initialSupply 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {validationErrors.initialSupply && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.initialSupply}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? <LoadingSpinner size="sm" message="部署中..." /> : '🚀 部署合约'}
        </button>
      </form>

      <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p>💡 提示：</p>
        <ul className="mt-1 space-y-1 ml-4">
          <li>• 合约部署需要支付 Gas 费用</li>
          <li>• 部署后的合约地址将被保存到本地</li>
          <li>• 当前使用占位实现，待 FHEVM 集成</li>
        </ul>
      </div>
    </div>
  );
}