/**
 * Philippine Standard Time (Asia/Manila, UTC+8) Date Verification & Formatting Utility
 * Ensures all generated match blogs, NBA/PBA predictions, recaps, and Admin CMS posts
 * always use the accurate game date in Asia/Manila (PHT) and verify current Manila date.
 */

const manilaPartsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const manilaShortMonthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  month: 'short',
  day: 'numeric'
});

const manilaShortDateYearFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
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

const manilaTimeOnlyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
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

export interface AccurateGameDatePht {
  ymd: string; // e.g. '2026-10-17'
  monthDay: string; // e.g. 'Oct 17'
  shortDate: string; // e.g. 'Oct 17, 2026'
  fullDate: string; // e.g. 'October 17, 2026'
  timePht: string; // e.g. '7:30 PM PHT'
  shortDateTimePht: string; // e.g. 'Oct 17, 2026 · 7:30 PM PHT'
  isToday: boolean;
  isYesterday: boolean;
  isTomorrow: boolean;
  isFuture: boolean;
  isPast: boolean;
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
 * Formats any game's startTime / gameTimeUtc into its exact, accurate Philippine Time (Asia/Manila) date and time.
 */
export function formatGameDateLabelPht(isoOrDate?: string): AccurateGameDatePht {
  const snap = getCurrentManilaDateParts();
  const parsedMs = isoOrDate ? Date.parse(isoOrDate) : NaN;
  const targetDate = !Number.isNaN(parsedMs) ? new Date(parsedMs) : new Date();
  const extracted = extractYmd(targetDate);

  const monthDay = manilaShortMonthFormatter.format(targetDate);
  const shortDate = manilaShortDateYearFormatter.format(targetDate);
  const fullDate = manilaFullMonthFormatter.format(targetDate);
  const timePht = `${manilaTimeOnlyFormatter.format(targetDate)} PHT`;
  const shortDateTimePht = `${shortDate} · ${timePht}`;

  const isToday = extracted.ymd === snap.ymd;
  const isYesterday = extracted.ymd === snap.yesterdayYmd;
  const isTomorrow = extracted.ymd === snap.tomorrowYmd;
  const isFuture = extracted.ymd > snap.ymd;
  const isPast = extracted.ymd < snap.ymd;

  return {
    ymd: extracted.ymd,
    monthDay,
    shortDate,
    fullDate,
    timePht,
    shortDateTimePht,
    isToday,
    isYesterday,
    isTomorrow,
    isFuture,
    isPast
  };
}

/**
 * Computes an accurate publishedAt timestamp for a match blog based on the actual game date and status.
 * - Live games: stamped today in PHT.
 * - Finished games: stamped on the actual game day (~2.5 hours after tip-off, capped at now) so Oct 14/15/16/17 games carry their true game date.
 * - Scheduled games: preview published today in PHT (with the exact scheduled game date displayed in the title and body).
 */
export function computeAccurateMatchBlogPublishIso(
  startIso?: string,
  status?: string,
  index = 0
): string {
  const snap = getCurrentManilaDateParts();
  const nowMs = Date.now();
  const parsedStartMs = startIso ? Date.parse(startIso) : NaN;
  const normStatus = String(status || 'scheduled').toLowerCase();

  if (normStatus === 'live') {
    return new Date(Math.min(nowMs - index * 30 * 1000, snap.verifiedPublishAnchorMs - index * 30 * 1000)).toISOString();
  }

  if ((normStatus === 'finished' || normStatus === 'final') && !Number.isNaN(parsedStartMs)) {
    const gameDate = extractYmd(new Date(parsedStartMs));
    if (gameDate.ymd === snap.ymd) {
      // Finished today in Manila time
      const postGameMs = Math.min(nowMs - (index + 1) * 60 * 1000, parsedStartMs + 2.5 * 3600 * 1000);
      return new Date(Math.max(snap.startOfManilaDayUtcMs + 60 * 1000, postGameMs)).toISOString();
    }
    // Finished on an earlier date (e.g. Oct 16, Oct 15, Oct 14): stamp accurately on that game's completion time
    const historicalPostGameMs = Math.min(nowMs - 60 * 1000, parsedStartMs + 2.5 * 3600 * 1000);
    return new Date(historicalPostGameMs).toISOString();
  }

  // Scheduled / upcoming game preview: if scheduled for today, publish earlier today; if scheduled for tomorrow+, publish slightly earlier today
  const offsetMinutes = (!Number.isNaN(parsedStartMs) && extractYmd(new Date(parsedStartMs)).ymd === snap.ymd)
    ? 10 + index * 2
    : 35 + index * 2;
  return new Date(snap.verifiedPublishAnchorMs - offsetMinutes * 60 * 1000).toISOString();
}

/**
 * Ensures an article's publishedAt timestamp is valid and up-to-date in Philippine Time (Asia/Manila)
 * when publishing a new post from the Admin CMS.
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
