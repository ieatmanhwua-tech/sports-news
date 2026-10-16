const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000; // Asia/Manila is permanently UTC+8

function toManilaParts(isoUtcString: string) {
  const ms = Date.parse(isoUtcString);
  if (Number.isNaN(ms)) return null;
  const manilaDate = new Date(ms + MANILA_OFFSET_MS);
  const year = manilaDate.getUTCFullYear();
  const monthIdx = manilaDate.getUTCMonth();
  const day = manilaDate.getUTCDate();
  const hours24 = manilaDate.getUTCHours();
  const minutes = manilaDate.getUTCMinutes();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutesPadded = String(minutes).padStart(2, '0');

  return {
    year,
    month: MONTHS_SHORT[monthIdx] || 'Oct',
    day,
    hours12,
    minutesPadded,
    ampm
  };
}

export function useFormatters() {
  /**
   * Format ISO UTC string into deterministic Manila time string (SSR & Hydration safe)
   */
  function formatManilaTime(isoUtcString: string): string {
    if (!isoUtcString) return '';
    const p = toManilaParts(isoUtcString);
    if (!p) return isoUtcString;
    return `${p.month} ${p.day}, ${p.year}, ${p.hours12}:${p.minutesPadded} ${p.ampm} PHT`;
  }

  /**
   * Format date only in Manila time (SSR & Hydration safe)
   */
  function formatManilaDate(isoUtcString: string): string {
    if (!isoUtcString) return '';
    const p = toManilaParts(isoUtcString);
    if (!p) return isoUtcString;
    return `${p.month} ${p.day}, ${p.year}`;
  }

  /**
   * Deterministic Manila timestamp badge (SSR & Hydration safe — avoids Date.now() clock skew between server & client)
   */
  function formatRelativeTime(isoUtcString: string): string {
    if (!isoUtcString) return '';
    const p = toManilaParts(isoUtcString);
    if (!p) return isoUtcString;
    return `${p.month} ${p.day}, ${p.hours12}:${p.minutesPadded} ${p.ampm} PHT`;
  }

  return {
    formatManilaTime,
    formatManilaDate,
    formatRelativeTime
  };
}
