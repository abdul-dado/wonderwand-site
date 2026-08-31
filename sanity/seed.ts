/**
 * Emits NDJSON of the current defaults from src/data/site.ts so a fresh Sanity
 * dataset starts pre-filled instead of blank.
 *
 *   pnpm dlx tsx sanity/seed.ts > sanity/seed.ndjson
 *   pnpm dlx sanity dataset import sanity/seed.ndjson production
 */
import { site } from '../src/data/site';

const docs: Record<string, unknown>[] = [
  {
    _id: 'siteSettings',
    _type: 'siteSettings',
    brandName: site.brandName,
    tagline: site.tagline,
    social: site.social,
    analytics: site.analytics,
  },
  {
    _id: 'announcement',
    _type: 'announcement',
    enabled: site.announcement.enabled,
    text: site.announcement.text,
    href: site.announcement.href,
  },
  { _id: 'heroContent', _type: 'heroContent', ...site.hero },
  { _id: 'aboutContent', _type: 'aboutContent', ...site.about },
  {
    _id: 'eventInfo',
    _type: 'eventInfo',
    title: site.event.title,
    startsAt: site.event.startsAt,
    endsAt: site.event.endsAt,
    timeConfirmed: site.event.timeConfirmed,
    doorsOpen: site.event.doorsOpen,
    venueName: site.event.venueName,
    address: site.event.address,
    googleMapsUrl: site.event.googleMapsUrl,
    audience: site.event.audience,
  },
  { _id: 'pricing', _type: 'pricing', ...site.registration.pricing },
  {
    _id: 'registrationSettings',
    _type: 'registrationSettings',
    status: site.registration.status,
    cliqAlias: site.registration.cliqAlias,
    cliqName: site.registration.cliqName,
    paymentWindowHours: site.registration.paymentWindowHours,
    paymentInstructions: site.registration.paymentInstructions,
    capacityNote: site.registration.capacityNote,
    childAges: site.registration.childAges,
    maxChildrenPerOrder: 6,
    maxAdultsPerOrder: 4,
  },
  ...site.registration.discounts.map((d, i) => ({
    _id: `discount-${d.code || i}`,
    _type: 'discountCode',
    code: d.code,
    type: d.type,
    value: d.value,
    active: d.active,
    label: d.label,
    ...(d.expiresAt ? { expiresAt: d.expiresAt } : {}),
  })),
  ...site.activities.map((a, i) => ({
    _id: `activity-${i}`,
    _type: 'activity',
    emoji: a.emoji,
    title: a.title,
    description: a.description,
    order: i,
  })),
  ...site.prizes.map((p, i) => ({
    _id: `prize-${i}`,
    _type: 'prize',
    title: p.title,
    description: p.description,
    order: i,
  })),
  ...site.faq.map((f, i) => ({
    _id: `faq-${i}`,
    _type: 'faq',
    question: f.q,
    answer: f.a,
    order: i,
  })),
];

process.stdout.write(docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
