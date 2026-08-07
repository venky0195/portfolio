'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

import { PROJECT_FOCUS } from '../lib/network';
import { usePriming } from '../lib/usePriming';
import { WorkData, WorkItem } from '../types';
import TileConstellation from './TileConstellation';

type Props = {
  data: WorkData;
};

/**
 * Work as an editorial mosaic.
 *
 * Two previous attempts failed for opposite reasons. Cards in a row put every
 * project in an identical bordered box, which read as a gallery and collapsed
 * into grey rectangles the moment you removed the words. An index with one
 * preview fixed the visual language but hid the breadth — a visitor who simply
 * scrolled saw a single project and left thinking there was one.
 *
 * This shows all of it at once and still rewards attention. No boxes and no
 * uniform grid: images sit at deliberately different sizes so the two client
 * builds carry more weight than the side projects, and the titles sit over the
 * work rather than in a caption beneath it. Everything essential — name, role,
 * year, stack — is readable without touching anything. Pointing at one lifts it,
 * settles the others back, and re-poses the network behind the page to that
 * project's real architecture.
 */
export default function WorkSection({ data }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const { prime } = usePriming();
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Only reach into the background while this section is genuinely being read —
   * otherwise it lit the network up while the visitor was still in the hero,
   * handing them answers they hadn't asked for.
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.intersectionRatio > 0.2),
      { threshold: [0, 0.2, 0.5] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || active === null) {
      window.dispatchEvent(
        new CustomEvent('network:highlight', { detail: null })
      );
      window.dispatchEvent(new CustomEvent('network:focus', { detail: null }));
      return;
    }
    const title = data.items[active].title;
    window.dispatchEvent(
      new CustomEvent('network:highlight', {
        detail: PROJECT_FOCUS[title] ?? null,
      })
    );
    window.dispatchEvent(new CustomEvent('network:focus', { detail: title }));
  }, [active, inView, data.items]);

  // Deliberately uneven: the two commissioned builds get the weight, the side
  // projects sit smaller beneath them. Hierarchy is the whole reason this isn't
  // a grid.
  const spans = [
    'md:col-span-7 md:aspect-[16/11]',
    'md:col-span-5 md:aspect-[4/5]',
    'md:col-span-5 md:aspect-[4/3]',
    'md:col-span-7 md:aspect-[16/10]',
  ];

  return (
    <div ref={rootRef} className='mx-auto max-w-7xl px-6 py-24 md:py-28'>
      <div data-reveal-group className='max-w-3xl'>
        <p data-reveal className='font-mono text-sm text-accent-text'>
          {`// ${data.kicker}`}
        </p>
        <h2
          data-reveal
          id='work-heading'
          className='mt-3 text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground'
        >
          {data.title}
        </h2>
      </div>

      <div
        data-reveal-group
        className='mt-14 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-12'
        onPointerLeave={() => setActive(null)}
      >
        {data.items.map((item, i) => (
          <WorkTile
            key={item.title}
            item={item}
            index={i}
            className={spans[i % spans.length]}
            dimmed={active !== null && active !== i}
            onEnter={() => {
              setActive(i);
              prime(item.title, item.link);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function WorkTile({
  item,
  index,
  className,
  dimmed,
  onEnter,
}: {
  item: WorkItem;
  index: number;
  className: string;
  dimmed: boolean;
  onEnter: () => void;
}) {
  const label = String(index + 1).padStart(2, '0');

  return (
    /*
     * The reveal wrapper is deliberately separate from the link.
     *
     * `data-reveal` must sit on an element whose className React never rewrites.
     * It used to be on the anchor below, whose classes change with hover state —
     * so the first hover re-rendered it, wiped the reveal flag, and left the tile
     * stuck at opacity 0 for the rest of the visit. One element for entrance,
     * one for interaction.
     */
    <div data-reveal className={className}>
      <a
        href={item.link}
        target='_blank'
        rel='noopener noreferrer'
        onPointerEnter={onEnter}
        onFocus={onEnter}
        aria-label={`${item.title} — ${item.role}. Opens in a new tab.`}
        // Opacity is set inline rather than via a utility class: this element's
        // class string is rebuilt on every hover, and keeping the one value that
        // matters out of that churn makes the dimming impossible to lose to
        // class ordering or specificity.
        style={{ opacity: dimmed ? 0.45 : 1 }}
        className='group relative block h-full overflow-hidden rounded-xl transition-opacity duration-500'
      >
        <div className='relative h-full min-h-[15rem] w-full overflow-hidden bg-background-elevated'>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={`${item.title} — site preview`}
              fill
              sizes='(min-width: 768px) 55vw, 100vw'
              // Sits back until noticed, then comes fully forward. The saturation
              // shift is what stops four screenshots reading as four screenshots.
              className='object-cover saturate-[0.55] transition-all duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:saturate-100 group-focus-visible:scale-[1.04] group-focus-visible:saturate-100'
            />
          ) : (
            // No screenshot: draw what the thing is actually made of instead.
            // A soft wash keeps the tile from reading as a hole in the mosaic.
            <div className='relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,var(--color-accent-subtle),transparent_70%)] p-10 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]'>
              <TileConstellation items={item.tech} />
            </div>
          )}

          {/* Type over the work, not in a caption below it. */}
          <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/45 to-transparent p-6'>
            <p className='font-mono text-[10px] uppercase tracking-[0.16em] text-accent-text'>
              <span className='text-foreground-muted/70'>{label}</span> {item.role}
            </p>

            <h3 className='mt-2 flex items-center gap-2 text-[clamp(1.35rem,2.2vw,1.9rem)] font-semibold tracking-tight text-foreground'>
              {item.title}
              <ArrowUpRight
                size={20}
                className='shrink-0 text-foreground-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text'
              />
            </h3>

            <p className='mt-1.5 font-mono text-[11px] text-foreground-muted/70'>
              {item.tech.join(' · ')}
            </p>

            {/* The outcome is the reward for looking closer. */}
            <p className='mt-0 max-h-0 max-w-md overflow-hidden text-sm leading-relaxed text-foreground opacity-0 transition-all duration-500 group-hover:mt-3 group-hover:max-h-28 group-hover:opacity-100 group-focus-visible:mt-3 group-focus-visible:max-h-28 group-focus-visible:opacity-100'>
              {item.impact}
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}
