<script setup lang="ts">
import type { Article, GameScore } from '~/shared/types';
import BreakingNewsBanner from '~/components/BreakingNewsBanner.vue';
import LeadArticleCard from '~/components/LeadArticleCard.vue';
import ArticleCard from '~/components/ArticleCard.vue';
import LatestNews from '~/components/LatestNews.vue';
import EditorialSidebar from '~/components/EditorialSidebar.vue';
import AdUnit from '~/components/AdUnit.vue';
import LeagueFilterBar from '~/components/LeagueFilterBar.vue';
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

const config = useRuntimeConfig();
const siteUrl = computed(() => (config.public.siteUrl || 'https://tipoffph.com').replace(/\/$/, ''));
const canonicalUrl = computed(() => `${siteUrl.value}/`);

// Schema.org Structured Data: NewsMediaOrganization & WebSite with SearchAction
const homeSchema = computed(() => {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      'name': 'TipOffPh',
      'alternateName': 'TipOff Philippines Basketball',
      'url': siteUrl.value,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl.value}/img/TipOffPh_logo.png`,
        'width': 600,
        'height': 160
      },
      'description': 'Independent Philippine basketball news publication covering PBA, MPBL, UAAP, NCAA, Gilas Pilipinas, live scores, schedules, and grassroots hoops.',
      'foundingDate': '2024',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Manila',
        'addressRegion': 'Metro Manila',
        'addressCountry': 'PH'
      },
      'publishingPrinciples': `${siteUrl.value}/editorial-policy`,
      'correctionsPolicy': `${siteUrl.value}/corrections-policy`,
      'diversityPolicy': `${siteUrl.value}/editorial-policy`,
      'ethicsPolicy': `${siteUrl.value}/editorial-policy`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TipOffPh',
      'url': siteUrl.value,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${siteUrl.value}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ];
});

useHead({
  title: 'TipOffPh - Philippine Basketball News, PBA Scores & Gilas Updates',
  meta: [
    { name: 'description', content: 'Your primary source for Philippine basketball news: PBA Philippine Cup, MPBL standings, UAAP, NCAA, Gilas Pilipinas updates, live scores, and global hoops.' },
    { property: 'og:title', content: 'TipOffPh - Philippine Basketball News, PBA Scores & Gilas Updates' },
    { property: 'og:description', content: 'Your primary source for Philippine basketball news: PBA Philippine Cup, MPBL standings, UAAP, NCAA, Gilas Pilipinas updates, live scores, and global hoops.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` },
    { property: 'og:site_name', content: 'TipOffPh' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'TipOffPh - Philippine Basketball News, PBA Scores & Gilas Updates' },
    { name: 'twitter:description', content: 'Your primary source for Philippine basketball news: PBA, MPBL, UAAP, NCAA, Gilas Pilipinas, and live scores.' },
    { name: 'twitter:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify(homeSchema.value)
    }
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

        <!-- Latest News Component with Thumbnails, Excerpts, and Category Filters -->
        <LatestNews 
          :exclude-id="homeData?.featured?.id" 
          :limit="4"
          :show-filters="true"
          title="Latest News"
          subtitle="Continuous real-time stream of Philippine basketball updates"
        />

        <!-- Mid-page In-Feed Ad -->
        <AdUnit format="banner" class="sm:hidden" />

        <!-- Dual Column: PBA & MPBL News -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- PBA News Section -->
          <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-orange-500/50 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4">
              <h3 class="font-black text-sm uppercase tracking-wider text-white flex items-center gap-1.5 drop-shadow-sm">
                <Trophy class="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                <span>PBA Coverage</span>
              </h3>
              <NuxtLink to="/pba-news" class="text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline">
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
          <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4">
              <h3 class="font-black text-sm uppercase tracking-wider text-white flex items-center gap-1.5 drop-shadow-sm">
                <Flame class="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                <span>MPBL Updates</span>
              </h3>
              <NuxtLink to="/mpbl-news" class="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline">
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
        <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
            <h2 class="text-base font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
              <GraduationCap class="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
              <span>Collegiate &amp; Grassroots (UAAP &amp; NCAA)</span>
            </h2>
            <NuxtLink to="/uaap-basketball" class="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline">
              Collegiate Hub &rarr;
            </NuxtLink>
          </div>

          <div class="space-y-4 divide-y divide-slate-800/80">
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
        <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
            <h2 class="text-base font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
              <Globe class="w-5 h-5 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
              <span>Gilas Pilipinas &amp; Global Pinoys</span>
            </h2>
            <NuxtLink to="/gilas-pilipinas" class="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline">
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
