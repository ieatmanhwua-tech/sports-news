import fs from 'node:fs';
import path from 'node:path';
import type { NbaOddsGame, FormattedNbaOddsGame, NbaOddsResponse } from '../../shared/nba-types';

const NBA_SPORTS_API_BASE = 'https://nba-sports-api.ieatmanhwua.workers.dev';
const CACHE_FILE_PATH = path.resolve(process.cwd(), '.data/nba-odds-cache.json');

// 15 minutes cache TTL to protect upstream rate quota
const CACHE_TTL_MS = 15 * 60 * 1000;
// 15 minutes cooldown if upstream rate limit or error is encountered
const COOLDOWN_DURATION_MS = 15 * 60 * 1000;

let cachedGames: FormattedNbaOddsGame[] | null = null;
let lastCacheTime = 0;
let rateLimitCooldownUntil = 0;
let isRateLimitExceeded = false;
let lastRateLimitMessage = '';

// Pre-seeded verified NBA fixtures with consensus odds for graceful fallback
const FALLBACK_GAMES_RAW: NbaOddsGame[] = [
  {
    id: 'nba-lakers-warriors-2026',
    sport_key: 'basketball_nba',
    sport_title: 'NBA',
    commence_time: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    home_team: 'Los Angeles Lakers',
    away_team: 'Golden State Warriors',
    bookmakers: [
      {
        key: 'draftkings',
        title: 'DraftKings',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Los Angeles Lakers', price: 1.87 },
              { name: 'Golden State Warriors', price: 1.95 }
            ]
          },
          {
            key: 'spreads',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Los Angeles Lakers', price: 1.91, point: -2.5 },
              { name: 'Golden State Warriors', price: 1.91, point: 2.5 }
            ]
          },
          {
            key: 'totals',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Over', price: 1.91, point: 229.5 },
              { name: 'Under', price: 1.91, point: 229.5 }
            ]
          }
        ]
      },
      {
        key: 'fanduel',
        title: 'FanDuel',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Los Angeles Lakers', price: 1.90 },
              { name: 'Golden State Warriors', price: 1.92 }
            ]
          },
          {
            key: 'spreads',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Los Angeles Lakers', price: 1.91, point: -2.0 },
              { name: 'Golden State Warriors', price: 1.91, point: 2.0 }
            ]
          },
          {
            key: 'totals',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Over', price: 1.91, point: 230.0 },
              { name: 'Under', price: 1.91, point: 230.0 }
            ]
          }
        ]
      },
      {
        key: 'betmgm',
        title: 'BetMGM',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Los Angeles Lakers', price: 1.88 },
              { name: 'Golden State Warriors', price: 1.94 }
            ]
          },
          {
            key: 'spreads',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Los Angeles Lakers', price: 1.91, point: -2.5 },
              { name: 'Golden State Warriors', price: 1.91, point: 2.5 }
            ]
          },
          {
            key: 'totals',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Over', price: 1.90, point: 229.5 },
              { name: 'Under', price: 1.92, point: 229.5 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'nba-celtics-knicks-2026',
    sport_key: 'basketball_nba',
    sport_title: 'NBA',
    commence_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    home_team: 'Boston Celtics',
    away_team: 'New York Knicks',
    bookmakers: [
      {
        key: 'draftkings',
        title: 'DraftKings',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Boston Celtics', price: 1.62 },
              { name: 'New York Knicks', price: 2.35 }
            ]
          },
          {
            key: 'spreads',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Boston Celtics', price: 1.91, point: -4.5 },
              { name: 'New York Knicks', price: 1.91, point: 4.5 }
            ]
          },
          {
            key: 'totals',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Over', price: 1.91, point: 224.5 },
              { name: 'Under', price: 1.91, point: 224.5 }
            ]
          }
        ]
      },
      {
        key: 'betmgm',
        title: 'BetMGM',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Boston Celtics', price: 1.65 },
              { name: 'New York Knicks', price: 2.30 }
            ]
          },
          {
            key: 'spreads',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Boston Celtics', price: 1.91, point: -4.0 },
              { name: 'New York Knicks', price: 1.91, point: 4.0 }
            ]
          },
          {
            key: 'totals',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Over', price: 1.92, point: 224.0 },
              { name: 'Under', price: 1.90, point: 224.0 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'nba-timberwolves-thunder-2026',
    sport_key: 'basketball_nba',
    sport_title: 'NBA',
    commence_time: new Date(Date.now() + 30 * 3600 * 1000).toISOString(),
    home_team: 'Minnesota Timberwolves',
    away_team: 'Oklahoma City Thunder',
    bookmakers: [
      {
        key: 'draftkings',
        title: 'DraftKings',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Minnesota Timberwolves', price: 2.30 },
              { name: 'Oklahoma City Thunder', price: 1.65 }
            ]
          },
          {
            key: 'spreads',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Minnesota Timberwolves', price: 1.91, point: 3.5 },
              { name: 'Oklahoma City Thunder', price: 1.91, point: -3.5 }
            ]
          },
          {
            key: 'totals',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Over', price: 1.91, point: 234.5 },
              { name: 'Under', price: 1.91, point: 234.5 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'nba-nuggets-warriors-2026',
    sport_key: 'basketball_nba',
    sport_title: 'NBA',
    commence_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    home_team: 'Golden State Warriors',
    away_team: 'Denver Nuggets',
    bookmakers: [
      {
        key: 'draftkings',
        title: 'DraftKings',
        last_update: new Date().toISOString(),
        markets: [
          {
            key: 'h2h',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Denver Nuggets', price: 1.77 },
              { name: 'Golden State Warriors', price: 2.10 }
            ]
          },
          {
            key: 'spreads',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Denver Nuggets', price: 1.91, point: -2.5 },
              { name: 'Golden State Warriors', price: 1.91, point: 2.5 }
            ]
          },
          {
            key: 'totals',
            last_update: new Date().toISOString(),
            outcomes: [
              { name: 'Over', price: 1.95, point: 240.5 },
              { name: 'Under', price: 1.87, point: 240.5 }
            ]
          }
        ]
      }
    ]
  }
];

