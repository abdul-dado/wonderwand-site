import type { APIRoute } from 'astro';
import { findDiscount } from '@/data/site';

export const prerender = false;

/** GET /api/discount?code=XXXX&lang=ar — validate a discount code for the form. */
export const GET: APIRoute = ({ url }) => {
  const code = url.searchParams.get('code') ?? '';
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'ar';
  const d = findDiscount(code);

  const body = d
    ? { valid: true, code: d.code, type: d.type, value: d.value, label: d.label[lang] }
    : { valid: false };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
