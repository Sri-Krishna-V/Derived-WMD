/**
 * Advanced context selection and prompt engineering for modern React/Tailwind applications
 * 
 * This module intelligently selects files and builds comprehensive system prompts
 * that guide AI code generation with modern web development best practices.
 */

import { FileManifest, EditIntent, EditType } from '@/types/file-manifest';
import { analyzeEditIntent } from '@/lib/edit-intent-analyzer';
import { getEditExamplesPrompt, getComponentPatternPrompt } from '@/lib/edit-examples';

export interface FileContext {
  primaryFiles: string[]; // Files to edit
  contextFiles: string[]; // Files to include for reference
  systemPrompt: string;   // Enhanced prompt with file info and modern practices
  editIntent: EditIntent;
}

/**
 * Select files and build modern context based on user prompt with enhanced intelligence
 * 
 * @param userPrompt - Natural language request from user
 * @param manifest - Complete file manifest with component relationships
 * @returns FileContext with optimized file selection and modern prompt engineering
 */
export function selectFilesForEdit(
  userPrompt: string,
  manifest: FileManifest
): FileContext {
  // Analyze the edit intent with modern pattern recognition
  const editIntent = analyzeEditIntent(userPrompt, manifest);
  
  // Get the files based on intent - only edit target files, but provide all others as context
  const primaryFiles = editIntent.targetFiles;
  const allFiles = Object.keys(manifest.files);
  let contextFiles = allFiles.filter(file => !primaryFiles.includes(file));
  
  // ALWAYS include key architectural files in context if they exist and aren't already primary files
  const keyFiles: string[] = [];
  
  // App.jsx/App.tsx is most important - shows component structure and routing
  const appFile = allFiles.find(f => 
    f.endsWith('App.jsx') || f.endsWith('App.tsx') || 
    f.endsWith('app.jsx') || f.endsWith('app.tsx')
  );
  if (appFile && !primaryFiles.includes(appFile)) {
    keyFiles.push(appFile);
  }
  
  // Main layout component for understanding page structure
  const layoutFile = allFiles.find(f => 
    f.includes('Layout') || f.includes('layout') || 
    f.includes('RootLayout') || f.includes('MainLayout')
  );
  if (layoutFile && !primaryFiles.includes(layoutFile) && !keyFiles.includes(layoutFile)) {
    keyFiles.push(layoutFile);
  }
  
  // Include design system files for style context and Tailwind configuration
  const tailwindConfig = allFiles.find(f => 
    f.endsWith('tailwind.config.js') || f.endsWith('tailwind.config.ts') ||
    f.endsWith('tailwind.config.mjs') || f.endsWith('tailwind.config.cjs')
  );
  if (tailwindConfig && !primaryFiles.includes(tailwindConfig)) {
    keyFiles.push(tailwindConfig);
  }
  
  // Global CSS file (index.css/globals.css) for understanding base styles
  const indexCss = allFiles.find(f => 
    f.endsWith('index.css') || f.endsWith('globals.css') || 
    f.endsWith('main.css') || f.endsWith('app.css')
  );
  if (indexCss && !primaryFiles.includes(indexCss)) {
    keyFiles.push(indexCss);
  }
  
  // Include package.json to understand dependencies and project setup
  const packageJson = allFiles.find(f => f.endsWith('package.json'));
  if (packageJson && !primaryFiles.includes(packageJson)) {
    keyFiles.push(packageJson);
  }
  
  // Include TypeScript config for understanding type setup
  const tsConfig = allFiles.find(f => 
    f.endsWith('tsconfig.json') || f.endsWith('jsconfig.json')
  );
  if (tsConfig && !primaryFiles.includes(tsConfig)) {
    keyFiles.push(tsConfig);
  }
  
  // Put key files at the beginning of context for visibility
  contextFiles = [...keyFiles, ...contextFiles.filter(f => !keyFiles.includes(f))];
  
  // Build enhanced system prompt with modern web development practices
  const systemPrompt = buildAdvancedSystemPrompt(
    userPrompt,
    editIntent,
    primaryFiles,
    contextFiles,
    manifest
  );
  
  return {
    primaryFiles,
    contextFiles,
    systemPrompt,
    editIntent,
  };
}

