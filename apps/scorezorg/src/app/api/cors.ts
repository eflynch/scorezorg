import { NextRequest, NextResponse } from 'next/server';

export function cors(req: NextRequest) {
  // Get the origin of the request
  const origin = req.headers.get('origin');
  
  // In production, you might want to restrict origins
  // For now, we'll allow all origins for flexibility
  
  // For development and flexibility, allow all origins
  // In production, you might want to be more restrictive
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  return corsHeaders;
}

export function handleCors(req: NextRequest) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: cors(req),
    });
  }

  return null; // Not a preflight request
}

export function withCors(
  handler: (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    // Handle preflight
    const preflightResponse = handleCors(req);
    if (preflightResponse) {
      return preflightResponse;
    }

    // Execute the actual handler
    const response = await handler(req, context);

    // Add CORS headers to the response
    const corsHeaders = cors(req);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
