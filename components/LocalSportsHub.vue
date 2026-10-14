<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PhSportsMatch, PhSportsSignal, PhSportsResponse } from '~/shared/ph-sports-types';
import { getTeamLogo } from '~/shared/team-logos';
import { 
  Tv, 
  Radio, 
  Flame, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  PlayCircle,
  ShieldCheck,
  SlidersHorizontal,
  PictureInPicture,
  Maximize2,
  Minimize2,
  X
} from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  initialLeague?: string;
  compact?: boolean;
  maxItems?: number;
}>(), {
  initialLeague: 'all',
  compact: false,
  maxItems: 50
});

const activeTab = ref<'matches' | 'streams' | 'signals'>('matches');
const selectedLeague = ref<string>(props.initialLeague);
const searchQuery = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const lastUpdated = ref<string>('');

const responseData = ref<PhSportsResponse | null>(null);

// Stream modal state
const activeStreamMatch = ref<PhSportsMatch | null>(null);

// Bet modal state
const activeBetMatch = ref<PhSportsMatch | null>(null);
const selectedBetMarket = ref<'spread' | 'moneyline' | 'total'>('spread');
const selectedBetPick = ref<'home' | 'away' | 'over' | 'under'>('home');
const selectedStake = ref<number>(500);
const betPlacedSuccess = ref(false);

function openBet(match?: PhSportsMatch | null) {
  if (!match) return;
  activeBetMatch.value = match;
  betPlacedSuccess.value = false;
  selectedBetMarket.value = 'spread';
  selectedBetPick.value = 'home';
}

function closeBet() {
  activeBetMatch.value = null;
  betPlacedSuccess.value = false;
}

function placeSimulatedBet() {
  betPlacedSuccess.value = true;
}

async function loadData(force = false) {
  loading.value = true;
  error.value = null;
  try {
    const res = await $fetch<PhSportsResponse & { success: boolean }>(`/api/ph-sports${force ? '?refresh=true' : ''}`);
    if (res && res.allMatches) {
      responseData.value = res;
      lastUpdated.value = new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(new Date());
    }
  } catch (err: any) {
    console.error('Failed to load local PH sports data:', err);
    error.value = err.message || 'Unable to connect to live sports feed';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'TIPOFFPH_POPOUT_STREAM') {
        popOutStream(activeStreamMatch.value || featuredLiveMatch.value);
      }
    });
  }
});

// Leagues tab options including Live and NBA
const leagueFilters = [
  { id: 'all', label: 'All Leagues' },
  { id: 'live', label: '🔴 LIVE IN PLAY' },
  { id: 'nba', label: '🏀 NBA Live' },
  { id: 'pba', label: '🇵🇭 PBA Governors\' Cup' },
  { id: 'mpbl', label: '🇵🇭 MPBL' },
  { id: 'collegiate', label: '🇵🇭 UAAP & NCAA' }
];

// Filtered matches
const filteredMatches = computed(() => {
  if (!responseData.value) return [];
  let list = responseData.value.allMatches || [];

  if (selectedLeague.value !== 'all') {
    const target = selectedLeague.value.toLowerCase();
    if (target === 'live') {
      list = list.filter(m => m.status === 'live');
    } else if (target === 'nba') {
      list = list.filter(m => m.sport === 'nba' || m.leagueId === 'nba' || /nba/i.test(m.competition || m.streamLabel || ''));
    } else if (target === 'pba') {
      list = list.filter(m => /pba/i.test(m.competition || m.streamLabel || ''));
    } else if (target === 'mpbl') {
      list = list.filter(m => /mpbl/i.test(m.competition || m.streamLabel || ''));
    } else if (target === 'collegiate') {
      list = list.filter(m => /uaap|ncaa/i.test(m.competition || m.streamLabel || ''));
    }
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(m => 
      (m.home?.name || '').toLowerCase().includes(q) ||
      (m.away?.name || '').toLowerCase().includes(q) ||
      (m.competition || '').toLowerCase().includes(q) ||
      (m.streamLabel || '').toLowerCase().includes(q)
    );
  }

  if (props.maxItems) {
    return list.slice(0, props.maxItems);
  }
  return list;
});

// Live games
const liveGames = computed(() => {
  return (responseData.value?.allMatches || []).filter(m => m.status === 'live');
});

// Featured active live match shown in top media player showcase
const customFeaturedMatch = ref<PhSportsMatch | null>(null);
const featuredLiveMatch = computed<PhSportsMatch | null>(() => {
  if (customFeaturedMatch.value) return customFeaturedMatch.value;
  const all = responseData.value?.allMatches || [];
  // Prioritize live NBA or PBA game, then any live match
  const liveNba = all.find(m => (m.sport === 'nba' || m.leagueId === 'nba') && m.status === 'live');
  if (liveNba) return liveNba;
  const livePba = all.find(m => /pba/i.test(m.competition || '') && m.status === 'live');
  if (livePba) return livePba;
  const anyLive = all.find(m => m.status === 'live');
  if (anyLive) return anyLive;
  return all.find(m => m.hasStream || (m.sources && m.sources.length)) || all[0] || null;
});

function selectFeaturedMatch(match: PhSportsMatch) {
  customFeaturedMatch.value = match;
}

