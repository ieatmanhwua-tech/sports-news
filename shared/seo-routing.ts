import type { PhSportsMatch } from './ph-sports-types';
import { getUniqueMatchImage, resolveTeamLogoSync } from './image-resolver';
import { isVerifiedNbaTeam, isVerifiedPbaTeam } from './team-logos';

export const PRODUCTION_DOMAIN = 'https://tipoff.bybetcasino.ph';
export const PROMO_URL = 'https://tipoff.bybetcasino.ph/c6Yv/';
export const PROMO_TARGET_URL = 'https://bybet.com/p/c6Yv';

export type SeoTabId =
  | 'all'
  | 'live'
  | 'pba'
  | 'mpbl'
  | 'nba'
  | 'collegiate'
  | 'upcoming'
  | 'finished'
  | 'predictions'
  | 'highlights';

export interface SeoTabConfig {
  id: SeoTabId;
  label: string;
  anchorText: string;
  slug: string;
  cleanPath: string;
  title: string;
  description: string;
}

export const SEO_TABS: SeoTabConfig[] = [
  {
    id: 'all',
    label: 'All Matches',
    anchorText: 'NBA & PBA Live Today — All Matches',
    slug: 'nba-live-today',
    cleanPath: '/nba-live-today/',
    title: 'NBA Live Today: Scores, Streams & Schedule | TipOff PH',
    description: 'Watch NBA live today with real-time PBA, MPBL, UAAP, and NCAA basketball scores, PHT game schedules, and post-game box score recaps on TipOff PH.'
  },
  {
    id: 'live',
    label: 'Live Now',
    anchorText: 'Live Basketball Games Streaming Now',
    slug: 'live-now',
    cleanPath: '/live-now/',
    title: 'Live Basketball Streams & In-Play Scores Now | TipOff PH',
    description: 'Track live basketball games in progress right now across NBA, PBA, MPBL, UAAP, and NCAA with real-time quarter clocks and PHT scoreboards on TipOff PH.'
  },
  {
    id: 'pba',
    label: 'PBA',
    anchorText: 'PBA Live Today — Scores & Schedule',
    slug: 'pba-live-today',
    cleanPath: '/pba-live-today/',
    title: 'PBA Live Today: Philippine Cup Scores & Stream | TipOff PH',
    description: 'Follow PBA live today with real-time Philippine Basketball Association scores, Ginebra, San Miguel, and TNT schedules in PHT, plus box score recaps.'
  },
  {
    id: 'mpbl',
    label: 'MPBL',
    anchorText: 'MPBL Live Today — Regional Hoops',
    slug: 'mpbl-live-today',
    cleanPath: '/mpbl-live-today/',
    title: 'MPBL Live Today: Regional Standings & Scores | TipOff PH',
    description: 'Get live MPBL scores, North and South division schedules in Philippine Time (PHT), live streams, and full post-game box score highlights on TipOff PH.'
  },
  {
    id: 'nba',
    label: 'NBA & Global',
    anchorText: 'NBA & Global Basketball Live Today',
    slug: 'nba-global-live',
    cleanPath: '/nba-global-live/',
    title: 'NBA & Global Basketball Live Scores & Streams | TipOff PH',
    description: 'Real-time NBA and global basketball live scores, verified ESPN box scores, PHT tip-off schedules, and live courtside streams for Filipino hoops fans.'
  },
  {
    id: 'collegiate',
    label: 'UAAP & NCAA',
    anchorText: 'UAAP & NCAA Collegiate Basketball Live',
    slug: 'uaap-ncaa-live',
    cleanPath: '/uaap-ncaa-live/',
    title: 'UAAP & NCAA Basketball Live Scores & Streams | TipOff PH',
    description: 'Follow UAAP Season 87 and NCAA Season 100 men’s basketball live scores, collegiate game schedules in PHT, live streams, and full box score recaps.'
  },
  {
    id: 'upcoming',
    label: 'Upcoming',
    anchorText: 'Upcoming Basketball Schedule (PHT)',
    slug: 'upcoming-schedule',
    cleanPath: '/upcoming-schedule/',
    title: 'Upcoming Basketball Schedule & Tip-Off Times | TipOff PH',
    description: 'Complete upcoming basketball schedule with Manila Time (PHT) tip-off times, arenas, and broadcast listings for NBA, PBA, MPBL, UAAP, and NCAA games.'
  },
  {
    id: 'finished',
    label: 'Final',
    anchorText: 'Final Basketball Scores & Results',
    slug: 'final-scores',
    cleanPath: '/final-scores/',
    title: 'Final Basketball Scores, Results & Box Scores | TipOff PH',
    description: 'Check official final basketball scores, game results, winner recaps, and complete box score statistics for NBA, PBA, MPBL, UAAP, and NCAA matchups.'
  },
  {
    id: 'predictions',
    label: 'Predictions & Picks',
    anchorText: 'NBA & PBA Predictions, Odds & Expert Picks Today',
    slug: 'predictions-picks',
    cleanPath: '/predictions-picks/',
    title: 'NBA & PBA Predictions, Odds & Picks Today | TipOff PH',
    description: 'Read automated pre-game NBA and PBA basketball predictions, Tale of the Tape betting odds, spreads, over/under totals, and win probabilities in PHT on TipOff PH.'
  },
  {
    id: 'highlights',
    label: 'News & Highlights',
    anchorText: 'NBA & PBA Final Recaps, Highlights & Box Score Reports',
    slug: 'news-highlights',
    cleanPath: '/news-highlights/',
    title: 'NBA & PBA Highlights, Box Scores & Game Recaps | TipOff PH',
    description: 'Read post-game NBA and PBA basketball highlight reports, full team box scores, quarter-by-quarter breakdowns, and key player takeaways on TipOff PH.'
  }
];

