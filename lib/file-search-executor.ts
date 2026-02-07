/**
 * Advanced Agentic File Search Executor
 * 
 * Executes intelligent search plans to find precise code locations in React/Tailwind applications
 * before making surgical edits. Handles component relationships, JSX patterns, and responsive designs.
 */

export interface SearchResult {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  matchedTerm?: string;
  matchedPattern?: string;
  contextBefore: string[];
  contextAfter: string[];
  confidence: 'high' | 'medium' | 'low';
  componentType?: 'page' | 'layout' | 'component' | 'hook' | 'utility';
  elementType?: 'jsx' | 'style' | 'import' | 'state' | 'function';
}

export interface SearchPlan {
  editType: string;
  reasoning: string;
  searchTerms: string[];
  regexPatterns?: string[];
  fileTypesToSearch?: string[];
  expectedMatches?: number;
  priorityFiles?: string[];
  excludeFiles?: string[];
  fallbackSearch?: {
    terms: string[];
    patterns?: string[];
  };
}

export interface SearchExecutionResult {
  success: boolean;
  results: SearchResult[];
  filesSearched: number;
  executionTime: number;
  usedFallback: boolean;
  searchType: 'exact' | 'fuzzy' | 'semantic';
  error?: string;
}

/**
 * Determines the type of component based on file path and content
 */
function determineComponentType(
  filePath: string, 
  content: string
): SearchResult['componentType'] {
  const fileName = filePath.toLowerCase();
  
  // Check for pages
  if (fileName.includes('/pages/') || fileName.includes('/app/') || 
      fileName.includes('page.') || fileName.includes('route.')) {
    return 'page';
  }
  
  // Check for layouts
  if (fileName.includes('layout') || fileName.includes('header') || 
      fileName.includes('footer') || fileName.includes('sidebar')) {
    return 'layout';
  }
  
  // Check for hooks
  if (fileName.startsWith('use') || content.includes('function use')) {
    return 'hook';
  }
  
  // Check for utility files
  if (fileName.includes('/utils/') || fileName.includes('/lib/') || 
      fileName.includes('/helpers/') || !fileName.match(/\.(jsx|tsx)$/)) {
    return 'utility';
  }
  
  // Default to regular component
  return 'component';
}

/**
 * Determines the type of element in a line of code
 */
function determineElementType(
  line: string, 
  lineIndex: number, 
  lines: string[]
): SearchResult['elementType'] {
  // Check for JSX elements
  if (line.includes('<') && line.includes('>')) {
    return 'jsx';
  }
  
  // Check for style classes
  if (line.includes('className') || line.includes('style=') || 
      line.includes('tw`') || line.includes('css`')) {
    return 'style';
  }
  
  // Check for imports
  if (line.includes('import ') || line.includes('require(')) {
    return 'import';
  }
  
  // Check for state declarations
  if (line.includes('useState') || line.includes('useReducer') || 
      line.includes('const [') || line.includes('this.state')) {
    return 'state';
  }
  
  // Check for function declarations
  if (line.includes('function ') || line.includes('=>') || 
      line.includes('method') || line.match(/\w+\s*\([^)]*\)\s*{/)) {
    return 'function';
  }
  
  // Look at surrounding context if no clear type
  const surroundingLines = [
    ...lines.slice(Math.max(0, lineIndex - 2), lineIndex),
    ...lines.slice(lineIndex + 1, Math.min(lines.length, lineIndex + 3))
  ];
  
  if (surroundingLines.some(l => l.includes('<') && l.includes('>'))) {
    return 'jsx';
  }
  
  if (surroundingLines.some(l => l.includes('className'))) {
    return 'style';
  }
  
  return undefined;
}

/**
 * Execute an intelligent search plan against the React/Tailwind codebase
 * with enhanced pattern matching and component awareness
 */
