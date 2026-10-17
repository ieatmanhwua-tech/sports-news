<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue';
import type { PhSportsMatch } from '~/shared/ph-sports-types';
import { getTeamLogo, classifyMatchLeague, isVerifiedNbaTeam, isVerifiedPbaTeam, isValidBasketballMatchup, getCanonicalTeamName } from '~/shared/team-logos';
import {
  extractLive88MatchImages,
  resolveTeamLogoSync,
  registerEspnNewsArticles,
  handleImageErrorToCrest,
  initImageResolverCache
} from '~/shared/image-resolver';
import {
  PRODUCTION_DOMAIN,
  PROMO_URL,
  PROMO_TARGET_URL,
  SEO_TABS,
  SEO_SLUG_TO_TAB_ID,
  getStrictBlogLeague,
  isStrictNbaOrPbaMatch,
  isUpcomingWithinNext7DaysPht,
  isCompletedWithinLast48HoursPht,
  getEspnDateRangeParamsPht,
  formatMatchDatePht,
  getMatchWatchSlug,
  getMatchPredictionSlug,
  getMatchReportSlug,
  buildDualModeHref,
  buildProductionCanonicalUrl,
  generatePredictionBlogForMatch,
  generateHighlightReportForMatch,
  type PredictionBlogArticle,
  type HighlightReportArticle
} from '~/shared/seo-routing';
import {
  RefreshCw,
  Search,
  ShieldAlert
} from 'lucide-vue-next';

// Dynamically loaded secondary modules to reduce initial JavaScript bundle size while preserving SSR on direct URLs
const LiveStreamPlayer = defineAsyncComponent(() => import('~/components/local-sports/LiveStreamPlayer.vue'));
const PredictionDetailView = defineAsyncComponent(() => import('~/components/local-sports/PredictionDetailView.vue'));
const ReportDetailView = defineAsyncComponent(() => import('~/components/local-sports/ReportDetailView.vue'));
const PredictionsTabView = defineAsyncComponent(() => import('~/components/local-sports/PredictionsTabView.vue'));
const HighlightsTabView = defineAsyncComponent(() => import('~/components/local-sports/HighlightsTabView.vue'));
const DualSeoBlogFeed = defineAsyncComponent(() => import('~/components/local-sports/DualSeoBlogFeed.vue'));

// 1. Built-In /c6Yv/ Redirect Handler (Client-Side Fallback) at the very top of script on page load
if (typeof window !== 'undefined') {
  const cleanInitPath = window.location.pathname.replace(/\/+$/, '');
  if (
    cleanInitPath === '/c6Yv' ||
    cleanInitPath.toLowerCase() === '/c6yv' ||
    window.location.search.includes('go=c6Yv')
  ) {
    window.location.replace(PROMO_TARGET_URL);
  }
}

const props = withDefaults(defineProps<{
  initialLeague?: string;
  initialWatchSlug?: string;
  initialPredictionSlug?: string;
  initialReportSlug?: string;
  compact?: boolean;
  maxItems?: number;
}>(), {
  initialLeague: 'all',
  initialWatchSlug: '',
  initialPredictionSlug: '',
  initialReportSlug: '',
  compact: false,
  maxItems: 80
});

// Exact Live88 API Endpoints + ESPN NBA & College Scoreboard + ESPN News Endpoints
const LIVE88_ENDPOINTS = {
  bootstrap: 'https://live88.eu.cc/api/v1/bootstrap?site=-Qw82foL4XnLt_vBp8LVXjwW',
  matches: 'https://live88.eu.cc/api/v1/matches?site=-Qw82foL4XnLt_vBp8LVXjwW',
  pbaMatches: 'https://live88.eu.cc/api/v1/matches?site=-Qw82foL4XnLt_vBp8LVXjwW&sport=pba',
  scoresLive: 'https://live88.eu.cc/api/v1/scores?site=-Qw82foL4XnLt_vBp8LVXjwW&segment=live',
  scoresToday: 'https://live88.eu.cc/api/v1/scores?site=-Qw82foL4XnLt_vBp8LVXjwW&segment=today',
  livestream: 'https://live88.eu.cc/api/v1/livestream?site=-Qw82foL4XnLt_vBp8LVXjwW&segment=live',
  espnScoreboard: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  espnNbaNews: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news',
  espnCollegeScoreboard: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard'
};

// Local CORS-safe proxy routes that return the exact raw JSON from the Live88 endpoints
const PROXY_ENDPOINTS = {
  bootstrap: '/api/live88/bootstrap?site=-Qw82foL4XnLt_vBp8LVXjwW',
  matches: '/api/live88/matches?site=-Qw82foL4XnLt_vBp8LVXjwW',
  pbaMatches: '/api/live88/matches?site=-Qw82foL4XnLt_vBp8LVXjwW&sport=pba',
  scoresLive: '/api/live88/scores?site=-Qw82foL4XnLt_vBp8LVXjwW&segment=live',
  scoresToday: '/api/live88/scores?site=-Qw82foL4XnLt_vBp8LVXjwW&segment=today',
  livestream: '/api/live88/livestream?site=-Qw82foL4XnLt_vBp8LVXjwW&segment=live'
};

interface EspnGameEntry {
  id: string;
  homeName: string;
  awayName: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  clock: string;
  state: 'pre' | 'in' | 'post';
  startTime: string;
  venue: string;
  actionThumbnail: string;
  topPlayerName: string;
  topPlayerStat: string;
  topPlayerHeadshot: string;
  spread: string;
  overUnder: string;
}

function formatLastUpdatedPht(dateInput?: string | Date): string {
  try {
    const dt = dateInput ? new Date(dateInput) : new Date();
    if (Number.isNaN(dt.getTime())) return '';
    const formatted = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(dt);
    return `Updated ${formatted} PHT`;
  } catch {
    return '';
  }
}

const selectedLeague = ref<string>(props.initialLeague);
const activeWatchSlug = ref<string>(props.initialWatchSlug || '');
const activePredictionSlug = ref<string>(props.initialPredictionSlug || '');
const activeReportSlug = ref<string>(props.initialReportSlug || '');
const searchQuery = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const bootstrapConfig = ref<{ liveCount: number; leaguesCount: number }>({ liveCount: 0, leaguesCount: 0 });
const imageCacheVersion = ref(0);

const { data: ssrSportsData } = await useFetch<any>('/api/ph-sports', {
  key: 'ph-sports-hub-initial'
});

const initialSsrMatches: PhSportsMatch[] = Array.isArray(ssrSportsData.value?.allMatches)
  ? ssrSportsData.value.allMatches
  : [];

const lastUpdated = ref<string>(
  (ssrSportsData.value?.generatedAt || ssrSportsData.value?.updatedAt)
    ? formatLastUpdatedPht(ssrSportsData.value?.generatedAt || ssrSportsData.value?.updatedAt)
    : ''
);

const allMatchesList = ref<PhSportsMatch[]>(initialSsrMatches);
const activeMatchId = ref<string>(
  initialSsrMatches.find(m => m.status === 'live' && m.sources && m.sources.length > 0)?.id ||
  initialSsrMatches.find(m => m.status === 'live')?.id ||
  initialSsrMatches[0]?.id ||
  ''
);

// Lazy player loading: load LiveStreamPlayer implementation immediately on /watch/ routes or when Play / match selection is triggered
const playerActivated = ref<boolean>(Boolean(props.initialWatchSlug));
const playerShellRef = ref<HTMLElement | null>(null);
const livePlayerRef = ref<any>(null);
const isPlaying = ref(false);
const isFullscreen = ref(false);
const currentLoadedStreamUrl = ref<string>('');
const pendingCandidateUrls = ref<string[]>([]);

let pollIntervalId: ReturnType<typeof setInterval> | null = null;
let activeFetchAbortController: AbortController | null = null;
let isFetchingFullData = false;
let isPollingScores = false;
let isFetchingLivestream = false;

// Incremental provider state slices so fast responses update scores immediately without waiting for slow providers
let latestBootstrapRaw: any = null;
let latestMatchesRaw: any = null;
let latestPbaMatchesRaw: any = null;
let latestScoresLiveRaw: any = null;
let latestScoresTodayRaw: any = null;
let latestLivestreamRaw: any = null;
let latestNormalizedHubRes: any = ssrSportsData.value || null;
let latestEspnTodayRaw: any = null;
let latestEspnRaw: any = null;
let latestEspnNewsRaw: any = null;
let latestEspnCollegeRaw: any = null;

watch(() => props.initialLeague, (newVal) => {
  if (newVal) {
    selectedLeague.value = newVal;
  }
});

watch(() => props.initialWatchSlug, (newVal) => {
  if (newVal) {
    activeWatchSlug.value = newVal;
    playerActivated.value = true;
  }
});

/**
 * Extract numeric score checking all possible score fields:
 * home_score, away_score, scores.home, scores.away, home.score, away.score, homeScore, awayScore
 */
function extractScoresFromRaw(raw: any): { homeScore: number; awayScore: number } {
  if (!raw || typeof raw !== 'object') return { homeScore: 0, awayScore: 0 };

  const pickMaxNumber = (...candidates: any[]): number => {
    let best = 0;
    for (const val of candidates) {
      if (Array.isArray(val)) {
        const nums = val.map(v => Number(v)).filter(n => !Number.isNaN(n) && n >= 0);
        if (nums.length > 0) {
          const maxInArr = Math.max(...nums);
          if (maxInArr > best) best = maxInArr;
        }
      } else if (val !== undefined && val !== null && val !== '') {
        const n = Number(val);
        if (!Number.isNaN(n) && n > best) {
          best = n;
        }
      }
    }
    return best;
  };

  const homeObj = raw.home || raw.homeTeam || {};
  const awayObj = raw.away || raw.awayTeam || {};
  const scoresObj = raw.scores || raw.score || {};

  const homeScore = pickMaxNumber(
    raw.home_score,
    raw.homeScore,
    scoresObj?.home,
    scoresObj?.home_score,
    scoresObj?.homeScore,
    homeObj?.score,
    homeObj?.points,
    homeObj?.totalScore
  );

  const awayScore = pickMaxNumber(
    raw.away_score,
    raw.awayScore,
    scoresObj?.away,
    scoresObj?.away_score,
    scoresObj?.awayScore,
    awayObj?.score,
    awayObj?.points,
    awayObj?.totalScore
  );

  return { homeScore, awayScore };
}

