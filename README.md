# Wonder Wand — website

Bilingual (Arabic RTL / English) site for the **Wonder Wand** kids channel.
Phase 1 is the **100K subscribers celebration** landing page with event details
and provisional ticket booking (payment via CliQ, confirmed manually).

## Stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | [Astro](https://astro.build) 5 (static + hybrid)   |
| Styling        | Tailwind CSS 4                                     |
| Hosting        | Cloudflare Pages (`@astrojs/cloudflare` adapter)   |
| i18n           | Astro i18n routing — `/ar/*` (default) and `/en/*` |
| CMS            | Sanity (phase 2 — swaps in behind `src/data/site.ts`) |
| Booking email  | Resend (phase 3)                                   |
| Spam           | Cloudflare Turnstile                               |
| Analytics      | GA4 + Meta Pixel (IDs in `src/data/site.ts`)       |

## Local development

```bash
pnpm install
cp .env.example .env      # fill in what you have; all keys are optional in dev
pnpm dev                  # http://localhost:4321  ->  redirects to /ar/
```

## Build

```bash
pnpm build                # -> dist/ (static assets + _worker.js for the /api route)
pnpm preview              # serve the production build locally
```

## Content

All editable copy currently lives in [`src/data/site.ts`](src/data/site.ts) —
event details, ticket types, CliQ instructions, activities, prizes, FAQ, social
links, analytics IDs. Phase 2 replaces this file with a Sanity fetch of the same
shape, so components do not change.

## Booking flow (CliQ)

1. Visitor submits the form → `POST /api/book` → booking held as `pending_payment`
   with a reference like `WW-ABC123`.
2. Confirmation email tells them to pay via CliQ within
   `registration.paymentWindowHours` and send the receipt on WhatsApp.
3. Team verifies the transfer and flips the booking to `paid` (in Sanity, phase 2)
   → the final ticket email goes out.
4. Door check-in scans the reference (phase 3).

> Current state: `/api/book` validates + logs the booking. Persistence (Sanity)
> and emails (Resend) are the next tasks — see `TODO` markers in
> [`src/pages/api/book.ts`](src/pages/api/book.ts).

## Deployment (Cloudflare Pages)

- Build command: `pnpm build`
- Build output directory: `dist`
- Environment variables: copy from `.env.example` (set `SITE_URL` to the prod origin)
- Point `wonderwand.org` DNS at Cloudflare and attach the Pages project.