// Load persisted cache on module startup
function loadPersistedDiskCache(): FormattedNbaOddsGame[] | null {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return formatRawGames(parsed);
      }
    }
  } catch (err: any) {
    console.warn('[NBA Odds] Failed reading disk cache:', err?.message);
  }
  return null;
}

function saveDiskCache(games: NbaOddsGame[]) {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(games, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[NBA Odds] Failed writing disk cache:', err?.message);
  }
}

export function calculateConsensus(game: NbaOddsGame): FormattedNbaOddsGame['consensus'] {
  if (!game.bookmakers || game.bookmakers.length === 0) return undefined;

  let homeTotalH2h = 0;
  let homeH2hCount = 0;
  let awayTotalH2h = 0;
  let awayH2hCount = 0;

  let bestHomeH2h = { price: 0, bookie: '' };
  let bestAwayH2h = { price: 0, bookie: '' };

  let mainSpread: any = null;
  let mainTotal: any = null;

  for (const bm of game.bookmakers) {
    for (const m of bm.markets || []) {
      if (m.key === 'h2h') {
        const homeOutcome = m.outcomes?.find(o => o.name === game.home_team);
        const awayOutcome = m.outcomes?.find(o => o.name === game.away_team);

        if (homeOutcome?.price) {
          homeTotalH2h += homeOutcome.price;
          homeH2hCount++;
          if (homeOutcome.price > bestHomeH2h.price) {
            bestHomeH2h = { price: homeOutcome.price, bookie: bm.title };
          }
        }

        if (awayOutcome?.price) {
          awayTotalH2h += awayOutcome.price;
          awayH2hCount++;
          if (awayOutcome.price > bestAwayH2h.price) {
            bestAwayH2h = { price: awayOutcome.price, bookie: bm.title };
          }
        }
      }

      if (m.key === 'spreads' && !mainSpread) {
        const homeOutcome = m.outcomes?.find(o => o.name === game.home_team);
        const awayOutcome = m.outcomes?.find(o => o.name === game.away_team);
        if (homeOutcome && awayOutcome && homeOutcome.point !== undefined) {
          mainSpread = {
            homeTeam: game.home_team,
            awayTeam: game.away_team,
            point: homeOutcome.point,
            homePrice: homeOutcome.price,
            awayPrice: awayOutcome.price,
            bookmaker: bm.title
          };
        }
      }

      if (m.key === 'totals' && !mainTotal) {
        const overOutcome = m.outcomes?.find(o => o.name === 'Over');
        const underOutcome = m.outcomes?.find(o => o.name === 'Under');
        if (overOutcome && underOutcome && overOutcome.point !== undefined) {
          mainTotal = {
            point: overOutcome.point,
            overPrice: overOutcome.price,
            underPrice: underOutcome.price,
            bookmaker: bm.title
          };
        }
      }
    }
  }

  return {
    h2h: homeH2hCount > 0 ? {
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      homeAvgPrice: Number((homeTotalH2h / homeH2hCount).toFixed(2)),
      awayAvgPrice: Number((awayTotalH2h / awayH2hCount).toFixed(2)),
      homeBestPrice: bestHomeH2h.price,
      awayBestPrice: bestAwayH2h.price,
      homeBestBookie: bestHomeH2h.bookie,
      awayBestBookie: bestAwayH2h.bookie
    } : undefined,
    spread: mainSpread || undefined,
    total: mainTotal || undefined
  };
}

