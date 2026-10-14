import type { Lang } from '@/i18n';

/* -------------------------------------------------------------------------
   Wonder Wand — site content
   Single source of truth for all editable copy for the 100K launch page.
   In phase 2 this module is replaced by a Sanity fetch with the SAME shape,
   so components never need to change.
------------------------------------------------------------------------- */

type L = Record<Lang, string>;

export interface TicketType {
  id: 'child' | 'adult';
  name: L;
  note: L;
  soldOut: boolean;
  /** Max seats of this type per single booking. */
  perOrderLimit: number;
}

export interface Pricing {
  currency: string;
  /** Child ticket price before the early-bird cutoff. */
  childEarlyBird: number;
  /** Child ticket price on/after the cutoff. */
  childRegular: number;
  /** Accompanying-adult price (0 = free). */
  adult: number;
  /** ISO 8601 with timezone — early-bird pricing applies up to this instant. */
  earlyBirdUntil: string;
}

export interface DiscountCode {
  /** Matched case-insensitively. */
  code: string;
  type: 'percent' | 'amount';
  /** Percent 1–100, or a fixed amount in the pricing currency. */
  value: number;
  active: boolean;
  label: L;
  /** Optional ISO 8601 expiry. */
  expiresAt?: string;
}

export interface Activity {
  emoji: string;
  title: L;
  description: L;
}

export interface Prize {
  title: L;
  description: L;
}

export interface Faq {
  q: L;
  a: L;
}

export interface SiteContent {
  brandName: string;
  tagline: L;
  announcement: {
    enabled: boolean;
    text: L;
    href: string;
  };
  hero: {
    kicker: L;
    title: L;
    subtitle: L;
    milestone: string; // e.g. "100K"
  };
  about: {
    title: L;
    body: L;
    hosts: L;
  };
  event: {
    title: L;
    /** ISO 8601 with timezone. Countdown target. */
    startsAt: string;
    /** ISO 8601 with timezone, or '' if not set. */
    endsAt: string;
    timeConfirmed: boolean;
    doorsOpen: L;
    venueName: L;
    address: L;
    googleMapsUrl: string;
    audience: L;
  };
  activities: Activity[];
  prizes: Prize[];
  prizesNote: L;
  registration: {
    /** 'open' | 'closed' | 'sold_out' */
    status: 'open' | 'closed' | 'sold_out';
    ticketTypes: TicketType[];
    pricing: Pricing;
    /** Discount codes — add/enable your own; matched case-insensitively. */
    discounts: DiscountCode[];
    /** Selectable ages for each child on the booking form. */
    childAges: number[];
    cliqAlias: string;
    cliqName: L;
    paymentWindowHours: number;
    paymentInstructions: L;
    capacityNote: L;
  };
  faq: Faq[];
  social: {
    youtube: string;
    instagram: string;
    tiktok: string;
    facebook: string;
    whatsapp: string;
    email: string;
  };
  analytics: {
    ga4Id: string;
    metaPixelId: string;
  };
  seo: {
    title: L;
    description: L;
    ogImage: string; // path in /public or absolute URL
  };
}

