'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

import { getLenis, lenisEasing } from '../lib/lenis-instance';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    // Lenis owns scroll position every frame while it's running, so a raw
    // window.scrollTo() here gets overridden almost immediately — has to go
    // through the same instance instead. Reduced-motion visitors never get a
    // Lenis instance at all (see SmoothScroll), so the native call is the
    // correct fallback there, not a workaround.
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, {
        immediate: reduceMotion,
        duration: 1.05,
        easing: lenisEasing,
      });
    } else {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        // The animation lives on this wrapper; the button underneath is a
        // plain element with nothing but the click handler on it.
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          // z-50 to match Header's precedent for "fixed chrome that must always
          // stay on top" — without an explicit z-index, position:fixed alone
          // loses to `main`'s z-10 stacking context (a positioned element with
          // z-index:auto is always painted behind one with a positive z-index,
          // regardless of DOM order or which is fixed), so every section's
          // content was painting over this button and silently eating the click.
          className='fixed bottom-6 right-6 z-50'
        >
          <button
            type='button'
            onClick={scrollToTop}
            className='rounded-full border border-border bg-background-elevated p-3 text-foreground-muted shadow-md transition-colors hover:text-accent-text'
            aria-label='Scroll to top'
          >
            <ArrowUp size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