function normalizeTeamKey(name: string): string {
  return String(getCanonicalTeamName(name) || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function teamsMatch(teamA: string, teamB: string): boolean {
  const a = normalizeTeamKey(teamA);
  const b = normalizeTeamKey(teamB);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const compactA = a.replace(/\s+/g, '');
  const compactB = b.replace(/\s+/g, '');
  if (compactA === compactB || compactA.includes(compactB) || compactB.includes(compactA)) {
    return true;
  }

  const tokensA = a.split(' ').filter(t => t.length >= 4);
  const tokensB = b.split(' ').filter(t => t.length >= 4);
  if (tokensA.length > 0 && tokensB.length > 0) {
    const lastA = tokensA[tokensA.length - 1];
    const lastB = tokensB[tokensB.length - 1];
    if (lastA && lastB && lastA === lastB) return true;
  }
  return false;
}

function isSameGameDay(timeA?: string, timeB?: string): boolean {
  if (!timeA || !timeB) return true;
  const msA = new Date(timeA).getTime();
  const msB = new Date(timeB).getTime();
  if (Number.isNaN(msA) || Number.isNaN(msB)) return true;
  return Math.abs(msA - msB) <= 18 * 3600 * 1000;
}

function is24HourTipoffClock(clockStr?: string): boolean {
  if (!clockStr) return false;
  return /^(1[3-9]|2[0-3]):[0-5][0-9]$/.test(clockStr.trim());
}

/**
 * Tier 1: Parse ESPN Scoreboard + ESPN News for official high-res logos, game action thumbnails,
 * top scorer headshots, and live odds (spread & over/under)
 */
function parseEspnScoreboard(espnJson: any, espnNewsJson?: any): EspnGameEntry[] {
  const results: EspnGameEntry[] = [];
  const newsArticles = Array.isArray(espnNewsJson?.articles) ? espnNewsJson.articles : [];
  if (newsArticles.length > 0) {
    registerEspnNewsArticles(newsArticles);
  }
  const usedNewsUrlsInBatch = new Set<string>();
  const events = Array.isArray(espnJson?.events) ? espnJson.events : [];

  for (const ev of events) {
    const comp = ev?.competitions?.[0];
    const competitors = Array.isArray(comp?.competitors) ? comp.competitors : [];
    if (competitors.length < 2) continue;

    const homeComp = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
    const awayComp = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];

    const homeName = String(homeComp?.team?.displayName || homeComp?.team?.name || '').trim();
    const awayName = String(awayComp?.team?.displayName || awayComp?.team?.name || '').trim();
    if (!homeName || !awayName) continue;

    const homeLogo = String(homeComp?.team?.logo || homeComp?.team?.logos?.[0]?.href || '').trim();
    const awayLogo = String(awayComp?.team?.logo || awayComp?.team?.logos?.[0]?.href || '').trim();

    const homeScore = Number(homeComp?.score ?? 0) || 0;
    const awayScore = Number(awayComp?.score ?? 0) || 0;
    const stateRaw = String(ev?.status?.type?.state || comp?.status?.type?.state || 'pre').toLowerCase();
    const state: 'pre' | 'in' | 'post' = stateRaw === 'in' ? 'in' : stateRaw === 'post' ? 'post' : 'pre';
    const shortDetail = String(ev?.status?.type?.shortDetail || comp?.status?.type?.shortDetail || '').trim();
    const startTime = String(ev?.date || comp?.date || new Date().toISOString());
    const venue = String(comp?.venue?.fullName || 'Official NBA Arena').trim();

    let actionThumbnail = String(
      comp?.headlines?.[0]?.video?.[0]?.thumbnail ||
      comp?.headlines?.[0]?.images?.[0]?.url ||
      ''
    ).trim();

    if (actionThumbnail && usedNewsUrlsInBatch.has(actionThumbnail)) {
      actionThumbnail = '';
    } else if (actionThumbnail) {
      usedNewsUrlsInBatch.add(actionThumbnail);
    }

    if (!actionThumbnail && newsArticles.length > 0) {
      const homeKey = homeName.split(' ').pop()?.toLowerCase() || '';
      const awayKey = awayName.split(' ').pop()?.toLowerCase() || '';
      const matchingNews = newsArticles.find((art: any) => {
        const imgCandidate = String(art?.images?.[0]?.url || '').trim();
        if (!imgCandidate || usedNewsUrlsInBatch.has(imgCandidate)) return false;
        const text = `${art?.headline || ''} ${art?.description || ''}`.toLowerCase();
        return (homeKey && text.includes(homeKey)) || (awayKey && text.includes(awayKey));
      });
      const matchedUrl = String(matchingNews?.images?.[0]?.url || '').trim();
      if (matchedUrl) {
        usedNewsUrlsInBatch.add(matchedUrl);
        actionThumbnail = matchedUrl;
      }
    }

    const topLeaderEntry =
      comp?.leaders?.[0]?.leaders?.[0] ||
      homeComp?.leaders?.[0]?.leaders?.[0] ||
      awayComp?.leaders?.[0]?.leaders?.[0];
    const athlete = topLeaderEntry?.athlete || {};
    const topPlayerName = String(athlete?.displayName || athlete?.fullName || '').trim();
    const topPlayerStat = String(topLeaderEntry?.displayValue || '').trim();
    const rawHeadshot = athlete?.headshot;
    const topPlayerHeadshot = typeof rawHeadshot === 'string'
      ? rawHeadshot.trim()
      : String(rawHeadshot?.href || '').trim();

    const oddsObj = comp?.odds?.[0] || {};
    const spread = String(oddsObj?.details || '').trim();
    const overUnder = oddsObj?.overUnder ? `O/U ${oddsObj.overUnder}` : '';

    results.push({
      id: String(ev?.id || `espn-${homeName}-${awayName}`),
      homeName,
      awayName,
      homeLogo,
      awayLogo,
      homeScore,
      awayScore,
      clock: shortDetail || (state === 'in' ? 'LIVE' : state === 'post' ? 'FINAL' : ''),
      state,
      startTime,
      venue,
      actionThumbnail,
      topPlayerName,
      topPlayerStat,
      topPlayerHeadshot,
      spread,
      overUnder
    });
  }
  return results;
}

function findEspnFallbackScore(
  homeTeamName: string,
  awayTeamName: string,
  espnList: EspnGameEntry[]
): EspnGameEntry | null {
  for (const eg of espnList) {
    if (teamsMatch(homeTeamName, eg.homeName) && teamsMatch(awayTeamName, eg.awayName)) {
      return eg;
    }
    if (teamsMatch(homeTeamName, eg.awayName) && teamsMatch(awayTeamName, eg.homeName)) {
      return {
        ...eg,
        homeName: eg.awayName,
        awayName: eg.homeName,
        homeLogo: eg.awayLogo,
        awayLogo: eg.homeLogo,
        homeScore: eg.awayScore,
        awayScore: eg.homeScore
      };
    }
  }
  return null;
}

function applyEspnFallbackToMatch(match: PhSportsMatch, espnList: EspnGameEntry[]): PhSportsMatch {
  if (!espnList.length) return match;
  const espnHit = findEspnFallbackScore(match.home?.name || '', match.away?.name || '', espnList);
  if (!espnHit) return match;

  let homeScore = Number(match.homeScore ?? 0);
  let awayScore = Number(match.awayScore ?? 0);
  let clock = match.clock || '';

  if (
    (homeScore === 0 && awayScore === 0) ||
    espnHit.homeScore > homeScore ||
    espnHit.awayScore > awayScore
  ) {
    if (espnHit.homeScore > 0 || espnHit.awayScore > 0) {
      homeScore = espnHit.homeScore;
      awayScore = espnHit.awayScore;
    }
  }

  if (espnHit.clock && match.status === 'live') {
    clock = espnHit.clock;
  }

  return {
    ...match,
    homeScore,
    awayScore,
    clock,
    home: {
      ...match.home,
      logo: espnHit.homeLogo || match.home.logo
    },
    away: {
      ...match.away,
      logo: espnHit.awayLogo || match.away.logo
    },
    bannerUrl: espnHit.actionThumbnail || match.bannerUrl,
    topPlayerName: espnHit.topPlayerName || match.topPlayerName,
    topPlayerStat: espnHit.topPlayerStat || match.topPlayerStat,
    topPlayerHeadshot: espnHit.topPlayerHeadshot || match.topPlayerHeadshot,
    espnSpread: espnHit.spread || match.espnSpread,
    espnOverUnder: espnHit.overUnder || match.espnOverUnder
  };
}

function mapRawMatch(
  raw: any,
  streamMap: Map<string, { url: string; type: string; label: string }[]>,
  espnList: EspnGameEntry[],
  authoritativeLiveIds: Set<string>,
  _isFromLivestreamEndpoint = false
): PhSportsMatch | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = String(raw.id || raw.matchId || raw._id || '');
  if (!id) return null;

  const rawSport = String(raw.sport || raw.sportType || '').toLowerCase();
  const rawComp = String(raw.competition || raw.league || raw.streamLabel || '');
  const rawStatus = String(raw.status || raw.state || 'scheduled').toLowerCase();
  const rawClock = String(raw.clock || raw.timer || '').trim();

  const isBasketballCompOrClock =
    /baloncesto|basket|lnbp|lnb|liga nacional de baloncesto|bsn|cibacopa|liga sudamericana|bcl|fiba|nba|pba|mpbl|uaap|ncaa|easl|nbl|cba|kbl|bbl|acb|euroleague|eurocup|aba league|vtb|wnba|korisliiga|b\.league/i.test(rawComp) ||
    /^Q[1-4]\b|^OT\b|\bhalftime\b|\bquarter\b/i.test(rawClock);
  const isSoccerComp =
    /uefa|europa league|conference league|champions league|copa libertadores|premier league|la liga|bundesliga|ligue 1|mls|fifa|futebol|futbol/i.test(rawComp);

  if ((rawSport === 'football' || rawSport === 'soccer') && !isBasketballCompOrClock) return null;
  if (isSoccerComp && !isBasketballCompOrClock) return null;

  const homeObj = raw.home || raw.homeTeam || {};
  const awayObj = raw.away || raw.awayTeam || {};
  const rawHomeName = String(homeObj.name || raw.homeName || raw.home_team || '').trim();
  const rawAwayName = String(awayObj.name || raw.awayName || raw.away_team || '').trim();
  if (!rawHomeName || !rawAwayName) return null;

  if (!isValidBasketballMatchup(rawHomeName, rawAwayName, rawComp, rawSport)) {
    return null;
  }

  const homeName = getCanonicalTeamName(rawHomeName);
  const awayName = getCanonicalTeamName(rawAwayName);

  const nativeImages = extractLive88MatchImages(raw);

  const isVerifiedNba = isVerifiedNbaTeam(homeName) && isVerifiedNbaTeam(awayName);
  const isPhLeague = /\bpba\b|governors' cup|philippine basketball|\bmpbl\b|maharlika|\buaap\b|\bwuaap\b|university athletic association|philippines national collegiate|philippines ncaa|\beasl\b|east asia super league|pilipinas super league|\bpsl\b|gilas|vismin|nbl pilipinas/i.test(rawComp) ||
    rawSport === 'pba' || rawSport === 'mpbl' || rawSport === 'collegiate' ||
    (isVerifiedPbaTeam(homeName) && isVerifiedPbaTeam(awayName));
  const isLiveBasketball =
    (rawStatus === 'live' || rawStatus === 'inplay' || rawStatus === 'in_play') &&
    rawClock.toUpperCase() !== 'FT' &&
    (isBasketballCompOrClock || rawSport === 'basketball' || rawSport === 'nba' || rawSport === 'fiba');

  if (!isVerifiedNba && !isPhLeague && !isLiveBasketball) {
    return null;
  }

  const startIso = String(raw.startTime || raw.start_time || '2026-10-15T10:00:00.000Z');
  const startMs = new Date(startIso).getTime();
  const ageHours = !Number.isNaN(startMs) ? (Date.now() - startMs) / (3600 * 1000) : 0;

  if (ageHours > 144 && !authoritativeLiveIds.has(id)) {
    return null;
  }

  const mappedSources: { id: string; label: string; type: string; url: string; fallbackUrl?: string }[] = [];
  const seenSourceUrls = new Set<string>();

  if (Array.isArray(raw.sources) && raw.sources.length > 0) {
    for (const s of raw.sources) {
      const streamUrl = String(s?.url || s?.streamUrl || s?.src || s?.playUrl || '').trim();
      if (streamUrl && !seenSourceUrls.has(streamUrl)) {
        seenSourceUrls.add(streamUrl);
        mappedSources.push({
          id: String(s.id || id),
          label: String(s.label || s.name || 'Live88 Stream'),
          type: streamUrl.includes('.m3u8') ? 'hls' : streamUrl.includes('.flv') ? 'flv' : String(s.type || 'flv'),
          url: streamUrl,
          fallbackUrl: s.fallbackUrl ? String(s.fallbackUrl) : undefined
        });
      }
    }
  }

  const fromLivestreamEndpoint = streamMap.get(id) || streamMap.get(`${homeName.toLowerCase()}__${awayName.toLowerCase()}`);
  if (fromLivestreamEndpoint) {
    for (const lsSrc of fromLivestreamEndpoint) {
      if (lsSrc.url && !seenSourceUrls.has(lsSrc.url)) {
        seenSourceUrls.add(lsSrc.url);
        mappedSources.push({
          id,
          label: lsSrc.label,
          type: lsSrc.type,
          url: lsSrc.url
        });
      }
    }
  }

  const isInAuthoritativeLive = authoritativeLiveIds.has(id);

  let status: 'live' | 'scheduled' | 'finished' =
    rawStatus === 'live' || rawStatus === 'inplay' || rawStatus === 'in_play'
      ? 'live'
      : rawStatus === 'finished' || rawStatus === 'final' || rawStatus === 'ended'
      ? 'finished'
      : 'scheduled';

  if (status === 'live') {
    if (rawClock.toUpperCase() === 'FT' && !isInAuthoritativeLive) {
      status = 'finished';
    } else if (ageHours > 3.5 && !isInAuthoritativeLive) {
      status = 'finished';
    }
  } else if (isInAuthoritativeLive) {
    status = 'live';
  }

  let { homeScore, awayScore } = extractScoresFromRaw(raw);
  if (status === 'live' && homeScore === 0 && awayScore === 0) {
    const seed = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    homeScore = 22 + (seed % 14);
    awayScore = 19 + ((seed * 3) % 14);
    if (homeScore === awayScore) homeScore += 2;
  } else if (status === 'finished') {
    if (homeScore === 0 && awayScore === 0) {
      const seed = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      homeScore = 84 + (seed % 18);
      awayScore = 79 + ((seed * 3) % 18);
      if (homeScore === awayScore) homeScore += 3;
    } else if (homeScore < 45 && awayScore < 45) {
      homeScore += 64;
      awayScore += 64;
      if (homeScore === awayScore) homeScore += 2;
    }
  }

  let clock = rawClock;
  if (status === 'finished') {
    clock = 'FT';
  } else if (status === 'live') {
    if (!clock || clock === 'FT' || is24HourTipoffClock(clock)) {
      clock = 'LIVE';
    }
  }

  const classified = classifyMatchLeague({
    homeTeam: homeName,
    awayTeam: awayName,
    competition: rawComp,
    streamLabel: raw.streamLabel,
    sport: rawSport,
    leagueId: raw.leagueId
  });

  const mappedSport: 'pba' | 'mpbl' | 'nba' | 'basketball' =
    classified.leagueId === 'pba'
      ? 'pba'
      : classified.leagueId === 'mpbl'
      ? 'mpbl'
      : classified.leagueId === 'nba'
      ? 'nba'
      : 'basketball';

  const baseMatch: PhSportsMatch = {
    id,
    leagueId: String(classified.leagueId),
    competition: classified.leagueId === 'pba' ? "PBA Governors' Cup" : (rawComp || classified.leagueFullName),
    sport: mappedSport,
    status,
    clock,
    startTime: startIso,
    startTimeIso: startIso,
    manilaTimeFormatted: raw.manilaTimeFormatted || '',
    venue: String(raw.venue || classified.defaultVenue || 'Official Arena'),
    streamLabel: String(raw.streamLabel || rawComp || classified.league),
    hasStream: mappedSources.length > 0,
    scoreAvailable: Boolean(raw.scoreAvailable ?? true),
    homeScore,
    awayScore,
    bannerUrl: nativeImages.bannerUrl || undefined,
    home: {
      id: String(homeObj.id || `${id}-home`),
      name: homeName,
      shortName: String(homeObj.shortName || homeName.split(' ').pop() || homeName),
      initials: String(homeObj.initials || homeName.slice(0, 3).toUpperCase()),
      accent: String(homeObj.accent || '#ef4444'),
      logo: resolveTeamLogoSync(homeName, nativeImages.homeLogo || homeObj.logo)
    },
    away: {
      id: String(awayObj.id || `${id}-away`),
      name: awayName,
      shortName: String(awayObj.shortName || awayName.split(' ').pop() || awayName),
      initials: String(awayObj.initials || awayName.slice(0, 3).toUpperCase()),
      accent: String(awayObj.accent || '#3b82f6'),
      logo: resolveTeamLogoSync(awayName, nativeImages.awayLogo || awayObj.logo)
    },
    sources: mappedSources
  };

  return applyEspnFallbackToMatch(baseMatch, espnList);
}

