/**
 * Convert screen pixel position (origin top-left) within a page canvas
 * to PDF point coordinates (origin top-left in our internal model — we'll
 * flip to bottom-left only when calling pdf-lib in save-pdf.ts).
 */
export function screenToPdf(
  screenX: number,
  screenY: number,
  scale: number,
): { x: number; y: number } {
  return { x: screenX / scale, y: screenY / scale };
}

/** PDF points (top-left origin) to screen pixels at the given scale. */
export function pdfToScreen(
  x: number,
  y: number,
  scale: number,
): { x: number; y: number } {
  return { x: x * scale, y: y * scale };
}

/** Bound a value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp a rect into page bounds. */
export function clampRect(
  x: number,
  y: number,
  w: number,
  h: number,
  pageWidth: number,
  pageHeight: number,
): { x: number; y: number; w: number; h: number } {
  const cw = clamp(w, 1, pageWidth);
  const ch = clamp(h, 1, pageHeight);
  return {
    w: cw,
    h: ch,
    x: clamp(x, 0, pageWidth - cw),
    y: clamp(y, 0, pageHeight - ch),
  };
}
