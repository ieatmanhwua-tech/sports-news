<script setup lang="ts">
import type { GameScore } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';
import LeagueFilterBar from '~/components/LeagueFilterBar.vue';
import { 
  Calendar, 
  Clock, 
  Tv, 
  MapPin, 
  ShieldCheck, 
  RefreshCw, 
  Trophy, 
  ArrowUpRight, 
  Flame,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  PlayCircle,
  PictureInPicture,
  Maximize2,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-vue-next';
import NbaOddsBoard from '~/components/NbaOddsBoard.vue';
import LocalSportsHub from '~/components/LocalSportsHub.vue';
import { getTeamLogo } from '~/shared/team-logos';

interface LeagueOption {
  id: string;
  name: string;
  fullName: string;
  eventName: string;
  logoUrl?: string;
  tag: string;
  path: string;
}

const LEAGUES_LIST: LeagueOption[] = [
  {
    id: 'all',
    name: 'All Competitions',
    fullName: 'All Philippine & International Competitions',
    eventName: 'Full Multi-League Verified Fixtures & Live Results',
    tag: 'ALL',
    path: '/scores-and-schedules'
  },
  {
    id: 'pba',
    name: 'PBA',
    fullName: 'Philippine Basketball Association',
    eventName: "PBA Governors' Cup 2026 - Quarterfinals & Semifinals",
    logoUrl: '/img/pba.png',
    tag: 'PRO',
    path: '/pba'
  },
  {
    id: 'mpbl',
    name: 'MPBL',
    fullName: 'Maharlika Pilipinas Basketball League',
    eventName: '2026 MPBL Playoffs - North & South Division Quarterfinals',
    logoUrl: '/img/mpbl.png',
    tag: 'REGIONAL',
    path: '/mpbl'
  },
  {
    id: 'uaap',
    name: 'UAAP',
    fullName: 'University Athletic Association of the Philippines',
    eventName: "UAAP Season 87 Men's Basketball Tournament",
    logoUrl: '/img/uaap.webp',
    tag: 'COLLEGE',
    path: '/uaap'
  },
  {
    id: 'ncaa',
    name: 'NCAA',
    fullName: 'NCAA Philippines Basketball',
    eventName: 'NCAA Season 100 Seniors Basketball Tournament',
    logoUrl: '/img/ncaa.png',
    tag: 'COLLEGE',
    path: '/ncaa'
  },
  {
    id: 'gilas',
    name: 'Gilas Pilipinas',
    fullName: 'National Team & FIBA Qualifiers',
    eventName: 'FIBA Asia Cup 2025 Qualifiers - Window 2',
    logoUrl: '/img/gilas-pilipinas.png',
    tag: 'NATIONAL',
    path: '/gilas'
  },
  {
    id: 'psl',
    name: 'PSL',
    fullName: 'Pilipinas Super League',
    eventName: "PSL President's Cup 2026 - National Championship Round",
    logoUrl: '/img/PSL_Logo.png',
    tag: 'REGIONAL',
    path: '/psl'
  },
  {
    id: 'd-league',
    name: 'PBA D-League',
    fullName: 'PBA Developmental League',
    eventName: "PBA D-League Aspirants' Cup 2026",
    logoUrl: '/img/PBA_D-League_logo.png',
    tag: 'LOCAL',
    path: '/d-league'
  },
  {
    id: 'vismin',
    name: 'VisMin Cup',
    fullName: 'Pilipinas VisMin Super Cup',
    eventName: 'Pilipinas VisMin Super Cup - Southern Conference',
    logoUrl: '/img/vismin-cup.png',
    tag: 'REGIONAL',
    path: '/vismin'
  },
  {
    id: 'nbl',
    name: 'NBL',
    fullName: 'National Basketball League Pilipinas',
    eventName: "NBL Pilipinas Chairman's Cup 2026",
    logoUrl: '/img/nbl.jpg',
    tag: 'REGIONAL',
    path: '/nbl'
  },
  {
    id: 'easl',
    name: 'EASL',
    fullName: 'East Asia Super League',
    eventName: 'EASL 2025-26 Season - Group Stage Marquee Clashes',
    logoUrl: '/img/easl-logo.svg',
    tag: 'SUPER LEAGUE',
    path: '/easl'
  },
  {
    id: 'nba',
    name: 'NBA',
    fullName: 'National Basketball Association',
    eventName: 'NBA 2025-26 Regular Season & Primetime Clashes',
    logoUrl: '/img/nba-logo.webp',
    tag: 'GLOBAL',
    path: '/nba'
  },
  {
    id: 'fiba',
    name: 'FIBA',
    fullName: 'FIBA Tournaments & Qualifiers',
    eventName: 'FIBA Olympic Qualifying Tournaments & Continental Cups',
    logoUrl: '/img/FIBA.webp',
    tag: 'GLOBAL',
    path: '/fiba'
  }
];

const selectedLeague = ref<string>('all');
const statusFilter = ref<'all' | 'live' | 'upcoming' | 'final'>('all');
const { formatManilaTime } = useFormatters();

const forceRefreshFlag = ref(false);
const isPolling = ref(false);
let scoresPollTimer: ReturnType<typeof setInterval> | null = null;

const { data, refresh, pending } = await useAsyncData('scores-board', async () => {
  return await $fetch<{
    source: string;
    lastUpdatedUtc: string;
    displayTimezone: string;
    games: GameScore[];
  }>('/api/scores', {
    query: {
      league: selectedLeague.value,
      refresh: forceRefreshFlag.value ? 'true' : undefined,
      _t: Date.now()
    }
  });
}, {
  watch: [selectedLeague]
});

async function refreshRealtimeScores() {
  if (isPolling.value) return;
  isPolling.value = true;
  forceRefreshFlag.value = true;
  try {
    await refresh();
  } finally {
    forceRefreshFlag.value = false;
    isPolling.value = false;
  }
}

onMounted(() => {
  scoresPollTimer = setInterval(() => {
    refreshRealtimeScores();
  }, 15000);
});

onUnmounted(() => {
  if (scoresPollTimer) {
    clearInterval(scoresPollTimer);
    scoresPollTimer = null;
  }
});

const currentLeagueInfo = computed(() => {
  return LEAGUES_LIST.find(l => 
    l.id.toLowerCase() === selectedLeague.value.toLowerCase() ||
    l.name.toLowerCase() === selectedLeague.value.toLowerCase()
  ) || LEAGUES_LIST[0];
});

const allGames = computed(() => data.value?.games || []);

const filteredGames = computed(() => {
  if (statusFilter.value === 'all') return allGames.value;
  return allGames.value.filter(g => g.status === statusFilter.value);
});

const liveCount = computed(() => allGames.value.filter(g => g.status === 'live').length);
const upcomingCount = computed(() => allGames.value.filter(g => g.status === 'upcoming').length);
const finalCount = computed(() => allGames.value.filter(g => g.status === 'final').length);

const sourceInfo = computed(() => data.value?.source || 'Official Philippine League Coverage');
const lastUpdated = computed(() => data.value?.lastUpdatedUtc || '');

const tournamentChips = [
  { id: 'all', label: 'All Competitions' },
  { id: 'pba', label: 'PBA Pro' },
  { id: 'mpbl', label: 'MPBL Regional' },
  { id: 'uaap', label: 'UAAP College' },
  { id: 'ncaa', label: 'NCAA College' },
  { id: 'gilas', label: 'Gilas National' },
  { id: 'psl', label: 'PSL Regional' },
  { id: 'nba', label: 'NBA Global' }
];

const selectedTournament = ref('all');

function handleTournamentSelect(id: string) {
  selectedTournament.value = id;
  selectedLeague.value = id;
}

function handleFilter(leagueId: string) {
  selectedLeague.value = leagueId;
  const matchChip = tournamentChips.find(c => c.id.toLowerCase() === leagueId.toLowerCase());
  selectedTournament.value = matchChip ? matchChip.id : 'all';
}

// Interactive Live Viewer and Bet Now modal state
const activeViewerGame = ref<GameScore | null>(null);
const viewerTab = ref<'stats' | 'stream'>('stats');
const activeBetGame = ref<GameScore | null>(null);
const selectedBetMarket = ref<'spread' | 'moneyline' | 'total'>('spread');
const selectedBetPick = ref<'home' | 'away' | 'over' | 'under'>('home');
const selectedStake = ref<number>(500);
const betPlacedSuccess = ref(false);

function openGameViewer(game: GameScore, tab?: 'stats' | 'stream') {
  activeViewerGame.value = game;
  viewerTab.value = tab || (game.status === 'live' ? 'stream' : 'stats');
}

function closeGameViewer() {
  activeViewerGame.value = null;
  viewerTab.value = 'stats';
}

// Floating Pop-out player state for scores-and-schedules
const isFloatingGamePopout = ref(false);
const activeFloatingGame = ref<GameScore | null>(null);

function popOutGame(game?: GameScore | null) {
  const g = game || activeViewerGame.value;
  if (!g) return;
  activeFloatingGame.value = g;
  isFloatingGamePopout.value = true;
  activeViewerGame.value = null;
}

function expandFloatingGame() {
  if (activeFloatingGame.value) {
    activeViewerGame.value = activeFloatingGame.value;
    viewerTab.value = 'stream';
    isFloatingGamePopout.value = false;
  }
}

function closeFloatingGame() {
  isFloatingGamePopout.value = false;
}

function openGameBet(game: GameScore) {
  activeBetGame.value = game;
  betPlacedSuccess.value = false;
  selectedBetMarket.value = 'spread';
  selectedBetPick.value = 'home';
}

function closeGameBet() {
  activeBetGame.value = null;
  betPlacedSuccess.value = false;
}

function placeSimulatedBet() {
  betPlacedSuccess.value = true;
}

const config = useRuntimeConfig();
const siteUrl = computed(() => (config.public.siteUrl || 'https://tipoff.bybetcasino.ph').replace(/\/$/, ''));
const canonicalUrl = computed(() => `${siteUrl.value}/scores-and-schedules`.toLowerCase());

// Schema.org Structured Data: SportsEvent Array + BreadcrumbList
const sportsEventJsonLd = computed(() => {
  const events = (allGames.value || []).slice(0, 15).map((g: GameScore) => ({
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    'name': `${g.homeTeam} vs ${g.awayTeam}`,
    'description': `${g.league} - ${g.eventName || 'Official Match Fixture'}`,
    'startDate': g.gameTimeUtc || new Date().toISOString(),
    'competitor': [
      { '@type': 'SportsTeam', 'name': g.homeTeam, 'image': g.homeTeamLogo },
      { '@type': 'SportsTeam', 'name': g.awayTeam, 'image': g.awayTeamLogo }
    ],
    'location': {
      '@type': 'Place',
      'name': g.venue || 'Araneta Coliseum, Manila, Philippines',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Metro Manila',
        'addressCountry': 'PH'
      }
    },
    'eventStatus': g.status === 'live' 
      ? 'https://schema.org/EventMovedOnline' 
      : (g.status === 'final' ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled'),
    'broadcastOfEvent': {
      '@type': 'BroadcastEvent',
      'isLiveBroadcast': g.status === 'live',
      'video': {
        '@type': 'VideoObject',
        'name': `${g.homeTeam} vs ${g.awayTeam} Courtside Live Stream`,
        'description': `Live video broadcast and match tracking for ${g.homeTeam} vs ${g.awayTeam}`,
        'embedUrl': `${siteUrl.value}/embed/live?matchId=${g.id}`,
        'thumbnailUrl': `${siteUrl.value}/img/TipOffPh_logo.png`,
        'uploadDate': new Date().toISOString()
      }
    }
  }));

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${siteUrl.value}/`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Scores & Schedules',
        'item': canonicalUrl.value
      }
    ]
  };

  return [breadcrumbs, ...events];
});

useHead({
  title: 'Philippine & Global Basketball Scores & Schedules | TipOffPh',
  meta: [
    { 
      name: 'description', 
      content: 'Official verified game schedules, live scores, venue locations, and television broadcasts for PBA, MPBL, UAAP, NCAA, Gilas Pilipinas, PSL, PBA D-League, VisMin Super Cup, NBL, EASL, NBA, and FIBA on TipOffPh.' 
    },
    { property: 'og:title', content: 'Basketball Scores & Schedules across All 12 Leagues | TipOffPh' },
    { property: 'og:description', content: 'Live courtside match updates, verified broadcast details, and official league tournament events across Philippine hoops.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` },
    { property: 'og:site_name', content: 'TipOff Bybet PH' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Philippine & Global Basketball Scores & Schedules | TipOffPh' },
    { name: 'twitter:description', content: 'Official verified game schedules, live scores, venue locations, and television broadcasts on TipOffPh.' },
    { name: 'twitter:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify(sportsEventJsonLd.value)
    }
  ]
});
</script>

