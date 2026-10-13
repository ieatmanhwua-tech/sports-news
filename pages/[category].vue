<script setup lang="ts">
import { getCategoryBySlug } from '~/shared/categories';
import type { Article, ContentType } from '~/shared/types';
import ArticleCard from '~/components/ArticleCard.vue';
import EditorialSidebar from '~/components/EditorialSidebar.vue';
import AdUnit from '~/components/AdUnit.vue';
import { ChevronLeft, ChevronRight, FileQuestion } from 'lucide-vue-next';

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
  <div>
    <!-- Quick League Navigation Bar -->
    <LeagueFilterBar mode="navigate" class="mb-6" />

    <!-- Archive Category Header -->
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-sm">
      <div class="max-w-3xl">
        <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#D35400]">
          <span>Archive Feed</span>
          <span class="text-slate-300">·</span>
          <span>{{ category.sectionGroup.replace('-', ' ') }}</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
          {{ category.name }}
        </h1>
        <p class="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          {{ category.description }}
        </p>

        <!-- Functional Filter Tabs (Buttons allowed for interactive filtering) -->
        <div class="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 text-xs">
          <span class="text-slate-500 font-medium mr-2">Filter content:</span>
          <button 
            type="button" 
            @click="handleFilter('all')"
            class="px-3 py-1.5 rounded font-medium transition-colors"
            :class="selectedContentType === 'all' ? 'bg-[#E67E22] text-white shadow-sm font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          >
            All Stories
          </button>
          <button 
            type="button" 
            @click="handleFilter('news')"
            class="px-3 py-1.5 rounded font-medium transition-colors"
            :class="selectedContentType === 'news' ? 'bg-[#E67E22] text-white shadow-sm font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          >
            Reported News
          </button>
          <button 
            type="button" 
            @click="handleFilter('rumor')"
            class="px-3 py-1.5 rounded font-medium transition-colors"
            :class="selectedContentType === 'rumor' ? 'bg-[#E67E22] text-white shadow-sm font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          >
            Trade Rumors
          </button>
          <button 
            type="button" 
            @click="handleFilter('editorial')"
            class="px-3 py-1.5 rounded font-medium transition-colors"
            :class="selectedContentType === 'editorial' ? 'bg-[#E67E22] text-white shadow-sm font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          >
            Editorials
          </button>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Article List Column -->
      <div class="lg:col-span-8">
        <!-- If Articles Exist -->
        <div v-if="articles.length > 0" class="space-y-6">
          <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm divide-y divide-slate-100">
            <ArticleCard 
              v-for="art in articles" 
              :key="art.id" 
              :article="art"
              layout="horizontal"
              class="py-5 first:pt-0 last:pb-0"
            />
          </div>

          <!-- Crawlable Pagination with Real Anchor Links -->
          <nav v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-200 pt-6 px-2" aria-label="Pagination">
            <div>
              <NuxtLink 
                v-if="pageNum > 1"
                :to="pageNum === 2 ? category.path : `${category.path}?page=${pageNum - 1}`"
                class="inline-flex items-center gap-1 px-3 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                <ChevronLeft class="w-4 h-4" /> Previous
              </NuxtLink>
            </div>

            <div class="text-xs text-slate-500">
              Page <span class="font-bold text-slate-900">{{ pageNum }}</span> of <span class="font-bold text-slate-900">{{ totalPages }}</span>
              <span class="ml-1 text-slate-400">({{ total }} total stories)</span>
            </div>

            <div>
              <NuxtLink 
                v-if="pageNum < totalPages"
                :to="`${category.path}?page=${pageNum + 1}`"
                class="inline-flex items-center gap-1 px-3 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                Next <ChevronRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </nav>
        </div>

        <!-- Honest Empty State with Noindex notice -->
        <div v-else class="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
          <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileQuestion class="w-6 h-6" />
          </div>
          <h2 class="text-lg font-bold text-slate-800">No Published Stories in This Section Yet</h2>
          <p class="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Our editorial beat reporters are actively curating and preparing verified coverage for <strong class="text-slate-700">{{ category.name }}</strong>. Check back soon for game recaps and updates.
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <NuxtLink to="/latest-news" class="px-4 py-2 bg-[#E67E22] text-white font-bold text-xs rounded hover:bg-amber-600 transition-colors">
              Explore Latest News
            </NuxtLink>
            <NuxtLink to="/" class="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded hover:bg-slate-50 transition-colors">
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
