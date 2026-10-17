<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Article } from '~/shared/types';
import { 
  FileText, 
  Plus, 
  Database, 
  ExternalLink, 
  LogOut, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Newspaper,
  Sparkles,
  PenSquare,
  ArrowRight
} from 'lucide-vue-next';

const router = useRouter();
const user = ref<any>(null);
const articles = ref<Article[]>([]);
const dbStatus = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const authRes = await $fetch<{ authenticated: boolean; user: any }>('/api/admin/me');
    user.value = authRes.user;

    const [artRes, statRes] = await Promise.all([
      $fetch<{ articles: Article[] }>('/api/admin/articles'),
      $fetch<any>('/api/status')
    ]);

    articles.value = artRes.articles;
    dbStatus.value = statRes;
  } catch (err: any) {
    router.push('/admin/login');
  } finally {
    isLoading.value = false;
  }
});

async function handleLogout() {
  await $fetch('/api/admin/logout', { method: 'POST' });
  router.push('/admin/login');
}

const publishedCount = computed(() => articles.value.filter(a => a.status === 'published').length);
const draftCount = computed(() => articles.value.filter(a => a.status === 'draft').length);
const scheduledCount = computed(() => articles.value.filter(a => a.status === 'scheduled').length);

useHead({
  title: 'Editorial Dashboard | TipOffPh Admin',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});
</script>

