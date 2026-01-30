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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Ignorar rutas de archivos públicos
  if (
    PUBLIC_FILE_SUFFIXES.some((suffix) => pathname.endsWith(suffix)) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  const host = req.headers.get('host');
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

  // Si no hay idioma en la URL o el idioma actual no está soportado, redirigir al idioma objetivo
  if (!currentLang || !supportedLangs.includes(currentLang)) {
    // Si la ruta ya es "/" (raíz), redirigir a "/[targetLang]"
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${targetLang}`, req.url));
    }
    // Si la ruta no es "/", pero no tiene un idioma válido, insertar el idioma objetivo
    const newUrl = new URL(`/${targetLang}${pathname}`, req.url);
    return NextResponse.redirect(newUrl);
  }

  // Si el idioma en la URL no coincide con el idioma objetivo del dominio, redirigir
  if (currentLang !== targetLang) {
    const newUrl = new URL(`/${targetLang}${pathname.substring(currentLang.length + 1)}`, req.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
