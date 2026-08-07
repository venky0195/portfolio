/**
 * The artwork for the one project that doesn't need any.
 *
 * Every other tile answers "what does this look like" or "what does this do".
 * This project is the page the visitor is already standing inside — a diagram
 * of it would be explaining something they're currently experiencing firsthand,
 * which is exactly the kind of exposition the rest of this site has been
 * cutting. So instead of a screenshot, a constellation, or a QR code, this tile
 * just holds the mark that opens the page, at a size that admits what it is.
 */
export default function PortfolioMark() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <p className='flex items-center font-mono text-[clamp(1.75rem,4vw,3rem)] tracking-tight text-foreground/85'>
        <span className='text-foreground-muted/45'>&lt;</span>
        <span>Venky</span>
        <span className='text-accent-text'>/&gt;</span>
        <span
          aria-hidden='true'
          className='ml-1.5 inline-block h-[0.85em] w-[2px] bg-accent-text motion-safe:animate-blink'
        />
      </p>
    </div>
  );
}
