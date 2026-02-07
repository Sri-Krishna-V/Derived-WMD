/**
 * Shared TypeScript types for Tambo tools
 * 
 * This file defines the input and output types for all Tambo tools
 * used in the generative UI transformation.
 */

import { z } from 'zod';

// ============================================================================
// Code Generation Tool Types
// ============================================================================

/**
 * Schema for file operations in code generation
 */
export const FileOperationSchema = z.object({
  path: z.string().describe('File path relative to project root (e.g., "src/components/LoginForm.tsx")'),
  content: z.string().describe('Complete file content'),
  action: z.enum(['create', 'update', 'delete']).describe('Operation type: create new file, update existing, or delete'),
});

export type FileOperation = z.infer<typeof FileOperationSchema>;

/**
 * Schema for generateCode tool input
 */
export const GenerateCodeInputSchema = z.object({
  rationale: z.string().describe('Architectural explanation for the code changes'),
  files: z.array(FileOperationSchema).describe('Array of file operations to perform'),
  dependencies: z.array(z.string()).optional().describe('Optional NPM packages to install (e.g., ["react-hook-form", "zod"])'),
});

export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

/**
 * Schema for generateCode tool output
 */
export const GenerateCodeOutputSchema = z.object({
  success: z.boolean().describe('Whether the operation completed successfully'),
  processedFiles: z.array(z.string()).describe('List of file paths that were processed'),
  deploymentStatus: z.string().describe('Status of the deployment (e.g., "deployed", "building", "error")'),
  error: z.string().optional().describe('Error message if the operation failed'),
});

export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

// ============================================================================
// Sandbox Management Tool Types
// ============================================================================

/**
 * Schema for manageSandbox tool input
 */
export const ManageSandboxInputSchema = z.object({
  action: z.enum(['start', 'stop', 'restart', 'install_deps']).describe('Sandbox lifecycle action to perform'),
  packages: z.array(z.string()).optional().describe('NPM packages to install (required if action is "install_deps")'),
});

export type ManageSandboxInput = z.infer<typeof ManageSandboxInputSchema>;

/**
 * Schema for manageSandbox tool output
 */
export const ManageSandboxOutputSchema = z.object({
  status: z.enum(['active', 'building', 'error', 'stopped']).describe('Current sandbox status'),
  sandboxId: z.string().optional().describe('Unique identifier for the sandbox'),
  url: z.string().optional().describe('URL where the sandbox preview is accessible'),
  error: z.string().optional().describe('Error message if the operation failed'),
});

export type ManageSandboxOutput = z.infer<typeof ManageSandboxOutputSchema>;

// ============================================================================
// Interactable Component Types
// ============================================================================

/**
 * Schema for InteractableSandbox component props
 */
export const InteractableSandboxPropsSchema = z.object({
  viewMode: z.enum(['desktop', 'tablet', 'mobile']).describe('Current viewport configuration'),
  showConsole: z.boolean().describe('Visibility of the terminal overlay'),
  url: z.string().describe('The current route being previewed inside the iframe'),
  status: z.enum(['active', 'building', 'error', 'stopped']).describe('The health status of the sandbox'),
});

export type InteractableSandboxProps = z.infer<typeof InteractableSandboxPropsSchema>;

/**
 * Schema for BuildStatus component props
 */
export const BuildStepSchema = z.object({
  id: z.string().describe('Unique identifier for the build step'),
  label: z.string().describe('Human-readable label for the step'),
  status: z.enum(['pending', 'complete', 'error']).describe('Current status of the step'),
});

export type BuildStep = z.infer<typeof BuildStepSchema>;

export const BuildStatusPropsSchema = z.object({
  steps: z.array(BuildStepSchema).describe('Array of build steps to display'),
  currentStep: z.string().describe('ID of the currently active step'),
  logs: z.array(z.string()).describe('Terminal output logs to display'),
});

export type BuildStatusProps = z.infer<typeof BuildStatusPropsSchema>;

/**
 * Schema for AppSpecSheet component props
 */
export const AppSpecSheetPropsSchema = z.object({
  features: z.string().optional().describe('Features the user wants in their app (comma-separated or free text)'),
  designSystem: z.enum(['tailwind', 'material', 'chakra', 'custom']).optional().describe('Design system to use'),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional().describe('Complexity level of the application'),
  onSubmit: z.function().args(z.object({
    features: z.string(),
    designSystem: z.enum(['tailwind', 'material', 'chakra', 'custom']),
    complexity: z.enum(['simple', 'moderate', 'complex']),
  })).returns(z.void()).describe('Callback function when form is submitted'),
});

export type AppSpecSheetProps = z.infer<typeof AppSpecSheetPropsSchema>;

// ============================================================================
// MCP Server Types
// ============================================================================

/**
 * Schema for MCP read_file tool input
 */
export const MCPReadFileInputSchema = z.object({
  path: z.string().describe('File path to read from the sandbox'),
});

export type MCPReadFileInput = z.infer<typeof MCPReadFileInputSchema>;

/**
 * Schema for MCP read_file tool output
 */
export const MCPReadFileOutputSchema = z.object({
  content: z.string().describe('File content'),
  encoding: z.string().describe('File encoding (e.g., "utf-8")'),
});