export const site: SiteContent = {
  brandName: 'Wonder Wand',
  tagline: {
    ar: 'نتعلّم، نلعب، ونكبر معًا',
    en: 'Learn, Play & Grow Together',
  },

  announcement: {
    enabled: true,
    text: {
      ar: '🎉 Wonder Wand وصلت 100 ألف مشترك! احجز مكانك في الاحتفال',
      en: '🎉 Wonder Wand hit 100K subscribers! Book your seat at the celebration',
    },
    href: '#book',
  },

  hero: {
    kicker: {
      ar: 'احتفال خاص',
      en: 'A special celebration',
    },
    title: {
      ar: 'نحتفل بوصول Wonder Wand إلى 100 ألف مشترك',
      en: 'Celebrating Wonder Wand reaching 100,000 subscribers',
    },
    subtitle: {
      ar: 'يوم مليء بالألعاب والمسابقات والجوائز، ولقاء مباشر مع Wonder Wand — للأطفال وأهاليهم.',
      en: 'A day full of games, contests and prizes, plus a live meet-up with Wonder Wand — for children and their families.',
    },
    milestone: '100K',
  },

  about: {
    title: {
      ar: 'عن Wonder Wand',
      en: 'About Wonder Wand',
    },
    body: {
      ar: 'Wonder Wand هي قناة تعليمية وترفيهية للأطفال، تقدم محتوى ممتعًا وتفاعليًا باللغتين العربية والإنجليزية. نساعد الأطفال على تعلّم الحروف والكلمات والمفردات والأرقام والألوان والمفاهيم اليومية بطريقة بسيطة ومحببة، من خلال القصص والرحلات والألعاب والمواقف التعليمية. كما نحرص على غرس القيم والمبادئ الإسلامية في محتوانا بأسلوب قريب من قلوب الأطفال.',
      en: 'Wonder Wand is an educational and entertaining channel for children, offering fun and interactive content in both Arabic and English. We help children learn letters, words, vocabulary, numbers, colors, and everyday concepts through stories, adventures, games, and engaging learning experiences. We also take care to instil Islamic values and principles in our content, in a way children love.',
    },
    hosts: {
      ar: 'مع رهف وهيلا',
      en: 'With Rahaf & Hayla',
    },
  },

  event: {
    title: {
      ar: 'تفاصيل الحدث',
      en: 'Event details',
    },
    startsAt: '2026-11-07T11:00:00+03:00',
    endsAt: '2026-11-07T13:30:00+03:00',
    timeConfirmed: true,
    doorsOpen: { ar: 'يُعلن قريبًا', en: 'Announced soon' },
    venueName: { ar: 'روضة أكاديمية دفا', en: 'Dafa Academy' },
    address: {
      ar: 'شارع الخارجة، أكاديمية دفا، عمّان، الأردن',
      en: 'Kharja Street, Dafa Academy, Amman, Jordan',
    },
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=%D8%B1%D9%88%D8%B6%D8%A9%20%D8%A3%D9%83%D8%A7%D8%AF%D9%8A%D9%85%D9%8A%D8%A9%20%D8%AF%D9%81%D8%A7%20%D8%B9%D9%85%D8%A7%D9%86',
    audience: {
      ar: 'للأطفال من 3 إلى 8 سنوات وأهاليهم',
      en: 'For children aged 3–8 and their families',
    },
  },

  activities: [
    {
      emoji: '🎈',
      title: { ar: 'ألعاب للأطفال', en: 'Kids games' },
      description: {
        ar: 'محطات ألعاب تفاعلية آمنة ومناسبة لكل الأعمار.',
        en: 'Safe, interactive game stations suitable for every age.',
      },
    },
    {
      emoji: '🏆',
      title: { ar: 'مسابقات وجوائز', en: 'Contests & prizes' },
      description: {
        ar: 'مسابقات تعليمية ترفيهية مع جوائز قيّمة للفائزين.',
        en: 'Fun educational contests with great prizes for the winners.',
      },
    },
    {
      emoji: '✨',
      title: { ar: 'لقاء مع Wonder Wand', en: 'Meet Wonder Wand' },
      description: {
        ar: 'تجربة ولقاء مباشر مع شخصيات القناة وصور تذكارية.',
        en: 'A live meet-and-greet with the channel characters and photos.',
      },
    },
    {
      emoji: '🎁',
      title: { ar: 'مفاجأة خاصة', en: 'A special surprise' },
      description: {
        ar: 'ومفاجأة خاصة نكشف عنها لأول مرة خلال الحدث.',
        en: 'And a special surprise revealed for the first time during the event.',
      },
    },
  ],

  prizes: [
    {
      title: { ar: 'جوائز للفائزين بالمسابقات', en: 'Prizes for contest winners' },
      description: {
        ar: 'تُعلن قائمة الجوائز قريبًا.',
        en: 'The prize list will be announced soon.',
      },
    },
  ],
  prizesNote: {
    ar: 'تُعلن تفاصيل الجوائز وآلية السحب قبل الحدث.',
    en: 'Prize details and the draw mechanism will be announced before the event.',
  },

  registration: {
    status: 'open',
    ticketTypes: [
      {
        id: 'child',
        name: { ar: 'تذكرة طفل', en: 'Child ticket' },
        note: {
          ar: 'يشمل دخول الطفل وكل الفعاليات',
          en: 'Includes the child’s entry and all activities',
        },
        soldOut: false,
        perOrderLimit: 6,
      },
      {
        id: 'adult',
        name: { ar: 'مرافق (وليّ أمر)', en: 'Accompanying adult' },
        note: {
          ar: 'كل طفل يحتاج مرافقًا واحدًا على الأقل',
          en: 'Each child needs at least one accompanying adult',
        },
        soldOut: false,
        perOrderLimit: 4,
      },
    ],
    pricing: {
      currency: 'JOD',
      childEarlyBird: 15,
      childRegular: 20,
      adult: 0,
      earlyBirdUntil: '2026-10-25T23:59:59+03:00',
    },
    discounts: [
      // Example — set active: true (or add your own codes):
      {
        code: 'WONDER10',
        type: 'percent',
        value: 10,
        active: false,
        label: { ar: 'خصم 10٪', en: '10% off' },
      },
      {
        code: 'FAMILY5',
        type: 'amount',
        value: 5,
        active: false,
        label: { ar: 'خصم 5 دنانير', en: '5 JOD off' },
      },
    ],
    childAges: [3, 4, 5, 6, 7, 8],
    cliqAlias: 'Wonderwand',
    cliqName: { ar: 'Wonderwand', en: 'Wonderwand' },
    paymentWindowHours: 24,
    paymentInstructions: {
      ar: 'بعد ما تبعت الحجز بيطلعلك رقم حجز خاص فيك. حوّل المبلغ عبر CliQ إلى الاسم المستعار Wonderwand خلال 24 ساعة، ثم اضغط زر واتساب وابعتلنا صورة الإيصال — رقم حجزك بيكون جاهز بالرسالة.',
      en: 'After you submit, you get your own booking reference. Transfer the amount via CliQ to the alias Wonderwand within 24 hours, then tap the WhatsApp button and send us a photo of the receipt — your reference is already in the message.',
    },
    capacityNote: {
      ar: 'المقاعد محدودة جدًا — 25 طفلًا فقط. الحجز حسب الأسبقية.',
      en: 'Very limited — only 25 children. First come, first served.',
    },
  },

  faq: [
    {
      q: { ar: 'كيف أدفع؟', en: 'How do I pay?' },
      a: {
        ar: 'الدفع عبر CliQ بعد الحجز المبدئي. تصلك التفاصيل بالبريد الإلكتروني فور إرسال النموذج.',
        en: 'Payment is via CliQ after the provisional booking. You receive the details by email as soon as you submit the form.',
      },
    },
    {
      q: { ar: 'هل يمكنني إحضار أكثر من طفل؟', en: 'Can I bring more than one child?' },
      a: {
        ar: 'نعم، اختر عدد الأطفال والكبار في نموذج الحجز.',
        en: 'Yes — choose the number of children and adults in the booking form.',
      },
    },
    {
      q: { ar: 'متى يبدأ الحدث؟', en: 'When does the event start?' },
      a: {
        ar: 'السبت 7 نوفمبر 2026 من 11:00 صباحًا حتى 1:30 ظهرًا في روضة أكاديمية دفا، عمّان. التفاصيل تصل لكل من حجز.',
        en: 'Saturday 7 November 2026, 11:00 AM to 1:30 PM at Dafa Academy, Amman. Details are sent to everyone who booked.',
      },
    },
  ],

  social: {
    youtube: 'https://www.youtube.com/@The-English-Nest-10',
    instagram: 'https://www.instagram.com/_wonderwand_/',
    tiktok: 'https://www.tiktok.com/@wonder_wand1',
    facebook: '',
    whatsapp: '962797784352',
    email: 'info@wonderwand.org',
  },

  analytics: {
    ga4Id: '',
    metaPixelId: '',
  },

  seo: {
    title: {
      ar: 'Wonder Wand — احتفال 100 ألف مشترك',
      en: 'Wonder Wand — 100K Subscribers Celebration',
    },
    description: {
      ar: 'احجز مكانك في احتفال Wonder Wand بوصول القناة إلى 100 ألف مشترك: ألعاب، مسابقات، جوائز ولقاء مباشر مع Wonder Wand في عمّان يوم 7 نوفمبر 2026.',
      en: 'Book your seat at the Wonder Wand 100K subscribers celebration: games, contests, prizes and a live meet-up with Wonder Wand in Amman on 7 November 2026.',
    },
    ogImage: '/og-default.png',
  },
};

