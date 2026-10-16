import { getTeamLogo, getCanonicalTeamName, getTeamAccent, getTeamInitials, isVerifiedNbaTeam } from './team-logos';

const STORAGE_KEY_LOGOS = 'tipoff_resolved_logos_v2';
const STORAGE_KEY_BANNERS = 'tipoff_resolved_banners_v4';

const memoryLogoCache = new Map<string, string>();
const memoryBannerCache = new Map<string, string>();
const espnTeamNewsImages = new Map<string, string[]>();
const inFlightRequests = new Map<string, Promise<any>>();
const globalUsedImageUrls = new Set<string>();

export interface UniqueMatchImageInput {
  id?: string;
  slug?: string;
  away_team?: string;
  home_team?: string;
  awayTeam?: string;
  homeTeam?: string;
  away?: { name?: string; logo?: string };
  home?: { name?: string; logo?: string };
  league?: string;
  leagueId?: string;
  competition?: string;
  status?: string;
  bannerUrl?: string;
  actionThumbnail?: string;
  espnThumbnail?: string;
  startTime?: string;
}

function loadStorageMap(key: string, target: Map<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string' && v.trim()) {
          target.set(k, v);
        }
      }
    }
  } catch {
    // Ignore storage read errors in restricted iframes
  }
}

function saveStorageMap(key: string, source: Map<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    const obj: Record<string, string> = {};
    for (const [k, v] of source.entries()) {
      obj[k] = v;
    }
    window.localStorage.setItem(key, JSON.stringify(obj));
  } catch {
    // Ignore storage quota/security errors
  }
}

export function initImageResolverCache() {
  if (typeof window === 'undefined') return;
  if (memoryLogoCache.size === 0) loadStorageMap(STORAGE_KEY_LOGOS, memoryLogoCache);
  if (memoryBannerCache.size === 0) loadStorageMap(STORAGE_KEY_BANNERS, memoryBannerCache);
}

/**
 * Registers live ESPN NBA News articles from https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news
 * so getUniqueMatchImage(match) can pull real, unused ESPN action photos for matching NBA teams.
 */
export function registerEspnNewsArticles(articles?: any[]) {
  if (!Array.isArray(articles) || articles.length === 0) return;
  for (const art of articles) {
    const imgUrl = String(
      art?.images?.[0]?.url ||
      art?.video?.[0]?.thumbnail ||
      ''
    ).trim();
    if (!imgUrl) continue;

    const text = `${art?.headline || ''} ${art?.description || ''} ${
      Array.isArray(art?.categories)
        ? art.categories.map((c: any) => c?.description || c?.team?.description || '').join(' ')
        : ''
    }`.toLowerCase();

    const nbaKeywords = [
      'lakers', 'warriors', 'celtics', 'hornets', 'nets', 'heat', 'bulls', 'bucks',
      'cavaliers', 'magic', 'nuggets', 'clippers', 'pistons', 'timberwolves', 'pacers',
      'thunder', 'pelicans', 'mavericks', 'knicks', 'raptors', 'suns', 'spurs',
      'trail blazers', 'blazers', 'kings', '76ers', 'sixers', 'hawks', 'wizards',
      'grizzlies', 'rockets', 'jazz'
    ];

    for (const kw of nbaKeywords) {
      if (text.includes(kw)) {
        const canonical = String(getCanonicalTeamName(kw) || kw).toLowerCase();
        const existing = espnTeamNewsImages.get(canonical) || [];
        if (!existing.includes(imgUrl)) {
          existing.push(imgUrl);
          espnTeamNewsImages.set(canonical, existing);
        }
      }
    }
  }
}

function escapeXml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/**
 * Generates a clean SVG basketball crest data URI with the team's initials (Zero Broken Images Guarantee)
 */
