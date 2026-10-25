# CLAUDE.md

Wonder Wand — bilingual (Arabic RTL default, English) site for the kids' YouTube
channel, live at https://wonderwand.org. Phase 1 is the 200K-subscribers
celebration event booking flow (renamed from 100K). The owner often edits from a phone and prefers
short, simple Arabic replies.

## Deploy

Every push to `main` auto-deploys via Cloudflare Pages (project `wonderwand`).
There is no staging. Run `pnpm check` (astro + tsc, must be 0 errors) before
pushing. No test runner. Production secrets live in Cloudflare Pages, not in the
repo: RESEND_API_KEY, SANITY_WRITE_TOKEN, TURNSTILE_SECRET_KEY,
SANITY_WEBHOOK_SECRET, CHECKIN_PIN, YOUTUBE_API_KEY (live subscriber counter;
`/api/subscribers`, hidden when unset). A local `.env` is optional and gitignored.

## Stack

Astro 5 (static pages + `prerender = false` API routes) on `@astrojs/cloudflare`,
Tailwind CSS 4, Sanity CMS (project `b9izpb2i`, dataset `production`, Studio at
`/studio`), Resend email from info@wonderwand.org, Cloudflare Turnstile.

## Where things are

- `src/data/site.ts` — defaults for all content and helpers (`tx`, `waHref`,
  `childPrice`, `isEarlyBird`). `src/lib/content.ts` merges Sanity over these
  defaults, so most text/price/date changes belong in the CMS, not the code.
  If you change a default, also update `sanity/seed.ndjson` so they stay in step.
- `src/i18n/ui.ts` — UI strings; always add `ar` and `en` together.
- `src/components/BookingForm.astro` → `src/pages/api/book.ts` (creates booking
  `WW-XXXXXX` in Sanity, emails parent + team).
- `src/pages/api/webhooks/sanity.ts` — when a booking flips to `paid` in the
  Studio, emails the ticket to the parent and the paid list to the team inbox.
- `src/lib/email.ts` — Resend templates; `teamInbox()` defaults to info@wonderwand.org.
- `sanity/schemaTypes/` — CMS schema.
- `src/components/SubscriberCounter.astro` + `src/pages/api/subscribers.ts` —
  live YouTube count with progress to the hero `milestone` goal (e.g. "200K").

## Gotchas

- Pages are prerendered at build time on UTC servers. Always pass
  `timeZone: 'Asia/Amman'` to `Intl.DateTimeFormat`. Anything time-sensitive
  (early-bird price switch) is also re-evaluated client-side in BookingForm.
- Tailwind 4 here: responsive display variants lose to base `.hidden`; use the
  `!` suffix (`md:flex!`) or scoped CSS.
- `astro.config.mjs` injects a `MessageChannel` shim into the server
  `renderers` chunk; without it the Worker fails to deploy. Keep it.
- WhatsApp links are `wa.me`; `src/layouts/BaseLayout.astro` reroutes them to
  regular WhatsApp on Android browsers.
- Booking docs have dotted ids (`booking.WW-…`), so they're hidden from public
  GROQ queries; query with the write token.

## Event facts (current)

Sat 21 Nov 2026 (postponed from 7 Nov), 11:00–13:30, Dafa Academy (روضة أكاديمية دفا), Kharja St, Amman.
25 children, ages 3–8. Child 15 JOD early bird until 10 Nov 23:59 Amman, then
20 JOD; adult free. Payment by CliQ to alias "Wonderwand", receipt via WhatsApp
962797784352. Hosts: Rahaf & Hayla (رهف وهيلا).
