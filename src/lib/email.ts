import { site, tx, waHref, type SiteContent } from '@/data/site';
import type { Lang } from '@/i18n';

export interface EmailEnv {
  RESEND_API_KEY?: string;
  BOOKING_FROM_EMAIL?: string;
  BOOKING_NOTIFY_EMAIL?: string;
}

export interface BookingRecord {
  ref: string;
  parentName: string;
  phone: string;
  email: string;
  city: string;
  children: { name: string; age: number }[];
  childCount: number;
  adultCount: number;
  unitPrice: number;
  subtotal: number;
  discountCode: string | null;
  discountValue: number;
  amount: number;
  currency: string;
  earlyBird: boolean;
  lang: Lang;
}

const FROM_FALLBACK = 'Wonder Wand <info@wonderwand.org>';

/** Team inbox: env override, else the public contact email from the CMS. */
export function teamInbox(env: EmailEnv, content?: SiteContent): string {
  return (
    env.BOOKING_NOTIFY_EMAIL ||
    env.BOOKING_FROM_EMAIL ||
    content?.social.email ||
    'info@wonderwand.org'
  );
}

/** Low-level send. No-ops (logs) when RESEND_API_KEY is absent. */
export async function sendEmail(
  env: EmailEnv,
  msg: { to: string; subject: string; html: string; replyTo?: string },
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!env.RESEND_API_KEY) {
    console.log('[email:skipped]', msg.to, '—', msg.subject);
    return { ok: true, skipped: true };
  }
  const from = env.BOOKING_FROM_EMAIL
    ? `Wonder Wand <${env.BOOKING_FROM_EMAIL}>`
    : FROM_FALLBACK;
  // Replies from parents land in the team inbox (a Gmail address is fine here;
  // only the From address has to be on the verified sending domain).
  const replyTo = msg.replyTo ?? teamInbox(env);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error('[email:error]', res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email:throw]', err);
    return { ok: false };
  }
}

/* ---------------------------------------------------------------- templates */

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function shell(lang: Lang, title: string, inner: string): string {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;background:#f4eeff;font-family:${
    lang === 'ar' ? 'Tahoma,Arial' : 'Arial,Helvetica'
  },sans-serif;color:#241a4d">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#48258f;color:#fff;border-radius:16px 16px 0 0;padding:20px 24px;font-size:18px;font-weight:800">Wonder Wand ✨</div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:24px">
      <h1 style="margin:0 0 12px;font-size:20px">${esc(title)}</h1>
      ${inner}
    </div>
    <p style="color:#8a7fb5;font-size:12px;text-align:center;margin:16px 0 0">wonderwand.org</p>
  </div>
