import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = process.env.SITE_URL || 'https://wonderwand.org';
// Project id is public by design; the write token stays in the env.
const SANITY_PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 'b9izpb2i';
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';

// The Sanity Studio (/studio) is only mounted once a project id is configured.
const sanityIntegration = SANITY_PROJECT_ID
  ? [
      react(),
      sanity({
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        useCdn: true,
        studioBasePath: '/studio',
      }),
    ]
  : [];

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: { enabled: true },
  }),
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    ...sanityIntegration,
    sitemap({
      filter: (page) => !page.includes('/studio') && !page.includes('/checkin'),
      i18n: {
        defaultLocale: 'ar',
        locales: { ar: 'ar', en: 'en' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          // The React server renderer (pulled in by the embedded Sanity Studio)
          // calls `new MessageChannel()` at module scope; Cloudflare Workers
          // don't provide it, so the worker failed to publish. Shim it in the
          // server-side renderers chunk only.
          banner: (chunk) =>
            chunk.fileName.includes('renderers') ? MESSAGE_CHANNEL_SHIM : '',
        },
      },
    },
  },
});

const MESSAGE_CHANNEL_SHIM = `if (typeof globalThis.MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      const port1 = { onmessage: null, close() {}, start() {} };
      const port2 = {
        postMessage(data) {
          setTimeout(() => port1.onmessage && port1.onmessage({ data }), 0);
        },
        close() {},
        start() {},
      };
      this.port1 = port1;
      this.port2 = port2;
    }
  };
}
`;
