# Wonder Wand — website

Bilingual (Arabic RTL / English) site for the **Wonder Wand** kids channel.
Phase 1 is the **100K subscribers celebration** at Dafa Academy, Amman —
landing page, event details, and ticket booking (payment via CliQ, confirmed
manually by the team).

## Stack

| Concern    | Choice                                                    |
| ---------- | -------------------------------------------------------- |
| Framework  | [Astro](https://astro.build) 5 (static + hybrid routes)  |
| Styling    | Tailwind CSS 4                                            |
| Hosting    | Cloudflare Pages (`@astrojs/cloudflare`)                  |
| i18n       | `/ar/*` (default, RTL) and `/en/*`, hreflang + sitemap    |
| CMS        | Sanity — Studio at `/studio` (mounts only when configured)|
| Email      | Resend                                                    |
| Spam       | Cloudflare Turnstile                                      |
| Analytics  | GA4 + Meta Pixel (IDs from the CMS)                       |

Everything works **without** the CMS/email/Turnstile keys — it falls back to
the defaults in [`src/data/site.ts`](src/data/site.ts) and just logs instead of
sending. Add the keys to switch each piece on.

## Local development

```bash
pnpm install
cp .env.example .env      # optional in dev
pnpm dev                  # http://localhost:4321  ->  redirects to /ar/
pnpm check                # astro + tsc
pnpm build && pnpm preview
```

## Booking flow (CliQ)

1. Form submit → `POST /api/book` → booking held as `pending_payment`
   (`WW-XXXXXX`), stored in Sanity, parent emailed the CliQ payment steps,
   team emailed a notification.
2. Team verifies the transfer, opens the CMS, flips the booking to **`paid`**.
3. Sanity webhook → `POST /api/webhooks/sanity` → parent gets the ticket email,
   `paidAt` is stamped.
4. Event day: `/checkin` (staff PIN) looks up a reference and marks
   `checked_in`.

Pricing / discount codes / registration status / CliQ alias all read live from
the CMS in the API routes, and at build time on the pages.

## Content — Sanity

The Studio only mounts when `PUBLIC_SANITY_PROJECT_ID` is set.

1. Create a free project at [sanity.io/manage](https://www.sanity.io/manage).
2. Add to `.env` **and** the Cloudflare Pages env:
   ```
   PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
   PUBLIC_SANITY_DATASET=production
   SANITY_WRITE_TOKEN=<Editor token — Sanity: API → Tokens>
   ```
3. Seed the starting content:
   ```bash
   pnpm dlx sanity login
   pnpm seed:import          # imports sanity/seed.ndjson
   ```
4. Redeploy. The Studio is now at `https://wonderwand.org/studio`.
   Run it locally with `pnpm studio`.

Schema lives in [`sanity/schemaTypes/`](sanity/schemaTypes). Singletons
(Site settings, Event details, Pricing, Registration, …) are edit-only;
Bookings, Discount codes, Activities, Prizes, FAQ, Videos are lists.

### Webhook (ticket email on "paid")

Sanity → **API → Webhooks → Create**:

- URL: `https://wonderwand.org/api/webhooks/sanity?secret=<SANITY_WEBHOOK_SECRET>`
- Dataset: production · Trigger on: **update** · Filter: `_type == "booking"`
- Projection: `{..., "prev": before()}`
- HTTP method: POST

Set the same `SANITY_WEBHOOK_SECRET` in the Cloudflare env.

## Email — Resend

1. [resend.com](https://resend.com) → add & verify the domain `wonderwand.org`
   (adds SPF/DKIM DNS records — Cloudflare DNS).
2. Cloudflare env:
   ```
   RESEND_API_KEY=re_xxx
   BOOKING_FROM_EMAIL=events@wonderwand.org
   BOOKING_NOTIFY_EMAIL=events@wonderwand.org
   ```
   To *receive* mail at that address, add Cloudflare Email Routing (free
   forwarding) or Google Workspace.

## Turnstile — spam protection

Cloudflare dashboard → **Turnstile → Add widget** (domain `wonderwand.org`):

```
PUBLIC_TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
```

The widget renders on the booking form only when the site key is present.

## Deployment (Cloudflare Pages)

- Build command: `pnpm build` · Output: `dist`
- Env vars: `SITE_URL=https://wonderwand.org`, `NODE_VERSION=22`, plus any of
  the above. Every `git push` to `main` auto-deploys.

## Assets

`src/assets/` — `characters.jpg` (Rahaf & Hayla), `wand.png` (original) and
`wand-cut.png` (background removed, used on the pages). Replace with
higher-resolution originals and rebuild.
