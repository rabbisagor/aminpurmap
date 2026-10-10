/**
 * বাংলা সংখ্যা রূপান্তর ও পাঠ্য স্বাভাবিকীকরণ ইউটিলিটি
 */

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * সংখ্যা বা স্ট্রিংকে বাংলা সংখ্যায় রূপান্তর
 */
export function toBengaliNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'number' ? val.toString() : val;
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

/**
 * বাংলা সংখ্যাকে ইংরেজি সংখ্যায় রূপান্তর
 */
export function toEnglishNumber(str: string): string {
  if (!str) return '';
  let res = str;
  BENGALI_DIGITS.forEach((bDigit, idx) => {
    res = res.replaceAll(bDigit, ENGLISH_DIGITS[idx]);
  });
  return res;
}

/**
 * সেটিংস অনুযায়ী সংখ্যা ফরম্যাট
 */
export function formatNumber(val: number | string, useBengali: boolean = true): string {
  const str = typeof val === 'number' ? (Number.isInteger(val) ? val.toString() : val.toFixed(1)) : val;
  return useBengali ? toBengaliNumber(str) : str;
}

/**
 * দূরত্ব ফরম্যাট করা (মিটার অথবা কিলোমিটারে)
 */
export function formatDistance(meters: number, useBengali: boolean = true): string {
  if (meters < 1000) {
    const rounded = Math.round(meters);
    return `${formatNumber(rounded, useBengali)} মিটার`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${formatNumber(km, useBengali)} কিমি`;
}

/**
 * সময় ফরম্যাট করা
 */
export function formatDuration(minutes: number, useBengali: boolean = true): string {
  const mins = Math.round(minutes);
  if (mins < 60) {
    return `${formatNumber(mins, useBengali)} মিনিট`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${formatNumber(hours, useBengali)} ঘণ্টা`;
  }
  return `${formatNumber(hours, useBengali)} ঘণ্টা ${formatNumber(remainingMins, useBengali)} মিনিট`;
}

/**
 * অনুসন্ধান ও ফিল্টারিংয়ের জন্য বাংলা ও ইংরেজি পাঠ্য স্বাভাবিকীকরণ (Normalize)
 */
export function normalizeBanglaText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // Zero-width joiner & non-joiner মুছে ফেলা
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // অতিরিক্ত স্পেস ও যতিচিহ্ন
    .replace(/\s+/g, ' ')
    .replace(/[।,\-_./\\()[\]{}]/g, ' ')
    .trim();
}

/**
 * ইংরেজি লিপ্যন্তর থেকে সম্ভাব্য বাংলা বিকল্প যাচাই
 */
export function matchesQuery(query: string, ...targets: (string | undefined | null)[]): boolean {
  const normalizedQuery = normalizeBanglaText(query);
  if (!normalizedQuery) return true;

  const engQuery = toEnglishNumber(normalizedQuery);

  return targets.some((target) => {
    if (!target) return false;
    const normalizedTarget = normalizeBanglaText(target);
    const engTarget = toEnglishNumber(normalizedTarget);

    if (normalizedTarget.includes(normalizedQuery)) return true;
    if (engTarget.includes(engQuery)) return true;

    // টোকেনভিত্তিক ম্যাচ (প্রতিটি শব্দের মিল)
    const tokens = normalizedQuery.split(' ').filter(Boolean);
    if (tokens.length > 1) {
      return tokens.every((token) => normalizedTarget.includes(token) || engTarget.includes(token));
    }

    return false;
  });
}