/**
 * wa.me link for a WhatsApp number (digits, with country code) or an existing
 * wa.me/https link. `text` is pre-filled in the chat. Empty input → ''.
 */
export function waHref(whatsapp: string, text?: string): string {
  if (!whatsapp) return '';
  const base = whatsapp.startsWith('http')
    ? whatsapp
    : `https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`;
  if (!text) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}text=${encodeURIComponent(text)}`;
}

/** Convenience: collapse a localized field to a plain string. */
export function tx(value: L, lang: Lang): string {
  return value[lang] ?? value.ar;
}

/** True while early-bird pricing is still in effect. */
export function isEarlyBird(
  pricing: Pricing = site.registration.pricing,
  now: Date = new Date(),
): boolean {
  return now.getTime() <= new Date(pricing.earlyBirdUntil).getTime();
}

/** Child ticket price for the given moment (early-bird vs regular). */
export function childPrice(
  pricing: Pricing = site.registration.pricing,
  now: Date = new Date(),
): number {
  return isEarlyBird(pricing, now) ? pricing.childEarlyBird : pricing.childRegular;
}

/** Look up an active, non-expired discount code (case-insensitive). */
export function findDiscount(
  discounts: DiscountCode[],
  code: string,
  now: Date = new Date(),
): DiscountCode | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  const d = discounts.find((x) => x.active && x.code.toUpperCase() === c);
  if (!d) return null;
  if (d.expiresAt && now.getTime() > new Date(d.expiresAt).getTime()) return null;
  return d;
}

/** Money taken off `subtotal` by a discount, clamped to [0, subtotal]. */
export function discountAmount(subtotal: number, d: DiscountCode): number {
  const raw = d.type === 'percent' ? (subtotal * d.value) / 100 : d.value;
  return Math.min(subtotal, Math.max(0, Math.round(raw * 100) / 100));
}