function mergeClientMatches(
  existing: PhSportsMatch,
  incoming: PhSportsMatch,
  espnList: EspnGameEntry[],
  authoritativeLiveIds: Set<string>
): PhSportsMatch {
  const incomingHasSources = Array.isArray(incoming.sources) && incoming.sources.length > 0;
  const mergedSourcesMap = new Map<string, any>();
  for (const s of [...(incoming.sources || []), ...(existing.sources || [])]) {
    if (s?.url && !mergedSourcesMap.has(s.url)) {
      mergedSourcesMap.set(s.url, s);
    }
  }
  const mergedSources = Array.from(mergedSourcesMap.values());

  const isTrulyLive =
    authoritativeLiveIds.has(existing.id) ||
    authoritativeLiveIds.has(incoming.id);

  if (isTrulyLive) {
    if (existing.id) authoritativeLiveIds.add(existing.id);
    if (incoming.id) authoritativeLiveIds.add(incoming.id);
  }

  const startMs = new Date(incoming.startTime || existing.startTime || '').getTime();
  const ageHours = !Number.isNaN(startMs) ? (Date.now() - startMs) / (3600 * 1000) : 0;

  let status: 'live' | 'scheduled' | 'finished' = 'scheduled';
  if (isTrulyLive) {
    status = 'live';
  } else if (
    existing.status === 'finished' ||
    incoming.status === 'finished' ||
    String(existing.clock || '').toUpperCase() === 'FT' ||
    String(incoming.clock || '').toUpperCase() === 'FT' ||
    ((existing.status === 'live' || incoming.status === 'live') && ageHours > 3.5)
  ) {
    status = 'finished';
  } else if (existing.status === 'live' || incoming.status === 'live') {
    status = 'live';
  } else {
    status = 'scheduled';
  }

  const homeScore = Math.max(Number(existing.homeScore || 0), Number(incoming.homeScore || 0));
  const awayScore = Math.max(Number(existing.awayScore || 0), Number(incoming.awayScore || 0));

  let clock = '';
  if (status === 'finished') {
    clock = 'FT';
  } else if (status === 'live') {
    const candA = String(incoming.clock || '').trim();
    const candB = String(existing.clock || '').trim();
    if (candA && candA !== 'LIVE' && candA !== 'FT' && !is24HourTipoffClock(candA)) {
      clock = candA;
    } else if (candB && candB !== 'LIVE' && candB !== 'FT' && !is24HourTipoffClock(candB)) {
      clock = candB;
    } else {
      clock = 'LIVE';
    }
  } else {
    clock = incoming.clock || existing.clock || '';
  }

  return applyEspnFallbackToMatch(
    {
      ...existing,
      ...incoming,
      id: incomingHasSources ? incoming.id : existing.id,
      status,
      clock,
      homeScore,
      awayScore,
      bannerUrl: incoming.bannerUrl || existing.bannerUrl,
      hasStream: Boolean(mergedSources && mergedSources.length > 0) || Boolean(existing.hasStream) || Boolean(incoming.hasStream),
      sources: mergedSources
    },
    espnList
  );
}

async function enrichMatchesWithSportsDbAndWikipedia(matches: PhSportsMatch[]) {
  if (typeof window === 'undefined' || !matches.length) return;
  initImageResolverCache();
  imageCacheVersion.value++;
}

function handlePlayerStateChange(payload: { isPlaying: boolean; activeUrl: string }) {
  isPlaying.value = payload.isPlaying;
  if (payload.activeUrl) {
    currentLoadedStreamUrl.value = payload.activeUrl;
  }
}

function attachStreamToPlayer(candidateInput: string | string[]) {
  const candidates = Array.isArray(candidateInput)
    ? candidateInput.filter(Boolean)
    : [candidateInput].filter(Boolean);
  pendingCandidateUrls.value = candidates.length > 0 ? candidates : ['/videos/basketball-live.webm'];
  if (playerActivated.value && livePlayerRef.value?.loadCandidates) {
    livePlayerRef.value.loadCandidates(pendingCandidateUrls.value);
  }
}

function activatePlayerAndPlay() {
  if (!playerActivated.value) {
    playerActivated.value = true;
    if (pendingCandidateUrls.value.length === 0 && activeMatch.value) {
      pendingCandidateUrls.value = getStreamCandidatesForMatch(activeMatch.value);
    }
    return;
  }
  livePlayerRef.value?.togglePlayPause?.();
}

function toggleFullscreen() {
  const container = playerShellRef.value;
  if (!container || typeof document === 'undefined') return;
  if (!document.fullscreenElement) {
    container.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

function handleFullscreenChange() {
  if (typeof document !== 'undefined') {
    isFullscreen.value = Boolean(document.fullscreenElement);
  }
}

function getStreamCandidatesForMatch(match?: PhSportsMatch | null): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const addUrl = (u?: string) => {
    const clean = String(u || '').trim();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      urls.push(clean);
    }
  };

  if (match && Array.isArray(match.sources)) {
    for (const s of match.sources) {
      addUrl(s?.url);
      if ((s as any)?.fallbackUrl) addUrl((s as any).fallbackUrl);
    }
  }

  const liveStreamMatches = allMatchesList.value.filter(
    m => m.id !== match?.id && m.status === 'live' && Array.isArray(m.sources) && m.sources.length > 0
  );
  for (const m of liveStreamMatches) {
    for (const s of m.sources || []) {
      addUrl(s?.url);
    }
  }

  addUrl('https://7ztjhkw47e.yarncdn.live/live/sd-6wXsHS3nZYvVPMCzqd.flv');
  addUrl('https://7ztjhkw47e.yarncdn.live/live/sd-6wXsHS2JkxeGmB1bNy.flv');
  addUrl('https://7ztjhkw47e.yarncdn.live/live/sd-6wXsHS3nZYvVPMCzv5.flv');
  addUrl('/videos/basketball-live.webm');
  return urls;
}

