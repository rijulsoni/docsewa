# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DocSewa client — Next.js frontend for a document conversion tool (image↔PDF, merge, split, OCR text extraction). Currently scaffolding stage: only the root `/` route is implemented; conversion subroutes (`/image-to-pdf`, `/pdf-merge`, `/pdf-split`, `/pdf-to-image`, `/extract-text`, `/merge-pdf`) are linked from UI but the corresponding `src/app/*` route folders do not exist yet.

## Commands

- `npm run dev` — Next dev server with **Turbopack** on http://localhost:3000
- `npm run build` — production build (`next build`)
- `npm start` — serve production build
- `npm run lint` — `next lint` (flat config: `eslint.config.mjs`, extends `next/core-web-vitals` + `next/typescript`)

No test runner configured.

## Stack

- **Next.js 15.3** App Router, **React 19**, **TypeScript** (strict, `target: ES2017`)
- **Tailwind CSS v4** via `@tailwindcss/postcss` (see `postcss.config.js`). `globals.css` is just `@import 'tailwindcss';` — utilities only, no theme tokens.
  - `tailwind.config.js` exists but is a v3-style stub with empty `theme.extend` and is **not used by v4**. Treat as dead file; don't add config there expecting it to take effect.
- **shadcn/ui** (`components.json`): style `new-york`, base color `stone`, RSC enabled, `lucide-react` icons. Generated primitives live in `src/components/ui/`.
- Path alias `@/*` → `src/*` (set in `tsconfig.json` and `components.json`).

## Architecture

```
src/
  app/                  Next App Router (layout.tsx, page.tsx, globals.css)
  components/
    pages/              Page sections + feature components (Home, HeroSection, FeaturesSection,
                        HowItWorks, Navbar, Footer, FileUpload*, ConversionOptions,
                        ActionSelectionGrid, FileRearrangement, ConversionResult, ...)
    ui/                 shadcn primitives (button, dialog, drawer, form, ...)
  hooks/use-mobile.ts   `useIsMobile()` — 768px breakpoint via matchMedia
  lib/utils.ts          `cn(...)` — clsx + tailwind-merge
```

`src/app/page.tsx` mounts `<Home />` from `src/components/pages/Home.tsx`. Page-level state (uploaded `File[]`, modal flags) lives in `Home`; section components are presentational and receive callbacks (`onFileChange`, `onDrop`, `onDragOver`).

### Responsive modal pattern

`Home.tsx` switches between `Dialog` (desktop) and `Drawer` (mobile) using `useIsMobile()`. When adding modal flows, follow the same conditional render — do not assume one or the other. Both branches must include the same children and accessibility wrapping (e.g. `DialogTitle` + `VisuallyHidden`).

### Client vs server components

Anything using `useState`, hooks, event handlers, or `useIsMobile` must be marked `"use client"` (e.g. `Home.tsx`, `ConversionOptions.tsx`). Page sections and `ui/*` primitives may run as RSC unless they import client-only APIs.

### File flow

`Home` collects `File[]` from `<HeroSection>` (input + drag-drop) → opens `ConversionOptions` modal → user picks an action → navigates via `next/link` to a route like `/image-to-pdf?filename=<name>`. Filename is passed as a URL query param; the actual file bytes are not persisted across navigation, so any conversion route must re-prompt for upload (no global file store yet).
