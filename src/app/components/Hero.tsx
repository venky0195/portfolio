'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <main className='min-h-[calc(100vh-80px)] flex items-center justify-center px-6'>
      <motion.section
        className='max-w-3xl text-center space-y-6'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          className='text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Hi, I&apos;m <span className='text-primary'>Venkatesh</span>{' '}
          <motion.span className='inline-block origin-bottom-left'>
            👋
          </motion.span>
        </motion.h1>

        <motion.p
          className='text-lg md:text-xl text-[var(--foreground)]/80'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          I&apos;m a full-stack engineer who enjoys building reliable,
          performant, and user-focused digital experiences across the web.
        </motion.p>

        <motion.div
          className='flex justify-center gap-4 pt-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <a
            href='https://www.linkedin.com/in/venkatesh0195/'
            target='_blank'
            className='px-5 py-2 rounded border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
          >
            LinkedIn
          </a>
          <a
            href='https://github.com/venky0195'
            target='_blank'
            className='px-5 py-2 rounded border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
          >
            GitHub
          </a>
        </motion.div>

        <motion.div
          className='flex flex-wrap justify-center gap-2 pt-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {[
            'TypeScript',
            'Golang',
            'Node.js',
            'React',
            'Next.js',
            'AWS',
            'Docker',
            'Redis',
            'OpenTelemetry',
          ].map((tech) => (
            <span
              key={tech}
              className='px-3 py-1 text-sm rounded-full border border-[var(--foreground)]/20 bg-[var(--foreground)]/5 text-[var(--foreground)]/90'
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </motion.section>
      <a href='#about'>
        <div className='absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-2xl text-primary cursor-pointer'>
          ↓
        </div>
      </a>
    </main>
  );
}
