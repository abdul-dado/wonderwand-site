import { defineType } from 'sanity';

export const eventInfo = defineType({
  name: 'eventInfo',
  title: 'Event details',
  type: 'document',
  fields: [
    { name: 'title', title: 'Section title', type: 'localeString' },
    { name: 'startsAt', title: 'Starts at', type: 'datetime' },
    { name: 'endsAt', title: 'Ends at', type: 'datetime' },
    {
      name: 'timeConfirmed',
      title: 'Time confirmed (show the clock time)',
      type: 'boolean',
      initialValue: true,
    },
    { name: 'doorsOpen', title: 'Doors open (text)', type: 'localeString' },
    { name: 'venueName', title: 'Venue name', type: 'localeString' },
    { name: 'address', title: 'Address', type: 'localeString' },
    { name: 'googleMapsUrl', title: 'Google Maps link', type: 'url' },
    { name: 'audience', title: 'Audience line', type: 'localeString' },
  ],
  preview: { prepare: () => ({ title: 'Event details' }) },
});

export const pricing = defineType({
  name: 'pricing',
  title: 'Pricing',
  type: 'document',
  fields: [
    { name: 'currency', title: 'Currency', type: 'string', initialValue: 'JOD' },
    { name: 'childEarlyBird', title: 'Child — early bird price', type: 'number' },
    { name: 'childRegular', title: 'Child — regular price', type: 'number' },
    { name: 'adult', title: 'Accompanying adult price', type: 'number', initialValue: 0 },
    { name: 'earlyBirdUntil', title: 'Early bird ends at', type: 'datetime' },
  ],
  preview: { prepare: () => ({ title: 'Pricing' }) },
});

export const registrationSettings = defineType({
  name: 'registrationSettings',
  title: 'Registration',
  type: 'document',
  fields: [
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'Closed', value: 'closed' },
          { title: 'Sold out', value: 'sold_out' },
        ],
        layout: 'radio',
      },
      initialValue: 'open',
    },
    { name: 'cliqAlias', title: 'CliQ alias', type: 'string' },
    { name: 'cliqName', title: 'Name shown on transfer', type: 'localeString' },
    {
      name: 'paymentWindowHours',
      title: 'Payment window (hours)',
      type: 'number',
      initialValue: 24,
    },
    { name: 'paymentInstructions', title: 'Payment instructions', type: 'localeText' },
    { name: 'capacityNote', title: 'Capacity note', type: 'localeString' },
    {
      name: 'childAges',
      title: 'Selectable child ages',
      type: 'array',
      of: [{ type: 'number' }],
      initialValue: [3, 4, 5, 6, 7, 8],
    },
    {
      name: 'maxChildrenPerOrder',
      title: 'Max children per booking',
      type: 'number',
      initialValue: 6,
    },
    {
      name: 'maxAdultsPerOrder',
      title: 'Max adults per booking',
      type: 'number',
      initialValue: 4,
    },
  ],
  preview: { prepare: () => ({ title: 'Registration' }) },
});

export const discountCode = defineType({
  name: 'discountCode',
  title: 'Discount code',
  type: 'document',
  fields: [
    { name: 'code', title: 'Code', type: 'string', validation: (r) => r.required() },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage %', value: 'percent' },
          { title: 'Fixed amount', value: 'amount' },
        ],
        layout: 'radio',
      },
      initialValue: 'percent',
    },
    { name: 'value', title: 'Value', type: 'number', validation: (r) => r.required().min(0) },
    { name: 'active', title: 'Active', type: 'boolean', initialValue: true },
    { name: 'label', title: 'Label shown to buyer', type: 'localeString' },
    { name: 'expiresAt', title: 'Expires at (optional)', type: 'datetime' },
  ],
  preview: {
    select: { code: 'code', type: 'type', value: 'value', active: 'active' },
    prepare: ({ code, type, value, active }) => ({
      title: `${code} — ${value}${type === 'percent' ? '%' : ''}`,
      subtitle: active ? 'Active' : 'Inactive',
    }),
  },
});
