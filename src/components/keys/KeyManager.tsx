// src/components/keys/KeyManager.tsx (continued)
import React from 'react';
import { useKeyManager } from '../../hooks/useKeyManager';

export function KeyManager() {
 const { keys, deleteKey, hasKeys } = useKeyManager();

 const handleDeleteKey = (keyId: string, keyName: string) => {
   if (confirm(`确定要删除密钥 "${keyName}" 吗？此操作不可撤销。`)) {
     deleteKey(keyId);
   }
 };

 const formatDate = (timestamp: number) => {
   return new Date(timestamp).toLocaleString('zh-CN');
 };

 const getTypeIcon = (type: 'generated' | 'imported') => {
   return type === 'generated' ? '🔑' : '📥';
 };

 return (
   <div className="bg-white rounded-lg shadow-md p-6">
     <div className="flex items-center justify-between mb-4">
       <h2 className="text-xl font-semibold text-gray-800">密钥管理</h2>
       <span className="text-sm text-gray-600">
         共 {keys.length} 个密钥
       </span>
     </div>

     {!hasKeys ? (
       <div className="text-center py-8 text-gray-500">
         <div className="text-4xl mb-4">🔐</div>
         <p>暂无密钥</p>
         <p className="text-sm mt-2">生成或导入密钥开始使用</p>
       </div>
     ) : (
       <div className="space-y-3">
         {keys.map((key) => (
           <div key={key.id} className="border border-gray-200 rounded-lg p-4">
             <div className="flex items-start justify-between">
               <div className="flex-1">
                 <div className="flex items-center space-x-2 mb-2">
                   <span className="text-lg">{getTypeIcon(key.type)}</span>
                   <h3 className="font-medium text-gray-800">{key.name}</h3>
                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                     {key.type === 'generated' ? '已生成' : '已导入'}
                   </span>
                 </div>
                 
                 <div className="text-sm text-gray-600 space-y-1">
                   <p>
                     <span className="font-medium">ID:</span> 
                     <span className="font-mono ml-2">{key.id.slice(0, 16)}...</span>
                   </p>
                   <p>
                     <span className="font-medium">创建时间:</span> 
                     <span className="ml-2">{formatDate(key.createdAt)}</span>
                   </p>
                   <p>
                     <span className="font-medium">公钥:</span> 
                     <span className="font-mono text-xs ml-2">{key.publicKey.slice(0, 20)}...</span>
                   </p>
                 </div>
               </div>

               <button
                 onClick={() => handleDeleteKey(key.id, key.name)}
                 className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 hover:border-red-400 rounded transition-colors"
               >
                 删除
               </button>
             </div>
           </div>
         ))}
       </div>
     )}

     {hasKeys && (
       <div className="mt-6 pt-4 border-t border-gray-200">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
           <div className="text-center p-3 bg-blue-50 rounded">
             <p className="font-medium text-blue-800">导入/导出</p>
             <p className="text-blue-600">管理密钥数据</p>
           </div>
           <div className="text-center p-3 bg-green-50 rounded">
             <p className="font-medium text-green-800">备份</p>
             <p className="text-green-600">安全存储所有密钥</p>
           </div>
           <div className="text-center p-3 bg-purple-50 rounded">
             <p className="font-medium text-purple-800">加密</p>
             <p className="text-purple-600">用于 FHEVM 操作</p>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}