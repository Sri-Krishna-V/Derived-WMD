import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Tiered rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Different limits for different endpoint types
const RATE_LIMITS = {
  // AI-heavy endpoints (most expensive)
  ai_generation: { limit: 10, window: RATE_LIMIT_WINDOW },
  // Code application endpoints
  code_application: { limit: 20, window: RATE_LIMIT_WINDOW },
  // Sandbox management
  sandbox: { limit: 5, window: RATE_LIMIT_WINDOW },
  // Status checks and light endpoints
  status: { limit: 20, window: RATE_LIMIT_WINDOW },
  // Default for other API routes
  default: { limit: 10, window: RATE_LIMIT_WINDOW }
};

// Simple in-memory rate limiter (use Redis in production for multi-instance deployments)
const rateLimitMap = new Map<string, Map<string, { count: number; resetTime: number }>>();

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : (request as any).ip || 'unknown';
  return ip;
}

function getEndpointTier(pathname: string): keyof typeof RATE_LIMITS {
  // AI generation endpoints (most expensive)
  if (pathname.includes('/generate-ai-code') || 
      pathname.includes('/classify-intent') ||
      pathname.includes('/analyze-edit-intent')) {
    return 'ai_generation';
  }
  
  // Code application endpoints
  if (pathname.includes('/apply-ai-code') || 
      pathname.includes('/detect-and-install-packages')) {
    return 'code_application';
  }
  
  // Sandbox management
  if (pathname.includes('/create-ai-sandbox') || 
      pathname.includes('/kill-sandbox') ||
      pathname.includes('/install-packages') ||
      pathname.includes('/restart-vite')) {
    return 'sandbox';
  }
  
  // Status/health checks
  if (pathname.includes('/sandbox-status') || 
      pathname.includes('/conversation-state') ||
      pathname.includes('/check-vite-errors')) {
    return 'status';
  }
  
  return 'default';
}

function checkRateLimit(key: string, tier: keyof typeof RATE_LIMITS): { allowed: boolean; remaining: number; limit: number } {
  const now = Date.now();
  const config = RATE_LIMITS[tier];
  
  // Get or create IP-specific rate limit map
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, new Map());
  }
  const ipLimits = rateLimitMap.get(key)!;
  
  const record = ipLimits.get(tier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    ipLimits.set(tier, {
      count: 1,
      resetTime: now + config.window,
    });
    return { allowed: true, remaining: config.limit - 1, limit: config.limit };
  }

  if (record.count >= config.limit) {
    return { allowed: false, remaining: 0, limit: config.limit };
  }

  record.count++;
  return { allowed: true, remaining: config.limit - record.count, limit: config.limit };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, tierMap] of rateLimitMap.entries()) {
    for (const [tier, record] of tierMap.entries()) {
      if (now > record.resetTime) {
        tierMap.delete(tier);
      }
    }
    // Remove IP entry if no tiers remaining
    if (tierMap.size === 0) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Detect WebSocket upgrade requests
    const isWebSocketUpgrade = 
      request.headers.get('upgrade')?.toLowerCase() === 'websocket' ||
      request.headers.get('connection')?.toLowerCase().includes('upgrade');
    
    // Exempt WebSocket connections from HTTP rate limiting
    // WebSocket connections are used for MCP and streaming operations
    if (isWebSocketUpgrade) {
      const response = NextResponse.next();
      // Add WebSocket-specific headers if needed
      response.headers.set('X-WebSocket-Exempt', 'true');
      return response;
    }
    
    const key = getRateLimitKey(request);
    const tier = getEndpointTier(request.nextUrl.pathname);
    const { allowed, remaining, limit } = checkRateLimit(key, tier);

    if (!allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          tier: tier,
          limit: limit,
          retryAfter: 60
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString(),
            'X-RateLimit-Tier': tier,
          }
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Tier', tier);
    
    return response;
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Content Security Policy
  // Note: unsafe-eval is NOT included in the main application CSP for security.
  // The E2B sandbox iframe (from e2b.dev domain) has its own CSP headers
  // that allow what it needs. This ensures sandbox code cannot execute in the main app.
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Next.js, NO unsafe-eval for security
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.e2b.app https://*.e2b.dev https://*.firecrawl.dev https://*.anthropic.com https://*.openai.com https://*.googleapis.com https://*.groq.com https://*.tambo.co wss://*.e2b.app wss://*.e2b.dev",
      "frame-src 'self' https://*.e2b.app https://*.e2b.dev", // Restricted to E2B domains only
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  );

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
