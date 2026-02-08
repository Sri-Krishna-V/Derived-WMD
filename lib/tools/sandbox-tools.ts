/**
 * Sandbox Management Tools
 * 
 * This file defines Tambo tools for managing the E2B sandbox lifecycle.
 * These tools enable the Tambo Agent to autonomously control the sandbox
 * environment through structured, type-safe function calls.
 * 
 * Validates Requirements: 2.1, 2.2, 2.4
 */

import { defineTool } from '@tambo-ai/react';
import {
  ManageSandboxInputSchema,
  ManageSandboxOutputSchema,
  type ManageSandboxInput,
  type ManageSandboxOutput,
} from './types';

/**
 * manageSandbox Tool
 * 
 * Enables the Tambo Agent to control the E2B sandbox lifecycle.
 * This tool provides autonomous sandbox management capabilities including
 * starting, stopping, restarting, and installing dependencies.
 * 
 * Features:
 * - Zod schema validation for type-safe inputs
 * - Maps to existing API routes for sandbox operations
 * - Returns structured status responses
 * - Enables self-healing through restart action
 * - Supports dependency installation
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4
 */
export const manageSandboxTool = defineTool({
  name: 'manageSandbox',
  description: `Manage the E2B sandbox environment lifecycle.

This tool allows you to control the sandbox where generated code executes. You can start, stop, restart the sandbox, or install NPM packages.

**When to use:**
- Starting a new sandbox for a project
- Stopping a sandbox to free resources
- Restarting a crashed or unresponsive sandbox
- Installing additional NPM packages

**Actions:**
- start: Create and initialize a new E2B sandbox with Vite + React + Tailwind
- stop: Terminate the active sandbox and free resources
- restart: Restart the Vite dev server (useful for recovering from errors)
- install_deps: Install NPM packages in the active sandbox

**Input:**
- action: The lifecycle action to perform (start, stop, restart, install_deps)
- packages: Array of NPM packages to install (required only for install_deps action)
  - Supports versioned packages (e.g., "react@18.2.0")
  - Supports scoped packages (e.g., "@types/node")

**Output:**
- status: Current sandbox status (active, building, error, stopped)
- sandboxId: Unique identifier for the sandbox (returned for start action)
- url: Preview URL where the sandbox is accessible (returned for start action)
- error: Error message if the operation failed

**Important notes:**
- The start action creates a complete Vite + React + Tailwind project structure
- The restart action is useful for recovering from sandbox crashes
- The install_deps action installs packages and verifies they exist in node_modules
- All actions return the current sandbox status for agent decision-making`,
  
  tool: async (input: ManageSandboxInput): Promise<ManageSandboxOutput> => {
    try {
      console.log('[manageSandboxTool] Invoking tool with input:', input);
      
      // Map actions to API endpoints
      let endpoint: string;
      let requestBody: any = {};
      
      switch (input.action) {
        case 'start':
          endpoint = '/api/create-ai-sandbox';
          break;
          
        case 'stop':
          endpoint = '/api/kill-sandbox';
          break;
          
        case 'restart':
          endpoint = '/api/restart-vite';
          break;
          
        case 'install_deps':
          endpoint = '/api/install-packages';
          // Validate that packages are provided for install_deps
          if (!input.packages || input.packages.length === 0) {
            return {
              status: 'error',
              error: 'packages array is required for install_deps action',
            };
          }
          requestBody = { 
            packages: input.packages,
            sandboxId: input.sandboxId, // Forward sandboxId if provided
            stream: false  // Use non-streaming mode for structured JSON response
          };
          break;
          
        default:
          return {
            status: 'error',
            error: `Unknown action: ${input.action}`,
          };
      }
      
      console.log(`[manageSandboxTool] Calling ${endpoint}...`);
      
      // Call the appropriate API endpoint
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
      });
      
      // Parse the response
      const result = await response.json();
      
      // If the response is not OK, handle the error
      if (!response.ok) {
        console.error('[manageSandboxTool] API error:', result);
        
        return {
          status: 'error',
          error: result.error || result.message || `API request failed with status ${response.status}`,
        };
      }
      
      console.log('[manageSandboxTool] Tool execution successful:', result);
      
      // Map the API response to the tool output schema
      switch (input.action) {
        case 'start':
          // create-ai-sandbox returns: { success, sandboxId, url }
          return {
            status: result.success ? 'active' : 'error',
            sandboxId: result.sandboxId,
            url: result.url,
            error: result.success ? undefined : 'Failed to create sandbox',
          };
          
        case 'stop':
          // kill-sandbox returns: { success, message }
          return {
            status: result.success ? 'stopped' : 'error',
            error: result.success ? undefined : result.message,
          };
          
        case 'restart':
          // restart-vite returns: { success, message }
          return {
            status: result.success ? 'active' : 'error',
            error: result.success ? undefined : result.message,
          };
          
        case 'install_deps':
          // install-packages returns: { success, installed, failed }
          if (result.success) {
            return {
              status: 'active',
            };
          } else {
            const failedPackages = result.failed || [];
            const errorMsg = failedPackages.length > 0
              ? `Failed to install packages: ${failedPackages.join(', ')}`
              : 'Failed to install packages';
            return {
              status: 'error',
              error: errorMsg,
            };
          }
          
        default:
          return {
            status: 'error',
            error: 'Unexpected action type',
          };
      }
      
    } catch (error) {
      console.error('[manageSandboxTool] Unexpected error:', error);
      
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      };
    }
  },
  
  inputSchema: ManageSandboxInputSchema,
  outputSchema: ManageSandboxOutputSchema,
});