<template>
  <div class="max-w-5xl mx-auto py-2">
    <!-- Header (Prominent but Compact Dark Translucent Glassmorphic Card) -->
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 sm:p-7 mb-5 shadow-[0_0_40px_rgba(6,182,212,0.12),0_10px_35px_rgba(0,0,0,0.7)] relative overflow-hidden ring-1 ring-orange-500/20">
      <!-- Glow flares inside card -->
      <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
      <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-500/10 blur-[80px] pointer-events-none" />
      <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <!-- Glowing Orange COURTSIDE CENTER Kicker -->
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]">
          <Calendar class="w-4 h-4 text-orange-400 animate-pulse" />
          <span class="tracking-widest">COURTSIDE CENTER</span>
        </div>
        <button 
          type="button" 
          @click="refreshRealtimeScores" 
          :disabled="pending || isPolling"
          class="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
          title="Refresh real-time API feeds"
        >
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': pending || isPolling }" />
          <span class="hidden sm:inline">{{ pending || isPolling ? 'Updating...' : 'Live Sync' }}</span>
        </button>
      </div>

      <!-- Compact Title & Short Easy-to-Read 1-Line Description -->
      <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm">
        Scores &amp; Schedules
      </h1>
      <p class="mt-1 text-xs sm:text-sm text-slate-300 font-medium leading-normal">
        Official fixtures, broadcast channels, and verified results.
      </p>

      <!-- Directly Below: Two Quick CTA Pill Buttons Side-by-Side -->
      <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 mt-3.5 pt-3 border-t border-slate-800/80">
        <NuxtLink
          to="/local-sports"
          class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-600/80 to-red-500/70 hover:from-red-600 hover:to-red-500 border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-all active:scale-95 text-center"
        >
          <span class="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0"></span>
          <span class="truncate">🔴 PBA &amp; Local</span>
        </NuxtLink>

        <NuxtLink
          to="/nba-odds"
          class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-amber-200 bg-gradient-to-r from-amber-600/30 via-slate-900 to-amber-500/20 hover:bg-amber-500/35 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all active:scale-95 text-center"
        >
          <span class="text-amber-400">📈</span>
          <span class="truncate">NBA Live Odds</span>
        </NuxtLink>
      </div>

      <!-- "Select League": Sleek Horizontally Swipeable Carousel of Colorful League Logos on Dark Translucent Pill Cards -->
      <div class="mt-4 pt-3.5 border-t border-slate-700/60">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Trophy class="w-3.5 h-3.5 text-amber-400" />
            <span>Select League:</span>
          </span>
          <span class="text-[10px] text-slate-400 font-medium">Swipe &rarr;</span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1 touch-pan-x">
          <button
            v-for="lg in LEAGUES_LIST"
            :key="lg.id"
            type="button"
            @click="handleFilter(lg.id)"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border active:scale-95"
            :class="selectedLeague.toLowerCase() === lg.id.toLowerCase() || (selectedLeague.toLowerCase() === lg.name.toLowerCase())
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)] ring-1 ring-orange-400/40'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-cyan-400/60 shadow-xs'"
          >
            <span v-if="lg.logoUrl" class="w-6 h-6 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <img :src="lg.logoUrl" :alt="lg.name" class="w-full h-full object-contain" />
            </span>
            <span class="whitespace-nowrap">{{ lg.name }}</span>
          </button>
        </div>
      </div>

      <!-- "Tournaments": Single Horizontal Swipeable Row of Colorful Tournament Filter Chips -->
      <div class="mt-3.5 pt-3 border-t border-slate-800/80">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
            <span>Tournaments:</span>
          </span>
          <span class="text-[10px] text-slate-400 font-medium">Swipe &rarr;</span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1 touch-pan-x">
          <button
            v-for="chip in tournamentChips"
            :key="chip.id"
            type="button"
            @click="handleTournamentSelect(chip.id)"
            class="px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all border whitespace-nowrap active:scale-95"
            :class="selectedTournament === chip.id
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)] font-black'
              : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:border-slate-500'"
          >
            {{ chip.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- Active League Event Spotlight Banner -->
    <div 
      v-if="currentLeagueInfo"
      class="mb-6 p-4 sm:p-5 rounded-xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden"
    >
      <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
        <Trophy class="w-48 h-48 text-white" />
      </div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
            <img 
              v-if="currentLeagueInfo.logoUrl" 
              :src="currentLeagueInfo.logoUrl" 
              :alt="currentLeagueInfo.name" 
              class="w-full h-full object-contain"
            />
            <Trophy v-else class="w-6 h-6 text-slate-800" />
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 tracking-wider">
                {{ currentLeagueInfo.tag }}
              </span>
              <span class="text-xs font-semibold text-amber-300">
                {{ currentLeagueInfo.fullName }}
              </span>
            </div>
            <h2 class="text-lg sm:text-xl font-black text-white mt-0.5">
              {{ currentLeagueInfo.eventName }}
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink 
            v-if="currentLeagueInfo.id === 'nba'"
            to="/nba-odds"
            class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm"
          >
            <TrendingUp class="w-3.5 h-3.5 text-slate-950" />
            <span>Dedicated Odds Board</span>
          </NuxtLink>

          <NuxtLink 
            v-if="currentLeagueInfo.id !== 'all'"
            :to="currentLeagueInfo.path"
            class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
          >
            <span>{{ currentLeagueInfo.name }} Hub &amp; News</span>
            <ArrowUpRight class="w-3.5 h-3.5 text-amber-400" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Live NBA Sports API Odds Section when NBA filter is selected -->
    <div v-if="selectedLeague === 'nba'" class="mb-6">
      <NbaOddsBoard 
        :limit="10"
        title="Live NBA Odds, Spreads &amp; Moneyline"
        subtitle="Live betting lines direct from NBA Sports API worker for all upcoming games"
      />
    </div>

    <!-- Live88 Minimalist Video Player & Real-Time Scoreboard Hub -->
    <div class="mb-6">
      <LocalSportsHub 
        :initial-league="selectedLeague === 'pba' ? 'pba' : (selectedLeague === 'mpbl' ? 'mpbl' : (['uaap', 'ncaa'].includes(selectedLeague) ? 'collegiate' : (selectedLeague === 'nba' ? 'nba' : 'all')))"
        :max-items="24"
      />
    </div>

    <!-- Match Status Quick Filters & Verification Bar (Dark HUD Glassmorphic) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-lg text-xs ring-1 ring-cyan-500/20">
      <!-- Status Pills -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-slate-400 font-bold mr-1 text-[11px] uppercase tracking-wider">
          Status:
        </span>
        <button
          type="button"
          @click="statusFilter = 'all'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all text-xs"
          :class="statusFilter === 'all' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700/70'"
        >
          All ({{ allGames.length }})
        </button>
        <button
          v-if="liveCount > 0"
          type="button"
          @click="statusFilter = 'live'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5"
          :class="statusFilter === 'live' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/50'"
        >
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>Live Now ({{ liveCount }})</span>
        </button>
        <button
          v-if="upcomingCount > 0"
          type="button"
          @click="statusFilter = 'upcoming'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all text-xs"
          :class="statusFilter === 'upcoming' ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border border-amber-800/50'"
        >
          Upcoming ({{ upcomingCount }})
        </button>
        <button
          v-if="finalCount > 0"
          type="button"
          @click="statusFilter = 'final'"
          class="px-3 py-1.5 rounded-lg font-bold transition-all text-xs"
          :class="statusFilter === 'final' ? 'bg-slate-700 text-white shadow-xs' : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700/70'"
        >
          Final ({{ finalCount }})
        </button>
      </div>

      <!-- Verified Timestamp -->
      <div class="flex items-center gap-2 text-emerald-400 shrink-0 font-semibold text-[11px] bg-slate-950/60 px-3 py-1 rounded-lg border border-emerald-500/20">
        <ShieldCheck class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Verified Feeds: {{ formatManilaTime(lastUpdated) }}</span>
      </div>
    </div>

    <!-- Match Cards Grid with Complete League Event Names (Dark Arena Glassmorphism) -->
    <div v-if="filteredGames.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div 
        v-for="game in filteredGames" 
        :key="game.id" 
        class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/70 hover:border-orange-500/50 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(249,115,22,0.25)] transition-all flex flex-col justify-between relative overflow-hidden group"
      >
        <!-- Card Subtle Glow Streak -->
        <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div>
          <!-- Card League & Event Header -->
          <div class="border-b border-slate-800/80 pb-3 mb-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <img 
                  v-if="game.leagueLogo" 
                  :src="game.leagueLogo" 
                  :alt="game.league" 
                  class="w-6 h-6 object-contain shrink-0 rounded bg-white p-0.5 border border-slate-200 shadow-xs"
                />
                <span class="font-black text-xs uppercase tracking-wider text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]">
                  {{ game.league }}
                </span>
                <span v-if="game.stage" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80 uppercase">
                  {{ game.stage }}
                </span>
              </div>

              <!-- Status Badge -->
              <span 
                class="font-bold px-2.5 py-0.5 rounded-full text-[11px] shrink-0"
                :class="{
                  'bg-red-500/20 text-red-300 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse': game.status === 'live',
                  'bg-slate-800/90 text-slate-300 border border-slate-700/70': game.status === 'final',
                  'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]': game.status === 'upcoming'
                }"
              >
                {{ game.statusDetail }}
              </span>
            </div>

            <!-- Complete League Event / Tournament Title -->
            <div class="mt-1.5 text-xs font-extrabold text-slate-200 group-hover:text-cyan-300 transition-colors truncate" :title="game.eventName || game.leagueFullName">
              {{ game.eventName || (game.leagueFullName ? game.leagueFullName + ' - Official Fixture' : game.league + ' Match') }}
            </div>
          </div>

          <!-- Teams and Scores -->
          <div class="space-y-3 my-3">
            <div class="flex items-center justify-between text-base">
              <div class="flex items-center gap-2.5 font-bold text-white min-w-0 pr-2">
                <img 
                  :src="game.homeTeamLogo || getTeamLogo(game.homeTeam)" 
                  :alt="game.homeTeam"
                  class="w-8 h-8 object-contain shrink-0 rounded-lg bg-white p-1 border border-slate-700/80 shadow-xs" 
                  loading="lazy"
                />
                <span class="truncate transition-colors" :class="{ 'text-white': true, 'font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]': game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore }">
                  {{ game.homeTeam }}
                </span>
                <CheckCircle2 
                  v-if="game.status === 'final' && game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore" 
                  class="w-4 h-4 text-emerald-400 inline shrink-0" 
                />
              </div>
              <span
                v-if="game.status === 'live' && (game.homeScore ?? 0) === 0 && (game.awayScore ?? 0) === 0"
                class="text-[11px] font-bold uppercase tracking-wider text-red-400 shrink-0"
              >
                LIVE NOW
              </span>
              <span 
                v-else
                class="font-mono font-black text-xl shrink-0"
                :class="game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'text-slate-200'"
              >
                {{ game.homeScore !== undefined ? game.homeScore : '—' }}
              </span>
            </div>

            <div class="flex items-center justify-between text-base">
              <div class="flex items-center gap-2.5 font-bold text-white min-w-0 pr-2">
                <img 
                  :src="game.awayTeamLogo || getTeamLogo(game.awayTeam)" 
                  :alt="game.awayTeam"
                  class="w-8 h-8 object-contain shrink-0 rounded-lg bg-white p-1 border border-slate-700/80 shadow-xs" 
                  loading="lazy"
                />
                <span class="truncate transition-colors" :class="{ 'text-white': true, 'font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]': game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore }">
                  {{ game.awayTeam }}
                </span>
                <CheckCircle2 
                  v-if="game.status === 'final' && game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore" 
                  class="w-4 h-4 text-emerald-400 inline shrink-0" 
                />
              </div>
              <span
                v-if="game.status === 'live' && (game.homeScore ?? 0) === 0 && (game.awayScore ?? 0) === 0"
                class="text-[11px] font-bold uppercase tracking-wider text-red-400 shrink-0"
              >
                IN PLAY
              </span>
              <span 
                v-else
                class="font-mono font-black text-xl shrink-0"
                :class="game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'text-slate-200'"
              >
                {{ game.awayScore !== undefined ? game.awayScore : '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Venue, Broadcast & Match Action Buttons -->
        <div class="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 truncate">
              <MapPin class="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span class="truncate" :title="game.venue">{{ game.venue }}</span>
            </div>
            <div class="flex items-center gap-1.5 truncate font-medium text-amber-300">
              <Tv class="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span class="truncate">{{ game.broadcast }}</span>
            </div>
          </div>

          <!-- Action Buttons: Watch [Away] vs [Home] Live, View & Bet Now ↗ -->
          <div class="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/50">
            <a
              :href="`/watch/${game.awayTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${game.homeTeam.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-live/`"
              @click.prevent="openGameViewer(game, 'stream')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs min-w-0 truncate"
              :class="game.status === 'live' 
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400/60'"
            >
              <Tv class="w-3.5 h-3.5 shrink-0" :class="game.status === 'live' ? 'animate-pulse text-amber-300' : 'text-cyan-400'" />
              <span class="truncate">Watch {{ game.awayTeam }} vs {{ game.homeTeam }} Live</span>
            </a>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click.stop="openGameViewer(game, 'stats')"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-xs whitespace-nowrap cursor-pointer"
                title="View Match Scoreboard & Details"
              >
                <span>View</span>
              </button>

              <a
                href="https://tipoff.bybetcasino.ph/c6Yv/"
                target="_blank"
                rel="nofollow sponsored noopener"
                @click.stop
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 transition-all shadow-[0_0_18px_rgba(249,115,22,0.45)] ring-1 ring-orange-400/50 shrink-0 whitespace-nowrap"
                title="Bet on Live Games — Play at Bybet"
              >
                <span>Bet Now ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl p-12 text-center shadow-xl ring-1 ring-slate-800/80">
      <Clock class="w-10 h-10 text-slate-500 mx-auto mb-3" />
      <h3 class="text-base font-bold text-white">No Scheduled Games In This League Filter Today</h3>
      <p class="mt-1 text-xs text-slate-400 max-w-md mx-auto">
        There are currently no verified fixtures matching the selected tournament status. Official TipOffPh scoreboards update before live tip-offs.
      </p>
      <button 
        type="button" 
        @click="selectedLeague = 'all'; statusFilter = 'all'"
        class="mt-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.35)]"
      >
        View All 12 League Events
      </button>
    </div>

    <!-- Teleported Modals to Body so Video Display is 100% Centered in Viewer's Screen Viewport -->
    <Teleport to="body">
      <!-- Live Match Viewer Modal (Centered in Middle of Viewer's Screen) -->
      <div
        v-if="activeViewerGame"
        class="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        @click.self="closeGameViewer"
      >
        <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-white mx-auto my-auto">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
                <Tv class="w-4 h-4" />
              </div>
              <div>
                <h4 class="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Courtside Live Center</span>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    :class="activeViewerGame.status === 'live' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'"
                  >
                    {{ activeViewerGame.statusDetail }}
                  </span>
                </h4>
                <p class="text-[11px] text-slate-400">
                  {{ activeViewerGame.eventName || activeViewerGame.league }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                v-if="activeViewerGame.status === 'live'"
                type="button"
                @click="() => popOutGame(activeViewerGame)"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                title="Minimize into floating window at corner of your screen"
              >
                <PictureInPicture class="w-3.5 h-3.5 text-amber-400" />
                <span class="hidden sm:inline">Mini Corner Player</span>
                <span class="sm:hidden">Mini</span>
              </button>
              <button
                type="button"
                @click="closeGameViewer"
                class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Modal View Tabs: Scoreboard vs Live Stream -->
          <div class="flex items-center border-b border-slate-800 bg-slate-950/90 text-xs font-bold">
            <button
              type="button"
              @click="viewerTab = 'stats'"
              :class="viewerTab === 'stats' ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-900' : 'text-slate-400 hover:text-white'"
              class="flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy class="w-3.5 h-3.5" />
              <span>Scoreboard &amp; Details</span>
            </button>
            <button
              type="button"
              @click="viewerTab = 'stream'"
              :class="viewerTab === 'stream' ? 'text-red-400 border-b-2 border-red-500 bg-slate-900' : 'text-slate-400 hover:text-white'"
              class="flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Tv class="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Live Video Broadcast</span>
            </button>
          </div>

          <!-- Tab 1: Live Video Player with Team Logos -->
          <div v-if="viewerTab === 'stream'" class="aspect-video w-full bg-black relative overflow-hidden">
            <iframe
              :src="`/embed/live?matchId=${activeViewerGame.id}&home=${encodeURIComponent(activeViewerGame.homeTeam)}&away=${encodeURIComponent(activeViewerGame.awayTeam)}&homeLogo=${encodeURIComponent(activeViewerGame.homeTeamLogo || getTeamLogo(activeViewerGame.homeTeam))}&awayLogo=${encodeURIComponent(activeViewerGame.awayTeamLogo || getTeamLogo(activeViewerGame.awayTeam))}&comp=${encodeURIComponent(activeViewerGame.league || activeViewerGame.eventName || '')}&status=${activeViewerGame.status}&homeScore=${activeViewerGame.homeScore || 0}&awayScore=${activeViewerGame.awayScore || 0}`"
              class="w-full h-full border-0"
              title="TipOffPh Live Basketball Transmission"
              referrerpolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen
              loading="eager"
            ></iframe>
          </div>

        <!-- Tab 2: Scoreboard Display -->
        <div v-else>
        <div class="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 border-b border-slate-800">
          <div class="grid grid-cols-7 items-center text-center">
            <!-- Home Team -->
            <div class="col-span-3 flex flex-col items-center">
              <img
                :src="activeViewerGame.homeTeamLogo || getTeamLogo(activeViewerGame.homeTeam)"
                :alt="activeViewerGame.homeTeam"
                class="w-14 h-14 object-contain rounded-xl bg-white p-1.5 border border-slate-700 shadow-md mb-2"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(activeViewerGame.homeTeam)"
              />
              <span class="font-bold text-xs text-white line-clamp-1">{{ activeViewerGame.homeTeam }}</span>
              <span class="font-mono text-2xl font-black text-amber-400 mt-1">
                {{ activeViewerGame.homeScore !== undefined ? activeViewerGame.homeScore : '—' }}
              </span>
            </div>

            <!-- Match Status / Clock -->
            <div class="col-span-1 flex flex-col items-center">
              <span class="text-xs font-black text-slate-500 uppercase tracking-widest">VS</span>
              <span 
                class="text-[10px] font-mono font-bold mt-1.5 px-2 py-0.5 rounded"
                :class="activeViewerGame.status === 'live' ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' : 'bg-slate-800 text-slate-400'"
              >
                {{ activeViewerGame.statusDetail }}
              </span>
            </div>

            <!-- Away Team -->
            <div class="col-span-3 flex flex-col items-center">
              <img
                :src="activeViewerGame.awayTeamLogo || getTeamLogo(activeViewerGame.awayTeam)"
                :alt="activeViewerGame.awayTeam"
                class="w-14 h-14 object-contain rounded-xl bg-white p-1.5 border border-slate-700 shadow-md mb-2"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(activeViewerGame.awayTeam)"
              />
              <span class="font-bold text-xs text-white line-clamp-1">{{ activeViewerGame.awayTeam }}</span>
              <span class="font-mono text-2xl font-black text-amber-400 mt-1">
                {{ activeViewerGame.awayScore !== undefined ? activeViewerGame.awayScore : '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Details & Broadcast Info -->
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span class="text-slate-400 block text-[11px]">Venue:</span>
              <span class="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {{ activeViewerGame.venue }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">Television &amp; Stream:</span>
              <span class="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                <Tv class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {{ activeViewerGame.broadcast }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="() => { const g = activeViewerGame; closeGameViewer(); if (g) openGameBet(g); }"
              class="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Flame class="w-4 h-4 text-red-700" />
              <span>Bet Now on This Match</span>
            </button>

            <NuxtLink
              to="/local-sports"
              class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Tv class="w-3.5 h-3.5 text-red-400" />
              <span>PH Live Sports Hub</span>
            </NuxtLink>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Floating Pop-Out Mini-Player Dock (Always Visible in Viewer's Screen Corner as they scroll) -->
    <div
      v-if="isFloatingGamePopout && activeFloatingGame"
      class="fixed bottom-5 right-5 z-[99999] w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)] bg-slate-950 border-2 border-red-500/90 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 ring-4 ring-black/60"
    >
      <!-- Mini Header -->
      <div class="h-9 bg-slate-900 px-3 flex items-center justify-between border-b border-slate-800 text-xs">
        <div class="flex items-center gap-2 min-w-0 pr-1">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          <img
            :src="activeFloatingGame.homeTeamLogo || getTeamLogo(activeFloatingGame.homeTeam)"
            :alt="activeFloatingGame.homeTeam"
            class="w-4 h-4 object-contain rounded-xs bg-white p-0.5 border border-slate-700 shrink-0"
            @error="($event.target as HTMLImageElement).src = getTeamLogo(activeFloatingGame.homeTeam)"
          />
          <span class="font-extrabold text-[11px] text-white truncate">
            {{ activeFloatingGame.homeTeam }} vs {{ activeFloatingGame.awayTeam }}
          </span>
          <img
            :src="activeFloatingGame.awayTeamLogo || getTeamLogo(activeFloatingGame.awayTeam)"
            :alt="activeFloatingGame.awayTeam"
            class="w-4 h-4 object-contain rounded-xs bg-white p-0.5 border border-slate-700 shrink-0"
            @error="($event.target as HTMLImageElement).src = getTeamLogo(activeFloatingGame.awayTeam)"
          />
          <span class="text-[10px] font-mono text-amber-400 font-bold shrink-0">
            {{ activeFloatingGame.homeScore }} - {{ activeFloatingGame.awayScore }}
          </span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            @click="expandFloatingGame"
            class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Expand to Fullscreen Modal"
          >
            <Maximize2 class="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            @click="closeFloatingGame"
            class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Close Pop-Out Player"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Video Iframe with Team Logos -->
      <div class="aspect-video w-full bg-black relative">
        <iframe
          :src="`/embed/live?matchId=${activeFloatingGame.id}&home=${encodeURIComponent(activeFloatingGame.homeTeam)}&away=${encodeURIComponent(activeFloatingGame.awayTeam)}&homeLogo=${encodeURIComponent(activeFloatingGame.homeTeamLogo || getTeamLogo(activeFloatingGame.homeTeam))}&awayLogo=${encodeURIComponent(activeFloatingGame.awayTeamLogo || getTeamLogo(activeFloatingGame.awayTeam))}&comp=${encodeURIComponent(activeFloatingGame.league || activeFloatingGame.eventName || '')}&status=${activeFloatingGame.status}&homeScore=${activeFloatingGame.homeScore || 0}&awayScore=${activeFloatingGame.awayScore || 0}`"
          class="w-full h-full border-0"
          title="Popped-Out Live Sports Transmission"
          referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      </div>

      <!-- Mini Footer -->
      <div class="bg-slate-900/95 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
        <span class="flex items-center gap-1 text-emerald-400 font-semibold">
          <ShieldCheck class="w-3 h-3" />
          Floating Pop-Out Active
        </span>
        <button
          type="button"
          @click="() => { const g = activeFloatingGame; if (g) openGameBet(g); }"
          class="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <Flame class="w-3 h-3 text-red-500" />
          <span>Bet on Match</span>
        </button>
      </div>
    </div>

    <!-- Bet Now Interactive Modal Dialog -->
    <div
      v-if="activeBetGame"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      @click.self="closeGameBet"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white my-8">
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame class="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 class="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Bet Now &amp; Live Markets</span>
                <span v-if="activeBetGame.status === 'live'" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase animate-pulse">
                  LIVE
                </span>
              </h4>
              <p class="text-[11px] text-slate-400">
                {{ activeBetGame.eventName || activeBetGame.league }}
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="closeGameBet"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Matchup Banner -->
        <div class="p-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 border-b border-slate-800">
          <div class="grid grid-cols-7 items-center text-center">
            <!-- Home Team -->
            <div class="col-span-3 flex flex-col items-center">
              <img
                :src="activeBetGame.homeTeamLogo || getTeamLogo(activeBetGame.homeTeam)"
                :alt="activeBetGame.homeTeam"
                class="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-700 shadow-md mb-1.5"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(activeBetGame.homeTeam)"
              />
              <span class="font-bold text-xs text-white line-clamp-1">{{ activeBetGame.homeTeam }}</span>
              <span v-if="activeBetGame.status === 'live'" class="font-mono text-xl font-black text-amber-400 mt-1">
                {{ activeBetGame.homeScore }}
              </span>
            </div>

            <!-- VS / Clock -->
            <div class="col-span-1 flex flex-col items-center">
              <span class="text-xs font-black text-slate-500 uppercase tracking-widest">VS</span>
              <span 
                class="text-[10px] font-mono font-bold mt-1"
                :class="activeBetGame.status === 'live' ? 'text-red-400 animate-pulse' : 'text-slate-400'"
              >
                {{ activeBetGame.statusDetail }}
              </span>
            </div>

            <!-- Away Team -->
            <div class="col-span-3 flex flex-col items-center">
              <img
                :src="activeBetGame.awayTeamLogo || getTeamLogo(activeBetGame.awayTeam)"
                :alt="activeBetGame.awayTeam"
                class="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-700 shadow-md mb-1.5"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(activeBetGame.awayTeam)"
              />
              <span class="font-bold text-xs text-white line-clamp-1">{{ activeBetGame.awayTeam }}</span>
              <span v-if="activeBetGame.status === 'live'" class="font-mono text-xl font-black text-amber-400 mt-1">
                {{ activeBetGame.awayScore }}
              </span>
            </div>
          </div>
        </div>

        <!-- Betting Markets Selection -->
        <div class="p-4 space-y-4">
          <!-- Market Tabs -->
          <div class="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl text-xs font-bold text-slate-300">
            <button
              type="button"
              @click="selectedBetMarket = 'spread'"
              class="py-1.5 rounded-lg transition-all text-center"
              :class="selectedBetMarket === 'spread' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:text-white'"
            >
              Point Spread
            </button>
            <button
              type="button"
              @click="selectedBetMarket = 'moneyline'"
              class="py-1.5 rounded-lg transition-all text-center"
              :class="selectedBetMarket === 'moneyline' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:text-white'"
            >
              Moneyline
            </button>
            <button
              type="button"
              @click="selectedBetMarket = 'total'"
              class="py-1.5 rounded-lg transition-all text-center"
              :class="selectedBetMarket === 'total' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'hover:text-white'"
            >
              Total Points
            </button>
          </div>

          <!-- Market Selections -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <!-- Market Option A -->
            <button
              type="button"
              @click="selectedBetPick = selectedBetMarket === 'total' ? 'over' : 'home'"
              class="p-3 rounded-xl border text-left transition-all relative overflow-hidden"
              :class="selectedBetPick === (selectedBetMarket === 'total' ? 'over' : 'home')
                ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 text-white'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'"
            >
              <div class="text-[11px] text-slate-400">
                {{ selectedBetMarket === 'total' ? 'Over' : activeBetGame.homeTeam }}
              </div>
              <div class="flex items-center justify-between font-mono font-bold mt-1">
                <span class="text-sm text-white">
                  {{ selectedBetMarket === 'spread' ? '-3.5' : (selectedBetMarket === 'total' ? 'O 188.5' : 'Win') }}
                </span>
                <span class="text-amber-400 text-xs">
                  {{ selectedBetMarket === 'moneyline' ? '1.68' : '1.91' }}
                </span>
              </div>
            </button>

            <!-- Market Option B -->
            <button
              type="button"
              @click="selectedBetPick = selectedBetMarket === 'total' ? 'under' : 'away'"
              class="p-3 rounded-xl border text-left transition-all relative overflow-hidden"
              :class="selectedBetPick === (selectedBetMarket === 'total' ? 'under' : 'away')
                ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 text-white'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-300'"
            >
              <div class="text-[11px] text-slate-400">
                {{ selectedBetMarket === 'total' ? 'Under' : activeBetGame.awayTeam }}
              </div>
              <div class="flex items-center justify-between font-mono font-bold mt-1">
                <span class="text-sm text-white">
                  {{ selectedBetMarket === 'spread' ? '+3.5' : (selectedBetMarket === 'total' ? 'U 188.5' : 'Win') }}
                </span>
                <span class="text-amber-400 text-xs">
                  {{ selectedBetMarket === 'moneyline' ? '2.25' : '1.91' }}
                </span>
              </div>
            </button>
          </div>

          <!-- Wager Amount & Calculator -->
          <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-medium">Select Stake Amount:</span>
              <span class="font-mono text-white font-bold">₱{{ selectedStake.toLocaleString() }}</span>
            </div>

            <!-- Stake Chips -->
            <div class="flex items-center gap-2">
              <button
                v-for="amount in [200, 500, 1000, 2500, 5000]"
                :key="amount"
                type="button"
                @click="selectedStake = amount"
                class="flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all border"
                :class="selectedStake === amount
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'"
              >
                ₱{{ amount >= 1000 ? `${amount / 1000}k` : amount }}
              </button>
            </div>

            <!-- Payout summary -->
            <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">Est. Potential Return:</span>
              <span class="font-mono text-sm font-black text-emerald-400">
                ₱{{ Math.round(selectedStake * (selectedBetMarket === 'moneyline' ? (selectedBetPick === 'home' ? 1.68 : 2.25) : 1.91)).toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Action Buttons inside Bet Now Modal -->
          <div class="space-y-2">
            <button
              type="button"
              @click="placeSimulatedBet"
              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <Flame class="w-4 h-4 text-red-700" />
              <span>{{ betPlacedSuccess ? '✓ Bet Slip Confirmed (Simulated)' : 'Place Bet Slip (Simulated)' }}</span>
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="() => { const g = activeBetGame; closeGameBet(); if (g) openGameViewer(g); }"
                class="flex-1 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Tv class="w-3.5 h-3.5 text-red-400" />
                <span>Switch to View Live</span>
              </button>

              <NuxtLink
                to="/nba-odds"
                class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <TrendingUp class="w-3.5 h-3.5 text-amber-400" />
                <span>Full Odds Board</span>
              </NuxtLink>
            </div>
          </div>

          <p class="text-[10px] text-slate-500 text-center leading-normal">
            For entertainment and editorial tracking. 21+ only. Please play responsibly.
          </p>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

