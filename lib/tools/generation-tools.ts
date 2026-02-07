/**
 * Code Generation Tools
 * 
 * This file defines Tambo tools for AI-driven code generation.
 * These tools enable the Tambo Agent to generate and apply code changes
 * through structured, type-safe function calls.
 * 
 * Validates Requirements: 1.1, 1.5, 10.4
 */

import { defineTool } from '@tambo-ai/react';
import {
  GenerateCodeInputSchema,
  GenerateCodeOutputSchema,
  type GenerateCodeInput,
  type GenerateCodeOutput,
} from './types';

/**
 * generateCode Tool
 * 
 * Enables the Tambo Agent to generate and apply code changes to the E2B sandbox.
 * This tool accepts a structured input with rationale, file operations, and dependencies,
 * and returns a structured response with success status, processed files, and deployment status.
 * 
 * Features:
 * - Zod schema validation for type-safe inputs
 * - Atomic transaction processing with rollback on failure
 * - File path validation to prevent directory traversal
 * - File overwrite protection (requires explicit action='update')
 * - Dependency installation support
 * - Structured error responses
 * - Streaming support for real-time progress updates
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.4
 */
export const generateCodeTool = defineTool({
  name: 'generateCode',
  description: `Generate and apply code changes to the sandbox environment. 
  
This tool allows you to create, update, or delete files in the active sandbox with atomic transaction guarantees. All file operations are processed as a single transaction - if any operation fails, all changes are rolled back to maintain consistency.

**When to use:**
- Creating new components, pages, or utilities
- Modifying existing code files
- Deleting obsolete files
- Installing NPM dependencies

**Input:**
- rationale: Explain the architectural decisions behind the changes
- files: Array of file operations (create, update, or delete)
  - path: Relative file path (e.g., "src/components/Button.tsx")
  - content: Complete file content (for create/update)
  - action: "create" (new file), "update" (modify existing), or "delete" (remove)
- dependencies: Optional array of NPM packages to install (e.g., ["react-hook-form", "zod"])
- stream: Optional boolean to enable streaming mode for real-time progress updates

**Output:**
- success: Whether all operations completed successfully
- processedFiles: List of files that were created, updated, or deleted
- deploymentStatus: Current deployment status ("deployed", "building", "error", "rolled_back")
- error: Error message if the operation failed

**Important notes:**
- All file paths are validated to prevent directory traversal
- Creating a file that already exists will fail - use action="update" instead
- If any operation fails, all changes are automatically rolled back
- Dependencies are installed before file operations
- The Vite dev server is restarted after successful changes
- Use stream=true for real-time progress updates during long operations`,
  
  tool: async function* (input: GenerateCodeInput): AsyncGenerator<any, GenerateCodeOutput, unknown> {
    try {
      console.log('[generateCodeTool] Invoking tool with input:', {
        rationale: input.rationale,
        fileCount: input.files.length,
        dependencies: input.dependencies,
      });
      
      // Call the structured API endpoint with streaming enabled
      const response = await fetch('/api/apply-ai-code-structured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          stream: true, // Enable streaming mode
        }),
      });
      
      // If the response is not OK, handle error
      if (!response.ok) {
        const result = await response.json();
        console.error('[generateCodeTool] API error:', result);
        
        // Handle structured error responses
        if (result.error) {
          return {
            success: false,
            processedFiles: [],
            deploymentStatus: 'error',
            error: result.error.message || 'Unknown error occurred',
          };
        }
        
        // Handle non-structured errors
        return {
          success: false,
          processedFiles: [],
          deploymentStatus: 'error',
          error: `API request failed with status ${response.status}`,
        };
      }
      
      // Process the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: GenerateCodeOutput | null = null;
      
      if (!reader) {
        throw new Error('Response body is not readable');
      }
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete messages (separated by \n\n)
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep incomplete message in buffer
        
        for (const message of messages) {
          if (!message.trim() || !message.startsWith('data: ')) {
            continue;
          }
          
          try {
            const data = JSON.parse(message.substring(6)); // Remove 'data: ' prefix
            
            // Yield progress updates
            if (data.type === 'log') {
              yield { type: 'log', message: data.message };
            } else if (data.type === 'step') {
              yield { 
                type: 'step', 
                step: data.step, 
                status: data.status, 
                message: data.message 
              };
            } else if (data.type === 'error') {
              yield { type: 'error', message: data.message };
            } else if (data.type === 'final') {
              // Store final result to return
              finalResult = data.result;
            }
          } catch (parseError) {
            console.error('[generateCodeTool] Error parsing stream message:', parseError);
          }
        }
      }
      
      // Return the final result
      if (finalResult) {
        console.log('[generateCodeTool] Tool execution completed:', finalResult);
        return finalResult;
      } else {
        // If no final result was received, return error
        return {
          success: false,
          processedFiles: [],
          deploymentStatus: 'error',
          error: 'Stream completed without final result',
        };
      }
      
    } catch (error) {
      console.error('[generateCodeTool] Unexpected error:', error);
      
      return {
        success: false,
        processedFiles: [],
        deploymentStatus: 'error',
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      };
    }
  },
  
  inputSchema: GenerateCodeInputSchema,
  outputSchema: GenerateCodeOutputSchema,
});
