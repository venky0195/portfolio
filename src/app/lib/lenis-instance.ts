import type Lenis from 'lenis';

/**
 * The one Lenis instance, shared beyond the component that creates it.
 *
 * Lenis owns scroll position every frame once `autoRaf` is running — anything
 * that moves the page a different way (a raw `window.scrollTo`, say) gets
 * overridden within a frame or two, because Lenis's own loop keeps asserting
 * its last-known target right back. Anywhere that needs to move the page
 * programmatically has to go through this same instance's own `scrollTo`,
 * not the native API.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Long, gentle ease-out — shared so a programmatic scrollTo() moves with the
 * same feel as Lenis's own wheel/touch-driven scrolling. */
export const lenisEasing = (t: number) => 1 - Math.pow(1 - t, 3);