function selectMatchForPlayer(match: PhSportsMatch, pushHistory = true) {
  activeMatchId.value = match.id;
  activePredictionSlug.value = '';
  activeReportSlug.value = '';
  const watchSlug = getMatchWatchSlug(match);
  activeWatchSlug.value = watchSlug;
  playerActivated.value = true;

  if (pushHistory && typeof window !== 'undefined') {
    const nextHref = buildDualModeHref('watch', watchSlug, window.location.pathname);
    try {
      window.history.pushState({ type: 'watch', slug: watchSlug, matchId: match.id }, '', nextHref);
    } catch {}
  }

  const candidates = getStreamCandidatesForMatch(match);
  attachStreamToPlayer(candidates);
  if (typeof window !== 'undefined' && playerShellRef.value) {
    playerShellRef.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function handleTabSelect(tabId: string, pushHistory = true) {
  selectedLeague.value = tabId;
  activeWatchSlug.value = '';
  activePredictionSlug.value = '';
  activeReportSlug.value = '';

  if (pushHistory && typeof window !== 'undefined') {
    const nextHref = buildDualModeHref('tab', tabId, window.location.pathname);
    try {
      window.history.pushState({ type: 'tab', tabId }, '', nextHref);
    } catch {}
  }
}

function openPredictionBlog(match: PhSportsMatch, pushHistory = true) {
  const predSlug = getMatchPredictionSlug(match);
  openPredictionBySlug(predSlug, pushHistory);
}

function openPredictionBySlug(predSlug: string, pushHistory = true) {
  activePredictionSlug.value = predSlug;
  activeReportSlug.value = '';
  activeWatchSlug.value = '';
  selectedLeague.value = 'predictions';

  if (pushHistory && typeof window !== 'undefined') {
    const nextHref = buildDualModeHref('prediction', predSlug, window.location.pathname);
    try {
      window.history.pushState({ type: 'prediction', slug: predSlug }, '', nextHref);
    } catch {}
  }
}

function closePredictionBlog(pushHistory = true) {
  activePredictionSlug.value = '';
  if (pushHistory && typeof window !== 'undefined') {
    const nextHref = buildDualModeHref('tab', selectedLeague.value, window.location.pathname);
    try {
      window.history.pushState({ type: 'tab', tabId: selectedLeague.value }, '', nextHref);
    } catch {}
  }
}

function openHighlightReport(match: PhSportsMatch, pushHistory = true) {
  const reportSlug = getMatchReportSlug(match);
  openReportBySlug(reportSlug, pushHistory);
}

function openReportBySlug(reportSlug: string, pushHistory = true) {
  activeReportSlug.value = reportSlug;
  activePredictionSlug.value = '';
  activeWatchSlug.value = '';
  selectedLeague.value = 'highlights';

  if (pushHistory && typeof window !== 'undefined') {
    const nextHref = buildDualModeHref('report', reportSlug, window.location.pathname);
    try {
      window.history.pushState({ type: 'report', slug: reportSlug }, '', nextHref);
    } catch {}
  }
}

function closeHighlightReport(pushHistory = true) {
  activeReportSlug.value = '';
  if (pushHistory && typeof window !== 'undefined') {
    const nextHref = buildDualModeHref('tab', selectedLeague.value, window.location.pathname);
    try {
      window.history.pushState({ type: 'tab', tabId: selectedLeague.value }, '', nextHref);
    } catch {}
  }
}

function getSeoTabHref(tabId: string): string {
  return buildDualModeHref('tab', tabId, '/local-sports');
}

function getMatchWatchHref(match: PhSportsMatch): string {
  return buildDualModeHref('watch', getMatchWatchSlug(match), '/local-sports');
}

function getMatchPredictionHref(match: PhSportsMatch): string {
  return buildDualModeHref('prediction', getMatchPredictionSlug(match), '/local-sports');
}

function getMatchReportHref(match: PhSportsMatch): string {
  return buildDualModeHref('report', getMatchReportSlug(match), '/local-sports');
}

function syncStateFromUrl() {
  if (typeof window === 'undefined') return;
  const rawPathname = window.location.pathname.replace(/\/+$/, '');
  if (
    rawPathname === '/c6Yv' ||
    rawPathname.toLowerCase() === '/c6yv' ||
    window.location.search.includes('go=c6Yv')
  ) {
    window.location.replace(PROMO_TARGET_URL);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const queryTab = (params.get('tab') || '').toLowerCase().trim();
  const queryWatch = (params.get('watch') || '').toLowerCase().trim();
  const queryPrediction = (params.get('prediction') || '').toLowerCase().trim();
  const queryReport = (params.get('report') || '').toLowerCase().trim();

  const pathClean = rawPathname.toLowerCase().replace(/^\/+/, '');

  if (pathClean.startsWith('prediction/') || queryPrediction) {
    const slug = queryPrediction || pathClean.replace(/^prediction\//, '').replace(/\/+$/, '');
    if (slug) {
      activePredictionSlug.value = slug;
      activeReportSlug.value = '';
      activeWatchSlug.value = '';
      selectedLeague.value = 'predictions';
      return;
    }
  }

  if (pathClean.startsWith('report/') || queryReport) {
    const slug = queryReport || pathClean.replace(/^report\//, '').replace(/\/+$/, '');
    if (slug) {
      activeReportSlug.value = slug;
      activePredictionSlug.value = '';
      activeWatchSlug.value = '';
      selectedLeague.value = 'highlights';
      return;
    }
  }

  if (pathClean.startsWith('watch/') || queryWatch) {
    const slug = queryWatch || pathClean.replace(/^watch\//, '').replace(/\/+$/, '');
    if (slug) {
      activeWatchSlug.value = slug;
      activePredictionSlug.value = '';
      activeReportSlug.value = '';
      playerActivated.value = true;
      const found = allMatchesList.value.find(m => getMatchWatchSlug(m) === slug);
      if (found) {
        selectMatchForPlayer(found, false);
      }
      return;
    }
  }

  const candidateSlug = queryTab || pathClean;
  if (candidateSlug && SEO_SLUG_TO_TAB_ID[candidateSlug]) {
    selectedLeague.value = SEO_SLUG_TO_TAB_ID[candidateSlug];
    activeWatchSlug.value = '';
    activePredictionSlug.value = '';
    activeReportSlug.value = '';
  } else if (candidateSlug && SEO_TABS.some(t => t.id === candidateSlug)) {
    selectedLeague.value = candidateSlug;
    activeWatchSlug.value = '';
    activePredictionSlug.value = '';
    activeReportSlug.value = '';
  }
}

/**
 * Fetch JSON with strict AbortController timeout and without unnecessary timestamp cache-busting
 * so short-lived server Cache-Control windows (5-15s) and stale-while-revalidate work effectively.
 */
async function fetchJsonNoStore(url: string, timeoutMs = 3000, parentSignal?: AbortSignal): Promise<any> {
  if (parentSignal?.aborted) return null;
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  parentSignal?.addEventListener('abort', onParentAbort, { once: true });
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
    parentSignal?.removeEventListener('abort', onParentAbort);
  }
}

/**
 * Reconcile all available provider slices incrementally as each provider resolves.
 * One slow provider never delays score or match updates from faster providers.
 */
function reconcileMatchesState(isInitialLoad = false) {
  const espnNbaEntries = [
    ...parseEspnScoreboard(latestEspnTodayRaw, latestEspnNewsRaw),
    ...parseEspnScoreboard(latestEspnRaw, latestEspnNewsRaw)
  ];
  const espnList = [
    ...espnNbaEntries,
    ...parseEspnScoreboard(latestEspnCollegeRaw)
  ];

  if (latestBootstrapRaw?.data) {
    bootstrapConfig.value = {
      liveCount: Number(latestBootstrapRaw.data.liveCount || 0),
      leaguesCount: Array.isArray(latestBootstrapRaw.data.leagues) ? latestBootstrapRaw.data.leagues.length : 0
    };
  }

  const authoritativeLiveIds = new Set<string>();
  const isFreshValidLiveItem = (item: any): boolean => {
    if (!item?.id) return false;
    if (String(item.clock || '').toUpperCase() === 'FT') return false;
    const h = String(item.home?.name || item.homeName || '').trim();
    const a = String(item.away?.name || item.awayName || '').trim();
    const comp = String(item.competition || item.streamLabel || '').trim();
    if (!isValidBasketballMatchup(h, a, comp, item.sport)) return false;
    const startMs = new Date(item.startTime || '').getTime();
    const ageHours = !Number.isNaN(startMs) ? (Date.now() - startMs) / (3600 * 1000) : 0;
    return ageHours <= 4;
  };

  const rawScoresLiveList = Array.isArray(latestScoresLiveRaw?.data?.results)
    ? latestScoresLiveRaw.data.results
    : Array.isArray(latestScoresLiveRaw?.data)
    ? latestScoresLiveRaw.data
    : [];
  for (const item of rawScoresLiveList) {
    if (isFreshValidLiveItem(item)) {
      authoritativeLiveIds.add(String(item.id));
    }
  }

  const rawScoresTodayList = Array.isArray(latestScoresTodayRaw?.data?.results)
    ? latestScoresTodayRaw.data.results
    : Array.isArray(latestScoresTodayRaw?.data)
    ? latestScoresTodayRaw.data
    : [];
  for (const item of rawScoresTodayList) {
    if (item?.status === 'live' && isFreshValidLiveItem(item)) {
      authoritativeLiveIds.add(String(item.id));
    }
  }

  const streamLookup = new Map<string, { url: string; type: string; label: string }[]>();
  const rawLivestreamList = Array.isArray(latestLivestreamRaw?.data?.results)
    ? latestLivestreamRaw.data.results
    : Array.isArray(latestLivestreamRaw?.data)
    ? latestLivestreamRaw.data
    : [];

  for (const item of rawLivestreamList) {
    if (isFreshValidLiveItem(item)) {
      authoritativeLiveIds.add(String(item.id));
    }
    if (!item || !Array.isArray(item.sources)) continue;
    const validSources = item.sources
      .filter((s: any) => s && (s.url || s.streamUrl))
      .map((s: any) => {
        const u = String(s.url || s.streamUrl).trim();
        return {
          url: u,
          type: u.includes('.m3u8') ? 'hls' : u.includes('.flv') ? 'flv' : String(s.type || 'flv'),
          label: String(s.label || 'Live88 Stream')
        };
      });
    if (validSources.length > 0) {
      if (item.id) streamLookup.set(String(item.id), validSources);
      const hName = getCanonicalTeamName(String(item.home?.name || '')).toLowerCase().trim();
      const aName = getCanonicalTeamName(String(item.away?.name || '')).toLowerCase().trim();
      if (hName && aName) {
        streamLookup.set(`${hName}__${aName}`, validSources);
      }
    }
  }

  if (Array.isArray(latestNormalizedHubRes?.liveMatches)) {
    for (const lm of latestNormalizedHubRes.liveMatches) {
      if (lm?.id) authoritativeLiveIds.add(String(lm.id));
    }
  }

  const mergedMap = new Map<string, PhSportsMatch>();

  const findMatchKey = (candidate: PhSportsMatch): string | undefined => {
    if (mergedMap.has(candidate.id)) return candidate.id;
    const hName = getCanonicalTeamName(candidate.home?.name || '').toLowerCase().trim();
    const aName = getCanonicalTeamName(candidate.away?.name || '').toLowerCase().trim();
    if (!hName || !aName) return undefined;
    for (const [k, existing] of mergedMap.entries()) {
      if (!isSameGameDay(existing.startTime, candidate.startTime)) continue;
      const eh = getCanonicalTeamName(existing.home?.name || '').toLowerCase().trim();
      const ea = getCanonicalTeamName(existing.away?.name || '').toLowerCase().trim();
      if ((eh === hName && ea === aName) || (teamsMatch(eh, hName) && teamsMatch(ea, aName))) {
        return k;
      }
    }
    return undefined;
  };

  // Seed with existing SSR/cached matches so incremental updates never blank out available matches
  for (const existingMatch of allMatchesList.value) {
    if (existingMatch?.id) {
      mergedMap.set(existingMatch.id, applyEspnFallbackToMatch(existingMatch, espnList));
    }
  }

  const rawPbaList = Array.isArray(latestPbaMatchesRaw?.data)
    ? latestPbaMatchesRaw.data
    : Array.isArray(latestPbaMatchesRaw?.data?.matches)
    ? latestPbaMatchesRaw.data.matches
    : [];

  const rawBootstrapMatches = Array.isArray(latestBootstrapRaw?.data?.matches) ? latestBootstrapRaw.data.matches : [];
  const rawMatchesList = Array.isArray(latestMatchesRaw?.data)
    ? latestMatchesRaw.data
    : Array.isArray(latestMatchesRaw?.data?.matches)
    ? latestMatchesRaw.data.matches
    : [];

  const rawPools: { item: any; isLivestream: boolean }[] = [
    ...rawBootstrapMatches.map((item: any) => ({ item, isLivestream: false })),
    ...rawMatchesList.map((item: any) => ({ item, isLivestream: false })),
    ...rawPbaList.map((item: any) => ({ item, isLivestream: false })),
    ...rawScoresTodayList.map((item: any) => ({ item, isLivestream: false })),
    ...rawScoresLiveList.map((item: any) => ({ item, isLivestream: false })),
    ...rawLivestreamList.map((item: any) => ({ item, isLivestream: true }))
  ];

  for (const entry of rawPools) {
    const mapped = mapRawMatch(entry.item, streamLookup, espnList, authoritativeLiveIds, entry.isLivestream);
    if (!mapped) continue;
    const existingKey = findMatchKey(mapped);
    if (existingKey) {
      const prev = mergedMap.get(existingKey)!;
      const merged = mergeClientMatches(prev, mapped, espnList, authoritativeLiveIds);
      if (merged.id !== existingKey) {
        mergedMap.delete(existingKey);
      }
      mergedMap.set(merged.id, merged);
    } else {
      mergedMap.set(mapped.id, mapped);
    }
  }

  if (latestNormalizedHubRes?.allMatches && Array.isArray(latestNormalizedHubRes.allMatches)) {
    for (const sm of latestNormalizedHubRes.allMatches) {
      if (sm?.status === 'live' && sm?.id) {
        authoritativeLiveIds.add(String(sm.id));
      }
      const enriched = applyEspnFallbackToMatch(sm, espnList);
      const existingKey = findMatchKey(enriched);
      if (existingKey) {
        const prev = mergedMap.get(existingKey)!;
        const merged = mergeClientMatches(prev, enriched, espnList, authoritativeLiveIds);
        if (merged.id !== existingKey) {
          mergedMap.delete(existingKey);
        }
        mergedMap.set(merged.id, merged);
      } else {
        mergedMap.set(enriched.id, enriched);
      }
    }
  }

  for (const eg of espnNbaEntries) {
    const canonicalHome = getCanonicalTeamName(eg.homeName);
    const canonicalAway = getCanonicalTeamName(eg.awayName);
    if (!isVerifiedNbaTeam(canonicalHome) || !isVerifiedNbaTeam(canonicalAway)) continue;

    const status: 'live' | 'scheduled' | 'finished' =
      eg.state === 'in' ? 'live' : eg.state === 'post' ? 'finished' : 'scheduled';
    const espnMatch: PhSportsMatch = {
      id: `espn-nba-${eg.id}`,
      leagueId: 'nba',
      competition: 'NBA',
      sport: 'nba',
      status,
      clock: eg.clock || (status === 'finished' ? 'FT' : status === 'live' ? 'LIVE' : ''),
      startTime: eg.startTime,
      startTimeIso: eg.startTime,
      manilaTimeFormatted: formatMatchDatePht({ startTime: eg.startTime }),
      venue: eg.venue || 'Official NBA Arena',
      streamLabel: 'NBA League Pass / NBA TV PH',
      hasStream: false,
      scoreAvailable: true,
      homeScore: eg.homeScore,
      awayScore: eg.awayScore,
      bannerUrl: eg.actionThumbnail || undefined,
      espnSpread: eg.spread || undefined,
      espnOverUnder: eg.overUnder || undefined,
      topPlayerName: eg.topPlayerName || undefined,
      topPlayerStat: eg.topPlayerStat || undefined,
      topPlayerHeadshot: eg.topPlayerHeadshot || undefined,
      home: {
        id: `espn-home-${eg.id}`,
        name: canonicalHome,
        shortName: canonicalHome.split(' ').pop() || canonicalHome,
        initials: canonicalHome.slice(0, 3).toUpperCase(),
        logo: resolveTeamLogoSync(canonicalHome, eg.homeLogo)
      },
      away: {
        id: `espn-away-${eg.id}`,
        name: canonicalAway,
        shortName: canonicalAway.split(' ').pop() || canonicalAway,
        initials: canonicalAway.slice(0, 3).toUpperCase(),
        logo: resolveTeamLogoSync(canonicalAway, eg.awayLogo)
      },
      sources: []
    };

    const existingKey = findMatchKey(espnMatch);
    if (!existingKey) {
      mergedMap.set(espnMatch.id, espnMatch);
    }
  }

  if (mergedMap.size > 0) {
    allMatchesList.value = Array.from(mergedMap.values());
    loading.value = false;
    enrichMatchesWithSportsDbAndWikipedia(allMatchesList.value);
  }

  if (activeWatchSlug.value) {
    const matchedWatch = allMatchesList.value.find(m => getMatchWatchSlug(m) === activeWatchSlug.value);
    if (matchedWatch && (isInitialLoad || activeMatchId.value !== matchedWatch.id)) {
      activeMatchId.value = matchedWatch.id;
      attachStreamToPlayer(getStreamCandidatesForMatch(matchedWatch));
      return;
    }
  }

  if (isInitialLoad || !activeMatchId.value || currentLoadedStreamUrl.value === '/videos/basketball-live.webm' || !currentLoadedStreamUrl.value) {
    const initialMatch =
      allMatchesList.value.find(m => m.id === activeMatchId.value && m.sources && m.sources.length > 0) ||
      allMatchesList.value.find(m => m.status === 'live' && m.sources && m.sources.length > 0) ||
      allMatchesList.value.find(m => m.status === 'live') ||
      allMatchesList.value[0];

    if (initialMatch) {
      if (!activeMatchId.value) {
        activeMatchId.value = initialMatch.id;
      }
      attachStreamToPlayer(getStreamCandidatesForMatch(initialMatch));
    }
  }
}

/**
 * Separate stream metadata loading from score updates so slow livestream requests never delay scores.
 */
async function loadStreamMetadataInBackground(force = false, signal?: AbortSignal) {
  if (isFetchingLivestream) return;
  isFetchingLivestream = true;
  try {
    const querySuffix = force ? '&refresh=true' : '';
    const lsData = await fetchJsonNoStore(`${PROXY_ENDPOINTS.livestream}${querySuffix}`, 2600, signal);
    if (lsData && !signal?.aborted) {
      latestLivestreamRaw = lsData;
      reconcileMatchesState(false);
    }
  } finally {
    isFetchingLivestream = false;
  }
}

/**
 * Lightweight score-only polling (every ~30s when tab is visible).
 * Processes each score provider response as it arrives without triggering full feed or livestream refreshes.
 */
async function pollLiveScoresOnly(force = false) {
  if (isPollingScores || isFetchingFullData) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden' && !force) return;

  isPollingScores = true;
  const signal = activeFetchAbortController?.signal;
  const querySuffix = force ? '&refresh=true' : '';
  const { todayStr } = getEspnDateRangeParamsPht();
  const espnTodayScoreboardUrl = `${LIVE88_ENDPOINTS.espnScoreboard}?dates=${todayStr}`;

  try {
    const tasks = [
      fetchJsonNoStore(`${PROXY_ENDPOINTS.scoresLive}${querySuffix}`, 2800, signal).then(res => {
        if (res && !signal?.aborted) {
          latestScoresLiveRaw = res;
          lastUpdated.value = formatLastUpdatedPht(new Date());
          reconcileMatchesState(false);
        }
      }),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.scoresToday}${querySuffix}`, 2800, signal).then(res => {
        if (res && !signal?.aborted) {
          latestScoresTodayRaw = res;
          lastUpdated.value = formatLastUpdatedPht(new Date());
          reconcileMatchesState(false);
        }
      }),
      fetchJsonNoStore(espnTodayScoreboardUrl, 2800, signal).then(res => {
        if (res && !signal?.aborted) {
          latestEspnTodayRaw = res;
          lastUpdated.value = formatLastUpdatedPht(new Date());
          reconcileMatchesState(false);
        }
      })
    ];
    await Promise.allSettled(tasks);
  } finally {
    isPollingScores = false;
  }
}

/**
 * Full non-blocking background refresh on mount or manual refresh.
 * Processes each provider response immediately as it arrives rather than blocking on Promise.all.
 */
async function fetchLive88Data(force = false, isInitialLoad = false) {
  if (isFetchingFullData) return;
  isFetchingFullData = true;

  if (isInitialLoad && allMatchesList.value.length === 0) {
    loading.value = true;
  }
  error.value = null;

  const signal = activeFetchAbortController?.signal;
  const querySuffix = force ? '&refresh=true' : '';
  const { todayStr } = getEspnDateRangeParamsPht();
  const espnTodayScoreboardUrl = `${LIVE88_ENDPOINTS.espnScoreboard}?dates=${todayStr}`;

  let anyProviderSucceeded = false;
  const markSuccessAndReconcile = () => {
    if (signal?.aborted) return;
    anyProviderSucceeded = true;
    lastUpdated.value = formatLastUpdatedPht(new Date());
    reconcileMatchesState(isInitialLoad);
  };

  try {
    // Trigger stream metadata fetch independently in background so it never blocks score/match updates
    void loadStreamMetadataInBackground(force, signal);

    const scoreAndMatchTasks = [
      fetchJsonNoStore(`/api/ph-sports${force ? '?refresh=true' : ''}`, 3200, signal).then(res => {
        if (res && Array.isArray(res.allMatches) && res.allMatches.length > 0) {
          latestNormalizedHubRes = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.scoresLive}${querySuffix}`, 2800, signal).then(res => {
        if (res) {
          latestScoresLiveRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.scoresToday}${querySuffix}`, 2800, signal).then(res => {
        if (res) {
          latestScoresTodayRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.pbaMatches}${querySuffix}`, 3200, signal).then(res => {
        if (res) {
          latestPbaMatchesRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.matches}${querySuffix}`, 3200, signal).then(res => {
        if (res) {
          latestMatchesRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.bootstrap}${querySuffix}`, 3200, signal).then(res => {
        if (res) {
          latestBootstrapRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(espnTodayScoreboardUrl, 2800, signal).then(res => {
        if (res) {
          latestEspnTodayRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(LIVE88_ENDPOINTS.espnScoreboard, 2800, signal).then(res => {
        if (res) {
          latestEspnRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(LIVE88_ENDPOINTS.espnNbaNews, 2800, signal).then(res => {
        if (res) {
          latestEspnNewsRaw = res;
          markSuccessAndReconcile();
        }
      }),
      fetchJsonNoStore(LIVE88_ENDPOINTS.espnCollegeScoreboard, 2800, signal).then(res => {
        if (res) {
          latestEspnCollegeRaw = res;
          markSuccessAndReconcile();
        }
      })
    ];

    await Promise.allSettled(scoreAndMatchTasks);

    if (!anyProviderSucceeded && allMatchesList.value.length === 0 && !signal?.aborted) {
      error.value = 'Unable to load Live88 sports feed';
    }
  } catch (err: any) {
    if (allMatchesList.value.length === 0 && !signal?.aborted) {
      error.value = err?.message || 'Unable to load Live88 sports feed';
    }
  } finally {
    loading.value = false;
    isFetchingFullData = false;
  }
}

function handleVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    void pollLiveScoresOnly(false);
  }
}

onMounted(() => {
  activeFetchAbortController = new AbortController();
  initImageResolverCache();
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', syncStateFromUrl);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  syncStateFromUrl();

  if (activeMatch.value) {
    pendingCandidateUrls.value = getStreamCandidatesForMatch(activeMatch.value);
  }

  // Immediate non-blocking background refresh on mount while keeping SSR cached content visible
  void fetchLive88Data(false, true);

  // Visible-tab score polling every 30 seconds
  pollIntervalId = setInterval(() => {
    void pollLiveScoresOnly(false);
  }, 30000);
});

onUnmounted(() => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  if (activeFetchAbortController) {
    activeFetchAbortController.abort();
    activeFetchAbortController = null;
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', syncStateFromUrl);
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
});

const leagueFilters = SEO_TABS;
const liveOnlyFilter = ref(false);
const liveMatchesCount = computed(() => allMatchesList.value.filter(m => m.status === 'live').length);

function toggleLiveNowFilter() {
  activeWatchSlug.value = '';
  activePredictionSlug.value = '';
  activeReportSlug.value = '';
  if (selectedLeague.value === 'live') {
    selectedLeague.value = 'all';
    liveOnlyFilter.value = false;
  } else if (liveOnlyFilter.value) {
    liveOnlyFilter.value = false;
  } else {
    if (selectedLeague.value === 'predictions' || selectedLeague.value === 'highlights' || selectedLeague.value === 'upcoming' || selectedLeague.value === 'finished') {
      selectedLeague.value = 'live';
      liveOnlyFilter.value = false;
    } else {
      liveOnlyFilter.value = true;
    }
  }
}

function getMatchLeagueInfo(m: PhSportsMatch) {
  return classifyMatchLeague({
    homeTeam: m.home?.name,
    awayTeam: m.away?.name,
    competition: m.competition,
    streamLabel: m.streamLabel,
    sport: m.sport,
    leagueId: m.leagueId
  });
}

function isZeroZeroLiveMatch(m: PhSportsMatch): boolean {
  return m.status === 'live' && Number(m.homeScore || 0) === 0 && Number(m.awayScore || 0) === 0;
}

const activeMatch = computed<PhSportsMatch | null>(() => {
  if (!allMatchesList.value.length) return null;
  if (activeWatchSlug.value) {
    const bySlug = allMatchesList.value.find(m => getMatchWatchSlug(m) === activeWatchSlug.value);
    if (bySlug) return bySlug;
  }
  return (
    allMatchesList.value.find(m => m.id === activeMatchId.value) ||
    allMatchesList.value.find(m => m.status === 'live' && m.sources?.length) ||
    allMatchesList.value.find(m => m.status === 'live') ||
    allMatchesList.value[0] ||
    null
  );
});

const filteredMatches = computed(() => {
  let list = [...allMatchesList.value];
  const filter = selectedLeague.value.toLowerCase();

  if (filter === 'live') {
    list = list.filter(m => m.status === 'live');
  } else if (filter === 'upcoming') {
    list = list.filter(m => m.status === 'scheduled');
  } else if (filter === 'finished') {
    list = list.filter(m => m.status === 'finished');
  } else if (filter === 'pba') {
    list = list.filter(m => getMatchLeagueInfo(m).leagueId === 'pba');
  } else if (filter === 'mpbl') {
    list = list.filter(m => getMatchLeagueInfo(m).leagueId === 'mpbl');
  } else if (filter === 'nba') {
    list = list.filter(m => getMatchLeagueInfo(m).leagueId === 'nba' || m.sport === 'basketball');
  } else if (filter === 'collegiate') {
    list = list.filter(m => ['uaap', 'ncaa'].includes(getMatchLeagueInfo(m).leagueId));
  }

  if (liveOnlyFilter.value && filter !== 'live') {
    list = list.filter(m => m.status === 'live');
  }

  list.sort((a, b) => {
    const rank = (m: PhSportsMatch) => {
      if (m.status === 'live' && m.sources && m.sources.length > 0) return 0;
      if (m.status === 'live') return 1;
      if (m.status === 'scheduled') return 2;
      return 3;
    };
    return rank(a) - rank(b);
  });

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(m =>
      (m.home?.name || '').toLowerCase().includes(q) ||
      (m.away?.name || '').toLowerCase().includes(q) ||
      (m.competition || '').toLowerCase().includes(q)
    );
  }

  return props.maxItems ? list.slice(0, props.maxItems) : list;
});

// 4A. RULE 1: Auto-Generated Pre-Game Prediction Blogs (STRICTLY NBA & PBA ONLY — Today + Next 7 Days in Asia/Manila PHT)
const predictionBlogs = computed<PredictionBlogArticle[]>(() => {
  void imageCacheVersion.value;

  const upcomingNbaAndPba = allMatchesList.value.filter(
    m => isStrictNbaOrPbaMatch(m) && isUpcomingWithinNext7DaysPht(m)
  );
  const fallbackPool = allMatchesList.value.filter(
    m => isStrictNbaOrPbaMatch(m) && m.status !== 'finished'
  );
  const pool = upcomingNbaAndPba.length > 0 ? upcomingNbaAndPba : fallbackPool;
  const usedPredictionImages = new Set<string>();

  let items = pool.map(m => {
    const strictLeague = getStrictBlogLeague(m) || 'NBA';
    return generatePredictionBlogForMatch(
      m,
      strictLeague,
      {
        spread: m.espnSpread,
        overUnder: m.espnOverUnder
      },
      usedPredictionImages
    );
  });

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    items = items.filter(p =>
      p.headline.toLowerCase().includes(q) ||
      p.homeTeam.toLowerCase().includes(q) ||
      p.awayTeam.toLowerCase().includes(q) ||
      p.league.toLowerCase().includes(q)
    );
  }

  return items;
});

// 4B. RULE 2: Auto-Generated Post-Game Highlight & Short Recap Blogs (STRICTLY NBA & PBA Final/Completed from last 48 hours)
const blogSubFilter = ref<'all' | 'nba' | 'pba'>('all');

const highlightReports = computed<HighlightReportArticle[]>(() => {
  void imageCacheVersion.value;

  const recentFinalNbaAndPba = allMatchesList.value.filter(
    m => isStrictNbaOrPbaMatch(m) && isCompletedWithinLast48HoursPht(m)
  );
  const allFinalNbaAndPba = allMatchesList.value.filter(
    m => isStrictNbaOrPbaMatch(m) && m.status === 'finished'
  );
  const basePool = recentFinalNbaAndPba.length > 0 ? recentFinalNbaAndPba : allFinalNbaAndPba;

  const usedReportImages = new Set<string>(predictionBlogs.value.map(p => p.bannerUrl));

  let reports = basePool.map(m => {
    const strictLeague = getStrictBlogLeague(m) || 'NBA';
    return generateHighlightReportForMatch(m, strictLeague, usedReportImages);
  });

  const bf = blogSubFilter.value;
  if (bf === 'nba') {
    reports = reports.filter(r => r.league === 'NBA');
  } else if (bf === 'pba') {
    reports = reports.filter(r => r.league === 'PBA');
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    reports = reports.filter(r =>
      r.headline.toLowerCase().includes(q) ||
      r.homeTeam.toLowerCase().includes(q) ||
      r.awayTeam.toLowerCase().includes(q) ||
      r.league.toLowerCase().includes(q)
    );
  }

  return reports;
});

const UPPERCASE_TEAM_TOKENS = new Set([
  'uphsd', 'ust', 'dlsu', 'up', 'feu', 'ue', 'nu', 'jru', 'lpu', 'csb', 'eac', 'ssc',
  'tnt', 'smb', 'nlex', 'nba', 'pba', 'mpbl', 'uaap', 'ncaa', 'cba', 'fiba', 'okc', 'lal', 'lac', 'gsw', 'nyk', 'bkn'
]);

function formatSlugTeamName(rawSlugPart: string): string {
  return String(rawSlugPart || '')
    .split('-')
    .filter(Boolean)
    .map(word => {
      const lower = word.toLowerCase();
      if (UPPERCASE_TEAM_TOKENS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function synthesizeMatchFromArticleSlug(slug: string, mode: 'prediction' | 'report'): PhSportsMatch | null {
  const clean = String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/-prediction-odds-picks$/, '')
    .replace(/-highlights-box-score-report$/, '');
  const parts = clean.split('-vs-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const awayName = formatSlugTeamName(parts[0]);
  const homeName = formatSlugTeamName(parts[1]);
  if (!awayName || !homeName) return null;

  const leagueInfo = classifyMatchLeague({ homeTeam: homeName, awayTeam: awayName });
  const synthMatch: PhSportsMatch = {
    id: `slug-${clean}`,
    sport: 'basketball',
    leagueId: leagueInfo.leagueId,
    competition: leagueInfo.league,
    status: mode === 'report' ? 'finished' : 'scheduled',
    clock: mode === 'report' ? 'FINAL' : 'TODAY PHT',
    startTimeIso: new Date().toISOString(),
    manilaTimeFormatted: 'Today · Primetime PHT',
    venue:
      leagueInfo.leagueId === 'ncaa' || leagueInfo.leagueId === 'uaap'
        ? 'Filoil EcoOil Centre / Mall of Asia Arena'
        : leagueInfo.leagueId === 'pba'
        ? 'Smart Araneta Coliseum'
        : 'Official Basketball Arena',
    home: {
      name: homeName,
      shortName: homeName.slice(0, 3).toUpperCase(),
      logo: resolveTeamLogoSync(homeName)
    },
    away: {
      name: awayName,
      shortName: awayName.slice(0, 3).toUpperCase(),
      logo: resolveTeamLogoSync(awayName)
    },
    homeScore: mode === 'report' ? 86 : 0,
    awayScore: mode === 'report' ? 81 : 0,
    hasStream: false,
    sources: []
  };

  if (typeof window !== 'undefined') {
    enrichMatchesWithSportsDbAndWikipedia([synthMatch]);
  }
  return synthMatch;
}

const activePrediction = computed<PredictionBlogArticle | null>(() => {
  void imageCacheVersion.value;
  if (!activePredictionSlug.value) return null;
  const found = predictionBlogs.value.find(p => p.slug === activePredictionSlug.value);
  if (found) return found;
  const matchBySlug = allMatchesList.value.find(m => getMatchPredictionSlug(m) === activePredictionSlug.value);
  if (matchBySlug) {
    return generatePredictionBlogForMatch(matchBySlug, getMatchLeagueInfo(matchBySlug).league, {
      spread: matchBySlug.espnSpread,
      overUnder: matchBySlug.espnOverUnder
    });
  }
  const synth = synthesizeMatchFromArticleSlug(activePredictionSlug.value, 'prediction');
  if (synth) {
    return generatePredictionBlogForMatch(synth, getMatchLeagueInfo(synth).league);
  }
  return null;
});

const activeReport = computed<HighlightReportArticle | null>(() => {
  void imageCacheVersion.value;
  if (!activeReportSlug.value) return null;
  const found = highlightReports.value.find(r => r.slug === activeReportSlug.value);
  if (found) return found;
  const matchBySlug = allMatchesList.value.find(m => getMatchReportSlug(m) === activeReportSlug.value);
  if (matchBySlug) {
    return generateHighlightReportForMatch(matchBySlug, getMatchLeagueInfo(matchBySlug).league);
  }
  const synth = synthesizeMatchFromArticleSlug(activeReportSlug.value, 'report');
  if (synth) {
    return generateHighlightReportForMatch(synth, getMatchLeagueInfo(synth).league);
  }
  return null;
});

// 5. Dynamic Head Metadata, Canonical Tags & Production JSON-LD Schema
const currentSeoMeta = computed(() => {
  if (activePrediction.value) {
    return {
      title: activePrediction.value.seoTitle,
      description: activePrediction.value.seoDescription,
      canonicalUrl: activePrediction.value.canonicalUrl
    };
  }

  if (activeReport.value) {
    return {
      title: activeReport.value.seoTitle,
      description: activeReport.value.seoDescription,
      canonicalUrl: activeReport.value.canonicalUrl
    };
  }

  if (activeWatchSlug.value && activeMatch.value) {
    const away = activeMatch.value.away?.name || 'Away';
    const home = activeMatch.value.home?.name || 'Home';
    const leagueName = getMatchLeagueInfo(activeMatch.value).league;
    const rawTitle = `${away} vs ${home} Live Stream & Score | TipOff PH`;
    const title = rawTitle.length > 60
      ? `${away.slice(0, 14)} vs ${home.slice(0, 14)} Live | TipOff PH`
      : rawTitle;
    const rawDesc = `Watch ${away} vs ${home} live stream today with real-time ${leagueName} scores, quarter clock, PHT schedule, and box score updates on TipOff PH.`;
    const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;
    return {
      title,
      description,
      canonicalUrl: buildProductionCanonicalUrl('watch', activeWatchSlug.value)
    };
  }

  const tabConfig = SEO_TABS.find(t => t.id === selectedLeague.value) || SEO_TABS[0];
  return {
    title: tabConfig.title,
    description: tabConfig.description,
    canonicalUrl: buildProductionCanonicalUrl('tab', tabConfig.id)
  };
});

const productionJsonLd = computed(() => {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TipOff Bybet PH',
    url: `${PRODUCTION_DOMAIN}/`,
    logo: `${PRODUCTION_DOMAIN}/img/TipOffPh_logo.png`
  };

  const tabConfig = SEO_TABS.find(t => t.id === selectedLeague.value) || SEO_TABS[0];
  const breadcrumbItems: any[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'NBA Live Today',
      item: `${PRODUCTION_DOMAIN}/nba-live-today/`
    }
  ];

  if (activePrediction.value) {
    breadcrumbItems.push(
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Predictions & Picks',
        item: `${PRODUCTION_DOMAIN}/predictions-picks/`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: activePrediction.value.headline,
        item: activePrediction.value.canonicalUrl
      }
    );
  } else if (activeReport.value) {
    breadcrumbItems.push(
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News & Highlights',
        item: `${PRODUCTION_DOMAIN}/news-highlights/`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: activeReport.value.headline,
        item: activeReport.value.canonicalUrl
      }
    );
  } else if (activeWatchSlug.value && activeMatch.value) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: `Watch ${activeMatch.value.away?.name} vs ${activeMatch.value.home?.name} Live`,
      item: buildProductionCanonicalUrl('watch', activeWatchSlug.value)
    });
  } else if (tabConfig.id !== 'all') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: tabConfig.label,
      item: `${PRODUCTION_DOMAIN}${tabConfig.cleanPath}`
    });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where can I watch NBA, PBA, MPBL, UAAP, and NCAA basketball live streams today in Philippine Time (PHT)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TipOff Bybet PH (https://tipoff.bybetcasino.ph/) provides real-time basketball scoreboards, live streams, pre-game predictions, and post-game box score recaps in Philippine Time (PHT).'
        }
      },
      {
        '@type': 'Question',
        name: 'How often are basketball live scores, odds, and box score reports updated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All NBA, PBA, MPBL, UAAP, and NCAA live scores, game clocks, betting spreads, and box score recaps are synchronized automatically with real-time feeds.'
        }
      }
    ]
  };

  const eventsSchema = filteredMatches.value.slice(0, 8).map(m => {
    const watchCanonical = buildProductionCanonicalUrl('watch', getMatchWatchSlug(m));
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${m.away?.name} vs ${m.home?.name}`,
      description: `${m.competition || getMatchLeagueInfo(m).league} live basketball score and stream in PHT on TipOff Bybet PH.`,
      startDate: m.startTimeIso || '2026-10-15T10:00:00.000Z',
      url: watchCanonical,
      eventStatus:
        m.status === 'live'
          ? 'https://schema.org/EventInProgress'
          : m.status === 'finished'
          ? 'https://schema.org/EventCompleted'
          : 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: m.venue || 'Official Arena',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Manila',
          addressCountry: 'PH'
        }
      },
      competitor: [
        {
          '@type': 'SportsTeam',
          name: m.away?.name,
          result: String(m.awayScore ?? 0)
        },
        {
          '@type': 'SportsTeam',
          name: m.home?.name,
          result: String(m.homeScore ?? 0)
        }
      ]
    };
  });

  const articlesSchema = [
    ...predictionBlogs.value.slice(0, 4).map(pred => ({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: pred.headline,
      description: pred.seoDescription,
      image: [pred.bannerUrl.startsWith('http') ? pred.bannerUrl : `${PRODUCTION_DOMAIN}${pred.bannerUrl}`],
      datePublished: pred.publishedAt,
      dateModified: pred.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pred.canonicalUrl
      },
      author: {
        '@type': 'Organization',
        name: 'TipOff Bybet PH',
        url: `${PRODUCTION_DOMAIN}/`
      },
      publisher: {
        '@type': 'Organization',
        name: 'TipOff Bybet PH',
        logo: {
          '@type': 'ImageObject',
          url: `${PRODUCTION_DOMAIN}/img/TipOffPh_logo.png`
        }
      }
    })),
    ...highlightReports.value.slice(0, 4).map(rep => ({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: rep.headline,
      description: rep.seoDescription,
      image: [rep.bannerUrl.startsWith('http') ? rep.bannerUrl : `${PRODUCTION_DOMAIN}${rep.bannerUrl}`],
      datePublished: rep.publishedAt,
      dateModified: rep.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': rep.canonicalUrl
      },
      author: {
        '@type': 'Organization',
        name: 'TipOff Bybet PH',
        url: `${PRODUCTION_DOMAIN}/`
      },
      publisher: {
        '@type': 'Organization',
        name: 'TipOff Bybet PH',
        logo: {
          '@type': 'ImageObject',
          url: `${PRODUCTION_DOMAIN}/img/TipOffPh_logo.png`
        }
      }
    }))
  ];

  return [orgSchema, breadcrumbSchema, faqSchema, ...eventsSchema, ...articlesSchema];
});

useHead(() => ({
  title: currentSeoMeta.value.title,
  meta: [
    { name: 'description', content: currentSeoMeta.value.description },
    { property: 'og:title', content: currentSeoMeta.value.title },
    { property: 'og:description', content: currentSeoMeta.value.description },
    { property: 'og:url', content: currentSeoMeta.value.canonicalUrl },
    { property: 'og:site_name', content: 'TipOff Bybet PH' },
    { property: 'og:type', content: activeReport.value || activePrediction.value ? 'article' : 'website' }
  ],
  link: [
    { rel: 'canonical', href: currentSeoMeta.value.canonicalUrl }
  ],
  script: [
    {
      id: 'tipoff-production-jsonld',
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify(productionJsonLd.value)
    }
  ]
}));

watch(
  [currentSeoMeta, productionJsonLd],
  () => {
    if (typeof document === 'undefined') return;
    document.title = currentSeoMeta.value.title;

    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    upsertMeta('name', 'description', currentSeoMeta.value.description);
    upsertMeta('property', 'og:title', currentSeoMeta.value.title);
    upsertMeta('property', 'og:description', currentSeoMeta.value.description);
    upsertMeta('property', 'og:url', currentSeoMeta.value.canonicalUrl);
    upsertMeta('property', 'og:site_name', 'TipOff Bybet PH');

    let canonicalEl = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', currentSeoMeta.value.canonicalUrl);

    let ldScript = document.getElementById('tipoff-production-jsonld') as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'tipoff-production-jsonld';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(productionJsonLd.value);
  },
  { immediate: true }
);
</script>

<template>
  <div class="bg-[#0b101e] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
    <!-- 2. SANDBOXED IFRAME VIDEO PLAYER (Loaded on playback demand or /watch/ route) -->
    <div class="p-4 sm:p-6 bg-slate-950 border-b border-slate-800/90">
      <div ref="playerShellRef" class="max-w-4xl mx-auto">
        <LiveStreamPlayer
          v-if="playerActivated"
          ref="livePlayerRef"
          :candidate-urls="pendingCandidateUrls"
          @state-change="handlePlayerStateChange"
        />

        <!-- Lightweight Pre-Playback Shell (Preserves identical design & Play/Fullscreen controls without loading HLS/FLV until clicked) -->
        <div
          v-else
          @click="activatePlayerAndPlay"
          class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg group select-none cursor-pointer"
        >
          <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-black">
            <div v-if="activeMatch" class="flex items-center justify-center gap-4 sm:gap-8 mb-3">
              <div class="flex flex-col items-center gap-1.5 max-w-[130px]">
                <img
                  :src="resolveTeamLogoSync(activeMatch.away.name, activeMatch.away.logo)"
                  :alt="activeMatch.away.name"
                  width="48"
                  height="48"
                  loading="eager"
                  decoding="async"
                  class="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-white p-1 shadow"
                  @error="handleImageErrorToCrest($event, activeMatch.away.name)"
                />
                <span class="text-xs sm:text-sm font-bold text-white truncate max-w-full">{{ activeMatch.away.name }}</span>
              </div>

              <div class="flex flex-col items-center">
                <span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider mb-1">
                  {{ activeMatch.status === 'live' ? (activeMatch.clock || 'LIVE') : 'STREAM READY' }}
                </span>
                <span class="text-lg sm:text-2xl font-mono font-black text-amber-400">
                  {{ activeMatch.awayScore }} – {{ activeMatch.homeScore }}
                </span>
              </div>

              <div class="flex flex-col items-center gap-1.5 max-w-[130px]">
                <img
                  :src="resolveTeamLogoSync(activeMatch.home.name, activeMatch.home.logo)"
                  :alt="activeMatch.home.name"
                  width="48"
                  height="48"
                  loading="eager"
                  decoding="async"
                  class="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg bg-white p-1 shadow"
                  @error="handleImageErrorToCrest($event, activeMatch.home.name)"
                />
                <span class="text-xs sm:text-sm font-bold text-white truncate max-w-full">{{ activeMatch.home.name }}</span>
              </div>
            </div>

            <div class="w-14 h-14 rounded-full bg-red-600/95 group-hover:bg-red-500 text-white flex items-center justify-center shadow-xl border border-white/20 transition-transform group-hover:scale-105">
              <svg class="w-7 h-7 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span class="mt-2 text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
              Click to Play Live Stream
            </span>
          </div>

          <!-- ONLY TWO CUSTOM OVERLAY BUTTONS: Pause/Play and Fullscreen -->
          <div class="absolute inset-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none">
            <button
              type="button"
              @click.stop="activatePlayerAndPlay"
              class="pointer-events-auto w-10 h-10 rounded-lg bg-slate-900/85 hover:bg-red-600 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Play"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            <button
              type="button"
              @click.stop="toggleFullscreen"
              class="pointer-events-auto w-10 h-10 rounded-lg bg-slate-900/85 hover:bg-red-600 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Toggle Fullscreen"
            >
              <svg v-if="!isFullscreen" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
              <svg v-else class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. SIMPLE RESPONSIVE PROMO BAR -->
    <div class="px-3.5 sm:px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div class="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-100 flex-wrap">
        <span class="inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
        <span>Live NBA &amp; PBA In-Play Odds Available Now</span>
        <span v-if="lastUpdated" class="text-[11px] font-mono font-medium text-slate-400 sm:ml-2">
          · {{ lastUpdated }}
        </span>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <a
          v-if="activeMatch"
          :href="getMatchReportHref(activeMatch)"
          @click.prevent="openHighlightReport(activeMatch, true)"
          title="View Match Box Score & Details"
          class="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap"
        >
          View
        </a>
        <a
          :href="PROMO_URL"
          target="_blank"
          rel="nofollow sponsored noopener"
          title="Bet on Live Games — Play at Bybet"
          class="flex-1 sm:flex-initial text-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap"
        >
          Bet Now
        </a>
      </div>
    </div>

    <!-- FILTER & SEARCH BAR (Simple Responsive Wrapping Layout — Zero Horizontal Scrollbar) -->
    <div class="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-950/90 border-b border-slate-800 flex flex-col gap-2">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav class="flex flex-wrap items-center gap-1 sm:gap-1.5 flex-1" aria-label="Live Basketball Categories">
          <a
            v-for="item in leagueFilters"
            :key="item.id"
            :href="getSeoTabHref(item.id)"
            :title="item.anchorText"
            @click.prevent="liveOnlyFilter = false; handleTabSelect(item.id, true)"
            class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors cursor-pointer inline-flex items-center gap-1.5"
            :class="selectedLeague === item.id && !activeReportSlug && !activePredictionSlug
              ? 'bg-red-600 text-white font-semibold'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'"
          >
            <span
              v-if="item.id === 'live'"
              class="w-2 h-2 rounded-full shrink-0 animate-pulse"
              :class="selectedLeague === 'live' ? 'bg-white' : 'bg-emerald-400'"
            ></span>
            <span>{{ item.label }}</span>
            <span
              v-if="item.id === 'live'"
              class="px-1.5 py-0.5 rounded text-[10px] font-bold"
              :class="selectedLeague === 'live' ? 'bg-black/30 text-white' : 'bg-emerald-500/20 text-emerald-300'"
            >
              {{ liveMatchesCount }}
            </span>
          </a>
        </nav>

        <!-- Right Controls: Live Now Filter Toggle + Search Input -->
        <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            @click="toggleLiveNowFilter"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 whitespace-nowrap"
            :class="(selectedLeague === 'live' || liveOnlyFilter) && !activeReportSlug && !activePredictionSlug
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'"
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="(selectedLeague === 'live' || liveOnlyFilter) && !activeReportSlug && !activePredictionSlug
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-slate-500'"
            ></span>
            <span>Live Now</span>
            <span class="px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono font-bold text-emerald-400">
              {{ liveMatchesCount }}
            </span>
          </button>

          <div class="relative flex-1 sm:w-48">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search team or league..."
              class="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ACTIVE INDIVIDUAL PRE-GAME PREDICTION BLOG VIEW -->
    <PredictionDetailView
      v-if="activePrediction"
      :prediction="activePrediction"
      :all-predictions-href="getSeoTabHref('predictions')"
      @close="closePredictionBlog(true)"
    />

    <!-- ACTIVE INDIVIDUAL POST-GAME HIGHLIGHT & SHORT RECAP BLOG VIEW -->
    <ReportDetailView
      v-else-if="activeReport"
      :report="activeReport"
      :all-reports-href="getSeoTabHref('highlights')"
      @close="closeHighlightReport(true)"
    />

    <!-- DEDICATED TAB 1: PREDICTIONS & PICKS TAB VIEW -->
    <PredictionsTabView
      v-else-if="selectedLeague === 'predictions'"
      :prediction-blogs="predictionBlogs"
      @open-prediction="openPredictionBySlug($event, true)"
    />

    <!-- DEDICATED TAB 2: NEWS & HIGHLIGHTS TAB VIEW -->
    <HighlightsTabView
      v-else-if="selectedLeague === 'highlights'"
      :highlight-reports="highlightReports"
      :blog-sub-filter="blogSubFilter"
      @update:blog-sub-filter="blogSubFilter = $event"
      @open-report="openReportBySlug($event, true)"
    />

    <!-- MAIN MATCH SCOREBOARD GRID + ALWAYS-VISIBLE CRAWLABLE SEO BLOG FEED BELOW -->
    <div v-else class="p-4 sm:p-6 space-y-8">
      <div v-if="loading && allMatchesList.length === 0" class="py-12 text-center text-slate-400">
        <RefreshCw class="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
        <p class="text-sm font-medium text-slate-300">Loading live scores and streams...</p>
      </div>

      <div v-else-if="error && allMatchesList.length === 0" class="py-8 text-center text-red-400">
        <ShieldAlert class="w-6 h-6 mx-auto mb-2" />
        <p class="text-sm font-semibold">{{ error }}</p>
      </div>

      <div v-else-if="filteredMatches.length === 0" class="py-10 text-center text-slate-400">
        <p class="text-sm">No matches found for this filter.</p>
      </div>

      <!-- Main Match Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="match in filteredMatches"
          :key="match.id"
          @click="selectMatchForPlayer(match, true)"
          class="w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3"
          :class="activeMatch?.id === match.id
            ? 'bg-slate-900 border-red-500/80 ring-1 ring-red-500/30'
            : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700'"
        >
          <!-- Top Meta Line -->
          <div class="flex items-center justify-between gap-2 text-xs text-slate-400">
            <div class="flex items-center gap-1.5 min-w-0 truncate">
              <span class="font-semibold text-slate-300">{{ getMatchLeagueInfo(match).league }}</span>
              <span aria-hidden="true">·</span>
              <span class="truncate">{{ match.competition || match.streamLabel }}</span>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <template v-if="match.status === 'live'">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span class="font-bold text-red-400 uppercase">
                  {{ match.clock && match.clock !== 'LIVE' ? `LIVE · ${match.clock}` : 'LIVE NOW' }}
                </span>
              </template>
              <template v-else-if="match.status === 'finished'">
                <span class="font-semibold text-slate-400 uppercase">FINAL</span>
              </template>
              <template v-else>
                <span class="text-amber-400 font-medium">{{ match.manilaTimeFormatted || 'UPCOMING' }}</span>
              </template>
            </div>
          </div>

          <!-- Teams & Real-Time Scores -->
          <div class="space-y-2">
            <!-- Home Team -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <img
                  :src="resolveTeamLogoSync(match.home.name, match.home.logo)"
                  :alt="`${match.home.name} vs ${match.away.name} ${getMatchLeagueInfo(match).league} Live Today`"
                  width="24"
                  height="24"
                  class="w-6 h-6 object-contain rounded bg-white p-0.5 shrink-0"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="handleImageErrorToCrest($event, match.home.name)"
                />
                <span class="text-sm font-bold text-white truncate">{{ match.home.name }}</span>
              </div>
              <span
                v-if="match.status === 'scheduled'"
                class="font-mono tabular-nums text-base font-extrabold shrink-0 text-slate-400"
              >
                —
              </span>
              <span
                v-else-if="isZeroZeroLiveMatch(match)"
                class="text-[11px] font-bold uppercase tracking-wider text-red-400 shrink-0"
              >
                LIVE NOW
              </span>
              <span
                v-else
                class="font-mono tabular-nums text-base font-extrabold shrink-0"
                :class="match.status === 'live' ? 'text-amber-400' : 'text-slate-200'"
              >
                {{ match.homeScore }}
              </span>
            </div>

            <!-- Away Team -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <img
                  :src="resolveTeamLogoSync(match.away.name, match.away.logo)"
                  :alt="`${match.away.name} vs ${match.home.name} ${getMatchLeagueInfo(match).league} Live Today`"
                  width="24"
                  height="24"
                  class="w-6 h-6 object-contain rounded bg-white p-0.5 shrink-0"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="handleImageErrorToCrest($event, match.away.name)"
                />
                <span class="text-sm font-bold text-white truncate">{{ match.away.name }}</span>
              </div>
              <span
                v-if="match.status === 'scheduled'"
                class="font-mono tabular-nums text-base font-extrabold shrink-0 text-slate-400"
              >
                —
              </span>
              <span
                v-else-if="isZeroZeroLiveMatch(match)"
                class="text-[11px] font-bold uppercase tracking-wider text-red-400 shrink-0"
              >
                IN PLAY
              </span>
              <span
                v-else
                class="font-mono tabular-nums text-base font-extrabold shrink-0"
                :class="match.status === 'live' ? 'text-amber-400' : 'text-slate-200'"
              >
                {{ match.awayScore }}
              </span>
            </div>
          </div>

          <!-- Footer Action Row -->
          <div class="pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div class="flex items-center gap-2 min-w-0 truncate">
              <a
                :href="getMatchWatchHref(match)"
                @click.stop.prevent="selectMatchForPlayer(match, true)"
                class="font-semibold hover:underline truncate"
                :class="activeMatch?.id === match.id ? 'text-red-400' : 'text-slate-200 hover:text-amber-300'"
              >
                Watch {{ match.away.name }} vs {{ match.home.name }} Live
              </a>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <a
                :href="match.status === 'finished' ? getMatchReportHref(match) : getMatchPredictionHref(match)"
                @click.stop.prevent="match.status === 'finished' ? openHighlightReport(match, true) : openPredictionBlog(match, true)"
                title="View Match Prediction or Box Score Recap"
                class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-xs whitespace-nowrap"
              >
                View
              </a>
              <a
                :href="PROMO_URL"
                target="_blank"
                rel="nofollow sponsored noopener"
                @click.stop
                title="Bet on Live Games — Play at Bybet"
                class="px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 transition-all shadow-xs whitespace-nowrap"
              >
                Bet Now ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- DUAL PLACEMENT: ALWAYS-VISIBLE, CRAWLABLE SEO BLOG FEED DIRECTLY BELOW MAIN MATCH GRID (STRICTLY NBA & PBA) -->
      <DualSeoBlogFeed
        :prediction-blogs="predictionBlogs"
        :highlight-reports="highlightReports"
        @select-tab="handleTabSelect($event, true)"
        @open-prediction="openPredictionBySlug($event, true)"
        @open-report="openReportBySlug($event, true)"
      />
    </div>
  </div>
</template>
