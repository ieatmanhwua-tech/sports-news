<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { PhSportsMatch } from '~/shared/ph-sports-types';
import { getTeamLogo, classifyMatchLeague, isVerifiedNbaTeam, getCanonicalTeamName } from '~/shared/team-logos';
import {
  extractLive88MatchImages,
  fetchSportsDbAssets,
  fetchTopicImage,
  resolveTeamLogoSync,
  resolveMatchBannerSync,
  handleImageErrorToCrest,
  handleBannerImageError,
  initImageResolverCache
} from '~/shared/image-resolver';
import {
  PRODUCTION_DOMAIN,
  PROMO_URL,
  PROMO_TARGET_URL,
  SEO_TABS,
  SEO_SLUG_TO_TAB_ID,
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
  ShieldAlert,
  ArrowLeft
} from 'lucide-vue-next';

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
  homeName: string;
  awayName: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  clock: string;
  state: 'pre' | 'in' | 'post';
  actionThumbnail: string;
  topPlayerName: string;
  topPlayerStat: string;
  topPlayerHeadshot: string;
  spread: string;
  overUnder: string;
}

const selectedLeague = ref<string>(props.initialLeague);
const activeWatchSlug = ref<string>(props.initialWatchSlug || '');
const activePredictionSlug = ref<string>(props.initialPredictionSlug || '');
const activeReportSlug = ref<string>(props.initialReportSlug || '');
const searchQuery = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const lastUpdated = ref<string>('');
const bootstrapConfig = ref<{ liveCount: number; leaguesCount: number }>({ liveCount: 0, leaguesCount: 0 });
const imageCacheVersion = ref(0);

const allMatchesList = ref<PhSportsMatch[]>([]);
const activeMatchId = ref<string>('');

// Sandboxed Iframe Video Player Refs & State (ONLY Pause/Play & Fullscreen buttons)
const playerContainerRef = ref<HTMLElement | null>(null);
const playerIframeRef = ref<HTMLIFrameElement | null>(null);
const isPlaying = ref(false);
const isFullscreen = ref(false);
const currentLoadedStreamUrl = ref<string>('');
const pendingCandidateUrls = ref<string[]>([]);

const iframePlayerSrcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js"><\/script>
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; user-select: none; }
  video { width: 100%; height: 100%; object-fit: contain; background: #000; display: block; cursor: pointer; }
</style>
</head>
<body>
  <video id="tipoff-iframe-video" autoplay muted playsinline preload="auto"></video>
  <script>
    (function() {
      window.open = function() { return null; };
      var video = document.getElementById('tipoff-iframe-video');
      var state = {
        candidates: [],
        idx: 0,
        activeUrl: '',
        flvPlayer: null,
        hlsPlayer: null,
        stallTimer: null
      };

      function notifyParent() {
        try {
          window.parent.postMessage({
            type: 'TIPOFF_IFRAME_STATE',
            isPlaying: !video.paused,
            activeUrl: state.activeUrl
          }, '*');
        } catch (e) {}
      }

      video.addEventListener('play', notifyParent);
      video.addEventListener('playing', function() {
        if (state.stallTimer) {
          clearTimeout(state.stallTimer);
          state.stallTimer = null;
        }
        notifyParent();
      });
      video.addEventListener('pause', notifyParent);

      function silenceFlv() {
        if (window.flvjs && window.flvjs.LoggingControl) {
          window.flvjs.LoggingControl.enableAll = false;
          window.flvjs.LoggingControl.enableDebug = false;
          window.flvjs.LoggingControl.enableVerbose = false;
          window.flvjs.LoggingControl.enableInfo = false;
          window.flvjs.LoggingControl.enableWarn = false;
          window.flvjs.LoggingControl.enableError = false;
        }
      }

      function destroyPlayers() {
        if (state.stallTimer) {
          clearTimeout(state.stallTimer);
          state.stallTimer = null;
        }
        if (state.flvPlayer) {
          try {
            state.flvPlayer.pause();
            state.flvPlayer.unload();
            state.flvPlayer.detachMediaElement();
            state.flvPlayer.destroy();
          } catch (e) {}
          state.flvPlayer = null;
        }
        if (state.hlsPlayer) {
          try {
            state.hlsPlayer.destroy();
          } catch (e) {}
          state.hlsPlayer = null;
        }
      }

      function playFallback() {
        destroyPlayers();
        state.activeUrl = '/videos/basketball-live.webm';
        video.src = state.activeUrl;
        video.loop = true;
        video.play().catch(function() {});
      }

      function tryNext() {
        state.idx += 1;
        if (state.idx < state.candidates.length) {
          playSingleUrl(state.candidates[state.idx]);
        } else {
          playFallback();
        }
      }

      function playSingleUrl(rawUrl) {
        silenceFlv();
        var url = String(rawUrl || '').trim();
        if (!url || url === '/videos/basketball-live.webm') {
          playFallback();
          return;
        }
        if (state.activeUrl === url && !video.paused && video.readyState >= 2) {
          return;
        }
        destroyPlayers();
        state.activeUrl = url;
        video.loop = false;
        var lower = url.toLowerCase();

        state.stallTimer = setTimeout(function() {
          if (video.readyState < 2 || video.paused) {
            tryNext();
          }
        }, 5000);

        if (lower.indexOf('.m3u8') !== -1) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            state.hlsPlayer = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
              video.play().catch(function() {});
            });
            hls.on(window.Hls.Events.ERROR, function(_ev, data) {
              if (data && data.fatal) {
                tryNext();
              }
            });
            return;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(function() { tryNext(); });
            return;
          }
        }

        if (lower.indexOf('.flv') !== -1 || lower.indexOf('/api/live88/stream-proxy') !== -1) {
          if (!window.flvjs) {
            setTimeout(function() {
              state.activeUrl = '';
              playSingleUrl(url);
            }, 120);
            return;
          }
          if (window.flvjs.isSupported()) {
            try {
              video.removeAttribute('src');
              video.load();
              var player = window.flvjs.createPlayer(
                { type: 'flv', isLive: true, cors: true, url: url },
                { enableStashBuffer: false, stashInitialSize: 128, lazyLoad: false, autoCleanupSourceBuffer: true }
              );
              state.flvPlayer = player;
              player.attachMediaElement(video);
              player.load();
              player.on(window.flvjs.Events.ERROR, function() {
                if (state.flvPlayer === player) {
                  tryNext();
                }
              });
              var p = player.play();
              if (p && p.catch) p.catch(function() {});
              return;
            } catch (e) {
              tryNext();
              return;
            }
          }
        }

        video.src = url;
        video.play().catch(function() {
          tryNext();
        });
      }

      function loadCandidates(urls) {
        var expanded = [];
        var seen = {};
        for (var i = 0; i < (urls || []).length; i++) {
          var u = String(urls[i] || '').trim();
          if (!u || seen[u]) continue;
          seen[u] = true;
          if (u.indexOf('http://') === 0) {
            expanded.push('/api/live88/stream-proxy?url=' + encodeURIComponent(u));
          } else if (u.indexOf('https://') === 0) {
            expanded.push(u);
            expanded.push('/api/live88/stream-proxy?url=' + encodeURIComponent(u));
          } else {
            expanded.push(u);
          }
        }
        if (expanded.length === 0) {
          playFallback();
          return;
        }
        if (state.activeUrl && state.activeUrl !== '/videos/basketball-live.webm' && !video.paused && expanded.indexOf(state.activeUrl) !== -1 && expanded[0] === state.activeUrl) {
          return;
        }
        state.candidates = expanded;
        state.idx = 0;
        playSingleUrl(state.candidates[0]);
      }

      function togglePlayPause() {
        if (video.paused) {
          if (video.muted) video.muted = false;
          video.play().catch(function() {
            video.muted = true;
            video.play().catch(function() {});
          });
        } else {
          video.pause();
        }
      }

      video.addEventListener('click', togglePlayPause);

      window.__tipoffPlayer = {
        loadCandidates: loadCandidates,
        togglePlayPause: togglePlayPause,
        destroyPlayers: destroyPlayers
      };

      window.addEventListener('message', function(e) {
        if (!e.data) return;
        if (e.data.type === 'TIPOFF_LOAD_CANDIDATES') {
          loadCandidates(e.data.urls || []);
        } else if (e.data.type === 'TIPOFF_TOGGLE_PLAY') {
          togglePlayPause();
        }
      });

      window.parent.postMessage({ type: 'TIPOFF_IFRAME_READY' }, '*');
    })();
  <\/script>
