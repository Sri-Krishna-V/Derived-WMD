# Tambo Tools Directory

This directory contains tool definitions for the Tambo Generative UI transformation.

## Structure

```
lib/tools/
├── README.md                 # This file
├── index.ts                  # Main export file for all tools
├── types.ts                  # Shared TypeScript types and Zod schemas
├── generation-tools.ts       # Code generation tools (Task 2)
└── sandbox-tools.ts          # Sandbox management tools (Task 3)
```

## Type Definitions

The `types.ts` file contains all shared TypeScript types and Zod schemas for:

- **Code Generation**: Input/output types for the `generateCode` tool
- **Sandbox Management**: Input/output types for the `manageSandbox` tool
- **Interactable Components**: Props schemas for UI components
- **MCP Server**: Types for filesystem access tools
- **Error Handling**: Structured error response types
- **State Management**: Sandbox state and transaction types

## Tool Implementation

Tools will be implemented in subsequent tasks:

### Task 2: generateCode Tool
- Location: `generation-tools.ts`
- Purpose: Structured code generation with Zod validation
- Features:
  - Atomic file operations (create, update, delete)
  - Dependency installation
  - Transaction rollback on failure
  - Path validation and security

### Task 3: manageSandbox Tool
- Location: `sandbox-tools.ts`
- Purpose: E2B sandbox lifecycle management
- Features:
  - Start, stop, restart sandbox
  - Install dependencies
  - Status monitoring
  - Error recovery

## Usage

Once tools are implemented, they will be imported and registered in `lib/tambo-config.ts`:

```typescript
import { generateCodeTool } from '@/lib/tools/generation-tools';
import { manageSandboxTool } from '@/lib/tools/sandbox-tools';

export const tamboTools: TamboTool[] = [
  generateCodeTool,
  manageSandboxTool,
  // ... other tools
];
```

## Validation

All tool inputs and outputs are validated using Zod schemas defined in `types.ts`. This ensures:

- Type safety at runtime
- Clear error messages for invalid inputs
- Automatic schema documentation for the AI
- Consistent data structures across the application

## Testing

Property-based tests will be written for each tool to verify:

- Input validation rejection (Property 2)
- Output structure consistency (Property 1)
- Transaction atomicity (Property 3)
- Path validation (Property 15)
- File overwrite protection (Property 16)

See the design document for complete testing strategy.
