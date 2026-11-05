/**
 * A price for display: "5 دنانير" / "15 دينار" on Arabic pages (Arabic counts
 * 3–10 with the plural), "5 JOD" everywhere else.
 */
export function formatMoney(amount: number, currency: string, lang: string): string {
  const n = Math.round(amount * 100) / 100;
  if (lang !== 'ar' || currency !== 'JOD') return `${n} ${currency}`;
  return `${n} ${Number.isInteger(n) && n >= 3 && n <= 10 ? 'دنانير' : 'دينار'}`;
}