export function executeSearchPlan(
  searchPlan: SearchPlan,
  files: Record<string, string>
): SearchExecutionResult {
  const startTime = Date.now();
  const results: SearchResult[] = [];
  let filesSearched = 0;
  let usedFallback = false;
  let searchType: 'exact' | 'fuzzy' | 'semantic' = 'exact';

  const { 
    searchTerms = [], 
    regexPatterns = [], 
    fileTypesToSearch = ['.jsx', '.tsx', '.js', '.ts'],
    priorityFiles = [],
    excludeFiles = [],
    fallbackSearch 
  } = searchPlan;

  // Enhanced helper function to perform search with component awareness
  const performSearch = (terms: string[], patterns?: string[]): SearchResult[] => {
    const searchResults: SearchResult[] = [];
    
    // Sort files to search priority files first
    const sortedFiles = Object.entries(files).sort(([pathA], [pathB]) => {
      const isPriorityA = priorityFiles.some(p => pathA.includes(p));
      const isPriorityB = priorityFiles.some(p => pathB.includes(p));
      
      if (isPriorityA && !isPriorityB) return -1;
      if (!isPriorityA && isPriorityB) return 1;
      return 0;
    });

    for (const [filePath, content] of sortedFiles) {
      // Skip files that should be excluded
      if (excludeFiles.some(exclude => filePath.includes(exclude))) {
        continue;
      }
      
      // Skip files that don't match the desired extensions
      const shouldSearch = fileTypesToSearch.some(ext => filePath.endsWith(ext));
      if (!shouldSearch) continue;

      filesSearched++;
      const lines = content.split('\n');

      // Analyze file for component type (for better confidence scoring)
      const componentType = determineComponentType(filePath, content);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let matched = false;
        let matchedTerm: string | undefined;
        let matchedPattern: string | undefined;
        let elementType: SearchResult['elementType'] = undefined;

        // Check simple search terms (case-insensitive)
        for (const term of terms) {
          if (line.toLowerCase().includes(term.toLowerCase())) {
            matched = true;
            matchedTerm = term;
            break;
          }
        }

        // Check regex patterns if no term match
        if (!matched && patterns) {
          for (const pattern of patterns) {
            try {
              const regex = new RegExp(pattern, 'i');
              if (regex.test(line)) {
                matched = true;
                matchedPattern = pattern;
                break;
              }
            } catch (e) {
              console.warn(`[file-search] Invalid regex pattern: ${pattern}`);
            }
          }
        }

        if (matched) {
          // Determine element type for better context
          elementType = determineElementType(line, i, lines);
          
          // Get context lines (5 before, 5 after for better context)
          const contextBefore = lines.slice(Math.max(0, i - 5), i);
          const contextAfter = lines.slice(i + 1, Math.min(lines.length, i + 6));

          // Enhanced confidence scoring based on component type and element type
          let confidence: 'high' | 'medium' | 'low' = 'medium';
          
          // Higher confidence if it's a component definition or JSX pattern
          if (line.includes('function') && line.includes('export default')) {
            confidence = 'high';
          } else if (line.includes('className') && (line.includes('bg-') || line.includes('text-'))) {
            confidence = 'high'; // High confidence for styling matches
          } else if (line.includes('return') && contextAfter.some(l => l.includes('<'))) {
            confidence = 'high'; // High confidence for render methods
          } else if (matchedTerm && line.includes(matchedTerm)) {
            confidence = 'high';
          } else if (matchedPattern) {
            confidence = 'medium';
          }
          
          // Boost confidence based on component type - prioritize pages and layout components
          if (componentType === 'page' || componentType === 'layout') {
            confidence = 'high';
          }
          
          // Boost confidence for more specific element types
          if (elementType === 'jsx' || elementType === 'style') {
            if (confidence !== 'high') confidence = 'medium';
          }

          searchResults.push({
            filePath,
            lineNumber: i + 1,
            lineContent: line.trim(),
            matchedTerm,
            matchedPattern,
            contextBefore,
            contextAfter,
            confidence,
            componentType,
            elementType
          });
        }
      }
    }

    return searchResults;
  };

  // Execute primary search
  results.push(...performSearch(searchTerms, regexPatterns));

  // If no results and we have a fallback, try it
  if (results.length === 0 && fallbackSearch) {
    console.log('[file-search] No results from primary search, trying fallback...');
    usedFallback = true;
    searchType = 'fuzzy';
    results.push(...performSearch(
      fallbackSearch.terms,
      fallbackSearch.patterns
    ));
  }
  
  // If still no results, try semantic search by looking for related concepts
  if (results.length === 0) {
    console.log('[file-search] No results from fallback, trying semantic search...');
    searchType = 'semantic';
    
    // Generate semantic alternatives for common UI elements
    const semanticAlternatives: Record<string, string[]> = {
      'header': ['navigation', 'navbar', 'nav', 'appbar', 'top'],
      'button': ['btn', 'cta', 'action', 'link'],
      'footer': ['bottom', 'copyright', 'social'],
      'hero': ['banner', 'jumbotron', 'main', 'landing'],
      'input': ['field', 'form control', 'textbox', 'text field'],
      'modal': ['dialog', 'popup', 'overlay'],
      'card': ['panel', 'box', 'container', 'item'],
    };
    
    // Create semantic search terms based on original terms
    const semanticTerms: string[] = [];
    for (const term of searchTerms) {
      const lowerTerm = term.toLowerCase();
      for (const [concept, alternatives] of Object.entries(semanticAlternatives)) {
        if (lowerTerm.includes(concept)) {
          semanticTerms.push(...alternatives);
        } else if (alternatives.some(alt => lowerTerm.includes(alt))) {
          semanticTerms.push(concept);
        }
      }
    }
    
    // Only run semantic search if we found alternatives
    if (semanticTerms.length > 0) {
      results.push(...performSearch(semanticTerms));
    }
  }

  const executionTime = Date.now() - startTime;

  // Enhanced results sorting with component type prioritization
  results.sort((a: SearchResult, b: SearchResult) => {
    // First by confidence
    const confidenceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const confidenceDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    if (confidenceDiff !== 0) return confidenceDiff;
    
    // Then by component type (prioritize pages and layouts)
    const componentTypeOrder: Record<string, number> = { 
      page: 5, 
      layout: 4, 
      component: 3, 
      hook: 2, 
      utility: 1,
      undefined: 0
    };
    const componentTypeDiff = (componentTypeOrder[b.componentType || 'undefined'] || 0) - 
                              (componentTypeOrder[a.componentType || 'undefined'] || 0);
    if (componentTypeDiff !== 0) return componentTypeDiff;
    
    // Then by element type (prioritize JSX and style elements)
    const elementTypeOrder: Record<string, number> = {
      jsx: 4,
      style: 3,
      state: 2,
      function: 1,
      import: 0,
      undefined: 0
    };
    return (elementTypeOrder[b.elementType || 'undefined'] || 0) - 
           (elementTypeOrder[a.elementType || 'undefined'] || 0);
  });

  return {
    success: results.length > 0,
    results,
    filesSearched,
    executionTime,
    usedFallback,
    searchType,
    error: results.length === 0 ? 'No matches found for search terms' : undefined
  };
}

