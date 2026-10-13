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

useHead({
  title: 'Latest Philippine Basketball News & Wire | TipOffPh',
  meta: [
    { name: 'description', content: 'Continuous real-time stream of Philippine basketball news, PBA updates, collegiate scores, and international Filipino hoops.' },
    { property: 'og:title', content: 'Latest Philippine Basketball News & Wire | TipOffPh' }
  ]
});
</script>

<template>
  <div>
    <!-- Header -->
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-6 shadow-sm">
      <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#D35400]">
        <Newspaper class="w-4 h-4" />
        <span>Latest News</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
        Latest Basketball News
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        Chronological news updates across all Philippine leagues, national teams, and collegiate tournaments.
      </p>

      <!-- League Filter Bar component in interactive filter mode -->
      <LeagueFilterBar 
        v-model="selectedLeague" 
        mode="filter"
        class="mt-6 border-t border-slate-100 pt-4"
        @change="handleLeagueChange"
      />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-8">
        <div v-if="articles.length > 0">
          <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm divide-y divide-slate-100">
            <ArticleCard 
              v-for="art in articles" 
              :key="art.id" 
              :article="art"
              layout="horizontal"
              class="py-5 first:pt-0 last:pb-0"
            />
          </div>

          <!-- Pagination -->
          <nav v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-200 pt-6 px-2 mt-6">
            <NuxtLink 
              v-if="pageNum > 1"
              :to="{ path: '/latest-news', query: { ...(selectedLeague !== 'all' ? { league: selectedLeague } : {}), page: pageNum - 1 } }"
              class="inline-flex items-center gap-1 px-3 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
            >
              <ChevronLeft class="w-4 h-4" /> Previous
            </NuxtLink>
            <div v-else></div>

            <div class="text-xs text-slate-500">
              Page <span class="font-bold text-slate-900">{{ pageNum }}</span> of <span class="font-bold text-slate-900">{{ totalPages }}</span>
            </div>

            <NuxtLink 
              v-if="pageNum < totalPages"
              :to="{ path: '/latest-news', query: { ...(selectedLeague !== 'all' ? { league: selectedLeague } : {}), page: pageNum + 1 } }"
              class="inline-flex items-center gap-1 px-3 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
            >
              Next <ChevronRight class="w-4 h-4" />
            </NuxtLink>
          </nav>
        </div>

        <!-- Empty State when league has no articles -->
        <div v-else class="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
          <FileQuestion class="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 class="text-base font-bold text-slate-800">No Stories Found for This Filter</h2>
          <p class="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            There are currently no published stories matching this league category.
          </p>
          <button 
            type="button" 
            @click="handleLeagueChange('all')"
            class="mt-4 px-4 py-2 bg-[#E67E22] text-white font-bold text-xs rounded hover:bg-amber-600 transition-colors"
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
