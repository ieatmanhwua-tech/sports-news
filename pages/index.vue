<script setup lang="ts">
import type { Article, GameScore } from '~/shared/types';
import BreakingNewsBanner from '~/components/BreakingNewsBanner.vue';
import LeadArticleCard from '~/components/LeadArticleCard.vue';
import ArticleCard from '~/components/ArticleCard.vue';
import EditorialSidebar from '~/components/EditorialSidebar.vue';
import AdUnit from '~/components/AdUnit.vue';
import { ArrowRight, Flame, Trophy, Globe, GraduationCap, ShieldAlert } from 'lucide-vue-next';

// Server-side asynchronous data fetching with Nuxt 3 useAsyncData
const { data: homeData, error } = await useAsyncData('home-feed', async () => {
  const [
    breakingRes,
    featuredRes,
    latestRes,
    pbaRes,
    mpblRes,
    collegiateRes,
    gilasRes,
    scoresRes
  ] = await Promise.all([
    $fetch<{ articles: Article[] }>('/api/articles', { query: { breaking: 'true', limit: 1 } }),
    $fetch<{ articles: Article[] }>('/api/articles', { query: { featured: 'true', limit: 1 } }),
    $fetch<{ articles: Article[] }>('/api/articles', { query: { limit: 8 } }),
    $fetch<{ articles: Article[] }>('/api/articles', { query: { category: 'pba-news', limit: 4 } }),
    $fetch<{ articles: Article[] }>('/api/articles', { query: { category: 'mpbl-news', limit: 4 } }),
    $fetch<{ articles: Article[] }>('/api/articles', { query: { topic: 'uaap-basketball', limit: 4 } }),
    $fetch<{ articles: Article[] }>('/api/articles', { query: { category: 'gilas-pilipinas', limit: 4 } }),
    $fetch<{ games: GameScore[] }>('/api/scores')
  ]);

  return {
    breaking: breakingRes.articles[0] || null,
    featured: featuredRes.articles[0] || latestRes.articles[0] || null,
    latest: latestRes.articles || [],
    pba: pbaRes.articles || [],
    mpbl: mpblRes.articles || [],
    collegiate: collegiateRes.articles || [],
    gilas: gilasRes.articles || [],
    scores: scoresRes.games || []
  };
});

useHead({
  title: 'TipOffPh - Philippine Basketball News, PBA Scores & Gilas Updates',
  meta: [
    { name: 'description', content: 'Your primary source for Philippine basketball news: PBA Philippine Cup, MPBL standings, UAAP, NCAA, Gilas Pilipinas updates, and global hoops.' },
    { property: 'og:title', content: 'TipOffPh - Philippine Basketball News, PBA Scores & Gilas Updates' },
    { property: 'og:description', content: 'Your primary source for Philippine basketball news: PBA Philippine Cup, MPBL standings, UAAP, NCAA, Gilas Pilipinas updates, and global hoops.' }
  ]
});
</script>

<template>
  <div>
    <!-- Breaking News Strip (Shown only if an editor marked a published story as breaking) -->
    <BreakingNewsBanner 
      v-if="homeData?.breaking" 
      :article="homeData.breaking" 
      class="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6"
    />

    <!-- Top Leaderboard Ad Unit (728 x 90) -->
    <div class="mb-6">
      <AdUnit 
        format="leaderboard" 
        image-url="/img/exclusive-vip-rewards.webp"
        image-alt="Exclusive VIP Rewards"
      />
    </div>

    <!-- Quick League Navigation Bar -->
    <LeagueFilterBar mode="navigate" class="mb-6" />

    <!-- Main Layout: News Grid Column + Editorial Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Main News Column (8 cols on desktop) -->
      <section class="lg:col-span-8 space-y-10">
        <!-- Lead Hero Story (Editor-selected) -->
        <section v-if="homeData?.featured">
          <LeadArticleCard :article="homeData.featured" />
        </section>

        <!-- Latest News Stream (Chronological order) -->
        <section class="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
            <h2 class="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-[#E67E22] rounded-full"></span>
              Latest News
            </h2>
            <NuxtLink to="/latest-news" class="text-xs font-bold text-[#E67E22] hover:text-amber-700 flex items-center gap-1">
              All Stories <ArrowRight class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ArticleCard 
              v-for="article in (homeData?.latest || []).filter(a => a.id !== homeData?.featured?.id).slice(0, 4)" 
              :key="article.id" 
              :article="article"
              layout="vertical"
            />
          </div>
        </section>

        <!-- Mid-page In-Feed Ad -->
        <AdUnit format="banner" class="sm:hidden" />

        <!-- Dual Column: PBA & MPBL News -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- PBA News Section -->
          <section class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-4">
              <h3 class="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Trophy class="w-4 h-4 text-[#E67E22]" />
                PBA Coverage
              </h3>
              <NuxtLink to="/pba-news" class="text-xs font-bold text-[#E67E22] hover:underline">
                More PBA &rarr;
              </NuxtLink>
            </div>

            <div class="space-y-4">
              <ArticleCard 
                v-for="(art, idx) in homeData?.pba || []" 
                :key="art.id" 
                :article="art"
                :layout="idx === 0 ? 'vertical' : 'compact'"
                :show-excerpt="idx === 0"
              />
            </div>
          </section>

          <!-- MPBL News Section -->
          <section class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-4">
              <h3 class="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Flame class="w-4 h-4 text-amber-500" />
                MPBL Updates
              </h3>
              <NuxtLink to="/mpbl-news" class="text-xs font-bold text-[#E67E22] hover:underline">
                More MPBL &rarr;
              </NuxtLink>
            </div>

            <div class="space-y-4">
              <ArticleCard 
                v-for="(art, idx) in homeData?.mpbl || []" 
                :key="art.id" 
                :article="art"
                :layout="idx === 0 ? 'vertical' : 'compact'"
                :show-excerpt="idx === 0"
              />
            </div>
          </section>
        </div>

        <!-- Collegiate & Grassroots Section (UAAP & NCAA) -->
        <section class="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
            <h2 class="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <GraduationCap class="w-5 h-5 text-[#E67E22]" />
              Collegiate &amp; Grassroots (UAAP &amp; NCAA)
            </h2>
            <NuxtLink to="/uaap-basketball" class="text-xs font-bold text-[#E67E22] hover:underline">
              Collegiate Hub &rarr;
            </NuxtLink>
          </div>

          <div class="space-y-4 divide-y divide-slate-100">
            <ArticleCard 
              v-for="art in homeData?.collegiate || []" 
              :key="art.id" 
              :article="art"
              layout="horizontal"
              class="pt-4 first:pt-0"
            />
          </div>
        </section>

        <!-- Gilas Pilipinas & International Section -->
        <section class="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
            <h2 class="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Globe class="w-5 h-5 text-blue-600" />
              Gilas Pilipinas &amp; Global Pinoys
            </h2>
            <NuxtLink to="/gilas-pilipinas" class="text-xs font-bold text-[#E67E22] hover:underline">
              Gilas Hub &rarr;
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ArticleCard 
              v-for="art in homeData?.gilas || []" 
              :key="art.id" 
              :article="art"
              layout="vertical"
            />
          </div>
        </section>
      </section>

      <!-- Sidebar Column (4 cols on desktop) -->
      <div class="lg:col-span-4">
        <EditorialSidebar 
          :recent-articles="homeData?.latest || []"
          :scores="homeData?.scores || []"
        />
      </div>
    </div>
  </div>
</template>
