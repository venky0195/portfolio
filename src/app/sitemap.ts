import { MetadataRoute } from 'next';

import { getContent } from './lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const content = getContent();
  const baseUrl = content.metadata?.url || 'https://venkateshg.dev';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