// Streams
const streamMatches = computed(() => {
  const direct = responseData.value?.livestreams || [];
  const matchesWithStreams = (responseData.value?.allMatches || []).filter(m => m.hasStream || (m.sources && m.sources.length));
  
  // Combine unique by id
  const map = new Map<string, PhSportsMatch>();
  matchesWithStreams.forEach(m => map.set(m.id, m));
  direct.forEach(m => {
    if (!map.has(m.id)) map.set(m.id, m);
  });
  return Array.from(map.values());
});

// Signals
const filteredSignals = computed(() => {
  if (!responseData.value?.signals) return [];
  const sigs = responseData.value.signals;
  if (!searchQuery.value.trim()) return sigs.slice(0, 30);

  const q = searchQuery.value.toLowerCase().trim();
  return sigs.filter(s => 
    s.pickLabel.toLowerCase().includes(q) ||
    s.rationale.toLowerCase().includes(q) ||
    (s.matchSummary?.homeTeam || '').toLowerCase().includes(q) ||
    (s.matchSummary?.awayTeam || '').toLowerCase().includes(q)
  ).slice(0, 30);
});

// Pop-out floating player state
const isFloatingPopout = ref(false);
const activeFloatingMatch = ref<PhSportsMatch | null>(null);

function openStream(match?: PhSportsMatch | null) {
  if (!match) return;
  activeStreamMatch.value = match;
  activeFloatingMatch.value = match;
  isFloatingPopout.value = false;
}

function closeStream() {
  activeStreamMatch.value = null;
}

function popOutStream(match?: PhSportsMatch | null) {
  const m = match || activeStreamMatch.value || featuredLiveMatch.value || (streamMatches.value.length ? streamMatches.value[0] : null) || (liveGames.value.length ? liveGames.value[0] : null) || (filteredMatches.value.length ? filteredMatches.value[0] : null);
  if (!m) return;
  activeFloatingMatch.value = m;
  isFloatingPopout.value = true;
  activeStreamMatch.value = null;
}

function expandFloatingStream() {
  if (activeFloatingMatch.value) {
    activeStreamMatch.value = activeFloatingMatch.value;
    isFloatingPopout.value = false;
  }
}

function closeFloatingStream() {
  isFloatingPopout.value = false;
}
</script>

