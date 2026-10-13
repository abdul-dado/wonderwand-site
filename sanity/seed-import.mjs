/**
 * Imports sanity/seed.ndjson straight through the Sanity HTTP API — no CLI
 * login needed. Reads the write token from SANITY_WRITE_TOKEN (or .env).
 *
 *   pnpm seed:api            # createOrReplace every doc in the seed
 *
 * Safe to re-run: documents are matched by _id. Bookings are never touched.
 */
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('..', import.meta.url);
if (existsSync(new URL('.env', root))) {
  for (const line of readFileSync(new URL('.env', root), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'b9izpb2i';
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2024-10-01';
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error('SANITY_WRITE_TOKEN is not set (put it in .env).');
  process.exit(1);
}

const docs = readFileSync(new URL('seed.ndjson', import.meta.url), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));

const res = await fetch(
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ mutations: docs.map((d) => ({ createOrReplace: d })) }),
  },
);
const body = await res.json();
if (!res.ok) {
  console.error('Import failed:', res.status, JSON.stringify(body, null, 2));
  process.exit(1);
}
console.log(`Imported ${body.results?.length ?? docs.length} documents into ${projectId}/${dataset}.`);
