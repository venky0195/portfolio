'use client';

import {
  useEffect,
  useRef,
} from 'react';

type Props = {
  text: string;
  /**
   * Headings split to characters for a crisp, deliberate cascade. Body copy
   * splits to words — per-character paragraph animation is both unreadable and
   * an order of magnitude more DOM nodes.
   */
  by?: 'char' | 'word';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  id?: string;
  /** Seconds to wait before the cascade starts. */
  delay?: number;
  /** Play on mount (hero) instead of waiting to enter the viewport. */
  immediate?: boolean;
};

/**
 * Masked per-character/word text reveal.
 *
 * Deliberately CSS-driven: the masked start state lives behind `.motion-ready`
 * (added only once the reveal manager is running) and the rest state is a single
 * a `data-revealed` attribute. Nothing here can leave text permanently invisible — if
 * JS never runs, or motion is reduced, the type simply renders in place.
 *
 * That matters more than it sounds: hiding text in JS and relying on an observer
 * or scroll trigger to put it back turns any motion failure into a *content*
 * failure, which is the most common way ambitious text animation breaks.
 */
export default function SplitReveal({
  text,
  by = 'char',
  as: Tag = 'span',
  className,
  id,
  delay = 0,
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (immediate) {
      // Next frame, so the transition has a start state to animate from.
      const raf = requestAnimationFrame(() => el.setAttribute('data-revealed', ''));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute('data-revealed', '');
        observer.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [immediate]);

  // Always split on words first. Line breaks may only ever happen between
  // words, so each word is an unbreakable unit; character animation then
  // happens *inside* those units. Splitting straight to characters lets the
  // browser break lines mid-word, which is what makes naive text-split
  // implementations look broken at narrow widths.
  const words = text.split(' ');
  let pieceIndex = 0;

  return (
    // The split spans are decorative duplicates of `text`; exposing the string
    // via aria-label and hiding the pieces keeps this a single clean label for
    // assistive tech instead of a stream of disconnected characters.
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      id={id}
      aria-label={text}
      data-split
    >
      <span aria-hidden='true'>
        {words.map((word, wi) => (
          <span key={wi} className='inline-flex whitespace-nowrap'>
            {(by === 'char' ? Array.from(word) : [word]).map((unit, ci) => {
              const stagger = by === 'char' ? 0.022 : 0.035;
              const pieceDelay = delay + pieceIndex * stagger;
              pieceIndex += 1;
              return (
                <span
                  key={ci}
                  className='inline-block overflow-hidden'
                  // Extra room below the baseline so descenders (g, y, p) aren't
                  // sliced off by the overflow mask.
                  style={{
                    paddingBottom: '0.14em',
                    marginBottom: '-0.14em',
                  }}
                >
                  <span
                    data-piece
                    className='inline-block'
                    style={{ transitionDelay: `${pieceDelay.toFixed(3)}s` }}
                  >
                    {unit}
                  </span>
                </span>
              );
            })}
            {wi < words.length - 1 && <span>&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  );
}
