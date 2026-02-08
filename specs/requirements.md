# Requirements Document

## Introduction

This document specifies the requirements for transforming the "Derived" project from a standard code generator into a premier example of Generative UI for "The UI Strikes Back" hackathon. The transformation will refactor the existing Next.js 14 application to fully leverage the Tambo SDK, E2B secure sandboxing, and Model Context Protocol (MCP) to create an adaptive, AI-orchestrated development environment where the interface responds dynamically to user intent rather than following predetermined workflows.

## Glossary

- **Tambo_Agent**: The AI system powered by the Tambo SDK that orchestrates the user interface by selecting and rendering components based on user intent
- **E2B_Sandbox**: The secure, isolated microVM environment provided by E2B where generated code executes
- **Tambo_Tool**: A registered function with Zod schema validation that the Tambo_Agent can invoke to perform operations
- **Interactable_Component**: A React component wrapped with `withInteractable` that exposes its props to the Tambo_Agent for bidirectional state management
- **MCP_Server**: A Model Context Protocol server that provides standardized access to resources like filesystems
- **Generation_Mode**: The operational state of code creation (planning, generating, applying, or error)
- **Sandbox_State**: The current status of the E2B_Sandbox (active, building, error, or stopped)
- **View_Mode**: The viewport configuration for preview (desktop, tablet, or mobile)
- **Code_Operation**: An atomic file system action (create, update, or delete)

## Requirements

### Requirement 1: Tool-Based Code Generation

**User Story:** As a developer, I want the AI to generate and apply code through structured tool calls, so that code generation is reliable and type-safe without brittle XML parsing.

#### Acceptance Criteria

1. WHEN the Tambo_Agent needs to generate code, THE System SHALL provide a generateCode Tambo_Tool with Zod schema validation
2. THE generateCode Tambo_Tool SHALL accept a rationale field describing architectural decisions
3. THE generateCode Tambo_Tool SHALL accept a files array where each entry specifies path, content, and action (create, update, or delete)
4. THE generateCode Tambo_Tool SHALL accept an optional dependencies array for NPM package installation
5. WHEN the generateCode Tambo_Tool executes, THE System SHALL return a structured response containing success status, processed files list, deployment status, and optional error message
6. WHEN the generateCode Tambo_Tool receives invalid input, THE System SHALL reject the request with a Zod validation error before execution
7. THE System SHALL process all file operations in the files array as a single atomic transaction

### Requirement 2: Sandbox Lifecycle Management

**User Story:** As a developer, I want the AI to autonomously manage the sandbox environment, so that the development environment can self-heal and adapt without manual intervention.

#### Acceptance Criteria

1. WHEN the Tambo_Agent needs to control the E2B_Sandbox, THE System SHALL provide a manageSandbox Tambo_Tool
2. THE manageSandbox Tambo_Tool SHALL support start, stop, restart, and install_deps actions
3. WHEN the manageSandbox Tambo_Tool executes install_deps, THE System SHALL accept a packages array and install the specified NPM packages in the E2B_Sandbox
4. WHEN the manageSandbox Tambo_Tool completes an action, THE System SHALL return the resulting Sandbox_State
5. IF the E2B_Sandbox crashes, THEN THE Tambo_Agent SHALL be able to invoke manageSandbox with restart action to recover

### Requirement 3: Interactable Sandbox Preview

**User Story:** As a developer, I want the AI to control the sandbox preview interface, so that I can request viewport changes and console visibility through natural language.

#### Acceptance Criteria

1. THE System SHALL wrap the SandboxPreview component with withInteractable to create an InteractableSandbox component
2. THE InteractableSandbox component SHALL expose viewMode property accepting desktop, tablet, or mobile values
3. THE InteractableSandbox component SHALL expose showConsole boolean property for terminal overlay visibility
4. THE InteractableSandbox component SHALL expose url property for the current preview route
5. THE InteractableSandbox component SHALL expose status property reflecting the Sandbox_State
6. WHEN the Tambo_Agent updates InteractableSandbox properties, THE System SHALL synchronize the component state and re-render
7. WHEN a user requests "show mobile view", THE Tambo_Agent SHALL update the InteractableSandbox viewMode property to mobile

### Requirement 4: Real-Time Build Visualization

**User Story:** As a developer, I want to see real-time progress during code generation, so that I understand what the AI is doing and can trust the process.

#### Acceptance Criteria

