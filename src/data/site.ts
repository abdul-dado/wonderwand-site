import type { Lang } from '@/i18n';

/* -------------------------------------------------------------------------
   Wonder Wand — site content
   Single source of truth for all editable copy for the 100K launch page.
   In phase 2 this module is replaced by a Sanity fetch with the SAME shape,
   so components never need to change.
------------------------------------------------------------------------- */

type L = Record<Lang, string>;

export interface TicketType {
  id: string;
  name: L;
  /** Price in JOD. 0 = free. */
  price: number;
  note: L;
  soldOut: boolean;
  /** Max seats of this type per single booking. */
  perOrderLimit: number;
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
      ar: 'Wonder Wand هي قناة تعليمية وترفيهية للأطفال، تقدم محتوى ممتعًا وتفاعليًا باللغتين العربية والإنجليزية. نساعد الأطفال على تعلّم الحروف والكلمات والمفردات والأرقام والألوان والمفاهيم اليومية بطريقة بسيطة ومحببة، من خلال القصص والرحلات والألعاب والمواقف التعليمية.',
      en: 'Wonder Wand is an educational and entertaining channel for children, offering fun and interactive content in both Arabic and English. We help children learn letters, words, vocabulary, numbers, colors, and everyday concepts through stories, adventures, games, and engaging learning experiences.',
    },
    hosts: {
      ar: 'مع رهف وهلا',
      en: 'With Rahaf & Hela',
    },
  },

  event: {
    title: {
      ar: 'تفاصيل الحدث',
      en: 'Event details',
    },
    startsAt: '2026-10-03T16:00:00+03:00',
    timeConfirmed: false,
    doorsOpen: { ar: 'يُعلن قريبًا', en: 'Announced soon' },
    venueName: { ar: 'يُعلن قريبًا', en: 'Announced soon' },
    address: { ar: 'عمّان، الأردن', en: 'Amman, Jordan' },
    googleMapsUrl: '',
    audience: {
      ar: 'للأطفال من 3 إلى 8 سنوات وأهاليهم',
      en: 'For children aged 3–8 and their families',
    },
  },

  activities: [
    {
      emoji: '🎮',
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
        ar: 'مسابقات على مدار اليوم مع جوائز قيّمة للفائزين.',
        en: 'Contests throughout the day with great prizes for winners.',
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
      title: { ar: 'الجوائز الكبرى', en: 'Grand prizes' },
      description: {
        ar: 'قائمة الجوائز النهائية تُعلن قريبًا.',
        en: 'The full prize list will be announced soon.',
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
        price: 0,
        note: {
          ar: 'السعر يُعلن قريبًا',
          en: 'Price announced soon',
        },
        soldOut: false,
        perOrderLimit: 6,
      },
      {
        id: 'adult',
        name: { ar: 'تذكرة مرافق', en: 'Accompanying adult' },
        price: 0,
        note: {
          ar: 'السعر يُعلن قريبًا',
          en: 'Price announced soon',
        },
        soldOut: false,
        perOrderLimit: 4,
      },
    ],
    cliqAlias: '',
    cliqName: { ar: 'يُعلن عند تأكيد الحجز', en: 'Shared on booking' },
    paymentWindowHours: 24,
    paymentInstructions: {
      ar: 'بعد إرسال الحجز ستصلك رسالة بريد إلكتروني فيها المبلغ واسم CliQ المستعار. حوّل المبلغ خلال 24 ساعة واحتفظ بالإيصال، ثم أرسله عبر واتساب مع رقم حجزك.',
      en: 'After you submit, you will receive an email with the amount and the CliQ alias. Transfer within 24 hours, keep the receipt, and send it to us on WhatsApp along with your booking reference.',
    },
    capacityNote: {
      ar: 'عدد المقاعد محدود، والحجز حسب الأسبقية.',
      en: 'Seats are limited and allocated on a first-come, first-served basis.',
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
        ar: 'يوم 3 أكتوبر 2026. التوقيت الدقيق والمكان يُعلنان قريبًا وتصل التفاصيل لكل من حجز.',
        en: 'On 3 October 2026. The exact time and venue will be announced soon and sent to everyone who booked.',
      },
    },
  ],

  social: {
    youtube: 'https://www.youtube.com/@The-English-Nest-10',
    instagram: 'https://www.instagram.com/_wonderwand_/',
    tiktok: 'https://www.tiktok.com/@wonder_wand1',
    facebook: '',
    whatsapp: '',
    email: 'events@wonderwand.org',
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
      ar: 'احجز مكانك في احتفال Wonder Wand بوصول القناة إلى 100 ألف مشترك: ألعاب، مسابقات، جوائز ولقاء مباشر مع Wonder Wand في عمّان يوم 3 أكتوبر 2026.',
      en: 'Book your seat at the Wonder Wand 100K subscribers celebration: games, contests, prizes and a live meet-up with Wonder Wand in Amman on 3 October 2026.',
    },
    ogImage: '/og-default.png',
  },
};

/** Convenience: collapse a localized field to a plain string. */
export function tx(value: L, lang: Lang): string {
  return value[lang] ?? value.ar;
}
