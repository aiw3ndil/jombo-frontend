import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = request.nextUrl.pathname === '/'
    ? NextResponse.redirect(new URL('/es', request.url))
    : NextResponse.next();
  
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/', '/:lang(en|es|fi)/:path*'],
};
