# Implementation Plan: Tambo Generative UI Transformation

## Overview

This implementation plan transforms the "Derived" project from an imperative code generator into a declarative Generative UI system. The work is organized into five phases that build incrementally: (1) Tool infrastructure, (2) Interactable components, (3) MCP server integration, (4) Security and middleware updates, and (5) Testing and validation. Each phase delivers working functionality that can be validated before proceeding.

## Tasks

- [x] 1. Set up tool infrastructure and type definitions
  - Create `lib/tools/` directory for tool definitions
  - Create shared TypeScript types for tool inputs/outputs
  - Install and configure Zod for schema validation
  - Create `lib/tambo-config.ts` updates for tool registry
  - _Requirements: 1.1, 2.1_

- [x] 2. Implement generateCode tool
  - [x] 2.1 Create structured API endpoint for code generation
    - Create `/api/apply-ai-code-structured` route that accepts JSON
    - Implement Zod schema validation for input (rationale, files array, dependencies)
    - Replace XML parsing with structured JSON processing
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 2.2 Implement atomic transaction logic
    - Create filesystem snapshot mechanism before operations
    - Implement rollback function that restores snapshot on failure
    - Process all file operations in transaction with all-or-nothing semantics
    - _Requirements: 1.7, 12.1, 12.2, 12.3_
  
  - [x] 2.3 Add file path validation
    - Implement path validation function that checks for traversal attempts (..)
    - Validate paths are within project directory
    - Reject absolute paths and invalid characters
    - _Requirements: 12.4, 12.6_
  
  - [x] 2.4 Implement file overwrite protection
    - Check if file exists before create operations
    - Require explicit action='update' for overwriting existing files
    - Return descriptive error for create attempts on existing files
    - _Requirements: 12.5_
  
  - [x] 2.5 Create generateCode tool definition
    - Define tool in `lib/tools/generation-tools.ts` with Zod schemas
    - Implement tool function that calls `/api/apply-ai-code-structured`
    - Define structured output schema (success, processedFiles, deploymentStatus, error)
    - Register tool in Tambo configuration
    - _Requirements: 1.1, 1.5, 10.4_
  
  - [x] 2.6 Write property test for transaction atomicity
    - **Property 3: Transaction Atomicity with Rollback**
    - **Validates: Requirements 1.7, 12.1, 12.2, 12.3**
  
  - [x] 2.7 Write property test for tool output structure
    - **Property 1: Tool Output Structure Consistency**
    - **Validates: Requirements 1.5**
  
  - [x] 2.8 Write property test for input validation
    - **Property 2: Input Validation Rejection**
    - **Validates: Requirements 1.6**
  
  - [x] 2.9 Write property test for path validation
    - **Property 15: File Path Validation**
    - **Validates: Requirements 12.4, 12.6**
  
  - [x] 2.10 Write property test for file overwrite protection
    - **Property 16: File Overwrite Protection**
    - **Validates: Requirements 12.5**

- [x] 3. Implement manageSandbox tool
  - [x] 3.1 Create sandbox control tool definition
    - Define manageSandbox tool in `lib/tools/sandbox-tools.ts`
    - Implement Zod schema for action enum (start, stop, restart, install_deps)
    - Map actions to existing API routes (create-ai-sandbox, kill-sandbox, restart-vite, install-packages)
    - Define output schema with status field
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 3.2 Implement dependency installation logic
    - Handle packages array for install_deps action
    - Call npm install with specified packages in E2B sandbox
    - Verify packages exist in node_modules after installation
    - _Requirements: 2.3, 13.1, 13.3_
  
  - [x] 3.3 Register manageSandbox tool
    - Add tool to Tambo tool registry
    - Provide descriptive metadata for agent selection
    - _Requirements: 10.5_
  
  - [x] 3.4 Write property test for sandbox action responses
    - **Property 4: Sandbox Action Response Structure**
    - **Validates: Requirements 2.4**
  
  - [x] 3.5 Write property test for dependency installation
    - **Property 17: Dependency Installation Verification**
    - **Validates: Requirements 13.1, 13.3**
  
  - [x] 3.6 Write unit test for sandbox restart recovery
    - Test that restart action works when sandbox is in error state
    - _Requirements: 2.5_