1. THE System SHALL provide a BuildStatus component for visualizing code generation progress
2. THE BuildStatus component SHALL accept a steps array where each step has an id, label, and status (pending, complete, or error)
3. THE BuildStatus component SHALL accept a currentStep property indicating the active step
4. THE BuildStatus component SHALL accept a logs array for displaying terminal output
5. WHEN the generateCode Tambo_Tool executes, THE Tambo_Agent SHALL render the BuildStatus component with streaming updates
6. WHEN a build step completes, THE System SHALL update the step status from pending to complete in the BuildStatus component
7. WHEN the generateCode Tambo_Tool encounters an error, THE System SHALL update the relevant step status to error and display error logs

### Requirement 5: MCP Filesystem Access

**User Story:** As a developer, I want the AI to discover and read files in the sandbox, so that it can understand the existing project structure and reduce hallucinations.

#### Acceptance Criteria

1. THE System SHALL implement an MCP_Server at the /api/mcp endpoint
2. THE MCP_Server SHALL provide a read_file tool that accepts a path parameter and returns file content from the E2B_Sandbox
3. THE MCP_Server SHALL provide a list_files tool that accepts a path parameter and returns the directory listing from the E2B_Sandbox
4. WHEN the Tambo_Agent needs to understand project structure, THE System SHALL allow invocation of the list_files tool
5. WHEN the Tambo_Agent needs to read existing code, THE System SHALL allow invocation of the read_file tool
6. THE System SHALL configure the TamboProvider to connect to the local MCP_Server
7. IF the E2B_Sandbox is not active, THEN THE MCP_Server SHALL return an error indicating the sandbox must be started first

### Requirement 6: Adaptive UI Complexity

**User Story:** As a developer, I want the interface to adapt to my expertise level, so that beginners get guided workflows and experts get direct access.

#### Acceptance Criteria

1. THE System SHALL provide an AppSpecSheet component for collecting application requirements
2. THE AppSpecSheet component SHALL accept features, designSystem, and complexity properties
3. WHEN a novice user starts a conversation, THE Tambo_Agent SHALL render the AppSpecSheet component to guide requirement gathering
4. WHEN an expert user provides specific technical instructions, THE Tambo_Agent SHALL skip the AppSpecSheet and directly invoke code generation tools
5. THE System SHALL allow the Tambo_Agent to determine user expertise level based on conversation analysis
6. WHEN the user expertise level changes during the conversation, THE Tambo_Agent SHALL adapt the interface complexity accordingly

### Requirement 7: Streaming Tool Execution

**User Story:** As a developer, I want long-running operations to stream progress updates, so that the interface feels responsive during code generation.

#### Acceptance Criteria

1. THE generateCode Tambo_Tool SHALL support streaming partial results during execution
2. WHEN the generateCode Tambo_Tool streams updates, THE System SHALL yield log entries as they occur
3. THE Tambo_Agent SHALL render streaming updates in the BuildStatus component in real-time
4. WHEN a streaming operation completes, THE System SHALL send a final result with the complete operation status
5. IF a streaming operation is interrupted, THEN THE System SHALL handle the interruption gracefully and report the partial completion state

### Requirement 8: Rate Limiting for Conversational Patterns

**User Story:** As a system administrator, I want rate limits that support conversational AI interactions, so that legitimate multi-step workflows are not throttled while preventing abuse.

#### Acceptance Criteria

1. THE System SHALL allow a minimum of 10 AI generation requests per minute per IP address
2. THE System SHALL allow a minimum of 20 code application requests per minute per IP address
3. THE System SHALL allow a minimum of 5 sandbox creation requests per minute per IP address
4. WHEN the Tambo_Agent makes rapid tool calls during a conversation, THE System SHALL not throttle legitimate sequential operations
5. WHEN rate limits are exceeded, THE System SHALL return a 429 status code with a retry-after header
6. THE System SHALL exempt WebSocket connections for MCP and streaming from standard HTTP rate limiting

### Requirement 9: Security Isolation

**User Story:** As a security engineer, I want the sandbox preview to be strictly isolated, so that malicious generated code cannot compromise the main application.

#### Acceptance Criteria

1. THE System SHALL render E2B_Sandbox content in an iframe with a distinct e2b.app subdomain
2. THE System SHALL enforce a Content Security Policy (CSP) with frame-src restricted to https://*.e2b.app
3. THE System SHALL allow unsafe-eval only within the E2B_Sandbox iframe context
4. THE System SHALL prevent the main application from executing code from the E2B_Sandbox
5. WHEN the E2B_Sandbox attempts to access parent window resources, THE System SHALL block the access
6. THE System SHALL validate all MCP_Server requests to ensure they target only the authorized E2B_Sandbox instance

### Requirement 10: Component Registry