export function getSvgBasketballCrest(teamName: string): string {
  const clean = String(teamName || 'Basketball')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim();
  const initials = escapeXml(getTeamInitials(clean));
  const primary = getTeamAccent(clean, '#ea580c');
  const hash = hashString(clean);
  const secondaryPalettes = ['#0f172a', '#1e1b4b', '#172554', '#052e16', '#450a0a', '#3b0764'];
  const secondary = secondaryPalettes[hash % secondaryPalettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${primary}"/>
        <stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <circle cx="48" cy="48" r="44" fill="url(#g)" stroke="#ffffff" stroke-width="3" stroke-opacity="0.35"/>
    <path d="M12 48 H84 M48 12 V84" stroke="#ffffff" stroke-width="2" stroke-opacity="0.18"/>
    <path d="M22 22 Q48 48 22 74 M74 22 Q48 48 74 74" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.18"/>
    <text x="48" y="56" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="24" fill="#ffffff" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates a unique, team-accurate 16:9 Arena Hardwood & Stadium Spotlight Backdrop SVG
 */
export function getSvgMatchupBanner(awayTeam: string, homeTeam: string, league = 'BASKETBALL'): string {
  const awayClean = String(awayTeam || 'Away Team').trim();
  const homeClean = String(homeTeam || 'Home Team').trim();
  const leagueClean = escapeXml(String(league || 'BASKETBALL').toUpperCase());

  const awayColor = getTeamAccent(awayClean, '#e11d48');
  const homeColor = getTeamAccent(homeClean, '#2563eb');
  const awayInit = escapeXml(getTeamInitials(awayClean));
  const homeInit = escapeXml(getTeamInitials(homeClean));

  const seed = hashString(`${awayClean}__${homeClean}__${leagueClean}`);
  const styleVariant = seed % 5;

  const courtTones = [
    ['#3b2313', '#26150a', '#52321b'],
    ['#2e1f14', '#1a110a', '#442d1c'],
    ['#35261a', '#1f160e', '#4b3624'],
    ['#2b1d16', '#170f0b', '#3f2a1f'],
    ['#382210', '#211308', '#4f3117']
  ];
  const [woodMid, woodDark, woodLight] = courtTones[styleVariant];
  const beamAngle = 15 + (seed % 20);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#060b16"/>
        <stop offset="50%" stop-color="#0d1527"/>
        <stop offset="100%" stop-color="#090d1a"/>
      </linearGradient>
      <radialGradient id="awayGlow" cx="18%" cy="32%" r="58%">
        <stop offset="0%" stop-color="${awayColor}" stop-opacity="0.62"/>
        <stop offset="55%" stop-color="${awayColor}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#060b16" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="homeGlow" cx="82%" cy="32%" r="58%">
        <stop offset="0%" stop-color="${homeColor}" stop-opacity="0.62"/>
        <stop offset="55%" stop-color="${homeColor}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#060b16" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hardwood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${woodDark}" stop-opacity="0.9"/>
        <stop offset="45%" stop-color="${woodMid}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${woodLight}" stop-opacity="0.98"/>
      </linearGradient>
      <linearGradient id="centerSplit" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${awayColor}" stop-opacity="0.45"/>
        <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${homeColor}" stop-opacity="0.45"/>
      </linearGradient>
    </defs>

    <rect width="1280" height="720" fill="url(#sky)"/>
    <rect width="1280" height="720" fill="url(#awayGlow)"/>
    <rect width="1280" height="720" fill="url(#homeGlow)"/>

    <g stroke="#ffffff" stroke-opacity="0.07" stroke-width="2">
      <line x1="0" y1="70" x2="1280" y2="70"/>
      <line x1="120" y1="0" x2="340" y2="420"/>
      <line x1="1160" y1="0" x2="940" y2="420"/>
    </g>
    <polygon points="180,0 40,460 440,460" fill="${awayColor}" fill-opacity="0.12" transform="rotate(-${beamAngle} 180 0)"/>
    <polygon points="1100,0 840,460 1240,460" fill="${homeColor}" fill-opacity="0.12" transform="rotate(${beamAngle} 1100 0)"/>

    <rect x="0" y="370" width="1280" height="16" fill="url(#centerSplit)"/>
    <line x1="0" y1="370" x2="1280" y2="370" stroke="#fbbf24" stroke-opacity="0.35" stroke-width="1.5"/>
    <line x1="0" y1="386" x2="1280" y2="386" stroke="#38bdf8" stroke-opacity="0.3" stroke-width="1.5"/>

    <polygon points="0,386 1280,386 1280,720 0,720" fill="url(#hardwood)"/>
    <polygon points="0,386 240,386 90,720 0,720" fill="${awayColor}" fill-opacity="0.38"/>
    <polygon points="1040,386 1280,386 1280,720 1190,720" fill="${homeColor}" fill-opacity="0.38"/>

    <g fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="3">
      <line x1="240" y1="386" x2="90" y2="720"/>
      <line x1="1040" y1="386" x2="1190" y2="720"/>
      <line x1="640" y1="386" x2="640" y2="720"/>
      <ellipse cx="640" cy="545" rx="145" ry="52" fill="${awayColor}" fill-opacity="0.12" stroke="#fbbf24" stroke-opacity="0.35"/>
      <path d="M 190 430 Q 430 540 140 690" stroke="${awayColor}" stroke-opacity="0.45" stroke-width="4"/>
      <path d="M 1090 430 Q 850 540 1140 690" stroke="${homeColor}" stroke-opacity="0.45" stroke-width="4"/>
    </g>

    <text x="165" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="140" fill="#ffffff" fill-opacity="0.06" letter-spacing="4">${awayInit}</text>
    <text x="1115" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="140" fill="#ffffff" fill-opacity="0.06" letter-spacing="4">${homeInit}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates a complete, self-contained 16:9 Broadcast Matchup Cover SVG for standalone blog cards
 */
export function getSvgBlogArticleCover(params: {
  awayTeam: string;
  homeTeam: string;
  league?: string;
  competition?: string;
  status?: 'live' | 'finished' | 'scheduled' | string;
  awayScore?: number;
  homeScore?: number;
  clockOrTime?: string;
  venue?: string;
}): string {
  const awayClean = String(params.awayTeam || 'Away Team').trim();
  const homeClean = String(params.homeTeam || 'Home Team').trim();
  const leagueClean = escapeXml(String(params.league || 'BASKETBALL').toUpperCase());
  const compClean = escapeXml(String(params.competition || `${leagueClean} OFFICIAL MATCHUP`).toUpperCase()).slice(0, 44);
  const venueClean = escapeXml(String(params.venue || 'Official Basketball Arena')).slice(0, 52);

  const awayDisplay = escapeXml(awayClean.length > 22 ? awayClean.slice(0, 20) + '…' : awayClean);
  const homeDisplay = escapeXml(homeClean.length > 22 ? homeClean.slice(0, 20) + '…' : homeClean);

  const awayInit = escapeXml(getTeamInitials(awayClean));
  const homeInit = escapeXml(getTeamInitials(homeClean));
  const awayColor = getTeamAccent(awayClean, '#dc2626');
  const homeColor = getTeamAccent(homeClean, '#2563eb');

  const hScore = Number(params.homeScore || 0);
  const aScore = Number(params.awayScore || 0);
  const status = String(params.status || 'scheduled').toLowerCase();

  let centerBadgeTop = 'OFFICIAL TIP-OFF';
  let centerMainText = 'VS';
  let centerSubText = escapeXml(params.clockOrTime || 'TODAY PHT');
  let pillColor = '#f59e0b';

  if (status === 'live') {
    centerBadgeTop = 'LIVE IN-PLAY';
    centerMainText = aScore > 0 || hScore > 0 ? `${aScore} – ${hScore}` : 'LIVE';
    centerSubText = escapeXml(params.clockOrTime || 'IN PROGRESS');
    pillColor = '#ef4444';
  } else if (status === 'finished') {
    centerBadgeTop = 'FINAL BOX SCORE';
    centerMainText = aScore > 0 || hScore > 0 ? `${aScore} – ${hScore}` : 'FINAL';
    centerSubText = 'POST-GAME RECAP';
    pillColor = '#10b981';
  } else {
    centerBadgeTop = 'MATCHUP PREVIEW';
    centerMainText = 'VS';
    centerSubText = escapeXml(params.clockOrTime || 'PREVIEW & ODDS');
    pillColor = '#f59e0b';
  }

  const seed = hashString(`${awayClean}::${homeClean}::${status}::${leagueClean}`);
  const layoutVariant = seed % 4;
  const woodShades = [
    ['#3d2412', '#241409'],
    ['#332014', '#1c110a'],
    ['#422a17', '#29180b'],
    ['#2e1c11', '#180e08']
  ];
  const [courtLight, courtDark] = woodShades[layoutVariant];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#070c18"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#090d16"/>
      </linearGradient>
      <radialGradient id="leftSpot" cx="20%" cy="38%" r="55%">
        <stop offset="0%" stop-color="${awayColor}" stop-opacity="0.65"/>
        <stop offset="60%" stop-color="${awayColor}" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#070c18" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="rightSpot" cx="80%" cy="38%" r="55%">
        <stop offset="0%" stop-color="${homeColor}" stop-opacity="0.65"/>
        <stop offset="60%" stop-color="${homeColor}" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#070c18" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="courtFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${courtDark}"/>
        <stop offset="100%" stop-color="${courtLight}"/>
      </linearGradient>
      <linearGradient id="awayShield" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${awayColor}"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="homeShield" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${homeColor}"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>

    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect width="1280" height="720" fill="url(#leftSpot)"/>
    <rect width="1280" height="720" fill="url(#rightSpot)"/>

    <polygon points="0,0 680,0 590,720 0,720" fill="${awayColor}" fill-opacity="0.12"/>
    <polygon points="680,0 1280,0 1280,720 590,720" fill="${homeColor}" fill-opacity="0.12"/>

    <polygon points="0,470 1280,470 1280,720 0,720" fill="url(#courtFloor)" opacity="0.92"/>
    <line x1="0" y1="470" x2="1280" y2="470" stroke="#fbbf24" stroke-opacity="0.45" stroke-width="3"/>
    <ellipse cx="640" cy="595" rx="170" ry="54" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="3"/>
    <line x1="640" y1="470" x2="640" y2="720" stroke="#ffffff" stroke-opacity="0.22" stroke-width="3"/>

    <rect x="64" y="42" width="1152" height="58" rx="14" fill="#090f1d" fill-opacity="0.86" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1.5"/>
    <rect x="82" y="54" width="130" height="34" rx="8" fill="${pillColor}"/>
    <text x="147" y="77" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#090f1d" letter-spacing="1.5">${leagueClean}</text>
    <text x="234" y="77" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#f8fafc" letter-spacing="1.5">${compClean}</text>
    <text x="1192" y="77" text-anchor="end" font-family="Arial, sans-serif" font-weight="800" font-size="15" fill="#fbbf24" letter-spacing="1.5">${centerBadgeTop}</text>

    <text x="210" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="180" fill="#ffffff" fill-opacity="0.05">${awayInit}</text>
    <text x="1070" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="180" fill="#ffffff" fill-opacity="0.05">${homeInit}</text>

    <g transform="translate(96, 150)">
      <rect width="390" height="360" rx="26" fill="#0b1324" fill-opacity="0.82" stroke="${awayColor}" stroke-opacity="0.65" stroke-width="2.5"/>
      <circle cx="195" cy="138" r="82" fill="url(#awayShield)" stroke="#ffffff" stroke-width="4" stroke-opacity="0.85"/>
      <path d="M123 138 H267 M195 66 V210" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.22"/>
      <path d="M142 86 Q195 138 142 190 M248 86 Q195 138 248 190" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.22"/>
      <text x="195" y="153" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#ffffff" letter-spacing="2">${awayInit}</text>
      <text x="195" y="274" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="26" fill="#ffffff">${awayDisplay}</text>
      <text x="195" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#94a3b8" letter-spacing="2">AWAY CONTENDER</text>
    </g>

    <g transform="translate(515, 225)">
      <rect width="250" height="210" rx="24" fill="#090f1d" fill-opacity="0.92" stroke="#fbbf24" stroke-opacity="0.55" stroke-width="2"/>
      <text x="125" y="54" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#fbbf24" letter-spacing="2">${centerBadgeTop}</text>
      <text x="125" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="${centerMainText.length > 4 ? '42' : '56'}" fill="#ffffff">${centerMainText}</text>
      <rect x="28" y="150" width="194" height="34" rx="10" fill="#1e293b"/>
      <text x="125" y="172" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#38bdf8" letter-spacing="1">${centerSubText}</text>
    </g>

    <g transform="translate(794, 150)">
      <rect width="390" height="360" rx="26" fill="#0b1324" fill-opacity="0.82" stroke="${homeColor}" stroke-opacity="0.65" stroke-width="2.5"/>
      <circle cx="195" cy="138" r="82" fill="url(#homeShield)" stroke="#ffffff" stroke-width="4" stroke-opacity="0.85"/>
      <path d="M123 138 H267 M195 66 V210" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.22"/>
      <path d="M142 86 Q195 138 142 190 M248 86 Q195 138 248 190" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.22"/>
      <text x="195" y="153" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#ffffff" letter-spacing="2">${homeInit}</text>
      <text x="195" y="274" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="26" fill="#ffffff">${homeDisplay}</text>
      <text x="195" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#94a3b8" letter-spacing="2">HOME CONTENDER</text>
    </g>

    <rect x="96" y="618" width="1088" height="54" rx="14" fill="#090f1d" fill-opacity="0.88" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
    <text x="640" y="651" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="16" fill="#e2e8f0" letter-spacing="1">${venueClean}  •  TIPOFF PH OFFICIAL COVERAGE</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Universal @error handler for <img> tags that replaces any broken image with the SVG basketball crest
 */
export function handleImageErrorToCrest(event: Event, teamName: string) {
  const img = event?.target as HTMLImageElement | null;
  if (!img) return;
  const crest = getSvgBasketballCrest(teamName);
  if (img.src !== crest) {
    img.src = crest;
  }
}

/**
 * Universal @error handler for 16:9 banner <img> tags.
 * Falls back first to dynamic Bing search thumbnail if not yet tried, then to SVG matchup banner.
 */
export function handleBannerImageError(event: Event, awayTeam: string, homeTeam: string, league = 'BASKETBALL') {
  const img = event?.target as HTMLImageElement | null;
  if (!img) return;
  if (!img.dataset.bingFallbackTried && !img.src.includes('tse1.mm.bing.net')) {
    img.dataset.bingFallbackTried = '1';
    img.src = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(awayTeam + ' vs ' + homeTeam + ' ' + league + ' basketball latest')}&w=800&h=450&c=7&rs=1&p=0`;
    return;
  }
  img.src = getSvgMatchupBanner(awayTeam, homeTeam, league);
}

/**
 * 1. Normalize native image URLs from live88.eu.cc
 */
export function normalizeLive88ImageUrl(rawUrl: any): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/img/') || trimmed.startsWith('/videos/')) return trimmed;
  if (trimmed.startsWith('/')) {
    return `https://live88.eu.cc${trimmed}`;
  }
  return trimmed;
}

/**
 * Inspects a raw match object from /bootstrap, /matches, or /livestream for all native image fields
 */
export function extractLive88MatchImages(raw: any): {
  homeLogo: string;
  awayLogo: string;
  bannerUrl: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { homeLogo: '', awayLogo: '', bannerUrl: '' };
  }

  const homeObj = raw.home || raw.homeTeam || raw.team1 || {};
  const awayObj = raw.away || raw.awayTeam || raw.team2 || {};

  const homeCandidates = [
    raw.home_logo,
    raw.home_team_logo,
    raw.team1_logo,
    raw.homeLogo,
    homeObj?.logo,
    homeObj?.icon,
    homeObj?.badge,
    homeObj?.image
  ];

  const awayCandidates = [
    raw.away_logo,
    raw.away_team_logo,
    raw.team2_logo,
    raw.awayLogo,
    awayObj?.logo,
    awayObj?.icon,
    awayObj?.badge,
    awayObj?.image
  ];

  const bannerCandidates = [
    raw.thumbnail,
    raw.cover,
    raw.poster,
    raw.banner,
    raw.image,
    raw.thumb
  ];

  const pickFirstNormalized = (list: any[]) => {
    for (const item of list) {
      const norm = normalizeLive88ImageUrl(item);
      if (norm) return norm;
    }
    return '';
  };

  return {
    homeLogo: pickFirstNormalized(homeCandidates),
    awayLogo: pickFirstNormalized(awayCandidates),
    bannerUrl: pickFirstNormalized(bannerCandidates)
  };
}

const NBA_TEAM_ACTION_ASSETS: Array<{ keywords: string[]; webp: string; jpg: string }> = [
  { keywords: ['brooklyn nets', 'nets'], webp: '/img/nba-teams/bkn-action.webp', jpg: '/img/nba-teams/bkn-action.jpg' },
  { keywords: ['boston celtics', 'celtics'], webp: '/img/nba-teams/bos-action.webp', jpg: '/img/nba-teams/bos-action.jpg' },
  { keywords: ['charlotte hornets', 'hornets'], webp: '/img/nba-teams/cha-action.webp', jpg: '/img/nba-teams/cha-action.jpg' },
  { keywords: ['chicago bulls', 'bulls'], webp: '/img/nba-teams/chi-action.webp', jpg: '/img/nba-teams/chi-action.jpg' },
  { keywords: ['cleveland cavaliers', 'cavaliers', 'cavs'], webp: '/img/nba-teams/cle-action.webp', jpg: '/img/nba-teams/cle-action.jpg' },
  { keywords: ['dallas mavericks', 'mavericks', 'mavs'], webp: '/img/nba-teams/dal-action.webp', jpg: '/img/nba-teams/dal-action.jpg' },
  { keywords: ['denver nuggets', 'nuggets'], webp: '/img/nba-teams/den-action.webp', jpg: '/img/nba-teams/den-action.jpg' },
  { keywords: ['detroit pistons', 'pistons'], webp: '/img/nba-teams/det-action.webp', jpg: '/img/nba-teams/det-action.jpg' },
  { keywords: ['golden state warriors', 'warriors'], webp: '/img/nba-teams/gsw-action.webp', jpg: '/img/nba-teams/gsw-action.jpg' },
  { keywords: ['indiana pacers', 'pacers'], webp: '/img/nba-teams/ind-action.webp', jpg: '/img/nba-teams/ind-action.jpg' },
  { keywords: ['la clippers', 'los angeles clippers', 'clippers'], webp: '/img/nba-teams/lac-action.webp', jpg: '/img/nba-teams/lac-action.jpg' },
  { keywords: ['los angeles lakers', 'la lakers', 'lakers'], webp: '/img/nba-teams/lal-action.webp', jpg: '/img/nba-teams/lal-action.jpg' },
  { keywords: ['miami heat', 'heat'], webp: '/img/nba-teams/mia-action.webp', jpg: '/img/nba-teams/mia-action.jpg' },
  { keywords: ['milwaukee bucks', 'bucks'], webp: '/img/nba-teams/mil-action.webp', jpg: '/img/nba-teams/mil-action.jpg' },
  { keywords: ['minnesota timberwolves', 'timberwolves', 'wolves'], webp: '/img/nba-teams/min-action.webp', jpg: '/img/nba-teams/min-action.jpg' },
  { keywords: ['new orleans pelicans', 'pelicans'], webp: '/img/nba-teams/nop-action.webp', jpg: '/img/nba-teams/nop-action.jpg' },
  { keywords: ['new york knicks', 'knicks'], webp: '/img/nba-teams/nyk-action.webp', jpg: '/img/nba-teams/nyk-action.jpg' },
  { keywords: ['oklahoma city thunder', 'thunder'], webp: '/img/nba-teams/okc-action.webp', jpg: '/img/nba-teams/okc-action.jpg' },
  { keywords: ['orlando magic', 'magic'], webp: '/img/nba-teams/orl-action.webp', jpg: '/img/nba-teams/orl-action.jpg' },
  { keywords: ['phoenix suns', 'suns'], webp: '/img/nba-teams/phx-action.webp', jpg: '/img/nba-teams/phx-action.jpg' },
  { keywords: ['portland trail blazers', 'trail blazers'], webp: '/img/nba-teams/por-action.webp', jpg: '/img/nba-teams/por-action.jpg' },
  { keywords: ['sacramento kings', 'kings'], webp: '/img/nba-teams/sac-action.webp', jpg: '/img/nba-teams/sac-action.jpg' },
  { keywords: ['san antonio spurs', 'spurs'], webp: '/img/nba-teams/sas-action.webp', jpg: '/img/nba-teams/sas-action.jpg' },
  { keywords: ['toronto raptors', 'raptors'], webp: '/img/nba-teams/tor-action.webp', jpg: '/img/nba-teams/tor-action.jpg' }
];

/**
 * Strictly checks if a curated local action photo matches the EXACT teams in the matchup
 * and has not been used yet in `usedImages`. Never returns a photo of unrelated teams.
 */
export function findExactMatchupOrTeamPhoto(
  awayTeam: string,
  homeTeam: string,
  league = 'Basketball',
  usedImages?: Set<string>
): string {
  const awayLower = String(getCanonicalTeamName(awayTeam) || awayTeam || '').toLowerCase();
  const homeLower = String(getCanonicalTeamName(homeTeam) || homeTeam || '').toLowerCase();
  const combined = `${awayLower} ${homeLower}`;
  const isNba = league.toLowerCase() === 'nba' || (isVerifiedNbaTeam(awayTeam) && isVerifiedNbaTeam(homeTeam));

  const tryPick = (url: string): string => {
    if (!usedImages) return url;
    if (!usedImages.has(url)) {
      usedImages.add(url);
      return url;
    }
    return '';
  };

  const hasBoth = (teamA: string, teamB: string) =>
    (awayLower.includes(teamA) && homeLower.includes(teamB)) ||
    (awayLower.includes(teamB) && homeLower.includes(teamA));

  // 1. Exact Dual-Team Matchup Photos (BOTH teams must be in the game)
  if (isNba) {
    if (hasBoth('nets', 'heat')) { const p = tryPick('/img/articles/nba-preseason-pred-bkn-mia.webp'); if (p) return p; }
    if (hasBoth('hornets', 'celtics')) { const p = tryPick('/img/articles/nba-preseason-pred-cha-bos.webp'); if (p) return p; }
    if (hasBoth('bulls', 'bucks')) { const p = tryPick('/img/articles/nba-preseason-pred-chi-mil.webp'); if (p) return p; }
    if (hasBoth('cavaliers', 'magic')) { const p = tryPick('/img/articles/nba-preseason-pred-cle-orl.webp'); if (p) return p; }
    if (hasBoth('nuggets', 'clippers')) { const p = tryPick('/img/articles/nba-preseason-pred-den-lac.webp'); if (p) return p; }
    if (hasBoth('pistons', 'timberwolves')) { const p = tryPick('/img/articles/nba-preseason-pred-det-min.webp'); if (p) return p; }
    if (hasBoth('warriors', 'lakers')) {
      const p1 = tryPick('/img/articles/nba-preseason-pred-gsw-lal.webp');
      if (p1) return p1;
      const p2 = tryPick('/img/articles/warriors-lakers-curry-bronny.webp');
      if (p2) return p2;
    }
    if (hasBoth('pacers', 'thunder')) { const p = tryPick('/img/articles/nba-preseason-pred-ind-okc.webp'); if (p) return p; }
    if (hasBoth('pelicans', 'mavericks')) { const p = tryPick('/img/articles/nba-preseason-pred-nop-dal.webp'); if (p) return p; }
    if (hasBoth('knicks', 'raptors')) { const p = tryPick('/img/articles/nba-preseason-pred-nyk-tor.webp'); if (p) return p; }
    if (hasBoth('suns', 'spurs')) { const p = tryPick('/img/articles/nba-preseason-pred-phx-sas.webp'); if (p) return p; }
    if (hasBoth('blazers', 'kings')) { const p = tryPick('/img/articles/nba-preseason-pred-por-sac.webp'); if (p) return p; }
    if (hasBoth('knicks', 'timberwolves')) { const p = tryPick('/img/articles/knicks-timberwolves-nba-preseason.webp'); if (p) return p; }

    // Single-team NBA action photos (only if one of the two teams in the game is that exact NBA franchise)
    for (const side of [awayLower, homeLower]) {
      for (const asset of NBA_TEAM_ACTION_ASSETS) {
        if (asset.keywords.some(kw => side.includes(kw))) {
          const w = tryPick(asset.webp);
          if (w) return w;
          const j = tryPick(asset.jpg);
          if (j) return j;
        }
      }
    }
  }

  // 2. Philippine Leagues Exact Matchup Photos
  if (hasBoth('ginebra', 'nlex') || hasBoth('gin kings', 'road warriors')) {
    const p = tryPick('/img/articles/pba-ginebra-vs-nlex-araneta.jpg');
    if (p) return p;
  }
  if (hasBoth('san miguel', 'magnolia')) {
    const p = tryPick('/img/articles/san-miguel-beermen-dominance.webp');
    if (p) return p;
  }
  if (hasBoth('san miguel', 'meralco')) {
    const p = tryPick('/img/articles/san-miguel-beermen-semifinals-phcup.webp');
    if (p) return p;
  }
  if (hasBoth('maroons', 'archers') || hasBoth('up ', 'dlsu') || hasBoth('fighting maroons', 'la salle')) {
    const p1 = tryPick('/img/articles/uaap-season-87-finals-up-dlsu.webp');
    if (p1) return p1;
    const p2 = tryPick('/img/articles/uaap-up-fighting-maroons-unbeaten.webp');
    if (p2) return p2;
  }
  if (hasBoth('maroons', 'red warriors') || hasBoth('fighting maroons', 'ue ')) {
    const p = tryPick('/img/articles/uaap-up-vs-ue-red-warriors.jpg');
    if (p) return p;
  }
  if (combined.includes('feu') || combined.includes('tamaraws')) {
    const p = tryPick('/img/articles/uaap-feu-tamaraws-moa-arena.jpg');
    if (p) return p;
  }
  if (hasBoth('batangas', 'san juan')) {
    const p = tryPick('/img/articles/mpbl-batangas-vs-san-juan.jpg');
    if (p) return p;
  }

  return '';
}

/**
 * RULE 3: Real-Time Latest Image Fetcher (ESPN + PBA + Search/Social Latest Thumbnails)
 * Never reuses the same photo across multiple blog cards! Uses `usedImageUrls = new Set()` check
 * so every single blog post has a 100% unique, real photo:
 * 1. For NBA Blogs (ESPN Live Feed):
 *    - Pulls the exact game action photo from ESPN (`competitions[0].headlines?.[0]?.video?.[0]?.thumbnail`)
 *      or matching team article image from `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news`.
 * 2. For PBA Blogs & Missing Action Photos (Live Web/News/Social Image Search):
 *    - Queries the latest sports news & social media image thumbnail dynamically using the exact matchup query
 *      (`https://tse1.mm.bing.net/th?q=${encodeURIComponent(match.away_team + ' vs ' + match.home_team + ' ' + match.league + ' basketball latest')}&w=800&h=450&c=7&rs=1&p=0`).
 */
export function getUniqueMatchImage(
  match: UniqueMatchImageInput,
  usedImageUrls: Set<string> = globalUsedImageUrls
): string {
  initImageResolverCache();

  const awayTeam = String(
    match.away_team || match.awayTeam || match.away?.name || 'Away Team'
  ).trim();
  const homeTeam = String(
    match.home_team || match.homeTeam || match.home?.name || 'Home Team'
  ).trim();

  const isNba =
    String(match.league || match.leagueId || '').toUpperCase().includes('NBA') ||
    (isVerifiedNbaTeam(awayTeam) && isVerifiedNbaTeam(homeTeam));
  const leagueLabel = isNba
    ? 'NBA'
    : String(match.league || match.leagueId || 'PBA').toUpperCase().includes('PBA')
    ? 'PBA'
    : String(match.league || match.leagueId || 'Basketball').toUpperCase();

  const claimUrl = (candidate?: string): string => {
    const clean = normalizeLive88ImageUrl(candidate);
    if (!clean || clean.startsWith('data:image/svg')) return '';
    if (!usedImageUrls.has(clean)) {
      usedImageUrls.add(clean);
      return clean;
    }
    return '';
  };

  // 1. For NBA Blogs (ESPN Live Feed):
  // Pull exact game action photo from ESPN (competitions[0].headlines?.[0]?.video?.[0]?.thumbnail)
  // or matching team article image from https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news
  const espnDirect =
    claimUrl(match.actionThumbnail) ||
    claimUrl(match.espnThumbnail) ||
    claimUrl(match.bannerUrl);
  if (espnDirect) {
    return espnDirect;
  }

  if (isNba) {
    const awayCanonical = String(getCanonicalTeamName(awayTeam) || awayTeam).toLowerCase();
    const homeCanonical = String(getCanonicalTeamName(homeTeam) || homeTeam).toLowerCase();
    const candidatePool = [
      ...(espnTeamNewsImages.get(awayCanonical) || []),
      ...(espnTeamNewsImages.get(homeCanonical) || [])
    ];
    for (const newsImg of candidatePool) {
      const picked = claimUrl(newsImg);
      if (picked) return picked;
    }
  }

  // Check exact dual-team photo for this specific matchup if unused
  const exactCurated = findExactMatchupOrTeamPhoto(awayTeam, homeTeam, leagueLabel, usedImageUrls);
  if (exactCurated) {
    return exactCurated;
  }

  // 2. For PBA Blogs & Missing Action Photos (Live Web/News/Social Image Search):
  // Query the latest sports news & social media image thumbnail dynamically using the exact matchup query
  const searchQueries = [
    `${awayTeam} vs ${homeTeam} ${leagueLabel} basketball latest`,
    `${awayTeam} vs ${homeTeam} ${leagueLabel} basketball game`,
    `${awayTeam} vs ${homeTeam} ${leagueLabel} basketball highlights`,
    `${homeTeam} vs ${awayTeam} ${leagueLabel} basketball action`,
    `${awayTeam} vs ${homeTeam} ${leagueLabel} basketball ${match.status || ''} ${match.id || match.slug || ''}`.trim()
  ];

  for (const q of searchQueries) {
    const bingThumbUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(q)}&w=800&h=450&c=7&rs=1&p=0`;
    if (!usedImageUrls.has(bingThumbUrl)) {
      usedImageUrls.add(bingThumbUrl);
      return bingThumbUrl;
    }
  }

  // Ultimate guaranteed-unique Bing search URL with seed counter
  const uniqueFallbackQuery = `${awayTeam} vs ${homeTeam} ${leagueLabel} basketball ${usedImageUrls.size + 1}`;
  const finalBingUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(uniqueFallbackQuery)}&w=800&h=450&c=7&rs=1&p=0`;
  usedImageUrls.add(finalBingUrl);
  return finalBingUrl;
}

/**
 * Returns a unique match image for any league banner call
 */
export function getDefaultLeagueBanner(
  awayTeam: string,
  homeTeam: string,
  league = 'Basketball',
  usedImages?: Set<string>
): string {
  return getUniqueMatchImage(
    { away_team: awayTeam, home_team: homeTeam, league },
    usedImages || globalUsedImageUrls
  );
}

/**
 * 2. TheSportsDB Free Public API for PBA, MPBL & Global Basketball Teams
 */
export async function fetchSportsDbAssets(teamOrLeagueName: string): Promise<{
  logo: string;
  banner: string;
}> {
  const key = String(getCanonicalTeamName(teamOrLeagueName) || teamOrLeagueName || '').toLowerCase().trim();
  if (!key) return { logo: '', banner: '' };

  initImageResolverCache();
  const cachedLogo = memoryLogoCache.get(key) || '';
  const cachedBanner = memoryBannerCache.get(key) || '';
  if (cachedLogo && cachedBanner) {
    return { logo: cachedLogo, banner: cachedBanner };
  }

  const reqKey = `sportsdb:${key}`;
  if (inFlightRequests.has(reqKey)) {
    return inFlightRequests.get(reqKey)!;
  }

  const p = (async () => {
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamOrLeagueName)}`;
      const res = await fetch(url);
      if (!res.ok) return { logo: cachedLogo, banner: cachedBanner };
      const data = await res.json();
      const teams = Array.isArray(data?.teams) ? data.teams : [];
      const bballTeam = teams.find((t: any) => /basketball/i.test(String(t?.strSport || ''))) || teams[0];
      if (!bballTeam) return { logo: cachedLogo, banner: cachedBanner };

      const logo = String(bballTeam.strBadge || bballTeam.strLogo || '').trim();
      const banner = String(bballTeam.strFanart1 || bballTeam.strStadiumThumb || bballTeam.strBanner || '').trim();

      if (logo) {
        memoryLogoCache.set(key, logo);
        saveStorageMap(STORAGE_KEY_LOGOS, memoryLogoCache);
      }
      if (banner) {
        memoryBannerCache.set(key, banner);
        saveStorageMap(STORAGE_KEY_BANNERS, memoryBannerCache);
      }

      return { logo: logo || cachedLogo, banner: banner || cachedBanner };
    } catch {
      return { logo: cachedLogo, banner: cachedBanner };
    } finally {
      inFlightRequests.delete(reqKey);
    }
  })();

  inFlightRequests.set(reqKey, p);
  return p;
}

/**
 * 3. Automatic Topic Image Lookup via Wikipedia REST API + Wikimedia Commons Search
 */
export async function fetchTopicImage(query: string): Promise<string> {
  const cleanQuery = String(query || '').trim();
  if (!cleanQuery) return '';

  initImageResolverCache();
  const cacheKey = `topic:${cleanQuery.toLowerCase()}`;
  const existing = memoryBannerCache.get(cacheKey);
  if (existing) return existing;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const p = (async () => {
    try {
      const wikiSlug = cleanQuery.replace(/\s+/g, '_');
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiSlug)}`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const imgUrl = String(wikiData?.originalimage?.source || wikiData?.thumbnail?.source || '').trim();
        if (imgUrl && !imgUrl.endsWith('.svg')) {
          memoryBannerCache.set(cacheKey, imgUrl);
          saveStorageMap(STORAGE_KEY_BANNERS, memoryBannerCache);
          return imgUrl;
        }
      }

      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cleanQuery + ' basketball')}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const commonsRes = await fetch(commonsUrl);
      if (commonsRes.ok) {
        const commonsData = await commonsRes.json();
        const pages = commonsData?.query?.pages;
        if (pages && typeof pages === 'object') {
          const firstPage: any = Object.values(pages)[0];
          const foundUrl = String(firstPage?.imageinfo?.[0]?.url || '').trim();
          if (foundUrl) {
            memoryBannerCache.set(cacheKey, foundUrl);
            saveStorageMap(STORAGE_KEY_BANNERS, memoryBannerCache);
            return foundUrl;
          }
        }
      }
    } catch {
      // Ignore network errors
    } finally {
      inFlightRequests.delete(cacheKey);
    }
    return '';
  })();

  inFlightRequests.set(cacheKey, p);
  return p;
}

