'use client';

import { useEffect, useRef } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, Linkedin } from 'lucide-react';

import { prefersReducedMotion } from '../lib/motion-preference';
import { HeroData } from '../types';
import SplitReveal from './SplitReveal';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  data: HeroData;
};

export default function Hero({ data }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Entrance fades use the CSS-gated [data-reveal] system, so nothing here
      // can leave content stranded if the animation clock never runs. GSAP owns
      // only this scroll-linked recede.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
        .to(
          root.querySelector('[data-hero-copy]'),
          { y: -60, opacity: 0, ease: 'none' },
          0
        )
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className='relative flex min-h-[100svh] items-center overflow-hidden px-6'
    >
      {/*
        The network itself lives in NetworkField — one canvas fixed behind the
        entire document, so it persists across sections instead of being a hero
        that dies at the fold. All this section owns is a scrim that keeps the
        headline unambiguous while leaving the graph legible to its right.
      */}
      <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/30 lg:via-background/60 lg:to-transparent' />

      <div
        data-hero-copy
        data-reveal-group
        className='relative mx-auto w-full max-w-7xl py-28'
      >
        <div className='flex items-center gap-3' data-reveal>
          <span className='relative flex h-1.5 w-1.5'>
            <span className='absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping' />
            <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-accent' />
          </span>
          <p className='font-mono text-xs uppercase tracking-[0.16em] text-foreground-muted'>
            {data.eyebrow}
          </p>
        </div>

        <SplitReveal
          as='h1'
          by='char'
          immediate
          delay={0.2}
          text={data.headline}
          className='mt-8 max-w-3xl text-[clamp(2.1rem,5.4vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-foreground'
        />

        <p
          data-reveal
          className='mt-7 max-w-xl text-lg leading-relaxed text-foreground-muted'
        >
          {data.description}
        </p>

        <div data-reveal className='mt-9 flex flex-wrap items-center gap-4'>
          <a
            href={data.primaryCta.href}
            className='group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-stone-950 transition-transform duration-200 hover:-translate-y-0.5'
          >
            {data.primaryCta.label}
            <span
              aria-hidden='true'
              className='transition-transform duration-200 group-hover:translate-x-0.5'
            >
              →
            </span>
          </a>

          <a
            href={data.secondaryCta.href}
            className='inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-text'
          >
            {data.secondaryCta.label}
          </a>

          <div className='ml-1 flex items-center gap-4 text-foreground-muted'>
            <a
              href={data.linkedin}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='LinkedIn profile'
              className='transition-colors hover:text-foreground'
            >
              <Linkedin size={18} />
            </a>
            <a
              href={data.github}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub profile'
              className='transition-colors hover:text-foreground'
            >
              <Github size={18} />
            </a>
          </div>
        </div>

        {/* The numbers are the whole argument — plain, large, unexplained. */}
        <dl
          data-reveal
          className='mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 border-t border-border pt-9 sm:grid-cols-4'
        >
          {data.platformStats.map((stat) => (
            <div key={stat.label}>
              <dt className='font-mono text-2xl text-foreground sm:text-[1.75rem]'>
                {stat.value}
              </dt>
              <dd className='mt-1.5 text-xs leading-snug text-foreground-muted'>
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
