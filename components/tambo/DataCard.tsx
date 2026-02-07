/**
 * DataCard Component - Tambo Generative UI Component
 * 
 * This component demonstrates how Tambo can dynamically render data cards 
 * based on AI conversations. It's registered with Tambo and can be rendered
 * when users request data visualizations.
 */

'use client';

import React from 'react';

export interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  icon?: string;
}

export function DataCard({
  title,
  value,
  description,
  variant = 'default',
  icon,
}: DataCardProps) {
  const variantStyles = {
    default: 'bg-gray-900 border-gray-700',
    success: 'bg-green-900/20 border-green-700',
    warning: 'bg-yellow-900/20 border-yellow-700',
    error: 'bg-red-900/20 border-red-700',
  };

  const variantTextStyles = {
    default: 'text-white',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };

  return (
    <div
      className={`rounded-lg border p-6 ${variantStyles[variant]} transition-all hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          </div>
          <div className={`text-3xl font-bold ${variantTextStyles[variant]}`}>
            {value}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-600">
        Powered by Tambo AI
      </div>
    </div>
  );
}

export default DataCard;
