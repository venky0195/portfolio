'use client'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--foreground)]/10 px-6 py-6 text-sm text-center text-[var(--foreground)]/60">
      <p>
        © {new Date().getFullYear()} Venkatesh G — All rights reserved.
      </p>
    </footer>
  )
}
