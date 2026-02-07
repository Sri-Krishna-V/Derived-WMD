/**
 * Tambo Configuration
 * 
 * This file registers all Tambo components and tools for AI-driven generative UI.
 * 
 * Components: UI elements that can be dynamically rendered by the AI
 * Tools: Functions that the AI can invoke to perform actions
 * Context Helpers: Functions that provide additional context to the AI
 */

import { type TamboComponent, type TamboTool, defineTool } from '@tambo-ai/react';
import { z } from 'zod';
import { DataCard } from '@/components/tambo/DataCard';
import { SimpleChart } from '@/components/tambo/SimpleChart';
import { ProjectSummary } from '@/components/tambo/ProjectSummary';
import { InteractableSandbox, InteractableSandboxPropsSchema } from '@/components/tambo/InteractableSandbox';
import { BuildStatus } from '@/components/tambo/BuildStatus';
import { AppSpecSheet } from '@/components/tambo/AppSpecSheet';
import { BuildStatusPropsSchema, AppSpecSheetPropsSchema } from '@/lib/tools/types';

// Import tool types for future tool implementations
// These will be uncommented as tools are implemented in subsequent tasks
import { generateCodeTool } from '@/lib/tools/generation-tools';
import { manageSandboxTool } from '@/lib/tools/sandbox-tools';

/**
 * Tambo Components
 * 
 * These components can be dynamically rendered by the AI based on user requests.
 * Each component is registered with a Zod schema for type-safe props.
 * 
 * Component Registry Structure:
 * - Example components (DataCard, SimpleChart, ProjectSummary) - demonstration purposes
 * - Interactable components - will be added in Tasks 5-7:
 *   - InteractableSandbox (Task 5) - AI-controlled sandbox preview
 *   - BuildStatus (Task 6) - Real-time build progress visualization
 *   - AppSpecSheet (Task 7) - Adaptive requirement gathering
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
  {
    name: 'InteractableSandbox',
    description: 'AI-controlled sandbox preview interface for generated applications. Allows the AI agent to switch viewport modes (desktop, tablet, mobile), toggle console visibility, navigate routes, and monitor sandbox status. Use this component when the user wants to preview generated code or interact with the sandbox environment.',
    component: InteractableSandbox,
    propsSchema: InteractableSandboxPropsSchema,
  },
  {
    name: 'BuildStatus',
    description: 'Real-time build progress visualization component. Displays build steps with status indicators (pending, complete, error) and streaming logs. Use this component when showing code generation progress, file operations, dependency installation, or any multi-step build process. Helps users understand what the AI is doing during long-running operations.',
    component: BuildStatus,
    propsSchema: BuildStatusPropsSchema,
  },
  {
    name: 'AppSpecSheet',
    description: 'Adaptive requirement gathering form for novice users. Collects application features, design system preferences, and complexity level through a guided interface. Use this component when users provide vague or high-level requests without specific technical details. Helps structure requirements before code generation. Skip this component for expert users who provide specific technical instructions.',
    component: AppSpecSheet,
    propsSchema: AppSpecSheetPropsSchema,
  },
];

/**
 * Tambo Tools
 * 
 * These are JavaScript functions that the AI can call to perform actions
 * or retrieve data. They run in the browser and have access to client-side APIs.
 * 
 * Tool Registry Structure:
 * - Example tools (getCurrentTime, fetchProjectStats) - demonstration purposes
 * - Code generation tools - will be added in Task 2 (generateCode)
 * - Sandbox management tools - will be added in Task 3 (manageSandbox)
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

  // Code generation tool (Task 2.5)
  generateCodeTool,
  
  // Sandbox management tool (Task 3.1)
  manageSandboxTool,
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
