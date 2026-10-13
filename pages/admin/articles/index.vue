<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Article, ArticleStatus } from '~/shared/types';
import { Plus, Search, Trash2, Edit, ExternalLink, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const articles = ref<Article[]>([]);
const searchFilter = ref('');
const statusFilter = ref<ArticleStatus | 'all'>('all');
const isLoading = ref(true);

async function loadArticles() {
  try {
    const res = await $fetch<{ articles: Article[] }>('/api/admin/articles');
    articles.value = res.articles;
  } catch (err) {
    router.push('/admin/login');
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadArticles();
});

async function handleDelete(id: string, title: string) {
  if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
    try {
      await $fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      await loadArticles();
    } catch (err: any) {
      alert('Failed to delete: ' + (err?.data?.message || err?.message));
    }
  }
}

const filteredArticles = computed(() => {
  return articles.value.filter(a => {
    if (statusFilter.value !== 'all' && a.status !== statusFilter.value) {
      return false;
    }
    if (searchFilter.value.trim()) {
      const q = searchFilter.value.toLowerCase().trim();
      return a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
    }
    return true;
  });
});

useHead({
  title: 'Manage Articles | TipOffPh Admin',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});
</script>

<template>
  <div class="max-w-6xl mx-auto py-4 space-y-6">
    <!-- Admin Top Nav Bar -->
    <div class="bg-[#1e293b] text-slate-300 rounded-lg px-4 sm:px-6 h-12 flex items-center justify-between text-xs shadow-sm">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="flex items-center gap-1.5 font-bold text-white hover:text-[#E67E22] transition-colors">
          <span class="w-5 h-5 rounded bg-[#E67E22] text-slate-950 font-black text-[10px] flex items-center justify-center">TP</span>
          <span>TipOffPh CMS</span>
        </NuxtLink>
        <span class="text-slate-600">/</span>
        <nav class="flex items-center gap-3">
          <NuxtLink to="/admin" class="hover:text-white font-medium transition-colors">Dashboard</NuxtLink>
          <NuxtLink to="/admin/post" class="hover:text-white font-medium transition-colors">Story Publisher</NuxtLink>
          <NuxtLink to="/admin/articles" class="text-amber-400 font-bold transition-colors">All Articles</NuxtLink>
          <NuxtLink to="/admin/settings" class="hover:text-white font-medium transition-colors">DB &amp; Hostinger</NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink to="/" target="_blank" class="hover:text-amber-400 text-slate-400 flex items-center gap-1 text-[11px] transition-colors">
          <span>View Public Site</span>
          <ExternalLink class="w-3 h-3" />
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <NuxtLink to="/admin" class="p-2 hover:bg-slate-200 rounded text-slate-600 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-black text-slate-900">Articles Management</h1>
          <p class="text-xs text-slate-500">Filter, edit, schedule, or archive publication stories</p>
        </div>
      </div>

      <NuxtLink 
        to="/admin/post"
        class="px-4 py-2 bg-[#E67E22] hover:bg-amber-600 text-white font-bold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" /> Create New Article
      </NuxtLink>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div class="relative w-full sm:w-72">
        <input 
          v-model="searchFilter"
          type="text" 
          placeholder="Filter by title or slug..."
          class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 pl-8 text-xs focus:outline-none focus:border-[#E67E22]"
        />
        <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
      </div>

      <div class="flex items-center gap-2 text-xs w-full sm:w-auto">
        <span class="text-slate-500 font-medium">Status:</span>
        <button 
          v-for="st in ['all', 'published', 'draft', 'scheduled', 'archived']" 
          :key="st"
          type="button"
          @click="statusFilter = st as any"
          class="px-2.5 py-1 rounded capitalize font-medium transition-colors"
          :class="statusFilter === st ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
        >
          {{ st }}
        </button>
      </div>
    </div>

    <!-- Articles Table -->
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
          <tr>
            <th class="py-3 px-4">Title &amp; URL</th>
            <th class="py-3 px-3">Status</th>
            <th class="py-3 px-3">Category</th>
            <th class="py-3 px-3">Published (UTC)</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="art in filteredArticles" :key="art.id" class="hover:bg-slate-50/80 transition-colors">
            <td class="py-3 px-4 max-w-md">
              <div class="font-bold text-slate-900 truncate">{{ art.title }}</div>
              <div class="text-[11px] text-slate-400 mt-0.5 font-mono">/news/{{ art.slug }}</div>
            </td>
            <td class="py-3 px-3">
              <span 
                class="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded"
                :class="{
                  'bg-emerald-100 text-emerald-800': art.status === 'published',
                  'bg-amber-100 text-amber-800': art.status === 'draft',
                  'bg-sky-100 text-sky-800': art.status === 'scheduled',
                  'bg-slate-100 text-slate-600': art.status === 'archived'
                }"
              >
                {{ art.status }}
              </span>
            </td>
            <td class="py-3 px-3 text-slate-600 uppercase text-[11px] font-semibold">{{ art.primaryCategoryId }}</td>
            <td class="py-3 px-3 font-mono text-[11px] text-slate-500">{{ art.publishedAt }}</td>
            <td class="py-3 px-4 text-right space-x-2">
              <NuxtLink :to="`/admin/articles/${art.id}`" class="text-[#D35400] font-bold hover:underline inline-flex items-center gap-0.5">
                <Edit class="w-3 h-3" /> Edit
              </NuxtLink>
              <button 
                type="button" 
                @click="handleDelete(art.id, art.title)"
                class="text-red-500 hover:text-red-700 inline-flex items-center gap-0.5 ml-2"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredArticles.length === 0">
            <td colspan="5" class="py-8 text-center text-slate-400 text-sm">
              No articles match the current filter.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
