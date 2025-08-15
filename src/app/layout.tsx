// app/layout.tsx
import './globals.css';

import {
  Inter,
  Orbitron,
} from 'next/font/google';

import Providers from './components/Providers';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-orbitron',
});

export const metadata = {
  title: 'Venkatesh | Portfolio',
  description: 'Software Engineer Portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${orbitron.variable}`} suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
