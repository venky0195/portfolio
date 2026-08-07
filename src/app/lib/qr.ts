import qrcodeGenerator from 'qrcode-generator';

/**
 * Encodes a string into a QR module matrix.
 *
 * Pure, synchronous, and dependency-free at runtime (qrcode-generator does the
 * math, nothing else). That purity matters here beyond tidiness: because it
 * touches no browser API, it runs identically during server rendering — so the
 * real, correctly-encoded code is present in the first HTML response, with zero
 * client JS required to see it. The one thing this site keeps insisting on
 * everywhere else (nothing essential hidden behind a script tag) holds here too.
 *
 * Returns null rather than throwing if the input can't be encoded, so a render
 * path never has to guess whether the matrix is trustworthy.
 */
export function encodeQR(text: string): boolean[][] | null {
  try {
    const qr = qrcodeGenerator(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    const matrix: boolean[][] = [];
    for (let y = 0; y < n; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < n; x++) row.push(qr.isDark(y, x));
      matrix.push(row);
    }
    return matrix;
  } catch {
    return null;
  }
}
