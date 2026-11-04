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
    url: 'https://jombo.fi',
    logo: 'https://jombo.fi/images/jombo-logo.svg',
    description: 'Ilmainen kimppakyytipalvelu ilman välityspalkkioita',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'tuki@jombo.fi',
      contactType: 'customer support',
      availableLanguage: ['Finnish', 'English'],
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
    url: 'https://jombo.fi',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://jombo.fi/search?from={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={schema} />;
}
