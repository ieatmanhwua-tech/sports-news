<script setup lang="ts">
import type { Article, GameScore } from '~/shared/types';
import BreakingNewsBanner from '~/components/BreakingNewsBanner.vue';
import LeadArticleCard from '~/components/LeadArticleCard.vue';
import ArticleCard from '~/components/ArticleCard.vue';
import LatestNews from '~/components/LatestNews.vue';
import EditorialSidebar from '~/components/EditorialSidebar.vue';
import AdUnit from '~/components/AdUnit.vue';
import LeagueFilterBar from '~/components/LeagueFilterBar.vue';
import { NBA_PRESEASON_PREDICTIONS_TOMORROW } from '~/shared/nba-predictions';
import { slugifyTeam } from '~/shared/seo-routing';
import { getTeamLogo } from '~/shared/team-logos';
import { ArrowRight, Flame, Trophy, Globe, GraduationCap, ShieldAlert } from 'lucide-vue-next';

const todayBlogLeagueFilter = ref<'all' | 'nba' | 'pba' | 'mpbl' | 'collegiate'>('all');

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

const filteredTodayMatchBlogs = computed(() => {
  const list = homeData.value?.scores || [];
  const f = todayBlogLeagueFilter.value;
  if (f === 'all') return list.slice(0, 12);
  if (f === 'nba') return list.filter(g => (g.leagueId || g.league).toLowerCase() === 'nba').slice(0, 12);
  if (f === 'pba') return list.filter(g => (g.leagueId || g.league).toLowerCase() === 'pba').slice(0, 12);
  if (f === 'mpbl') return list.filter(g => (g.leagueId || g.league).toLowerCase() === 'mpbl').slice(0, 12);
  if (f === 'collegiate') {
    return list.filter(g => ['uaap', 'ncaa'].includes((g.leagueId || g.league).toLowerCase())).slice(0, 12);
  }
  return list.slice(0, 12);
});

function getMatchBlogUrl(game: GameScore): string {
  return `/news/${slugifyTeam(game.awayTeam)}-vs-${slugifyTeam(game.homeTeam)}-match-blog-today`;
}

function getMatchBlogHeadline(game: GameScore): string {
  if (game.status === 'live') {
    return `LIVE BLOG: ${game.awayTeam} vs. ${game.homeTeam} (${game.awayScore ?? 0}–${game.homeScore ?? 0}, ${game.statusDetail})`;
  }
  if (game.status === 'final') {
    const h = game.homeScore ?? 0;
    const a = game.awayScore ?? 0;
    const winner = h >= a ? game.homeTeam : game.awayTeam;
    const loser = h >= a ? game.awayTeam : game.homeTeam;
    return `${winner} Defeat ${loser} ${Math.max(h, a)}–${Math.min(h, a)}: ${game.league} Box Score & Recap`;
  }
  return `${game.awayTeam} vs. ${game.homeTeam} ${game.league} Preview & Prediction Today (${game.statusDetail})`;
}

const config = useRuntimeConfig();
const siteUrl = computed(() => (config.public.siteUrl || 'https://tipoff.bybetcasino.ph').replace(/\/$/, ''));
const canonicalUrl = computed(() => `${siteUrl.value}/`.toLowerCase());

