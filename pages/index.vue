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
import { getUniqueMatchImage, handleImageError } from '~/shared/image-resolver';
import { formatGameDateLabelPht } from '~/shared/ph-date';
import { ArrowRight, Flame, Trophy, Globe, GraduationCap, ShieldAlert } from 'lucide-vue-next';

const todayBlogLeagueFilter = ref<'all' | 'nba' | 'pba' | 'mpbl' | 'collegiate'>('all');

// Server-side asynchronous data fetching consolidated into a single fast /api/home-feed call
const { data: homeData, error, refresh: refreshHomeFeed } = await useAsyncData('home-feed', async () => {
  return await $fetch<{
    manilaDate?: string;
    manilaDateLabel?: string;
    breaking: Article | null;
    featured: Article | null;
    latest: Article[];
    pba: Article[];
    mpbl: Article[];
    collegiate: Article[];
    gilas: Article[];
    scores: GameScore[];
  }>('/api/home-feed');
});

let homeBgTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  homeBgTimer = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      void refreshHomeFeed();
    }
  }, 30000);
});

onUnmounted(() => {
  if (homeBgTimer) {
    clearInterval(homeBgTimer);
    homeBgTimer = null;
  }
});

const filteredTodayMatchBlogs = computed(() => {
  const list = homeData.value?.scores || [];
  const f = todayBlogLeagueFilter.value;
  let subset = list;
  if (f === 'nba') subset = list.filter(g => (g.leagueId || g.league).toLowerCase() === 'nba');
  else if (f === 'pba') subset = list.filter(g => (g.leagueId || g.league).toLowerCase() === 'pba');
  else if (f === 'mpbl') subset = list.filter(g => (g.leagueId || g.league).toLowerCase() === 'mpbl');
  else if (f === 'collegiate') {
    subset = list.filter(g => ['uaap', 'ncaa'].includes((g.leagueId || g.league).toLowerCase()));
  }

  const usedImages = new Set<string>();
  return subset.slice(0, 12).map((game) => {
    const resolvedBanner = getUniqueMatchImage(
      {
        id: game.id,
        away_team: game.awayTeam,
        home_team: game.homeTeam,
        league: game.league,
        leagueId: game.leagueId,
        bannerUrl: game.bannerUrl,
        status: game.status === 'final' ? 'finished' : game.status === 'live' ? 'live' : 'scheduled',
        awayScore: game.awayScore ?? 0,
        homeScore: game.homeScore ?? 0,
        clockOrTime: game.statusDetail,
        venue: game.venue
      },
      usedImages
    );
    return {
      ...game,
      bannerUrl: resolvedBanner
    };
  });
});

function getMatchBlogUrl(game: GameScore): string {
  return `/news/${slugifyTeam(game.awayTeam)}-vs-${slugifyTeam(game.homeTeam)}-match-blog-today`;
}

function getResponsiveArticleSrcset(src?: string): string | undefined {
  if (src && src.startsWith('/img/articles/') && src.endsWith('.webp') && !src.endsWith('-640w.webp')) {
    const smallVariant = src.replace(/\.webp$/, '-640w.webp');
    return `${smallVariant} 640w, ${src} 1200w`;
  }
  return undefined;
}

function getMatchBlogHeadline(game: GameScore): string {
  const d = formatGameDateLabelPht(game.gameTimeUtc);
  if (game.status === 'live') {
    return `LIVE BLOG (${d.shortDate}): ${game.awayTeam} vs. ${game.homeTeam} (${game.awayScore ?? 0}–${game.homeScore ?? 0}, ${game.statusDetail})`;
  }
  if (game.status === 'final') {
    const h = game.homeScore ?? 0;
    const a = game.awayScore ?? 0;
    const winner = h >= a ? game.homeTeam : game.awayTeam;
    const loser = h >= a ? game.awayTeam : game.homeTeam;
    return `${winner} Defeat ${loser} ${Math.max(h, a)}–${Math.min(h, a)} (${d.shortDate}): ${game.league} Box Score & Recap`;
  }
  return `${game.awayTeam} vs. ${game.homeTeam} ${game.league} Preview & Prediction (${d.shortDate} · ${d.timePht})`;
}