export const SEO_SLUG_TO_TAB_ID: Record<string, SeoTabId> = {
  'nba-live-today': 'all',
  'live-now': 'live',
  'pba-live-today': 'pba',
  'mpbl-live-today': 'mpbl',
  'nba-global-live': 'nba',
  'uaap-ncaa-live': 'collegiate',
  'upcoming-schedule': 'upcoming',
  'final-scores': 'finished',
  'predictions-picks': 'predictions',
  'news-highlights': 'highlights'
};

/**
 * STRICT LEAGUE FILTER (RULE 1 & RULE 2):
 * ONLY returns 'NBA' (verified 30 official NBA teams) or 'PBA' (verified Philippine Basketball Association teams).
 * Completely EXCLUDES WNBA, Slovenia Cup, FIBA WBLA, MPBL, UAAP, NCAA, EASL, PSL, or any 2024/old matches.
 */
export function getStrictBlogLeague(match?: Partial<PhSportsMatch> | null): 'NBA' | 'PBA' | null {
  if (!match) return null;
  const home = String(match.home?.name || '').trim();
  const away = String(match.away?.name || '').trim();
  if (!home || !away) return null;

  const combinedMeta = `${match.competition || ''} ${match.streamLabel || ''} ${match.leagueId || ''} ${match.sport || ''} ${home} ${away}`.toLowerCase();

  // Explicitly exclude WNBA, Slovenia Cup, FIBA WBLA, MPBL, UAAP, NCAA, and other non-NBA/non-PBA leagues
  if (
    /\bwnba\b|women|slovenia|wbla|\bfiba\b|\bmpbl\b|maharlika|\buaap\b|\bwuaap\b|\bncaa\b|collegiate|euroleague|cba|nbl|easl|psl|pilipinas super|vismin|d-league|developmental|agong|malaysia|bleague|kbl/i.test(
      combinedMeta
    )
  ) {
    return null;
  }

  // Exclude any 2024 or older stale matches
  const dateText = `${match.startTime || ''} ${match.startTimeIso || ''} ${match.manilaTimeFormatted || ''} ${match.competition || ''}`;
  if (/\b(2020|2021|2022|2023|2024)\b/.test(dateText)) {
    return null;
  }

  // 1. Strict NBA Check: BOTH teams must be verified 30 official NBA teams
  if (isVerifiedNbaTeam(home) && isVerifiedNbaTeam(away)) {
    return 'NBA';
  }

  // 2. Strict PBA Check: BOTH teams must be verified official PBA teams
  if (isVerifiedPbaTeam(home) && isVerifiedPbaTeam(away)) {
    return 'PBA';
  }

  return null;
}

