"use client"

import type { Annotation, PageInfo } from '../types';

/**
 * Convert a CSS color (#rrggbb) to pdf-lib rgb (0..1).
 * Falls back to black on parse failure.
 */
function parseColor(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 0, g: 0, b: 0 };
  const n = parseInt(m[1], 16);
  return { r: ((n >> 16) & 0xff) / 255, g: ((n >> 8) & 0xff) / 255, b: (n & 0xff) / 255 };
}

/**
 * Flatten all annotations into a copy of the original PDF and return the bytes.
 *
 * Annotation coords are in PDF points with origin top-left.
 * pdf-lib uses origin bottom-left, so we convert: pdfY = pageHeight - (y + h).
 */
export async function savePdfWithAnnotations(
  pdfBytes: ArrayBuffer,
  pages: PageInfo[],
  annotations: Annotation[],
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import('@cantoo/pdf-lib');

  const doc = await PDFDocument.load(pdfBytes.slice(0));
  const pdfPages = doc.getPages();

  // Lazily embed fonts — most PDFs won't use all of them.
  let helvetica: import('@cantoo/pdf-lib').PDFFont | null = null;
  let helveticaBold: import('@cantoo/pdf-lib').PDFFont | null = null;
  let helveticaOblique: import('@cantoo/pdf-lib').PDFFont | null = null;
  let helveticaBoldOblique: import('@cantoo/pdf-lib').PDFFont | null = null;
  const getFont = async (bold?: boolean, italic?: boolean) => {
    if (bold && italic) {
      if (!helveticaBoldOblique) helveticaBoldOblique = await doc.embedFont(StandardFonts.HelveticaBoldOblique);
      return helveticaBoldOblique;
    }
    if (bold) {
      if (!helveticaBold) helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
      return helveticaBold;
    }
    if (italic) {
      if (!helveticaOblique) helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);
      return helveticaOblique;
    }
    if (!helvetica) helvetica = await doc.embedFont(StandardFonts.Helvetica);
    return helvetica;
  };

  // Group annotations by page for slightly faster iteration
  const byPage = new Map<number, Annotation[]>();
  for (const a of annotations) {
    const arr = byPage.get(a.pageIndex) ?? [];
    arr.push(a);
    byPage.set(a.pageIndex, arr);
  }

  for (const [pageIndex, anns] of byPage.entries()) {
    const page = pdfPages[pageIndex];
    if (!page) continue;
    const pageInfo = pages[pageIndex];
    const pageHeight = pageInfo.height;

    // Sort by id for deterministic z-order
    anns.sort((x, y) => x.id.localeCompare(y.id));

    for (const a of anns) {
      // pdf-lib y is from bottom; our y is from top of page
      const pdfY = pageHeight - (a.y + a.h);

      switch (a.type) {
        case 'whiteout': {
          page.drawRectangle({
            x: a.x,
            y: pdfY,
            width: a.w,
            height: a.h,
            color: rgb(1, 1, 1),
            borderWidth: 0,
          });
          break;
        }
        case 'text': {
          const font = await getFont(a.bold, a.italic);
          const c = parseColor(a.color);
          // Draw the text near the top of the box (PDF baseline is bottom of glyph)
          page.drawText(a.text, {
            x: a.x,
            y: pageHeight - a.y - a.fontSize, // baseline at top + fontSize
            size: a.fontSize,
            font,
            color: rgb(c.r, c.g, c.b),
            maxWidth: a.w,
            lineHeight: a.fontSize * 1.2,
          });
          break;
        }
        case 'shape': {
          const c = parseColor(a.stroke);
          const fillC = a.fill ? parseColor(a.fill) : null;
          if (a.shape === 'rectangle') {
            page.drawRectangle({
              x: a.x,
              y: pdfY,
              width: a.w,
              height: a.h,
              borderColor: rgb(c.r, c.g, c.b),
              borderWidth: a.strokeWidth,
              color: fillC ? rgb(fillC.r, fillC.g, fillC.b) : undefined,
            });
          } else if (a.shape === 'ellipse') {
            page.drawEllipse({
              x: a.x + a.w / 2,
              y: pdfY + a.h / 2,
              xScale: a.w / 2,
              yScale: a.h / 2,
              borderColor: rgb(c.r, c.g, c.b),
              borderWidth: a.strokeWidth,
              color: fillC ? rgb(fillC.r, fillC.g, fillC.b) : undefined,
            });
          } else if (a.shape === 'arrow') {
            const startX = a.x;
            const startY = pdfY + a.h;
            const endX = a.x + a.w;
            const endY = pdfY;
            page.drawLine({
              start: { x: startX, y: startY },
              end: { x: endX, y: endY },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
            });
            // Arrow head
            const dx = endX - startX;
            const dy = endY - startY;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const head = Math.max(8, a.strokeWidth * 4);
            const leftX = endX - ux * head + uy * head * 0.5;
            const leftY = endY - uy * head - ux * head * 0.5;
            const rightX = endX - ux * head - uy * head * 0.5;
            const rightY = endY - uy * head + ux * head * 0.5;
            page.drawLine({
              start: { x: endX, y: endY },
              end: { x: leftX, y: leftY },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
            });
            page.drawLine({
              start: { x: endX, y: endY },
              end: { x: rightX, y: rightY },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
            });
          }
          break;
        }
        case 'draw': {
          if (a.path.length < 2) break;
          const c = parseColor(a.stroke);
          // Build SVG path "M x y L x y L x y..."
          // Path points are stored relative to (a.x, a.y) in our top-left coords.
          // Convert to absolute PDF coords (top-left), then pdfY = pageHeight - y.
          const pts = a.path.map(([px, py]) => ({
            x: a.x + px,
            y: pageHeight - (a.y + py),
          }));
          const d =
            `M ${pts[0].x} ${pts[0].y} ` +
            pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
          page.drawSvgPath(d, {
            borderColor: rgb(c.r, c.g, c.b),
            borderWidth: a.strokeWidth,
            borderOpacity: a.opacity,
            color: undefined,
          });
          break;
        }
        case 'image': {
          // Strip data URL prefix
          const base64 = a.src.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
          const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const img = a.mime === 'image/png'
            ? await doc.embedPng(bytes)
            : await doc.embedJpg(bytes);
          page.drawImage(img, {
            x: a.x,
            y: pdfY,
            width: a.w,
            height: a.h,
            rotate: degrees(0),
          });
          break;
        }
      }
    }
  }

  return await doc.save();
}

export function downloadPdfBytes(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
