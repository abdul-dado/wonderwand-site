import { ui, defaultLang, type Lang, type UIKey } from './ui';

export { languages, defaultLang } from './ui';
export type { Lang } from './ui';

export const locales: Lang[] = ['ar', 'en'];

export function isLang(value: string | undefined): value is Lang {
  return value === 'ar' || value === 'en';
}

/** Pull the locale out of an Astro URL pathname (`/ar/...`, `/en/...`). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return isLang(seg) ? seg : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export const dir = (lang: Lang): 'rtl' | 'ltr' => (lang === 'ar' ? 'rtl' : 'ltr');

export const otherLang = (lang: Lang): Lang => (lang === 'ar' ? 'en' : 'ar');

/** Build an in-locale href, e.g. localizedPath('en', '/#book') -> '/en/#book'. */
export function localizedPath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') return `/${lang}/`;
  return `/${lang}${clean}`;
}

/** Swap the locale segment of the current path, preserving the rest. */
export function switchLangPath(url: URL, target: Lang): string {
  const parts = url.pathname.split('/');
  if (isLang(parts[1])) {
    parts[1] = target;
  } else {
    parts.splice(1, 0, target);
  }
  const path = parts.join('/') || `/${target}/`;
  return path.endsWith('/') ? path : `${path}/`;
}
