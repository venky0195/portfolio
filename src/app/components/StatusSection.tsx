'use client';

import {
  FileText,
  Github,
  Linkedin,
} from 'lucide-react';

import { StatusData } from '../types';
import SplitReveal from './SplitReveal';

type Props = {
  data: StatusData;
};

const ICONS: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  github: Github,
};

/**
 * Contact as a health check.
 *
 * The status-page framing fits someone who owns uptime, but the framing is
 * never allowed to obscure the function: the email address is the visible label
 * of the primary button, not hidden behind a metaphor. A clever contact section
 * that makes you hunt for the address has optimised for the author instead of
 * the reader.
 */
export default function StatusSection({ data }: Props) {
  return (
    <>
      {/*
        Rhythm: the page has been an even cadence until here, so the ending gets
        a screen of near-silence before it. The network behind this is winding
        down to rest at the same time — that settling is the whole ending. It
        replaced a written closing line, which explained the feeling instead of
        letting anyone have it.
      */}
      <div className='h-24 md:h-32' aria-hidden='true' />

      <div
        data-reveal-group
        className='mx-auto max-w-5xl px-6 pb-24 md:pb-28'
      >
        <p data-reveal className='font-mono text-sm text-accent-text'>
          {`// ${data.kicker}`}
        </p>

        <SplitReveal
          as='h2'
          by='word'
          id='status-heading'
          text={data.title}
          className='mt-4 max-w-3xl text-[clamp(2.1rem,6vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground'
        />

        <p
          data-reveal
          className='mt-7 max-w-xl text-lg leading-relaxed text-foreground-muted'
        >
          {data.subheading}
        </p>

        {/* The dots suggest "everything's fine" without labelling it. */}
        <ul data-reveal className='mt-12 space-y-3'>
          {data.checks.map((check) => (
            <li key={check.label} className='flex items-center gap-3'>
              <span className='relative flex h-2 w-2 shrink-0'>
                <span className='absolute inline-flex h-full w-full rounded-full bg-success/70 motion-safe:animate-ping' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-success' />
              </span>
              <span className='font-mono text-sm text-foreground'>
                {check.label}
              </span>
            </li>
          ))}
        </ul>

        <div data-reveal className='mt-12'>
          <a
            href={data.primaryCta.href}
            className='group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-4 font-mono text-sm font-medium text-stone-950 transition-transform duration-200 hover:-translate-y-0.5 sm:text-base'
          >
            {data.primaryCta.label}
            <span
              aria-hidden='true'
              className='transition-transform duration-200 group-hover:translate-x-0.5'
            >
              →
            </span>
          </a>
        </div>

        <div
          data-reveal
          className='mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border pt-8'
        >
          {data.links.map(({ type, label, href }) => {
            const Icon = ICONS[type];
            return (
              <a
                key={type}
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                className='link-underline flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground'
              >
                {Icon && <Icon size={16} />} {label}
              </a>
            );
          })}

          <a
            href={data.resume.href}
            target='_blank'
            rel='noopener noreferrer'
            className='link-underline flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-foreground'
          >
            <FileText size={16} /> {data.resume.label}
          </a>
        </div>
      </div>
    </>
  );
}
