/**
 * Hijri (Islamic) Calendar Utilities
 * Converts between Gregorian and Hijri dates
 * Uses the Umm al-Qura calendar (official Saudi calendar)
 */

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

// Hijri month names in Arabic and English
export const HIJRI_MONTHS = {
  ar: [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ],
  en: [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
  ]
};

// Julian Day Number calculation helpers
function gregorianToJD(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + 
         Math.floor(30.6001 * (month + 1)) + 
         day + B - 1524.5;
}

function jdToHijri(jd: number): HijriDate {
  const L = Math.floor(jd - 1948439.5) + 10632;
  const N = Math.floor((L - 1) / 10631);
  const L2 = L - 10631 * N + 354;
  const J = Math.floor((10985 - L2) / 5316) * Math.floor((50 * L2) / 17719) + 
            Math.floor(L2 / 5670) * Math.floor((43 * L2) / 15238);
  const L3 = L2 - Math.floor((30 - J) / 15) * Math.floor((17719 * J) / 50) - 
             Math.floor(J / 16) * Math.floor((15238 * J) / 43) + 29;
  const month = Math.floor((24 * L3) / 709);
  const day = L3 - Math.floor((709 * month) / 24);
  const year = 30 * N + J - 30;
  
  return { year, month, day };
}

function hijriToJD(year: number, month: number, day: number): number {
  return Math.floor((11 * year + 3) / 30) + 
         354 * year + 
         30 * month - 
         Math.floor((month - 1) / 2) + 
         day + 1948440 - 385;
}

function jdToGregorian(jd: number): GregorianDate {
  const Z = Math.floor(jd + 0.5);
  const A = Math.floor((Z - 1867216.25) / 36524.25);
  const B = Z + 1 + A - Math.floor(A / 4);
  const C = B + 1524;
  const D = Math.floor((C - 122.1) / 365.25);
  const E = Math.floor(365.25 * D);
  const F = Math.floor((C - E) / 30.6001);
  
  const day = C - E - Math.floor(30.6001 * F);
  const month = F - (F > 13 ? 13 : 1);
  const year = D - (month > 2 ? 4716 : 4715);
  
  return { year, month, day };
}

/**
 * Convert Gregorian date to Hijri date
 */
export function gregorianToHijri(date: Date): HijriDate {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdToHijri(jd);
}

/**
 * Convert Hijri date to Gregorian date
 */
export function hijriToGregorian(hijri: HijriDate): Date {
  const jd = hijriToJD(hijri.year, hijri.month, hijri.day);
  const greg = jdToGregorian(jd);
  return new Date(greg.year, greg.month - 1, greg.day);
}

/**
 * Format Hijri date for display
 */
export function formatHijriDate(
  date: Date | HijriDate, 
  locale: 'ar' | 'en' = 'en',
  format: 'short' | 'long' | 'numeric' = 'long'
): string {
  const hijri = date instanceof Date ? gregorianToHijri(date) : date;
  const monthNames = HIJRI_MONTHS[locale];
  
  switch (format) {
    case 'short':
      return `${hijri.day}/${hijri.month}/${hijri.year}`;
    case 'numeric':
      return `${hijri.year}-${String(hijri.month).padStart(2, '0')}-${String(hijri.day).padStart(2, '0')}`;
    case 'long':
    default:
      return `${hijri.day} ${monthNames[hijri.month - 1]} ${hijri.year}`;
  }
}

/**
 * Get current Hijri date
 */
export function getCurrentHijriDate(): HijriDate {
  return gregorianToHijri(new Date());
}

/**
 * Format date with both Gregorian and Hijri
 */
export function formatDualDate(date: Date, locale: 'ar' | 'en' = 'en'): string {
  const gregorian = date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const hijri = formatHijriDate(date, locale, 'long');
  
  if (locale === 'ar') {
    return `${hijri} هـ (${gregorian} م)`;
  }
  return `${gregorian} (${hijri} H)`;
}

/**
 * Check if a Hijri year is a leap year (30 days in Dhu al-Hijjah)
 */
export function isHijriLeapYear(year: number): boolean {
  return (11 * year + 14) % 30 < 11;
}

/**
 * Get number of days in a Hijri month
 */
export function getHijriMonthDays(month: number, year: number): number {
  // Odd months have 30 days, even months have 29 days
  // Except in leap years, Dhu al-Hijjah (month 12) has 30 days
  if (month === 12 && isHijriLeapYear(year)) {
    return 30;
  }
  return month % 2 === 1 ? 30 : 29;
}

/**
 * Parse a Hijri date string (YYYY-MM-DD format)
 */
export function parseHijriDate(dateString: string): HijriDate | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10)
  };
}

/**
 * Add days to a Hijri date
 */
export function addHijriDays(hijri: HijriDate, days: number): HijriDate {
  const gregorian = hijriToGregorian(hijri);
  gregorian.setDate(gregorian.getDate() + days);
  return gregorianToHijri(gregorian);
}

/**
 * Get Hijri date range for current month
 */
export function getCurrentHijriMonth(): { start: HijriDate; end: HijriDate } {
  const current = getCurrentHijriDate();
  const start = { year: current.year, month: current.month, day: 1 };
  const daysInMonth = getHijriMonthDays(current.month, current.year);
  const end = { year: current.year, month: current.month, day: daysInMonth };
  return { start, end };
}
