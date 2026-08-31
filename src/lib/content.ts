import { site, type SiteContent } from '@/data/site';
import { sanityFetch, type SanityEnv } from './sanity';

/**
 * Loads the site content. When Sanity is configured, its documents are merged
 * over the defaults in `src/data/site.ts` (any field left empty in Sanity keeps
 * the default). When it isn't, the defaults are returned untouched — so the
 * site works identically with or without a CMS.
 */

const QUERY = `{
  "settings": *[_type == "siteSettings"][0],
  "announcement": *[_type == "announcement"][0],
  "hero": *[_type == "heroContent"][0],
  "about": *[_type == "aboutContent"][0],
  "event": *[_type == "eventInfo"][0],
  "pricing": *[_type == "pricing"][0],
  "registration": *[_type == "registrationSettings"][0],
  "discounts": *[_type == "discountCode"] | order(code asc),
  "activities": *[_type == "activity"] | order(order asc),
  "prizes": *[_type == "prize"] | order(order asc),
  "faq": *[_type == "faq"] | order(order asc)
}`;

type L = { ar?: string; en?: string } | null | undefined;
const loc = (v: L, fb: { ar: string; en: string }) => ({
  ar: v?.ar || fb.ar,
  en: v?.en || fb.en,
});
const str = <T,>(v: T | null | undefined, fb: T) => (v ?? fb) as T;

export async function loadContent(
  env: SanityEnv = import.meta.env as unknown as SanityEnv,
): Promise<SiteContent> {
  const data = await sanityFetch<any>(env, QUERY).catch(() => null);
  if (!data) return site;

  const d = site; // defaults
  const s = data.settings ?? {};
  const soc = s.social ?? {};
  const an = s.analytics ?? {};
  const a = data.announcement ?? {};
  const h = data.hero ?? {};
  const ab = data.about ?? {};
  const e = data.event ?? {};
  const p = data.pricing ?? {};
  const r = data.registration ?? {};

  return {
    brandName: str(s.brandName, d.brandName),
    tagline: loc(s.tagline, d.tagline),

    announcement: {
      enabled: typeof a.enabled === 'boolean' ? a.enabled : d.announcement.enabled,
      text: loc(a.text, d.announcement.text),
      href: str(a.href, d.announcement.href),
    },

    hero: {
      kicker: loc(h.kicker, d.hero.kicker),
      title: loc(h.title, d.hero.title),
      subtitle: loc(h.subtitle, d.hero.subtitle),
      milestone: str(h.milestone, d.hero.milestone),
    },

    about: {
      title: loc(ab.title, d.about.title),
      body: loc(ab.body, d.about.body),
      hosts: loc(ab.hosts, d.about.hosts),
    },

    event: {
      title: loc(e.title, d.event.title),
      startsAt: str(e.startsAt, d.event.startsAt),
      endsAt: str(e.endsAt, d.event.endsAt),
      timeConfirmed:
        typeof e.timeConfirmed === 'boolean' ? e.timeConfirmed : d.event.timeConfirmed,
      doorsOpen: loc(e.doorsOpen, d.event.doorsOpen),
      venueName: loc(e.venueName, d.event.venueName),
      address: loc(e.address, d.event.address),
      googleMapsUrl: str(e.googleMapsUrl, d.event.googleMapsUrl),
      audience: loc(e.audience, d.event.audience),
    },

    activities: Array.isArray(data.activities) && data.activities.length
      ? data.activities.map((x: any) => ({
          emoji: x.emoji ?? '✨',
          title: loc(x.title, { ar: '', en: '' }),
          description: loc(x.description, { ar: '', en: '' }),
        }))
      : d.activities,

    prizes: Array.isArray(data.prizes) && data.prizes.length
      ? data.prizes.map((x: any) => ({
          title: loc(x.title, { ar: '', en: '' }),
          description: loc(x.description, { ar: '', en: '' }),
        }))
      : d.prizes,
    prizesNote: d.prizesNote,

    registration: {
      status: (['open', 'closed', 'sold_out'].includes(r.status)
        ? r.status
        : d.registration.status) as SiteContent['registration']['status'],
      ticketTypes: d.registration.ticketTypes.map((tt) => ({
        ...tt,
        perOrderLimit:
          tt.id === 'child'
            ? str(r.maxChildrenPerOrder, tt.perOrderLimit)
            : str(r.maxAdultsPerOrder, tt.perOrderLimit),
      })),
      pricing: {
        currency: str(p.currency, d.registration.pricing.currency),
        childEarlyBird: str(p.childEarlyBird, d.registration.pricing.childEarlyBird),
        childRegular: str(p.childRegular, d.registration.pricing.childRegular),
        adult: typeof p.adult === 'number' ? p.adult : d.registration.pricing.adult,
        earlyBirdUntil: str(p.earlyBirdUntil, d.registration.pricing.earlyBirdUntil),
      },
      discounts: Array.isArray(data.discounts)
        ? data.discounts.map((x: any) => ({
            code: String(x.code ?? ''),
            type: x.type === 'amount' ? 'amount' : 'percent',
            value: Number(x.value ?? 0),
            active: !!x.active,
            label: loc(x.label, { ar: '', en: '' }),
            expiresAt: x.expiresAt || undefined,
          }))
        : d.registration.discounts,
      childAges:
        Array.isArray(r.childAges) && r.childAges.length
          ? r.childAges.map(Number)
          : d.registration.childAges,
      cliqAlias: str(r.cliqAlias, d.registration.cliqAlias),
      cliqName: loc(r.cliqName, d.registration.cliqName),
      paymentWindowHours: str(r.paymentWindowHours, d.registration.paymentWindowHours),
      paymentInstructions: loc(r.paymentInstructions, d.registration.paymentInstructions),
      capacityNote: loc(r.capacityNote, d.registration.capacityNote),
    },

    faq: Array.isArray(data.faq) && data.faq.length
      ? data.faq.map((x: any) => ({
          q: loc(x.question, { ar: '', en: '' }),
          a: loc(x.answer, { ar: '', en: '' }),
        }))
      : d.faq,

    social: {
      youtube: str(soc.youtube, d.social.youtube),
      instagram: str(soc.instagram, d.social.instagram),
      tiktok: str(soc.tiktok, d.social.tiktok),
      facebook: str(soc.facebook, d.social.facebook),
      whatsapp: str(soc.whatsapp, d.social.whatsapp),
      email: str(soc.email, d.social.email),
    },

    analytics: {
      ga4Id: str(an.ga4Id, d.analytics.ga4Id),
      metaPixelId: str(an.metaPixelId, d.analytics.metaPixelId),
    },

    seo: d.seo,
  };
}
