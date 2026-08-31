import type { APIRoute } from 'astro';
import { sanityConfig, sanityFetch } from '@/lib/sanity';

export const prerender = false;

interface BookingDoc {
  _id: string;
  ref: string;
  parentName: string;
  status: string;
  childCount: number;
  adultCount: number;
  amount: number;
  currency: string;
  children: { name: string; age: number }[];
  checkedInAt?: string;
}

/** POST { ref, pin, action?: 'lookup' | 'checkin' } — door check-in. */
export const POST: APIRoute = async (context) => {
  const env = {
    ...(import.meta.env as any),
    ...((context.locals as any)?.runtime?.env ?? {}),
  };
  const { ref, pin, action = 'lookup' } = (await context.request
    .json()
    .catch(() => ({}))) as { ref?: string; pin?: string; action?: string };

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  if (!env.CHECKIN_PIN || pin !== env.CHECKIN_PIN) return json({ error: 'bad_pin' }, 403);
  if (!ref) return json({ error: 'no_ref' }, 400);

  const cfg = sanityConfig(env);
  if (!cfg) return json({ error: 'no_cms' }, 503);

  const code = ref.trim().toUpperCase();
  const doc = await sanityFetch<BookingDoc>(
    env,
    `*[_type == "booking" && upper(ref) == $ref][0]{
      _id, ref, parentName, status, childCount, adultCount, amount, currency, children, checkedInAt
    }`,
    { ref: code },
  );
  if (!doc) return json({ error: 'not_found' }, 404);

  if (action === 'checkin') {
    if (doc.status === 'checked_in') return json({ ok: true, already: true, booking: doc });
    if (doc.status !== 'paid') return json({ error: 'not_paid', booking: doc }, 409);
    if (cfg.token) {
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
              {
                patch: {
                  id: doc._id,
                  set: { status: 'checked_in', checkedInAt: new Date().toISOString() },
                },
              },
            ],
          }),
        },
      );
    }
    return json({ ok: true, booking: { ...doc, status: 'checked_in' } });
  }

  return json({ ok: true, booking: doc });
};
