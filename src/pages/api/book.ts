import type { APIRoute } from 'astro';
import type { Lang } from '@/i18n';
import { childPrice, isEarlyBird, findDiscount, discountAmount } from '@/data/site';
import { loadContent } from '@/lib/content';
import { sendEmail, bookingReceivedEmail, teamNotifyEmail } from '@/lib/email';
import { createBookingDoc } from '@/lib/sanity';

export const prerender = false;

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  PUBLIC_SANITY_PROJECT_ID?: string;
  PUBLIC_SANITY_DATASET?: string;
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  SANITY_WRITE_TOKEN?: string;
  SANITY_API_VERSION?: string;
  RESEND_API_KEY?: string;
  BOOKING_FROM_EMAIL?: string;
  BOOKING_NOTIFY_EMAIL?: string;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function makeRef(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `WW-${s}`;
}

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body },
  );
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const env = {
    ...(import.meta.env as unknown as Env),
    ...((context.locals as any)?.runtime?.env as Env | undefined),
  } as Env;

  const wantsJson = request.headers.get('accept')?.includes('application/json');
  const form = await request.formData();
  const get = (k: string) => String(form.get(k) ?? '').trim();

  const lang: Lang = get('lang') === 'en' ? 'en' : 'ar';
  const fail = (status: number, error: string) =>
    wantsJson
      ? new Response(JSON.stringify({ ok: false, error }), {
          status,
          headers: { 'content-type': 'application/json' },
        })
      : new Response(null, { status: 302, headers: { Location: `/${lang}/#book` } });

  // 1. Honeypot — silently accept, do nothing.
  if (get('company')) {
    return wantsJson
      ? new Response(JSON.stringify({ ok: true, ref: makeRef() }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      : new Response(null, { status: 302, headers: { Location: `/${lang}/success/` } });
  }

  const content = await loadContent(env);
  const reg = content.registration;

  // 2. Registration must be open.
  if (reg.status !== 'open') {
    return fail(403, 'registration_closed');
  }

  // 3. Validate required fields.
  const parentName = get('parentName');
  const phone = get('phone');
  const email = get('email');
  const consent = form.get('consent');
  if (!parentName || !phone || !email || !isEmail(email) || !consent) {
    return fail(422, 'invalid_input');
  }

  // 4. Ticket quantities.
  const childTt = reg.ticketTypes.find((tt) => tt.id === 'child')!;
  const adultTt = reg.ticketTypes.find((tt) => tt.id === 'adult')!;
  const clamp = (v: unknown, max: number) =>
    Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));

  const childCount = clamp(form.get('qty_child'), childTt.perOrderLimit);
  const adultCount = clamp(form.get('qty_adult'), adultTt.perOrderLimit);
  if (childCount < 1) return fail(422, 'no_children');

  // 5. Per-child details (name + age).
  const allowedAges = new Set(reg.childAges.map(String));
  const children: { name: string; age: number }[] = [];
  for (let i = 0; i < childTt.perOrderLimit; i++) {
    const name = get(`child_name_${i}`);
    const age = get(`child_age_${i}`);
    if (!name && !age) continue;
    if (!name || !allowedAges.has(age)) return fail(422, 'invalid_child');
    children.push({ name, age: Number(age) });
  }
  if (children.length !== childCount) return fail(422, 'child_count_mismatch');

  const unitPrice = childPrice(reg.pricing);
  const subtotal = childCount * unitPrice + adultCount * reg.pricing.adult;
  const totalSeats = childCount + adultCount;

  // Discount code (optional).
  const codeInput = get('discountCode');
  const discount = codeInput ? findDiscount(reg.discounts, codeInput) : null;
  const discountValue = discount ? discountAmount(subtotal, discount) : 0;
  const amount = Math.max(0, Math.round((subtotal - discountValue) * 100) / 100);

  // 6. Spam protection.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = get('cf-turnstile-response');
    const ip = request.headers.get('CF-Connecting-IP');
    if (!token || !(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip))) {
      return fail(403, 'turnstile_failed');
    }
  }

  const ref = makeRef();
  const booking = {
    ref,
    parentName,
    phone,
    email,
    city: get('city'),
    children,
    childCount,
    adultCount,
    totalSeats,
    unitPrice,
    subtotal,
    discountCode: discount?.code ?? null,
    discountValue,
    amount,
    currency: reg.pricing.currency,
    earlyBird: isEarlyBird(reg.pricing),
    hearAbout: get('hearAbout'),
    lang,
    status: 'pending_payment' as const,
    createdAt: new Date().toISOString(),
  };

  console.log('[booking]', JSON.stringify(booking));

  // Persist + notify. Don't block the response on I/O when the platform lets
  // us defer it.
  const work = Promise.allSettled([
    createBookingDoc(env, booking),
    (async () => {
      const mail = bookingReceivedEmail(booking, content);
      return sendEmail(env, { to: booking.email, ...mail });
    })(),
    (async () => {
      const to = env.BOOKING_NOTIFY_EMAIL || env.BOOKING_FROM_EMAIL;
      if (!to) return;
      return sendEmail(env, { to, replyTo: booking.email, ...teamNotifyEmail(booking, content) });
    })(),
  ]);
  const waitUntil = (context.locals as any)?.runtime?.ctx?.waitUntil;
  if (typeof waitUntil === 'function') waitUntil.call((context.locals as any).runtime.ctx, work);
  else await work;

  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true, ref }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response(null, {
    status: 302,
    headers: { Location: `/${lang}/success/?ref=${ref}` },
  });
};