export type MCPReadFileOutput = z.infer<typeof MCPReadFileOutputSchema>;

/**
 * Schema for MCP list_files tool input
 */
export const MCPListFilesInputSchema = z.object({
  path: z.string().describe('Directory path to list'),
  recursive: z.boolean().optional().describe('Whether to list files recursively'),
});

export type MCPListFilesInput = z.infer<typeof MCPListFilesInputSchema>;

/**
 * Schema for MCP list_files tool output
 */
export const MCPFileEntrySchema = z.object({
  name: z.string().describe('File or directory name'),
  type: z.enum(['file', 'directory']).describe('Entry type'),
  size: z.number().describe('File size in bytes (0 for directories)'),
});

export type MCPFileEntry = z.infer<typeof MCPFileEntrySchema>;

export const MCPListFilesOutputSchema = z.object({
  files: z.array(MCPFileEntrySchema).describe('Array of file and directory entries'),
});

export type MCPListFilesOutput = z.infer<typeof MCPListFilesOutputSchema>;

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Schema for structured error responses
 */
export const ErrorDetailsSchema = z.object({
  field: z.string().optional().describe('Field name for validation errors'),
  path: z.string().optional().describe('File path for file operation errors'),
  package: z.string().optional().describe('Package name for dependency errors'),
  sandboxId: z.string().optional().describe('Sandbox ID for sandbox errors'),
});

export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;

export const RecoveryActionSchema = z.object({
  action: z.string().describe('Recovery action to take (e.g., "restart_sandbox", "retry")'),
  params: z.any().optional().describe('Parameters for the recovery action'),
});

export type RecoveryAction = z.infer<typeof RecoveryActionSchema>;

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().describe('Machine-readable error code'),
    message: z.string().describe('Human-readable error description'),
    details: ErrorDetailsSchema.optional().describe('Context-specific error details'),
    recovery: RecoveryActionSchema.optional().describe('Suggested recovery actions'),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============================================================================
// Sandbox State Types
// ============================================================================

/**
 * File tree structure for project visualization
 */
export const FileTreeSchema: z.ZodType<FileTree> = z.lazy(() =>
  z.object({
    name: z.string().describe('File or directory name'),
    type: z.enum(['file', 'directory']).describe('Entry type'),
    children: z.array(FileTreeSchema).optional().describe('Child entries for directories'),
    size: z.number().optional().describe('File size in bytes'),
  })
);

export type FileTree = {
  name: string;
  type: 'file' | 'directory';
  children?: FileTree[];
  size?: number;
};

/**
 * Schema for sandbox state
 */
export const SandboxStateSchema = z.object({
  id: z.string().describe('Unique sandbox identifier'),
  status: z.enum(['active', 'building', 'error', 'stopped']).describe('Current sandbox status'),
  url: z.string().optional().describe('Sandbox preview URL'),
  createdAt: z.date().describe('Timestamp when sandbox was created'),
  lastActivity: z.date().describe('Timestamp of last activity'),
  projectStructure: FileTreeSchema.optional().describe('Current project file structure'),
});

export type SandboxState = z.infer<typeof SandboxStateSchema>;

// ============================================================================
// Code Transaction Types
// ============================================================================

/**
 * Schema for code transactions
 */
export const CodeTransactionSchema = z.object({
  id: z.string().describe('Unique transaction identifier'),
  operations: z.array(FileOperationSchema).describe('File operations in this transaction'),
  rationale: z.string().describe('Architectural explanation for the changes'),
  dependencies: z.array(z.string()).optional().describe('NPM packages to install'),
  status: z.enum(['pending', 'applying', 'success', 'rolled_back']).describe('Transaction status'),
  timestamp: z.date().describe('Transaction timestamp'),
});

export type CodeTransaction = z.infer<typeof CodeTransactionSchema>;

// ============================================================================
// Build Progress Types
// ============================================================================

/**
 * Schema for build progress tracking
 */
export const BuildProgressSchema = z.object({
  transactionId: z.string().describe('Associated transaction ID'),
  steps: z.array(BuildStepSchema).describe('Build steps'),
  currentStep: z.string().describe('Currently active step ID'),
  logs: z.array(z.string()).describe('Build logs'),
  overallStatus: z.enum(['in_progress', 'success', 'failed']).describe('Overall build status'),
});

export type BuildProgress = z.infer<typeof BuildProgressSchema>;

// ============================================================================
// User Expertise Types
// ============================================================================

/**
 * Schema for user expertise detection
 */
export const UserExpertiseIndicatorsSchema = z.object({
  usesJargon: z.boolean().describe('Whether user uses technical jargon'),
  specifiesImplementation: z.boolean().describe('Whether user specifies implementation details'),
  referencesArchitecture: z.boolean().describe('Whether user references architectural concepts'),
});

export type UserExpertiseIndicators = z.infer<typeof UserExpertiseIndicatorsSchema>;

export const UserExpertiseSchema = z.object({
  level: z.enum(['novice', 'intermediate', 'expert']).describe('Detected expertise level'),
  indicators: UserExpertiseIndicatorsSchema.describe('Indicators used for detection'),
  conversationHistory: z.array(z.any()).describe('Conversation message history'),
});

export type UserExpertise = z.infer<typeof UserExpertiseSchema>;
