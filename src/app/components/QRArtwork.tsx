import { encodeQR } from '../lib/qr';

/**
 * A real QR code, not a picture of one.
 *
 * The obvious way to show a "QR code generator" project is a screenshot of its
 * UI. That's also the least interesting way — a screenshot of a text box tells
 * you nothing a caption couldn't. This encodes the project's own repository URL
 * live and draws the actual result, so the artifact demonstrates the tool by
 * being a genuine product of it rather than a picture of a product of it.
 *
 * No backing plate: the modules sit directly on the tile's existing wash so this
 * stays inside the "no boxes" language the rest of the mosaic uses. A few modules
 * of transparent quiet zone are built into the viewBox, which is what a real
 * scanner needs to lock onto the pattern — the tile's own padding adds more on
 * top of that.
 */
export default function QRArtwork({ data }: { data: string }) {
  const matrix = encodeQR(data);
  if (!matrix) return null;

  const n = matrix.length;
  const quiet = 2;
  const size = n + quiet * 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className='h-full w-full max-w-[10rem] text-foreground/80'
      aria-hidden='true'
      shapeRendering='crispEdges'
    >
      {matrix.map((row, y) =>
        row.map((dark, x) =>
          dark ? (
            <rect
              key={`${x}-${y}`}
              x={x + quiet}
              y={y + quiet}
              width={1}
              height={1}
              fill='currentColor'
            />
          ) : null
        )
      )}
    </svg>
  );
}
