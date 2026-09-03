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
import PortfolioMark from './PortfolioMark';
import QRArtwork from './QRArtwork';
import TileConstellation from './TileConstellation';

type Props = {
  data: WorkData;
};

/**
 * Work as a list, the artifact anchored to its own row.
 *
 * Two earlier attempts at this section both put the wrong thing forward. A
 * mosaic of image tiles led with the screenshot — unforgiving for content
 * where two of four projects are ordinary small-business client sites. The
 * version after that fixed that by hiding the artifact behind a hover, but
 * revealed it in a panel that chased the cursor around the page — livelier
 * than anything else on this site, and disconnected from the row it was
 * supposedly illustrating.
 *
 * This keeps the fix (text first, artifact secondary) without the chase: a
 * small artwork sits beside every row's title, quiet at rest, and simply
 * comes forward in place on hover or focus. Nothing moves except what's
 * already sitting where you're looking.
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

      <ul
        data-reveal-group
        className='mt-14 border-t border-border'
        onPointerLeave={() => setActive(null)}
      >
        {data.items.map((item, i) => (
          <WorkRow
            key={item.title}
            item={item}
            index={i}
            isActive={active === i}
            onEnter={() => {
              setActive(i);
              prime(item.title, item.link);
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function WorkRow({
  item,
  index,
  isActive,
  onEnter,
}: {
  item: WorkItem;
  index: number;
  isActive: boolean;
  onEnter: () => void;
}) {
  const label = String(index + 1).padStart(2, '0');

  return (
    /*
     * The reveal wrapper is deliberately separate from the link, and the
     * data attribute rather than a class — the lesson from the mosaic's
     * hover-blanking bug. React owns `className`, so a class added
     * imperatively by an observer gets silently wiped by the first re-render
     * of an element whose className is also hover-driven; a data attribute
     * survives because React never removes an attribute it didn't set.
     */
    <li data-reveal style={{ transitionDelay: `${Math.min(index * 60, 240)}ms` }}>
      <a
        href={item.link}
        target='_blank'
        rel='noopener noreferrer'
        onPointerEnter={onEnter}
        onFocus={onEnter}
        aria-label={`${item.title} — ${item.role}. Opens in a new tab.`}
        className='group block border-b border-border py-8 md:py-10'
      >
        <div className='flex items-start gap-4 md:gap-6'>
          {/* Quiet at rest, comes forward on hover/focus — fixed dimensions
              throughout, so nothing here ever reflows the rows around it. */}
          <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-background-elevated md:h-24 md:w-36'>
            <WorkArtwork item={item} />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted/60'>
              <span className={isActive ? 'text-accent-text' : ''}>{label}</span>{' '}
              {item.role}
            </p>
            <h3 className='mt-1.5 flex items-center gap-2 text-[clamp(1.4rem,3vw,2.15rem)] font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent-text md:mt-2'>
              {item.title}
              <ArrowUpRight
                size={20}
                className='shrink-0 text-foreground-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text'
              />
            </h3>
          </div>
        </div>

        <div className='mt-4 grid gap-3 md:mt-5 md:grid-cols-12 md:gap-8'>
          <p className='max-w-md text-sm leading-relaxed text-foreground-muted md:col-span-7'>
            {item.description}
          </p>
          <div className='md:col-span-5'>
            {/* The outcome, said plainly and at size — the reason this
                project is here, not a caption apologising for the screenshot. */}
            <p className='text-[1.05rem] font-medium leading-snug text-foreground/90'>
              {item.impact}
            </p>
            <p className='mt-3 font-mono text-[11px] text-foreground-muted/70'>
              {item.tech.join(' · ')}
            </p>
          </div>
        </div>
      </a>
    </li>
  );
}

/**
 * The artwork itself: a real screenshot where the design is the deliverable,
 * bespoke media where a photo would be a diagram of something with nothing
 * to diagram. Sits back until noticed — the same "quiet, then forward" idea
 * the mosaic used, just anchored to a fixed box instead of the whole tile.
 */
function WorkArtwork({ item }: { item: WorkItem }) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt={`${item.title} — site preview`}
        fill
        sizes='(min-width: 768px) 9rem, 4rem'
        className='object-cover saturate-[0.4] opacity-70 transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:saturate-100 group-hover:opacity-100 group-focus-visible:scale-[1.06] group-focus-visible:saturate-100 group-focus-visible:opacity-100'
      />
    );
  }
  return (
    <div className='flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,var(--color-accent-subtle),transparent_70%)]'>
      <div className='scale-[0.4] opacity-70 transition-all duration-500 ease-out group-hover:scale-[0.46] group-hover:opacity-100 group-focus-visible:scale-[0.46] group-focus-visible:opacity-100 md:scale-[0.55] md:group-hover:scale-[0.62] md:group-focus-visible:scale-[0.62]'>
        {item.media === 'qr' && item.link ? (
          // A tool that makes QR codes, demonstrated by actually making one.
          <QRArtwork data={item.link} />
        ) : item.media === 'mark' ? (
          // The page the visitor is already inside — no diagram needed.
          <PortfolioMark />
        ) : (
          // Default for any future screenshot-less project: its own stack,
          // drawn in the network's own visual language.
          <TileConstellation items={item.tech} />
        )}
      </div>
    </div>
  );
}