- [x] 4. Checkpoint - Verify tool infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create InteractableSandbox component
  - [x] 5.1 Define sandbox state schema
    - Create Zod schema for InteractableSandbox props (viewMode, showConsole, url, status)
    - Define enum types for viewMode and status
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [x] 5.2 Wrap SandboxPreview with withInteractable
    - Import withInteractable from @tambo-ai/react
    - Wrap existing SandboxPreview component
    - Configure with componentName 'SandboxEnvironment' and description
    - Export as InteractableSandbox
    - _Requirements: 3.1_
  
  - [x] 5.3 Update SandboxPreview to accept interactable props
    - Modify SandboxPreview to accept viewMode prop and adjust iframe dimensions
    - Add showConsole prop to toggle terminal overlay visibility
    - Add url prop for preview route navigation
    - Add status prop for visual status indicators
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [x] 5.4 Register InteractableSandbox in component registry
    - Add to Tambo component registry in `lib/tambo-config.ts`
    - Provide component description for agent guidance
    - _Requirements: 10.1, 10.7_
  
  - [x] 5.5 Write property test for state synchronization
    - **Property 5: Interactable Component State Synchronization**
    - **Validates: Requirements 3.6**
  
  - [x] 5.6 Write unit test for viewport mode changes
    - Test that viewMode prop correctly adjusts iframe dimensions
    - Test desktop, tablet, and mobile modes
    - _Requirements: 3.2, 3.7_

- [x] 6. Create BuildStatus component
  - [x] 6.1 Implement BuildStatus component
    - Create component in `components/tambo/BuildStatus.tsx`
    - Accept steps array with id, label, status properties
    - Accept currentStep string for highlighting active step
    - Accept logs array for terminal output display
    - Render step list with status icons (spinner, check, error)
    - Render scrollable log viewer
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 6.2 Add streaming support to generateCode tool
    - Annotate generateCode tool with streaming capability
    - Implement log yielding during file operations
    - Yield step status updates as operations progress
    - Send final result with complete status
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [x] 6.3 Register BuildStatus in component registry
    - Add to Tambo component registry
    - Provide description for progress visualization
    - _Requirements: 10.2, 10.7_
  
  - [x] 6.4 Write property test for build step progression
    - **Property 6: Build Step Status Progression**
    - **Validates: Requirements 4.6**
  
  - [x] 6.5 Write property test for streaming updates
    - **Property 9: Streaming Progress Updates**
    - **Validates: Requirements 7.1, 7.2**
  
  - [x] 6.6 Write property test for streaming completion
    - **Property 10: Streaming Completion Guarantee**
    - **Validates: Requirements 7.4**
  
  - [x] 6.7 Write unit test for error status display
    - Test that errors update step status to 'error' and display logs
    - _Requirements: 4.7_

- [x] 7. Create AppSpecSheet component
  - [x] 7.1 Implement AppSpecSheet form component
    - Create component in `components/tambo/AppSpecSheet.tsx`
    - Add features textarea input
    - Add designSystem select dropdown (tailwind, material, chakra, custom)
    - Add complexity radio buttons (simple, moderate, complex)
    - Add submit button with onSubmit callback
    - Style with Tailwind CSS for clean, accessible form
    - _Requirements: 6.1, 6.2_
  
  - [x] 7.2 Register AppSpecSheet in component registry
    - Add to Tambo component registry
    - Provide description for requirement gathering
    - _Requirements: 10.3, 10.7_
  
  - [x] 7.3 Write unit tests for form validation
    - Test that form collects all required fields
    - Test that onSubmit receives correct data structure
    - _Requirements: 6.2_

- [x] 8. Checkpoint - Verify component infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement MCP server
  - [x] 9.1 Create MCP server endpoint
    - Create `/api/mcp/route.ts` for MCP server
    - Implement POST handler that accepts MCP requests
    - Extract sandbox ID from x-sandbox-id header
    - Connect to E2B sandbox using sandbox ID
    - _Requirements: 5.1_
  
  - [x] 9.2 Implement read_file tool
    - Handle 'read_file' method in MCP server
    - Accept path parameter from request
    - Call sandbox.files.read(path) to get file content
    - Return content with encoding metadata
    - _Requirements: 5.2_
  
  - [x] 9.3 Implement list_files tool
    - Handle 'list_files' method in MCP server
    - Accept path parameter and optional recursive flag
    - Call sandbox.files.list(path) to get directory entries
    - Map entries to structured format (name, type, size)
    - Return files array
    - _Requirements: 5.3_
  
  - [x] 9.4 Add MCP error handling
    - Return 400 for missing sandbox ID header
    - Return 400 for unknown methods
    - Return 500 for E2B connection errors
    - Return specific error when sandbox is not active
    - _Requirements: 5.7, 11.5_
  
  - [x] 9.5 Add MCP authorization validation
    - Validate sandbox ID matches authorized instance for session
    - Reject requests with invalid sandbox IDs before filesystem operations
    - _Requirements: 9.6_
  
  - [x] 9.6 Configure TamboProvider with MCP server
    - Update `app/layout.tsx` to configure mcpServers array
    - Add local MCP server with /api/mcp URL
    - Include x-sandbox-id header from context
    - _Requirements: 5.6_
  
  - [x] 9.7 Write property test for MCP round-trip consistency
    - **Property 7: MCP Filesystem Round-Trip Consistency**
    - **Validates: Requirements 5.2**
  
  - [x] 9.8 Write property test for directory listing completeness
    - **Property 8: MCP Directory Listing Completeness**
    - **Validates: Requirements 5.3**
  
  - [x] 9.9 Write property test for MCP authorization
    - **Property 12: MCP Sandbox Authorization Validation**
    - **Validates: Requirements 9.6**
  
  - [x] 9.10 Write unit test for MCP error when sandbox inactive
    - Test that MCP returns error when sandbox is not active
    - _Requirements: 5.7_

