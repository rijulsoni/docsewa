# DocSewa — Product & Business Plan

## Overview

DocSewa is a free, privacy-first document tools platform. All 97 tools run in the browser — files never leave the user's device. Monetisation is driven by AI features and usage volume, not tool access.

**Live URL:** http://localhost:3000  
**Stack:** Next.js 15.3 · React 19 · TypeScript · Tailwind CSS v4 · Vercel

---

## Current Tools — 97 Total

| Category | Count | Notes |
|---|---|---|
| PDF | 20 | Merge, split, compress, rotate, watermark, protect, unlock, sign, crop, reorder, remove pages, page numbers, header/footer, flatten, metadata, image→PDF, PDF→image, extract text, **Chat with PDF (AI)**, **Document Translator** |
| Word / DOCX | 11 | DOCX→Text, HTML, PDF, Markdown; PDF→DOCX; Merge, Find & Replace, Metadata, Extract Images, Word Count, TXT→DOCX |
| Image | 15 | Format converter, BG remover (AI), batch compress, upscaler, image→text (AI), crop, resize, watermark, flip/rotate, color palette, GIF maker, color picker, favicon generator, image→Base64, **OCR Scanner** |
| Excel / CSV | 7 | Excel→CSV, CSV→Excel, Excel→JSON, JSON→Excel, Merge Excel, CSV Merge, CSV Diff |
| Text | 14 | Case converter, word counter, lorem ipsum, find & replace, sort lines, remove duplicates, text diff, markdown→HTML, HTML→markdown, URL slug, string escape, fancy text, number→words, text encoder |
| Developer | 15 | JSON formatter, Base64, hash generator, JWT decoder, URL encoder, HTML entities, regex tester, UUID generator, color converter, number base converter, timestamp converter, password generator, JSON→CSV, CRON parser, Markdown table |
| Finance | 4 | Loan calculator, compound interest, tip calculator, discount calculator |
| Date & Time | 4 | Age calculator, date difference, timezone converter, work days calculator |
| Calculators | 4 | Percentage calc, unit converter, BMI calculator, QR generator |
| CSS & Design | 3 | Gradient generator, box shadow generator, CSS formatter |

---

## Business Model

### Core Philosophy

> **All 97 tools are free and unlimited.** Only AI usage volume and large file sizes are gated. This maximises SEO traffic, user adoption, and word-of-mouth growth.

### Pricing Tiers

| | Free | Pro — $8/mo | Teams — $24/mo |
|---|---|---|---|
| Price | $0 | $8/month or $72/year | $24/month (up to 5 seats) |
| All 97 tools | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Max file size | 10 MB | 50 MB | 200 MB |
| Chat with PDF | 3 chats/day | Unlimited | Unlimited |
| AI messages/chat | 10 messages | Unlimited | Unlimited |
| Document Translator | 3 docs/day | Unlimited | Unlimited |
| Batch file processing | 1 file | Up to 20 files | Up to 100 files |
| History & saved files | ❌ | Last 30 docs | Last 90 docs |
| Priority processing | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ 10K req/mo |
| Support | Community | Email (48h) | Priority (12h) |
| Account required | No | Yes | Yes |

### Annual Discount
- Monthly: $8/mo
- Annual: $72/year ($6/mo effective) — saves 25%, drives upfront cash

---

## Revenue Projections

### At 1,000 Daily Users (30,000 monthly visitors)

| Metric | Conservative | Optimistic |
|---|---|---|
| Free → Pro conversion | 1.5% | 3% |
| Pro subscribers | 450 | 900 |
| Teams subscribers | 20 | 50 |
| Monthly Revenue | ~$4,080 | ~$8,400 |
| Annual Revenue | ~$49K | ~$100K |

### Operating Costs

| Cost | Free tier | 500 Pro users |
|---|---|---|
| Vercel Pro hosting | $20/mo | $20/mo |
| Claude Haiku API (AI chats) | ~$15/mo | ~$180/mo |
| MyMemory / translations | $0 | $0 |
| Clerk auth | $0 (≤10K MAU) | $0 |
| Stripe fees | $0 | ~3% of revenue |
| **Total** | **~$35/mo** | **~$230/mo** |

**Margin at 500 Pro users: ~93%**

---

## Free vs Paid — Feature Gates

### Free Forever (client-side, $0 server cost)
All 94 standard tools run entirely in the browser — unlimited, no login needed:
- All PDF tools (merge, split, compress, rotate, watermark, protect, etc.)
- All Word/DOCX tools
- All Image tools (including OCR via Tesseract.js)
- All Excel/CSV tools
- All Text, Dev, Finance, Calculator, CSS tools

### Gated Features (server cost per use)

| Feature | Gate trigger | Why |
|---|---|---|
| Chat with PDF | 3 chats/day on free | Claude API cost ~$0.02–0.05/conversation |
| Document Translator | 3 docs/day on free | MyMemory daily limit at scale |
| File size > 10MB | Upload blocked on free | Server memory + processing time |
| Batch processing > 1 file | Blocked on free | Multiplied processing time |

