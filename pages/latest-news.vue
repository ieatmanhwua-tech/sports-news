<script setup lang="ts">
import type { Article } from '~/shared/types';
import ArticleCard from '~/components/ArticleCard.vue';
import EditorialSidebar from '~/components/EditorialSidebar.vue';
import LeagueFilterBar from '~/components/LeagueFilterBar.vue';
import { ChevronLeft, ChevronRight, Newspaper, FileQuestion } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const selectedLeague = ref<string>(String(route.query.league || 'all'));
const pageNum = computed(() => Math.max(1, Number(route.query.page || 1)));

const { data, refresh } = await useAsyncData(`latest-news-${pageNum.value}-${selectedLeague.value}`, async () => {
  const query: Record<string, any> = {
    page: pageNum.value,
    limit: 12
  };
  if (selectedLeague.value && selectedLeague.value !== 'all') {
    query.category = selectedLeague.value;
  }
  return await $fetch<{
    articles: Article[];
    total: number;
    page: number;
    totalPages: number;
  }>('/api/articles', { query });
});

const articles = computed(() => data.value?.articles || []);
const total = computed(() => data.value?.total || 0);
const totalPages = computed(() => data.value?.totalPages || 1);

function handleLeagueChange(leagueId: string) {
  selectedLeague.value = leagueId;
  router.push({
    path: '/latest-news',
    query: {
      ...(leagueId !== 'all' ? { league: leagueId } : {}),
      page: 1
    }
  });
  refresh();
}

watch(() => route.query.league, (newVal) => {
  selectedLeague.value = String(newVal || 'all');
  refresh();
});

const config = useRuntimeConfig();
const siteUrl = computed(() => (config.public.siteUrl || 'https://tipoffph.com').replace(/\/$/, ''));
const canonicalUrl = computed(() => `${siteUrl.value}/latest-news`);

const latestNewsSchema = computed(() => {
  return [
    {
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
          'name': 'Latest Basketball News',
          'item': canonicalUrl.value
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'Latest Philippine Basketball News & Wire',
      'url': canonicalUrl.value,
      'description': 'Continuous real-time stream of Philippine basketball news, PBA updates, collegiate scores, and international Filipino hoops.'
    }
  ];
});

useHead({
  title: 'Latest Philippine Basketball News & Wire | TipOffPh',
  meta: [
    { name: 'description', content: 'Continuous real-time stream of Philippine basketball news, PBA updates, collegiate scores, and international Filipino hoops on TipOffPh.' },
    { property: 'og:title', content: 'Latest Philippine Basketball News & Wire | TipOffPh' },
    { property: 'og:description', content: 'Continuous real-time stream of Philippine basketball news, PBA updates, collegiate scores, and international Filipino hoops on TipOffPh.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` },
    { property: 'og:site_name', content: 'TipOffPh' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Latest Philippine Basketball News & Wire | TipOffPh' },
    { name: 'twitter:description', content: 'Continuous real-time stream of Philippine basketball news, PBA updates, collegiate scores, and international Filipino hoops on TipOffPh.' },
    { name: 'twitter:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify(latestNewsSchema.value)
    }
  ]
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header (Dark Arena Glassmorphic) -->
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <!-- Ambient light flare -->
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />
      <div class="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />

      <div class="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-sm">
        <Newspaper class="w-4 h-4 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        <span>Latest News &amp; Wire</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
        Latest Basketball News
      </h1>
      <p class="mt-2 text-sm text-slate-300">
        Chronological news updates across all Philippine leagues, national teams, and collegiate tournaments.
      </p>

      <!-- League Filter Bar component in interactive filter mode -->
      <LeagueFilterBar 
        v-model="selectedLeague" 
        mode="filter"
        class="mt-6 border-t border-slate-800/80 pt-4"
        @change="handleLeagueChange"
      />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-8">
        <div v-if="articles.length > 0">
          <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] divide-y divide-slate-800/80 ring-1 ring-cyan-500/20">
            <ArticleCard 
              v-for="art in articles" 
              :key="art.id" 
              :article="art"
              layout="horizontal"
              class="py-5 first:pt-0 last:pb-0"
            />
          </div>

          <!-- Pagination -->
          <nav v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-800/80 pt-6 px-2 mt-6">
            <NuxtLink 
              v-if="pageNum > 1"
              :to="{ path: '/latest-news', query: { ...(selectedLeague !== 'all' ? { league: selectedLeague } : {}), page: pageNum - 1 } }"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft class="w-4 h-4 text-orange-400" /> Previous
            </NuxtLink>
            <div v-else></div>

            <div class="text-xs text-slate-400">
              Page <span class="font-black text-white">{{ pageNum }}</span> of <span class="font-black text-white">{{ totalPages }}</span>
            </div>

            <NuxtLink 
              v-if="pageNum < totalPages"
              :to="{ path: '/latest-news', query: { ...(selectedLeague !== 'all' ? { league: selectedLeague } : {}), page: pageNum + 1 } }"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            >
              Next <ChevronRight class="w-4 h-4 text-orange-400" />
            </NuxtLink>
          </nav>
        </div>

        <!-- Empty State when league has no articles -->
        <div v-else class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <FileQuestion class="w-10 h-10 text-orange-400 mx-auto mb-3 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
          <h2 class="text-base font-bold text-white">No Stories Found for This Filter</h2>
          <p class="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            There are currently no published stories matching this league category.
          </p>
          <button 
            type="button" 
            @click="handleLeagueChange('all')"
            class="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
          >
            Show All Leagues
          </button>
        </div>
      </div>

      <div class="lg:col-span-4">
        <EditorialSidebar />
      </div>
    </div>
  </div>
</template>