/**
 * Build an advanced system prompt with modern web development best practices
 * 
 * This function creates comprehensive prompts that guide AI toward:
 * - Modern React patterns (hooks, functional components, proper state management)
 * - Tailwind CSS best practices (utility-first, responsive design, accessibility)
 * - Performance optimization (memoization, code splitting, lazy loading)
 * - Accessibility standards (semantic HTML, ARIA attributes, keyboard navigation)
 * - Mobile-first responsive design principles
 */
function buildAdvancedSystemPrompt(
  userPrompt: string,
  editIntent: EditIntent,
  primaryFiles: string[],
  contextFiles: string[],
  manifest: FileManifest
): string {
  const sections: string[] = [];
  
  // Add modern edit examples and patterns first for better understanding
  if (editIntent.type !== EditType.FULL_REBUILD) {
    sections.push(getEditExamplesPrompt());
  }
  
  // Add comprehensive edit intent section with modern context
  sections.push(`## 🎯 Edit Intent Analysis

**Type**: ${editIntent.type}
**Description**: ${editIntent.description}
**Confidence**: ${(editIntent.confidence * 100).toFixed(0)}%
**User Request**: "${userPrompt}"

### Modern Development Context
This is a ${getProjectType(manifest)} application using:
- **React**: ${getReactVersion(manifest)} with functional components and hooks
- **Styling**: Tailwind CSS utility-first approach
- **Build Tool**: Vite for fast development and optimized builds
- **Architecture**: Component-based with proper separation of concerns`);
  
  // Add comprehensive file structure overview with modern insights
  sections.push(buildModernFileStructureSection(manifest));
  
  // Add React and Tailwind best practices section
  sections.push(getModernPatternsPrompt());
  
  // Add component patterns specific to this project
  const fileList = Object.keys(manifest.files).map(f => f.replace('/home/user/app/', '')).join('\n');
  sections.push(getComponentPatternPrompt(fileList));
  
  // Add primary files section with enhanced context
  if (primaryFiles.length > 0) {
    sections.push(`## 📝 Primary Files to Edit

You MUST edit these files and ONLY these files:
${primaryFiles.map(file => {
      const fileInfo = manifest.files[file];
      const componentName = fileInfo?.componentInfo?.name || file.split('/').pop();
      const fileType = fileInfo?.type || 'unknown';
      return `- **${file}** (${componentName}, type: ${fileType})`;
    }).join('\n')}

### 🚨 CRITICAL EDITING RULES:
1. **SURGICAL PRECISION**: Make ONLY the changes requested in the user prompt
2. **PRESERVE EXISTING**: Keep all existing functionality, styles, and structure intact
3. **MODERN PATTERNS**: Use functional components, hooks, and proper Tailwind classes
4. **COMPLETE FILES**: Return the ENTIRE file content - never truncate or use "..."
5. **RESPONSIVE DESIGN**: Ensure all changes work across mobile, tablet, and desktop`);
  }
  
  // Add context files section with intelligent prioritization
  if (contextFiles.length > 0) {
    const prioritizedContext = prioritizeContextFiles(contextFiles, manifest);
    sections.push(`## 📚 Context Files (Reference Only)

These files provide context for understanding the project structure:

### 🏗️ Architecture Files:
${prioritizedContext.architecture.map(file => `- ${file}`).join('\n')}

### 🎨 Styling Files:
${prioritizedContext.styling.map(file => `- ${file}`).join('\n')}

### 🧩 Component Files:
${prioritizedContext.components.slice(0, 10).map(file => `- ${file}`).join('\n')}
${prioritizedContext.components.length > 10 ? `... and ${prioritizedContext.components.length - 10} more components` : ''}

**DO NOT EDIT THESE FILES** - they are for reference only.`);
  }
  
  // Add specific instructions based on edit type with modern practices
  sections.push(buildModernEditInstructions(editIntent.type, userPrompt));
  
  // Add component relationships if relevant
  if (editIntent.type === EditType.UPDATE_COMPONENT || 
      editIntent.type === EditType.ADD_FEATURE) {
    sections.push(buildComponentRelationships(primaryFiles, manifest));
  }
  
  // Add performance and accessibility guidelines
  sections.push(getPerformanceAndAccessibilityGuidelines());
  
  return sections.join('\n\n');
}