/**
 * Format search results for AI consumption with enhanced context and recommendations
 */
export function formatSearchResultsForAI(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No search results found.';
  }

  const sections: string[] = [];
  
  sections.push('🔍 PRECISE SEARCH RESULTS - TARGET LOCATIONS IDENTIFIED:\n');
  
  // Group by file for better readability
  const resultsByFile = new Map<string, SearchResult[]>();
  for (const result of results) {
    if (!resultsByFile.has(result.filePath)) {
      resultsByFile.set(result.filePath, []);
    }
    resultsByFile.get(result.filePath)!.push(result);
  }

  for (const [filePath, fileResults] of resultsByFile) {
    const componentType = fileResults[0].componentType || 'file';
    sections.push(`\n📄 ${componentType.toUpperCase()}: ${filePath}`);
    
    for (const result of fileResults) {
      const elementTypeLabel = result.elementType ? 
        `${result.elementType.toUpperCase()} ELEMENT` : 'CODE';
      
      sections.push(`\n  📍 Line ${result.lineNumber} (${result.confidence.toUpperCase()} confidence) - ${elementTypeLabel}`);
      
      if (result.matchedTerm) {
        sections.push(`     Matched Term: "${result.matchedTerm}"`);
      } else if (result.matchedPattern) {
        sections.push(`     Matched Pattern: ${result.matchedPattern}`);
      }
      
      sections.push(`     Code: ${result.lineContent}`);
      
      if (result.contextBefore.length > 0 || result.contextAfter.length > 0) {
        sections.push(`     Context (for surgical editing):`);
        for (const line of result.contextBefore) {
          sections.push(`       ${line}`);
        }
        sections.push(`     → ${result.lineContent}`);
        for (const line of result.contextAfter) {
          sections.push(`       ${line}`);
        }
      }
    }
  }

  sections.push('\n\n🎯 RECOMMENDED EDIT ACTION:');
  
  // Provide more detailed recommendation based on the best result
  const bestResult = results[0];
  const componentType = bestResult.componentType || 'component';
  const elementType = bestResult.elementType;
  
  if (elementType === 'jsx') {
    sections.push(`Edit JSX in ${bestResult.filePath} at line ${bestResult.lineNumber}`);
    sections.push(`- This is a ${componentType} rendering elements in its return statement`);
    sections.push(`- Make surgical edits to modify ONLY the requested element`);
    sections.push(`- Preserve all other JSX elements and component structure`);
  } else if (elementType === 'style') {
    sections.push(`Update styles in ${bestResult.filePath} at line ${bestResult.lineNumber}`);
    sections.push(`- This is a Tailwind CSS class definition in a ${componentType}`);
    sections.push(`- Change ONLY the specific style classes requested`);
    sections.push(`- Preserve responsive variants (sm:, md:, lg:, etc.)`);
  } else if (elementType === 'state') {
    sections.push(`Modify state in ${bestResult.filePath} at line ${bestResult.lineNumber}`);
    sections.push(`- This is a state definition in a ${componentType}`);
    sections.push(`- Update the state carefully to maintain component functionality`);
  } else {
    sections.push(`Edit ${bestResult.filePath} at line ${bestResult.lineNumber}`);
    sections.push(`- Make precise, targeted changes to fulfill the request`);
    sections.push(`- Preserve existing functionality and structure`);
  }

  return sections.join('\n');
}

