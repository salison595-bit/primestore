import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Cache headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120');
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
