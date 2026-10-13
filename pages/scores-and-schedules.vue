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
  CalendarDays
} from 'lucide-vue-next';

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

const { data, refresh, pending } = await useAsyncData('scores-board', async () => {
  return await $fetch<{
    source: string;
    lastUpdatedUtc: string;
    displayTimezone: string;
    games: GameScore[];
  }>('/api/scores', {
    query: {
      league: selectedLeague.value
    }
  });
}, {
  watch: [selectedLeague]
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

function handleFilter(leagueId: string) {
  selectedLeague.value = leagueId;
}

useHead({
  title: 'Philippine & Global Basketball Scores & Schedules | TipOffPh',
  meta: [
    { 
      name: 'description', 
      content: 'Official verified game schedules, live scores, venue locations, and television broadcasts for PBA, MPBL, UAAP, NCAA, Gilas Pilipinas, PSL, PBA D-League, VisMin Super Cup, NBL, EASL, NBA, and FIBA on TipOffPh.' 
    },
    { property: 'og:title', content: 'Basketball Scores & Schedules across All 12 Leagues | TipOffPh' },
    { property: 'og:description', content: 'Live courtside match updates, verified broadcast details, and official league tournament events across Philippine hoops.' }
  ]
});
</script>

<template>
  <div class="max-w-5xl mx-auto py-2">
    <!-- Header -->
    <header class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-6 shadow-sm">
      <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#D35400]">
        <Calendar class="w-4 h-4" />
        <span>Courtside Center</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Scores &amp; Schedules
          </h1>
          <p class="mt-1 text-sm text-slate-600 max-w-2xl">
            Official fixtures, broadcast channels, and verified results across all 12 major Philippine leagues, collegiate tournaments, and international basketball competitions.
          </p>
        </div>

        <!-- Refresh button -->
        <button 
          type="button" 
          @click="refresh" 
          :disabled="pending"
          class="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0 shadow-sm"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': pending }" />
          <span>{{ pending ? 'Updating...' : 'Refresh Feeds' }}</span>
        </button>
      </div>

      <!-- Marquee Interactive League Bar for Fast Filter -->
      <div class="mt-6 pt-5 border-t border-slate-100">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Trophy class="w-3.5 h-3.5 text-amber-500" />
          <span>Select League Event From Marquee:</span>
        </div>
        <LeagueFilterBar 
          :model-value="selectedLeague"
          mode="filter"
          class="!my-0"
          @change="handleFilter"
        />
      </div>

      <!-- Complete League Event Buttons Filter Grid -->
      <div class="mt-5 pt-5 border-t border-slate-100">
        <div class="flex items-center justify-between mb-3 text-xs">
          <span class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            All 12 League Events &amp; Tournaments:
          </span>
          <span class="text-[11px] text-slate-500 hidden sm:inline">
            Click any league to view current matches &amp; broadcast channels
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button 
            v-for="lg in LEAGUES_LIST" 
            :key="lg.id"
            type="button"
            @click="handleFilter(lg.id)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
            :class="selectedLeague.toLowerCase() === lg.id.toLowerCase() || (selectedLeague.toLowerCase() === lg.name.toLowerCase())
              ? 'bg-[#E67E22] text-white border-[#D35400] shadow-sm ring-2 ring-amber-500/30' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'"
          >
            <img 
              v-if="lg.logoUrl" 
              :src="lg.logoUrl" 
              :alt="lg.name" 
              class="w-4 h-4 object-contain shrink-0 rounded-sm"
            />
            <span v-else class="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>{{ lg.name }}</span>
            <span 
              class="text-[9px] font-mono px-1 py-0.2 rounded font-black uppercase tracking-wider"
              :class="selectedLeague.toLowerCase() === lg.id.toLowerCase() || (selectedLeague.toLowerCase() === lg.name.toLowerCase())
                ? 'bg-black/20 text-white' 
                : 'bg-slate-200 text-slate-600'"
            >
              {{ lg.tag }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Active League Event Spotlight Banner -->
    <div 
      class="mb-6 p-4 sm:p-5 rounded-xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden"
    >
      <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
        <Trophy class="w-48 h-48 text-white" />
      </div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 p-1.5 flex items-center justify-center shrink-0">
            <img 
              v-if="currentLeagueInfo.logoUrl" 
              :src="currentLeagueInfo.logoUrl" 
              :alt="currentLeagueInfo.name" 
              class="w-full h-full object-contain"
            />
            <Trophy v-else class="w-6 h-6 text-amber-400" />
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

    <!-- Match Status Quick Filters & Verification Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs">
      <!-- Status Pills -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">Status:</span>
        <button
          type="button"
          @click="statusFilter = 'all'"
          class="px-2.5 py-1 rounded font-semibold transition-colors"
          :class="statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
        >
          All ({{ allGames.length }})
        </button>
        <button
          v-if="liveCount > 0"
          type="button"
          @click="statusFilter = 'live'"
          class="px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1"
          :class="statusFilter === 'live' ? 'bg-red-600 text-white' : 'bg-red-50 hover:bg-red-100 text-red-700'"
        >
          <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>Live Now ({{ liveCount }})</span>
        </button>
        <button
          v-if="upcomingCount > 0"
          type="button"
          @click="statusFilter = 'upcoming'"
          class="px-2.5 py-1 rounded font-semibold transition-colors"
          :class="statusFilter === 'upcoming' ? 'bg-amber-600 text-white' : 'bg-amber-50 hover:bg-amber-100 text-amber-800'"
        >
          Upcoming ({{ upcomingCount }})
        </button>
        <button
          v-if="finalCount > 0"
          type="button"
          @click="statusFilter = 'final'"
          class="px-2.5 py-1 rounded font-semibold transition-colors"
          :class="statusFilter === 'final' ? 'bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
        >
          Final ({{ finalCount }})
        </button>
      </div>

      <!-- Verified Timestamp -->
      <div class="flex items-center gap-2 text-emerald-800 shrink-0 font-medium text-[11px]">
        <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Verified Feeds: {{ formatManilaTime(lastUpdated) }}</span>
      </div>
    </div>

    <!-- Match Cards Grid with Complete League Event Names -->
    <div v-if="filteredGames.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div 
        v-for="game in filteredGames" 
        :key="game.id" 
        class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div>
          <!-- Card League & Event Header -->
          <div class="border-b border-slate-100 pb-3 mb-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <img 
                  v-if="game.leagueLogo" 
                  :src="game.leagueLogo" 
                  :alt="game.league" 
                  class="w-6 h-6 object-contain shrink-0 rounded"
                />
                <span class="font-black text-xs uppercase tracking-wider text-[#D35400]">
                  {{ game.league }}
                </span>
                <span v-if="game.stage" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  {{ game.stage }}
                </span>
              </div>

              <!-- Status Badge -->
              <span 
                class="font-bold px-2 py-0.5 rounded text-[11px] shrink-0"
                :class="{
                  'bg-red-100 text-red-800 ring-1 ring-red-400 animate-pulse': game.status === 'live',
                  'bg-slate-100 text-slate-700': game.status === 'final',
                  'bg-amber-100 text-amber-800': game.status === 'upcoming'
                }"
              >
                {{ game.statusDetail }}
              </span>
            </div>

            <!-- Complete League Event / Tournament Title -->
            <div class="mt-1.5 text-xs font-extrabold text-slate-800 truncate" :title="game.eventName || game.leagueFullName">
              {{ game.eventName || (game.leagueFullName ? game.leagueFullName + ' - Official Fixture' : game.league + ' Match') }}
            </div>
          </div>

          <!-- Teams and Scores -->
          <div class="space-y-3 my-3">
            <div class="flex items-center justify-between text-base">
              <div class="flex items-center gap-2 font-bold text-slate-900">
                <span :class="{ 'text-slate-900': true, 'font-black text-[#D35400]': game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore }">
                  {{ game.homeTeam }}
                </span>
                <CheckCircle2 
                  v-if="game.status === 'final' && game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore" 
                  class="w-4 h-4 text-emerald-600 inline" 
                />
              </div>
              <span 
                class="font-mono font-black text-lg"
                :class="game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore ? 'text-[#D35400]' : 'text-slate-900'"
              >
                {{ game.homeScore !== undefined ? game.homeScore : '—' }}
              </span>
            </div>

            <div class="flex items-center justify-between text-base">
              <div class="flex items-center gap-2 font-bold text-slate-900">
                <span :class="{ 'text-slate-900': true, 'font-black text-[#D35400]': game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore }">
                  {{ game.awayTeam }}
                </span>
                <CheckCircle2 
                  v-if="game.status === 'final' && game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore" 
                  class="w-4 h-4 text-emerald-600 inline" 
                />
              </div>
              <span 
                class="font-mono font-black text-lg"
                :class="game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore ? 'text-[#D35400]' : 'text-slate-900'"
              >
                {{ game.awayScore !== undefined ? game.awayScore : '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Venue & Broadcast Info -->
        <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div class="flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="truncate" :title="game.venue">{{ game.venue }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 truncate">
              <Tv class="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span class="truncate font-medium text-slate-600">{{ game.broadcast }}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono shrink-0">
              {{ game.sourceName }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
      <Clock class="w-10 h-10 text-slate-400 mx-auto mb-3" />
      <h3 class="text-base font-bold text-slate-800">No Scheduled Games In This League Filter Today</h3>
      <p class="mt-1 text-xs text-slate-500 max-w-md mx-auto">
        There are currently no verified fixtures matching the selected tournament status. Official TipOffPh scoreboards update before live tip-offs.
      </p>
      <button 
        type="button" 
        @click="selectedLeague = 'all'; statusFilter = 'all'"
        class="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
      >
        View All 12 League Events
      </button>
    </div>
  </div>
</template>