// Schema.org Structured Data: Organization, NewsMediaOrganization & WebSite with SearchAction
const homeSchema = computed(() => {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'TipOff Bybet PH',
      'alternateName': 'TipOff PH',
      'url': `${siteUrl.value}/`,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl.value}/img/TipOffPh_logo.png`,
        'width': 600,
        'height': 160
      },
      'description': 'Philippine basketball live scores, streams, schedules, and box score recaps covering NBA, PBA, MPBL, UAAP, NCAA, and Gilas Pilipinas.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': `${siteUrl.value}/`
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TipOff Bybet PH',
      'url': `${siteUrl.value}/`,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${siteUrl.value}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ];
});

useHead({
  title: 'NBA Live Today: Scores, Streams & Schedule | TipOff PH',
  meta: [
    { name: 'description', content: 'Watch NBA live today with real-time PBA, MPBL, UAAP, and NCAA basketball scores, PHT game schedules, and post-game box score recaps on TipOff PH.' },
    { property: 'og:title', content: 'NBA Live Today: Scores, Streams & Schedule | TipOff PH' },
    { property: 'og:description', content: 'Watch NBA live today with real-time PBA, MPBL, UAAP, and NCAA basketball scores, PHT game schedules, and post-game box score recaps on TipOff PH.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` },
    { property: 'og:site_name', content: 'TipOff Bybet PH' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'NBA Live Today: Scores, Streams & Schedule | TipOff PH' },
    { name: 'twitter:description', content: 'Watch NBA live today with real-time PBA, MPBL, UAAP, and NCAA basketball scores, PHT game schedules, and post-game box score recaps on TipOff PH.' },
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
          :initial-articles="homeData?.latest"
          :exclude-id="homeData?.featured?.id" 
          :limit="4"
          :show-filters="true"
          title="Latest News"
          subtitle="Continuous real-time stream of Philippine basketball updates"
        />

        <!-- Today's All-Matches Blog Hub (NBA, PBA, MPBL, UAAP & NCAA) -->
        <section v-if="filteredTodayMatchBlogs.length > 0" class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.65)] space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Updated Today
                </span>
                <span class="text-[11px] font-bold text-cyan-300">All Matches Today Blog Coverage</span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Today’s Match Blogs: Live Updates, Previews &amp; Box Score Recaps
              </h2>
            </div>

            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="tab in [
                  { id: 'all', label: 'All Today' },
                  { id: 'nba', label: 'NBA' },
                  { id: 'pba', label: 'PBA' },
                  { id: 'mpbl', label: 'MPBL' },
                  { id: 'collegiate', label: 'UAAP & NCAA' }
                ]"
                :key="tab.id"
                type="button"
                @click="todayBlogLeagueFilter = tab.id as any"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                :class="todayBlogLeagueFilter === tab.id
                  ? 'bg-orange-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <article
              v-for="game in filteredTodayMatchBlogs"
              :key="`blog-today-${game.id}`"
              class="p-4 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-amber-500/40 flex flex-col justify-between gap-3 transition-all"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span class="text-orange-400 font-black uppercase">{{ game.league }} · {{ game.stage }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    :class="game.status === 'live'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                      : game.status === 'upcoming'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300'"
                  >
                    {{ game.status === 'live' ? `LIVE · ${game.statusDetail}` : game.status === 'final' ? 'FINAL BOX SCORE' : game.statusDetail }}
                  </span>
                </div>

                <!-- Matchup Strip with Logos & Score -->
                <div class="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs">
                  <div class="flex items-center gap-2 min-w-0">
                    <img
                      :src="game.awayTeamLogo || getTeamLogo(game.awayTeam)"
                      :alt="game.awayTeam"
                      class="w-5 h-5 object-contain rounded-xs bg-white p-0.5 shrink-0"
                      loading="lazy"
                    />
                    <span class="font-bold text-white truncate">{{ game.awayTeam }}</span>
                  </div>
                  <span class="font-mono font-black text-amber-400 text-xs shrink-0 px-1.5">
                    {{ game.status === 'upcoming' ? 'VS' : `${game.awayScore ?? 0} – ${game.homeScore ?? 0}` }}
                  </span>
                  <div class="flex items-center gap-2 min-w-0 justify-end">
                    <span class="font-bold text-white truncate">{{ game.homeTeam }}</span>
                    <img
                      :src="game.homeTeamLogo || getTeamLogo(game.homeTeam)"
                      :alt="game.homeTeam"
                      class="w-5 h-5 object-contain rounded-xs bg-white p-0.5 shrink-0"
                      loading="lazy"
                    />
                  </div>
                </div>

                <h3 class="text-sm font-extrabold text-white leading-snug">
                  <NuxtLink :to="getMatchBlogUrl(game)" class="hover:text-amber-400 transition-colors">
                    {{ getMatchBlogHeadline(game) }}
                  </NuxtLink>
                </h3>
              </div>

              <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                <NuxtLink
                  :to="getMatchBlogUrl(game)"
                  class="font-bold text-amber-400 hover:text-amber-300 underline truncate"
                >
                  Read Full Match Blog &rarr;
                </NuxtLink>
                <div class="flex items-center gap-1.5 shrink-0">
                  <NuxtLink
                    :to="getMatchBlogUrl(game)"
                    class="px-2.5 py-1 rounded-full font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors whitespace-nowrap"
                  >
                    View
                  </NuxtLink>
                  <a
                    href="https://tipoff.bybetcasino.ph/c6Yv/"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    class="px-2.5 py-1 rounded-full font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 transition-all whitespace-nowrap"
                  >
                    Bet Now ↗
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- NBA Today's 5-Fight Showcase Blogs -->
        <section class="bg-gradient-to-br from-[#0b1326] via-[#101c36] to-[#171129] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.65)] space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div class="flex items-center gap-3">
              <img src="/img/nba-logo.webp" alt="NBA" class="w-9 h-9 object-contain" />
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Today’s NBA Slate
                  </span>
                  <span class="text-[11px] font-bold text-amber-300">5 Matchup Blogs &amp; Final Recaps</span>
                </div>
                <h2 class="text-lg sm:text-xl font-black text-white tracking-tight">
                  NBA Matchup Blogs, Box Scores &amp; Predictions Today
                </h2>
              </div>
            </div>
            <NuxtLink
              to="/nba"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shrink-0"
            >
              <span>Open Full NBA Page</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <NuxtLink
              v-for="pred in NBA_PRESEASON_PREDICTIONS_TOMORROW"
              :key="pred.id"
              :to="`/nba#${pred.id}`"
              class="group rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800 hover:border-amber-500/60 transition-all flex flex-col justify-between"
            >
              <div class="relative h-28 overflow-hidden">
                <img
                  :src="pred.featuredImageUrl"
                  :alt="pred.blogTitle"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                <span class="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                  #0{{ pred.designNumber }}
                </span>
                <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs font-black text-white">
                  <span class="flex items-center gap-1">
                    <img :src="pred.awayTeam.logoUrl" :alt="pred.awayTeam.abbr" class="w-4 h-4 object-contain" />
                    {{ pred.awayTeam.abbr }}
                  </span>
                  <span class="text-[10px] text-amber-400">{{ pred.predictedScore.away }}-{{ pred.predictedScore.home }}</span>
                  <span class="flex items-center gap-1">
                    {{ pred.homeTeam.abbr }}
                    <img :src="pred.homeTeam.logoUrl" :alt="pred.homeTeam.abbr" class="w-4 h-4 object-contain" />
                  </span>
                </div>
              </div>
              <div class="p-2.5 space-y-1">
                <div class="text-[10px] font-bold text-emerald-400 truncate">{{ pred.expertPick }}</div>
                <div class="text-xs font-bold text-slate-200 group-hover:text-amber-300 line-clamp-2 leading-snug">
                  {{ pred.awayTeam.shortName }} vs. {{ pred.homeTeam.shortName }}
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>

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
