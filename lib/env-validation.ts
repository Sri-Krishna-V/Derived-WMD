import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Required
  E2B_API_KEY: z.string().min(1, 'E2B_API_KEY is required'),
  FIRECRAWL_API_KEY: z.string().min(1, 'FIRECRAWL_API_KEY is required'),
  
  // At least one AI provider is required
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  
  // Optional
  NEXT_PUBLIC_TAMBO_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and throws if any required ones are missing
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    
    // Check that at least one AI provider key is present
    const hasAIProvider = !!(
      env.ANTHROPIC_API_KEY ||
      env.OPENAI_API_KEY ||
      env.GEMINI_API_KEY ||
      env.GROQ_API_KEY
    );
    
    if (!hasAIProvider) {
      throw new Error(
        'At least one AI provider API key is required: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY'
      );
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\nPlease check your .env file or environment variables in Vercel.`
      );
    }
    throw error;
  }
}

/**
 * Gets a validated environment variable
 */
export function getEnv(): Env {
  return validateEnv();
}

/**
 * Checks if the app is running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if the app is running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Gets the app URL based on environment
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
}

// Validate on module load in production
if (isProduction()) {
  validateEnv();
}