/**
 * Resolves the best team logo synchronously from cache/dictionary
 */
export function resolveTeamLogoSync(teamName: string, providedLogo?: string): string {
  initImageResolverCache();
  const normProvided = normalizeLive88ImageUrl(providedLogo);
  if (normProvided && !normProvided.includes('default')) {
    return normProvided;
  }
  const key = String(getCanonicalTeamName(teamName) || teamName || '').toLowerCase().trim();
  const cached = memoryLogoCache.get(key);
  if (cached) return cached;

  const dictLogo = getTeamLogo(teamName, normProvided);
  if (dictLogo) return dictLogo;

  return getSvgBasketballCrest(teamName);
}

/**
 * Resolves a unique, matchup-specific 16:9 hero banner synchronously via getUniqueMatchImage.
 * Never reuses the same fallback photo across multiple blog cards.
 */
export function resolveMatchBannerSync(
  awayTeam: string,
  homeTeam: string,
  league: string,
  explicitBanner?: string,
  usedImages?: Set<string>
): string {
  return getUniqueMatchImage(
    {
      away_team: awayTeam,
      home_team: homeTeam,
      league,
      bannerUrl: explicitBanner
    },
    usedImages || globalUsedImageUrls
  );
}

/**
 * Handles broken image tags by swapping in a bespoke SVG team crest or matchup broadcast graphic
 */
export function handleImageError(
  event: Event,
  type: 'logo' | 'banner' = 'banner',
  teamOrTitle = 'Basketball',
  league = 'NBA'
): void {
  const img = event?.target as HTMLImageElement | null;
  if (!img || img.dataset.fallbackApplied === 'true') return;
  img.dataset.fallbackApplied = 'true';

  if (type === 'logo') {
    img.src = getSvgBasketballCrest(teamOrTitle);
    return;
  }

  const parts = String(teamOrTitle || '').split(/\s+vs\.?\s+/i);
  const awayTeam = (parts[0] || teamOrTitle || 'Away Team').trim();
  const homeTeam = (parts[1] || 'Home Team').trim();
  img.src = getSvgMatchupBanner(awayTeam, homeTeam, league);
}

