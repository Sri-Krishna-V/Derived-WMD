import { NextRequest, NextResponse } from 'next/server';
import { createGroq } from '@ai-sdk/groq';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { FileManifest } from '@/types/file-manifest';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Schema for the AI's search plan - not file selection!
const searchPlanSchema = z.object({
  editType: z.enum([
    'UPDATE_COMPONENT',
    'ADD_FEATURE', 
    'FIX_ISSUE',
    'UPDATE_STYLE',
    'REFACTOR',
    'ADD_DEPENDENCY',
    'REMOVE_ELEMENT'
  ]).describe('The type of edit being requested'),
  
  reasoning: z.string().describe('Explanation of the search strategy'),
  
  searchTerms: z.array(z.string()).describe('Specific text to search for (case-insensitive). Be VERY specific - exact button text, class names, etc.'),
  
  regexPatterns: z.array(z.string()).optional().describe('Regex patterns for finding code structures (e.g., "className=[\\"\\\'].*header.*[\\"\\\']")'),
  
  fileTypesToSearch: z.array(z.string()).default(['.jsx', '.tsx', '.js', '.ts']).describe('File extensions to search'),
  
  expectedMatches: z.number().min(1).max(10).default(1).describe('Expected number of matches (helps validate search worked)'),
  
  fallbackSearch: z.object({
    terms: z.array(z.string()),
    patterns: z.array(z.string()).optional()
  }).optional().describe('Backup search if primary fails')
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, manifest, model = 'google/gemini-2.5-pro' } = await request.json();
    
    console.log('[analyze-edit-intent] Request received');
    console.log('[analyze-edit-intent] Prompt:', prompt);
    console.log('[analyze-edit-intent] Model:', model);
    console.log('[analyze-edit-intent] Manifest files count:', manifest?.files ? Object.keys(manifest.files).length : 0);
    
    if (!prompt || !manifest) {
      return NextResponse.json({
        error: 'prompt and manifest are required'
      }, { status: 400 });
    }
    
    // Create a summary of available files for the AI
    const validFiles = Object.entries(manifest.files as Record<string, any>)
      .filter(([path, info]) => {
        // Filter out invalid paths
        return path.includes('.') && !path.match(/\/\d+$/);
      });
    
    const fileSummary = validFiles
      .map(([path, info]: [string, any]) => {
        const componentName = info.componentInfo?.name || path.split('/').pop();
        const hasImports = info.imports?.length > 0;
        const childComponents = info.componentInfo?.childComponents?.join(', ') || 'none';
        return `- ${path} (${componentName}, renders: ${childComponents})`;
      })
      .join('\n');
    
    console.log('[analyze-edit-intent] Valid files found:', validFiles.length);
    
    if (validFiles.length === 0) {
      console.error('[analyze-edit-intent] No valid files found in manifest');
      return NextResponse.json({
        success: false,
        error: 'No valid files found in manifest'
      }, { status: 400 });
    }
    
    console.log('[analyze-edit-intent] Analyzing prompt:', prompt);
    console.log('[analyze-edit-intent] File summary preview:', fileSummary.split('\n').slice(0, 5).join('\n'));
    
    // Select the appropriate AI model based on the request
    let aiModel;
    if (model.startsWith('anthropic/')) {
      aiModel = anthropic(model.replace('anthropic/', ''));
    } else if (model.startsWith('openai/')) {
      if (model.includes('gpt-oss')) {
        aiModel = groq(model);
      } else {
        aiModel = openai(model.replace('openai/', ''));
      }
    } else if (model.startsWith('google/')) {
      aiModel = googleGenerativeAI(model.replace('google/', ''));
    } else {
      // Default to groq if model format is unclear
      aiModel = groq(model);
    }
    
    console.log('[analyze-edit-intent] Using AI model:', model);
    
    // Use AI to create a search plan
    const result = await generateObject({
      model: aiModel,
      schema: searchPlanSchema,
      messages: [
        {
          role: 'system',
          content: `You are an expert React/Tailwind CSS code analyzer specializing in modern web development patterns. Your job is to create a surgical search strategy to locate exact code that needs modification.

## Core Principles

You MUST understand modern component architecture:
- React functional components with hooks (useState, useEffect, useMemo, etc.)
- Tailwind CSS utility-first styling approach
- Component composition and prop passing patterns
- Responsive design with mobile-first approach

## Search Strategy Framework

### 1. Text Content Changes
**Pattern**: "change 'Start Deploying' to 'Go Now'"
**Strategy**: 
- Search for EXACT text: "Start Deploying"
- Search for button/link patterns: "<button", "<a href", "onClick"
- Include JSX text patterns: "Start Deploying", template literals

### 2. Component Styling Changes
**Pattern**: "make header background blue"
**Strategy**:
- Component names: "Header", "header", "<Header"
- Tailwind classes: "bg-", "background", "className"
- Responsive patterns: "sm:", "md:", "lg:", "xl:"
- Modern Tailwind: "bg-blue-500", "bg-sky-600" (avoid deprecated names)

### 3. Layout and Structure Changes
**Pattern**: "add responsive grid layout"
**Strategy**:
- Layout components: "grid", "flex", "container"
- Responsive utilities: "grid-cols-", "sm:grid-cols-", "md:grid-cols-"
- Container queries: "@container", "@sm:", "@md:"

### 4. Component Removal/Addition
**Pattern**: "remove the newsletter signup"
**Strategy**:
- Component imports: "import", "Newsletter", "Signup"
- JSX usage: "<Newsletter", "<Signup", "newsletter", "signup"
- Form elements: "<form", "input", "email", "subscribe"

### 5. Interactive Element Changes
**Pattern**: "add hover effects to buttons"
**Strategy**:
- Interactive elements: "<button", "onClick", "onSubmit"
- State utilities: "hover:", "focus:", "active:", "disabled:"
- Transition classes: "transition", "duration", "ease"

## Modern Patterns Recognition

**Component Architecture**:
- Functional components: "function Component", "const Component", "=> {"
- Hooks usage: "useState", "useEffect", "useMemo", "useCallback"
- Props destructuring: "({", "props.", "...props"

**Tailwind CSS Standards** (CRITICAL - Use ONLY these patterns):
- Colors: "bg-blue-500", "text-gray-900", "border-gray-200" (NOT "bg-primary", "text-foreground")
- Spacing: "p-4", "m-8", "gap-6", "space-y-4"
- Layout: "flex", "grid", "block", "inline-block"
- Responsive: "sm:text-lg", "md:grid-cols-2", "lg:px-8"
- States: "hover:bg-blue-700", "focus:ring-2", "active:scale-95"

**Responsive Design Patterns**:
- Mobile-first: Start with base classes, add responsive prefixes
- Breakpoints: "sm:" (640px), "md:" (768px), "lg:" (1024px), "xl:" (1280px)
- Container queries: "@container", "@sm:", "@md:", "@lg:"

## Search Term Generation Rules

You MUST be EXTREMELY specific:
1. **Exact Text Matching**: Include exact capitalization and punctuation
2. **Component Patterns**: Search for both PascalCase and lowercase versions
3. **CSS Class Patterns**: Include both single classes and compound patterns
4. **JSX Patterns**: Account for template literals, variables, and conditional rendering

## Regex Pattern Guidelines

**Component Search**: /<[A-Z][a-zA-Z]*[^>]*className[^>]*header[^>]*/i
**Tailwind Class Search**: /className=["']\\s*[^"']*bg-[^"']*["']/
**Text Content Search**: />\\s*Start Deploying\\s*</
**Import Search**: /import.*{.*Header.*}.*from/

Current project structure for context:
${fileSummary}`
        },
        {
          role: 'user',
          content: `User request: "${prompt}"

Create a search plan to find the exact code that needs to be modified. Include specific search terms and patterns.`
        }
      ]
    });
    
    console.log('[analyze-edit-intent] Search plan created:', {
      editType: result.object.editType,
      searchTerms: result.object.searchTerms,
      patterns: result.object.regexPatterns?.length || 0,
      reasoning: result.object.reasoning
    });
    
    // Return the search plan, not file matches
    return NextResponse.json({
      success: true,
      searchPlan: result.object
    });
    
  } catch (error) {
    console.error('[analyze-edit-intent] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}