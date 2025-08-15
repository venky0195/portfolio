'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  GithubIcon,
  LinkedinIcon,
  Mail,
} from 'lucide-react';

import { ContactData } from '../types';

type Props = {
  data: ContactData;
};

export default function ContactSection({ data }: Props) {
  return (
    <section className='px-6 py-20 max-w-3xl mx-auto text-center'>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className='text-3xl font-bold mb-4'>{data.heading}</h2>
        <p className='text-[var(--foreground)]/80 mb-6'>{data.subheading}</p>

        <div className='flex justify-center flex-wrap gap-4 mb-10'>
          {data.links.map(({ type, label, href }) => {
            const Icon =
              type === 'email'
                ? Mail
                : type === 'linkedin'
                ? LinkedinIcon
                : type === 'github'
                ? GithubIcon
                : null;

            return Icon ? (
              <a
                key={type}
                target='_blank'
                href={href}
                className='flex items-center gap-2 px-4 py-2 border rounded hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
              >
                <Icon size={16} /> {label}
              </a>
            ) : null;
          })}
        </div>

        <a
          href={data.resume.href}
          target='_blank'
          className='inline-flex items-center gap-2 px-5 py-2 border border-[var(--foreground)] rounded hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors'
        >
          <FileText size={16} /> {data.resume.label}
        </a>
      </motion.div>
    </section>
  );
}
