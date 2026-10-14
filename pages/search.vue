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
  <div class="max-w-4xl mx-auto py-2 space-y-6">
    <!-- Search Bar Box (Dark Arena Glassmorphic) -->
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <h1 class="text-2xl font-black text-white tracking-tight mb-4 drop-shadow-sm flex items-center gap-2">
        <Search class="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
        <span>Search TipOffPh</span>
      </h1>

      <form @submit.prevent="executeSearch" class="flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1">
          <input 
            v-model="searchInput"
            type="text" 
            placeholder="Search keywords, players (e.g. Fajardo, Sotto), teams, tournaments..."
            class="w-full bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        <button 
          type="submit" 
          class="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] shrink-0"
        >
          Search
        </button>
      </form>

      <div v-if="currentQuery" class="mt-4 text-xs text-slate-400">
        Found <strong class="text-amber-300 font-black">{{ total }}</strong> results for "<span class="text-white font-bold">{{ currentQuery }}</span>"
      </div>
    </header>

    <!-- Results Section -->
    <section>
      <div v-if="articles.length > 0" class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] divide-y divide-slate-800/80 ring-1 ring-cyan-500/20">
        <ArticleCard 
          v-for="art in articles" 
          :key="art.id" 
          :article="art"
          layout="horizontal"
          class="py-5 first:pt-0 last:pb-0"
        />
      </div>

      <!-- Helpful Empty State -->
      <div v-else-if="currentQuery" class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-12 text-center shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div class="w-12 h-12 bg-slate-800/80 border border-slate-700 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">
          <Frown class="w-6 h-6" />
        </div>
        <h2 class="text-lg font-bold text-white">No Stories Match Your Search</h2>
        <p class="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          We couldn't find any published stories matching "<span class="font-bold text-amber-300">{{ currentQuery }}</span>". Try searching for league names (PBA, MPBL, UAAP) or team names.
        </p>
      </div>

      <div v-else class="text-center py-12 text-slate-400 text-sm">
        Type a query above to search our published archives.
      </div>
    </section>
  </div>
</template>