</body></html>`;
}

function orderTable(b: BookingRecord, lang: Lang): string {
  const L = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const kids = b.children
    .map((c) => `${esc(c.name)} (${c.age})`)
    .join('، ');
  const rows: [string, string][] = [
    [L('رقم الحجز', 'Booking reference'), `<strong>${b.ref}</strong>`],
    [L('وليّ الأمر', 'Parent'), esc(b.parentName)],
    [L('الهاتف', 'Phone'), esc(b.phone)],
    [L('الأطفال', 'Children'), `${b.childCount} — ${esc(kids)}`],
    [L('المرافقون', 'Adults'), String(b.adultCount)],
  ];
  if (b.discountCode) {
    rows.push([
      L('كود الخصم', 'Discount code'),
      `${esc(b.discountCode)} (−${b.discountValue} ${b.currency})`,
    ]);
  }
  rows.push([
    L('المبلغ المطلوب', 'Amount due'),
    `<strong>${b.amount} ${b.currency}</strong>`,
  ]);
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#6b5fa8">${esc(k)}</td><td style="padding:6px 0;text-align:${
          lang === 'ar' ? 'left' : 'right'
        }">${v}</td></tr>`,
    )
    .join('')}</table>`;
}

function eventLine(content: SiteContent, lang: Lang): string {
  const e = content.event;
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Amman',
    }).format(new Date(iso));
  const date = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Amman',
  }).format(new Date(e.startsAt));
  const time = e.timeConfirmed
    ? `${fmt(e.startsAt)}${e.endsAt ? ` – ${fmt(e.endsAt)}` : ''}`
    : '';
  return `${tx(e.venueName, lang)} — ${tx(e.address, lang)} · ${date}${time ? `, ${time}` : ''}`;
}

export function bookingReceivedEmail(b: BookingRecord, content: SiteContent = site) {
  const lang = b.lang;
  const reg = content.registration;
  const alias = reg.cliqAlias || (lang === 'ar' ? 'سيُرسل لك قريباً' : 'sent to you shortly');
  const hours = reg.paymentWindowHours;
  const waMsg =
    lang === 'ar'
      ? `مرحباً، هذا إيصال الدفع لحجز رقم ${b.ref} باسم ${b.parentName}.`
      : `Hi, here is the payment receipt for booking ${b.ref} (${b.parentName}).`;
  const waUrl = waHref(content.social.whatsapp, waMsg);
  const wa = waUrl
    ? `<a href="${waUrl}" style="display:inline-block;margin-top:8px;padding:10px 18px;border-radius:999px;background:#25d366;color:#fff;font-weight:800;text-decoration:none">${
        lang === 'ar' ? 'ابعت الإيصال عبر واتساب' : 'Send the receipt on WhatsApp'
      }</a>`
    : '';

  const inner =
    lang === 'ar'
      ? `<p style="margin:0 0 16px;line-height:1.6">حجزك محفوظ <strong>مبدئياً</strong>. لتثبيته، أكمل الدفع خلال ${hours} ساعة.</p>
         ${orderTable(b, lang)}
         <div style="background:#f4eeff;border-radius:12px;padding:16px;margin:16px 0;line-height:1.7">
           <strong>خطوات الدفع (CliQ):</strong><br>
           1) حوّل <strong>${b.amount} ${b.currency}</strong> إلى الاسم المستعار: <strong>${esc(alias)}</strong><br>
           2) احتفظ بصورة الإيصال<br>
           3) أرسل صورة الإيصال عبر واتساب مع رقم حجزك <strong>${b.ref}</strong><br>${wa}
         </div>
         <p style="margin:0;line-height:1.6"><strong>الحدث:</strong> ${esc(eventLine(content, lang))}</p>`
      : `<p style="margin:0 0 16px;line-height:1.6">Your booking is <strong>provisionally held</strong>. Complete payment within ${hours} hours to confirm it.</p>
         ${orderTable(b, lang)}
         <div style="background:#f4eeff;border-radius:12px;padding:16px;margin:16px 0;line-height:1.7">
           <strong>Payment steps (CliQ):</strong><br>
           1) Transfer <strong>${b.amount} ${b.currency}</strong> to the CliQ alias: <strong>${esc(alias)}</strong><br>
           2) Keep a photo of the receipt<br>
           3) Send a photo of the receipt on WhatsApp with your reference <strong>${b.ref}</strong><br>${wa}
         </div>
         <p style="margin:0;line-height:1.6"><strong>Event:</strong> ${esc(eventLine(content, lang))}</p>`;

  return {
    subject:
      lang === 'ar'
        ? `حجزك المبدئي ${b.ref} — بانتظار الدفع`
        : `Booking ${b.ref} on hold — payment pending`,
    html: shell(lang, lang === 'ar' ? 'وصلنا حجزك! 🎉' : 'We got your booking! 🎉', inner),
  };
}

export function paymentConfirmedEmail(b: BookingRecord, content: SiteContent = site) {
  const lang = b.lang;
  const kids = b.children.map((c) => `${esc(c.name)} (${c.age})`).join('، ');
  const inner =
    lang === 'ar'
      ? `<p style="margin:0 0 16px;line-height:1.6">تم تأكيد دفعتك 🎉 هذه تذكرتك لحضور احتفال Wonder Wand.</p>
         <div style="background:#48258f;color:#fff;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
           <div style="font-size:12px;opacity:.8">رقم التذكرة</div>
           <div style="font-size:26px;font-weight:800;letter-spacing:2px">${b.ref}</div>
         </div>
         <p style="margin:0 0 4px"><strong>باسم:</strong> ${esc(b.parentName)}</p>
         <p style="margin:0 0 4px"><strong>الأطفال:</strong> ${esc(kids)}</p>
         <p style="margin:0 0 4px"><strong>المرافقون:</strong> ${b.adultCount}</p>
         <p style="margin:12px 0 0;line-height:1.6"><strong>الحدث:</strong> ${esc(eventLine(content, lang))}</p>
         <p style="margin:12px 0 0;color:#6b5fa8;font-size:13px">أظهر هذه الرسالة أو رقم التذكرة عند الباب.</p>`
      : `<p style="margin:0 0 16px;line-height:1.6">Your payment is confirmed 🎉 Here is your ticket for the Wonder Wand celebration.</p>
         <div style="background:#48258f;color:#fff;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
           <div style="font-size:12px;opacity:.8">Ticket reference</div>
           <div style="font-size:26px;font-weight:800;letter-spacing:2px">${b.ref}</div>
         </div>
         <p style="margin:0 0 4px"><strong>Name:</strong> ${esc(b.parentName)}</p>
         <p style="margin:0 0 4px"><strong>Children:</strong> ${esc(kids)}</p>
         <p style="margin:0 0 4px"><strong>Adults:</strong> ${b.adultCount}</p>
         <p style="margin:12px 0 0;line-height:1.6"><strong>Event:</strong> ${esc(eventLine(content, lang))}</p>
         <p style="margin:12px 0 0;color:#6b5fa8;font-size:13px">Show this email or your reference at the door.</p>`;
  return {
    subject:
      lang === 'ar'
        ? `تذكرتك مؤكدة ${b.ref} — Wonder Wand`
        : `Ticket confirmed ${b.ref} — Wonder Wand`,
    html: shell(lang, lang === 'ar' ? 'تذكرتك جاهزة! 🎟️' : 'Your ticket is ready! 🎟️', inner),
  };
}

export interface PaidRow {
  ref: string;
  parentName: string;
  phone: string;
  childCount: number;
  adultCount: number;
  amount: number;
  paidAt?: string;
}

/** Owner copy, sent each time a booking is confirmed: the ticket + the full paid list. */
export function paidListEmail(
  b: BookingRecord,
  paid: PaidRow[],
  _content: SiteContent = site,
) {
  const totalKids = paid.reduce((n, r) => n + (r.childCount || 0), 0);
  const totalAmt = paid.reduce((n, r) => n + (r.amount || 0), 0);
  const rows = paid
    .map(
      (r) =>
        `<tr><td style="padding:5px 6px;border-bottom:1px solid #eee"><strong>${esc(r.ref)}</strong></td><td style="padding:5px 6px;border-bottom:1px solid #eee">${esc(r.parentName)}</td><td style="padding:5px 6px;border-bottom:1px solid #eee">${esc(r.phone)}</td><td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:center">${r.childCount}+${r.adultCount}</td><td style="padding:5px 6px;border-bottom:1px solid #eee;text-align:right">${r.amount}</td></tr>`,
    )
    .join('');
  const inner = `<p style="margin:0 0 12px">Ticket sent to <strong>${esc(b.parentName)}</strong> (${esc(b.email)}) for <strong>${b.ref}</strong> — ${b.amount} ${b.currency}.</p>
    <h2 style="margin:16px 0 8px;font-size:16px">Paid bookings (${paid.length}) — ${totalKids} children · ${totalAmt} ${b.currency}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="color:#6b5fa8"><th align="left" style="padding:5px 6px">Ref</th><th align="left" style="padding:5px 6px">Name</th><th align="left" style="padding:5px 6px">WhatsApp</th><th style="padding:5px 6px">Kids+Adults</th><th align="right" style="padding:5px 6px">${b.currency}</th></tr>
      ${rows}
    </table>`;
  return {
    subject: `✅ Paid ${b.ref} — ${b.parentName} · ${paid.length} paid so far`,
    html: shell('en', `Payment confirmed ${b.ref}`, inner),
  };
}

export function teamNotifyEmail(b: BookingRecord, _content: SiteContent = site) {
  const inner = `<p style="margin:0 0 12px">New provisional booking — verify the CliQ transfer, then mark it <strong>paid</strong> in the CMS.</p>
    ${orderTable(b, 'en')}
    <p style="margin:12px 0 0;font-size:13px;color:#6b5fa8">Email: ${esc(b.email)} · City: ${esc(b.city || '—')}</p>`;
  return {
    subject: `New booking ${b.ref} — ${b.childCount} child · ${b.amount} ${b.currency}`,
    html: shell('en', `New booking ${b.ref}`, inner),
  };
}
