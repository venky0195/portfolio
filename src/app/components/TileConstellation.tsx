
/**
 * Artwork for projects that have no screenshot.
 *
 * Not every project is a website, and the two that aren't were rendering as
 * empty rectangles — the previous placeholder was an index numeral at 7% opacity,
 * which reads as nothing at all once the tile has no border to define it.
 *
 * Instead of inventing a fake screenshot or dropping a box back around the tile,
 * these draw the project's own stack as a small constellation — the same visual
 * language as the network behind the page. A tile without a picture becomes a
 * tile with a diagram of what the thing is made of, which is arguably more
 * honest about a command-line utility than a screenshot would be.
 *
 * Fed by the project's own declared stack rather than by nodes in the site-wide
 * network. An earlier version reused the network's focus map, which produced two
 * points for the QR generator — a line, not a constellation — and named
 * technologies the project doesn't actually use. The tech list is both the more
 * accurate answer and the one that always has enough of it.
 *
 * Deterministic: positions come from the item count, so it composes identically
 * every render and can be art-directed.
 */
export default function TileConstellation({ items }: { items: string[] }) {
  const stack = items.slice(0, 6);
  if (stack.length < 2) return null;

  // Lay the stack out on a gently squashed ellipse so it reads as a considered
  // arrangement rather than a ring.
  const points = stack.map((label, i) => {
    const a = (i / stack.length) * Math.PI * 2 - Math.PI / 2;
    return {
      label,
      x: 50 + Math.cos(a) * 30,
      y: 50 + Math.sin(a) * 22,
    };
  });

  return (
    <svg
      viewBox='0 0 100 100'
      preserveAspectRatio='xMidYMid meet'
      className='h-full w-full'
      aria-hidden='true'
    >
      {/* Connections: the ring, plus one chord so it isn't merely a polygon. */}
      <g stroke='currentColor' className='text-foreground/25' strokeWidth='0.3'>
        {points.map((p, i) => {
          const n = points[(i + 1) % points.length];
          return <line key={`e${i}`} x1={p.x} y1={p.y} x2={n.x} y2={n.y} />;
        })}
        {points.length > 3 && (
          <line
            x1={points[0].x}
            y1={points[0].y}
            x2={points[Math.floor(points.length / 2)].x}
            y2={points[Math.floor(points.length / 2)].y}
          />
        )}
      </g>

      {points.map((p, i) => (
        <g key={p.label}>
          <circle
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 1.6 : 1.1}
            className={i === 0 ? 'fill-accent' : 'fill-foreground/45'}
          />
          <text
            x={p.x}
            y={p.y - 3.2}
            textAnchor='middle'
            className='fill-foreground/40 font-mono'
            style={{ fontSize: '3px' }}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
