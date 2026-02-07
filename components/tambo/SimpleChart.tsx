/**
 * SimpleChart Component - Tambo Generative UI Component
 * 
 * A simple bar chart component that can be dynamically rendered by Tambo AI
 * to visualize data based on user requests.
 */

'use client';

import React from 'react';

export interface DataPoint {
  name: string;
  value: number;
}

export interface SimpleChartProps {
  data: DataPoint[];
  title?: string;
  type?: 'bar' | 'line';
  color?: string;
}

export function SimpleChart({
  data,
  title,
  type = 'bar',
  color = '#3b82f6',
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{item.name}</span>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
              <div className="h-8 bg-gray-800 rounded-md overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    type === 'bar' ? 'rounded-r-md' : ''
                  }`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-600 text-right">
        Generated with Tambo AI
      </div>
    </div>
  );
}

export default SimpleChart;
