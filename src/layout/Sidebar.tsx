// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: '仪表板', icon: '📊' },
    { id: 'token', label: 'Token 管理', icon: '🪙' },
    { id: 'nft', label: 'NFT 管理', icon: '🖼️' },
    { id: 'keys', label: '密钥管理', icon: '🔑' },
    { id: 'network', label: '网络设置', icon: '🌐' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-100 text-blue-700 border-blue-200 border'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-gray-500 text-center p-3 bg-gray-100 rounded">
          <p>FHEVM 占位模式</p>
          <p>等待 Zama SDK 集成</p>
        </div>
      </div>
    </aside>
  );
}