/**
 * Helper function to get project type from manifest
 */
function getProjectType(manifest: FileManifest): string {
  const files = Object.keys(manifest.files);
  
  // Check for Next.js patterns
  if (files.some(f => f.includes('next.config') || f.includes('pages/') || f.includes('app/'))) {
    return 'Next.js';
  }
  
  // Check for Vite patterns
  if (files.some(f => f.includes('vite.config') || f.includes('index.html'))) {
    return 'Vite + React';
  }
  
  // Check for Create React App patterns
  if (files.some(f => f.includes('public/index.html') && f.includes('src/App'))) {
    return 'Create React App';
  }
  
  return 'React';
}

/**
 * Helper function to get React version from manifest
 */
function getReactVersion(manifest: FileManifest): string {
  const packageJson = Object.entries(manifest.files)
    .find(([path]) => path.endsWith('package.json'));
  
  if (packageJson && packageJson[1].content) {
    try {
      const pkg = JSON.parse(packageJson[1].content);
      const reactVersion = pkg.dependencies?.react || pkg.devDependencies?.react;
      if (reactVersion) {
        return reactVersion.replace('^', '').replace('~', '');
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  return '18+';
}

/**
 * Build modern file structure section with enhanced architecture insights
 */
function buildModernFileStructureSection(manifest: FileManifest): string {
  const allFiles = Object.entries(manifest.files)
    .map(([path]) => path.replace('/home/user/app/', ''))
    .filter(path => !path.includes('node_modules'))
    .sort();
  
  const componentFiles = Object.entries(manifest.files)
    .filter(([, info]) => info.type === 'component' || info.type === 'page')
    .map(([path, info]) => ({
      path: path.replace('/home/user/app/', ''),
      name: info.componentInfo?.name || path.split('/').pop(),
      type: info.type,
    }));
  
  return `## 🏗️ Modern Project Architecture

### Project Type: ${getProjectType(manifest)}
### React Version: ${getReactVersion(manifest)}

### 📁 ALL PROJECT FILES (${allFiles.length} files)
\`\`\`
${allFiles.join('\n')}
\`\`\`

### 🧩 Component Architecture
${componentFiles.map(f => 
  `- **${f.name}** → \`${f.path}\` (${f.type})`
).join('\n')}

### 🎯 Modern Development Patterns
- **Component Strategy**: Functional components with hooks
- **Styling Approach**: Tailwind CSS utility-first
- **State Management**: React hooks (useState, useEffect, useContext)
- **Performance**: Lazy loading, memoization where appropriate
- **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation

### 🚨 CRITICAL Component Guidelines
**ALWAYS CHECK App.jsx/App.tsx FIRST** to understand existing component structure!

**Common Architecture Patterns:**
- Navigation usually lives in Header/Layout components
- Shared UI elements belong in \`components/ui/\` directory
- Page components should be in \`pages/\` or \`app/\` directory
- Business logic components in \`components/\` directory

**Entry Point:** ${manifest.entryPoint}

### 🗺️ Routing Structure
${manifest.routes.map(r => 
  `- \`${r.path}\` → ${r.component.split('/').pop()}`
).join('\n') || 'No routes detected'}`;
}

/**
 * Get modern patterns prompt with comprehensive best practices
 */
function getModernPatternsPrompt(): string {
  return `## 🎨 Modern React & Tailwind CSS Best Practices

### ⚛️ React Patterns (2024)
- **Components**: Use functional components exclusively
- **Hooks**: Prefer \`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`
- **Props**: Use TypeScript interfaces for prop typing
- **State**: Keep state close to where it's used
- **Performance**: Use React.memo() for expensive components
- **Error Boundaries**: Implement for robust error handling