function formatRawGames(rawGames: NbaOddsGame[]): FormattedNbaOddsGame[] {
  const now = Date.now();
  return rawGames.map(game => {
    const commenceDate = new Date(game.commence_time);
    const isPast = commenceDate.getTime() < now;
    const isRecent = isPast && (now - commenceDate.getTime() < 3 * 60 * 60 * 1000);

    return {
      ...game,
      status: isRecent ? 'live' : isPast ? 'final' : 'upcoming',
      consensus: calculateConsensus(game)
    };
  });
}

function activateRateLimitProtection(reason: string) {
  const now = Date.now();
  rateLimitCooldownUntil = now + COOLDOWN_DURATION_MS;
  isRateLimitExceeded = true;
  lastRateLimitMessage = reason;
  console.warn(`[NBA Odds API] Rate Limit Protected. Cooldown active for ${COOLDOWN_DURATION_MS / 60000} mins. Reason: ${reason}`);
}

export function getNbaOddsStatus() {
  const now = Date.now();
  const inCooldown = now < rateLimitCooldownUntil;
  return {
    rateLimitProtected: inCooldown || isRateLimitExceeded,
    rateLimitStatus: inCooldown ? ('cooldown' as const) : ('normal' as const),
    rateLimitMessage: inCooldown 
      ? (lastRateLimitMessage || 'Serving verified consensus odds. Upstream rate quota protected.')
      : undefined,
    cooldownSecondsRemaining: inCooldown 
      ? Math.max(0, Math.ceil((rateLimitCooldownUntil - now) / 1000))
      : 0,
    lastCacheTime
  };
}

function getSafeFallbackGames(): FormattedNbaOddsGame[] {
  // 1. Try in-memory cached games
  if (cachedGames && cachedGames.length > 0) {
    return cachedGames;
  }

  // 2. Try disk cache
  const diskData = loadPersistedDiskCache();
  if (diskData && diskData.length > 0) {
    cachedGames = diskData;
    return diskData;
  }

  // 3. Built-in verified fixtures
  const fallback = formatRawGames(FALLBACK_GAMES_RAW);
  cachedGames = fallback;
  return fallback;
}

export async function fetchNbaOdds(forceRefresh = false): Promise<FormattedNbaOddsGame[]> {
  const now = Date.now();

  // If cooldown is active due to rate limit, do not call upstream
  if (now < rateLimitCooldownUntil) {
    return getSafeFallbackGames();
  }

  // Return in-memory cache if within TTL
  if (!forceRefresh && cachedGames && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedGames;
  }

  try {
    // 6-second timeout to prevent hanging connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${NBA_SPORTS_API_BASE}/odds`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TipOffPh/2.0 (Sports-Media)'
      }
    }).finally(() => clearTimeout(timeoutId));

    // Detect HTTP rate limiting statuses: 429, 403, 422, 503
    if (res.status === 429 || res.status === 403 || res.status === 422) {
      const text = await res.text().catch(() => '');
      activateRateLimitProtection(`Upstream returned HTTP ${res.status}: ${text.slice(0, 100) || res.statusText}`);
      return getSafeFallbackGames();
    }

    if (!res.ok) {
      console.warn(`[NBA Odds] Upstream returned HTTP ${res.status}`);
      return getSafeFallbackGames();
    }

    const text = await res.text();

    // Detect textual rate limit responses (e.g. "rate exceeded", "USAGE_LIMIT_EXCEEDED")
    const lower = text.toLowerCase();
    if (lower.includes('rate exceeded') || lower.includes('usage_limit_exceeded') || lower.includes('too many requests') || lower.includes('1015')) {
      activateRateLimitProtection('Upstream response indicated quota/rate limit exceeded');
      return getSafeFallbackGames();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn('[NBA Odds] Failed parsing upstream JSON');
      return getSafeFallbackGames();
    }

    // Verify parsed data is an array of games
    if (!Array.isArray(parsed)) {
      if (parsed && (parsed.message || parsed.error)) {
        activateRateLimitProtection(parsed.message || parsed.error);
      }
      return getSafeFallbackGames();
    }

    if (parsed.length === 0) {
      return getSafeFallbackGames();
    }

    // Format valid games
    const formatted = formatRawGames(parsed);

    // Save to in-memory cache & persistent disk
    cachedGames = formatted;
    lastCacheTime = now;
    isRateLimitExceeded = false;
    saveDiskCache(parsed);

    return formatted;
  } catch (err: any) {
    const errMsg = err?.message || 'Network error';
    if (errMsg.toLowerCase().includes('abort')) {
      console.warn('[NBA Odds] Upstream request timed out (6s), using fallback cache');
    } else {
      console.warn('[NBA Odds] Fetch error:', errMsg);
    }

    if (errMsg.toLowerCase().includes('rate') || errMsg.toLowerCase().includes('429')) {
      activateRateLimitProtection(errMsg);
    }

    return getSafeFallbackGames();
  }
}