- [x] 10. Update middleware for conversational patterns
  - [x] 10.1 Adjust rate limiting configuration
    - Update ai_generation tier to 10 requests per minute
    - Update code_application tier to 20 requests per minute
    - Keep sandbox tier at 5 requests per minute
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 10.2 Add WebSocket exemption for streaming
    - Detect WebSocket upgrade requests
    - Exempt WebSocket connections from HTTP rate limiting
    - Apply separate connection duration limits for WebSockets
    - _Requirements: 8.6_
  
  - [x] 10.3 Ensure 429 responses include retry-after header
    - Add retry-after header to rate limit responses
    - Calculate retry time based on rate limit window
    - _Requirements: 8.5_
  
  - [x] 10.4 Write property test for sequential operations within limits
    - **Property 11: Sequential Operations Within Rate Limits**
    - **Validates: Requirements 8.4**
  
  - [x] 10.5 Write unit test for rate limit enforcement
    - Test that exceeding limits returns 429 with retry-after header
    - _Requirements: 8.5_
  
  - [x] 10.6 Write unit tests for rate limit tiers
    - Test each tier (ai_generation, code_application, sandbox) at configured limits
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 11. Enhance security isolation
  - [x] 11.1 Update CSP for E2B sandbox isolation
    - Verify frame-src is restricted to https://*.e2b.app
    - Ensure unsafe-eval is scoped only to sandbox iframe
    - Verify main application CSP prevents sandbox code execution
    - _Requirements: 9.2, 9.3, 9.4_
  
  - [x] 11.2 Verify iframe sandbox attributes
    - Ensure SandboxPreview iframe uses e2b.app subdomain
    - Add sandbox attribute to iframe for additional isolation
    - _Requirements: 9.1_
  
  - [x] 11.3 Write unit tests for CSP enforcement
    - Test that CSP blocks unauthorized frame sources
    - Test that main app cannot execute sandbox code
    - _Requirements: 9.2, 9.3, 9.4_
  
  - [x] 11.4 Write unit test for iframe isolation
    - Test that sandbox cannot access parent window resources
    - _Requirements: 9.5_

- [x] 12. Implement dependency management features
  - [x] 12.1 Add import statement detection
    - Create parser function that extracts import statements from code
    - Distinguish between relative imports (local files) and package imports
    - Return list of required package names
    - _Requirements: 13.2_
  
  - [x] 12.2 Add versioned package installation support
    - Parse package@version format in dependencies array
    - Pass version specifier to npm install command
    - Verify installed version matches requested version
    - _Requirements: 13.5_
  
  - [x] 12.3 Implement batch dependency installation
    - Combine multiple packages into single npm install command
    - Optimize for efficiency when multiple dependencies specified
    - _Requirements: 13.6_
  
  - [x] 12.4 Write property test for import detection
    - **Property 18: Import Statement Detection**
    - **Validates: Requirements 13.2**
  
  - [x] 12.5 Write property test for versioned package installation
    - **Property 19: Versioned Package Installation**
    - **Validates: Requirements 13.5**
  
  - [x] 12.6 Write unit test for batch installation
    - Test that multiple packages are installed in single command
    - _Requirements: 13.6_

