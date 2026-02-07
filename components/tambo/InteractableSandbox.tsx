/**
 * InteractableSandbox Component
 * 
 * Wraps the SandboxPreview component with Tambo's withInteractable HOC to enable
 * AI control of the sandbox preview interface. This allows the AI agent to:
 * - Switch viewport modes (desktop, tablet, mobile)
 * - Toggle console visibility
 * - Navigate to different routes
 * - Monitor sandbox status
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { withInteractable } from '@tambo-ai/react';
import SandboxPreview from '@/components/SandboxPreview';
import { z } from 'zod';

/**
 * Schema for error details when sandbox is in error state
 */
export const SandboxErrorDetailsSchema = z.object({
  code: z.string()
    .describe('Machine-readable error code'),
  message: z.string()
    .describe('Human-readable error message'),
  details: z.record(z.any()).optional()
    .describe('Context-specific error details'),
  recovery: z.object({
    action: z.string()
      .describe('Suggested recovery action (e.g., restart_sandbox, retry)'),
    description: z.string().optional()
      .describe('Description of what the recovery action will do'),
    params: z.record(z.any()).optional()
      .describe('Optional parameters for the recovery action'),
  }).optional()
    .describe('Suggested recovery action to resolve the error'),
});

/**
 * Schema for InteractableSandbox props
 * 
 * This schema defines the properties that the AI agent can read and modify
 * to control the sandbox preview interface.
 */
export const InteractableSandboxPropsSchema = z.object({
  viewMode: z.enum(['desktop', 'tablet', 'mobile'])
    .describe('Current viewport configuration for the preview'),
  showConsole: z.boolean()
    .describe('Visibility of the terminal overlay'),
  url: z.string()
    .describe('The current route being previewed inside the iframe'),
  status: z.enum(['active', 'building', 'error', 'stopped'])
    .describe('The health status of the sandbox'),
  errorDetails: SandboxErrorDetailsSchema.optional()
    .describe('Error details and recovery suggestions when status is "error"'),
});

export type InteractableSandboxProps = z.infer<typeof InteractableSandboxPropsSchema>;
export type SandboxErrorDetails = z.infer<typeof SandboxErrorDetailsSchema>;

/**
 * Adapter Component
 * 
 * This component adapts the interactable props to the existing SandboxPreview props.
 * Once Task 5.3 is complete, this adapter can be simplified or removed.
 */
interface SandboxPreviewAdapterProps extends InteractableSandboxProps {
  sandboxId?: string;
  port?: number;
  type?: 'vite' | 'nextjs' | 'console';
  output?: string;
  isLoading?: boolean;
}

function SandboxPreviewAdapter({
  viewMode,
  showConsole,
  url,
  status,
  errorDetails,
  sandboxId = 'demo-sandbox',
  port = 3000,
  type = 'vite',
  output = '',
}: SandboxPreviewAdapterProps) {
  // Map status to isLoading for backward compatibility
  const isLoading = status === 'building';
  
  // Pass all interactable props to SandboxPreview
  return (
    <SandboxPreview
      sandboxId={sandboxId}
      port={port}
      type={type}
      output={output}
      isLoading={isLoading}
      viewMode={viewMode}
      showConsole={showConsole}
      url={url}
      status={status}
      errorDetails={errorDetails}
    />
  );
}

/**
 * InteractableSandbox Component
 * 
 * Wrapped version of SandboxPreview that exposes its state to the Tambo Agent
 * for bidirectional control. The agent can query current state and update
 * properties in response to user requests like "show mobile view".
 */
export const InteractableSandbox = withInteractable(SandboxPreviewAdapter, {
  componentName: 'SandboxEnvironment',
  description: 'The live preview of the generated application. Supports view switching and console debugging.',
  propsSchema: InteractableSandboxPropsSchema,
});