**User Story:** As a developer, I want all interactive components registered with Tambo, so that the AI can orchestrate the complete development interface.

#### Acceptance Criteria

1. THE System SHALL register the InteractableSandbox component in the Tambo component registry
2. THE System SHALL register the BuildStatus component in the Tambo component registry
3. THE System SHALL register the AppSpecSheet component in the Tambo component registry
4. THE System SHALL register the generateCode Tambo_Tool in the Tambo tool registry
5. THE System SHALL register the manageSandbox Tambo_Tool in the Tambo tool registry
6. WHEN the Tambo_Agent analyzes user intent, THE System SHALL make all registered components and tools available for selection
7. THE System SHALL provide component descriptions that guide the Tambo_Agent in selecting appropriate components for each interaction

### Requirement 11: Error Handling and Recovery

**User Story:** As a developer, I want clear error messages and recovery options, so that I can understand and fix problems when code generation fails.

#### Acceptance Criteria

1. WHEN a Tambo_Tool execution fails, THE System SHALL return a structured error with a descriptive message
2. WHEN code generation fails, THE Tambo_Agent SHALL render the BuildStatus component with error status and relevant logs
3. WHEN the E2B_Sandbox enters an error state, THE System SHALL expose the error details through the InteractableSandbox status property
4. WHEN a file operation fails, THE System SHALL report which specific file caused the error and why
5. WHEN an MCP_Server request fails, THE System SHALL return an error indicating whether the issue is with the sandbox connection or the file operation
6. THE System SHALL allow the Tambo_Agent to suggest recovery actions based on error types
7. WHEN a dependency installation fails, THE System SHALL report which packages failed and provide the npm error output

### Requirement 12: Atomic File Operations

**User Story:** As a developer, I want file operations to be atomic, so that partial updates never leave the sandbox in a broken state.

#### Acceptance Criteria

1. WHEN the generateCode Tambo_Tool processes multiple file operations, THE System SHALL apply all operations as a single transaction
2. IF any file operation in the transaction fails, THEN THE System SHALL roll back all operations in that transaction
3. WHEN a rollback occurs, THE System SHALL restore the E2B_Sandbox filesystem to its pre-transaction state
4. THE System SHALL validate all file paths before executing operations to prevent invalid writes
5. WHEN a file operation would overwrite an existing file, THE System SHALL verify the action is explicitly set to update
6. THE System SHALL prevent file operations outside the E2B_Sandbox project directory

### Requirement 13: Dependency Management

**User Story:** As a developer, I want the AI to automatically manage NPM dependencies, so that generated code has all required packages available.

#### Acceptance Criteria

1. WHEN the generateCode Tambo_Tool includes a dependencies array, THE System SHALL install the specified packages in the E2B_Sandbox
2. THE System SHALL detect import statements in generated code and suggest missing dependencies
3. WHEN a dependency installation completes, THE System SHALL verify the package was successfully installed
4. WHEN a dependency installation fails, THE System SHALL report the specific package and error
5. THE System SHALL support installing specific package versions when specified in the format "package@version"
6. WHEN multiple dependencies are specified, THE System SHALL install them in a single npm install command for efficiency

### Requirement 14: Project Initialization

**User Story:** As a developer, I want new sandboxes to start with a complete project structure, so that code generation can begin immediately without scaffolding.

#### Acceptance Criteria

1. WHEN a new E2B_Sandbox is created, THE System SHALL scaffold a Vite + React + Tailwind project structure
2. THE System SHALL create a package.json with appropriate dependencies and scripts
3. THE System SHALL create a vite.config.js with proper configuration
4. THE System SHALL create entry points including main.jsx and App.jsx
5. THE System SHALL install all initial dependencies before marking the sandbox as ready
6. WHEN the scaffolding completes, THE System SHALL start the Vite development server
7. THE System SHALL verify the development server is accessible before returning the sandbox URL

### Requirement 15: Conversation Context Persistence

**User Story:** As a developer, I want the AI to remember the conversation context, so that I can make iterative refinements without repeating information.

#### Acceptance Criteria

1. THE System SHALL maintain conversation history including all user messages and Tambo_Agent responses
2. THE System SHALL maintain the current E2B_Sandbox state across multiple interactions
3. WHEN the user requests a modification, THE Tambo_Agent SHALL reference previous code generation operations
4. THE System SHALL allow the Tambo_Agent to query the MCP_Server to refresh its understanding of the current project state
5. WHEN the user starts a new project, THE System SHALL clear the previous conversation context
6. THE System SHALL persist the sandbox ID across conversation turns to maintain environment continuity
