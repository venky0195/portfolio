'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  GithubIcon,
  LinkedinIcon,
  Mail,
} from 'lucide-react';

export default function ContactSection() {
  return (
    <section className='px-6 py-20 max-w-3xl mx-auto text-center'>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className='text-3xl font-bold mb-4'>📬 Contact Me</h2>

        <p className='text-[var(--foreground)]/80 mb-6'>
          Whether it&apos;s a project idea, collaboration, or just a friendly
          hello — my inbox is always open.
        </p>

        <div className='flex justify-center flex-wrap gap-4 mb-10'>
          <a
            href='mailto:ven.venky08@gmail.com'
            className='flex items-center gap-2 px-4 py-2 border rounded hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
          >
            <Mail size={16} /> Email
          </a>
          <a
            href='https://www.linkedin.com/in/venkatesh0195/'
            target='_blank'
            className='flex items-center gap-2 px-4 py-2 border rounded hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
          >
            <LinkedinIcon size={16} /> LinkedIn
          </a>
          <a
            href='https://github.com/venky0195'
            target='_blank'
            className='flex items-center gap-2 px-4 py-2 border rounded hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
          >
            <GithubIcon size={16} /> GitHub
          </a>
        </div>

        <a
          href='/Venkatesh_G_Resume.pdf'
          target='_blank'
          className='inline-flex items-center gap-2 px-5 py-2 border border-[var(--foreground)] rounded hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
        >
          <FileText size={16} /> Download Resume
        </a>
      </motion.div>
    </section>
  );
}
