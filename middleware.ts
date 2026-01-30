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

  // Ignorar rutas de archivos públicos y APIs
  if (
    PUBLIC_FILE_SUFFIXES.some((suffix) => pathname.endsWith(suffix)) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  const host = request.headers.get('host');
  let targetLang = 'es'; // Idioma por defecto

  if (host?.endsWith('.fi')) {
    targetLang = 'fi';
  } else if (host?.endsWith('.es')) {
    targetLang = 'es';
  }
  // Añadir más mapeos de dominio a idioma aquí si es necesario

  const pathnameParts = pathname.split('/').filter(Boolean);
  const currentLang = pathnameParts[0];

  const supportedLangs = ['es', 'en', 'fi']; // Asegúrate de que esto coincida con tus idiomas soportados

  // If no language in URL or current language not supported, redirect to target language
  if (!currentLang || !supportedLangs.includes(currentLang)) {
    // If the path is already "/", redirect to "/[targetLang]"
    if (pathname === '/') {
      const response = NextResponse.redirect(new URL(`/${targetLang}`, request.url));
      response.headers.set('x-pathname', `/${targetLang}`);
      return response;
    }
    // If the path is not "/", but has no valid language, insert the target language
    const newUrl = new URL(`/${targetLang}${pathname}`, request.url);
    const response = NextResponse.redirect(newUrl);
    response.headers.set('x-pathname', `/${targetLang}${pathname}`);
    return response;
  }

  // If the language in the URL does not match the target language from the domain, redirect
  if (currentLang !== targetLang) {
    const newUrl = new URL(`/${targetLang}${pathname.substring(currentLang.length + 1)}`, request.url);
    const response = NextResponse.redirect(newUrl);
    response.headers.set('x-pathname', `/${targetLang}${pathname.substring(currentLang.length + 1)}`);
    return response;
  }
  
  // If no redirection, proceed as normal and set x-pathname
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};