### 🎨 Tailwind CSS Standards
- **Utility-First**: Use utility classes instead of custom CSS
- **Responsive Design**: Mobile-first with \`sm:\`, \`md:\`, \`lg:\`, \`xl:\` prefixes
- **Color System**: Use semantic colors like \`bg-blue-500\`, \`text-gray-900\`
- **Spacing**: Consistent spacing with \`p-4\`, \`m-6\`, \`space-y-4\`
- **Flexbox/Grid**: \`flex\`, \`grid\`, \`justify-center\`, \`items-center\`

### 📱 Modern Responsive Design
\`\`\`jsx
// Mobile-first responsive component
<div className="w-full p-4 sm:p-6 md:p-8">
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
    Responsive Heading
  </h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Responsive grid items */}
  </div>
</div>
\`\`\`

### ♿ Accessibility Requirements
- **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3)
- **ARIA Labels**: Add \`aria-label\`, \`aria-describedby\` where needed
- **Keyboard Navigation**: Ensure all interactive elements are focusable
- **Color Contrast**: Maintain WCAG AA standards
- **Screen Readers**: Provide descriptive alt text for images

### 🚀 Performance Optimizations
- **Code Splitting**: Use \`React.lazy()\` for route-based splitting
- **Image Optimization**: Use \`next/image\` or proper \`loading="lazy"\`
- **Bundle Size**: Tree-shake unused dependencies
- **Memoization**: Use \`useMemo\` and \`useCallback\` for expensive operations`;
}

/**
 * Prioritize context files for better AI understanding
 */
function prioritizeContextFiles(contextFiles: string[], manifest: FileManifest): {
  architecture: string[];
  styling: string[];
  components: string[];
} {
  const architecture: string[] = [];
  const styling: string[] = [];
  const components: string[] = [];
  
  for (const file of contextFiles) {
    const fileName = file.toLowerCase();
    
    // Architecture files
    if (fileName.includes('app.') || fileName.includes('layout') || 
        fileName.includes('package.json') || fileName.includes('config') ||
        fileName.includes('tsconfig') || fileName.includes('index.html')) {
      architecture.push(file);
    }
    // Styling files
    else if (fileName.includes('css') || fileName.includes('tailwind') ||
             fileName.includes('style') || fileName.includes('theme')) {
      styling.push(file);
    }
    // Component files
    else if (fileName.includes('component') || fileName.endsWith('.jsx') || 
             fileName.endsWith('.tsx') || fileName.includes('pages/')) {
      components.push(file);
    }
    else {
      components.push(file); // Default to components
    }
  }
  
  return { architecture, styling, components };
}

/**
 * Build modern edit instructions based on edit type
 */
