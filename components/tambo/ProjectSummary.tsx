/**
 * ProjectSummary Component - Tambo Interactable Component
 * 
 * This component demonstrates Tambo's ability to create persistent,
 * interactable components that update based on user conversations.
 */

'use client';

import React from 'react';

export interface ProjectSummaryProps {
  projectName: string;
  filesCount: number;
  linesOfCode: number;
  lastUpdated: string;
  status?: 'active' | 'idle' | 'error';
  technologies?: string[];
}

export function ProjectSummary({
  projectName,
  filesCount,
  linesOfCode,
  lastUpdated,
  status = 'active',
  technologies = [],
}: ProjectSummaryProps) {
  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{projectName}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
            <span className="text-sm text-gray-400 capitalize">{status}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-md p-3">
          <div className="text-sm text-gray-400">Files</div>
          <div className="text-2xl font-bold text-white">{filesCount}</div>
        </div>
        <div className="bg-gray-800 rounded-md p-3">
          <div className="text-sm text-gray-400">Lines of Code</div>
          <div className="text-2xl font-bold text-white">
            {linesOfCode.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Technologies */}
      {technologies.length > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-2">Technologies</div>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-full text-sm text-blue-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
        Last updated: {new Date(lastUpdated).toLocaleString()}
      </div>

      <div className="text-xs text-gray-600 text-center pt-2 border-t border-gray-800">
        ✨ Tambo AI Component
      </div>
    </div>
  );
}

export default ProjectSummary;
