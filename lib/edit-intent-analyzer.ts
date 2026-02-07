/**
 * Advanced AI-powered edit intent analysis for modern React/Tailwind applications
 * 
 * This module provides sophisticated pattern recognition for determining user intent
 * when modifying React components built with Tailwind CSS. It applies modern web
 * development best practices and component architecture understanding.
 */

import { FileManifest, EditType, EditIntent, IntentPattern } from '@/types/file-manifest';

/**
 * Analyze user prompts using advanced pattern recognition and modern React/Tailwind patterns
 * 
 * @param prompt - User's natural language request
 * @param manifest - Complete file manifest with component relationships
 * @returns EditIntent with high-confidence file targeting and context
 */
export function analyzeEditIntent(
  prompt: string,
  manifest: FileManifest
): EditIntent {
  const lowerPrompt = prompt.toLowerCase();
  
  // Enhanced intent patterns with modern React/Tailwind awareness
  const patterns: IntentPattern[] = [
    {
      patterns: [
        // Component styling with Tailwind-specific patterns
        /update\s+(the\s+)?(\w+)\s+(component|section|page)\s+(style|styling|appearance|color|theme)/i,
        /change\s+(the\s+)?(\w+)\s+(background|color|theme|styling)/i,
        /make\s+(the\s+)?(\w+)\s+(blue|red|green|dark|light|responsive)/i,
        /modify\s+(the\s+)?(\w+)\s+(layout|grid|flex|design)/i,
        /update\s+(the\s+)?(\w+)\s+(to\s+)?(be\s+)?responsive/i,
        // Tailwind-specific class modifications
        /change\s+.*\s+(bg-|text-|border-|p-|m-|flex|grid)/i,
        /add\s+(hover|focus|active|transition|animation)\s+effects?/i,
        /make\s+.*\s+(mobile|desktop|tablet)\s+(friendly|responsive)/i,
      ],
      type: EditType.UPDATE_STYLE,
      fileResolver: (p, m) => findStyleFiles(p, m),
    },
    {
      patterns: [
        // Modern component updates with hooks and state awareness
        /update\s+(the\s+)?(\w+)\s+(component|section|page)(?!\s+(style|styling|color|theme))/i,
        /change\s+(the\s+)?(\w+)\s+(functionality|behavior|logic)/i,
        /modify\s+(the\s+)?(\w+)\s+(props|state|hooks)/i,
        /edit\s+(the\s+)?(\w+)(?!\s+(style|color|theme))/i,
        /fix\s+(the\s+)?(\w+)\s+(component|logic|functionality)/i,
        // Content and text modifications
        /remove\s+.*\s+(button|link|text|element|section|component)/i,
        /delete\s+.*\s+(button|link|text|element|section|component)/i,
        /hide\s+.*\s+(button|link|text|element|section|component)/i,
        /replace\s+.*\s+(text|content|element)/i,
        /change\s+.*\s+(text|content|label|title)\s+to/i,
      ],
      type: EditType.UPDATE_COMPONENT,
      fileResolver: (p, m) => findComponentByContent(p, m),
    },
    {
      patterns: [
        // Modern feature addition with component composition
        /add\s+(a\s+)?new\s+(\w+)\s+(page|section|feature|component)/i,
        /create\s+(a\s+)?(\w+)\s+(page|section|feature|component)/i,
        /implement\s+(a\s+)?(\w+)\s+(page|section|feature|component)/i,
        /build\s+(a\s+)?(\w+)\s+(page|section|feature|component)/i,
        /add\s+(\w+)\s+to\s+(?:the\s+)?(\w+)/i,
        /include\s+(?:a\s+)?(\w+)\s+(component|section|feature)/i,
        // Hook and state additions
        /add\s+(state|useState|useEffect|useMemo|useCallback)/i,
        /implement\s+(routing|navigation|form\s+handling)/i,
        /create\s+(responsive|mobile|desktop)\s+(layout|design)/i,
      ],
      type: EditType.ADD_FEATURE,
      fileResolver: (p, m) => findFeatureInsertionPoints(p, m),
    },
    {
      patterns: [
        // Bug fixes and error resolution
        /fix\s+(the\s+)?(\w+|\w+\s+\w+)(?!\s+(styling|style|color|theme))/i,
        /resolve\s+(the\s+)?(error|issue|bug|problem)/i,
        /debug\s+(the\s+)?(\w+)/i,
        /repair\s+(the\s+)?(\w+)/i,
        /correct\s+(the\s+)?(\w+)/i,
        // Performance and accessibility fixes
        /optimize\s+(the\s+)?(\w+)/i,
        /improve\s+(performance|accessibility|a11y)/i,
        /fix\s+(accessibility|a11y|performance)\s+issues?/i,
      ],
      type: EditType.FIX_ISSUE,
      fileResolver: (p, m) => findProblemFiles(p, m),
    },
    {
      patterns: [
        // Code quality and architecture improvements
        /refactor\s+(the\s+)?(\w+)/i,
        /clean\s+up\s+(the\s+)?(\w+|code)/i,
        /reorganize\s+(the\s+)?(\w+)/i,
        /restructure\s+(the\s+)?(\w+)/i,
        /improve\s+(the\s+)?code\s+quality/i,
        /extract\s+(component|hook|utility|function)/i,
        /split\s+(the\s+)?(\w+)\s+into\s+smaller/i,
      ],
      type: EditType.REFACTOR,
      fileResolver: (p, m) => findRefactorTargets(p, m),
    },
    {
      patterns: [
        // Complete application rebuilds
        /start\s+over/i,
        /recreate\s+everything/i,
        /rebuild\s+(the\s+)?(app|application|entire)/i,
        /new\s+(app|application)/i,
        /from\s+scratch/i,
        /completely\s+redesign/i,
      ],
      type: EditType.FULL_REBUILD,
      fileResolver: (p, m) => [m.entryPoint],
    },
    {
      patterns: [
        // Package and dependency management
        /install\s+(\w+)/i,
        /add\s+(\w+)\s+(package|library|dependency)/i,
        /use\s+(\w+)\s+(library|framework|package)/i,
        /integrate\s+(\w+)/i,
        /import\s+(\w+)\s+(library|package)/i,
      ],
      type: EditType.ADD_DEPENDENCY,
      fileResolver: (p, m) => findPackageFiles(m),
    },
  ];
  
  // Find matching pattern with confidence scoring
  for (const pattern of patterns) {
    for (const regex of pattern.patterns) {
      const match = prompt.match(regex);
      if (match) {
        const targetFiles = pattern.fileResolver(prompt, manifest);
        const confidence = calculateConfidence(prompt, pattern, targetFiles);
        const description = generateDescription(pattern.type, prompt, targetFiles);
        const suggestedContext = getSuggestedContext(targetFiles, manifest);
        
        console.log(`[analyzeEditIntent] Matched pattern: ${regex} with confidence: ${confidence}`);
        
        return {
          type: pattern.type,
          targetFiles,
          confidence,
          description,
          suggestedContext,
        };
      }
    }
  }
  
  // Default to component update if no pattern matches with enhanced confidence
  const defaultTargetFiles = [manifest.entryPoint];
  return {
    type: EditType.UPDATE_COMPONENT,
    targetFiles: defaultTargetFiles,
    confidence: 0.3,
    description: 'General update to application - no specific pattern matched',
    suggestedContext: getSuggestedContext(defaultTargetFiles, manifest),
  };
}

