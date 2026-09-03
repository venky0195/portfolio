'use client';

import { useEffect } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { lenisEasing, setLenis } from '../lib/lenis-instance';

gsap.registerPlugin(ScrollTrigger);

/**
 * Weighted, inertial scrolling — the single biggest contributor to a page
 * feeling "premium" rather than utilitarian.
 *
 * Lenis (MIT) rather than GSAP's ScrollSmoother: it's lighter, and it keeps the
 * whole motion stack on licences we can ship without a second thought.
 *
 * Under prefers-reduced-motion this never initialises at all — native scroll is
 * left completely untouched.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      // Long, gentle ease-out: carries momentum without feeling detached.
      easing: lenisEasing,
      touchMultiplier: 1.6,
      // Let Lenis own its animation loop. Driving `lenis.raf()` from GSAP's
      // ticker is the more commonly cited integration, but it couples two
      // clocks for no benefit here: Lenis writes real native scroll positions,
      // so notifying ScrollTrigger on each scroll event is sufficient to keep
      // pins and scrubs exactly in step.
      autoRaf: true,
      // Anchor handling comes free, and correctly accounts for the fixed header.
      anchors: { offset: -72 },
    });

    lenis.on('scroll', ScrollTrigger.update);
    setLenis(lenis);

    // Pinned sections measure layout on creation; once smooth scrolling and
    // fonts have settled, make ScrollTrigger re-measure so pin distances are
    // based on final metrics rather than first-paint ones.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
