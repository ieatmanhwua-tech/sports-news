/**
 * Philippine Standard Time (Asia/Manila, UTC+8) Date Verification & Formatting Utility
 * Ensures all generated match blogs, NBA/PBA predictions, recaps, and Admin CMS posts
 * always use the verified current Manila date (e.g. October 17, 2026) and advance automatically.
 */

const manilaPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  monthShort: undefined
} as Intl.DateTimeFormatOptions);

const manilaShortMonthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  month: 'short',
  day: 'numeric'
});

const manilaFullMonthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
});

const manilaMonthOnlyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  month: 'long',
   day: 'numeric'
});

export interface ManilaDateSnapshot {
  year: string;
  month: string;
  day: string;
  ymd: string; // e.g. '2026-10-17'
  ymdCompact: string; // e.g. '20261017'
  shortLabel: string; // e.g. 'Oct 17'
  monthDayLabel: string; // e.g. 'October 17'
  fullLabel: string; // e.g. 'October 17, 2026'
  slugSuffix: string; // e.g. 'oct-17'
  yesterdayYmd: string; // e.g. '2026-10-16'
  yesterdayShortLabel: string; // e.g. 'Oct 16'
  twoDaysAgoYmd: string; // e.g. '2026-10-15'
  tomorrowYmd: string; // e.g. '2026-10-18'
  tomorrowShortLabel: string; // e.g. 'Oct 18'
  startOfManilaDayUtcMs: number;
  verifiedPublishAnchorMs: number;
  verifiedPublishIso: string;
}

function extractYmd(d: Date): { year: string; month: string; day: string; ymd: string; ymdCompact: string } {
  const parts = manilaPartsFormatter.formatToParts(d);
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '10';
  const day = parts.find(p => p.type === 'day')?.value || '17';
  return {
    year,
    month,
    day,
    ymd: `${year}-${month}-${day}`,
    ymdCompact: `${year}${month}${day}`
  };
}

export function getCurrentManilaDateParts(now: Date = new Date()): ManilaDateSnapshot {
  const curr = extractYmd(now);
  const yesterdayDate = new Date(now.getTime() - 24 * 3600 * 1000);
  const twoDaysAgoDate = new Date(now.getTime() - 48 * 3600 * 1000);
  const tomorrowDate = new Date(now.getTime() + 24 * 3600 * 1000);

  const yesterday = extractYmd(yesterdayDate);
  const twoDaysAgo = extractYmd(twoDaysAgoDate);
  const tomorrow = extractYmd(tomorrowDate);

  const shortLabel = manilaShortMonthFormatter.format(now);
  const yesterdayShortLabel = manilaShortMonthFormatter.format(yesterdayDate);
  const tomorrowShortLabel = manilaShortMonthFormatter.format(tomorrowDate);
  const fullLabel = manilaFullMonthFormatter.format(now);
  const monthDayLabel = manilaMonthOnlyFormatter.format(now);
  const slugSuffix = shortLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // Midnight in Asia/Manila (UTC+8) in UTC milliseconds
  const startOfManilaDayUtcMs = Date.parse(`${curr.ymd}T00:00:00+08:00`);
  // Anchor publish timestamp on today's Manila date, guaranteed <= now so SQL/filters always treat it as published
  const verifiedPublishAnchorMs = Math.max(
    startOfManilaDayUtcMs + 60 * 1000,
    Math.min(now.getTime() - 30 * 1000, startOfManilaDayUtcMs + 10 * 3600 * 1000)
  );

  return {
    year: curr.year,
    month: curr.month,
    day: curr.day,
    ymd: curr.ymd,
    ymdCompact: curr.ymdCompact,
    shortLabel,
    monthDayLabel,
    fullLabel,
    slugSuffix,
    yesterdayYmd: yesterday.ymd,
    yesterdayShortLabel,
    twoDaysAgoYmd: twoDaysAgo.ymd,
    tomorrowYmd: tomorrow.ymd,
    tomorrowShortLabel,
    startOfManilaDayUtcMs,
    verifiedPublishAnchorMs,
    verifiedPublishIso: new Date(verifiedPublishAnchorMs).toISOString()
  };
}

/**
 * Ensures an article's publishedAt timestamp is valid and up-to-date in Philippine Time (Asia/Manila)
 * when publishing a new post or syncing daily blogs.
 */
export function ensureFreshManilaPublishIso(rawIso?: string, forceTodayIfOlderThanDays = 1): string {
  const snap = getCurrentManilaDateParts();
  if (!rawIso) return new Date().toISOString();
  const parsed = Date.parse(rawIso);
  if (Number.isNaN(parsed)) return new Date().toISOString();

  const cutoffMs = snap.startOfManilaDayUtcMs - (forceTodayIfOlderThanDays - 1) * 24 * 3600 * 1000;
  if (parsed < cutoffMs) {
    return new Date().toISOString();
  }
  return new Date(parsed).toISOString();
}
