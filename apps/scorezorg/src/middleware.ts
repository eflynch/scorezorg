import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    
    // Get allowed origins from environment variable
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
    let allowedOrigins: string[] = ['*']; // Default to allow all for development
    
    if (allowedOriginsEnv && allowedOriginsEnv !== '*') {
      allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());
    }
    
    // Check if origin is allowed
    const isAllowed = !origin || 
                     allowedOrigins.includes('*') || 
                     allowedOrigins.includes(origin);
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? (origin || allowedOrigins[0]) : 'null',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // For non-preflight requests, reject if origin is not allowed
    if (!isAllowed && allowedOrigins[0] !== '*') {
      return new NextResponse(
        JSON.stringify({ error: 'CORS: Origin not allowed' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
