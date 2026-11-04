import { MetadataRoute } from 'next'
import { SITE_URL, SUPPORTED_LANGS, localePath } from '@/app/lib/i18n/config'
import { TOP_FINNISH_ROUTES } from '@/app/lib/constants/routes'

export default function sitemap(): MetadataRoute.Sitemap {
  // Páginas estáticas
  const staticPages = ['', '/terms', ...TOP_FINNISH_ROUTES.map((route) => `/kimppakyyti/${route.slug}`)]

  const url = (lang: string, page: string) => `${SITE_URL}${localePath(lang, page) === '/' ? '' : localePath(lang, page)}`

  const urls: MetadataRoute.Sitemap = []

  SUPPORTED_LANGS.forEach(lang => {
    staticPages.forEach(page => {
      urls.push({
        url: url(lang, page),
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            fi: url('fi', page),
            en: url('en', page),
          },
        },
      })
    })
  })

  return urls
}
