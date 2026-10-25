import { defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    { name: 'brandName', title: 'Brand name', type: 'string' },
    { name: 'tagline', title: 'Tagline', type: 'localeString' },
    {
      name: 'social',
      title: 'Social & contact links',
      type: 'object',
      fields: [
        { name: 'youtube', type: 'url' },
        { name: 'instagram', type: 'url' },
        { name: 'tiktok', type: 'url' },
        { name: 'facebook', type: 'url' },
        { name: 'whatsapp', title: 'WhatsApp (number or wa.me link)', type: 'string' },
        { name: 'email', title: 'Contact email', type: 'string' },
      ],
    },
    {
      name: 'analytics',
      title: 'Analytics',
      type: 'object',
      fields: [
        { name: 'ga4Id', title: 'GA4 Measurement ID (G-…)', type: 'string' },
        { name: 'metaPixelId', title: 'Meta Pixel ID', type: 'string' },
      ],
    },
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});

export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement bar',
  type: 'document',
  fields: [
    { name: 'enabled', title: 'Show the bar', type: 'boolean', initialValue: true },
    { name: 'text', title: 'Text', type: 'localeString' },
    { name: 'href', title: 'Link (e.g. #book)', type: 'string', initialValue: '#book' },
  ],
  preview: { prepare: () => ({ title: 'Announcement bar' }) },
});

export const heroContent = defineType({
  name: 'heroContent',
  title: 'Hero section',
  type: 'document',
  fields: [
    { name: 'kicker', title: 'Kicker (small label)', type: 'localeString' },
    { name: 'title', title: 'Title', type: 'localeString' },
    { name: 'subtitle', title: 'Subtitle', type: 'localeText' },
    { name: 'milestone', title: 'Milestone / subscriber goal (e.g. 200K)', type: 'string' },
  ],
  preview: { prepare: () => ({ title: 'Hero section' }) },
});

export const aboutContent = defineType({
  name: 'aboutContent',
  title: 'About section',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'localeString' },
    { name: 'body', title: 'Body', type: 'localeText' },
    { name: 'hosts', title: 'Hosts line', type: 'localeString' },
  ],
  preview: { prepare: () => ({ title: 'About section' }) },
});
