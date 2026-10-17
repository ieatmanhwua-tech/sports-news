<script setup lang="ts">
import type { Article, GameScore } from '~/shared/types';
import { Calendar, Flame, ChevronRight, TrendingUp } from 'lucide-vue-next';
import { useFormatters } from '~/composables/useFormatters';
import { getTeamLogo } from '~/shared/team-logos';
import AdUnit from '~/components/AdUnit.vue';

const props = defineProps<{
  recentArticles?: Article[];
  scores?: GameScore[];
}>();

const { formatRelativeTime } = useFormatters();

const livePolledScores = ref<GameScore[] | null>(null);
let sidebarPollTimer: ReturnType<typeof setInterval> | null = null;

const displayScores = computed<GameScore[]>(() => {
  if (livePolledScores.value && livePolledScores.value.length > 0) {
    return livePolledScores.value;
  }
  return props.scores || [];
});

let isPollingSidebar = false;

async function pollSidebarScores() {
  if (isPollingSidebar) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
  isPollingSidebar = true;
  try {
    const res = await $fetch<{ games: GameScore[] }>('/api/scores');
    if (res?.games && res.games.length > 0) {
      livePolledScores.value = res.games;
    }
  } catch {
    // Keep existing scores on transient network error
  } finally {
    isPollingSidebar = false;
  }
}

onMounted(() => {
  if (!props.scores || props.scores.length === 0) {
    void pollSidebarScores();
  }
  sidebarPollTimer = setInterval(pollSidebarScores, 30000);
});

onUnmounted(() => {
  if (sidebarPollTimer) {
    clearInterval(sidebarPollTimer);
    sidebarPollTimer = null;
  }
});
</script>

