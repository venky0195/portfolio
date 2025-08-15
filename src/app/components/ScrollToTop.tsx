'use client'

import {
  useEffect,
  useState,
} from 'react';

import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="cursor-pointer fixed bottom-6 right-6 p-3 rounded-full border border-[var(--foreground)]/20 bg-[var(--foreground)]/10 backdrop-blur hover:bg-[var(--foreground)] hover:text-[var(--background)] text-[var(--foreground)]/80 shadow-md transition-colors"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  )
}
