import type { APIRoute } from 'astro';
import { site } from '@/data/site';

export const prerender = false;

interface Env {
  TURNSTILE_SECRET_KEY?: string;
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

  const lang = get('lang') === 'en' ? 'en' : 'ar';
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

  // 2. Registration must be open.
  if (site.registration.status !== 'open') {
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
  const items = site.registration.ticketTypes.map((tt) => ({
    id: tt.id,
    qty: Math.max(0, Math.min(tt.perOrderLimit, Number(form.get(`qty_${tt.id}`)) || 0)),
    price: tt.price,
  }));
  const totalSeats = items.reduce((n, i) => n + i.qty, 0);
  const amount = items.reduce((n, i) => n + i.qty * i.price, 0);
  if (totalSeats < 1) return fail(422, 'no_seats');

  // 5. Spam protection.
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
    kidsAges: get('kidsAges'),
    hearAbout: get('hearAbout'),
    items,
    totalSeats,
    amount,
    lang,
    status: 'pending_payment' as const,
    createdAt: new Date().toISOString(),
  };

  // TODO(phase 2): persist `booking` as a Sanity document (SANITY_WRITE_TOKEN).
  // TODO(phase 3): send confirmation email + team notification via Resend.
  console.log('[booking]', JSON.stringify(booking));

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
