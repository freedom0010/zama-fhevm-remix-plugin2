// src/components/common/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  error: string;
  onClose?: () => void;
  title?: string;
}

export function ErrorMessage({ error, onClose, title = '错误' }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-red-500 text-lg">❌</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-red-400 hover:text-red-600"
          >
            <span className="sr-only">关闭</span>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}