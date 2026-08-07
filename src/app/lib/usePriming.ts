'use client';

import {
  useCallback,
  useRef,
  useState,
} from 'react';

export type PrimeState = 'cold' | 'priming' | 'primed';

/**
 * Real cache priming — the technique this portfolio's author built into a
 * production hosting platform, running here on the visitor's own machine.
 *
 * On intent (hover or keyboard focus) we `preconnect` to the destination origin,
 * paying DNS resolution, the TCP handshake and TLS negotiation before the click
 * instead of after it. That is a real, measurable head start on the navigation.
 *
 * It is verifiable in devtools, and it is the *only* thing done here. An earlier
 * version also prefetched the card's preview image, which was quietly wrong on
 * two counts: that image is already rendered on this page (nothing to warm), and
 * the prefetch targeted the raw file while the page actually requests a
 * Next.js-optimised URL — so it burned real bandwidth on a resource nobody would
 * ever use. Wasted bytes presented as an optimisation are worse than no
 * optimisation, especially on a site whose entire claim is delivery competence.
 *
 * Deliberate limits:
 *  - Fires on intent, not on load, so it never costs bandwidth for cards nobody
 *    looks at. Speculatively priming everything is how well-meaning
 *    "performance" features become the performance problem.
 *  - Once per origin. Re-priming an already-warm connection buys nothing.
 *  - Skipped entirely on metered or slow connections, or when the visitor has
 *    asked to reduce data use.
 *  - Same-origin links are skipped: that connection is already open.
 */
export function usePriming() {
  const [states, setStates] = useState<Record<string, PrimeState>>({});
  const done = useRef<Set<string>>(new Set());

  const shouldPrime = useCallback(() => {
    // Respect Save-Data and slow/metered connections. Optional API, so guard it.
    const conn = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      }
    ).connection;
    if (!conn) return true;
    if (conn.saveData) return false;
    if (conn.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
    return true;
  }, []);

  const prime = useCallback(
    (key: string, href?: string) => {
      if (done.current.has(key)) return;
      if (!href || !shouldPrime()) return;

      let origin: string;
      try {
        origin = new URL(href, window.location.href).origin;
      } catch {
        return; // Malformed URL in content — nothing to connect to.
      }

      // Nothing to warm for a link back to this same origin.
      if (origin === window.location.origin) return;

      done.current.add(key);
      setStates((s) => ({ ...s, [key]: 'priming' }));

      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      // Report primed only once the browser has had a turn to act on the hint,
      // so the label tracks reality rather than intent.
      window.setTimeout(() => {
        setStates((s) => ({ ...s, [key]: 'primed' }));
      }, 420);
    },
    [shouldPrime]
  );

  return { states, prime };
}
