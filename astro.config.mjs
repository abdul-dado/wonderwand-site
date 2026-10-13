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
  },
});