<template>
  <div class="max-w-6xl mx-auto py-4 space-y-6">
    <!-- Admin Top Nav Bar -->
    <div class="bg-[#1e293b] text-slate-300 rounded-lg px-4 sm:px-6 h-12 flex items-center justify-between text-xs shadow-sm">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="flex items-center gap-2 font-bold text-white hover:text-[#E67E22] transition-colors">
          <img src="/img/TipOffPh_logo.png" alt="TipOffPh" class="h-5 w-auto object-contain" />
          <span>CMS</span>
        </NuxtLink>
        <span class="text-slate-600">/</span>
        <nav class="flex items-center gap-3">
          <NuxtLink to="/admin" class="text-amber-400 font-bold transition-colors">Dashboard</NuxtLink>
          <NuxtLink to="/admin/post" class="hover:text-white font-medium transition-colors">Story Publisher</NuxtLink>
          <NuxtLink to="/admin/articles" class="hover:text-white font-medium transition-colors">All Articles</NuxtLink>
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

    <!-- Admin Header Bar -->
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          TP
        </div>
        <div>
          <h1 class="text-xl font-black text-white tracking-tight drop-shadow-sm">Editorial Dashboard</h1>
          <p class="text-xs text-slate-400">
            Welcome, <strong class="text-white">{{ user?.username || 'Editor' }}</strong> (Role: {{ user?.role || 'Staff' }})
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 text-xs flex-wrap">
        <NuxtLink 
          to="/admin/post"
          class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]"
        >
          <PenSquare class="w-4 h-4" /> Story Publisher
        </NuxtLink>

        <NuxtLink 
          to="/admin/settings"
          class="px-3.5 py-2 border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Settings class="w-4 h-4 text-cyan-400" /> DB &amp; Hostinger
        </NuxtLink>

        <button 
          type="button" 
          @click="handleLogout"
          class="px-3.5 py-2 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold rounded-xl flex items-center gap-1 transition-colors"
        >
          <LogOut class="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </header>

    <!-- Database Status Card -->
    <div 
      class="rounded-xl p-4 text-xs border flex items-center justify-between gap-4 backdrop-blur-md"
      :class="{
        'bg-slate-900/90 border-slate-700/80 text-slate-300': dbStatus?.mode !== 'MYSQL' && dbStatus?.mode !== 'ERROR',
        'bg-emerald-950/60 border-emerald-500/40 text-emerald-200': dbStatus?.mode === 'MYSQL',
        'bg-red-950/60 border-red-500/40 text-red-200': dbStatus?.mode === 'ERROR'
      }"
    >
      <div class="flex items-center gap-2.5">
        <Database class="w-4 h-4 shrink-0 text-cyan-400" />
        <div>
          <span class="font-black uppercase tracking-wider mr-2 text-[10px] px-2 py-0.5 rounded-full"
            :class="dbStatus?.mode === 'MYSQL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'"
          >
            {{ dbStatus?.mode === 'MYSQL' ? 'MYSQL LIVE' : 'ACTIVE DATA ENGINE' }}
          </span>
          <span>{{ dbStatus?.message }}</span>
        </div>
      </div>

      <NuxtLink to="/admin/settings" class="text-amber-400 hover:text-amber-300 underline font-bold shrink-0">
        Hostinger Setup Details &rarr;
      </NuxtLink>
    </div>

    <!-- Quick Stats Metric Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Articles</div>
        <div class="text-2xl font-black text-white mt-1">{{ articles.length }}</div>
      </div>
      <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Published</div>
        <div class="text-2xl font-black text-emerald-300 mt-1">{{ publishedCount }}</div>
      </div>
      <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-wider">Drafts</div>
        <div class="text-2xl font-black text-amber-300 mt-1">{{ draftCount }}</div>
      </div>
      <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Scheduled (UTC)</div>
        <div class="text-2xl font-black text-cyan-300 mt-1">{{ scheduledCount }}</div>
      </div>
    </div>

    <!-- Blog Posting Function Hero Launchpad -->
    <section class="bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-md">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div class="space-y-1.5">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E67E22]/20 border border-[#E67E22]/40 text-[#E67E22] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles class="w-3.5 h-3.5" />
            Editorial Newsroom Suite
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            Blog Posting &amp; Story Studio
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Create, format, and syndicate Philippine basketball news, playoff bracket standings, and game recaps with integrated Google SERP preview, photo uploads, and automatic Schema.org indexing.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <NuxtLink 
            to="/admin/post"
            class="px-5 py-2.5 bg-[#E67E22] hover:bg-amber-600 text-white font-black text-xs rounded-lg shadow flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <PenSquare class="w-4 h-4" />
            <span>Launch Posting Studio</span>
          </NuxtLink>
          <NuxtLink 
            to="/admin/articles"
            class="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileText class="w-3.5 h-3.5" />
            <span>Manage All Articles</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Template Starters Grid -->
      <div class="pt-5">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <span>Fast Publishing Presets &amp; Templates:</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <!-- Preset 1: MPBL Playoff Bracket -->
          <NuxtLink 
            to="/admin/post?template=mpbl"
            class="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 rounded-lg p-3.5 flex items-start gap-3 transition-all group"
          >
            <img src="/img/mpbl.png" alt="MPBL" class="w-8 h-8 object-contain shrink-0 bg-white p-1 rounded-lg border border-slate-200 group-hover:scale-110 transition-transform shadow-xs" />
            <div>
              <div class="font-bold text-white group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                <span>MPBL Playoff Bracket</span>
                <ArrowRight class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Pre-configured with today's verified PHT Quarterfinal standings, target SEO keywords, and bracket graphic.
              </div>
            </div>
          </NuxtLink>

          <!-- Preset 2: PBA Governors Cup -->
          <NuxtLink 
            to="/admin/post?template=pba"
            class="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 rounded-lg p-3.5 flex items-start gap-3 transition-all group"
          >
            <img src="/img/pba.png" alt="PBA" class="w-8 h-8 object-contain shrink-0 bg-white p-1 rounded-lg border border-slate-200 group-hover:scale-110 transition-transform shadow-xs" />
            <div>
              <div class="font-bold text-white group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                <span>PBA Game Recaps</span>
                <ArrowRight class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Structured Governor’s Cup game report template with quarter breakdowns and quote blocks.
              </div>
            </div>
          </NuxtLink>

          <!-- Preset 3: Trade Wire Bulletin -->
          <NuxtLink 
            to="/admin/post?template=trade"
            class="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 rounded-lg p-3.5 flex items-start gap-3 transition-all group"
          >
            <div class="w-8 h-8 rounded bg-amber-500/20 text-[#E67E22] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
              🔄
            </div>
            <div>
              <div class="font-bold text-white group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                <span>Trade Wire &amp; Rumors</span>
                <ArrowRight class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Fast transaction bulletin format with trade breakdown bullets and insider sources.
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Recent Editorial Queue Table -->
    <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)] ring-1 ring-cyan-500/20">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h2 class="text-base font-black text-white flex items-center gap-2 drop-shadow-sm">
          <FileText class="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
          <span>Editorial Queue &amp; Articles</span>
        </h2>
        <NuxtLink to="/admin/articles" class="text-xs text-orange-400 hover:text-orange-300 hover:underline font-bold">
          Manage All &rarr;
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th class="py-2.5 px-3">Title &amp; Category</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Type</th>
              <th class="py-2.5 px-3">Published Date (UTC)</th>
              <th class="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr v-for="art in articles.slice(0, 8)" :key="art.id" class="hover:bg-slate-800/50 transition-colors">
              <td class="py-3 px-3">
                <div class="font-bold text-white truncate max-w-md">{{ art.title }}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">/news/{{ art.slug }}</div>
              </td>
              <td class="py-3 px-3">
                <span 
                  class="font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full border"
                  :class="{
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': art.status === 'published',
                    'bg-amber-500/20 text-amber-300 border-amber-500/40': art.status === 'draft',
                    'bg-sky-500/20 text-sky-300 border-sky-500/40': art.status === 'scheduled',
                    'bg-slate-800 text-slate-400 border-slate-700': art.status === 'archived'
                  }"
                >
                  {{ art.status }}
                </span>
              </td>
              <td class="py-3 px-3 capitalize text-slate-300">{{ art.contentType }}</td>
              <td class="py-3 px-3 text-slate-400 font-mono text-[11px]">{{ art.publishedAt }}</td>
              <td class="py-3 px-3 text-right space-x-2">
                <NuxtLink :to="`/admin/articles/${art.id}`" class="text-orange-400 font-bold hover:underline">
                  Edit
                </NuxtLink>
                <NuxtLink :to="`/news/${art.slug}`" target="_blank" class="text-slate-400 hover:text-white">
                  Preview
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
