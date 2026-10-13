import type { APIRoute } from 'astro';
import { loadContent } from '@/lib/content';
import {
  sendEmail,
  paymentConfirmedEmail,
  paidListEmail,
  type BookingRecord,
  type PaidRow,
} from '@/lib/email';
import { sanityConfig, sanityFetch } from '@/lib/sanity';

export const prerender = false;

/**
 * Sanity webhook: fires the "payment confirmed / ticket" email the first time a
 * booking flips to `status == "paid"`, and stamps `paidAt` back on the doc.
 *
 * Configure in Sanity → API → Webhooks:
 *   URL:     https://wonderwand.org/api/webhooks/sanity?secret=<SANITY_WEBHOOK_SECRET>
 *   Trigger: on "update", filter `_type == "booking"`
 *   Projection: {..., "prev": before()}
 */
export const POST: APIRoute = async (context) => {
  const url = new URL(context.request.url);
  const env = {
    ...(import.meta.env as any),
    ...((context.locals as any)?.runtime?.env ?? {}),
  };

  if (!env.SANITY_WEBHOOK_SECRET || url.searchParams.get('secret') !== env.SANITY_WEBHOOK_SECRET) {
    return new Response('forbidden', { status: 403 });
  }

  const payload = (await context.request.json().catch(() => null)) as
    | (Partial<BookingRecord> & {
        _type?: string;
        status?: string;
        paidAt?: string;
        _id?: string;
        prev?: { status?: string };
      })
    | null;

  if (!payload || payload._type !== 'booking') {
    return new Response('ignored', { status: 200 });
  }

  const becamePaid =
    payload.status === 'paid' && payload.prev?.status !== 'paid' && !payload.paidAt;
  if (!becamePaid) return new Response('ok', { status: 200 });

  if (!payload.email || !payload.ref) return new Response('ok', { status: 200 });

  const content = await loadContent(env);
  const booking = {
    ref: payload.ref,
    parentName: payload.parentName ?? '',
    phone: payload.phone ?? '',
    email: payload.email,
    city: payload.city ?? '',
    children: payload.children ?? [],
    childCount: payload.childCount ?? 0,
    adultCount: payload.adultCount ?? 0,
    unitPrice: payload.unitPrice ?? 0,
    subtotal: payload.subtotal ?? 0,
    discountCode: payload.discountCode ?? null,
    discountValue: payload.discountValue ?? 0,
    amount: payload.amount ?? 0,
    currency: payload.currency ?? 'JOD',
    earlyBird: !!payload.earlyBird,
    lang: payload.lang === 'en' ? 'en' : 'ar',
  } as BookingRecord;

  await sendEmail(env, { to: booking.email, ...paymentConfirmedEmail(booking, content) });

  // Owner copy: this ticket + the running list of everyone who has paid.
  const owner = env.BOOKING_NOTIFY_EMAIL || env.BOOKING_FROM_EMAIL;
  if (owner) {
    const paid =
      (await sanityFetch<PaidRow[]>(
        env,
        `*[_type == "booking" && status in ["paid", "checked_in"]] | order(paidAt asc, createdAt asc){
          ref, parentName, phone, childCount, adultCount, amount, paidAt
        }`,
      ).catch(() => null)) ?? [];
    // The doc we just handled may not carry paidAt yet; make sure it's listed.
    if (!paid.some((r) => r.ref === booking.ref)) {
      paid.push({
        ref: booking.ref,
        parentName: booking.parentName,
        phone: booking.phone,
        childCount: booking.childCount,
        adultCount: booking.adultCount,
        amount: booking.amount,
      });
    }
    await sendEmail(env, { to: owner, replyTo: booking.email, ...paidListEmail(booking, paid, content) });
  }

  // stamp paidAt so a re-fire doesn't re-send
  const cfg = sanityConfig(env);
  if (cfg?.token && payload._id) {
    await fetch(
      `https://${cfg.projectId}.api.sanity.io/v${cfg.apiVersion}/data/mutate/${cfg.dataset}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          mutations: [
            { patch: { id: payload._id, set: { paidAt: new Date().toISOString() } } },
          ],
        }),
      },
    ).catch((e) => console.error('[webhook:patch]', e));
  }

  return new Response('sent', { status: 200 });
};
