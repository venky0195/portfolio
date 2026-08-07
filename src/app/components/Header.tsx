'use client';

import { useEffect, useState } from 'react';

import { Menu, X } from 'lucide-react';

import { HeaderData } from '../types';
import ThemeToggle from './ThemeToggle';

type Props = {
  data: HeaderData;
};

/**
 * The duplicate-and-slide link hover: the label is cloned inside an
 * overflow-hidden box and both copies translate up together. It's width-
 * agnostic, needs no measurement, and causes no layout shift — which is why
 * it's the right answer over animating any text property directly.
 */
function HoverLink({ label, href, onClick }: { label: string; href: string; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className='group relative block overflow-hidden text-sm text-foreground-muted transition-colors hover:text-foreground'
    >
      <span className='block transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0'>
        {label}
      </span>
      <span
        aria-hidden='true'
        className='absolute inset-0 block translate-y-full text-foreground transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 motion-reduce:hidden'
      >
        {label}
      </span>
    </a>
  );
}

export default function Header({ data }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { logo, nav } = data;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <header className='fixed top-0 z-50 w-full'>
      {/* Gradient scrim instead of a solid bar: the mesh stays visible behind
          the nav, so the header sits in the scene rather than on top of it. */}
      <div className='pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background via-background/80 to-transparent' />

      <div className='relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5'>
        <a
          href='#hero'
          className='flex items-center gap-0.5 font-mono text-base font-medium tracking-tight text-foreground transition-opacity hover:opacity-70'
        >
          <span className='text-foreground-muted'>&lt;</span>
          <span>{logo}</span>
          <span className='text-accent-text'>/&gt;</span>
        </a>

        <div className='flex items-center gap-3 sm:gap-7'>
          <nav aria-label='Main' className='hidden items-center gap-7 sm:flex'>
            {nav.map(({ label, href }) => (
              <HoverLink key={href} label={label} href={href} />
            ))}
          </nav>

          <ThemeToggle />

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className='rounded p-2 text-foreground sm:hidden'
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls='mobile-nav'
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          id='mobile-nav'
          aria-label='Main'
          className='relative flex flex-col gap-5 border-b border-border bg-background px-6 pb-8 pt-2 sm:hidden'
        >
          {nav.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className='text-base text-foreground-muted transition-colors hover:text-foreground'
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
