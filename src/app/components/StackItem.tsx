'use client';

import { aliasFor, useNetworkLink } from './NetworkLink';

/**
 * A single technology in the stack list — and a handle on the network behind it.
 *
 * Pointing at it lights up that technology and everything it touches in the
 * background graph. There's no icon, no tooltip and no instruction: the reward
 * is only there for people who move their cursor across the list, which is
 * exactly the kind of curiosity worth paying off.
 */
export default function StackItem({ label }: { label: string }) {
  const ids = aliasFor(label);
  const handlers = useNetworkLink(ids);

  return (
    <span
      {...handlers}
      tabIndex={ids ? 0 : undefined}
      className={`font-mono text-sm text-foreground-muted transition-colors duration-200 ${
        ids ? 'cursor-default hover:text-accent-text focus-visible:text-accent-text' : ''
      }`}
    >
      {label}
    </span>
  );
}
