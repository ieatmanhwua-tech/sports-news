<script setup lang="ts">
import { getCategoryBySlug } from '~/shared/categories';
import type { Article, ContentType } from '~/shared/types';
import ArticleCard from '~/components/ArticleCard.vue';
import EditorialSidebar from '~/components/EditorialSidebar.vue';
import AdUnit from '~/components/AdUnit.vue';
import LeagueFilterBar from '~/components/LeagueFilterBar.vue';
import { ChevronLeft, ChevronRight, FileQuestion, Tv } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const categorySlug = computed(() => String(route.params.category || ''));
const pageNum = computed(() => Math.max(1, Number(route.query.page || 1)));
const selectedContentType = ref<ContentType | 'all'>('all');

// Verify category in registry
const category = getCategoryBySlug(categorySlug.value);
if (!category) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Category Not Found',
    message: `The category "${categorySlug.value}" is not recognized in the TipOffPh registry.`,
    fatal: true
  });
}

// Fetch articles for this category
const { data, refresh } = await useAsyncData(`cat-${categorySlug.value}-${pageNum.value}`, async () => {
  const query: Record<string, any> = {
    category: categorySlug.value,
    page: pageNum.value,
    limit: 12
  };
  if (selectedContentType.value !== 'all') {
    query.contentType = selectedContentType.value;
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

// Canonical and SEO
const siteUrl = computed(() => (config.public.siteUrl || '').replace(/\/$/, ''));
const canonicalUrl = computed(() => {
  const base = siteUrl.value ? `${siteUrl.value}${category.path}` : category.path;
  return pageNum.value > 1 ? `${base}?page=${pageNum.value}` : base;
});

const shouldNoIndex = computed(() => total.value === 0);

useHead({
  title: category.seoTitle,
  meta: [
    { name: 'description', content: category.seoDescription },
    { property: 'og:title', content: category.seoTitle },
    { property: 'og:description', content: category.seoDescription },
    ...(shouldNoIndex.value ? [{ name: 'robots', content: 'noindex, follow' }] : [])
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ]
});

function handleFilter(type: ContentType | 'all') {
  selectedContentType.value = type;
  refresh();
}
</script>

<template>
  <div class="space-y-6">
    <!-- Quick League Navigation Bar -->
    <LeagueFilterBar mode="navigate" class="mb-6" />

    <!-- Archive Category Header (Dark Arena Glassmorphic) -->
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 mb-6 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />
      <div class="max-w-3xl relative z-10">
        <div class="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-sm">
          <span>Archive Feed</span>
          <span class="text-slate-600">·</span>
          <span>{{ category.sectionGroup.replace('-', ' ') }}</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
          {{ category.name }}
        </h1>
        <p class="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          {{ category.description }}
        </p>

        <!-- Functional Filter Tabs -->
        <div class="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800 text-xs">
          <span class="text-slate-400 font-bold mr-2">Filter content:</span>
          <button 
            type="button" 
            @click="handleFilter('all')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            :class="selectedContentType === 'all' 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'"
          >
            All Stories
          </button>
          <button 
            type="button" 
            @click="handleFilter('news')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            :class="selectedContentType === 'news' 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'"
          >
            Reported News
          </button>
          <button 
            type="button" 
            @click="handleFilter('rumor')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            :class="selectedContentType === 'rumor' 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'"
          >
            Trade Rumors
          </button>
          <button 
            type="button" 
            @click="handleFilter('editorial')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            :class="selectedContentType === 'editorial' 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'"
          >
            Editorials
          </button>
        </div>
      </div>
    </header>

    <!-- Live PH Sports Callout for PBA / MPBL pages -->
    <div 
      v-if="categorySlug === 'pba-news' || categorySlug === 'mpbl-news'"
      class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900/90 to-red-950/90 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-red-500/40 backdrop-blur-xl"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
          <Tv class="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 class="text-sm font-black text-white flex items-center gap-2">
            <span>Official Live Scores &amp; Video Streams Available</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">Live</span>
          </h2>
          <p class="text-xs text-slate-300 mt-0.5">
            Follow {{ category.name }} games in real-time with quarter clocks, live scores &amp; match signals.
          </p>
        </div>
      </div>
      <NuxtLink
        to="/local-sports"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-black rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] shrink-0 self-start sm:self-auto"
      >
        <span>Open Live Sports Hub</span>
        <span>&rarr;</span>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Article List Column -->
      <div class="lg:col-span-8">
        <!-- If Articles Exist -->
        <div v-if="articles.length > 0" class="space-y-6">
          <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] divide-y divide-slate-800/80 ring-1 ring-cyan-500/20">
            <ArticleCard 
              v-for="art in articles" 
              :key="art.id" 
              :article="art"
              layout="horizontal"
              class="py-5 first:pt-0 last:pb-0"
            />
          </div>

          <!-- Crawlable Pagination with Real Anchor Links -->
          <nav v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-800/80 pt-6 px-2" aria-label="Pagination">
            <div>
              <NuxtLink 
                v-if="pageNum > 1"
                :to="pageNum === 2 ? category.path : `${category.path}?page=${pageNum - 1}`"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              >
                <ChevronLeft class="w-4 h-4 text-orange-400" /> Previous
              </NuxtLink>
            </div>

            <div class="text-xs text-slate-400">
              Page <span class="font-black text-white">{{ pageNum }}</span> of <span class="font-black text-white">{{ totalPages }}</span>
              <span class="ml-1 text-slate-500">({{ total }} total stories)</span>
            </div>

            <div>
              <NuxtLink 
                v-if="pageNum < totalPages"
                :to="`${category.path}?page=${pageNum + 1}`"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              >
                Next <ChevronRight class="w-4 h-4 text-orange-400" />
              </NuxtLink>
            </div>
          </nav>
        </div>

        <!-- Honest Empty State with Noindex notice -->
        <div v-else class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <div class="w-12 h-12 bg-slate-800/80 border border-slate-700 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">
            <FileQuestion class="w-6 h-6" />
          </div>
          <h2 class="text-lg font-bold text-white">No Published Stories in This Section Yet</h2>
          <p class="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Our editorial beat reporters are actively curating and preparing verified coverage for <strong class="text-orange-400">{{ category.name }}</strong>. Check back soon for game recaps and updates.
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <NuxtLink to="/latest-news" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">
              Explore Latest News
            </NuxtLink>
            <NuxtLink to="/" class="px-4 py-2 border border-slate-700/80 bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors">
              Return Home
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4">
        <EditorialSidebar />
      </div>
    </div>
  </div>
</template>