### Upgrade Trigger Points
Users hit upgrade prompts at the exact moment of friction — never before:
1. 4th Chat with PDF attempt → upgrade modal
2. File over 10MB uploaded → upgrade modal
3. 4th translator document → upgrade modal
4. 2nd batch file selected → upgrade modal

---

## Tech Stack for Monetisation

| Component | Tool | Cost | Notes |
|---|---|---|---|
| Authentication | **Clerk** | Free ≤10K MAU | Pre-built UI, Google OAuth, Next.js native |
| Payments | **Stripe** | 2.9% + 30¢/txn | Checkout, webhooks, subscriptions |
| Usage tracking | **Clerk user metadata** | Included | Store daily counts, reset at midnight |
| Database | **Supabase** (later) | Free tier | When usage history feature is added |
| AI | **Claude Haiku 4.5** | ~$0.80/1M tokens | Best quality/cost for document analysis |
| Translation | **MyMemory API** | Free | 10K words/day free, no key needed |

---

## Growth Strategy

```
SEO Traffic (97 tool pages)
        ↓
Free Tool Use (no login required)
        ↓
Hit Usage Limit (Chat with PDF, large file)
        ↓
Upgrade Prompt (contextual, not annoying)
        ↓
Pro Subscription ($8/mo or $72/yr)
        ↓
Word of mouth + referrals
        ↑___________________________|
```

### SEO Advantage
97 tool pages = 97 indexable URLs, each targeting a high-intent keyword:
- "merge PDF online free" → /merge-pdf
- "OCR scanner online" → /ocr-scanner
- "chat with PDF AI" → /chat-with-pdf
- "document translator" → /document-translator
- "JSON formatter online" → /json-formatter

### No Watermark Policy
Never watermark output files. Let users share results naturally — this drives organic growth faster than any marketing.

---

## Implementation Roadmap

### Phase 1 — Auth + Billing (Week 1–2)
- [ ] Integrate Clerk auth (Google OAuth + email)
- [ ] Add sign-in/sign-up pages with dark theme
- [ ] Store daily usage counts in Clerk user metadata
- [ ] Build upgrade modal component (triggered at limit)
- [ ] Integrate Stripe checkout (Pro plan)
- [ ] Add Stripe webhook to set `isPro` flag on user
- [ ] Gate Chat with PDF API route behind usage check

### Phase 2 — Pro Features (Week 3–4)
- [ ] Increase file size limit to 50MB for Pro users
- [ ] Unlimited Chat with PDF for Pro
- [ ] Unlimited Document Translator for Pro
- [ ] Batch processing (up to 20 files) for Pro
- [ ] Document history page (last 30 docs)

### Phase 3 — Teams (Month 2)
- [ ] Team workspace with shared seats
- [ ] API access with key management (10K req/mo)
- [ ] Invite members flow
- [ ] Usage dashboard per team

### Phase 4 — Growth (Month 3+)
- [ ] Referral program (give 1 month Pro for each referral)
- [ ] Annual billing discount (25% off)
- [ ] More AI tools (document comparison, auto-fill forms)
- [ ] Browser extension (quick access to tools)

---

## Auth Implementation — Clerk

### Why Clerk over alternatives
| Option | Free tier | DX | Verdict |
|---|---|---|---|
| **Clerk** ✅ | 10K MAU free | Best — pre-built UI | Recommended |
| NextAuth.js | Unlimited (self-hosted) | Good — more setup | If you want full control |
| Supabase Auth | 50K MAU free | Good — needs DB | If you add a database |
| Firebase Auth | 10K MAU free | Decent | Google ecosystem only |

### Usage Tracking Logic (no database needed)
```ts
// On each AI API call — check + increment
const user = await currentUser();
const meta = user.publicMetadata as { chatCount?: number; chatDate?: string };
const today = new Date().toISOString().split('T')[0];

const count = meta.chatDate === today ? (meta.chatCount ?? 0) : 0;
if (!isPro && count >= 3) return 429; // limit hit

await clerkClient.users.updateUserMetadata(user.id, {
  publicMetadata: { chatCount: count + 1, chatDate: today }
});
```

---

## File: Environment Variables

```bash
# .env.local

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

---

## Competitive Positioning

| | DocSewa | ilovepdf | SmallPDF | Adobe Acrobat |
|---|---|---|---|---|
| Free tools | 97 (unlimited) | 25 (limited) | 20 (limited) | 5 (limited) |
| AI chat | ✅ | ❌ | ❌ | ✅ (paid) |
| Privacy (client-side) | ✅ | ❌ | ❌ | ❌ |
| Price (paid) | $8/mo | $7/mo | $9/mo | $23/mo |
| No watermark (free) | ✅ | ❌ | ❌ | ❌ |

**Key differentiator:** 97 tools + AI + fully client-side privacy at the lowest price point.

---

*Last updated: 2026-05-02*
