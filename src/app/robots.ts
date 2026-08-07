import { MetadataRoute } from 'next';

import { getContent } from './lib/content';

export default function robots(): MetadataRoute.Robots {
  const content = getContent();
  const baseUrl = content.metadata?.url || 'https://venkateshg.dev';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