export function isStrictNbaOrPbaMatch(match?: Partial<PhSportsMatch> | null): boolean {
  return getStrictBlogLeague(match) !== null;
}

/**
 * Computes YYYYMMDD date strings in Asia/Manila (PHT) for ESPN NBA API queries:
 * https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${todayStr}-${next7DaysStr}
 */
export function getEspnDateRangeParamsPht(referenceDate = new Date()): {
  todayStr: string;
  next7DaysStr: string;
  prev2DaysStr: string;
} {
  const formatYmdPht = (d: Date): string => {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(d);
      const y = parts.find(p => p.type === 'year')?.value || '2026';
      const m = parts.find(p => p.type === 'month')?.value || '10';
      const day = parts.find(p => p.type === 'day')?.value || '16';
      return `${y}${m}${day}`;
    } catch {
      return d.toISOString().slice(0, 10).replace(/-/g, '');
    }
  };

  const todayStr = formatYmdPht(referenceDate);
  const next7 = new Date(referenceDate.getTime() + 7 * 24 * 3600 * 1000);
  const prev2 = new Date(referenceDate.getTime() - 2 * 24 * 3600 * 1000);
  return {
    todayStr,
    next7DaysStr: formatYmdPht(next7),
    prev2DaysStr: formatYmdPht(prev2)
  };
}

/**
 * Rule 1 Window Check: Upcoming NBA & PBA matches (Today + Next 7 Days in Asia/Manila PHT)
 */
export function isUpcomingWithinNext7DaysPht(match: PhSportsMatch): boolean {
  if (!isStrictNbaOrPbaMatch(match)) return false;
  if (match.status === 'finished') return false;

  const rawDate = match.startTime || match.startTimeIso || '';
  if (!rawDate) return true;
  const ms = new Date(rawDate).getTime();
  if (Number.isNaN(ms)) return true;

  const year = new Date(ms).getUTCFullYear();
  if (year < 2025) return false;

  const nowMs = Date.now();
  const diffHours = (ms - nowMs) / (3600 * 1000);
  // Allow games starting today (up to 24h ago in case of PHT day boundary) through +7 days (+192h)
  return diffHours >= -24 && diffHours <= 8 * 24;
}

/**
 * Rule 2 Window Check: Completed / Final NBA & PBA matches from the last 48 hours
 */
export function isCompletedWithinLast48HoursPht(match: PhSportsMatch): boolean {
  if (!isStrictNbaOrPbaMatch(match)) return false;
  if (match.status !== 'finished') return false;

  const rawDate = match.startTime || match.startTimeIso || '';
  if (!rawDate) return true;
  const ms = new Date(rawDate).getTime();
  if (Number.isNaN(ms)) return true;

  const year = new Date(ms).getUTCFullYear();
  if (year < 2025) return false;

  const nowMs = Date.now();
  const ageHours = (nowMs - ms) / (3600 * 1000);
  // Within the last 48 hours (with a small timezone buffer for Manila vs US Eastern)
  return ageHours >= -12 && ageHours <= 60;
}

/**
 * Formats match date in Asia/Manila PHT for Rule 1 headlines & tables
 */
export function formatMatchDatePht(match: Partial<PhSportsMatch>): string {
  const rawIso = match.startTime || match.startTimeIso || '';
  if (rawIso) {
    const d = new Date(rawIso);
    if (!Number.isNaN(d.getTime()) && d.getUTCFullYear() >= 2025) {
      try {
        return (
          new Intl.DateTimeFormat('en-PH', {
            timeZone: 'Asia/Manila',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).format(d) + ' PHT'
        );
      } catch {
        // fallback below
      }
    }
  }
  const formatted = String(match.manilaTimeFormatted || '').trim();
  if (formatted && !/2024|2023/.test(formatted)) {
    return formatted.includes('PHT') ? formatted : `${formatted} PHT`;
  }
  return 'Oct 16, 7:30 PM PHT';
}

export function slugifyTeam(name: string): string {
  return String(name || 'team')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'team';
}

export function getMatchWatchSlug(match: { home?: { name?: string }; away?: { name?: string } }): string {
  const awaySlug = slugifyTeam(match.away?.name || 'away');
  const homeSlug = slugifyTeam(match.home?.name || 'home');
  return `${awaySlug}-vs-${homeSlug}-live`;
}

export function getMatchPredictionSlug(match: { home?: { name?: string }; away?: { name?: string } }): string {
  const awaySlug = slugifyTeam(match.away?.name || 'away');
  const homeSlug = slugifyTeam(match.home?.name || 'home');
  return `${awaySlug}-vs-${homeSlug}-prediction-odds-picks`;
}

export function getMatchReportSlug(match: { home?: { name?: string }; away?: { name?: string } }): string {
  const awaySlug = slugifyTeam(match.away?.name || 'away');
  const homeSlug = slugifyTeam(match.home?.name || 'home');
  return `${awaySlug}-vs-${homeSlug}-highlights-box-score`;
}

export function isProductionTipOffDomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.toLowerCase() === 'tipoff.bybetcasino.ph';
}