function buildModernEditInstructions(editType: EditType, userPrompt: string): string {
  const baseInstructions = `## 🎯 Modern Edit Instructions

### 🚨 CRITICAL RULES
1. **PRECISION EDITING**: Make ONLY the changes requested - no unnecessary refactoring
2. **COMPLETE FILES**: Return ENTIRE file content - never truncate with "..."
3. **MODERN PATTERNS**: Use functional components, hooks, proper Tailwind classes
4. **RESPONSIVE DESIGN**: Ensure all changes work on mobile, tablet, and desktop
5. **ACCESSIBILITY**: Maintain semantic HTML and ARIA attributes`;
  
  const typeSpecificInstructions: Record<EditType, string> = {
    [EditType.UPDATE_COMPONENT]: `
### 🔧 Component Update Strategy
- **Surgical Precision**: Change only the specific element/feature mentioned
- **Preserve Structure**: Keep existing component architecture intact
- **Modern Hooks**: Use useState/useEffect if adding new functionality
- **Tailwind Classes**: Update styles using utility classes, not custom CSS
- **Responsive**: Ensure changes work across all screen sizes

**Example**: If user says "change button color to blue":
- Find the button element
- Change ONLY the color classes: \`bg-red-500 hover:bg-red-600\` → \`bg-blue-500 hover:bg-blue-600\`
- Keep all other classes and functionality identical`,
    
    [EditType.ADD_FEATURE]: `
### ➕ Feature Addition Strategy
- **Component Creation**: Build new components as functional components with hooks
- **Integration**: Update parent components to import and use new features
- **Modern Patterns**: Use latest React patterns and Tailwind utilities
- **Performance**: Implement lazy loading if adding large features
- **Testing**: Ensure new features don't break existing functionality`,
    
    [EditType.UPDATE_STYLE]: `
### 🎨 Style Update Strategy
- **Utility-First**: Use Tailwind classes instead of custom CSS
- **Responsive**: Apply mobile-first responsive design principles
- **Consistency**: Match existing design system and spacing
- **Accessibility**: Maintain color contrast and focus states
- **Modern Classes**: Use current Tailwind syntax and best practices

**Example Tailwind Transformations**:
- Colors: \`bg-primary\` → \`bg-blue-500\`
- Spacing: \`p-sm\` → \`p-4\`
- Responsive: \`w-full lg:w-1/2\` for responsive widths`,
    
    [EditType.FIX_ISSUE]: `
### 🔧 Issue Resolution Strategy
- **Root Cause**: Identify and fix the underlying problem
- **Modern Solutions**: Use current React patterns and Tailwind utilities
- **Error Handling**: Add proper error boundaries and validation
- **Performance**: Fix any performance bottlenecks
- **Accessibility**: Ensure fixes don't break accessibility features`,
    
    [EditType.REFACTOR]: `
### 🏗️ Refactoring Strategy
- **Modern Patterns**: Convert to functional components with hooks
- **Performance**: Add memoization and optimization where beneficial
- **Maintainability**: Improve code structure without changing functionality
- **Best Practices**: Apply current React and Tailwind standards
- **Testing**: Ensure refactored code maintains all existing behavior`,
    
    [EditType.FULL_REBUILD]: `
### 🏗️ Full Rebuild Strategy
- **Modern Architecture**: Use latest React patterns and project structure
- **Design System**: Implement consistent Tailwind-based design system
- **Performance**: Build with optimization in mind from the start
- **Accessibility**: Ensure full WCAG compliance
- **Responsive**: Mobile-first design with all breakpoints covered`,
    
    [EditType.ADD_DEPENDENCY]: `
### 📦 Dependency Addition Strategy
- **Package Management**: Update package.json with proper version constraints
- **Integration**: Add necessary import statements and configurations
- **TypeScript**: Include type definitions if using TypeScript
- **Modern Usage**: Use latest API patterns for new dependencies
- **Testing**: Verify new dependencies work with existing code`
  };
  
  const specificInstructions = typeSpecificInstructions[editType] || typeSpecificInstructions[EditType.UPDATE_COMPONENT];
  
  return baseInstructions + specificInstructions + `

### 📝 Output Requirements
- **Complete Files**: Include ALL content - imports, functions, JSX, closing tags
- **Modern Syntax**: Use current React and Tailwind best practices
- **Clean Code**: Proper indentation, consistent formatting
- **Comments**: Add helpful comments for complex logic
- **Validation**: Ensure all syntax is correct and functional

**User Request Context**: "${userPrompt}"`;
}

/**
 * Get performance and accessibility guidelines
 */
function getPerformanceAndAccessibilityGuidelines(): string {
  return `## 🚀 Performance & Accessibility Guidelines

### ⚡ Performance Best Practices
- **Component Optimization**: Use React.memo() for components that re-render frequently
- **Hook Optimization**: Use useMemo() and useCallback() for expensive operations
- **Image Optimization**: Implement proper lazy loading and responsive images
- **Code Splitting**: Use dynamic imports for large components
- **Bundle Analysis**: Keep bundle size optimized

\`\`\`jsx
// Performance-optimized component example
const OptimizedComponent = React.memo(({ data, onUpdate }) => {
  const expensiveValue = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);
  
  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);
  
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">{expensiveValue}</h2>
      {/* Component content */}
    </div>
  );
});
\`\`\`

### ♿ Accessibility Standards
- **Semantic HTML**: Use proper HTML elements (header, nav, main, section, article)
- **ARIA Attributes**: Add aria-label, aria-describedby, role where needed
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader Support**: Meaningful alt text and descriptive content

\`\`\`jsx
// Accessible component example
<button
  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  aria-label="Submit form"
  onClick={handleSubmit}
>
  Submit
</button>
\`\`\`

### 📱 Mobile-First Responsive Design
- **Breakpoints**: Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- **Touch Targets**: Ensure interactive elements are at least 44px
- **Content Priority**: Show most important content first on mobile
- **Performance**: Optimize for mobile network conditions

\`\`\`jsx
// Mobile-first responsive layout
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg sm:text-xl font-semibold mb-2">Card Title</h3>
      <p className="text-sm sm:text-base text-gray-600">Card content</p>
    </div>
  </div>
</div>
\`\`\``;
}

