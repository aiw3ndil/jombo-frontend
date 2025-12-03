import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.jombo.es'
  const languages = ['es', 'en', 'fi']
  
  // Páginas estáticas
  const staticPages = ['', '/terms']
  
  // Generar URLs para cada idioma
  const urls: MetadataRoute.Sitemap = []
  
  languages.forEach(lang => {
    staticPages.forEach(page => {
      urls.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            es: `${baseUrl}/es${page}`,
            en: `${baseUrl}/en${page}`,
            fi: `${baseUrl}/fi${page}`,
          },
        },
      })
    })
  })
  
  return urls
}
