import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE_SUFFIXES = [
  '.js',
  '.css',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.ico',
  '.webmanifest',
  '.xml',
  '.txt',
  '.mp4',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.json',
  '.map',
];

// Finnish is served at the root (jombo.fi/...), English under /en (jombo.fi/en/...).
const DEFAULT_LANG = 'fi';
const PREFIXED_LANGS = ['en'];
// Prefixes that are no longer public and must redirect to the unprefixed (Finnish) URL.
const LEGACY_PREFIXES = ['fi', 'es'];

function withPathname(response: NextResponse, pathname: string) {
  response.headers.set('x-pathname', pathname);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ignorar rutas de archivos públicos y APIs
  if (
    PUBLIC_FILE_SUFFIXES.some((suffix) => pathname.endsWith(suffix)) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return withPathname(NextResponse.next(), pathname);
  }

  const firstSegment = pathname.split('/').filter(Boolean)[0];

  // /fi/... and the old /es/... URLs -> canonical unprefixed URL
  if (firstSegment && LEGACY_PREFIXES.includes(firstSegment)) {
    const rest = pathname.slice(firstSegment.length + 1) || '/';
    const url = new URL(`${rest}${search}`, request.url);
    return NextResponse.redirect(url, 308);
  }

  // English pages keep their /en prefix
  if (firstSegment && PREFIXED_LANGS.includes(firstSegment)) {
    return withPathname(NextResponse.next(), pathname);
  }

  // Everything else is Finnish: serve the internal /fi route without changing the URL
  const internalPath = `/${DEFAULT_LANG}${pathname === '/' ? '' : pathname}`;
  const url = request.nextUrl.clone();
  url.pathname = internalPath;
  return withPathname(NextResponse.rewrite(url), internalPath);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
