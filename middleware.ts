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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Initialize a response that will be potentially modified or replaced
  let response = NextResponse.next();


  // Ignorar rutas de archivos públicos y APIs
  if (
    PUBLIC_FILE_SUFFIXES.some((suffix) => pathname.endsWith(suffix)) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    response.headers.set('x-pathname', pathname);
    return response;
  }

  const pathnameParts = pathname.split('/').filter(Boolean);
  const currentLang = pathnameParts[0];

  const supportedLangs = ['es', 'en', 'fi']; // Asegúrate de que esto coincida con tus idiomas soportados



  // If no language in URL or current language not supported, redirect to target language
  if (!currentLang || !supportedLangs.includes(currentLang)) {
    const targetLang = 'es';
    // If the path is already "/", redirect to "/[targetLang]"
    if (pathname === '/') {
      const redirectResponse = NextResponse.redirect(new URL(`/${targetLang}`, request.url));

      redirectResponse.headers.set('x-pathname', `/${targetLang}`);
      return redirectResponse;
    }
    // If the path is not "/", but has no valid language, insert the target language
    const newUrl = new URL(`/${targetLang}${pathname}`, request.url);
    const redirectResponse = NextResponse.redirect(newUrl);

    redirectResponse.headers.set('x-pathname', `/${targetLang}${pathname}`);
    return redirectResponse;
  }
  
  // If no redirection, proceed as normal and set x-pathname
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};