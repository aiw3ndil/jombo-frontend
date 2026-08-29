import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jombo - Carpooling sin comisiones',
    short_name: 'Jombo',
    description: 'Plataforma de carpooling sin comisiones.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6441B8',
    icons: [
      {
        src: '/icons/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/icons/favicon-16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icons/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