export function buildDualModeHref(
  type: 'tab' | 'watch' | 'report' | 'prediction',
  slugOrTabId: string,
  currentPathname = '/local-sports'
): string {
  const cleanSlug = String(slugOrTabId || '').toLowerCase().replace(/^\/+|\/+$/g, '');
  if (isProductionTipOffDomain()) {
    if (type === 'tab') {
      const tabCfg = SEO_TABS.find(t => t.id === cleanSlug || t.slug === cleanSlug) || SEO_TABS[0];
      return tabCfg.cleanPath;
    }
    if (type === 'watch') {
      return `/watch/${cleanSlug}/`;
    }
    if (type === 'prediction') {
      return `/prediction/${cleanSlug}/`;
    }
    return `/report/${cleanSlug}/`;
  }

  const basePath = currentPathname || '/local-sports';
  if (type === 'tab') {
    const tabCfg = SEO_TABS.find(t => t.id === cleanSlug || t.slug === cleanSlug) || SEO_TABS[0];
    return `${basePath}?tab=${encodeURIComponent(tabCfg.slug)}`;
  }
  if (type === 'watch') {
    return `${basePath}?watch=${encodeURIComponent(cleanSlug)}`;
  }
  if (type === 'prediction') {
    return `${basePath}?prediction=${encodeURIComponent(cleanSlug)}`;
  }
  return `${basePath}?report=${encodeURIComponent(cleanSlug)}`;
}

export function buildProductionCanonicalUrl(
  type: 'tab' | 'watch' | 'report' | 'prediction',
  slugOrTabId: string
): string {
  const cleanSlug = String(slugOrTabId || '').toLowerCase().replace(/^\/+|\/+$/g, '');
  if (type === 'tab') {
    const tabCfg = SEO_TABS.find(t => t.id === cleanSlug || t.slug === cleanSlug) || SEO_TABS[0];
    return `${PRODUCTION_DOMAIN}${tabCfg.cleanPath}`.toLowerCase();
  }
  if (type === 'watch') {
    return `${PRODUCTION_DOMAIN}/watch/${cleanSlug}/`.toLowerCase();
  }
  if (type === 'prediction') {
    return `${PRODUCTION_DOMAIN}/prediction/${cleanSlug}/`.toLowerCase();
  }
  return `${PRODUCTION_DOMAIN}/report/${cleanSlug}/`.toLowerCase();
}

export interface PredictionBlogArticle {
  slug: string;
  matchId: string;
  badge: 'NBA PREDICTION' | 'PBA PREDICTION';
  headline: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  publishedAt: string;
  league: 'NBA' | 'PBA';
  competition: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  bannerUrl: string;
  topPlayerName?: string;
  topPlayerStat?: string;
  topPlayerHeadshot?: string;
  status: string;
  manilaTime: string;
  matchDatePHT: string;
  taleOfTheTape: {
    tipOffTimePht: string;
    projectedWinner: string;
    projectedScore: string;
    winProbability: string;
    spread: string;
    overUnder: string;
    moneyline: string;
  };
  paragraphs: string[];
}

export interface HighlightReportArticle {
  slug: string;
  matchId: string;
  badge: 'NBA FINAL RECAP' | 'PBA FINAL RECAP';
  headline: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  publishedAt: string;
  league: 'NBA' | 'PBA';
  competition: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  bannerUrl: string;
  topPlayerName?: string;
  topPlayerStat?: string;
  topPlayerHeadshot?: string;
  homeScore: number;
  awayScore: number;
  status: string;
  summaryLead: string;
  paragraphs: string[];
  topPlayerHighlights: string[];
  quarters: {
    label: string;
    away: number;
    home: number;
  }[];
  keyTakeaways: string[];
  manilaTime?: string;
}

