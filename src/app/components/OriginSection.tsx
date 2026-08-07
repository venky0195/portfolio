'use client';

import { useEffect, useRef } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

import { prefersReducedMotion } from '../lib/motion-preference';
import { OriginData } from '../types';
import StackItem from './StackItem';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  data: OriginData;
};

/**
 * "The origin server" — the person behind the platform.
 *
 * The stack is grouped by layer of the delivery path rather than sprayed as a
 * flat pill wall. That ordering is the point: it shows someone who thinks in
 * terms of where in the request lifecycle a tool belongs, which is a more
 * specific signal than the logos themselves.
 */
export default function OriginSection({ data }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        portraitRef.current,
        { y: 18 },
        {
          y: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className='mx-auto max-w-7xl px-6 py-24 md:py-28'>
      <div className='grid grid-cols-1 gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] md:gap-16'>
        <div data-reveal>
          <div
            ref={portraitRef}
            className='relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-border'
          >
            <Image
              src='/headshot.png'
              alt='Portrait of Venkatesh G'
              fill
              className='object-cover'
              sizes='(min-width: 768px) 320px, 100vw'
            />
          </div>
        </div>

        <div data-reveal-group>
          <p data-reveal className='font-mono text-sm text-accent-text'>
            {`// ${data.kicker}`}
          </p>

          <h2
            data-reveal
            id='origin-heading'
            className='mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground'
          >
            {data.title}
          </h2>

          <div className='mt-7 max-w-2xl space-y-4 text-base leading-relaxed text-foreground-muted'>
            {data.description.map((para, i) => (
              <p key={i} data-reveal>
                {para}
              </p>
            ))}
          </div>

          <div data-reveal className='mt-14'>
            <p className='font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted/70'>
              What I work with
            </p>

            <dl className='mt-6 space-y-5'>
              {data.stack.map((group) => (
                <div
                  key={group.group}
                  className='grid gap-2 border-t border-border pt-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6'
                >
                  <dt className='font-mono text-xs uppercase tracking-[0.12em] text-accent-text'>
                    {group.group}
                  </dt>
                  <dd className='flex flex-wrap gap-x-4 gap-y-1.5'>
                    {group.items.map((item) => (
                      <StackItem key={item} label={item} />
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