/**
 * Find component files mentioned in the prompt
 */
function findComponentFiles(prompt: string, manifest: FileManifest): string[] {
  const files: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract component names from prompt
  const componentWords = extractComponentNames(prompt);
  console.log('[findComponentFiles] Extracted words:', componentWords);
  
  // First pass: Look for exact component file matches
  for (const [path, fileInfo] of Object.entries(manifest.files)) {
    // Check if file name or component name matches
    const fileName = path.split('/').pop()?.toLowerCase() || '';
    const componentName = fileInfo.componentInfo?.name.toLowerCase();
    
    for (const word of componentWords) {
      if (fileName.includes(word) || componentName?.includes(word)) {
        console.log(`[findComponentFiles] Match found: word="${word}" in file="${path}"`);
        files.push(path);
        break; // Stop after first match to avoid duplicates
      }
    }
  }
  
  // If no specific component found, check for common UI elements
  if (files.length === 0) {
    const uiElements = ['header', 'footer', 'nav', 'sidebar', 'button', 'card', 'modal', 'hero', 'banner', 'about', 'services', 'features', 'testimonials', 'gallery', 'contact', 'team', 'pricing'];
    for (const element of uiElements) {
      if (lowerPrompt.includes(element)) {
        // Look for exact component file matches first
        for (const [path, fileInfo] of Object.entries(manifest.files)) {
          const fileName = path.split('/').pop()?.toLowerCase() || '';
          // Only match if the filename contains the element name
          if (fileName.includes(element + '.') || fileName === element) {
            files.push(path);
            console.log(`[findComponentFiles] UI element match: element="${element}" in file="${path}"`);
            return files; // Return immediately with just this file
          }
        }
        
        // If no exact file match, look for the element in file names (but be more selective)
        for (const [path, fileInfo] of Object.entries(manifest.files)) {
          const fileName = path.split('/').pop()?.toLowerCase() || '';
          if (fileName.includes(element)) {
            files.push(path);
            console.log(`[findComponentFiles] UI element partial match: element="${element}" in file="${path}"`);
            return files; // Return immediately with just this file
          }
        }
      }
    }
  }
  
  // Limit results to most specific matches
  if (files.length > 1) {
    console.log(`[findComponentFiles] Multiple files found (${files.length}), limiting to first match`);
    return [files[0]]; // Only return the first match
  }
  
  return files.length > 0 ? files : [manifest.entryPoint];
}