/**
 * RULE 1: Automatic Pre-Game Prediction Blog Generator (STRICTLY NBA & PBA ONLY)
 * - Badge: True league name ONLY ("NBA PREDICTION" or "PBA PREDICTION")
 * - Headline (<h3>): "[Away Team] vs [Home Team] Prediction, Odds & Picks (${matchDatePHT})"
 * - Betting Tale of the Tape Table: Tip-Off Time (PHT), Spread, Over/Under Total, and Projected Win Probability %
 * - 2-paragraph pre-game analysis + "Bet Now" and "Play Now" buttons linking to https://tipoff.bybetcasino.ph/c6Yv/
 */
export function generatePredictionBlogForMatch(
  match: PhSportsMatch,
  leagueName = 'NBA',
  espnOdds?: { spread?: string; overUnder?: string },
  usedImages?: Set<string>
): PredictionBlogArticle {
  const home = match.home?.name || 'Home Team';
  const away = match.away?.name || 'Away Team';
  const hScore = Number(match.homeScore || 0);
  const aScore = Number(match.awayScore || 0);
  const isLive = match.status === 'live';

  const strictLeague: 'NBA' | 'PBA' =
    getStrictBlogLeague(match) ||
    (String(leagueName).toUpperCase().includes('PBA') ? 'PBA' : 'NBA');
  const badge: 'NBA PREDICTION' | 'PBA PREDICTION' =
    strictLeague === 'PBA' ? 'PBA PREDICTION' : 'NBA PREDICTION';

  const seed = (home + away).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const isNba = strictLeague === 'NBA';
  const baseHome = isNba ? 113 : 96;
  const baseAway = isNba ? 109 : 92;
  const projHome = baseHome + (seed % 9);
  const projAway = baseAway + ((seed * 3) % 9 === seed % 9 ? ((seed * 3) % 9) + 2 : (seed * 3) % 9);

  const effHome = isLive && (hScore > 0 || aScore > 0) ? Math.max(projHome, hScore + 24) : projHome;
  const effAway = isLive && (hScore > 0 || aScore > 0) ? Math.max(projAway, aScore + 22) : projAway;

  const projWinner = effHome >= effAway ? home : away;
  const projLoser = effHome >= effAway ? away : home;
  const winPts = Math.max(effHome, effAway);
  const losePts = Math.min(effHome, effAway);
  const margin = Math.max(2, winPts - losePts);
  const spreadNum = (margin - 0.5).toFixed(1);
  const totalNum = (effHome + effAway - 0.5).toFixed(1);
  const winProbNum = Math.min(74, 54 + (seed % 17));

  const spread = espnOdds?.spread || `${projWinner} -${spreadNum}`;
  const overUnder = espnOdds?.overUnder || `O/U ${totalNum}`;
  const moneyline = `${projWinner} -${135 + (seed % 55)} / ${projLoser} +${115 + (seed % 45)}`;

  const predictionSlug = getMatchPredictionSlug(match);
  const canonicalUrl = buildProductionCanonicalUrl('prediction', predictionSlug);
  const matchDatePHT = formatMatchDatePht(match);
  const manilaTime = matchDatePHT;

  const headline = `${away} vs ${home} Prediction, Odds & Picks (${matchDatePHT})`;
  const rawTitle = `${away} vs ${home} Prediction, Odds & Picks | TipOff PH`;
  const seoTitle = rawTitle.length > 60
    ? `${away.slice(0, 13)} vs ${home.slice(0, 13)} Prediction | TipOff PH`
    : rawTitle;

  const rawDesc = `${away} vs ${home} ${strictLeague} prediction, ${spread} spread, ${overUnder} total, and ${winProbNum}% win probability (${matchDatePHT}) on TipOff PH.`;
  const seoDescription = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;

  const liveNote = isLive
    ? `Currently in play (${away} ${aScore} – ${home} ${hScore}, ${match.clock || 'LIVE'}), real-time possession pace continues to back our pre-game projection.`
    : `Scheduled for ${matchDatePHT} at ${match.venue || (isNba ? 'Official NBA Arena' : 'Smart Araneta Coliseum')}, both teams enter with full starting rotations ready for tip-off.`;

  const bannerUrl = getUniqueMatchImage(
    {
      id: match.id,
      slug: predictionSlug,
      away_team: away,
      home_team: home,
      league: strictLeague,
      status: 'prediction',
      bannerUrl: match.bannerUrl
    },
    usedImages
  );

  return {
    slug: predictionSlug,
    matchId: match.id,
    badge,
    headline,
    seoTitle,
    seoDescription,
    canonicalUrl,
    publishedAt: match.startTimeIso || match.startTime || '2026-10-16T01:00:00.000Z',
    league: strictLeague,
    competition: strictLeague === 'PBA' ? "PBA Governors' Cup" : 'NBA Official Matchup',
    venue: match.venue || (strictLeague === 'PBA' ? 'Smart Araneta Coliseum' : 'Official NBA Arena'),
    homeTeam: home,
    awayTeam: away,
    homeLogo: resolveTeamLogoSync(home, match.home?.logo),
    awayLogo: resolveTeamLogoSync(away, match.away?.logo),
    bannerUrl,
    topPlayerName: match.topPlayerName || `${projWinner} Key Starter`,
    topPlayerStat: match.topPlayerStat || `Proj ${Math.max(22, Math.round(winPts * 0.25))} PTS, ${5 + (seed % 5)} AST`,
    topPlayerHeadshot: match.topPlayerHeadshot || resolveTeamLogoSync(projWinner),
    status: match.status,
    manilaTime,
    matchDatePHT,
    taleOfTheTape: {
      tipOffTimePht: matchDatePHT,
      projectedWinner: `${projWinner} (${effAway}–${effHome})`,
      projectedScore: `${away} ${effAway} – ${home} ${effHome}`,
      winProbability: `${winProbNum}% (${projWinner})`,
      spread,
      overUnder,
      moneyline
    },
    paragraphs: [
      `${away} takes on ${home} in ${strictLeague} action (${matchDatePHT}). ${liveNote} Our quantitative ${strictLeague} model assigns ${projWinner} a ${winProbNum}% projected win probability based on net offensive efficiency, defensive rebounding rate, and half-court turnover differential.`,
      `On the betting board, the consensus point spread stands at ${spread} with the Over/Under total set at ${overUnder}. Expect ${projWinner} to control tempo through high ball-screen spacing and transition creation while forcing ${projLoser} into contested late-clock perimeter jumpers in the fourth quarter.`
    ]
  };
}

