// src/components/layout/Header.tsx
import React from 'react';
import { WalletConnect } from '../wallet/WalletConnect';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              🔐 FHEVM Toolkit
            </h1>
            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              v2.0
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Zama FHE Integration
            </div>
            <div className="w-80">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}