/**
 * Import Statement Parser
 * 
 * This module provides functionality to extract import statements from code
 * and distinguish between relative imports (local files) and package imports
 * (node_modules dependencies).
 * 
 * Validates Requirements: 13.2
 */

/**
 * Represents a parsed import statement
 */
export interface ParsedImport {
  /** The raw import statement */
  statement: string;
  /** The module being imported (e.g., 'react', './Button', '@types/node') */
  module: string;
  /** Whether this is a relative import (local file) */
  isRelative: boolean;
  /** Whether this is a package import (from node_modules) */
  isPackage: boolean;
  /** The package name (for package imports only) */
  packageName?: string;
}

/**
 * Result of parsing imports from code
 */
export interface ImportParseResult {
  /** All parsed import statements */
  imports: ParsedImport[];
  /** List of required package names (excluding relative imports) */
  requiredPackages: string[];
}

/**
 * Regular expressions for matching different import statement formats
 */
const IMPORT_PATTERNS = [
  // ES6 import statements
  // import React from 'react'
  // import { useState } from 'react'
  // import * as React from 'react'
  // import type { Props } from 'react'
  /import\s+(?:type\s+)?(?:[\w*{},\s]+)\s+from\s+['"]([^'"]+)['"]/g,
  
  // import 'styles.css'
  /import\s+['"]([^'"]+)['"]/g,
  
  // require() statements
  // const React = require('react')
  // require('dotenv/config')
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  
  // Dynamic imports
  // import('react')
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

/**
 * Extract the package name from a module path
 * 
 * Examples:
 * - 'react' -> 'react'
 * - 'react/jsx-runtime' -> 'react'
 * - '@types/node' -> '@types/node'
 * - '@types/node/fs' -> '@types/node'
 * - '@radix-ui/react-dialog' -> '@radix-ui/react-dialog'
 * 
 * @param modulePath - The module path from the import statement
 * @returns The package name
 */
function extractPackageName(modulePath: string): string {
  // Handle scoped packages (@scope/package)
  if (modulePath.startsWith('@')) {
    const parts = modulePath.split('/');
    if (parts.length >= 2) {
      // Return @scope/package (first two parts)
      return `${parts[0]}/${parts[1]}`;
    }
    return modulePath;
  }
  
  // Handle regular packages (package or package/subpath)
  const parts = modulePath.split('/');
  return parts[0];
}

/**
 * Determine if a module path is a relative import (local file)
 * 
 * Relative imports start with:
 * - './' (current directory)
 * - '../' (parent directory)
 * - '/' (absolute path, treated as relative in this context)
 * 
 * @param modulePath - The module path from the import statement
 * @returns True if the import is relative (local file)
 */
function isRelativeImport(modulePath: string): boolean {
  return (
    modulePath.startsWith('./') ||
    modulePath.startsWith('../') ||
    modulePath.startsWith('/')
  );
}

/**
 * Determine if a module path is a Node.js built-in module
 * 
 * Built-in modules include: fs, path, http, https, crypto, etc.
 * These don't need to be installed via npm.
 * 
 * @param modulePath - The module path from the import statement
 * @returns True if the module is a Node.js built-in
 */
function isBuiltInModule(modulePath: string): boolean {
  const builtInModules = [
    'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram',
    'dns', 'domain', 'events', 'fs', 'http', 'https', 'net', 'os',
    'path', 'punycode', 'querystring', 'readline', 'stream', 'string_decoder',
    'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib',
    // Node.js 14+ modules
    'perf_hooks', 'async_hooks', 'http2', 'inspector', 'worker_threads',
    // Node.js 16+ modules
    'diagnostics_channel', 'trace_events',
  ];
  
  // Extract the base module name (before any subpath)
  const baseName = modulePath.split('/')[0];
  
  // Check if it's a built-in module or uses the 'node:' protocol
  return (
    modulePath.startsWith('node:') ||
    builtInModules.includes(baseName)
  );
}

/**
 * Parse import statements from code and extract required packages
 * 
 * This function analyzes code to find all import statements and distinguishes
 * between relative imports (local files) and package imports (node_modules).
 * 
 * **Property 18: Import Statement Detection**
 * For any generated code file containing import statements, the system SHALL
 * parse the imports and SHALL identify the required package names, distinguishing
 * between relative imports (local files) and package imports (node_modules).
 * 
 * Validates Requirements: 13.2
 * 
 * @param code - The source code to parse
 * @returns Object containing all imports and required package names
 * 
 * @example
 * ```typescript
 * const code = `
 *   import React from 'react';
 *   import { Button } from './components/Button';
 *   import type { Props } from '@types/react';
 * `;
 * 
 * const result = parseImports(code);
 * // result.requiredPackages = ['react', '@types/react']
 * // result.imports.length = 3
 * ```
 */
export function parseImports(code: string): ImportParseResult {
  const imports: ParsedImport[] = [];
  const packageSet = new Set<string>();
  
  // Track which modules we've already seen to avoid duplicates
  const seenModules = new Set<string>();
  
  // Apply each pattern to find all import statements
  for (const pattern of IMPORT_PATTERNS) {
    // Reset the regex lastIndex to ensure we start from the beginning
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const modulePath = match[1];
      
      // Skip if we've already processed this module
      if (seenModules.has(modulePath)) {
        continue;
      }
      seenModules.add(modulePath);
      
      const isRelative = isRelativeImport(modulePath);
      const isBuiltIn = isBuiltInModule(modulePath);
      const isPackage = !isRelative && !isBuiltIn;
      
      // Create parsed import object
      const parsedImport: ParsedImport = {
        statement: match[0],
        module: modulePath,
        isRelative,
        isPackage,
      };
      
      // Extract package name for package imports
      if (isPackage) {
        const packageName = extractPackageName(modulePath);
        parsedImport.packageName = packageName;
        packageSet.add(packageName);
      }
      
      imports.push(parsedImport);
    }
  }
  
  // Convert package set to sorted array for consistent output
  const requiredPackages = Array.from(packageSet).sort();
  
  return {
    imports,
    requiredPackages,
  };
}

