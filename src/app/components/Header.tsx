'use client';

import { useState } from 'react';

import {
  Menu,
  X,
} from 'lucide-react';

import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Websites', href: '#websites' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <header className='sticky top-0 z-50 w-full bg-[var(--background)]/80 backdrop-blur border-b border-[var(--foreground)]/10'>
      <div className='flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto'>
        <a
          href='#hero'
          className='text-xl sm:text-2xl font-mono font-semibold tracking-tight text-primary hover:text-[var(--foreground)] transition-all flex items-center gap-1 '
        >
          <span className='text-[var(--foreground)]/50 text-base sm:text-xl [font-family:var(--font-orbitron)]'>
            &lt;
          </span>
          <span className='[font-family:var(--font-orbitron)]'>Venky</span>
          <span className='text-[var(--foreground)]/50 text-base sm:text-xl animate-blink [font-family:var(--font-orbitron)]'>
            /
          </span>
          <span className='text-[var(--foreground)]/50 text-base sm:text-xl [font-family:var(--font-orbitron)]'>
            &gt;
          </span>
        </a>

        <div className='flex items-center gap-4'>
          {/* Desktop Nav */}
          <nav className='hidden sm:flex gap-6 text-sm'>
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className='hover:underline hover:opacity-80 transition'
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className='hidden sm:block'>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className='sm:hidden p-2 rounded focus:outline-none'
            aria-label='Toggle Menu'
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className='sm:hidden px-6 pb-4 flex flex-col gap-4 text-sm animate-fade-in-down'>
          {navItems.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className='hover:underline hover:opacity-80 transition'
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
