type Variant = 'work' | 'trace' | 'origin' | 'status';

/**
 * Ambient light for one chapter, not a background.
 *
 * Every section still sits on the same near-black canvas and the same fixed
 * network — that continuity is the point. What changes is how the light falls:
 * a soft pool here, a vignette there, warmth pulled toward one corner instead
 * of another. No panel, no border, no blur-glass — everything below is a
 * gradient fading to transparent, so there is no edge for the eye to read as
 * a box.
 *
 * Rendered as a sibling behind each section's content (`-z-10` inside `main`,
 * which is already stacked above the fixed network canvas), so it sits between
 * the graph and the words: close enough to tint the graph's presence, never
 * close enough to compete with type.
 */
const GLOW: Record<Variant, string> = {
  // Product chapter: a bloom overhead where the mosaic opens, a second pool
  // low and to the right where the smaller side-projects sit.
  work:
    'radial-gradient(ellipse 58% 46% at 46% -4%, var(--color-accent-subtle), transparent 68%), ' +
    'radial-gradient(ellipse 64% 52% at 92% 104%, color-mix(in srgb, var(--color-background-elevated) 65%, transparent), transparent 62%)',
  // Archive chapter: light spills in from above and below, leaving the
  // waterfall itself sitting in the clearest, quietest part of the page.
  trace:
    'linear-gradient(to bottom, ' +
    'color-mix(in srgb, var(--color-background-elevated) 60%, transparent) 0%, ' +
    'transparent 26%, transparent 74%, ' +
    'color-mix(in srgb, var(--color-background-elevated) 60%, transparent) 100%)',
  // Human chapter: warmth gathers where the portrait sits, quietest and most
  // intimate of the four — the network recedes furthest here.
  origin:
    'radial-gradient(ellipse 48% 62% at 6% 28%, var(--color-accent-subtle), transparent 60%), ' +
    'radial-gradient(ellipse 58% 60% at 100% 96%, color-mix(in srgb, var(--color-background-elevated) 55%, transparent), transparent 58%)',
  // Arrival chapter: a single warmth rising from where the network is
  // gathering and the last CTA lives.
  status:
    'radial-gradient(ellipse 64% 58% at 50% 112%, var(--color-accent-subtle), transparent 64%)',
};

export default function SectionAtmosphere({ variant }: { variant: Variant }) {
  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10'>
      <div className='absolute inset-0' style={{ backgroundImage: GLOW[variant] }} />

      {/* A seam of light, not a divider: marks where this chapter opens. */}
      <div
        className='absolute inset-x-0 top-0 h-px'
        style={{
          backgroundImage:
            'linear-gradient(to right, transparent, var(--color-foreground-muted) 50%, transparent)',
          opacity: 0.16,
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
}
