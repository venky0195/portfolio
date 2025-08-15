'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import {
  Website,
  WebsitesData,
} from '../types';

type Props = {
  data: WebsitesData;
};

export default function WebsitesSection({ data }: Props) {
  return (
    <section id='websites' className='px-6 py-20 max-w-6xl mx-auto'>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className='text-3xl font-bold text-center mb-12'>{data.title}</h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
          {data.items.map(
            ({ title, description, tech, url, imageUrl }: Website) => (
              <motion.div
                key={title}
                className='rounded-lg overflow-hidden shadow-md border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 hover:shadow-xl transition'
                whileHover={{ scale: 1.01 }}
              >
                <a href={url} target='_blank' rel='noopener noreferrer'>
                  <Image
                    src={imageUrl}
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
                    {tech.map((t: string) => (
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
            )
          )}
        </div>
      </motion.div>
    </section>
  );
}
