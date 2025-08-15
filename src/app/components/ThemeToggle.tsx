'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      className='p-2 rounded transition-colors duration-300 cursor-pointer'
      style={{
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; // light hover
        if (theme === 'dark') {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; // dark hover
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <span className='text-xl'>{theme === 'dark' ? '🌞' : '🌙'}</span>
    </button>
  );
}
