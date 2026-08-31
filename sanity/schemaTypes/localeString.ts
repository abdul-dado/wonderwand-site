import { defineType } from 'sanity';

/** { ar, en } string pair used across the site. */
export const localeString = defineType({
  name: 'localeString',
  title: 'Text (AR / EN)',
  type: 'object',
  fields: [
    { name: 'ar', title: 'العربية', type: 'string' },
    { name: 'en', title: 'English', type: 'string' },
  ],
});

export const localeText = defineType({
  name: 'localeText',
  title: 'Paragraph (AR / EN)',
  type: 'object',
  fields: [
    { name: 'ar', title: 'العربية', type: 'text', rows: 4 },
    { name: 'en', title: 'English', type: 'text', rows: 4 },
  ],
});
