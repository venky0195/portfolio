'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const websites = [
  {
    title: 'Global Unique Engineering',
    description:
      'A CNC manufacturing website built to showcase industrial services.',
    tech: ['Next.js', 'Tailwind', 'Contentstack'],
    url: 'https://global-unique-engineering.eu-contentstackapps.com/',
    screenshot: '/images/global-unique.png',
  },
  {
    title: 'FolioBulls',
    description:
      'Sleek UI for tracking digital asset portfolios with real-time stats.',
    tech: ['React', 'Tailwind', 'Vercel'],
    url: 'https://foliobulls.vercel.app/',
    screenshot: '/images/foliobulls.png',
  },
];

export default function WebsitesSection() {
  return (
    <section id='websites' className='px-6 py-20 max-w-6xl mx-auto'>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className='text-3xl font-bold text-center mb-12'>
          🖥 Websites I’ve Designed
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
          {websites.map(({ title, description, tech, url, screenshot }) => (
            <motion.div
              key={title}
              className='rounded-lg overflow-hidden shadow-md border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 hover:shadow-xl transition'
              whileHover={{ scale: 1.01 }}
            >
              <a href={url} target='_blank' rel='noopener noreferrer'>
                <Image
                  src={screenshot}
                  alt={`${title} preview`}
                  width={400}
                  height={192}
                  className='w-full h-48 object-cover'
                />
              </a>

              <div className='p-4'>
                <a href={url} target='_blank' rel='noopener noreferrer'>
                  <h3 className='text-xl font-semibold hover:underline'>
                    {title}
                  </h3>
                </a>
                <p className='text-[var(--foreground)]/80 mt-2'>
                  {description}
                </p>
                <div className='flex flex-wrap gap-2 mt-4'>
                  {tech.map((t) => (
                    <span
                      key={t}
                      className='px-2 py-1 text-xs rounded bg-[var(--foreground)]/10 text-[var(--foreground)]/80'
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
