import React from 'react';

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  'data-tab'?: string;
}

export function TabButton({ active, onClick, label, 'data-tab': dataTab }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      data-tab={dataTab}
      className={`
        border-b-2 py-4 px-1 text-sm font-medium
        ${active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }
      `}
    >
      {label}
    </button>
  );
}
