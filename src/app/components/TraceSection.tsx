'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { prefersReducedMotion } from '../lib/motion-preference';
import { NODES, SPAN_FOCUS } from '../lib/network';
import { TraceData, TraceSpan } from '../types';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  data: TraceData;
};

/** Light the parts of the system a given period actually touched. */
function lightSpan(name: string | null) {
  window.dispatchEvent(
    new CustomEvent('network:highlight', {
      detail: name ? (SPAN_FOCUS[name] ?? null) : null,
    })
  );
}

const LABELS = new Map(NODES.map((n) => [n.id, n.label]));

/**
 * A career as a waterfall you can read at a glance.
 *
 * The visualisation is the point, so it gets the full width and nothing sits
 * beside it competing for attention. A previous pass moved the detail into a
 * fixed right-hand panel, which quietly turned the section into a master-detail
 * admin interface — the chart stopped being the subject.
 *
 * Detail now arrives as a panel floating beside whichever bar you're pointing
 * at, and leaves when you do. Everything a casual scroller needs — role,
 * company, years, duration — is on the bar itself, so nothing essential is
 * hidden behind an interaction.
 */
export default function TraceSection({ data }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const spans = data.spans.filter((s) => s.depth > 0);
  const min = Math.min(...data.spans.map((s) => s.start));
  const max = Math.max(...data.spans.map((s) => s.end));
  const range = Math.max(1, max - min);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Bars fill left to right — the direction a trace actually arrives in.
      gsap.from(root.querySelectorAll('[data-bar]'), {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: root, start: 'top 75%' },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const enter = (i: number) => {
    setHovered(i);
    lightSpan(spans[i].name);
  };
  const leave = () => {
    setHovered(null);
    lightSpan(null);
  };

  return (
    <div ref={rootRef} className='mx-auto max-w-7xl px-6 py-24 md:py-28'>
      <div data-reveal-group className='max-w-3xl'>
        <p data-reveal className='font-mono text-sm text-accent-text'>
          {`// ${data.kicker}`}
        </p>
        <h2
          data-reveal
          id='trace-heading'
          className='mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground'
        >
          {data.title}
        </h2>
        <p
          data-reveal
          className='mt-5 text-base leading-relaxed text-foreground-muted'
        >
          {data.description}
        </p>
      </div>

      {/* Time axis */}
      <div
        data-reveal
        className='mt-14 flex justify-between border-b border-border pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted/60'
        aria-hidden='true'
      >
        <span>{min}</span>
        <span>{Math.round((min + max) / 2)}</span>
        <span>now</span>
      </div>

      <ul data-reveal className='relative' onPointerLeave={leave}>
        {spans.map((s, i) => {
          const left = ((s.start - min) / range) * 100;
          const width = Math.max(((s.end - s.start) / range) * 100, 3.5);
          const isActive = s.status === 'active';
          const isOn = hovered === i;
          const dimmed = hovered !== null && !isOn;

          return (
            <li key={`${s.service}-${s.name}`} className='relative'>
              <button
                type='button'
                onPointerEnter={() => enter(i)}
                onFocus={() => enter(i)}
                onBlur={leave}
                aria-describedby={isOn ? `span-detail-${i}` : undefined}
                className={`w-full border-b border-border/40 py-5 text-left transition-opacity duration-300 last:border-0 ${
                  dimmed ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Everything a scroller needs, without hovering anything. */}
                <span className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
                  <span className='flex flex-wrap items-baseline gap-x-3'>
                    <span className='font-mono text-sm text-foreground'>
                      {s.name}
                    </span>
                    <span className='font-mono text-[11px] text-foreground-muted/70'>
                      {s.service}
                    </span>
                  </span>
                  <span className='font-mono text-[11px] text-foreground-muted/60'>
                    {s.start}
                    {isActive ? ' — now' : ` — ${s.end}`}
                  </span>
                </span>

                <span className='relative mt-3 block h-2.5'>
                  <span className='absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/50' />
                  <span
                    data-bar
                    className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full transition-[background-color,height] duration-300 ${
                      isOn
                        ? 'h-2.5 bg-accent'
                        : isActive
                          ? 'bg-accent/55'
                          : 'bg-foreground/25'
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    {isActive && (
                      <span className='absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent motion-safe:animate-ping' />
                    )}
                  </span>
                </span>
              </button>

              {isOn && <SpanDetail id={`span-detail-${i}`} span={s} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The floating detail. Positioned under the bar it belongs to and constrained to
 * the section, so it reads as an annotation on the chart rather than a separate
 * pane the chart is feeding.
 */
function SpanDetail({ id, span }: { id: string; span: TraceSpan }) {
  const tech = (SPAN_FOCUS[span.name] ?? [])
    .map((n) => LABELS.get(n))
    .filter(Boolean);

  return (
    <div
      id={id}
      role='tooltip'
      className='chapter-enter pointer-events-none absolute left-0 right-0 top-full z-20 -mt-1 md:left-auto md:right-0 md:w-[26rem]'
    >
      <div className='rounded-xl border border-border bg-background/95 p-5 shadow-xl backdrop-blur'>
        <p className='max-w-prose text-sm leading-relaxed text-foreground'>
          {span.detail}
        </p>

        {tech.length > 0 && (
          <p className='mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 font-mono text-[11px] text-accent-text'>
            {tech.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
