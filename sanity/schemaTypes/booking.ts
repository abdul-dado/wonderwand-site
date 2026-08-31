import { defineType } from 'sanity';

export const booking = defineType({
  name: 'booking',
  title: 'Booking',
  type: 'document',
  // Created by the website API. Editors change `status` and add notes only.
  fields: [
    { name: 'ref', title: 'Reference', type: 'string', readOnly: true },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: '🟡 Pending payment', value: 'pending_payment' },
          { title: '🟢 Paid — ticket sent', value: 'paid' },
          { title: '🎟️ Checked in', value: 'checked_in' },
          { title: '⚪ Expired (unpaid)', value: 'expired' },
          { title: '🔴 Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending_payment',
    },
    { name: 'parentName', title: 'Parent name', type: 'string', readOnly: true },
    { name: 'phone', title: 'Phone', type: 'string', readOnly: true },
    { name: 'email', title: 'Email', type: 'string', readOnly: true },
    { name: 'city', title: 'City', type: 'string', readOnly: true },
    {
      name: 'children',
      title: 'Children',
      type: 'array',
      readOnly: true,
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'number' },
          ],
          preview: {
            select: { name: 'name', age: 'age' },
            prepare: ({ name, age }) => ({ title: `${name} (${age})` }),
          },
        },
      ],
    },
    { name: 'childCount', title: 'Children', type: 'number', readOnly: true },
    { name: 'adultCount', title: 'Adults', type: 'number', readOnly: true },
    { name: 'unitPrice', title: 'Child unit price', type: 'number', readOnly: true },
    { name: 'subtotal', title: 'Subtotal', type: 'number', readOnly: true },
    { name: 'discountCode', title: 'Discount code', type: 'string', readOnly: true },
    { name: 'discountValue', title: 'Discount', type: 'number', readOnly: true },
    { name: 'amount', title: 'Amount due', type: 'number', readOnly: true },
    { name: 'currency', title: 'Currency', type: 'string', readOnly: true },
    { name: 'earlyBird', title: 'Early bird', type: 'boolean', readOnly: true },
    { name: 'hearAbout', title: 'Heard about us via', type: 'string', readOnly: true },
    { name: 'lang', title: 'Language', type: 'string', readOnly: true },
    { name: 'createdAt', title: 'Booked at', type: 'datetime', readOnly: true },
    { name: 'paidAt', title: 'Paid at', type: 'datetime' },
    { name: 'checkedInAt', title: 'Checked in at', type: 'datetime' },
    { name: 'notes', title: 'Internal notes', type: 'text', rows: 2 },
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      ref: 'ref',
      parent: 'parentName',
      status: 'status',
      amount: 'amount',
      currency: 'currency',
      kids: 'childCount',
    },
    prepare: ({ ref, parent, status, amount, currency, kids }) => {
      const dot =
        { pending_payment: '🟡', paid: '🟢', checked_in: '🎟️', expired: '⚪', cancelled: '🔴' }[
          status as string
        ] ?? '';
      return {
        title: `${dot} ${ref} — ${parent}`,
        subtitle: `${kids ?? 0} child · ${amount ?? 0} ${currency ?? ''}`,
      };
    },
  },
});