/**
 * Build file structure overview section
 */
function buildFileStructureSection(manifest: FileManifest): string {
  const allFiles = Object.entries(manifest.files)
    .map(([path]) => path.replace('/home/user/app/', ''))
    .filter(path => !path.includes('node_modules'))
    .sort();
  
  const componentFiles = Object.entries(manifest.files)
    .filter(([, info]) => info.type === 'component' || info.type === 'page')
    .map(([path, info]) => ({
      path: path.replace('/home/user/app/', ''),
      name: info.componentInfo?.name || path.split('/').pop(),
      type: info.type,
    }));
  
  return `## 🚨 EXISTING PROJECT FILES - DO NOT CREATE NEW FILES WITH SIMILAR NAMES 🚨

### ALL PROJECT FILES (${allFiles.length} files)
\`\`\`
${allFiles.join('\n')}
\`\`\`

### Component Files (USE THESE EXACT NAMES)
${componentFiles.map(f => 
  `- ${f.name} → ${f.path} (${f.type})`
).join('\n')}

### CRITICAL: Component Relationships
**ALWAYS CHECK App.jsx FIRST** to understand what components exist and how they're imported!

Common component overlaps to watch for:
- "nav" or "navigation" → Often INSIDE Header.jsx, not a separate file
- "menu" → Usually part of Header/Nav, not separate
- "logo" → Typically in Header, not standalone

When user says "nav" or "navigation":
1. First check if Header.jsx exists
2. Look inside Header.jsx for navigation elements
3. Only create Nav.jsx if navigation doesn't exist anywhere

Entry Point: ${manifest.entryPoint}

### Routes
${manifest.routes.map(r => 
  `- ${r.path} → ${r.component.split('/').pop()}`
).join('\n') || 'No routes detected'}`;
}

/**
 * Build edit-type specific instructions
 */
function buildEditInstructions(editType: EditType): string {
  const instructions: Record<EditType, string> = {
    [EditType.UPDATE_COMPONENT]: `## SURGICAL EDIT INSTRUCTIONS
- You MUST preserve 99% of the original code
- ONLY edit the specific component(s) mentioned
- Make ONLY the minimal change requested
- DO NOT rewrite or refactor unless explicitly asked
- DO NOT remove any existing code unless explicitly asked
- DO NOT change formatting or structure
- Preserve all imports and exports
- Maintain the existing code style
- Return the COMPLETE file with the surgical change applied
- Think of yourself as a surgeon making a precise incision, not an artist repainting`,
    
    [EditType.ADD_FEATURE]: `## Instructions
- Create new components in appropriate directories
- IMPORTANT: Update parent components to import and use the new component
- Update routing if adding new pages
- Follow existing patterns and conventions
- Add necessary styles to match existing design
- Example workflow:
  1. Create NewComponent.jsx
  2. Import it in the parent: import NewComponent from './NewComponent'
  3. Use it in the parent's render: <NewComponent />`,
    
    [EditType.FIX_ISSUE]: `## Instructions
- Identify and fix the specific issue
- Test the fix doesn't break other functionality
- Preserve existing behavior except for the bug
- Add error handling if needed`,
    
    [EditType.UPDATE_STYLE]: `## SURGICAL STYLE EDIT INSTRUCTIONS
- Change ONLY the specific style/class mentioned
- If user says "change background to blue", change ONLY the background class
- DO NOT touch any other styles, classes, or attributes
- DO NOT refactor or "improve" the styling
- DO NOT change the component structure
- Preserve ALL other classes and styles exactly as they are
- Return the COMPLETE file with only the specific style change`,
    
    [EditType.REFACTOR]: `## Instructions
- Improve code quality without changing functionality
- Follow project conventions
- Maintain all existing features
- Improve readability and maintainability`,
    
    [EditType.FULL_REBUILD]: `## Instructions
- You may rebuild the entire application
- Keep the same core functionality
- Improve upon the existing design
- Use modern best practices`,
    
    [EditType.ADD_DEPENDENCY]: `## Instructions
- Update package.json with new dependency
- Add necessary import statements
- Configure the dependency if needed
- Update any build configuration`,
  };
  
  return instructions[editType] || instructions[EditType.UPDATE_COMPONENT];
}

