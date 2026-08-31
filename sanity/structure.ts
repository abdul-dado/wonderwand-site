import { SINGLETONS } from './schemaTypes';

const SINGLETON_TITLES: Record<string, string> = {
  siteSettings: 'Site settings',
  announcement: 'Announcement bar',
  heroContent: 'Hero section',
  aboutContent: 'About section',
  eventInfo: 'Event details',
  pricing: 'Pricing',
  registrationSettings: 'Registration',
};

export const structure = (S: any) =>
  S.list()
    .title('Wonder Wand')
    .items([
      S.listItem()
        .title('Bookings')
        .child(
          S.documentTypeList('booking')
            .title('Bookings')
            .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
        ),
      S.divider(),
      ...SINGLETONS.map((name) =>
        S.listItem()
          .title(SINGLETON_TITLES[name] ?? name)
          .id(name)
          .child(S.document().schemaType(name).documentId(name)),
      ),
      S.divider(),
      S.documentTypeListItem('discountCode').title('Discount codes'),
      S.documentTypeListItem('activity').title('Activities'),
      S.documentTypeListItem('prize').title('Prizes'),
      S.documentTypeListItem('faq').title('FAQ'),
      S.documentTypeListItem('video').title('Videos'),
    ]);
