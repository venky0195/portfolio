'use client';

import { FooterData } from '../types';

type Props = {
  data: FooterData;
};

export default function Footer({ data }: Props) {
  return (
    <footer className='border-t border-[var(--foreground)]/10 px-6 py-6 text-sm text-center text-[var(--foreground)]/60'>
      <p>
        © {new Date().getFullYear()} {data.text}
      </p>
    </footer>
  );
}
