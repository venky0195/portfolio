// app/layout.tsx
import './globals.css';

import { Inter } from 'next/font/google';

import Providers from './components/Providers';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Venkatesh | Portfolio',
  description: 'Software Engineer Portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
