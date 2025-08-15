// app/layout.tsx
import './globals.css';

import fs from 'fs';
import { Metadata } from 'next';
import {
  Inter,
  Orbitron,
} from 'next/font/google';
import path from 'path';

import Providers from './components/Providers';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-orbitron',
});

export async function generateMetadata(): Promise<Metadata> {
  const filePath = path.join(process.cwd(), 'public', 'content.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContent);

  const title = data?.metadata?.title || 'Venkatesh | Portfolio';
  const description =
    data?.metadata?.description || 'Software Engineer Portfolio';

  return {
    title,
    description,
  };
}
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