/**
 * Select the best file to edit based on search results with enhanced component awareness
 */
export function selectTargetFile(
  results: SearchResult[],
  editType: string
): { filePath: string; lineNumber: number; reason: string } | null {
  if (results.length === 0) return null;

  // For style updates, prefer components over CSS files with specific styling elements
  if (editType === 'UPDATE_STYLE') {
    // First look for style elements in component files
    const styleResult = results.find(r => 
      r.elementType === 'style' && (r.filePath.endsWith('.jsx') || r.filePath.endsWith('.tsx'))
    );
    if (styleResult) {
      return {
        filePath: styleResult.filePath,
        lineNumber: styleResult.lineNumber,
        reason: 'Found component with Tailwind classes to update'
      };
    }
    
    // Then any component file
    const componentResult = results.find(r => 
      r.filePath.endsWith('.jsx') || r.filePath.endsWith('.tsx')
    );
    if (componentResult) {
      return {
        filePath: componentResult.filePath,
        lineNumber: componentResult.lineNumber,
        reason: 'Found component that likely contains styles to update'
      };
    }
  }

  // For remove operations, find the exact JSX element to remove
  if (editType === 'REMOVE_ELEMENT' || editType.includes('DELETE')) {
    const jsxResult = results.find(r => r.elementType === 'jsx');
    if (jsxResult) {
      return {
        filePath: jsxResult.filePath,
        lineNumber: jsxResult.lineNumber,
        reason: 'Found JSX element to remove in component'
      };
    }
    
    // Look for render method if no direct JSX match
    const renderResult = results.find(r => 
      r.lineContent.includes('return') || 
      r.contextAfter.some(line => line.includes('<'))
    );
    if (renderResult) {
      return {
        filePath: renderResult.filePath,
        lineNumber: renderResult.lineNumber,
        reason: 'Found component render method containing element to remove'
      };
    }
  }
  
  // For feature additions, prefer page or layout components
  if (editType === 'ADD_FEATURE') {
    const pageResult = results.find(r => r.componentType === 'page');
    if (pageResult) {
      return {
        filePath: pageResult.filePath,
        lineNumber: pageResult.lineNumber,
        reason: 'Found page component where feature should be added'
      };
    }
    
    const layoutResult = results.find(r => r.componentType === 'layout');
    if (layoutResult) {
      return {
        filePath: layoutResult.filePath,
        lineNumber: layoutResult.lineNumber,
        reason: 'Found layout component where feature should be added'
      };
    }
  }

  // Default: use highest confidence result with enhanced reasoning
  const best = results[0];
  const componentType = best.componentType || 'component';
  const elementType = best.elementType || 'code';
  
  return {
    filePath: best.filePath,
    lineNumber: best.lineNumber,
    reason: `Highest confidence match (${best.confidence}) in ${componentType} ${elementType}`
  };
}