<template>
  <aside class="space-y-6">
    <!-- Live & Recent Scores Widget (Dark Glassmorphic) -->
    <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4.5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] ring-1 ring-cyan-500/20">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3.5">
        <h3 class="font-black text-sm uppercase tracking-wider text-white flex items-center gap-1.5 drop-shadow-sm">
          <Calendar class="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
          <span>Courtside Scores</span>
        </h3>
        <NuxtLink to="/scores-and-schedules" class="text-xs text-orange-400 hover:text-orange-300 hover:underline font-bold">
          Full Board &rarr;
        </NuxtLink>
      </div>

      <div v-if="displayScores.length > 0" class="space-y-3">
        <div 
          v-for="game in displayScores.slice(0, 3)" 
          :key="game.id"
          class="border border-slate-700/70 hover:border-orange-500/40 rounded-xl p-3 bg-slate-950/70 text-xs transition-all shadow-xs group"
        >
          <div class="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-2">
            <span class="text-orange-400 font-black uppercase tracking-wider text-[10px]">{{ game.league }}</span>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
              :class="{ 
                'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]': game.status === 'live', 
                'bg-slate-800 text-slate-300': game.status !== 'live' 
              }"
            >
              {{ game.statusDetail }}
            </span>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between font-bold">
              <div class="flex items-center gap-2 min-w-0 pr-1">
                <img 
                  :src="game.homeTeamLogo || getTeamLogo(game.homeTeam)" 
                  :alt="game.homeTeam"
                  class="w-5 h-5 object-contain shrink-0 rounded-xs bg-white p-0.5 border border-slate-200 shadow-2xs"
                  loading="lazy"
                />
                <span class="truncate text-white group-hover:text-amber-200 transition-colors">{{ game.homeTeam }}</span>
              </div>
              <span class="font-mono text-white text-sm shrink-0" :class="{ 'text-orange-400 font-black': game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore }">
                {{ game.homeScore !== undefined ? game.homeScore : '—' }}
              </span>
            </div>
            <div class="flex items-center justify-between font-bold">
              <div class="flex items-center gap-2 min-w-0 pr-1">
                <img 
                  :src="game.awayTeamLogo || getTeamLogo(game.awayTeam)" 
                  :alt="game.awayTeam"
                  class="w-5 h-5 object-contain shrink-0 rounded-xs bg-white p-0.5 border border-slate-200 shadow-2xs"
                  loading="lazy"
                />
                <span class="truncate text-white group-hover:text-amber-200 transition-colors">{{ game.awayTeam }}</span>
              </div>
              <span class="font-mono text-white text-sm shrink-0" :class="{ 'text-orange-400 font-black': game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore }">
                {{ game.awayScore !== undefined ? game.awayScore : '—' }}
              </span>
            </div>
          </div>
          <div class="mt-2 text-[10px] text-slate-400 truncate flex items-center justify-between">
            <span class="truncate text-slate-400">{{ game.venue.split(',')[0] }}</span>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[10px]">
            <NuxtLink 
              to="/local-sports" 
              class="font-bold flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md truncate"
              :class="game.status === 'live' 
                ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                : 'bg-slate-800 text-slate-300 hover:text-white'"
            >
              <span v-if="game.status === 'live'" class="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0"></span>
              <span class="truncate">Watch {{ game.awayTeam }} vs {{ game.homeTeam }} Live</span>
            </NuxtLink>
            <div class="flex items-center gap-1.5 shrink-0">
              <NuxtLink
                to="/scores-and-schedules"
                @click.stop
                title="View Match Scoreboard & Details"
                class="font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all shrink-0 whitespace-nowrap"
              >
                <span>View</span>
              </NuxtLink>
              <a 
                href="https://tipoff.bybetcasino.ph/c6Yv/"
                target="_blank"
                rel="nofollow sponsored noopener"
                @click.stop
                title="Bet on Live Games — Play at Bybet"
                class="font-black text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(249,115,22,0.35)] shrink-0 whitespace-nowrap"
              >
                <span>Bet Now ↗</span>
              </a>
            </div>
          </div>
        </div>

        <div class="pt-2.5 border-t border-slate-800 flex flex-col gap-2 text-[11px]">
          <NuxtLink to="/local-sports" class="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>PBA, MPBL &amp; PH Streams &rarr;</span>
          </NuxtLink>
          <NuxtLink to="/nba-odds" class="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>NBA Live Odds &amp; Lines &rarr;</span>
          </NuxtLink>
        </div>
      </div>
      <div v-else class="text-xs text-slate-400 py-4 text-center">
        No active matches currently in progress.
      </div>
    </div>

    <!-- Editorial Sidebar Ad (300 x 250 Medium Rectangle) -->
    <AdUnit 
      format="rectangle" 
      image-url="/img/nba-back-to-back-boost.webp"
      image-alt="Back-to-Back Boost"
    />

    <!-- Top Recent Stories / Trending (Dark Glassmorphic) -->
    <div v-if="recentArticles && recentArticles.length > 0" class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4.5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] ring-1 ring-orange-500/20">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3.5">
        <h3 class="font-black text-sm uppercase tracking-wider text-white flex items-center gap-1.5 drop-shadow-sm">
          <TrendingUp class="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
          <span>Trending News</span>
        </h3>
        <NuxtLink to="/latest-news" class="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-bold">
          View All &rarr;
        </NuxtLink>
      </div>

      <div class="divide-y divide-slate-800/80">
        <article 
          v-for="(art, idx) in recentArticles.slice(0, 5)" 
          :key="art.id"
          class="py-3 first:pt-0 last:pb-0 flex items-start gap-3 group"
        >
          <span class="text-base font-black text-slate-500 group-hover:text-cyan-400 transition-colors font-mono w-4 shrink-0">
            {{ idx + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <NuxtLink 
              :to="`/news/${art.slug}`"
              class="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug"
            >
              {{ art.title }}
            </NuxtLink>
            <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span class="text-orange-400 font-bold uppercase text-[9px]">{{ art.category?.name || 'News' }}</span>
              <span class="text-slate-600">·</span>
              <span>{{ formatRelativeTime(art.publishedAt) }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Quick Newsletter / TipOff Notice (Dark Glassmorphic) -->
    <div class="bg-gradient-to-br from-[#120a1c]/90 via-[#0d0f22]/85 to-[#090b16]/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/10 blur-[40px] pointer-events-none" />
      <h4 class="text-sm font-black text-amber-300 mb-1.5 drop-shadow-sm flex items-center gap-1.5">
        <Flame class="w-4 h-4 text-orange-400" />
        TipOffPh Independent Hoops
      </h4>
      <p class="text-xs text-slate-300 leading-relaxed">
        We deliver verified, non-sensationalized reporting for passionate Filipino basketball enthusiasts. Support local sports journalism.
      </p>
      <div class="mt-3.5">
        <NuxtLink 
          to="/write-for-us" 
          class="inline-block text-xs font-black text-slate-950 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.4)]"
        >
          Become a Contributor
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
