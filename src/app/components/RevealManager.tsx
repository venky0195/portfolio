'use client';

import { useEffect } from 'react';

/**
 * One global observer for every `[data-reveal]` element on the page.
 *
 * Why this instead of ScrollTrigger for enter-once reveals: ScrollTrigger has to
 * resolve each trigger's absolute start position, and this page changes document
 * height after first paint (a pinned section adds a spacer, smooth scrolling
 * re-measures, fonts settle). Triggers created across a dozen components during
 * that churn can end up with stale positions and simply never fire, leaving
 * content permanently invisible — a content bug, not just a motion bug.
 *
 * IntersectionObserver asks a different, position-independent question — "is
 * this on screen?" — so it cannot desynchronise. ScrollTrigger is still the
 * right tool for genuinely scroll-*linked* work (the pin, the scrubbed hero
 * recede, the timeline draw); it's just wrong for "fade in when you get here".
 *
 * Progressive enhancement: the hidden state lives under `.motion-ready`, which
 * is only added once this runs. If the JS never executes, everything renders
 * fully visible instead of a blank page.
 */
export default function RevealManager() {
  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Leave `.motion-ready` off entirely: no hidden state, no transitions.
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;

          // Stagger by position among siblings that share a reveal group, so
          // items cascade rather than all arriving at once.
          const group = el.closest('[data-reveal-group]') ?? el.parentElement;
          const siblings = group
            ? Array.from(group.querySelectorAll('[data-reveal]'))
            : [el];
          const index = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = `${Math.min(index, 8) * 70}ms`;

          el.setAttribute('data-revealed', '');
          // Reveal once, then stop watching — this is an entrance, not a state.
          observer.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );

    /**
     * Only hide anything once the page is actually being looked at.
     *
     * IntersectionObserver callbacks are throttled in a hidden tab, so applying
     * the hidden state to a backgrounded page risks content that is styled
     * invisible with nothing scheduled to bring it back. Waiting for visibility
     * means a page opened in a background tab renders fully visible, and the
     * reveal still plays properly the moment someone switches to it.
     */
    const begin = () => {
      root.classList.add('motion-ready');
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        observer.observe(el);
      });
    };

    let onVisibility: (() => void) | undefined;
    if (document.hidden) {
      onVisibility = () => {
        if (document.hidden) return;
        document.removeEventListener('visibilitychange', onVisibility!);
        begin();
      };
      document.addEventListener('visibilitychange', onVisibility);
    } else {
      begin();
    }

    return () => {
      if (onVisibility) {
        document.removeEventListener('visibilitychange', onVisibility);
      }
      observer.disconnect();
      root.classList.remove('motion-ready');
    };
  }, []);

  return null;
}
