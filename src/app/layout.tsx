// app/layout.tsx
import './globals.css';

import { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
} from 'next/font/google';

import Providers from './components/Providers';
import { getContent } from './lib/content';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export async function generateMetadata(): Promise<Metadata> {
  const data = getContent();

  const title = data?.metadata?.title || 'Venkatesh | Portfolio';
  const description =
    data?.metadata?.description || 'Software Engineer Portfolio';
  const url = data?.metadata?.url;

  return {
    title: {
      default: title,
      template: '%s | Venkatesh G',
    },
    description,
    metadataBase: url ? new URL(url) : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Venkatesh G',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = getContent();

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Venkatesh G',
    jobTitle: 'Software Engineer II — Platform & Delivery',
    worksFor: {
      '@type': 'Organization',
      name: 'Contentstack',
      url: 'https://www.contentstack.com',
    },
    address: {
      '@type': 'PostalPlace',
      addressLocality: 'Bangalore',
      addressCountry: 'IN',
    },
    knowsAbout: [
      'Front-end hosting platforms',
      'CDN and edge caching',
      'OpenTelemetry',
      'Multi-cloud infrastructure',
    ],
    url: data?.metadata?.url,
    sameAs: [data?.hero?.linkedin, data?.hero?.github].filter(Boolean),
  };

  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className='antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
