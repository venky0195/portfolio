'use client'

import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center">
          👨‍💻 About Me
        </h2>
        <p className="text-[var(--foreground)]/80 text-lg leading-relaxed text-center">
          I&apos;m Venkatesh — a full-stack engineer with over 6 years of experience designing and delivering robust, scalable web platforms and APIs.
          <br /><br />
          Currently at <strong><a href="https://www.contentstack.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition">Contentstack</a></strong>, I work on performance-focused backend systems, developer tooling, and internal platforms that support product teams across multiple cloud providers.
          <br /><br />
          I care deeply about clean architecture, high developer velocity, and improving user experience through thoughtful engineering.
          <br /><br />
          Outside of work, you&apos;ll find me exploring new technologies, mentoring engineers, or speaking about engineering best practices.
        </p>
      </motion.div>
    </section>
  );
}
