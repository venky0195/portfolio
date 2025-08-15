'use client';

import { motion } from 'framer-motion';

import { AboutData } from '../types';

type Props = {
  data: AboutData;
};

export default function AboutSection({ data }: Props) {
  return (
    <section className='px-6 py-20 max-w-4xl mx-auto'>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className='text-3xl font-bold mb-4 text-center'>{data.title}</h2>

        <div className='text-[var(--foreground)]/80 text-lg leading-relaxed text-center space-y-6'>
          {data.description.map((para: string, idx: number) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: para }} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