/**
 * Build component relationship information
 */
function buildComponentRelationships(
  files: string[],
  manifest: FileManifest
): string {
  const relationships: string[] = ['## Component Relationships'];
  
  for (const file of files) {
    const fileInfo = manifest.files[file];
    if (!fileInfo?.componentInfo) continue;
    
    const componentName = fileInfo.componentInfo.name;
    const treeNode = manifest.componentTree[componentName];
    
    if (treeNode) {
      relationships.push(`\n### ${componentName}`);
      
      if (treeNode.imports.length > 0) {
        relationships.push(`Imports: ${treeNode.imports.join(', ')}`);
      }
      
      if (treeNode.importedBy.length > 0) {
        relationships.push(`Used by: ${treeNode.importedBy.join(', ')}`);
      }
      
      if (fileInfo.componentInfo.childComponents?.length) {
        relationships.push(`Renders: ${fileInfo.componentInfo.childComponents.join(', ')}`);
      }
    }
  }
  
  return relationships.join('\n');
}

/**
 * Get file content for selected files
 */
export async function getFileContents(
  files: string[],
  manifest: FileManifest
): Promise<Record<string, string>> {
  const contents: Record<string, string> = {};
  
  for (const file of files) {
    const fileInfo = manifest.files[file];
    if (fileInfo) {
      contents[file] = fileInfo.content;
    }
  }
  
  return contents;
}

/**
 * Format files for AI context
 */
export function formatFilesForAI(
  primaryFiles: Record<string, string>,
  contextFiles: Record<string, string>
): string {
  const sections: string[] = [];
  
  // Add primary files
  sections.push('## Files to Edit (ONLY OUTPUT THESE FILES)\n');
  sections.push('🚨 You MUST ONLY generate the files listed below. Do NOT generate any other files! 🚨\n');
  sections.push('⚠️ CRITICAL: Return the COMPLETE file - NEVER truncate with "..." or skip any lines! ⚠️\n');
  sections.push('The file MUST include ALL imports, ALL functions, ALL JSX, and ALL closing tags.\n\n');
  for (const [path, content] of Object.entries(primaryFiles)) {
    sections.push(`### ${path}
**IMPORTANT: This is the COMPLETE file. Your output must include EVERY line shown below, modified only where necessary.**
\`\`\`${getFileExtension(path)}
${content}
\`\`\`
`);
  }
  
  // Add context files if any - but truncate large files
  if (Object.keys(contextFiles).length > 0) {
    sections.push('\n## Context Files (Reference Only - Do Not Edit)\n');
    for (const [path, content] of Object.entries(contextFiles)) {
      // Truncate very large context files to save tokens
      let truncatedContent = content;
      if (content.length > 2000) {
        truncatedContent = content.substring(0, 2000) + '\n// ... [truncated for context length]';
      }
      
      sections.push(`### ${path}
\`\`\`${getFileExtension(path)}
${truncatedContent}
\`\`\`
`);
    }
  }
  
  return sections.join('\n');
}

/**
 * Get file extension for syntax highlighting
 */
function getFileExtension(path: string): string {
  const ext = path.split('.').pop() || '';
  const mapping: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'json': 'json',
  };
  return mapping[ext] || ext;
}