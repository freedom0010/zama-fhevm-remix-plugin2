// src/components/common/SuccessMessage.tsx
import React from 'react';

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  title?: string;
}

export function SuccessMessage({ message, onClose, title = '成功' }: SuccessMessageProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-green-500 text-lg">✅</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-green-400 hover:text-green-600"
          >
            <span className="sr-only">关闭</span>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}