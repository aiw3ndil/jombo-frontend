export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jombo',
    url: 'https://www.jombo.es',
    logo: 'https://www.jombo.es/images/jombo-logo.svg',
    description: 'Plataforma gratuita de carpooling sin comisiones',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'soporte@jombo.es',
      contactType: 'customer support',
      availableLanguage: ['Spanish', 'English', 'Finnish'],
    },
    sameAs: [
      // Añadir redes sociales si las hay
    ],
  };

  return <JsonLd data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Jombo',
    url: 'https://www.jombo.es',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.jombo.es/es/search?from={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={schema} />;
}
