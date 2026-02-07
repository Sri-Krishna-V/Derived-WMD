/**
 * Tambo Configuration
 * 
 * This file registers all Tambo components and tools for AI-driven generative UI
 */

import { type TamboComponent, type TamboTool, defineTool } from '@tambo-ai/react';
import { z } from 'zod';
import { DataCard } from '@/components/tambo/DataCard';
import { SimpleChart } from '@/components/tambo/SimpleChart';
import { ProjectSummary } from '@/components/tambo/ProjectSummary';

/**
 * Tambo Components
 * 
 * These components can be dynamically rendered by the AI based on user requests.
 * Each component is registered with a Zod schema for type-safe props.
 */
export const tamboComponents: TamboComponent[] = [
  {
    name: 'DataCard',
    description: 'Displays a data card with a title, value, and optional description. Use for showing statistics, metrics, or key information.',
    component: DataCard,
    propsSchema: z.object({
      title: z.string().describe('The title of the data card'),
      value: z.union([z.string(), z.number()]).describe('The main value to display'),
      description: z.string().optional().describe('Optional description or context'),
      variant: z.enum(['default', 'success', 'warning', 'error']).optional().describe('Card style variant'),
      icon: z.string().optional().describe('Optional emoji icon'),
    }),
  },
  {
    name: 'SimpleChart',
    description: 'Displays a bar chart visualization. Use for showing data comparisons and trends.',
    component: SimpleChart,
    propsSchema: z.object({
      data: z.array(
        z.object({
          name: z.string(),
          value: z.number(),
        })
      ).describe('Array of data points to visualize'),
      title: z.string().optional().describe('Chart title'),
      type: z.enum(['bar', 'line']).optional().describe('Chart type'),
      color: z.string().optional().describe('Bar color (hex code)'),
    }),
  },
  {
    name: 'ProjectSummary',
    description: 'Displays a comprehensive project summary with statistics, status, and technologies.',
    component: ProjectSummary,
    propsSchema: z.object({
      projectName: z.string().describe('Name of the project'),
      filesCount: z.number().describe('Number of files in the project'),
      linesOfCode: z.number().describe('Total lines of code'),
      lastUpdated: z.string().describe('ISO timestamp of last update'),
      status: z.enum(['active', 'idle', 'error']).optional().describe('Project status'),
      technologies: z.array(z.string()).optional().describe('Technologies used in the project'),
    }),
  },
];

/**
 * Tambo Tools
 * 
 * These are JavaScript functions that the AI can call to perform actions
 * or retrieve data. They run in the browser and have access to client-side APIs.
 */
export const tamboTools: TamboTool[] = [
  defineTool({
    name: 'getCurrentTime',
    description: 'Gets the current time in a human-readable format',
    tool: async () => {
      const now = new Date();
      return {
        timestamp: now.toISOString(),
        formatted: now.toLocaleString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    },
    inputSchema: z.object({}),
    outputSchema: z.object({
      timestamp: z.string(),
      formatted: z.string(),
      timezone: z.string(),
    }),
  }),

  defineTool({
    name: 'fetchProjectStats',
    description: 'Fetches statistics about the current project',
    tool: async () => {
      // Simulated project stats - in a real app, this would fetch from an API
      return {
        totalFiles: 42,
        linesOfCode: 15234,
        components: 18,
        lastModified: new Date().toISOString(),
      };
    },
    inputSchema: z.object({}),
    outputSchema: z.object({
      totalFiles: z.number(),
      linesOfCode: z.number(),
      components: z.number(),
      lastModified: z.string(),
    }),
  }),
];

/**
 * Tambo Context Helpers
 * 
 * These functions provide additional context to the AI for better responses.
 * They're called automatically during conversations.
 */
export const tamboContextHelpers = {
  currentPage: () => ({
    key: 'currentPage',
    value: typeof window !== 'undefined' ? window.location.pathname : '/',
  }),
  
  appState: () => ({
    key: 'appState',
    value: 'AI-powered code generation platform',
  }),
};

/**
 * Tambo Configuration Object
 */
export const tamboConfig = {
  components: tamboComponents,
  tools: tamboTools,
  contextHelpers: tamboContextHelpers,
  maxSuggestions: 3,
};
