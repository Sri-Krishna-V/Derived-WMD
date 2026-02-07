/**
 * Standardized Error Response Types
 * 
 * Provides consistent error structure across all API routes
 * with context-specific details and recovery suggestions.
 * 
 * Validates Requirements: 11.1
 */

/**
 * Recovery action that can be suggested to resolve an error
 */
export interface RecoveryAction {
  /** The action to take (e.g., "restart_sandbox", "retry", "check_logs") */
  action: string;
  /** Optional parameters for the recovery action */
  params?: Record<string, any>;
  /** Human-readable description of what this action will do */
  description?: string;
}

/**
 * Context-specific error details
 */
export interface ErrorDetails {
  /** Field name for validation errors */
  field?: string;
  /** File path for file operation errors */
  path?: string;
  /** Package name for dependency errors */
  package?: string;
  /** Sandbox ID for sandbox-related errors */
  sandboxId?: string;
  /** Operation type that failed (e.g., "create", "update", "delete") */
  operation?: string;
  /** Additional context-specific information */
  [key: string]: any;
}

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  error: {
    /** Machine-readable error code (e.g., "VALIDATION_ERROR", "FILE_NOT_FOUND") */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Context-specific details about the error */
    details?: ErrorDetails;
    /** Suggested recovery actions */
    recovery?: RecoveryAction;
  };
}

/**
 * Common error codes used across the application
 */
export const ErrorCodes = {
  // Validation errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PATH: 'INVALID_PATH',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  
  // Authorization errors (4xx)
  UNAUTHORIZED_SANDBOX: 'UNAUTHORIZED_SANDBOX',
  NO_AUTHORIZED_SANDBOX: 'NO_AUTHORIZED_SANDBOX',
  
  // Resource errors (4xx)
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  FILE_ALREADY_EXISTS: 'FILE_ALREADY_EXISTS',
  PACKAGE_NOT_FOUND: 'PACKAGE_NOT_FOUND',
  
  // Sandbox errors (5xx)
  NO_ACTIVE_SANDBOX: 'NO_ACTIVE_SANDBOX',
  SANDBOX_CONNECTION_ERROR: 'SANDBOX_CONNECTION_ERROR',
  SANDBOX_NOT_READY: 'SANDBOX_NOT_READY',
  
  // Operation errors (5xx)
  FILE_OPERATION_ERROR: 'FILE_OPERATION_ERROR',
  PACKAGE_INSTALLATION_ERROR: 'PACKAGE_INSTALLATION_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  ROLLBACK_ERROR: 'ROLLBACK_ERROR',
  SNAPSHOT_ERROR: 'SNAPSHOT_ERROR',
  
  // Internal errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

/**
 * Helper function to create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: ErrorDetails,
  recovery?: RecoveryAction
): ErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
      ...(recovery && { recovery }),
    },
  };
}

/**
 * Helper function to create a validation error response
 */
export function createValidationError(
  message: string,
  field?: string,
  additionalDetails?: Partial<ErrorDetails>
): ErrorResponse {
  return createErrorResponse(
    ErrorCodes.VALIDATION_ERROR,
    message,
    {
      field,
      ...additionalDetails,
    }
  );
}

/**
 * Helper function to create a file operation error response
 */
export function createFileOperationError(
  message: string,
  path: string,
  operation?: string,
  additionalDetails?: Partial<ErrorDetails>
): ErrorResponse {
  return createErrorResponse(
    ErrorCodes.FILE_OPERATION_ERROR,
    message,
    {
      path,
      operation,
      ...additionalDetails,
    },
    {
      action: 'check_logs',
      description: 'Check the sandbox logs for more details about the file operation failure',
    }
  );
}

/**
 * Helper function to create a package installation error response
 */
export function createPackageInstallationError(
  message: string,
  packageName: string,
  npmError?: string,
  additionalDetails?: Partial<ErrorDetails>
): ErrorResponse {
  return createErrorResponse(
    ErrorCodes.PACKAGE_INSTALLATION_ERROR,
    message,
    {
      package: packageName,
      npmError,
      ...additionalDetails,
    },
    {
      action: 'retry',
      description: 'Try installing the package again, or check if the package name and version are correct',
    }
  );
}

/**
 * Helper function to create a sandbox error response
 */
export function createSandboxError(
  code: string,
  message: string,
  sandboxId?: string,
  additionalDetails?: Partial<ErrorDetails>
): ErrorResponse {
  const recovery: RecoveryAction = {
    action: 'restart_sandbox',
    description: 'Restart the sandbox to recover from this error',
  };

  return createErrorResponse(
    code,
    message,
    {
      sandboxId,
      ...additionalDetails,
    },
    recovery
  );
}

/**
 * Helper function to create a transaction rollback error response
 */
export function createTransactionError(
  message: string,
  failedOperation?: string,
  path?: string,
  additionalDetails?: Partial<ErrorDetails>
): ErrorResponse {
  return createErrorResponse(
    ErrorCodes.TRANSACTION_FAILED,
    message,
    {
      operation: failedOperation,
      path,
      ...additionalDetails,
    },
    {
      action: 'retry',
      description: 'Review the error details and try the operation again with corrections',
    }
  );
}
