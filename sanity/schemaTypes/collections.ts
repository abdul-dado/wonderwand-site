import { defineType } from 'sanity';

export const activity = defineType({
  name: 'activity',
  title: 'Activity',
  type: 'document',
  fields: [
    { name: 'emoji', title: 'Emoji', type: 'string' },
    { name: 'title', title: 'Title', type: 'localeString' },
    { name: 'description', title: 'Description', type: 'localeText' },
    { name: 'order', title: 'Order', type: 'number', initialValue: 0 },
  ],
  orderings: [
    { title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title.en', emoji: 'emoji' },
    prepare: ({ title, emoji }) => ({ title: `${emoji ?? ''} ${title ?? ''}` }),
  },
});

export const prize = defineType({
  name: 'prize',
  title: 'Prize',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'localeString' },
    { name: 'description', title: 'Description', type: 'localeText' },
    { name: 'order', title: 'Order', type: 'number', initialValue: 0 },
  ],
  orderings: [
    { title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title.en' } },
});

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    { name: 'question', title: 'Question', type: 'localeString' },
    { name: 'answer', title: 'Answer', type: 'localeText' },
    { name: 'order', title: 'Order', type: 'number', initialValue: 0 },
  ],
  orderings: [
    { title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'question.en' } },
});

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    {
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      validation: (r) => r.required(),
    },
    { name: 'title', title: 'Title', type: 'localeString' },
    { name: 'featured', title: 'Featured', type: 'boolean', initialValue: false },
    { name: 'order', title: 'Order', type: 'number', initialValue: 0 },
  ],
  orderings: [
    { title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title.en', subtitle: 'youtubeUrl' } },
});