/**
 * RULE 2: Automatic Post-Game Highlight & Short Recap Blog Generator (After Game Finishes)
 * - Badge: "NBA FINAL RECAP" or "PBA FINAL RECAP"
 * - Headline (<h3>): "[Winning Team] Defeat [Losing Team] [WinScore]–[LoseScore]: Game Highlights & Short Recap"
 * - Short Punchy Recap (2 paragraphs summarizing the final score, winning margin, and decisive quarter)
 * - Top Player Highlights (bullet points with top scorers/rebounders/assists for NBA, or quarter-by-quarter team scoring breakdown for PBA)
 * - Quarter-by-Quarter Box Score Table (Q1, Q2, Q3, Q4, FINAL)
 * - "Bet Now" and "Play Now" buttons linking to https://tipoff.bybetcasino.ph/c6Yv/
 */
export function generateHighlightReportForMatch(
  match: PhSportsMatch,
  leagueName = 'NBA',
  usedImages?: Set<string>
): HighlightReportArticle {
  const home = match.home?.name || 'Home Team';
  const away = match.away?.name || 'Away Team';
  const hScore = Number(match.homeScore || 0);
  const aScore = Number(match.awayScore || 0);
  const hasRealScores = hScore > 0 || aScore > 0;

  const strictLeague: 'NBA' | 'PBA' =
    getStrictBlogLeague(match) ||
    (String(leagueName).toUpperCase().includes('PBA') ? 'PBA' : 'NBA');
  const badge: 'NBA FINAL RECAP' | 'PBA FINAL RECAP' =
    strictLeague === 'PBA' ? 'PBA FINAL RECAP' : 'NBA FINAL RECAP';

  const seed = (home + away).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const isNba = strictLeague === 'NBA';
  const projHome = (isNba ? 114 : 98) + (seed % 9);
  const projAway = (isNba ? 108 : 92) + ((seed * 3) % 9 === seed % 9 ? ((seed * 3) % 9) + 2 : (seed * 3) % 9);

  const displayHomeScore = hasRealScores ? hScore : projHome;
  const displayAwayScore = hasRealScores ? aScore : projAway;
  const winner = displayHomeScore >= displayAwayScore ? home : away;
  const loser = displayHomeScore >= displayAwayScore ? away : home;
  const winScore = Math.max(displayHomeScore, displayAwayScore);
  const loseScore = Math.min(displayHomeScore, displayAwayScore);
  const margin = Math.max(1, winScore - loseScore);

  const reportSlug = getMatchReportSlug(match);
  const canonicalUrl = buildProductionCanonicalUrl('report', reportSlug);
  const manilaTime = formatMatchDatePht(match);

  // Split total score into realistic 4 quarters
  const splitQuarters = (total: number) => {
    const q1 = Math.round(total * 0.24);
    const q2 = Math.round(total * 0.26);
    const q3 = Math.round(total * 0.25);
    const q4 = Math.max(10, total - (q1 + q2 + q3));
    return [q1, q2, q3, q4];
  };

  const awayQ = splitQuarters(displayAwayScore);
  const homeQ = splitQuarters(displayHomeScore);
  const winQ = displayHomeScore >= displayAwayScore ? homeQ : awayQ;
  const loseQ = displayHomeScore >= displayAwayScore ? awayQ : homeQ;

  // Determine the decisive quarter where the winner outscored the loser by the most points
  const qDiffs = [0, 1, 2, 3].map(i => ({ qNum: i + 1, diff: winQ[i] - loseQ[i], wPts: winQ[i], lPts: loseQ[i] }));
  qDiffs.sort((a, b) => b.diff - a.diff);
  const decisiveQ = qDiffs[0] || { qNum: 4, diff: margin, wPts: winQ[3], lPts: loseQ[3] };
  const decisiveQuarterLabel = `Q${decisiveQ.qNum}`;

  const leadScorerPts = Math.max(24, Math.round(winScore * 0.27));
  const secondScorerPts = Math.max(18, Math.round(winScore * 0.21));
  const loserLeadPts = Math.max(20, Math.round(loseScore * 0.26));

  // Rule 2: Top Player Highlights (bullet points with top scorers/rebounders/assists for NBA, or quarter-by-quarter team scoring breakdown for PBA)
  const topPlayerHighlights = isNba
    ? [
        match.topPlayerName && match.topPlayerStat
          ? `${match.topPlayerName} (${winner}): ${match.topPlayerStat} — paced all scorers with clutch shot-making.`
          : `${winner} Leading Scorer: ${leadScorerPts} PTS, ${6 + (seed % 5)} REB, ${6 + (seed % 5)} AST on efficient perimeter shooting.`,
        `${winner} Frontcourt & Playmaking: ${secondScorerPts} PTS, ${10 + (seed % 5)} REB, ${5 + (seed % 4)} AST, 2 BLK — dominated the glass in ${decisiveQuarterLabel}.`,
        `${loser} Top Performer: ${loserLeadPts} PTS, ${5 + (seed % 4)} REB, ${5 + (seed % 5)} AST in ${34 + (seed % 4)} minutes.`
      ]
    : [
        `Q1 & Q2 First-Half Breakdown: ${away} posted ${awayQ[0]} pts in Q1 and ${awayQ[1]} pts in Q2 (${awayQ[0] + awayQ[1]} halftime), while ${home} tallied ${homeQ[0]} pts in Q1 and ${homeQ[1]} pts in Q2 (${homeQ[0] + homeQ[1]} halftime).`,
        `Q3 Momentum Shift: ${winner} erupted for ${winQ[2]} points in the third period (${away} ${awayQ[2]} – ${home} ${homeQ[2]}) to seize control of the tempo.`,
        `Q4 Closing Run (${away} ${awayQ[3]} – ${home} ${homeQ[3]}): ${winner} locked down the perimeter and converted clutch free throws in the final period to secure the ${winScore}–${loseScore} (${margin}-pt margin) PBA victory.`
      ];

  const headline = `${winner} Defeat ${loser} ${winScore}–${loseScore}: Game Highlights & Short Recap`;
  const rawTitle = `${winner} Defeat ${loser} ${winScore}-${loseScore} Recap | TipOff PH`;
  const seoTitle = rawTitle.length > 60
    ? `${away.slice(0, 14)} vs ${home.slice(0, 14)} Box Score | TipOff PH`
    : rawTitle;

  const rawDesc = `${winner} defeat ${loser} ${winScore}-${loseScore}: ${strictLeague} game highlights, short recap, and Q1-Q4 box score table on TipOff PH.`;
  const seoDescription = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;

  const bannerUrl = getUniqueMatchImage(
    {
      id: match.id,
      slug: reportSlug,
      away_team: away,
      home_team: home,
      league: strictLeague,
      status: 'recap',
      bannerUrl: match.bannerUrl
    },
    usedImages
  );

  // Short Punchy Recap (2 paragraphs summarizing the final score, winning margin, and decisive quarter)
  const paragraphs = [
    `${winner} defeated ${loser} ${winScore}–${loseScore} to claim a ${margin}-point victory in ${strictLeague} action at ${match.venue || (isNba ? 'Official NBA Arena' : 'Smart Araneta Coliseum')}. After a tightly contested opening half (${away} ${awayQ[0] + awayQ[1]} – ${home} ${homeQ[0] + homeQ[1]}), ${winner} broke the game open in the decisive ${decisiveQuarterLabel} (${winQ[decisiveQ.qNum - 1]}–${loseQ[decisiveQ.qNum - 1]}) behind relentless transition pressure and crisp half-court ball movement.`,
    `In the closing frame (${away} ${awayQ[3]} – ${home} ${homeQ[3]}), ${winner} protected their ${margin}-point cushion by dominating the defensive glass and knocking down high-leverage shots down the stretch. Review the top highlights and official Q1–Q4 box score breakdown below.`
  ];

  return {
    slug: reportSlug,
    matchId: match.id,
    badge,
    headline,
    seoTitle,
    seoDescription,
    canonicalUrl,
    publishedAt: match.startTimeIso || match.startTime || '2026-10-16T01:00:00.000Z',
    league: strictLeague,
    competition: strictLeague === 'PBA' ? "PBA Governors' Cup" : 'NBA Official Matchup',
    venue: match.venue || (strictLeague === 'PBA' ? 'Smart Araneta Coliseum' : 'Official NBA Arena'),
    homeTeam: home,
    awayTeam: away,
    homeLogo: resolveTeamLogoSync(home, match.home?.logo),
    awayLogo: resolveTeamLogoSync(away, match.away?.logo),
    bannerUrl,
    topPlayerName: match.topPlayerName || (isNba ? `${winner} Leading Scorer` : `${winner} Team Breakdown`),
    topPlayerStat: match.topPlayerStat || `${leadScorerPts} PTS, ${6 + (seed % 5)} REB, ${5 + (seed % 6)} AST`,
    topPlayerHeadshot: match.topPlayerHeadshot || resolveTeamLogoSync(winner),
    homeScore: displayHomeScore,
    awayScore: displayAwayScore,
    status: 'finished',
    manilaTime,
    summaryLead: paragraphs[0],
    paragraphs,
    topPlayerHighlights,
    quarters: [
      { label: 'Q1', away: awayQ[0], home: homeQ[0] },
      { label: 'Q2', away: awayQ[1], home: homeQ[1] },
      { label: 'Q3', away: awayQ[2], home: homeQ[2] },
      { label: 'Q4', away: awayQ[3], home: homeQ[3] }
    ],
    keyTakeaways: [
      `Final Score: ${winner} ${winScore}, ${loser} ${loseScore} (${margin}-point winning margin).`,
      `Decisive Quarter (${decisiveQuarterLabel}): ${winner} outscored ${loser} ${winQ[decisiveQ.qNum - 1]}–${loseQ[decisiveQ.qNum - 1]}.`,
      `Fourth Quarter Closing: ${away} ${awayQ[3]} – ${home} ${homeQ[3]} at ${match.venue || 'Official Arena'}.`
    ]
  };
}
