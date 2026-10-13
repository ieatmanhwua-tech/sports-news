<script setup lang="ts">
import type { Article } from '~/shared/types';
import ArticleCard from '~/components/ArticleCard.vue';
import { Search, Frown } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const currentQuery = computed(() => String(route.query.q || ''));
const searchInput = ref(currentQuery.value);

const { data, refresh } = await useAsyncData(`search-${currentQuery.value}`, async () => {
  if (!currentQuery.value.trim()) {
    return { articles: [], total: 0 };
  }
  return await $fetch<{ articles: Article[]; total: number }>('/api/articles', {
    query: {
      q: currentQuery.value.trim(),
      limit: 20
    }
  });
});

const articles = computed(() => data.value?.articles || []);
const total = computed(() => data.value?.total || 0);

function executeSearch() {
  if (searchInput.value.trim()) {
    router.push({ path: '/search', query: { q: searchInput.value.trim() } });
  }
}

watch(() => route.query.q, (newQ) => {
  searchInput.value = String(newQ || '');
  refresh();
});

useHead({
  title: currentQuery.value ? `Search: "${currentQuery.value}" | TipOffPh` : 'Search TipOffPh Basketball News',
  meta: [
    { name: 'robots', content: 'noindex, follow' } // Search result pages should not be indexed per technical SEO best practices
  ]
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-2">
    <!-- Search Bar Box -->
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-sm">
      <h1 class="text-2xl font-black text-slate-900 tracking-tight mb-4">
        Search TipOffPh
      </h1>

      <form @submit.prevent="executeSearch" class="flex gap-2">
        <div class="relative flex-1">
          <input 
            v-model="searchInput"
            type="text" 
            placeholder="Search keywords, players (e.g. Fajardo, Sotto), teams, tournaments..."
            class="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
        <button 
          type="submit" 
          class="px-5 py-2.5 bg-[#E67E22] text-white font-bold text-sm rounded-md hover:bg-amber-600 transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      <div v-if="currentQuery" class="mt-3 text-xs text-slate-500">
        Found <strong class="text-slate-900">{{ total }}</strong> results for "<span class="text-slate-800 font-medium">{{ currentQuery }}</span>"
      </div>
    </header>

    <!-- Results Section -->
    <section>
      <div v-if="articles.length > 0" class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm divide-y divide-slate-100">
        <ArticleCard 
          v-for="art in articles" 
          :key="art.id" 
          :article="art"
          layout="horizontal"
          class="py-5 first:pt-0 last:pb-0"
        />
      </div>

      <!-- Helpful Empty State -->
      <div v-else-if="currentQuery" class="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
        <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Frown class="w-6 h-6" />
        </div>
        <h2 class="text-lg font-bold text-slate-800">No Stories Match Your Search</h2>
        <p class="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          We couldn't find any published stories matching "<span class="font-medium text-slate-700">{{ currentQuery }}</span>". Try searching for league names (PBA, MPBL, UAAP) or team names.
        </p>
      </div>

      <div v-else class="text-center py-12 text-slate-400 text-sm">
        Type a query above to search our published archives.
      </div>
    </section>
  </div>
</template>
