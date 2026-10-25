import type { APIRoute } from 'astro';
import { site } from '@/data/site';

export const prerender = false;

const CACHE_SECONDS = 600;

/** Channel handle from the YouTube URL in site defaults, e.g. "The-English-Nest-10". */
function channelHandle(env: Record<string, string | undefined>): string {
  if (env.YOUTUBE_CHANNEL_HANDLE) return env.YOUTUBE_CHANNEL_HANDLE.replace(/^@/, '');
  const m = site.social.youtube.match(/@([^/?#]+)/);
  return m ? m[1] : '';
}

const json = (body: unknown, maxAge: number) =>
  new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json',
      'cache-control': `public, max-age=${maxAge}`,
    },
  });

/**
 * GET /api/subscribers — current YouTube subscriber count for the live counter.
 * Needs YOUTUBE_API_KEY (YouTube Data API v3). Without it, returns
 * `{ count: null }` and the counter stays hidden. YouTube rounds public counts
 * to three significant figures (e.g. 198,000), so it moves in steps.
 */
export const GET: APIRoute = async (context) => {
  const env = {
    ...(import.meta.env as any),
    ...((context.locals as any)?.runtime?.env ?? {}),
  };
  const key = env.YOUTUBE_API_KEY;
  const handle = channelHandle(env);
  if (!key || !handle) return json({ count: null }, 60);

  // Share one upstream call across all visitors for CACHE_SECONDS.
  const cache = (globalThis as any).caches?.default as Cache | undefined;
  const cacheKey = new Request(new URL('/api/subscribers', context.request.url).toString());
  const hit = await cache?.match(cacheKey);
  if (hit) return hit;

  try {
    const u = new URL('https://www.googleapis.com/youtube/v3/channels');
    u.searchParams.set('part', 'statistics');
    u.searchParams.set('forHandle', `@${handle}`);
    u.searchParams.set('key', key);
    const res = await fetch(u);
    if (!res.ok) {
      console.error('[subscribers]', res.status, await res.text());
      return json({ count: null }, 60);
    }
    const data = (await res.json()) as {
      items?: { statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }[];
    };
    const stats = data.items?.[0]?.statistics;
    const count =
      stats && !stats.hiddenSubscriberCount ? Number(stats.subscriberCount) || null : null;
    const out = json({ count }, CACHE_SECONDS);
    if (cache && count !== null) {
      const ctx = (context.locals as any)?.runtime?.ctx;
      const put = cache.put(cacheKey, out.clone());
      ctx?.waitUntil ? ctx.waitUntil(put) : await put;
    }
    return out;
  } catch (err) {
    console.error('[subscribers:throw]', err);
    return json({ count: null }, 60);
  }
};
