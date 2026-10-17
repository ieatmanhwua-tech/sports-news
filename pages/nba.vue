<script setup lang="ts">
import { computed } from 'vue';
import type { CategoryInfo, Article } from '~/shared/types';
import { Tv, TrendingUp, Flame, Newspaper, Calendar } from 'lucide-vue-next';

const { data, pending } = await useFetch<{
  category: CategoryInfo;
  articles: Article[];
  total: number;
  childTopics: CategoryInfo[];
}>('/api/categories/nba');

const articles = computed(() => data.value?.articles || []);

useSeoMeta({
  title: 'NBA Preseason Predictions, Blog & Latest News | TipOffPh',
  ogTitle: 'NBA Preseason Predictions, Blog & Latest News | TipOffPh',
  description: 'Read our 5-part NBA Preseason Fight Tomorrow prediction blog featuring real team action photos, projected scores, odds, and complete NBA coverage for Filipino fans.',
  ogDescription: 'Read our 5-part NBA Preseason Fight Tomorrow prediction blog featuring real team action photos, projected scores, odds, and complete NBA coverage for Filipino fans.'
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
    <!-- Breadcrumbs -->
    <nav class="flex items-center space-x-2 text-xs text-slate-400" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-amber-400 transition-colors">Home</NuxtLink>
      <span>/</span>
      <span class="text-slate-200 font-semibold">NBA Hub &amp; Preseason Predictions</span>
    </nav>

    <!-- NBA Hub Hero Header -->
    <header class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#091224] via-[#111f3d] to-[#1d1128] border border-blue-500/30 p-6 sm:p-8 shadow-2xl">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-start sm:items-center gap-4 sm:gap-5">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/90 border border-slate-700/80 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
            <img
              src="/img/nba-logo.webp"
              alt="National Basketball Association (NBA)"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider">
                Official NBA Desk
              </span>
              <span class="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                Oct 14–17, 2026 PHT • Matchup Blogs &amp; Final Recaps
              </span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">
              National Basketball Association (NBA)
            </h1>
            <p class="text-slate-300 text-sm sm:text-base max-w-2xl">
              Complete NBA coverage tailored for Filipino basketball fans: verified PHT game dates, 5-game preseason showcase blogs with real team photography, live streams, Vegas odds, and official box score recaps.
            </p>
          </div>
        </div>

        <!-- Quick Action Links -->
        <div class="flex flex-wrap sm:flex-nowrap md:flex-col gap-2.5 shrink-0">
          <NuxtLink
            to="/local-sports"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            <Tv class="w-4 h-4" />
            Watch NBA Live Stream
          </NuxtLink>
          <NuxtLink
            to="/nba-odds"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all"
          >
            <TrendingUp class="w-4 h-4 text-amber-400" />
            Live NBA Odds &amp; Spreads
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- 5 Prediction Content Designs Showcase -->
    <NbaPreseasonPredictions />

    <!-- Latest NBA News & Full Prediction Articles Grid -->
    <section class="space-y-6 pt-4 border-t border-slate-800/80">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <Newspaper class="w-5 h-5 text-amber-400" />
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            Latest NBA News, Recaps &amp; Full Prediction Posts
          </h2>
        </div>
        <span class="text-xs font-semibold text-slate-400">
          Showing {{ articles.length }} published NBA articles
        </span>
      </div>

      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="h-80 bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
      </div>

      <div v-else-if="articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>
    </section>
  </div>
</template>