/**
 * Parse imports from multiple files and aggregate required packages
 * 
 * This is useful when processing multiple file operations in a transaction
 * to determine all packages that need to be installed.
 * 
 * @param files - Array of objects with path and content properties
 * @returns Object containing all imports and aggregated required packages
 * 
 * @example
 * ```typescript
 * const files = [
 *   { path: 'App.tsx', content: 'import React from "react";' },
 *   { path: 'Button.tsx', content: 'import { useState } from "react";' },
 * ];
 * 
 * const result = parseImportsFromFiles(files);
 * // result.requiredPackages = ['react']
 * ```
 */
export function parseImportsFromFiles(
  files: Array<{ path: string; content: string }>
): ImportParseResult {
  const allImports: ParsedImport[] = [];
  const packageSet = new Set<string>();
  
  for (const file of files) {
    // Only parse JavaScript/TypeScript files
    if (isCodeFile(file.path)) {
      const result = parseImports(file.content);
      
      // Add all imports
      allImports.push(...result.imports);
      
      // Add all required packages
      result.requiredPackages.forEach(pkg => packageSet.add(pkg));
    }
  }
  
  // Convert package set to sorted array
  const requiredPackages = Array.from(packageSet).sort();
  
  return {
    imports: allImports,
    requiredPackages,
  };
}

/**
 * Determine if a file path represents a code file that should be parsed for imports
 * 
 * @param filePath - The file path to check
 * @returns True if the file is a code file (JS, TS, JSX, TSX)
 */
function isCodeFile(filePath: string): boolean {
  const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
  return codeExtensions.some(ext => filePath.endsWith(ext));
}

/**
 * Suggest missing dependencies based on import statements in code
 * 
 * This function compares the required packages from import statements
 * with the packages that are already specified for installation.
 * 
 * @param code - The source code to analyze
 * @param specifiedDependencies - Array of packages already specified for installation
 * @returns Array of package names that are imported but not specified
 * 
 * @example
 * ```typescript
 * const code = 'import React from "react"; import axios from "axios";';
 * const specified = ['react'];
 * 
 * const missing = suggestMissingDependencies(code, specified);
 * // missing = ['axios']
 * ```
 */
export function suggestMissingDependencies(
  code: string,
  specifiedDependencies: string[] = []
): string[] {
  const { requiredPackages } = parseImports(code);
  
  // Create a set of specified package names (handle versioned packages)
  const specifiedSet = new Set(
    specifiedDependencies.map(dep => {
      // Extract package name from versioned format (e.g., 'react@18.0.0' -> 'react')
      if (dep.startsWith('@')) {
        // Scoped package: @scope/package@version -> @scope/package
        const parts = dep.split('@');
        if (parts.length >= 3) {
          return `${parts[0]}@${parts[1]}`;
        }
        return dep;
      } else {
        // Regular package: package@version -> package
        return dep.split('@')[0];
      }
    })
  );
  
  // Find packages that are required but not specified
  const missing = requiredPackages.filter(pkg => !specifiedSet.has(pkg));
  
  return missing;
}
