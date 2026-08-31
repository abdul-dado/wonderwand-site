import { localeString, localeText } from './localeString';
import { siteSettings, announcement, heroContent, aboutContent } from './settings';
import {
  eventInfo,
  pricing,
  registrationSettings,
  discountCode,
} from './event';
import { activity, prize, faq, video } from './collections';
import { booking } from './booking';

export const schemaTypes = [
  // shared
  localeString,
  localeText,
  // singletons
  siteSettings,
  announcement,
  heroContent,
  aboutContent,
  eventInfo,
  pricing,
  registrationSettings,
  // collections
  discountCode,
  activity,
  prize,
  faq,
  video,
  booking,
];

export const SINGLETONS = [
  'siteSettings',
  'announcement',
  'heroContent',
  'aboutContent',
  'eventInfo',
  'pricing',
  'registrationSettings',
] as const;