<template>
  <div class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl rounded-2xl border border-slate-700/80 shadow-[0_4px_35px_rgba(0,0,0,0.7)] overflow-hidden text-slate-100 ring-1 ring-cyan-500/20">
    <!-- Header banner -->
    <div class="bg-gradient-to-r from-red-950/80 via-slate-900/90 to-slate-950 text-white p-4 sm:p-5 border-b border-red-500/30 relative overflow-hidden">
      <!-- Glow flares inside card -->
      <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-[60px] pointer-events-none" />
      <div class="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-red-600/10 blur-[60px] pointer-events-none" />

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-600/30 border border-red-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <Tv class="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-sm">
                Philippine Basketball &amp; Local Sports Hub
              </h2>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                Official Live Feed
              </span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5">
              Official PBA Governors' Cup, MPBL, UAAP, NCAA Matches, Live Streams &amp; Signals
            </p>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="() => popOutStream()"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 border border-red-400/50 rounded-xl text-xs font-black text-white transition-all shadow-[0_0_18px_rgba(239,68,68,0.5)] cursor-pointer animate-pulse hover:animate-none"
            title="Pop out live courtside media player onto your screen"
          >
            <Tv class="w-3.5 h-3.5 text-white" />
            <span>Pop Out Live Player</span>
          </button>
          <span v-if="lastUpdated" class="text-[11px] text-slate-400 hidden lg:inline">
            Updated {{ lastUpdated }} PHT
          </span>
          <button
            type="button"
            @click="() => loadData(true)"
            :disabled="loading"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all disabled:opacity-50"
            title="Refresh local sports data"
          >
            <RefreshCw class="w-3.5 h-3.5 text-amber-300" :class="{ 'animate-spin': loading }" />
            <span>{{ loading ? '...' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Counter -->
      <div v-if="responseData" class="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <span class="text-slate-400 text-[11px]">Live Matches</span>
          <span class="font-bold text-amber-300 flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]"></span>
            {{ responseData.counts.activeLive }} Active
          </span>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <span class="text-slate-400 text-[11px]">PBA Governors'</span>
          <span class="font-bold text-white">{{ responseData.counts.pba }} Matches</span>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <span class="text-slate-400 text-[11px]">MPBL Fixtures</span>
          <span class="font-bold text-white">{{ responseData.counts.mpbl }} Fixtures</span>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <span class="text-slate-400 text-[11px]">Collegiate (UAAP/NCAA)</span>
          <span class="font-bold text-white">{{ responseData.counts.collegiate }} Games</span>
        </div>
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between col-span-2 sm:col-span-1">
          <span class="text-slate-400 text-[11px]">NBA Live &amp; Odds</span>
          <span class="font-bold text-amber-400">{{ responseData.counts.nba || 0 }} Games</span>
        </div>
      </div>
    </div>

    <!-- Featured Live Media Player Showcase (Immediately Visible on Viewer Screen - No Scrolling Down Required) -->
    <div v-if="featuredLiveMatch" class="p-3 sm:p-5 border-b border-slate-800 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/90">
      <div class="bg-gradient-to-br from-[#120a1c] via-[#0f1124] to-[#0a0f1d] border border-red-500/40 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] ring-1 ring-red-400/20">
        <!-- Top Control Bar with Quick Game Switcher -->
        <div class="p-3 sm:p-3.5 bg-slate-950 border-b border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse shrink-0">
              <span class="w-2 h-2 rounded-full bg-white"></span>
              LIVE ON AIR
            </span>
            <div class="flex items-center gap-2 truncate">
              <img
                :src="featuredLiveMatch.home.logo || getTeamLogo(featuredLiveMatch.home.name)"
                :alt="featuredLiveMatch.home.name"
                class="w-5 h-5 object-contain rounded-xs bg-white p-0.5 border border-slate-700 shrink-0"
              />
              <span class="font-bold text-xs sm:text-sm text-white truncate">
                {{ featuredLiveMatch.home.name }} vs {{ featuredLiveMatch.away.name }}
              </span>
              <img
                :src="featuredLiveMatch.away.logo || getTeamLogo(featuredLiveMatch.away.name)"
                :alt="featuredLiveMatch.away.name"
                class="w-5 h-5 object-contain rounded-xs bg-white p-0.5 border border-slate-700 shrink-0"
              />
              <span class="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                {{ featuredLiveMatch.homeScore }} - {{ featuredLiveMatch.awayScore }}
              </span>
            </div>
          </div>

          <!-- Quick Actions: Pop Out to Corner & Match Switcher -->
          <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              type="button"
              @click="() => popOutStream(featuredLiveMatch)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
              title="Pop out into floating window that stays on your screen as you scroll"
            >
              <PictureInPicture class="w-3.5 h-3.5" />
              <span>Pop Out onto Screen</span>
            </button>
            <button
              type="button"
              @click="openStream(featuredLiveMatch)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              title="Open full cinema modal"
            >
              <Maximize2 class="w-3.5 h-3.5 text-amber-400" />
              <span class="hidden sm:inline">Cinema Mode</span>
            </button>
          </div>
        </div>

        <!-- Live Sandboxed iFrame Player with Anti-Ban Protection -->
        <div class="aspect-video w-full bg-black relative overflow-hidden group">
          <iframe
            :src="`/embed/live?matchId=${featuredLiveMatch.id}&home=${encodeURIComponent(featuredLiveMatch.home.name)}&away=${encodeURIComponent(featuredLiveMatch.away.name)}&homeLogo=${encodeURIComponent(featuredLiveMatch.home.logo || getTeamLogo(featuredLiveMatch.home.name))}&awayLogo=${encodeURIComponent(featuredLiveMatch.away.logo || getTeamLogo(featuredLiveMatch.away.name))}&comp=${encodeURIComponent(featuredLiveMatch.competition || featuredLiveMatch.streamLabel || '')}&status=${featuredLiveMatch.status}&homeScore=${featuredLiveMatch.homeScore || 0}&awayScore=${featuredLiveMatch.awayScore || 0}`"
            class="w-full h-full border-0"
            title="TipOffPh Featured Live Sports Transmission"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowfullscreen
            loading="eager"
          ></iframe>
        </div>

        <!-- Quick Switcher Bar: Switch Between Active Live Games (NBA Live, PBA Live, MPBL Live) -->
        <div class="p-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-2 text-xs overflow-x-auto">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Tv class="w-3.5 h-3.5 text-red-500" />
              Switch Live Feed:
            </span>
            <button
              v-for="gm in liveGames.slice(0, 5)"
              :key="gm.id"
              type="button"
              @click="selectFeaturedMatch(gm)"
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer',
                featuredLiveMatch.id === gm.id
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] ring-1 ring-red-400'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
              <span>{{ gm.home.shortName || gm.home.name }} vs {{ gm.away.shortName || gm.away.name }}</span>
              <span v-if="gm.sport === 'nba'" class="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono font-bold">NBA LIVE</span>
            </button>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span class="text-emerald-400 text-[10px] hidden sm:flex items-center gap-1 font-semibold">
              <ShieldCheck class="w-3 h-3" />
              Anti-Ban Shield Active
            </span>
            <button
              type="button"
              @click="() => openBet(featuredLiveMatch)"
              class="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shadow-md cursor-pointer"
            >
              <Flame class="w-3 h-3 text-red-900" />
              <span>Bet Match</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation & Filter Bar -->
    <div class="bg-slate-950/60 border-b border-slate-800/80 p-3 sm:p-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Main Mode Tabs -->
        <div class="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs font-medium text-slate-400 self-start">
          <button
            type="button"
            @click="activeTab = 'matches'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold',
              activeTab === 'matches' 
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
                : 'hover:text-white'
            ]"
          >
            <Tv class="w-3.5 h-3.5" :class="activeTab === 'matches' ? 'text-white' : 'text-orange-400'" />
            <span>Scores &amp; Fixtures</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-slate-200 font-mono">
              {{ filteredMatches.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'streams'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold',
              activeTab === 'streams' 
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]' 
                : 'hover:text-white'
            ]"
          >
            <Radio class="w-3.5 h-3.5" :class="activeTab === 'streams' ? 'text-white' : 'text-red-400'" />
            <span>Live Streams</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-red-300 font-mono font-bold">
              {{ streamMatches.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'signals'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold',
              activeTab === 'signals' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                : 'hover:text-white'
            ]"
          >
            <TrendingUp class="w-3.5 h-3.5" :class="activeTab === 'signals' ? 'text-white' : 'text-emerald-400'" />
            <span>Game Signals &amp; Picks</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-emerald-300 font-mono">
              {{ responseData?.counts?.signals || 0 }}
            </span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-64">
          <Search class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search teams or leagues..."
            class="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- League Filter Pills (When on matches tab) -->
      <div v-if="activeTab === 'matches'" class="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
        <span class="text-slate-400 text-[11px] font-bold mr-1 flex items-center gap-1">
          <SlidersHorizontal class="w-3 h-3 text-cyan-400" />
          League:
        </span>
        <button
          v-for="l in leagueFilters"
          :key="l.id"
          type="button"
          @click="selectedLeague = l.id"
          :class="[
            'px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all',
            selectedLeague === l.id
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)] ring-1 ring-orange-400/50'
              : 'bg-slate-900/90 text-slate-300 border border-slate-700/70 hover:border-cyan-400/50 hover:text-white'
          ]"
        >
          {{ l.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !responseData" class="p-12 text-center text-slate-400">
      <RefreshCw class="w-8 h-8 animate-spin mx-auto text-red-600 mb-3" />
      <p class="text-sm font-medium">Connecting to Philippine Sports Live Center...</p>
      <p class="text-xs text-slate-400 mt-1">Retrieving PBA, MPBL, and Collegiate live scores</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center bg-red-50 text-red-700">
      <ShieldAlert class="w-8 h-8 mx-auto text-red-500 mb-2" />
      <p class="text-sm font-semibold">Unable to fetch Philippine sports data</p>
      <p class="text-xs text-red-500 mt-1">{{ error }}</p>
      <button
        type="button"
        @click="() => loadData(true)"
        class="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
      >
        Try Again
      </button>
    </div>

    <!-- Content: Matches Tab -->
    <div v-else-if="activeTab === 'matches'" class="p-4 sm:p-5">
      <!-- Active Live Games Hero Banner if any -->
      <div v-if="liveGames.length > 0 && selectedLeague === 'all'" class="mb-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
          </span>
          <h3 class="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            <Radio class="w-3.5 h-3.5" />
            Live In Play Now
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="liveMatch in liveGames.slice(0, 4)"
            :key="liveMatch.id"
            class="bg-gradient-to-br from-[#18090d]/90 via-[#1b0d18]/85 to-[#120a1c]/90 border border-red-500/40 hover:border-red-400/70 rounded-2xl p-4 shadow-[0_4px_25px_rgba(239,68,68,0.2)] relative overflow-hidden transition-all group"
          >
            <!-- League badge -->
            <div class="flex items-center justify-between text-xs mb-3">
              <span class="font-black text-slate-200 bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-700/80 text-[11px] uppercase tracking-wider">
                {{ liveMatch.competition || liveMatch.streamLabel }}
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse">
                LIVE {{ liveMatch.clock ? `· ${liveMatch.clock}` : '' }}
              </span>
            </div>

            <!-- Teams & Scores -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 min-w-0 pr-2">
                  <img
                    :src="liveMatch.home.logo || getTeamLogo(liveMatch.home.name)"
                    :alt="liveMatch.home.name"
                    class="w-8 h-8 object-contain rounded-lg bg-white p-1 border border-slate-600 shadow-xs shrink-0"
                    loading="lazy"
                  />
                  <span class="font-bold text-sm text-white group-hover:text-amber-200 transition-colors truncate">{{ liveMatch.home.name }}</span>
                </div>
                <span class="text-xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] font-mono shrink-0">{{ liveMatch.homeScore }}</span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 min-w-0 pr-2">
                  <img
                    :src="liveMatch.away.logo || getTeamLogo(liveMatch.away.name)"
                    :alt="liveMatch.away.name"
                    class="w-8 h-8 object-contain rounded-lg bg-white p-1 border border-slate-600 shadow-xs shrink-0"
                    loading="lazy"
                  />
                  <span class="font-bold text-sm text-white group-hover:text-amber-200 transition-colors truncate">{{ liveMatch.away.name }}</span>
                </div>
                <span class="text-xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] font-mono shrink-0">{{ liveMatch.awayScore }}</span>
              </div>
            </div>

            <!-- Action CTA: View Live & Bet Now -->
            <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] gap-2">
              <span class="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                <Clock class="w-3 h-3 text-slate-500" />
                {{ liveMatch.manilaTimeFormatted }}
              </span>
              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  @click="openStream(liveMatch)"
                  class="inline-flex items-center gap-1 font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 px-3 py-1 rounded-lg text-xs shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all"
                  title="View live match transmission & scoreboard"
                >
                  <Tv class="w-3.5 h-3.5 animate-pulse text-amber-300" />
                  <span>View Live</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5"></span>
                </button>
                <button
                  type="button"
                  @click="openBet(liveMatch)"
                  class="inline-flex items-center gap-1 font-extrabold text-slate-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 px-3 py-1 rounded-lg text-xs shadow-[0_0_15px_rgba(249,115,22,0.45)] ring-1 ring-orange-400/50 transition-all"
                  title="View live point spreads, moneyline & place bet"
                >
                  <Flame class="w-3.5 h-3.5 text-red-900" />
                  <span>Bet Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Match Cards Grid -->
      <div v-if="filteredMatches.length === 0" class="p-12 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
        <Clock class="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p class="text-sm font-semibold text-slate-300">No matches found for the selected filter.</p>
        <p class="text-xs text-slate-500 mt-1">Try switching league tabs or clearing your search query.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="m in filteredMatches"
          :key="m.id"
          class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 border border-slate-700/70 hover:border-orange-500/50 rounded-2xl p-4.5 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] flex flex-col justify-between group relative overflow-hidden"
        >
          <!-- Top subtle glow streak -->
          <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div>
            <!-- Header row: Competition & Status -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[11px] font-black text-orange-400 truncate max-w-[65%] uppercase tracking-wider drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]" :title="m.competition || m.streamLabel">
                {{ m.competition || m.streamLabel }}
              </span>

              <span
                v-if="m.status === 'live'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/60 uppercase shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse"
              >
                LIVE {{ m.clock ? `· ${m.clock}` : '' }}
              </span>
              <span
                v-else-if="m.status === 'finished'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800/90 text-slate-300 border border-slate-700/70 uppercase"
              >
                Final
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
              >
                Scheduled
              </span>
            </div>

            <!-- Home team -->
            <div class="flex items-center justify-between py-1.5">
              <div class="flex items-center gap-2.5 min-w-0 pr-2">
                <img
                  :src="m.home.logo || getTeamLogo(m.home.name)"
                  :alt="m.home.name"
                  class="w-7 h-7 object-contain shrink-0 rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs"
                  loading="lazy"
                  @error="($event.target as HTMLImageElement).src = getTeamLogo(m.home.name)"
                />
                <span class="text-xs font-bold text-white group-hover:text-slate-100 truncate transition-colors">
                  {{ m.home.name }}
                </span>
              </div>
              <span class="text-base font-mono font-black text-slate-100 ml-2 shrink-0" :class="{ 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]': m.homeScore && m.awayScore && m.homeScore > m.awayScore }">
                {{ m.status === 'scheduled' ? '-' : m.homeScore }}
              </span>
            </div>

            <!-- Away team -->
            <div class="flex items-center justify-between py-1.5">
              <div class="flex items-center gap-2.5 min-w-0 pr-2">
                <img
                  :src="m.away.logo || getTeamLogo(m.away.name)"
                  :alt="m.away.name"
                  class="w-7 h-7 object-contain shrink-0 rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs"
                  loading="lazy"
                  @error="($event.target as HTMLImageElement).src = getTeamLogo(m.away.name)"
                />
                <span class="text-xs font-bold text-white group-hover:text-slate-100 truncate transition-colors">
                  {{ m.away.name }}
                </span>
              </div>
              <span class="text-base font-mono font-black text-slate-100 ml-2 shrink-0" :class="{ 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]': m.homeScore && m.awayScore && m.awayScore > m.homeScore }">
                {{ m.status === 'scheduled' ? '-' : m.awayScore }}
              </span>
            </div>

            <!-- Attached Signals / Picks badge if any -->
            <div 
              v-if="m.signals && m.signals.length > 0 && m.signals[0]"
              class="mt-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300"
            >
              <div class="flex items-center justify-between font-bold">
                <span class="flex items-center gap-1 text-emerald-300">
                  <TrendingUp class="w-3 h-3 text-emerald-400" />
                  Signal: {{ m.signals[0]?.pickLabel }}
                </span>
                <span class="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-mono">
                  {{ m.signals[0]?.confidence }}% Conf
                </span>
              </div>
            </div>
          </div>

          <!-- Footer: Time & Action buttons (View Live and Bet Now) -->
          <div class="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
            <span class="flex items-center gap-1 truncate text-slate-400 text-[11px]" :title="m.manilaTimeFormatted">
              <Clock class="w-3 h-3 text-slate-500 shrink-0" />
              {{ m.manilaTimeFormatted }}
            </span>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="openStream(m)"
                class="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-xs transition-all shadow-xs"
                :class="m.status === 'live' 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400/50'"
                :title="m.status === 'live' ? 'Watch live transmission' : 'View match broadcast details'"
              >
                <Tv class="w-3 h-3" :class="m.status === 'live' ? 'animate-pulse text-amber-300' : 'text-cyan-400'" />
                <span>{{ m.status === 'live' ? 'View Live' : (m.hasStream ? 'View Stream' : 'View Match') }}</span>
              </button>

              <button
                type="button"
                @click="openBet(m)"
                class="inline-flex items-center gap-1 font-black px-2.5 py-1 rounded-lg text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.4)] ring-1 ring-orange-400/50 transition-all"
                title="View point spread & bet now"
              >
                <Flame class="w-3 h-3 text-red-900" />
                <span>Bet Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content: Live Streams Tab -->
    <div v-else-if="activeTab === 'streams'" class="p-4 sm:p-5">
      <div class="mb-4">
        <h3 class="text-sm font-black text-white flex items-center gap-1.5">
          <Radio class="w-4 h-4 text-red-500 animate-pulse" />
          Active Live Video Streams &amp; Transmissions
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          Direct digital video broadcasts and verified court match feeds
        </p>
      </div>

      <div v-if="streamMatches.length === 0" class="p-12 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
        <Radio class="w-8 h-8 mx-auto text-slate-500 mb-2" />
        <p class="text-sm font-semibold text-slate-300">No live video transmissions currently broadcasting.</p>
        <p class="text-xs text-slate-500 mt-1">Check back during scheduled match tip-off times.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="s in streamMatches"
          :key="s.id"
          class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 text-white rounded-2xl p-4.5 border border-slate-700/80 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between text-xs mb-3">
              <span class="text-orange-400 font-bold uppercase tracking-wider truncate max-w-[70%]">
                {{ s.competition || s.streamLabel }}
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse">
                STREAM LIVE
              </span>
            </div>

            <div class="space-y-2 py-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <img
                    :src="s.home.logo || getTeamLogo(s.home.name)"
                    :alt="s.home.name"
                    class="w-7 h-7 object-contain shrink-0 rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).src = getTeamLogo(s.home.name)"
                  />
                  <span class="font-bold text-sm text-slate-100 truncate">{{ s.home.name }}</span>
                </div>
                <span class="font-bold text-orange-400 font-mono text-lg shrink-0">{{ s.homeScore }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <img
                    :src="s.away.logo || getTeamLogo(s.away.name)"
                    :alt="s.away.name"
                    class="w-7 h-7 object-contain shrink-0 rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).src = getTeamLogo(s.away.name)"
                  />
                  <span class="font-bold text-sm text-slate-100 truncate">{{ s.away.name }}</span>
                </div>
                <span class="font-bold text-orange-400 font-mono text-lg shrink-0">{{ s.awayScore }}</span>
              </div>
            </div>

            <!-- Sources list if any -->
            <div v-if="s.sources && s.sources.length" class="mt-2 space-y-1">
              <div
                v-for="src in s.sources"
                :key="src.id"
                class="text-[10px] text-slate-300 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 flex items-center justify-between font-mono"
              >
                <span>{{ src.label || src.type }}</span>
                <span class="text-emerald-400 font-bold">Active</span>
              </div>
            </div>
          </div>

          <!-- Action buttons: View Live & Bet Now -->
          <div class="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="openStream(s)"
              class="w-full py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            >
              <PlayCircle class="w-3.5 h-3.5" />
              <span>View Live</span>
            </button>
            <button
              type="button"
              @click="openBet(s)"
              class="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] ring-1 ring-orange-400/50"
            >
              <Flame class="w-3.5 h-3.5 text-red-900" />
              <span>Bet Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content: Signals Tab -->
    <div v-else-if="activeTab === 'signals'" class="p-4 sm:p-5">
      <div class="mb-4">
        <h3 class="text-sm font-black text-white flex items-center gap-1.5">
          <TrendingUp class="w-4 h-4 text-emerald-400" />
          Predictive Game Signals &amp; Match Intelligence
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          Algorithmic match analytics, pick probabilities, and confidence percentages
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="sig in filteredSignals"
          :key="sig.id"
          class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 border border-slate-700/80 rounded-2xl p-4 shadow-md text-slate-200"
        >
          <!-- Match Header -->
          <div v-if="sig.matchSummary" class="text-xs font-bold text-white mb-2 pb-2 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-1.5 min-w-0 pr-2">
              <img
                :src="sig.matchSummary.homeTeamLogo || getTeamLogo(sig.matchSummary.homeTeam)"
                :alt="sig.matchSummary.homeTeam"
                class="w-4 h-4 object-contain shrink-0 rounded-xs bg-white p-0.5 border border-slate-200"
                loading="lazy"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(sig.matchSummary?.homeTeam || '')"
              />
              <span class="truncate">{{ sig.matchSummary.homeTeam }}</span>
              <span class="text-slate-500 font-normal shrink-0">vs</span>
              <img
                :src="sig.matchSummary.awayTeamLogo || getTeamLogo(sig.matchSummary.awayTeam)"
                :alt="sig.matchSummary.awayTeam"
                class="w-4 h-4 object-contain shrink-0 rounded-xs bg-white p-0.5 border border-slate-200"
                loading="lazy"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(sig.matchSummary?.awayTeam || '')"
              />
              <span class="truncate">{{ sig.matchSummary.awayTeam }}</span>
            </div>
            <span class="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded shrink-0">
              {{ sig.matchSummary.score }}
            </span>
          </div>

          <!-- Pick details -->
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Market: {{ sig.market }}
              </span>
              <span class="text-sm font-black text-amber-300">
                {{ sig.pickLabel }}
              </span>
            </div>

            <div class="text-right">
              <span 
                class="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full"
                :class="sig.confidence >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'"
              >
                {{ sig.confidence }}% Conf
              </span>
            </div>
          </div>

          <!-- Analysis rationale text -->
          <p class="text-xs text-slate-300 leading-relaxed mb-3">
            {{ sig.rationale }}
          </p>

          <!-- Footer: Source and Signal Strength -->
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>TipOffPh Match Intelligence</span>
            <span class="capitalize font-mono text-cyan-400 font-bold">{{ sig.strength }} signal</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Stream Modal Viewer (Popped Out in Center of Screen) -->
    <div
      v-if="activeStreamMatch"
      class="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      @click.self="closeStream"
    >
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white animate-in fade-in zoom-in-95 duration-200">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950">
          <div class="flex items-center gap-2.5 min-w-0 pr-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
            <img
              :src="activeStreamMatch.home.logo || getTeamLogo(activeStreamMatch.home.name)"
              :alt="activeStreamMatch.home.name"
              class="w-6 h-6 object-contain rounded-xs bg-white p-0.5 border border-slate-200 shrink-0"
              loading="lazy"
            />
            <h4 class="font-bold text-sm text-white truncate">
              {{ activeStreamMatch.home.name }} vs {{ activeStreamMatch.away.name }}
            </h4>
            <img
              :src="activeStreamMatch.away.logo || getTeamLogo(activeStreamMatch.away.name)"
              :alt="activeStreamMatch.away.name"
              class="w-6 h-6 object-contain rounded-xs bg-white p-0.5 border border-slate-200 shrink-0"
              loading="lazy"
            />
            <span class="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 font-semibold shrink-0">
              <ShieldCheck class="w-3 h-3 text-emerald-400" />
              Anti-Ban iFrame Shield
            </span>
          </div>

          <!-- Header Actions: Pop Out to Corner & Close -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              @click="() => popOutStream(activeStreamMatch)"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
              title="Pop out into a floating window at the corner of your screen"
            >
              <PictureInPicture class="w-3.5 h-3.5 text-amber-400" />
              <span class="hidden sm:inline">Pop Out to Corner</span>
              <span class="sm:hidden">Pop Out</span>
            </button>
            <button
              type="button"
              @click="closeStream"
              class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Sandboxed Live iFrame Video Player (Protects Referrer to prevent domain ban) -->
        <div class="aspect-video w-full bg-black relative overflow-hidden group">
          <iframe
            :src="`/embed/live?matchId=${activeStreamMatch.id}&home=${encodeURIComponent(activeStreamMatch.home.name)}&away=${encodeURIComponent(activeStreamMatch.away.name)}&homeLogo=${encodeURIComponent(activeStreamMatch.home.logo || getTeamLogo(activeStreamMatch.home.name))}&awayLogo=${encodeURIComponent(activeStreamMatch.away.logo || getTeamLogo(activeStreamMatch.away.name))}&comp=${encodeURIComponent(activeStreamMatch.competition || activeStreamMatch.streamLabel || '')}&status=${activeStreamMatch.status}&homeScore=${activeStreamMatch.homeScore || 0}&awayScore=${activeStreamMatch.awayScore || 0}`"
            class="w-full h-full border-0"
            title="TipOffPh Live Sports Transmission"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>

        <!-- Modal Footer -->
        <div class="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <span class="text-slate-300">Time: {{ activeStreamMatch.manilaTimeFormatted }}</span>
            <span class="text-slate-600">·</span>
            <span class="text-emerald-400 flex items-center gap-1 text-[11px]">
              <ShieldCheck class="w-3 h-3" />
              Sandboxed Embed · Referrer Masked (Anti-Ban Active)
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="() => popOutStream(activeStreamMatch)"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-xs flex items-center gap-1 transition-all border border-slate-700"
            >
              <PictureInPicture class="w-3.5 h-3.5" />
              <span>Float on Screen</span>
            </button>
            <button
              type="button"
              @click="() => { const m = activeStreamMatch; closeStream(); if (m) openBet(m); }"
              class="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-1 transition-all"
            >
              <Flame class="w-3.5 h-3.5 text-red-700" />
              <span>Bet Now on This Match</span>
            </button>
            <button
              type="button"
              @click="closeStream"
              class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Pop-Out Mini-Player Dock (Always Visible in Viewer's Screen Corner as they scroll) -->
    <div
      v-if="isFloatingPopout && activeFloatingMatch"
      class="fixed bottom-5 right-5 z-[99999] w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)] bg-slate-950 border-2 border-red-500/90 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 ring-4 ring-black/60"
    >
      <!-- Mini Header with Team Logos -->
      <div class="h-9 bg-slate-900 px-3 flex items-center justify-between border-b border-slate-800 text-xs">
        <div class="flex items-center gap-1.5 min-w-0 pr-1">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          <img
            :src="activeFloatingMatch.home.logo || getTeamLogo(activeFloatingMatch.home.name)"
            :alt="activeFloatingMatch.home.name"
            class="w-4 h-4 object-contain rounded-xs bg-white p-0.5 border border-slate-700 shrink-0"
            @error="($event.target as HTMLImageElement).src = getTeamLogo(activeFloatingMatch.home.name)"
          />
          <span class="font-extrabold text-[11px] text-white truncate">
            {{ activeFloatingMatch.home.name }} vs {{ activeFloatingMatch.away.name }}
          </span>
          <img
            :src="activeFloatingMatch.away.logo || getTeamLogo(activeFloatingMatch.away.name)"
            :alt="activeFloatingMatch.away.name"
            class="w-4 h-4 object-contain rounded-xs bg-white p-0.5 border border-slate-700 shrink-0"
            @error="($event.target as HTMLImageElement).src = getTeamLogo(activeFloatingMatch.away.name)"
          />
          <span class="text-[10px] font-mono text-amber-400 font-bold shrink-0">
            {{ activeFloatingMatch.homeScore }} - {{ activeFloatingMatch.awayScore }}
          </span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            @click="expandFloatingStream"
            class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Expand to Fullscreen Modal"
          >
            <Maximize2 class="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            @click="closeFloatingStream"
            class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Close Pop-Out Player"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Video Iframe with Logos -->
      <div class="aspect-video w-full bg-black relative">
        <iframe
          :src="`/embed/live?matchId=${activeFloatingMatch.id}&home=${encodeURIComponent(activeFloatingMatch.home.name)}&away=${encodeURIComponent(activeFloatingMatch.away.name)}&homeLogo=${encodeURIComponent(activeFloatingMatch.home.logo || getTeamLogo(activeFloatingMatch.home.name))}&awayLogo=${encodeURIComponent(activeFloatingMatch.away.logo || getTeamLogo(activeFloatingMatch.away.name))}&comp=${encodeURIComponent(activeFloatingMatch.competition || activeFloatingMatch.streamLabel || '')}&status=${activeFloatingMatch.status}&homeScore=${activeFloatingMatch.homeScore || 0}&awayScore=${activeFloatingMatch.awayScore || 0}`"
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
          @click="() => { const m = activeFloatingMatch; if (m) openBet(m); }"
          class="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
        >
          <Flame class="w-3 h-3 text-red-500" />
          <span>Bet on Match</span>
        </button>
      </div>
    </div>

    <!-- Bet Now Interactive Modal Dialog -->
    <div
      v-if="activeBetMatch"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      @click.self="closeBet"
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
                <span v-if="activeBetMatch.status === 'live'" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white uppercase animate-pulse">
                  LIVE
                </span>
              </h4>
              <p class="text-[11px] text-slate-400">
                {{ activeBetMatch.competition || activeBetMatch.streamLabel || 'Philippine Basketball' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="closeBet"
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
                :src="activeBetMatch.home.logo || getTeamLogo(activeBetMatch.home.name)"
                :alt="activeBetMatch.home.name"
                class="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-md mb-1.5"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(activeBetMatch.home.name)"
              />
              <span class="font-bold text-xs text-white line-clamp-1">{{ activeBetMatch.home.name }}</span>
              <span v-if="activeBetMatch.status === 'live'" class="font-mono text-xl font-black text-amber-400 mt-1">
                {{ activeBetMatch.homeScore }}
              </span>
            </div>

            <!-- VS / Clock -->
            <div class="col-span-1 flex flex-col items-center">
              <span class="text-xs font-black text-slate-500 uppercase tracking-widest">VS</span>
              <span v-if="activeBetMatch.status === 'live'" class="text-[10px] text-red-400 font-mono font-bold mt-1">
                {{ activeBetMatch.clock || 'LIVE' }}
              </span>
              <span v-else class="text-[10px] text-slate-400 font-mono mt-1">
                {{ activeBetMatch.manilaTimeFormatted }}
              </span>
            </div>

            <!-- Away Team -->
            <div class="col-span-3 flex flex-col items-center">
              <img
                :src="activeBetMatch.away.logo || getTeamLogo(activeBetMatch.away.name)"
                :alt="activeBetMatch.away.name"
                class="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-md mb-1.5"
                @error="($event.target as HTMLImageElement).src = getTeamLogo(activeBetMatch.away.name)"
              />
              <span class="font-bold text-xs text-white line-clamp-1">{{ activeBetMatch.away.name }}</span>
              <span v-if="activeBetMatch.status === 'live'" class="font-mono text-xl font-black text-amber-400 mt-1">
                {{ activeBetMatch.awayScore }}
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
                {{ selectedBetMarket === 'total' ? 'Over' : activeBetMatch.home.name }}
              </div>
              <div class="flex items-center justify-between font-mono font-bold mt-1">
                <span class="text-sm text-white">
                  {{ selectedBetMarket === 'spread' ? '-3.5' : (selectedBetMarket === 'total' ? 'O 188.5' : 'Win') }}
                </span>
                <span class="text-amber-400 text-xs">
                  {{ selectedBetMarket === 'moneyline' ? (activeBetMatch.odds?.home?.toFixed(2) || '1.68') : '1.91' }}
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
                {{ selectedBetMarket === 'total' ? 'Under' : activeBetMatch.away.name }}
              </div>
              <div class="flex items-center justify-between font-mono font-bold mt-1">
                <span class="text-sm text-white">
                  {{ selectedBetMarket === 'spread' ? '+3.5' : (selectedBetMarket === 'total' ? 'U 188.5' : 'Win') }}
                </span>
                <span class="text-amber-400 text-xs">
                  {{ selectedBetMarket === 'moneyline' ? (activeBetMatch.odds?.away?.toFixed(2) || '2.25') : '1.91' }}
                </span>
              </div>
            </button>
          </div>

          <!-- Signal / Model Pick Insight if any -->
          <div 
            v-if="activeBetMatch.signals && activeBetMatch.signals.length" 
            class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs"
          >
            <div class="flex items-center justify-between font-bold text-emerald-400 mb-1">
              <span class="flex items-center gap-1.5">
                <TrendingUp class="w-3.5 h-3.5" />
                <span>Analytic Signal: {{ activeBetMatch.signals[0]?.pickLabel }}</span>
              </span>
              <span class="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-mono text-[10px]">
                {{ activeBetMatch.signals[0]?.confidence }}% Confidence
              </span>
            </div>
            <p class="text-[11px] text-emerald-200/80 leading-relaxed">
              {{ activeBetMatch.signals[0]?.rationale }}
            </p>
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
                ₱{{ Math.round(selectedStake * (selectedBetMarket === 'moneyline' ? (selectedBetPick === 'home' ? (activeBetMatch.odds?.home || 1.68) : (activeBetMatch.odds?.away || 2.25)) : 1.91)).toLocaleString() }}
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
                v-if="activeBetMatch.hasStream || (activeBetMatch.sources && activeBetMatch.sources.length) || activeBetMatch.status === 'live'"
                type="button"
                @click="() => { const m = activeBetMatch; closeBet(); if (m) openStream(m); }"
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
  </div>
</template>
