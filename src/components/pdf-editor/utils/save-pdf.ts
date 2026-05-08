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
  pageRotations: Record<number, number> = {},
  deletedPages: number[] = [],
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import('@cantoo/pdf-lib');

  const doc = await PDFDocument.load(pdfBytes.slice(0));
  const pdfPages = doc.getPages();
  const deleteSet = new Set(deletedPages);

  // Lazily embed fonts — most PDFs won't use all of them.
  const fontCache = new Map<string, import('@cantoo/pdf-lib').PDFFont>();
  const getFont = async (family: string = 'helvetica', bold?: boolean, italic?: boolean) => {
    const key = `${family}:${bold ? 'b' : 'r'}:${italic ? 'i' : 'n'}`;
    const cached = fontCache.get(key);
    if (cached) return cached;
    const standardFont =
      family === 'times'
        ? bold && italic
          ? StandardFonts.TimesRomanBoldItalic
          : bold
          ? StandardFonts.TimesRomanBold
          : italic
          ? StandardFonts.TimesRomanItalic
          : StandardFonts.TimesRoman
        : family === 'courier'
        ? bold && italic
          ? StandardFonts.CourierBoldOblique
          : bold
          ? StandardFonts.CourierBold
          : italic
          ? StandardFonts.CourierOblique
          : StandardFonts.Courier
        : bold && italic
        ? StandardFonts.HelveticaBoldOblique
        : bold
        ? StandardFonts.HelveticaBold
        : italic
        ? StandardFonts.HelveticaOblique
        : StandardFonts.Helvetica;
    const font = await doc.embedFont(standardFont);
    fontCache.set(key, font);
    return font;
  };

  // Group annotations by page for slightly faster iteration
  const byPage = new Map<number, Annotation[]>();
  for (const a of annotations) {
    const arr = byPage.get(a.pageIndex) ?? [];
    arr.push(a);
    byPage.set(a.pageIndex, arr);
  }

  for (const [pageIndex, anns] of byPage.entries()) {
    if (deleteSet.has(pageIndex)) continue; // skip deleted pages entirely
    const page = pdfPages[pageIndex];
    if (!page) continue;
    const pageInfo = pages[pageIndex];
    const pageHeight = pageInfo.height;

    // Sort by z-index for deterministic visual stacking.
    anns.sort((x, y) => (x.zIndex ?? 0) - (y.zIndex ?? 0) || x.id.localeCompare(y.id));

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
        case 'redaction': {
          page.drawRectangle({
            x: a.x,
            y: pdfY,
            width: a.w,
            height: a.h,
            color: rgb(0, 0, 0),
            borderWidth: 0,
          });
          break;
        }
        case 'mark': {
          const c = parseColor(a.color);
          const opacity = a.opacity ?? 1;
          const x1 = a.x + a.w * 0.14;
          const x2 = a.x + a.w * 0.4;
          const x3 = a.x + a.w * 0.86;
          const y1 = pdfY + a.h * 0.45;
          const y2 = pdfY + a.h * 0.2;
          const y3 = pdfY + a.h * 0.8;
          if (a.mark === 'check') {
            page.drawLine({
              start: { x: x1, y: y1 },
              end: { x: x2, y: y2 },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
              opacity,
            });
            page.drawLine({
              start: { x: x2, y: y2 },
              end: { x: x3, y: y3 },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
              opacity,
            });
          } else {
            page.drawLine({
              start: { x: a.x + a.w * 0.2, y: pdfY + a.h * 0.2 },
              end: { x: a.x + a.w * 0.8, y: pdfY + a.h * 0.8 },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
              opacity,
            });
            page.drawLine({
              start: { x: a.x + a.w * 0.8, y: pdfY + a.h * 0.2 },
              end: { x: a.x + a.w * 0.2, y: pdfY + a.h * 0.8 },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
              opacity,
            });
          }
          break;
        }
        case 'text': {
          const font = await getFont(a.fontFamily, a.bold, a.italic);
          const c = parseColor(a.color);
          if (a.background) {
            const bg = parseColor(a.background);
            page.drawRectangle({
              x: a.x,
              y: pdfY,
              width: a.w,
              height: a.h,
              color: rgb(bg.r, bg.g, bg.b),
              opacity: a.backgroundOpacity ?? 0.85,
              borderWidth: 0,
            });
          }
          // Draw the text near the top of the box (PDF baseline is bottom of glyph)
          page.drawText(a.text, {
            x: a.x,
            y: pageHeight - a.y - a.fontSize, // baseline at top + fontSize
            size: a.fontSize,
            font,
            color: rgb(c.r, c.g, c.b),
            opacity: a.opacity ?? 1,
            maxWidth: a.w,
            lineHeight: a.fontSize * 1.2,
          });
          break;
        }
        case 'shape': {
          const c = parseColor(a.stroke);
          const fillC = a.fill ? parseColor(a.fill) : null;
          const opacity = a.opacity ?? 1;
          if (a.shape === 'rectangle') {
            page.drawRectangle({
              x: a.x,
              y: pdfY,
              width: a.w,
              height: a.h,
              borderColor: rgb(c.r, c.g, c.b),
              borderWidth: a.strokeWidth,
              borderOpacity: opacity,
              color: fillC ? rgb(fillC.r, fillC.g, fillC.b) : undefined,
              opacity,
            });
          } else if (a.shape === 'ellipse') {
            page.drawEllipse({
              x: a.x + a.w / 2,
              y: pdfY + a.h / 2,
              xScale: a.w / 2,
              yScale: a.h / 2,
              borderColor: rgb(c.r, c.g, c.b),
              borderWidth: a.strokeWidth,
              borderOpacity: opacity,
              color: fillC ? rgb(fillC.r, fillC.g, fillC.b) : undefined,
              opacity,
            });
          } else if (a.shape === 'line' || a.shape === 'arrow') {
            const startX = a.x;
            const startY = pdfY + a.h;
            const endX = a.x + a.w;
            const endY = pdfY;
            page.drawLine({
              start: { x: startX, y: startY },
              end: { x: endX, y: endY },
              thickness: a.strokeWidth,
              color: rgb(c.r, c.g, c.b),
              opacity,
            });
            if (a.shape === 'arrow') {
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
                opacity,
              });
              page.drawLine({
                start: { x: endX, y: endY },
                end: { x: rightX, y: rightY },
                thickness: a.strokeWidth,
                color: rgb(c.r, c.g, c.b),
                opacity,
              });
            }
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
            opacity: a.opacity ?? 1,
          });
          break;
        }
        case 'note': {
          // Yellow rectangle background with text on top
          const bg = parseColor(a.background);
          const txt = parseColor(a.color);
          page.drawRectangle({
            x: a.x,
            y: pdfY,
            width: a.w,
            height: a.h,
            color: rgb(bg.r, bg.g, bg.b),
            opacity: a.opacity ?? 1,
            borderColor: rgb(0.85 * bg.r, 0.85 * bg.g, 0.85 * bg.b),
            borderWidth: 0.5,
            borderOpacity: a.opacity ?? 1,
          });
          const font = await getFont('helvetica', false, false);
          page.drawText(a.text, {
            x: a.x + 6,
            y: pageHeight - a.y - a.fontSize - 4,
            size: a.fontSize,
            font,
            color: rgb(txt.r, txt.g, txt.b),
            opacity: a.opacity ?? 1,
            maxWidth: a.w - 12,
            lineHeight: a.fontSize * 1.25,
          });
          break;
        }
        case 'stamp': {
          // Bordered rectangle + uppercase text inside, optional rotation.
          const c = parseColor(a.color);
          const rotation = a.rotation ?? 0;
          const cx = a.x + a.w / 2;
          const cy = pdfY + a.h / 2;
          const font = await getFont('helvetica', true, false);
          const padX = 8;
          const padY = 4;
          const stampText = a.text.toUpperCase();
          const textWidth = font.widthOfTextAtSize(stampText, a.fontSize);
          const boxW = textWidth + padX * 2;
          const boxH = a.fontSize + padY * 2;
          page.drawRectangle({
            x: cx - boxW / 2,
            y: cy - boxH / 2,
            width: boxW,
            height: boxH,
            borderColor: rgb(c.r, c.g, c.b),
            borderWidth: 2.5,
            borderOpacity: a.opacity ?? 1,
            rotate: degrees(rotation),
          });
          page.drawText(stampText, {
            x: cx - textWidth / 2,
            y: cy - a.fontSize / 2 + 1,
            size: a.fontSize,
            font,
            color: rgb(c.r, c.g, c.b),
            opacity: a.opacity ?? 1,
            rotate: degrees(rotation),
          });
          break;
        }
      }
    }
  }

  // Apply per-page rotation. Rotation is applied AFTER drawing annotations so they
  // visually rotate with the page (matching the editor preview).
  for (const [keyStr, deg] of Object.entries(pageRotations)) {
    const idx = Number(keyStr);
    if (deleteSet.has(idx)) continue;
    const page = pdfPages[idx];
    if (!page || !deg) continue;
    page.setRotation(degrees(deg));
  }

  // Remove deleted pages — iterate in descending index so removal doesn't shift later indices.
  const sortedDeletes = [...deletedPages].sort((a, b) => b - a);
  for (const idx of sortedDeletes) {
    if (idx >= 0 && idx < doc.getPageCount()) {
      doc.removePage(idx);
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