/**
 * Find where to add new features
 */
function findFeatureInsertionPoints(prompt: string, manifest: FileManifest): string[] {
  const files: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // For new pages, we need routing files and layout
  if (lowerPrompt.includes('page')) {
    // Find router configuration
    for (const [path, fileInfo] of Object.entries(manifest.files)) {
      if (fileInfo.content.includes('Route') || 
          fileInfo.content.includes('createBrowserRouter') ||
          path.includes('router') ||
          path.includes('routes')) {
        files.push(path);
      }
    }
    
    // Also include App.jsx for navigation updates
    if (manifest.entryPoint) {
      files.push(manifest.entryPoint);
    }
  }
  
  // For new components, find the most appropriate parent
  if (lowerPrompt.includes('component') || lowerPrompt.includes('section') || 
      lowerPrompt.includes('add') || lowerPrompt.includes('create')) {
    // Extract where to add it (e.g., "to the footer", "in header")
    const locationMatch = prompt.match(/(?:in|to|on|inside)\s+(?:the\s+)?(\w+)/i);
    if (locationMatch) {
      const location = locationMatch[1];
      const parentFiles = findComponentFiles(location, manifest);
      files.push(...parentFiles);
      console.log(`[findFeatureInsertionPoints] Adding to ${location}, parent files:`, parentFiles);
    } else {
      // Look for component mentions in the prompt
      const componentWords = extractComponentNames(prompt);
      for (const word of componentWords) {
        const relatedFiles = findComponentFiles(word, manifest);
        if (relatedFiles.length > 0 && relatedFiles[0] !== manifest.entryPoint) {
          files.push(...relatedFiles);
        }
      }
      
      // Default to App.jsx if no specific location found
      if (files.length === 0) {
        files.push(manifest.entryPoint);
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(files)];
}

/**
 * Find files that might have problems
 */
function findProblemFiles(prompt: string, manifest: FileManifest): string[] {
  const files: string[] = [];
  
  // Look for error keywords
  if (prompt.match(/error|bug|issue|problem|broken|not working/i)) {
    // Check recently modified files first
    const sortedFiles = Object.entries(manifest.files)
      .sort(([, a], [, b]) => b.lastModified - a.lastModified)
      .slice(0, 5);
    
    files.push(...sortedFiles.map(([path]) => path));
  }
  
  // Also check for specific component mentions
  const componentFiles = findComponentFiles(prompt, manifest);
  files.push(...componentFiles);
  
  return [...new Set(files)];
}

/**
 * Find style-related files
 */
function findStyleFiles(prompt: string, manifest: FileManifest): string[] {
  const files: string[] = [];
  
  // Add all CSS files
  files.push(...manifest.styleFiles);
  
  // Check for Tailwind config
  const tailwindConfig = Object.keys(manifest.files).find(
    path => path.includes('tailwind.config')
  );
  if (tailwindConfig) files.push(tailwindConfig);
  
  // If specific component styling mentioned, include that component
  const componentFiles = findComponentFiles(prompt, manifest);
  files.push(...componentFiles);
  
  return files;
}

/**
 * Find files to refactor
 */
function findRefactorTargets(prompt: string, manifest: FileManifest): string[] {
  // Similar to findComponentFiles but broader
  return findComponentFiles(prompt, manifest);
}

/**
 * Find package configuration files
 */
function findPackageFiles(manifest: FileManifest): string[] {
  const files: string[] = [];
  
  for (const path of Object.keys(manifest.files)) {
    if (path.endsWith('package.json') || 
        path.endsWith('vite.config.js') ||
        path.endsWith('tsconfig.json')) {
      files.push(path);
    }
  }
  
  return files;
}

/**
 * Find component by searching for content mentioned in the prompt
 */
function findComponentByContent(prompt: string, manifest: FileManifest): string[] {
  const files: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  console.log('[findComponentByContent] Searching for content in prompt:', prompt);
  
  // Extract quoted strings or specific button/link text
  const quotedStrings = prompt.match(/["']([^"']+)["']/g) || [];
  const searchTerms: string[] = quotedStrings.map(s => s.replace(/["']/g, ''));
  
  // Also look for specific terms after 'remove', 'delete', 'hide'
  const actionMatch = prompt.match(/(?:remove|delete|hide)\s+(?:the\s+)?(.+?)(?:\s+button|\s+link|\s+text|\s+element|\s+section|$)/i);
  if (actionMatch) {
    searchTerms.push(actionMatch[1].trim());
  }
  
  console.log('[findComponentByContent] Search terms:', searchTerms);
  
  // If we have search terms, look for them in file contents
  if (searchTerms.length > 0) {
    for (const [path, fileInfo] of Object.entries(manifest.files)) {
      // Only search in component files
      if (!path.includes('.jsx') && !path.includes('.tsx')) continue;
      
      const content = fileInfo.content.toLowerCase();
      
      for (const term of searchTerms) {
        if (content.includes(term.toLowerCase())) {
          console.log(`[findComponentByContent] Found "${term}" in ${path}`);
          files.push(path);
          break; // Only add file once
        }
      }
    }
  }
  
  // If no files found by content, fall back to component name search
  if (files.length === 0) {
    console.log('[findComponentByContent] No files found by content, falling back to component name search');
    return findComponentFiles(prompt, manifest);
  }
  
  // Return only the first match to avoid editing multiple files
  return [files[0]];
}

/**
 * Extract component names from prompt
 */
function extractComponentNames(prompt: string): string[] {
  const words: string[] = [];
  
  // Remove common words but keep component-related words
  const cleanPrompt = prompt
    .replace(/\b(the|a|an|in|on|to|from|update|change|modify|edit|fix|make)\b/gi, '')
    .toLowerCase();
  
  // Extract potential component names (words that might be components)
  const matches = cleanPrompt.match(/\b\w+\b/g) || [];
  
  for (const match of matches) {
    if (match.length > 2) { // Skip very short words
      words.push(match);
    }
  }
  
  return words;
}

/**
 * Get additional files for context - returns ALL files for comprehensive context
 */
function getSuggestedContext(
  targetFiles: string[],
  manifest: FileManifest
): string[] {
  // Return all files except the ones being edited
  const allFiles = Object.keys(manifest.files);
  return allFiles.filter(file => !targetFiles.includes(file));
}

/**
 * Resolve import path to actual file path
 */
function resolveImportPath(
  fromFile: string,
  importPath: string,
  manifest: FileManifest
): string | null {
  // Handle relative imports
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const fromDir = fromFile.substring(0, fromFile.lastIndexOf('/'));
    const resolved = resolveRelativePath(fromDir, importPath);
    
    // Try with different extensions
    const extensions = ['.jsx', '.js', '.tsx', '.ts', ''];
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (manifest.files[fullPath]) {
        return fullPath;
      }
      
      // Try index file
      const indexPath = resolved + '/index' + ext;
      if (manifest.files[indexPath]) {
        return indexPath;
      }
    }
  }
  
  // Handle @/ alias (common in Vite projects)
  if (importPath.startsWith('@/')) {
    const srcPath = importPath.replace('@/', '/home/user/app/src/');
    return resolveImportPath(fromFile, srcPath, manifest);
  }
  
  return null;
}

/**
 * Resolve relative path
 */
function resolveRelativePath(fromDir: string, relativePath: string): string {
  const parts = fromDir.split('/');
  const relParts = relativePath.split('/');
  
  for (const part of relParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }
  
  return parts.join('/');
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  prompt: string,
  pattern: IntentPattern,
  targetFiles: string[]
): number {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence if we found specific files
  if (targetFiles.length > 0 && targetFiles[0] !== '') {
    confidence += 0.2;
  }
  
  // Higher confidence for more specific prompts
  if (prompt.split(' ').length > 5) {
    confidence += 0.1;
  }
  
  // Higher confidence for exact pattern matches
  for (const regex of pattern.patterns) {
    if (regex.test(prompt)) {
      confidence += 0.2;
      break;
    }
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * Generate human-readable description
 */
function generateDescription(
  type: EditType,
  prompt: string,
  targetFiles: string[]
): string {
  const fileNames = targetFiles.map(f => f.split('/').pop()).join(', ');
  
  switch (type) {
    case EditType.UPDATE_COMPONENT:
      return `Updating component(s): ${fileNames}`;
    case EditType.ADD_FEATURE:
      return `Adding new feature to: ${fileNames}`;
    case EditType.FIX_ISSUE:
      return `Fixing issue in: ${fileNames}`;
    case EditType.UPDATE_STYLE:
      return `Updating styles in: ${fileNames}`;
    case EditType.REFACTOR:
      return `Refactoring: ${fileNames}`;
    case EditType.FULL_REBUILD:
      return 'Rebuilding entire application';
    case EditType.ADD_DEPENDENCY:
      return 'Adding new dependency';
    default:
      return `Editing: ${fileNames}`;
  }
}