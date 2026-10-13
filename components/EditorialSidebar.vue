<script setup lang="ts">
import type { Article, GameScore } from '~/shared/types';
import { Calendar, Flame, ChevronRight, TrendingUp } from 'lucide-vue-next';
import { useFormatters } from '~/composables/useFormatters';

defineProps<{
  recentArticles?: Article[];
  scores?: GameScore[];
}>();

const { formatRelativeTime } = useFormatters();
</script>

<template>
  <aside class="space-y-6">
    <!-- Live & Recent Scores Widget -->
    <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <h3 class="font-bold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Calendar class="w-4 h-4 text-[#E67E22]" />
          Courtside Scores
        </h3>
        <NuxtLink to="/scores-and-schedules" class="text-xs text-[#E67E22] hover:underline font-semibold">
          Full Board &rarr;
        </NuxtLink>
      </div>

      <div v-if="scores && scores.length > 0" class="space-y-3">
        <div 
          v-for="game in scores.slice(0, 3)" 
          :key="game.id"
          class="border border-slate-100 rounded p-2.5 bg-slate-50 text-xs"
        >
          <div class="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1.5">
            <span>{{ game.league }}</span>
            <span :class="{ 'text-red-600 font-bold animate-pulse': game.status === 'live', 'text-slate-600': game.status !== 'live' }">
              {{ game.statusDetail }}
            </span>
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between font-semibold">
              <span class="truncate text-slate-900">{{ game.homeTeam }}</span>
              <span class="font-mono text-slate-900">{{ game.homeScore !== undefined ? game.homeScore : '—' }}</span>
            </div>
            <div class="flex items-center justify-between font-semibold">
              <span class="truncate text-slate-900">{{ game.awayTeam }}</span>
              <span class="font-mono text-slate-900">{{ game.awayScore !== undefined ? game.awayScore : '—' }}</span>
            </div>
          </div>
          <div class="mt-1 text-[10px] text-slate-400 truncate">
            {{ game.venue.split(',')[0] }}
          </div>
        </div>
      </div>
      <div v-else class="text-xs text-slate-500 py-3 text-center">
        No active matches currently in progress.
      </div>
    </div>

    <!-- Editorial Sidebar Ad (300 x 250 Medium Rectangle) -->
    <AdUnit 
      format="rectangle" 
      image-url="/img/nba-back-to-back-boost.webp"
      image-alt="Back-to-Back Boost"
    />

    <!-- Top Recent Stories / Trending -->
    <div v-if="recentArticles && recentArticles.length > 0" class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <h3 class="font-bold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <TrendingUp class="w-4 h-4 text-[#E67E22]" />
          Latest News
        </h3>
        <NuxtLink to="/latest-news" class="text-xs text-[#E67E22] hover:underline font-semibold">
          View All &rarr;
        </NuxtLink>
      </div>

      <div class="divide-y divide-slate-100">
        <article 
          v-for="(art, idx) in recentArticles.slice(0, 5)" 
          :key="art.id"
          class="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5"
        >
          <span class="text-base font-black text-slate-300 font-mono w-4 shrink-0">
            {{ idx + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <NuxtLink 
              :to="`/news/${art.slug}`"
              class="text-xs font-semibold text-slate-800 hover:text-[#D35400] transition-colors line-clamp-2 leading-snug"
            >
              {{ art.title }}
            </NuxtLink>
            <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{{ art.category?.name || 'News' }}</span>
              <span>·</span>
              <span>{{ formatRelativeTime(art.publishedAt) }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Quick Newsletter / TipOff Notice -->
    <div class="bg-slate-900 text-white rounded-lg p-5">
      <h4 class="text-sm font-bold text-amber-400 mb-1">
        TipOffPh Independent Journalism
      </h4>
      <p class="text-xs text-slate-300 leading-relaxed">
        We deliver verified, non-sensationalized reporting for passionate Filipino basketball enthusiasts. Support local sports journalism.
      </p>
      <div class="mt-3">
        <NuxtLink 
          to="/write-for-us" 
          class="inline-block text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded transition-colors"
        >
          Become a Contributor
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