function getMatchBlogExcerpt(game: GameScore): string {
  const d = formatGameDateLabelPht(game.gameTimeUtc);
  if (game.status === 'live') {
    return `Follow live courtside updates on ${d.fullDate}, quarter-by-quarter scoring, and in-play tactical analysis as ${game.awayTeam} battles ${game.homeTeam} at ${game.venue}.`;
  }
  if (game.status === 'final') {
    return `Full ${d.fullDate} post-game box score recap, quarter breakdown, and top player highlights from ${game.awayTeam} vs. ${game.homeTeam} (${game.awayScore ?? 0}–${game.homeScore ?? 0}) at ${game.venue}.`;
  }
  return `Complete pre-game preview, projected starting lineups, point spread odds, and tactical keys for ${game.awayTeam} vs. ${game.homeTeam} on ${d.fullDate} (${d.timePht}) at ${game.venue}.`;
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
        <!-- TOP OF CONTENT: Updated Today · All Matches Today Blog Coverage -->
        <section v-if="filteredTodayMatchBlogs.length > 0" class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.65)] ring-1 ring-cyan-500/20 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Verified PHT · {{ homeData?.manilaDateLabel || 'Oct 17, 2026' }}
                </span>
                <span class="text-[11px] font-bold text-cyan-300">Exact Game Dates &amp; Live Scoreboard</span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                Match Blogs &amp; Game Schedule: Live Updates, Previews &amp; Recaps
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <article
              v-for="(game, gameIdx) in filteredTodayMatchBlogs"
              :key="`blog-today-${game.id}`"
              class="group flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <!-- News Blog Card Aspect-Video Thumbnail with Uncrowded Broadcast Overlays -->
                <NuxtLink
                  :to="getMatchBlogUrl(game)"
                  class="block overflow-hidden rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 relative aspect-video shadow-sm"
                >
                  <img
                    :src="game.bannerUrl"
                    :srcset="getResponsiveArticleSrcset(game.bannerUrl)"
                    :sizes="getResponsiveArticleSrcset(game.bannerUrl) ? '(max-width: 640px) 100vw, 420px' : undefined"
                    :alt="`${game.awayTeam} vs ${game.homeTeam} ${game.league} Match Blog`"
                    width="640"
                    height="360"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    :loading="gameIdx === 0 ? 'eager' : 'lazy'"
                    :fetchpriority="gameIdx === 0 ? 'high' : 'auto'"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="(e) => handleImageError(e, 'banner', `${game.awayTeam} vs ${game.homeTeam}`, game.league)"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-slate-950/35"></div>

                  <!-- Top Row: TipOff Ph Watermark (Top-Left) + Live/Time Status Pill (Top-Right) -->
                  <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 border border-amber-500/40 text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow backdrop-blur-xs shrink-0">
                      <img
                        src="/img/TipOffPh_logo.webp"
                        alt="TipOff Ph"
                        width="12"
                        height="12"
                        loading="lazy"
                        decoding="async"
                        class="w-3 h-3 object-contain"
                        @error="($event.target as HTMLImageElement).style.display = 'none'"
                      />
                      <span>TipOff Ph</span>
                    </span>

                    <span
                      class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase shadow truncate max-w-[65%]"
                      :class="game.status === 'live'
                        ? 'bg-red-600/95 text-white border border-red-400/50 animate-pulse'
                        : game.status === 'upcoming'
                        ? 'bg-slate-950/85 text-cyan-300 border border-cyan-500/40 backdrop-blur-xs'
                        : 'bg-slate-950/90 text-slate-200 border border-slate-700'"
                    >
                      {{ game.status === 'live' ? `LIVE · ${game.statusDetail.replace(/^LIVE\s*[-·•:]?\s*/i, '')}` : game.statusDetail }}
                    </span>
                  </div>

                  <!-- Bottom Row: Corner Team Logos + Score/VS Badge -->
                  <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
                    <div class="flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/80 rounded-lg px-2 py-1 min-w-0 max-w-[42%] backdrop-blur-xs">
                      <img
                        :src="game.awayTeamLogo || getTeamLogo(game.awayTeam)"
                        :alt="game.awayTeam"
                        class="w-5 h-5 object-contain rounded-xs bg-white p-0.5 shrink-0"
                        loading="lazy"
                        @error="(e) => handleImageError(e, 'logo', game.awayTeam, game.league)"
                      />
                      <span class="text-[10px] sm:text-[11px] font-black text-white truncate">{{ game.awayTeam }}</span>
                    </div>

                    <span class="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-[10px] sm:text-[11px] shrink-0 shadow">
                      {{ game.status === 'upcoming' ? 'VS' : `${game.awayScore ?? 0} – ${game.homeScore ?? 0}` }}
                    </span>

                    <div class="flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/80 rounded-lg px-2 py-1 min-w-0 max-w-[42%] justify-end backdrop-blur-xs">
                      <span class="text-[10px] sm:text-[11px] font-black text-white truncate">{{ game.homeTeam }}</span>
                      <img
                        :src="game.homeTeamLogo || getTeamLogo(game.homeTeam)"
                        :alt="game.homeTeam"
                        class="w-5 h-5 object-contain rounded-xs bg-white p-0.5 shrink-0"
                        loading="lazy"
                        @error="(e) => handleImageError(e, 'logo', game.homeTeam, game.league)"
                      />
                    </div>
                  </div>
                </NuxtLink>

                <!-- News Blog Metadata Kicker (Matches LatestNews / ArticleCard style) -->
                <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-3 mb-1.5 flex-wrap">
                  <span class="font-black text-orange-400 tracking-wider uppercase text-[11px] drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]">
                    {{ game.league }} · {{ formatGameDateLabelPht(game.gameTimeUtc).shortDate }}
                  </span>
                  <span class="text-slate-600" aria-hidden="true">·</span>
                  <span class="text-cyan-300 font-semibold text-[11px]">{{ formatGameDateLabelPht(game.gameTimeUtc).timePht }}</span>
                  <span class="text-slate-600" aria-hidden="true">·</span>
                  <span class="text-slate-400 text-[11px] truncate">{{ game.venue }}</span>
                </div>

                <!-- News Blog Headline -->
                <h3 class="font-bold text-base md:text-lg text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                  <NuxtLink :to="getMatchBlogUrl(game)">
                    {{ getMatchBlogHeadline(game) }}
                  </NuxtLink>
                </h3>

                <!-- News Blog Excerpt -->
                <p class="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {{ getMatchBlogExcerpt(game) }}
                </p>
              </div>

              <!-- News Blog Footer Row -->
              <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] mt-2">
                <NuxtLink
                  :to="getMatchBlogUrl(game)"
                  class="font-bold text-orange-400 hover:text-amber-300 inline-flex items-center gap-1 truncate"
                >
                  <span>Read Full Match Blog</span>
                  <ArrowRight class="w-3 h-3 shrink-0" />
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

        <!-- Lead Hero Story (Editor-selected) -->
        <section v-if="homeData?.featured">
          <LeadArticleCard :article="homeData.featured" />
        </section>

        <!-- Trending News Component with Thumbnails, Excerpts, and Category Filters -->
        <LatestNews 
          :initial-articles="homeData?.latest"
          :exclude-id="homeData?.featured?.id" 
          :limit="6"
          :show-filters="true"
          title="Trending News"
          subtitle="Continuous real-time stream of Philippine basketball updates"
        />

        <!-- NBA Today's Matchup Blogs & Predictions -->
        <section class="bg-gradient-to-br from-[#0b1326] via-[#101c36] to-[#171129] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.65)] space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div class="flex items-center gap-3">
              <img src="/img/nba-logo.webp" alt="NBA" class="w-9 h-9 object-contain" />
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Oct 15, 2026 PHT Slate
                  </span>
                  <span class="text-[11px] font-bold text-amber-300">5 Matchup Blogs &amp; Final Recaps</span>
                </div>
                <h2 class="text-lg sm:text-xl font-black text-white tracking-tight">
                  NBA Preseason Matchup Blogs, Box Scores &amp; Predictions (Oct 15 PHT)
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <article
              v-for="pred in NBA_PRESEASON_PREDICTIONS_TOMORROW"
              :key="pred.id"
              class="group flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <NuxtLink
                  :to="`/nba#${pred.id}`"
                  class="block overflow-hidden rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 relative aspect-video shadow-sm"
                >
                  <img
                    :src="pred.featuredImageUrl"
                    :srcset="getResponsiveArticleSrcset(pred.featuredImageUrl)"
                    :sizes="getResponsiveArticleSrcset(pred.featuredImageUrl) ? '(max-width: 640px) 100vw, 420px' : undefined"
                    :alt="pred.blogTitle"
                    width="640"
                    height="360"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                  <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                    NBA PREDICTION · #0{{ pred.designNumber }}
                  </span>
                  <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs font-black text-white">
                    <span class="flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/80 rounded-lg px-2 py-1">
                      <img :src="pred.awayTeam.logoUrl" :alt="pred.awayTeam.abbr" width="16" height="16" loading="lazy" decoding="async" class="w-4 h-4 object-contain" />
                      {{ pred.awayTeam.shortName }}
                    </span>
                    <span class="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[11px]">{{ pred.predictedScore.away }}–{{ pred.predictedScore.home }}</span>
                    <span class="flex items-center gap-1.5 bg-slate-950/85 border border-slate-700/80 rounded-lg px-2 py-1">
                      {{ pred.homeTeam.shortName }}
                      <img :src="pred.homeTeam.logoUrl" :alt="pred.homeTeam.abbr" width="16" height="16" loading="lazy" decoding="async" class="w-4 h-4 object-contain" />
                    </span>
                  </div>
                </NuxtLink>

                <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-3 mb-1.5 flex-wrap">
                  <span class="font-black text-orange-400 uppercase text-[11px]">NBA · {{ pred.expertPick }}</span>
                  <span class="text-slate-600" aria-hidden="true">·</span>
                  <span class="text-slate-400 text-[11px]">{{ pred.tipOffPht }}</span>
                </div>

                <h3 class="font-bold text-base md:text-lg text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                  <NuxtLink :to="`/nba#${pred.id}`">
                    {{ pred.blogTitle }}
                  </NuxtLink>
                </h3>

                <p class="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {{ pred.shortBlogLead }}
                </p>
              </div>

              <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-2">
                <NuxtLink
                  :to="`/nba#${pred.id}`"
                  class="text-[11px] font-bold text-orange-400 hover:text-amber-300 inline-flex items-center gap-1"
                >
                  <span>Read Prediction</span>
                  <ArrowRight class="w-3 h-3" />
                </NuxtLink>
                <a
                  href="https://tipoff.bybetcasino.ph/c6Yv/"
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  class="px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 transition-all whitespace-nowrap"
                >
                  Bet Now ↗
                </a>
              </div>
            </article>
          </div>
        </section>

        <!-- Mid-page In-Feed Ad -->
        <AdUnit format="banner" class="sm:hidden" />

        <!-- PBA News Blog Cards Section -->
        <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-orange-500/50 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <h2 class="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm">
              <Trophy class="w-5 h-5 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
              <span>PBA Coverage</span>
            </h2>
            <NuxtLink to="/pba-news" class="text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline">
              More PBA &rarr;
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ArticleCard 
              v-for="art in homeData?.pba || []" 
              :key="art.id" 
              :article="art"
              layout="vertical"
              :show-excerpt="true"
            />
          </div>
        </section>

        <!-- MPBL News Blog Cards Section -->
        <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <h2 class="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2 drop-shadow-sm">
              <Flame class="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              <span>MPBL Updates</span>
            </h2>
            <NuxtLink to="/mpbl-news" class="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline">
              More MPBL &rarr;
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ArticleCard 
              v-for="art in homeData?.mpbl || []" 
              :key="art.id" 
              :article="art"
              layout="vertical"
              :show-excerpt="true"
            />
          </div>
        </section>

        <!-- Collegiate & Grassroots Section (UAAP & NCAA) News Blog Cards -->
        <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <h2 class="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
              <GraduationCap class="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
              <span>Collegiate &amp; Grassroots (UAAP &amp; NCAA)</span>
            </h2>
            <NuxtLink to="/uaap-basketball" class="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline">
              Collegiate Hub &rarr;
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ArticleCard 
              v-for="art in homeData?.collegiate || []" 
              :key="art.id" 
              :article="art"
              layout="vertical"
              :show-excerpt="true"
            />
          </div>
        </section>

        <!-- Gilas Pilipinas & International Section News Blog Cards -->
        <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 hover:border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <h2 class="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
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
              :show-excerpt="true"
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
