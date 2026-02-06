import { NextRequest, NextResponse } from 'next/server';
import { getEnv, isProduction } from './env-validation';

/**
 * Simple API key authentication for production
 * In production, you should implement proper authentication (JWT, OAuth, etc.)
 */
export function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Skip auth in development
    if (!isProduction()) {
      return handler(request);
    }

    // In production, you can implement various auth strategies:
    // 1. API Key in header
    // 2. JWT token validation
    // 3. Session-based auth
    // 4. OAuth integration
    
    // Example: Simple API key check (customize based on your needs)
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.API_SECRET_KEY;
    
    // If API_SECRET_KEY is not set, allow all requests (but log warning)
    if (!validApiKey) {
      console.warn('⚠️  API_SECRET_KEY not set. API routes are unprotected!');
      return handler(request);
    }
    
    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing API key.' },
        { status: 401 }
      );
    }

    return handler(request);
  };
}

/**
 * CORS configuration for API routes
 */
export function withCORS(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': getAllowedOrigin(request),
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(request);
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', getAllowedOrigin(request));
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    
    return response;
  };
}

/**
 * Get allowed origin based on environment
 */
function getAllowedOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  
  // In development, allow all origins
  if (!isProduction()) {
    return origin || '*';
  }
  
  // In production, only allow specific origins
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean) as string[];
  
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  // Default to first allowed origin
  return allowedOrigins[0] || '*';
}

/**
 * Error handler wrapper for API routes
 */
export function withErrorHandler(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      
      // Don't expose internal errors in production
      const message = isProduction() 
        ? 'An internal server error occurred'
        : error instanceof Error ? error.message : 'Unknown error';
      
      return NextResponse.json(
        { 
          error: message,
          ...(isProduction() ? {} : { stack: error instanceof Error ? error.stack : undefined })
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: any) => any>) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * Example: Protect an API route with auth, CORS, and error handling
 * 
 * Usage:
 * export const POST = protectedRoute(async (request: NextRequest) => {
 *   // Your handler logic here
 *   return NextResponse.json({ success: true });
 * });
 */
export const protectedRoute = compose(
  withErrorHandler,
  withCORS,
  // withAuth // Uncomment when you want to enable authentication
);
