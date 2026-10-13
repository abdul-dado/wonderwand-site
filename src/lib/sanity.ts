import type { BookingRecord } from './email';

export interface SanityEnv {
  PUBLIC_SANITY_PROJECT_ID?: string;
  SANITY_PROJECT_ID?: string;
  PUBLIC_SANITY_DATASET?: string;
  SANITY_DATASET?: string;
  SANITY_API_VERSION?: string;
  SANITY_WRITE_TOKEN?: string;
}

interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token?: string;
}

export function sanityConfig(env: SanityEnv): SanityConfig | null {
  const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_PROJECT_ID || 'b9izpb2i';
  if (!projectId) return null;
  return {
    projectId,
    dataset: env.PUBLIC_SANITY_DATASET || env.SANITY_DATASET || 'production',
    apiVersion: env.SANITY_API_VERSION || '2024-10-01',
    token: env.SANITY_WRITE_TOKEN,
  };
}

/** GROQ query against the read API. Returns `null` when Sanity isn't configured. */
export async function sanityFetch<T>(
  env: SanityEnv,
  query: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  const cfg = sanityConfig(env);
  if (!cfg) return null;
  const u = new URL(
    `https://${cfg.projectId}.apicdn.sanity.io/v${cfg.apiVersion}/data/query/${cfg.dataset}`,
  );
  u.searchParams.set('query', query);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(u, {
    headers: cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {},
  });
  if (!res.ok) {
    console.error('[sanity:query]', res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { result: T };
  return data.result;
}

/** Create a booking document. No-ops when there is no write token. */
export async function createBookingDoc(
  env: SanityEnv,
  booking: BookingRecord & { status: string; createdAt: string; hearAbout?: string },
): Promise<{ ok: boolean; skipped?: boolean }> {
  const cfg = sanityConfig(env);
  if (!cfg?.token) {
    console.log('[sanity:skipped] booking', booking.ref);
    return { ok: true, skipped: true };
  }
  try {
    const res = await fetch(
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
              create: {
                _type: 'booking',
                _id: `booking.${booking.ref}`,
                ref: booking.ref,
                status: booking.status,
                parentName: booking.parentName,
                phone: booking.phone,
                email: booking.email,
                city: booking.city,
                children: booking.children.map((c, i) => ({
                  _key: `c${i}`,
                  name: c.name,
                  age: c.age,
                })),
                childCount: booking.childCount,
                adultCount: booking.adultCount,
                unitPrice: booking.unitPrice,
                subtotal: booking.subtotal,
                discountCode: booking.discountCode,
                discountValue: booking.discountValue,
                amount: booking.amount,
                currency: booking.currency,
                earlyBird: booking.earlyBird,
                hearAbout: booking.hearAbout ?? '',
                lang: booking.lang,
                createdAt: booking.createdAt,
              },
            },
          ],
        }),
      },
    );
    if (!res.ok) {
      console.error('[sanity:create]', res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error('[sanity:throw]', err);
    return { ok: false };
  }
}