- [x] 13. Implement error handling and recovery
  - [x] 13.1 Standardize error response format
    - Create ErrorResponse type with code, message, details, recovery fields
    - Update all API routes to return structured errors
    - Include context-specific details (field, path, package, sandboxId)
    - _Requirements: 11.1_
  
  - [x] 13.2 Add error state propagation to InteractableSandbox
    - Update InteractableSandbox to expose error details when status is 'error'
    - Include error message and recovery suggestions in component state
    - _Requirements: 11.3_
  
  - [x] 13.3 Implement file operation error reporting
    - Include specific file path in error when file operation fails
    - Include operation type (create, update, delete) in error
    - Include underlying error reason (permission denied, not found, etc.)
    - _Requirements: 11.4_
  
  - [x] 13.4 Implement dependency error reporting
    - Capture full npm error output for failed installations
    - Include package name in error response
    - Parse npm errors for common issues (not found, version conflict)
    - _Requirements: 11.7_
  
  - [x] 13.5 Write property test for structured error reporting
    - **Property 13: Structured Error Reporting**
    - **Validates: Requirements 11.1, 11.4, 11.5, 11.7**
  
  - [x] 13.6 Write property test for error state propagation
    - **Property 14: Error State Propagation**
    - **Validates: Requirements 11.3**

- [x] 14. Implement project initialization
  - [x] 14.1 Enhance sandbox scaffolding
    - Verify create-ai-sandbox creates complete Vite + React + Tailwind structure
    - Ensure package.json includes all required dependencies and scripts
    - Ensure vite.config.js has proper configuration
    - Ensure main.jsx and App.jsx entry points are created
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 14.2 Add initialization status tracking
    - Track dependency installation progress
    - Only mark sandbox as ready after dependencies installed
    - Start Vite dev server after scaffolding complete
    - Verify dev server is accessible before returning URL
    - _Requirements: 14.5, 14.6, 14.7_
  
  - [x] 14.3 Write unit tests for project initialization
    - Test that all required files are created
    - Test that dev server is accessible at returned URL
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [x] 15. Implement conversation context persistence
  - [x] 15.1 Add conversation history storage
    - Store all user messages and agent responses in session
    - Include timestamps and message metadata
    - Make history retrievable for context in subsequent interactions
    - _Requirements: 15.1_
  
  - [x] 15.2 Add sandbox state persistence
    - Maintain sandbox ID across conversation turns
    - Track all modifications made to sandbox
    - Allow querying current sandbox state
    - _Requirements: 15.2, 15.6_
  
  - [x] 15.3 Add context reset for new projects
    - Clear conversation history when user starts new project
    - Create new sandbox for new project
    - Preserve old sandbox ID for potential recovery
    - _Requirements: 15.5_
  
  - [x] 15.4 Write property test for conversation history persistence
    - **Property 20: Conversation History Persistence**
    - **Validates: Requirements 15.1**
  
  - [x] 15.5 Write property test for sandbox state continuity
    - **Property 21: Sandbox State Continuity**
    - **Validates: Requirements 15.2, 15.6**
  
  - [x] 15.6 Write unit test for context reset
    - Test that starting new project clears old context
    - _Requirements: 15.5_

- [x] 16. Checkpoint - Verify complete system integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Integration testing and validation
  - [x] 17.1 Write integration test for complete code generation flow
    - Test user request → tool selection → code generation → preview update
    - Verify BuildStatus shows progress during generation
    - Verify InteractableSandbox updates with new code
    - _Requirements: 1.1-1.7, 3.6, 4.5, 4.6_
  
  - [x] 17.2 Write integration test for MCP discovery workflow
    - Test list_files → read_file → code modification sequence
    - Verify agent can discover project structure through MCP
    - Verify modifications are applied correctly after discovery
    - _Requirements: 5.2, 5.3, 1.1_
  
  - [x] 17.3 Write integration test for error recovery
    - Test sandbox crash → error detection → restart → recovery
    - Verify InteractableSandbox shows error state
    - Verify manageSandbox restart action recovers sandbox
    - _Requirements: 2.5, 11.3_
  
  - [x] 17.4 Write integration test for streaming interruption
    - Test streaming operation → interruption → partial state report
    - Verify system handles interruption gracefully
    - _Requirements: 7.5_

- [x] 18. Final checkpoint - Complete system validation
  - Run full test suite (unit + property + integration)
  - Verify all 21 correctness properties pass with 100+ iterations
  - Verify all security tests pass
  - Verify rate limiting works correctly under load
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and integration tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties with 100+ iterations using fast-check
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate end-to-end workflows and component interactions
- The implementation builds incrementally: tools → components → MCP → security → testing
- All code uses TypeScript for type safety and Zod for runtime validation
