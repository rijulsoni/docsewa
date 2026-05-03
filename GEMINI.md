# DocSewa — Instructional Context

This document provides essential context and instructions for working on the DocSewa project.

## Project Overview

DocSewa is a privacy-first document tools platform offering 97+ utilities (PDF, Word, Image, Excel, Text, etc.). The core philosophy is that tools should run client-side whenever possible to ensure user privacy, with server-side processing only for complex or gated AI features.

- **Stack:** Next.js 15.3 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **UI Architecture:** Radix UI (via shadcn/ui) with a dark "glassmorphism" aesthetic.
- **Key Services:** Clerk (Auth), Stripe (Payments), Anthropic (AI - Claude Haiku).
- **Core Libraries:** `pdf-lib`, `docx`, `xlsx`, `tesseract.js`, `lucide-react`.

## Building and Running

- **Development:** `npm run dev` (uses Turbopack).
- **Production Build:** `npm run build`.
- **Linting:** `npm run lint`.
- **Start Production:** `npm start`.

## Development Conventions

### Architecture & Routing
- **Tool Pages:** Located in `src/app/[tool-name]/page.tsx`. Most tools are interactive and must be marked `"use client"`.
- **API Routes:** Complex or gated logic (e.g., PDF merging, AI chats) resides in `src/app/api/[tool-name]/route.ts`.
- **Shared Components:**
    - `src/components/pages/ToolPageLayout.tsx`: Standard wrapper for all tool pages.
    - `src/components/pages/UploadDropzone.tsx`: Standard file upload interface.
    - `src/components/ui/`: shadcn/ui primitives.

### UI & Styling
- **Tailwind CSS v4:** Uses `@tailwindcss/postcss`. The theme is primarily defined in `src/app/globals.css`.
- **Design Style:** "Glassmorphism" — use `glass-card` class for containers, subtle borders (`border-white/[0.08]`), and low-opacity backgrounds (`bg-white/[0.04]`).
- **Icons:** Use `lucide-react`.
- **Notifications:** Use `sonner` for toast messages.
- **Responsive Modals:** Follow the pattern in `Home.tsx` using `useIsMobile()` to switch between `Dialog` (desktop) and `Drawer` (mobile).

### Best Practices
- **Privacy First:** If a tool can be implemented client-side (e.g., word counter, case converter), do not use an API route.
- **Types:** Strictly type all props and state. Avoid `any`.
- **Performance:** For client-side image or PDF processing, ensure we provide visual feedback (e.g., `Loader2` spinner).
- **Error Handling:** Always wrap complex operations in try/catch and notify the user via `toast.error`.

## Key Files & Locations

- `PLAN.md`: Product roadmap and monetization strategy.
- `CLAUDE.md`: Implementation-specific guidance for AI agents.
- `src/lib/utils.ts`: Contains the `cn` utility for class merging.
- `src/middleware.ts`: Clerk middleware for authentication gating.
