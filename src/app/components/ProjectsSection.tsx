'use client'

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const projects = [
  {
    title: 'QR Code Generator',
    description: 'A lightweight web app to generate QR codes from any text input. Built with React, Tailwind CSS, and powered by the qrcode library. Downloadable output and customizable settings included.',
    tech: ['React', 'Tailwind CSS', 'qrcode'],
    link: 'https://github.com/venky0195/qr-code-generator',
  },
  {
    title: 'Developer Portfolio',
    description: 'This very portfolio — built with Next.js App Router, Tailwind v4, and full theming support.',
    tech: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Lucide'],
    link: 'https://github.com/venky0195/portfolio',
  },
]

export default function ProjectsSection() {
  return (
    <section className="px-6 py-20 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-12 text-center">🛠️ Projects</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map(({ title, description, tech, link }) => (
            <div
              key={title}
              className="border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 rounded-xl p-5 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline text-[var(--foreground)]/70"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <p className="text-sm text-[var(--foreground)]/80 mb-3">{description}</p>
              <div className="flex flex-wrap gap-2">
                {tech.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 text-xs rounded bg-[var(--foreground)]/10 text-[var(--foreground)]/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
