'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import gsap from 'gsap';

/**
 * A short "service coming online" intro.
 *
 * The metaphor of the whole site is an instrumented system, so the load state
 * is the first chance to say so — dead time becomes the first impression.
 *
 * Rules it holds to, each one learned from a way intros break:
 *  1. Progress follows a REAL signal (fonts + document ready), never a fake
 *     timer that stalls at 92% waiting for nothing.
 *  2. Once per session, so returning to the page is never a toll booth.
 *  3. Skippable by click or key.
 *  4. Never shown to a backgrounded tab, and never dependent on animation
 *     callbacks to finish. requestAnimationFrame is throttled in hidden tabs, so
 *     an exit driven only by a tween would leave someone who opened the page in
 *     a background tab staring at a frozen overlay with scroll locked.
 *  5. Bypassed entirely under reduced motion.
 */

/**
 * Deliberately wordless.
 *
 * This used to print a fake DNS/TLS/cache log, which was the most jargon-heavy
 * thing on the site and the first thing anyone saw. An intro should set a tone,
 * not quiz the visitor — so it's now just the mark and a progress hairline.
 */

export default function BootSequence() {
  // Defaults to "not done" so the overlay is part of the very first paint —
  // including the server-rendered HTML — for a first-time visit. It used to
  // default to true (no overlay), which looked fine for the cases that skip
  // the intro, but for an actual first-time visitor it meant the real page
  // painted first, and the intro only appeared a beat later once the mount
  // effect below decided to show it — covering content that was already
  // visible, then lifting to reveal the same content again. The mount effect
  // now has to explicitly opt back OUT for the skip cases instead.
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  const unlock = useCallback(() => {
    document.body.style.overflow = '';
  }, []);

  // Decide on mount (not during render) whether this visit gets an intro.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('booted') === '1';
    // A hidden tab gets no intro: nobody is watching it, and its animation
    // clock is throttled.
    if (reduce || seen || document.hidden) {
      sessionStorage.setItem('booted', '1');
      unlock();
      setDone(true);
      return;
    }
    document.body.style.overflow = 'hidden';
  }, [unlock]);

  useEffect(() => {
    if (done) return;
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;

    let cancelled = false;

    // The hard floor: tear the overlay down immediately, no animation involved.
    const forceFinish = () => {
      if (cancelled) return;
      finished.current = true;
      sessionStorage.setItem('booted', '1');
      unlock();
      setDone(true);
    };

    const exit = () => {
      if (finished.current || cancelled) return;
      finished.current = true;
      sessionStorage.setItem('booted', '1');

      gsap
        .timeline({
          onComplete: () => {
            unlock();
            setDone(true);
          },
        })
        // Wipe upward rather than fade — a fade reads as a loading screen
        // disappearing, a wipe reads as a curtain lifting.
        .to(root.querySelector('[data-boot-mark]'), {
          opacity: 0,
          y: -6,
          duration: 0.3,
          ease: 'power2.in',
        })
        .to(root, { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, '+=0.1');
    };

    const tl = gsap.timeline();
    tl.to(root.querySelector('[data-boot-mark]'), {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    });

    // Progress is tied to actual readiness. `fonts.ready` is the meaningful gate
    // here — it's what would otherwise cause a visible reflow.
    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((res) => {
        if (document.readyState === 'complete') return res();
        window.addEventListener('load', () => res(), { once: true });
      }),
    ]);

    // Creep to 90% on a curve, then let the real signal finish the bar.
    gsap.to(bar, { scaleX: 0.9, duration: 1.1, ease: 'power2.out' });

    ready.then(() => {
      if (cancelled) return;
      // The creep tween above is very likely still mid-flight here — GSAP
      // does not overwrite conflicting tweens on its own (overwrite:false is
      // the default), so without this, both tweens keep independently writing
      // scaleX every frame. The instant this shorter tween finishes, the
      // still-running creep tween reclaims the property and visibly snaps the
      // bar back down to its own, lower progress before creeping up again.
      // Killing it first means there's only ever one tween driving the bar
      // once the real completion signal arrives.
      gsap.killTweensOf(bar);
      gsap.to(bar, {
        scaleX: 1,
        duration: 0.28,
        ease: 'power2.inOut',
        onComplete: exit,
      });
    });

    // If the tab is backgrounded mid-intro, don't animate to a wall — the tween
    // clock is throttled, so finish instantly instead.
    const onVisibility = () => {
      if (document.hidden) forceFinish();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Slow network or a throttled clock can never hold the page hostage.
    const softFailsafe = window.setTimeout(exit, 3500);
    const hardFailsafe = window.setTimeout(forceFinish, 6000);

    const onSkip = () => exit();
    window.addEventListener('keydown', onSkip);
    root.addEventListener('click', onSkip);

    return () => {
      cancelled = true;
      window.clearTimeout(softFailsafe);
      window.clearTimeout(hardFailsafe);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keydown', onSkip);
      root.removeEventListener('click', onSkip);
      tl.kill();
      // tl only ever owned the boot-mark's fade-in — the bar's own creep-to-90%
      // tween below is a separate, untracked gsap.to() call, so tl.kill() alone
      // left it running. Harmless in production, but React's dev-mode Strict
      // Mode mounts this effect, cleans it up, and mounts it again immediately
      // — so that first, unkilled creep tween kept animating in parallel with
      // the second mount's own creep tween, both driving the same scaleX, which
      // is what read as the bar visibly lurching backward mid-fill.
      gsap.killTweensOf(bar);
      unlock();
    };
  }, [done, unlock]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      // aria-hidden: this is a visual transition, and the page content behind it
      // is already in the DOM and announced. Screen reader users get the content
      // immediately rather than a countdown.
      aria-hidden='true'
      className='fixed inset-0 z-[100] flex flex-col justify-end bg-background px-6 pb-16 sm:px-10'
    >
      <div className='mx-auto w-full max-w-7xl'>
        <p
          data-boot-mark
          className='flex items-center gap-0.5 font-mono text-base font-medium tracking-tight text-foreground opacity-0'
        >
          <span className='text-foreground-muted'>&lt;</span>
          <span>Venky</span>
          <span className='text-accent-text'>/&gt;</span>
        </p>

        <div className='mt-6 h-px w-full bg-border'>
          <div
            ref={barRef}
            className='h-px w-full origin-left scale-x-0 bg-accent'
          />
        </div>
      </div>
    </div>
  );
}