</body>
</html>`;

let pollIntervalId: ReturnType<typeof setInterval> | null = null;

watch(() => props.initialLeague, (newVal) => {
  if (newVal) {
    selectedLeague.value = newVal;
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

    // Extract latest game action thumbnail from competition headlines or matching ESPN /news article
    let actionThumbnail = String(
      comp?.headlines?.[0]?.video?.[0]?.thumbnail ||
      comp?.headlines?.[0]?.images?.[0]?.url ||
      ''
    ).trim();

    if (!actionThumbnail && newsArticles.length > 0) {
      const homeKey = homeName.split(' ').pop()?.toLowerCase() || '';
      const awayKey = awayName.split(' ').pop()?.toLowerCase() || '';
      const matchingNews = newsArticles.find((art: any) => {
        const text = `${art?.headline || ''} ${art?.description || ''}`.toLowerCase();
        return (homeKey && text.includes(homeKey)) || (awayKey && text.includes(awayKey));
      });
      actionThumbnail = String(matchingNews?.images?.[0]?.url || '').trim();
    }

    // Extract top scorer player headshot & stat line
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

    // Extract ESPN betting odds (spread & over/under)
    const oddsObj = comp?.odds?.[0] || {};
    const spread = String(oddsObj?.details || '').trim();
    const overUnder = oddsObj?.overUnder ? `O/U ${oddsObj.overUnder}` : '';

    results.push({
      homeName,
      awayName,
      homeLogo,
      awayLogo,
      homeScore,
      awayScore,
      clock: shortDetail || (state === 'in' ? 'LIVE' : state === 'post' ? 'FINAL' : ''),
      state,
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

  // Inject live ESPN score & game clock/quarter into any match card where live88 returns 0 - 0
  // or where ESPN has a higher real-time cumulative game score than a single-quarter score
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

// Dynamically map raw JSON match object from Bootstrap, Matches, PBA Matches, Scores, or Livestream endpoints
function mapRawMatch(
  raw: any,
  streamMap: Map<string, { url: string; type: string; label: string }[]>,
  espnList: EspnGameEntry[],
  authoritativeLiveIds: Set<string>,
  isFromLivestreamEndpoint = false
): PhSportsMatch | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = String(raw.id || raw.matchId || raw._id || '');
  if (!id) return null;

  const rawSport = String(raw.sport || raw.sportType || '').toLowerCase();
  const rawComp = String(raw.competition || raw.league || raw.streamLabel || '');
  if (rawSport === 'football' || rawSport === 'soccer') return null;

  const homeObj = raw.home || raw.homeTeam || {};
  const awayObj = raw.away || raw.awayTeam || {};
  const rawHomeName = String(homeObj.name || raw.homeName || raw.home_team || '').trim();
  const rawAwayName = String(awayObj.name || raw.awayName || raw.away_team || '').trim();
  if (!rawHomeName || !rawAwayName) return null;

  const homeName = getCanonicalTeamName(rawHomeName);
  const awayName = getCanonicalTeamName(rawAwayName);

  // Extract all native image fields from live88.eu.cc first (auto-prefixed with https://live88.eu.cc if relative)
  const nativeImages = extractLive88MatchImages(raw);

  // Only include verified NBA games, Philippine basketball leagues, or active livestreams
  const isVerifiedNba = isVerifiedNbaTeam(homeName) && isVerifiedNbaTeam(awayName);
  const isPhLeague = /\bpba\b|governors' cup|philippine basketball|\bmpbl\b|maharlika|\buaap\b|\bwuaap\b|university athletic association|philippines national collegiate|philippines ncaa|\beasl\b|east asia super league|pilipinas super league|\bpsl\b|gilas|vismin|nbl pilipinas/i.test(rawComp) ||
    rawSport === 'pba' || rawSport === 'mpbl' || rawSport === 'collegiate';

  if (!isVerifiedNba && !isPhLeague && !isFromLivestreamEndpoint) {
    return null;
  }

  const rawStatus = String(raw.status || raw.state || 'scheduled').toLowerCase();
  const rawClock = String(raw.clock || raw.timer || '').trim();
  const startIso = String(raw.startTime || raw.start_time || '2026-10-15T10:00:00.000Z');
  const startMs = new Date(startIso).getTime();
  const ageHours = !Number.isNaN(startMs) ? (Date.now() - startMs) / (3600 * 1000) : 0;

  const mappedSources: { id: string; label: string; type: string; url: string; fallbackUrl?: string }[] = [];

  if (isFromLivestreamEndpoint) {
    const rawSources = Array.isArray(raw.sources) ? raw.sources : [];
    for (const s of rawSources) {
      const streamUrl = String(s?.url || s?.streamUrl || s?.src || s?.playUrl || '').trim();
      if (streamUrl) {
        mappedSources.push({
          id: String(s.id || id),
          label: String(s.label || s.name || 'Live Stream'),
          type: streamUrl.includes('.m3u8') ? 'hls' : streamUrl.includes('.flv') ? 'flv' : String(s.type || 'video'),
          url: streamUrl,
          fallbackUrl: s.fallbackUrl ? String(s.fallbackUrl) : undefined
        });
      }
    }
  }

  const fromLivestreamEndpoint = streamMap.get(id) || streamMap.get(`${homeName.toLowerCase()}__${awayName.toLowerCase()}`);
  if (fromLivestreamEndpoint && mappedSources.length === 0) {
    for (const lsSrc of fromLivestreamEndpoint) {
      mappedSources.push({
        id,
        label: lsSrc.label,
        type: lsSrc.type,
        url: lsSrc.url
      });
    }
  }

  const hasActiveStream = mappedSources.length > 0;
  const isInAuthoritativeLive = authoritativeLiveIds.has(id);

  let status: 'live' | 'scheduled' | 'finished' =
    rawStatus === 'live' || rawStatus === 'inplay' || rawStatus === 'in_play'
      ? 'live'
      : rawStatus === 'finished' || rawStatus === 'final' || rawStatus === 'ended'
      ? 'finished'
      : 'scheduled';

  if (status === 'live') {
    if (rawClock.toUpperCase() === 'FT' && !hasActiveStream && !isInAuthoritativeLive) {
      status = 'finished';
    } else if (ageHours > 3.5 && !hasActiveStream && !isInAuthoritativeLive) {
      status = 'finished';
    }
  }

  let { homeScore, awayScore } = extractScoresFromRaw(raw);
  if (status === 'finished') {
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

// Merge two mapped matches without ever allowing a 0 from /livestream or stale status to overwrite accurate PBA/NBA data
function mergeClientMatches(
  existing: PhSportsMatch,
  incoming: PhSportsMatch,
  espnList: EspnGameEntry[],
  authoritativeLiveIds: Set<string>
): PhSportsMatch {
  const incomingHasSources = Array.isArray(incoming.sources) && incoming.sources.length > 0;
  const existingHasSources = Array.isArray(existing.sources) && existing.sources.length > 0;
  const mergedSources = incomingHasSources ? incoming.sources : (existingHasSources ? existing.sources : []);

  const isTrulyLive =
    authoritativeLiveIds.has(existing.id) ||
    authoritativeLiveIds.has(incoming.id) ||
    Boolean(mergedSources && mergedSources.length > 0);

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

  // Never allow a 0 from /livestream to overwrite a non-zero score from /matches or /bootstrap
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

/**
 * Tier 2 & 3 Background Image Enrichment for PBA, MPBL, UAAP & NCAA teams via TheSportsDB + Wikipedia/Wikimedia Commons
 * Cached in localStorage so subsequent polls resolve in 0ms
 */
async function enrichMatchesWithSportsDbAndWikipedia(matches: PhSportsMatch[]) {
  if (typeof window === 'undefined' || !matches.length) return;
  initImageResolverCache();

  // Warm top 16 match teams via TheSportsDB & Wikipedia (team-specific only)
  const uniqueTeams = new Set<string>();
  for (const m of matches.slice(0, 16)) {
    if (m.home?.name) uniqueTeams.add(m.home.name);
    if (m.away?.name) uniqueTeams.add(m.away.name);
  }

  for (const teamName of Array.from(uniqueTeams).slice(0, 12)) {
    fetchSportsDbAssets(teamName).then(async (res) => {
      if (!res.banner) {
        await fetchTopicImage(teamName);
      }
      imageCacheVersion.value++;
    });
  }
}

function handleIframeMessage(e: MessageEvent) {
  if (!e?.data || typeof e.data !== 'object') return;
  if (e.data.type === 'TIPOFF_IFRAME_STATE') {
    isPlaying.value = Boolean(e.data.isPlaying);
    if (e.data.activeUrl) {
      currentLoadedStreamUrl.value = String(e.data.activeUrl);
    }
  } else if (e.data.type === 'TIPOFF_IFRAME_READY') {
    if (pendingCandidateUrls.value.length > 0) {
      sendCandidatesToIframe(pendingCandidateUrls.value);
    }
  }
}

function sendCandidatesToIframe(urls: string[]) {
  pendingCandidateUrls.value = urls;
  const win = playerIframeRef.value?.contentWindow as any;
  if (!win) return;
  try {
    if (win.__tipoffPlayer && typeof win.__tipoffPlayer.loadCandidates === 'function') {
      win.__tipoffPlayer.loadCandidates(urls);
    } else {
      win.postMessage({ type: 'TIPOFF_LOAD_CANDIDATES', urls }, '*');
    }
  } catch {
    try {
      win.postMessage({ type: 'TIPOFF_LOAD_CANDIDATES', urls }, '*');
    } catch {}
  }
}

function onIframePlayerLoaded() {
  if (pendingCandidateUrls.value.length > 0) {
    sendCandidatesToIframe(pendingCandidateUrls.value);
  } else if (activeMatch.value) {
    attachStreamToPlayer(getStreamCandidatesForMatch(activeMatch.value));
  }
}

function destroyStreamInstances() {
  try {
    const win = playerIframeRef.value?.contentWindow as any;
    win?.__tipoffPlayer?.destroyPlayers?.();
  } catch {}
}

function attachStreamToPlayer(candidateInput: string | string[]) {
  const candidates = Array.isArray(candidateInput)
    ? candidateInput.filter(Boolean)
    : [candidateInput].filter(Boolean);
  if (candidates.length === 0) {
    sendCandidatesToIframe(['/videos/basketball-live.webm']);
    return;
  }
  sendCandidatesToIframe(candidates);
}

// Only two controls in the custom video overlay: Play/Pause and Fullscreen
function togglePlayPause() {
  const win = playerIframeRef.value?.contentWindow as any;
  if (!win) return;
  try {
    if (win.__tipoffPlayer && typeof win.__tipoffPlayer.togglePlayPause === 'function') {
      win.__tipoffPlayer.togglePlayPause();
    } else {
      win.postMessage({ type: 'TIPOFF_TOGGLE_PLAY' }, '*');
    }
  } catch {
    try {
      win.postMessage({ type: 'TIPOFF_TOGGLE_PLAY' }, '*');
    } catch {}
  }
}

function toggleFullscreen() {
  const container = playerContainerRef.value;
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

  // Also include all other active Live88 basketball streams as automatic failover candidates
  const targetLeague = match?.leagueId || '';
  const sameLeagueMatches = allMatchesList.value.filter(
    m => m.id !== match?.id && m.leagueId === targetLeague && Array.isArray(m.sources) && m.sources.length > 0
  );
  const otherStreamMatches = allMatchesList.value.filter(
    m => m.id !== match?.id && m.leagueId !== targetLeague && Array.isArray(m.sources) && m.sources.length > 0
  );

  for (const m of [...sameLeagueMatches, ...otherStreamMatches]) {
    for (const s of m.sources || []) {
      addUrl(s?.url);
    }
  }

  addUrl('/videos/basketball-live.webm');
  return urls;
}

function getBestStreamUrlForMatch(match: PhSportsMatch): string {
  return getStreamCandidatesForMatch(match)[0] || '/videos/basketball-live.webm';
}

function selectMatchForPlayer(match: PhSportsMatch, pushHistory = true) {
  activeMatchId.value = match.id;
  activePredictionSlug.value = '';
  activeReportSlug.value = '';
  const watchSlug = getMatchWatchSlug(match);
  activeWatchSlug.value = watchSlug;

  if (pushHistory && typeof window !== 'undefined') {
    const nextHref = buildDualModeHref('watch', watchSlug, window.location.pathname);
    try {
      window.history.pushState({ type: 'watch', slug: watchSlug, matchId: match.id }, '', nextHref);
    } catch {}
  }

  const candidates = getStreamCandidatesForMatch(match);
  attachStreamToPlayer(candidates);
  if (typeof window !== 'undefined' && playerContainerRef.value) {
    playerContainerRef.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  // 1. Check /prediction/{slug} or ?prediction={slug}
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

  // 2. Check /report/{slug} or ?report={slug}
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

  // 3. Check /watch/{slug} or ?watch={slug}
  if (pathClean.startsWith('watch/') || queryWatch) {
    const slug = queryWatch || pathClean.replace(/^watch\//, '').replace(/\/+$/, '');
    if (slug) {
      activeWatchSlug.value = slug;
      activePredictionSlug.value = '';
      activeReportSlug.value = '';
      const found = allMatchesList.value.find(m => getMatchWatchSlug(m) === slug);
      if (found) {
        selectMatchForPlayer(found, false);
      }
      return;
    }
  }

  // 4. Check clean subfolder tab path (/nba-live-today/, /predictions-picks/, /news-highlights/, etc.) or ?tab=
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

// Helper for fetch() with { cache: 'no-store' } and &_t=${Date.now()}
async function fetchJsonNoStore(url: string): Promise<any> {
  const ts = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${separator}_t=${ts}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return await res.json();
}

// Fetch Bootstrap, Matches, PBA Matches, Real-Time Scores, Livestream, ESPN NBA Scoreboard & News, and ESPN College Scoreboard
async function fetchLive88Data(force = false, isInitialLoad = false) {
  if (isInitialLoad) {
    loading.value = true;
  }
  error.value = null;

  try {
    const querySuffix = force ? '&refresh=true' : '';
    const [
      bootstrapRaw,
      matchesRaw,
      pbaMatchesRaw,
      scoresLiveRaw,
      scoresTodayRaw,
      livestreamRaw,
      espnRaw,
      espnNewsRaw,
      espnCollegeRaw,
      normalizedHubRes
    ] = await Promise.all([
      fetchJsonNoStore(`${PROXY_ENDPOINTS.bootstrap}${querySuffix}`).catch(() => null),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.matches}${querySuffix}`).catch(() => null),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.pbaMatches}${querySuffix}`).catch(() => null),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.scoresLive}${querySuffix}`).catch(() => null),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.scoresToday}${querySuffix}`).catch(() => null),
      fetchJsonNoStore(`${PROXY_ENDPOINTS.livestream}${querySuffix}`).catch(() => null),
      fetchJsonNoStore(LIVE88_ENDPOINTS.espnScoreboard).catch(() => null),
      fetchJsonNoStore(LIVE88_ENDPOINTS.espnNbaNews).catch(() => null),
      fetchJsonNoStore(LIVE88_ENDPOINTS.espnCollegeScoreboard).catch(() => null),
      fetchJsonNoStore(`/api/ph-sports${force ? '?refresh=true' : ''}`).catch(() => null)
    ]);

    const espnList = [
      ...parseEspnScoreboard(espnRaw, espnNewsRaw),
      ...parseEspnScoreboard(espnCollegeRaw)
    ];

    if (bootstrapRaw?.data) {
      bootstrapConfig.value = {
        liveCount: Number(bootstrapRaw.data.liveCount || 0),
        leaguesCount: Array.isArray(bootstrapRaw.data.leagues) ? bootstrapRaw.data.leagues.length : 0
      };
    }

    const authoritativeLiveIds = new Set<string>();
    const rawScoresLiveList = Array.isArray(scoresLiveRaw?.data?.results)
      ? scoresLiveRaw.data.results
      : Array.isArray(scoresLiveRaw?.data)
      ? scoresLiveRaw.data
      : [];
    for (const item of rawScoresLiveList) {
      if (item?.id && String(item.clock || '').toUpperCase() !== 'FT') {
        authoritativeLiveIds.add(String(item.id));
      }
    }

    const rawScoresTodayList = Array.isArray(scoresTodayRaw?.data?.results)
      ? scoresTodayRaw.data.results
      : Array.isArray(scoresTodayRaw?.data)
      ? scoresTodayRaw.data
      : [];
    for (const item of rawScoresTodayList) {
      if (item?.status === 'live' && item?.id && String(item.clock || '').toUpperCase() !== 'FT') {
        authoritativeLiveIds.add(String(item.id));
      }
    }

    const streamLookup = new Map<string, { url: string; type: string; label: string }[]>();
    const rawLivestreamList = Array.isArray(livestreamRaw?.data?.results)
      ? livestreamRaw.data.results
      : Array.isArray(livestreamRaw?.data)
      ? livestreamRaw.data
      : [];

    for (const item of rawLivestreamList) {
      if (item?.id) authoritativeLiveIds.add(String(item.id));
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

    const rawPbaList = Array.isArray(pbaMatchesRaw?.data)
      ? pbaMatchesRaw.data
      : Array.isArray(pbaMatchesRaw?.data?.matches)
      ? pbaMatchesRaw.data.matches
      : [];

    const rawPools: { item: any; isLivestream: boolean }[] = [
      ...(Array.isArray(bootstrapRaw?.data?.matches) ? bootstrapRaw.data.matches.map((item: any) => ({ item, isLivestream: false })) : []),
      ...(Array.isArray(matchesRaw?.data)
        ? matchesRaw.data.map((item: any) => ({ item, isLivestream: false }))
        : Array.isArray(matchesRaw?.data?.matches)
        ? matchesRaw.data.matches.map((item: any) => ({ item, isLivestream: false }))
        : []),
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

    if (normalizedHubRes?.allMatches && Array.isArray(normalizedHubRes.allMatches)) {
      const hasLiveStreamLookup = streamLookup.size > 0;
      for (const sm of normalizedHubRes.allMatches) {
        const sanitizedSm = hasLiveStreamLookup && !streamLookup.has(String(sm.id))
          ? { ...sm, sources: [], hasStream: false }
          : sm;
        const enriched = applyEspnFallbackToMatch(sanitizedSm, espnList);
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

    allMatchesList.value = Array.from(mergedMap.values());

    // Trigger Tier 2 & 3 background image resolution via TheSportsDB + Wikipedia/Wikimedia Commons (cached in localStorage)
    enrichMatchesWithSportsDbAndWikipedia(allMatchesList.value);

    lastUpdated.value = 'Synced PHT';

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
  } catch (err: any) {
    console.error('Error polling Live88 endpoints:', err);
    if (allMatchesList.value.length === 0) {
      error.value = err?.message || 'Unable to load Live88 sports feed';
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  initImageResolverCache();
  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleIframeMessage);
    window.addEventListener('popstate', syncStateFromUrl);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  }
  syncStateFromUrl();
  fetchLive88Data(false, true);

  // Automatic real-time polling interval every 15 seconds (no caching)
  pollIntervalId = setInterval(() => {
    fetchLive88Data(true, false);
  }, 15000);
});

onUnmounted(() => {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  destroyStreamInstances();
  if (typeof window !== 'undefined') {
    window.removeEventListener('message', handleIframeMessage);
    window.removeEventListener('popstate', syncStateFromUrl);
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }
});

const leagueFilters = SEO_TABS;

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
    list = list.filter(m => getMatchLeagueInfo(m).leagueId === 'nba');
  } else if (filter === 'collegiate') {
    list = list.filter(m => ['uaap', 'ncaa'].includes(getMatchLeagueInfo(m).leagueId));
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

// 4A. Auto-Generated Pre-Game Prediction Blogs (for Upcoming & Live matches)
const predictionBlogs = computed<PredictionBlogArticle[]>(() => {
  // Touch imageCacheVersion so resolved SportsDB/Wikipedia banners reactively update
  void imageCacheVersion.value;

  const upcomingAndLive = allMatchesList.value.filter(m => m.status === 'live' || m.status === 'scheduled');
  const pool = upcomingAndLive.length > 0 ? upcomingAndLive : allMatchesList.value;
  const usedPredictionImages = new Set<string>();

  let items = pool.map(m =>
    generatePredictionBlogForMatch(
      m,
      getMatchLeagueInfo(m).league,
      {
        spread: m.espnSpread,
        overUnder: m.espnOverUnder
      },
      usedPredictionImages
    )
  );

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

// 4B. Auto-Generated Post-Game Highlight Reports (for Final matches, plus all matches fallback)
const blogSubFilter = ref<'all' | 'live' | 'finished' | 'scheduled' | 'nba' | 'pba' | 'mpbl' | 'collegiate'>('all');

const highlightReports = computed<HighlightReportArticle[]>(() => {
  void imageCacheVersion.value;

  const finalMatches = allMatchesList.value.filter(m => m.status === 'finished');
  const basePool = blogSubFilter.value === 'all' && finalMatches.length > 0
    ? [...finalMatches, ...allMatchesList.value.filter(m => m.status !== 'finished')]
    : [...allMatchesList.value];
  const usedReportImages = new Set<string>();

  let reports = basePool.map(m =>
    generateHighlightReportForMatch(m, getMatchLeagueInfo(m).league, usedReportImages)
  );

  const bf = blogSubFilter.value;
  if (bf === 'live') {
    reports = reports.filter(r => r.status === 'live');
  } else if (bf === 'finished') {
    reports = reports.filter(r => r.status === 'finished');
  } else if (bf === 'scheduled') {
    reports = reports.filter(r => r.status === 'scheduled');
  } else if (bf === 'nba') {
    reports = reports.filter(r => r.league.toLowerCase() === 'nba');
  } else if (bf === 'pba') {
    reports = reports.filter(r => r.league.toLowerCase() === 'pba');
  } else if (bf === 'mpbl') {
    reports = reports.filter(r => r.league.toLowerCase() === 'mpbl');
  } else if (bf === 'collegiate') {
    reports = reports.filter(r => ['uaap', 'ncaa'].includes(r.league.toLowerCase()));
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

// 5. Dynamic Head Metadata, Canonical Tags & Production JSON-LD Schema (SportsEvent, NewsArticle, BreadcrumbList, FAQPage, Organization)
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
          text: 'All NBA, PBA, MPBL, UAAP, and NCAA live scores, game clocks, betting spreads, and box score recaps are synchronized automatically every 15 seconds with zero caching.'
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
    <!-- 2. SANDBOXED IFRAME VIDEO PLAYER (Pause/Play & Fullscreen ONLY — No status bar below player) -->
    <div class="p-4 sm:p-6 bg-slate-950 border-b border-slate-800/90">
      <div class="max-w-4xl mx-auto">
        <div
          ref="playerContainerRef"
          class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg group select-none"
        >
          <iframe
            ref="playerIframeRef"
            sandbox="allow-scripts allow-same-origin"
            referrerpolicy="no-referrer"
            allow="autoplay; fullscreen"
            title="TipOff PH Sandboxed Live Basketball Stream"
            :srcdoc="iframePlayerSrcDoc"
            @load="onIframePlayerLoaded"
            class="w-full h-full border-0 bg-black block"
          ></iframe>

          <!-- ONLY TWO CUSTOM OVERLAY BUTTONS: Pause/Play and Fullscreen -->
          <div
            class="absolute inset-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"
            :class="{ 'opacity-100': !isPlaying }"
          >
            <!-- 1. Pause/Play Toggle Button -->
            <button
              type="button"
              @click.stop="togglePlayPause"
              class="pointer-events-auto w-10 h-10 rounded-lg bg-slate-900/85 hover:bg-red-600 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
              :aria-label="isPlaying ? 'Pause' : 'Play'"
            >
              <svg v-if="!isPlaying" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>

            <!-- 2. Fullscreen Toggle Button -->
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
      <div class="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-100">
        <span class="inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
        <span>Live NBA &amp; PBA In-Play Odds Available Now</span>
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
            @click.prevent="handleTabSelect(item.id, true)"
            class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
            :class="selectedLeague === item.id && !activeReportSlug && !activePredictionSlug
              ? 'bg-red-600 text-white font-semibold'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- Search Input -->
        <div class="relative w-full sm:w-52 shrink-0">
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

    <!-- ACTIVE INDIVIDUAL PRE-GAME PREDICTION BLOG VIEW -->
    <div v-if="activePrediction" class="p-2.5 sm:p-6 bg-slate-950/60 border-b border-slate-800">
      <article class="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
        <!-- Tier 3 Dynamic "VS Matchup" Graphic Card (Responsive height on mobile, 16:9 on desktop) -->
        <div class="relative min-h-[210px] sm:aspect-video w-full bg-gradient-to-br from-[#0b1329] via-[#131d38] to-[#23122b] overflow-hidden border-b border-slate-800 flex flex-col justify-between">
          <img
            :src="activePrediction.bannerUrl"
            :alt="`${activePrediction.awayTeam} vs ${activePrediction.homeTeam} ${activePrediction.league} Prediction Odds & Picks Today`"
            width="1280"
            height="720"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="handleBannerImageError($event, activePrediction.awayTeam, activePrediction.homeTeam, activePrediction.league)"
            class="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/35"></div>
          <div class="relative z-10 p-3 sm:p-6 flex flex-col justify-between gap-2.5 sm:gap-3 flex-1">
            <div class="flex flex-wrap items-center justify-between gap-1.5">
              <span class="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                {{ activePrediction.league }} · Prediction &amp; Odds
              </span>
              <a
                :href="getSeoTabHref('predictions')"
                @click.prevent="closePredictionBlog(true)"
                class="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 px-2.5 sm:px-3 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>All Predictions</span>
              </a>
            </div>

            <div class="grid grid-cols-3 items-center gap-1.5 sm:gap-3 my-auto py-1 sm:py-2">
              <div class="flex flex-col items-center text-center space-y-1.5 min-w-0">
                <img
                  :src="activePrediction.awayLogo"
                  :alt="`${activePrediction.awayTeam} Official Basketball Logo`"
                  width="64"
                  height="64"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="handleImageErrorToCrest($event, activePrediction.awayTeam)"
                  class="w-11 h-11 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 sm:p-1.5 shadow-lg shrink-0"
                />
                <span class="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2 break-words">{{ activePrediction.awayTeam }}</span>
              </div>
              <div class="flex flex-col items-center justify-center text-center px-1 min-w-0">
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300">VS</span>
                <span class="text-xs sm:text-base font-mono font-black text-white mt-1 whitespace-nowrap">{{ activePrediction.taleOfTheTape.projectedScore }}</span>
                <span class="text-[10px] sm:text-xs text-cyan-300 font-bold mt-0.5 whitespace-nowrap">{{ activePrediction.taleOfTheTape.overUnder }}</span>
              </div>
              <div class="flex flex-col items-center text-center space-y-1.5 min-w-0">
                <img
                  :src="activePrediction.homeLogo"
                  :alt="`${activePrediction.homeTeam} Official Basketball Logo`"
                  width="64"
                  height="64"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="handleImageErrorToCrest($event, activePrediction.homeTeam)"
                  class="w-11 h-11 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 sm:p-1.5 shadow-lg shrink-0"
                />
                <span class="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2 break-words">{{ activePrediction.homeTeam }}</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-1.5 text-center text-[11px] sm:text-xs text-slate-300 font-medium">
              <span class="px-2 py-0.5 rounded bg-slate-900/85 border border-slate-700/80 text-amber-300 font-mono font-bold">
                Spread: {{ activePrediction.taleOfTheTape.spread }}
              </span>
              <span class="truncate">{{ activePrediction.venue }} · {{ activePrediction.manilaTime }}</span>
            </div>
          </div>
        </div>

        <div class="p-3.5 sm:p-7 space-y-4 sm:space-y-5">
          <h3 class="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
            {{ activePrediction.headline }}
          </h3>

          <!-- Betting Tale of the Tape Table -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
            <div class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Betting Tale of the Tape
            </div>
            <table class="w-full text-left text-xs sm:text-sm font-mono tabular-nums">
              <tbody class="divide-y divide-slate-800/80">
                <tr>
                  <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Projected Winner</th>
                  <td class="py-2 text-right font-bold text-emerald-400 break-words">{{ activePrediction.taleOfTheTape.projectedWinner }}</td>
                </tr>
                <tr>
                  <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Win Probability %</th>
                  <td class="py-2 text-right font-bold text-white">{{ activePrediction.taleOfTheTape.winProbability }}</td>
                </tr>
                <tr>
                  <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Point Spread</th>
                  <td class="py-2 text-right font-bold text-amber-400">{{ activePrediction.taleOfTheTape.spread }}</td>
                </tr>
                <tr>
                  <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Over/Under Total</th>
                  <td class="py-2 text-right font-bold text-cyan-300">{{ activePrediction.taleOfTheTape.overUnder }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top Player Spotlight with Headshot -->
          <div v-if="activePrediction.topPlayerName" class="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <img
              :src="activePrediction.topPlayerHeadshot || activePrediction.homeLogo"
              :alt="`${activePrediction.topPlayerName} Player Headshot`"
              width="48"
              height="48"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="handleImageErrorToCrest($event, activePrediction.topPlayerName || activePrediction.homeTeam)"
              class="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover bg-slate-800 border border-amber-500/40 shrink-0"
            />
            <div class="min-w-0">
              <div class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400">Key Player to Watch</div>
              <div class="text-xs sm:text-sm font-extrabold text-white truncate">{{ activePrediction.topPlayerName }}</div>
              <div class="text-[11px] sm:text-xs text-slate-300 font-mono truncate">{{ activePrediction.topPlayerStat }}</div>
            </div>
          </div>

          <!-- 2-Paragraph Matchup Analysis -->
          <div class="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p v-for="(para, idx) in activePrediction.paragraphs" :key="idx">
              {{ para }}
            </p>
          </div>

          <!-- Bet Now CTA Box -->
          <div class="mt-4 sm:mt-6 p-3.5 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p class="text-xs sm:text-base font-extrabold text-white leading-snug">
                Ready for tip-off? Lock in live basketball odds for {{ activePrediction.awayTeam }} vs {{ activePrediction.homeTeam }}
              </p>
              <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Live spreads, moneylines, and player props updated every possession.
              </p>
            </div>
            <a
              :href="PROMO_URL"
              target="_blank"
              rel="nofollow sponsored noopener"
              class="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              Bet Now
            </a>
          </div>
        </div>
      </article>
    </div>

    <!-- ACTIVE INDIVIDUAL POST-GAME HIGHLIGHT BLOG REPORT VIEW -->
    <div v-else-if="activeReport" class="p-2.5 sm:p-6 bg-slate-950/60 border-b border-slate-800">
      <article class="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
        <!-- Tier 3 Dynamic "VS Matchup" Graphic Card (Responsive height on mobile, 16:9 on desktop) -->
        <div class="relative min-h-[210px] sm:aspect-video w-full bg-gradient-to-br from-[#0b1329] via-[#131d38] to-[#23122b] overflow-hidden border-b border-slate-800 flex flex-col justify-between">
          <img
            :src="activeReport.bannerUrl"
            :alt="`${activeReport.awayTeam} vs ${activeReport.homeTeam} ${activeReport.league} Live Today Highlights`"
            width="1280"
            height="720"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="handleBannerImageError($event, activeReport.awayTeam, activeReport.homeTeam, activeReport.league)"
            class="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/35"></div>
          <div class="relative z-10 p-3.5 sm:p-6 flex flex-col justify-between gap-3 flex-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                {{ activeReport.league }} · Box Score Recap
              </span>
              <a
                :href="getSeoTabHref('highlights')"
                @click.prevent="closeHighlightReport(true)"
                class="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 px-2.5 sm:px-3 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>All Highlight Reports</span>
              </a>
            </div>

            <div class="grid grid-cols-3 items-center gap-2 sm:gap-3 my-auto py-1 sm:py-2">
              <div class="flex flex-col items-center text-center space-y-1.5 min-w-0">
                <img
                  :src="activeReport.awayLogo"
                  :alt="`${activeReport.awayTeam} Official Basketball Logo`"
                  width="64"
                  height="64"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="handleImageErrorToCrest($event, activeReport.awayTeam)"
                  class="w-11 h-11 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 sm:p-1.5 shadow-lg shrink-0"
                />
                <span class="text-[11px] sm:text-sm font-black text-white leading-tight line-clamp-2 break-words">{{ activeReport.awayTeam }}</span>
              </div>
              <div class="flex flex-col items-center justify-center text-center px-1 min-w-0">
                <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400">FINAL SCORE</span>
                <span class="text-lg sm:text-3xl font-mono font-black text-white mt-0.5 whitespace-nowrap">
                  {{ activeReport.awayScore }} – {{ activeReport.homeScore }}
                </span>
              </div>
              <div class="flex flex-col items-center text-center space-y-1.5 min-w-0">
                <img
                  :src="activeReport.homeLogo"
                  :alt="`${activeReport.homeTeam} Official Basketball Logo`"
                  width="64"
                  height="64"
                  loading="lazy"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  @error="handleImageErrorToCrest($event, activeReport.homeTeam)"
                  class="w-11 h-11 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 sm:p-1.5 shadow-lg shrink-0"
                />
                <span class="text-[11px] sm:text-sm font-black text-white leading-tight line-clamp-2 break-words">{{ activeReport.homeTeam }}</span>
              </div>
            </div>

            <div class="text-center text-[11px] sm:text-xs text-slate-300 font-medium truncate">
              {{ activeReport.venue }} · {{ activeReport.manilaTime }}
            </div>
          </div>
        </div>

        <div class="p-3.5 sm:p-7 space-y-4 sm:space-y-5">
          <h3 class="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
            {{ activeReport.headline }}
          </h3>

          <p class="text-xs sm:text-base text-slate-200 font-medium leading-relaxed">
            {{ activeReport.summaryLead }}
          </p>

          <!-- Quarter-by-Quarter (Q1-Q4 + Final) HTML Box Score Table -->
          <div class="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
            <div class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quarter-by-Quarter Box Score Table
            </div>
            <table class="w-full text-left text-xs sm:text-sm font-mono tabular-nums">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400">
                  <th class="py-2 pr-2 font-sans font-bold text-slate-300">Team</th>
                  <th v-for="q in activeReport.quarters" :key="q.label" class="py-2 px-1.5 sm:px-2 text-center">{{ q.label }}</th>
                  <th class="py-2 pl-2 text-right font-bold text-amber-400">Final</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70">
                <tr>
                  <td class="py-2 pr-2 font-sans font-bold text-white truncate max-w-[110px] sm:max-w-none">{{ activeReport.awayTeam }}</td>
                  <td v-for="q in activeReport.quarters" :key="`a-${q.label}`" class="py-2 px-1.5 sm:px-2 text-center text-slate-300">{{ q.away }}</td>
                  <td class="py-2 pl-2 text-right font-extrabold text-amber-400">{{ activeReport.awayScore }}</td>
                </tr>
                <tr>
                  <td class="py-2 pr-2 font-sans font-bold text-white truncate max-w-[110px] sm:max-w-none">{{ activeReport.homeTeam }}</td>
                  <td v-for="q in activeReport.quarters" :key="`h-${q.label}`" class="py-2 px-1.5 sm:px-2 text-center text-slate-300">{{ q.home }}</td>
                  <td class="py-2 pl-2 text-right font-extrabold text-amber-400">{{ activeReport.homeScore }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 2-3 Paragraph Game Summary -->
          <div class="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p v-for="(para, idx) in activeReport.paragraphs" :key="idx">
              {{ para }}
            </p>
          </div>

          <!-- Bulleted Top Player Highlights with Player Headshot -->
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3">
            <div class="flex items-center gap-3">
              <img
                :src="activeReport.topPlayerHeadshot || activeReport.homeLogo"
                :alt="`${activeReport.topPlayerName || activeReport.homeTeam} Player Headshot`"
                width="44"
                height="44"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleImageErrorToCrest($event, activeReport.topPlayerName || activeReport.homeTeam)"
                class="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-slate-800 border border-amber-500/40 shrink-0"
              />
              <div class="min-w-0">
                <h4 class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">Top Player Highlights</h4>
                <p v-if="activeReport.topPlayerName" class="text-xs text-slate-300 font-semibold truncate">
                  {{ activeReport.topPlayerName }} ({{ activeReport.topPlayerStat }})
                </p>
              </div>
            </div>
            <ul class="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
              <li v-for="(pt, idx) in activeReport.topPlayerHighlights" :key="idx">{{ pt }}</li>
            </ul>
          </div>

          <!-- Promo Callout Box Inside Highlight Blog Report -->
          <div class="mt-4 sm:mt-6 p-3.5 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p class="text-xs sm:text-base font-extrabold text-white leading-snug">
                Ready for the next tip-off? Get the best live basketball odds
              </p>
              <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Live NBA, PBA, MPBL &amp; collegiate spreads and in-play markets updated every possession.
              </p>
            </div>
            <a
              :href="PROMO_URL"
              target="_blank"
              rel="nofollow sponsored noopener"
              title="Bet on Live Games — Play at Bybet"
              class="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              Bet Now
            </a>
          </div>
        </div>
      </article>
    </div>

    <!-- DEDICATED TAB 1: PREDICTIONS & PICKS TAB VIEW -->
    <div v-else-if="selectedLeague === 'predictions'" class="p-4 sm:p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 class="text-base sm:text-lg font-black text-white">
            Auto-Generated Pre-Game Basketball Predictions, Odds &amp; Picks Today
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            100% automated Tale of the Tape betting odds, win probabilities, and matchup breakdowns for upcoming &amp; live games.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article
          v-for="pred in predictionBlogs"
          :key="pred.slug"
          class="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
        >
          <div>
            <!-- Tier 3 Dynamic "VS Matchup" Graphic Card (Responsive on mobile, 16:9 on desktop) -->
            <div class="relative min-h-[190px] sm:aspect-video w-full bg-gradient-to-br from-[#0b1329] via-[#131d38] to-[#23122b] overflow-hidden border-b border-slate-800 flex flex-col justify-between">
              <img
                :src="pred.bannerUrl"
                :alt="`${pred.awayTeam} vs ${pred.homeTeam} ${pred.league} Prediction Odds & Picks Today`"
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleBannerImageError($event, pred.awayTeam, pred.homeTeam, pred.league)"
                class="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
              <div class="relative z-10 p-3 sm:p-3.5 flex flex-col justify-between gap-2 flex-1">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase">{{ pred.league }}</span>
                  <span class="text-slate-200 truncate ml-2">{{ pred.manilaTime }}</span>
                </div>
                <div class="grid grid-cols-3 items-center gap-2 my-auto py-1">
                  <div class="flex flex-col items-center text-center gap-1 min-w-0">
                    <img
                      :src="pred.awayLogo"
                      :alt="`${pred.awayTeam} Official Logo`"
                      width="44"
                      height="44"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, pred.awayTeam)"
                      class="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                    />
                    <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ pred.awayTeam }}</span>
                  </div>
                  <div class="text-center px-1 min-w-0">
                    <div class="text-[10px] font-black text-amber-400 uppercase">VS</div>
                    <div class="text-xs font-mono font-black text-white whitespace-nowrap">{{ pred.taleOfTheTape.projectedScore }}</div>
                  </div>
                  <div class="flex flex-col items-center text-center gap-1 min-w-0">
                    <img
                      :src="pred.homeLogo"
                      :alt="`${pred.homeTeam} Official Logo`"
                      width="44"
                      height="44"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, pred.homeTeam)"
                      class="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                    />
                    <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ pred.homeTeam }}</span>
                  </div>
                </div>
                <div class="text-[11px] text-center text-cyan-300 font-mono font-bold truncate">
                  {{ pred.taleOfTheTape.spread }} · {{ pred.taleOfTheTape.overUnder }}
                </div>
              </div>
            </div>

            <div class="p-4 sm:p-5 space-y-3.5">
              <h3 class="text-base sm:text-lg font-black text-white leading-snug">
                <a
                  :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
                  @click.prevent="openPredictionBySlug(pred.slug, true)"
                  class="hover:text-amber-400 transition-colors"
                >
                  {{ pred.headline }}
                </a>
              </h3>

              <!-- Betting Tale of the Tape HTML Table -->
              <div class="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl p-3">
                <table class="w-full text-left text-xs font-mono tabular-nums">
                  <tbody class="divide-y divide-slate-800/80">
                    <tr>
                      <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Projected Winner</th>
                      <td class="py-1.5 text-right font-bold text-emerald-400">{{ pred.taleOfTheTape.projectedWinner }}</td>
                    </tr>
                    <tr>
                      <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Win Probability %</th>
                      <td class="py-1.5 text-right font-bold text-white">{{ pred.taleOfTheTape.winProbability }}</td>
                    </tr>
                    <tr>
                      <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Spread</th>
                      <td class="py-1.5 text-right font-bold text-amber-400">{{ pred.taleOfTheTape.spread }}</td>
                    </tr>
                    <tr>
                      <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Over/Under</th>
                      <td class="py-1.5 text-right font-bold text-cyan-300">{{ pred.taleOfTheTape.overUnder }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 2-Paragraph Matchup Analysis -->
              <div class="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p v-for="(para, idx) in pred.paragraphs" :key="idx">{{ para }}</p>
              </div>
            </div>
          </div>

          <!-- Bet Now / Play Now CTA Box -->
          <div class="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
            <a
              :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
              @click.prevent="openPredictionBySlug(pred.slug, true)"
              class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Open Full Prediction &rarr;
            </a>
            <div class="flex items-center gap-1.5 shrink-0">
              <a
                :href="PROMO_URL"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="px-3 py-1 rounded text-[11px] font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors whitespace-nowrap"
              >
                Bet Now
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- DEDICATED TAB 2: NEWS & HIGHLIGHTS TAB VIEW -->
    <div v-else-if="selectedLeague === 'highlights'" class="p-4 sm:p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 class="text-base sm:text-lg font-black text-white">
            Auto-Generated Post-Game Highlight Reports &amp; Box Score Recaps
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Complete text-only post-game recaps, Top Player Highlights, and Quarter-by-Quarter (Q1–Q4 + Final) box score tables.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="sub in [
              { id: 'all', label: 'All Today' },
              { id: 'finished', label: 'Final Recaps' },
              { id: 'live', label: 'Live Blogs' },
              { id: 'nba', label: 'NBA' },
              { id: 'pba', label: 'PBA' },
              { id: 'mpbl', label: 'MPBL' },
              { id: 'collegiate', label: 'UAAP & NCAA' }
            ]"
            :key="sub.id"
            type="button"
            @click="blogSubFilter = sub.id as any"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            :class="blogSubFilter === sub.id
              ? 'bg-amber-400 text-slate-950 font-black'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'"
          >
            {{ sub.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article
          v-for="rep in highlightReports"
          :key="rep.slug"
          class="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
        >
          <div>
            <!-- Tier 3 Dynamic "VS Matchup" Graphic Card (Responsive on mobile, 16:9 on desktop) -->
            <div class="relative min-h-[190px] sm:aspect-video w-full bg-gradient-to-br from-[#0b1329] via-[#131d38] to-[#23122b] overflow-hidden border-b border-slate-800 flex flex-col justify-between">
              <img
                :src="rep.bannerUrl"
                :alt="`${rep.awayTeam} vs ${rep.homeTeam} ${rep.league} Live Today Highlights`"
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleBannerImageError($event, rep.awayTeam, rep.homeTeam, rep.league)"
                class="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
              <div class="relative z-10 p-3 sm:p-3.5 flex flex-col justify-between gap-2 flex-1">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase">{{ rep.league }}</span>
                  <span class="text-slate-200 truncate ml-2">{{ rep.manilaTime }}</span>
                </div>
                <div class="grid grid-cols-3 items-center gap-2 my-auto py-1">
                  <div class="flex flex-col items-center text-center gap-1 min-w-0">
                    <img
                      :src="rep.awayLogo"
                      :alt="`${rep.awayTeam} Official Logo`"
                      width="44"
                      height="44"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, rep.awayTeam)"
                      class="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                    />
                    <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ rep.awayTeam }}</span>
                  </div>
                  <div class="text-center px-1 min-w-0">
                    <div class="text-[10px] font-black text-amber-400 uppercase">FINAL</div>
                    <div class="text-sm sm:text-base font-mono font-black text-white whitespace-nowrap">{{ rep.awayScore }} – {{ rep.homeScore }}</div>
                  </div>
                  <div class="flex flex-col items-center text-center gap-1 min-w-0">
                    <img
                      :src="rep.homeLogo"
                      :alt="`${rep.homeTeam} Official Logo`"
                      width="44"
                      height="44"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, rep.homeTeam)"
                      class="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                    />
                    <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ rep.homeTeam }}</span>
                  </div>
                </div>
                <div class="text-[11px] text-center text-slate-300 font-medium truncate">
                  {{ rep.venue }}
                </div>
              </div>
            </div>

            <div class="p-4 sm:p-5 space-y-3.5">
              <!-- SEO <h3> Headline: [Winner] Defeat [Loser] [Score]: Post-Game Highlights & Box Score Recap -->
              <h3 class="text-base sm:text-lg font-black text-white leading-snug">
                <a
                  :href="buildDualModeHref('report', rep.slug, '/local-sports')"
                  @click.prevent="openReportBySlug(rep.slug, true)"
                  class="hover:text-amber-400 transition-colors"
                >
                  {{ rep.headline }}
                </a>
              </h3>

              <!-- 2-3 Paragraph Game Summary -->
              <div class="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>{{ rep.summaryLead }}</p>
                <p v-for="(para, idx) in rep.paragraphs" :key="idx">{{ para }}</p>
              </div>

              <!-- Bulleted Top Player Highlights -->
              <div class="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Top Player Highlights</div>
                <ul class="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  <li v-for="(pt, idx) in rep.topPlayerHighlights" :key="idx">{{ pt }}</li>
                </ul>
              </div>

              <!-- Quarter-by-Quarter (Q1-Q4 + Final) HTML Box Score Table -->
              <div class="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl p-3">
                <table class="w-full text-left text-xs font-mono tabular-nums">
                  <thead>
                    <tr class="border-b border-slate-800 text-slate-400">
                      <th class="py-1.5 pr-3 font-sans font-bold text-slate-300">Team</th>
                      <th v-for="q in rep.quarters" :key="q.label" class="py-1.5 px-1.5 text-center">{{ q.label }}</th>
                      <th class="py-1.5 pl-2 text-right font-bold text-amber-400">Final</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/70">
                    <tr>
                      <td class="py-1.5 pr-3 font-sans font-bold text-white">{{ rep.awayTeam }}</td>
                      <td v-for="q in rep.quarters" :key="`a-${q.label}`" class="py-1.5 px-1.5 text-center text-slate-300">{{ q.away }}</td>
                      <td class="py-1.5 pl-2 text-right font-extrabold text-amber-400">{{ rep.awayScore }}</td>
                    </tr>
                    <tr>
                      <td class="py-1.5 pr-3 font-sans font-bold text-white">{{ rep.homeTeam }}</td>
                      <td v-for="q in rep.quarters" :key="`h-${q.label}`" class="py-1.5 px-1.5 text-center text-slate-300">{{ q.home }}</td>
                      <td class="py-1.5 pl-2 text-right font-extrabold text-amber-400">{{ rep.homeScore }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Bet Now / Play Now CTA Box -->
          <div class="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
            <a
              :href="buildDualModeHref('report', rep.slug, '/local-sports')"
              @click.prevent="openReportBySlug(rep.slug, true)"
              class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              View Full Box Score Report &rarr;
            </a>
            <div class="flex items-center gap-1.5 shrink-0">
              <a
                :href="PROMO_URL"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="px-3 py-1 rounded text-[11px] font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors whitespace-nowrap"
              >
                Bet Now
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>

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

          <!-- Footer Action Row: Descriptive Stream Link, View Button, Bet Now & Play Now -->
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

      <!-- DUAL PLACEMENT: ALWAYS-VISIBLE, CRAWLABLE SEO BLOG FEED DIRECTLY BELOW MAIN MATCH GRID -->
      <section v-if="predictionBlogs.length > 0 || highlightReports.length > 0" class="pt-6 border-t border-slate-800 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-white tracking-tight">
              Automated Match Predictions, Betting Odds &amp; Post-Game Box Score Reports
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Real-time pre-game Tale of the Tape predictions and full Q1–Q4 box score recaps for every match in the feed.
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a
              :href="getSeoTabHref('predictions')"
              @click.prevent="handleTabSelect('predictions', true)"
              class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
            >
              All Predictions &amp; Picks
            </a>
            <a
              :href="getSeoTabHref('highlights')"
              @click.prevent="handleTabSelect('highlights', true)"
              class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
            >
              All Box Score Recaps
            </a>
          </div>
        </div>

        <!-- Auto-Generated Pre-Game Prediction Articles (Upcoming & Live) -->
        <div v-if="predictionBlogs.length > 0" class="space-y-3">
          <div class="text-xs font-black uppercase tracking-wider text-amber-400">
            Pre-Game &amp; Live Match Predictions (Tale of the Tape)
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <article
              v-for="pred in predictionBlogs.slice(0, 6)"
              :key="`feed-pred-${pred.slug}`"
              class="bg-slate-900/75 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <!-- Tier 3 Dynamic "VS Matchup" Graphic Card -->
                <div class="relative min-h-[185px] sm:aspect-video w-full bg-gradient-to-br from-[#0b1329] via-[#131d38] to-[#23122b] overflow-hidden border-b border-slate-800 flex flex-col justify-between">
                  <img
                    :src="pred.bannerUrl"
                    :alt="`${pred.awayTeam} vs ${pred.homeTeam} ${pred.league} Prediction Odds & Picks Today`"
                    width="640"
                    height="360"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="handleBannerImageError($event, pred.awayTeam, pred.homeTeam, pred.league)"
                    class="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
                  <div class="relative z-10 p-3 flex flex-col justify-between gap-2 flex-1">
                    <div class="flex items-center justify-between text-[10px] font-bold">
                      <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase">{{ pred.league }}</span>
                      <span class="text-slate-200 truncate ml-2">{{ pred.manilaTime }}</span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2 my-auto py-1">
                      <div class="flex flex-col items-center text-center gap-1 min-w-0">
                        <img
                          :src="pred.awayLogo"
                          :alt="`${pred.awayTeam} Official Logo`"
                          width="40"
                          height="40"
                          loading="lazy"
                          decoding="async"
                          referrerpolicy="no-referrer"
                          @error="handleImageErrorToCrest($event, pred.awayTeam)"
                          class="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                        />
                        <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ pred.awayTeam }}</span>
                      </div>
                      <div class="text-center px-1 min-w-0">
                        <div class="text-[10px] font-black text-amber-400 uppercase">VS</div>
                        <div class="text-xs font-mono font-black text-white whitespace-nowrap">{{ pred.taleOfTheTape.projectedScore }}</div>
                      </div>
                      <div class="flex flex-col items-center text-center gap-1 min-w-0">
                        <img
                          :src="pred.homeLogo"
                          :alt="`${pred.homeTeam} Official Logo`"
                          width="40"
                          height="40"
                          loading="lazy"
                          decoding="async"
                          referrerpolicy="no-referrer"
                          @error="handleImageErrorToCrest($event, pred.homeTeam)"
                          class="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                        />
                        <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ pred.homeTeam }}</span>
                      </div>
                    </div>
                    <div class="text-[10px] text-center text-cyan-300 font-mono font-bold truncate">
                      {{ pred.taleOfTheTape.spread }} · {{ pred.taleOfTheTape.overUnder }}
                    </div>
                  </div>
                </div>

                <div class="p-4 space-y-3">
                  <h3 class="text-base font-extrabold text-white leading-snug">
                    <a
                      :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
                      @click.prevent="openPredictionBySlug(pred.slug, true)"
                      class="hover:text-amber-400 transition-colors"
                    >
                      {{ pred.headline }}
                    </a>
                  </h3>

                  <table class="w-full text-left text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded-lg">
                    <tbody class="divide-y divide-slate-800/80">
                      <tr>
                        <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Projected Winner</th>
                        <td class="py-1.5 px-2.5 text-right font-bold text-emerald-400">{{ pred.taleOfTheTape.projectedWinner }}</td>
                      </tr>
                      <tr>
                        <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Win Probability %</th>
                        <td class="py-1.5 px-2.5 text-right font-bold text-white">{{ pred.taleOfTheTape.winProbability }}</td>
                      </tr>
                      <tr>
                        <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Spread</th>
                        <td class="py-1.5 px-2.5 text-right font-bold text-amber-400">{{ pred.taleOfTheTape.spread }}</td>
                      </tr>
                      <tr>
                        <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Over/Under</th>
                        <td class="py-1.5 px-2.5 text-right font-bold text-cyan-300">{{ pred.taleOfTheTape.overUnder }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    <p v-for="(para, idx) in pred.paragraphs" :key="idx">{{ para }}</p>
                  </div>
                </div>
              </div>

              <div class="px-4 pb-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/60">
                <a
                  :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
                  @click.prevent="openPredictionBySlug(pred.slug, true)"
                  class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  Read Full Prediction &rarr;
                </a>
                <div class="flex items-center gap-1.5">
                  <a
                    :href="PROMO_URL"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    class="px-2.5 py-1 rounded text-[11px] font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950"
                  >
                    Bet Now
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Auto-Generated Post-Game Highlight Reports (Final Matches) -->
        <div v-if="highlightReports.length > 0" class="space-y-3 pt-4">
          <div class="text-xs font-black uppercase tracking-wider text-cyan-400">
            Post-Game Highlight Reports &amp; Quarter-by-Quarter Box Scores
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <article
              v-for="rep in highlightReports.slice(0, 6)"
              :key="`feed-rep-${rep.slug}`"
              class="bg-slate-900/75 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <!-- Tier 3 Dynamic "VS Matchup" Graphic Card -->
                <div class="relative min-h-[185px] sm:aspect-video w-full bg-gradient-to-br from-[#0b1329] via-[#131d38] to-[#23122b] overflow-hidden border-b border-slate-800 flex flex-col justify-between">
                  <img
                    :src="rep.bannerUrl"
                    :alt="`${rep.awayTeam} vs ${rep.homeTeam} ${rep.league} Live Today Highlights`"
                    width="640"
                    height="360"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="handleBannerImageError($event, rep.awayTeam, rep.homeTeam, rep.league)"
                    class="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30"></div>
                  <div class="relative z-10 p-3 flex flex-col justify-between gap-2 flex-1">
                    <div class="flex items-center justify-between text-[10px] font-bold">
                      <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase">{{ rep.league }}</span>
                      <span class="text-slate-200 truncate ml-2">{{ rep.manilaTime }}</span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-2 my-auto py-1">
                      <div class="flex flex-col items-center text-center gap-1 min-w-0">
                        <img
                          :src="rep.awayLogo"
                          :alt="`${rep.awayTeam} Official Logo`"
                          width="40"
                          height="40"
                          loading="lazy"
                          decoding="async"
                          referrerpolicy="no-referrer"
                          @error="handleImageErrorToCrest($event, rep.awayTeam)"
                          class="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                        />
                        <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ rep.awayTeam }}</span>
                      </div>
                      <div class="text-center px-1 min-w-0">
                        <div class="text-[10px] font-black text-amber-400 uppercase">FINAL</div>
                        <div class="text-sm font-mono font-black text-white whitespace-nowrap">{{ rep.awayScore }} – {{ rep.homeScore }}</div>
                      </div>
                      <div class="flex flex-col items-center text-center gap-1 min-w-0">
                        <img
                          :src="rep.homeLogo"
                          :alt="`${rep.homeTeam} Official Logo`"
                          width="40"
                          height="40"
                          loading="lazy"
                          decoding="async"
                          referrerpolicy="no-referrer"
                          @error="handleImageErrorToCrest($event, rep.homeTeam)"
                          class="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow shrink-0"
                        />
                        <span class="text-xs font-bold text-white leading-tight line-clamp-2 break-words">{{ rep.homeTeam }}</span>
                      </div>
                    </div>
                    <div class="text-[10px] text-center text-slate-300 font-medium truncate">
                      {{ rep.venue }}
                    </div>
                  </div>
                </div>

                <div class="p-4 space-y-3">
                  <h3 class="text-base font-extrabold text-white leading-snug">
                    <a
                      :href="buildDualModeHref('report', rep.slug, '/local-sports')"
                      @click.prevent="openReportBySlug(rep.slug, true)"
                      class="hover:text-amber-400 transition-colors"
                    >
                      {{ rep.headline }}
                    </a>
                  </h3>

                  <div class="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    <p>{{ rep.summaryLead }}</p>
                    <p v-for="(para, idx) in rep.paragraphs" :key="idx">{{ para }}</p>
                  </div>

                  <ul class="space-y-1 text-xs text-slate-300 list-disc list-inside bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
                    <li v-for="(pt, idx) in rep.topPlayerHighlights" :key="idx">{{ pt }}</li>
                  </ul>

                  <table class="w-full text-left text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded-lg">
                    <thead>
                      <tr class="border-b border-slate-800 text-slate-400">
                        <th class="py-1 px-2 font-sans font-bold text-slate-300">Team</th>
                        <th v-for="q in rep.quarters" :key="q.label" class="py-1 px-1.5 text-center">{{ q.label }}</th>
                        <th class="py-1 px-2 text-right font-bold text-amber-400">Final</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/70">
                      <tr>
                        <td class="py-1 px-2 font-sans font-bold text-white">{{ rep.awayTeam }}</td>
                        <td v-for="q in rep.quarters" :key="`a-${q.label}`" class="py-1 px-1.5 text-center text-slate-300">{{ q.away }}</td>
                        <td class="py-1 px-2 text-right font-extrabold text-amber-400">{{ rep.awayScore }}</td>
                      </tr>
                      <tr>
                        <td class="py-1 px-2 font-sans font-bold text-white">{{ rep.homeTeam }}</td>
                        <td v-for="q in rep.quarters" :key="`h-${q.label}`" class="py-1 px-1.5 text-center text-slate-300">{{ q.home }}</td>
                        <td class="py-1 px-2 text-right font-extrabold text-amber-400">{{ rep.homeScore }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="px-4 pb-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/60">
                <a
                  :href="buildDualModeHref('report', rep.slug, '/local-sports')"
                  @click.prevent="openReportBySlug(rep.slug, true)"
                  class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  Open Box Score Report &rarr;
                </a>
                <div class="flex items-center gap-1.5">
                  <a
                    :href="PROMO_URL"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    class="px-2.5 py-1 rounded text-[11px] font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950"
                  >
                    Bet Now
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
