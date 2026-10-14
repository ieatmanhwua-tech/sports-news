<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Article } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';
import { 
  ArrowRight, 
  RotateCw, 
  Flame, 
  Clock, 
  BookOpen, 
  AlertCircle,
  Newspaper
} from 'lucide-vue-next';

interface Props {
  title?: string;
  subtitle?: string;
  limit?: number;
  category?: string;
  topic?: string;
  excludeId?: string;
  showFilters?: boolean;
  showExcerpt?: boolean;
  showViewAll?: boolean;
  viewAllLink?: string;
  layout?: 'grid' | 'list' | 'compact';
  columns?: 1 | 2 | 3;
  initialArticles?: Article[];
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Latest News',
  subtitle: 'Fresh updates, scores, and breaking developments across Philippine basketball',
  limit: 6,
  category: '',
  topic: '',
  excludeId: '',
  showFilters: false,
  showExcerpt: true,
  showViewAll: true,
  viewAllLink: '/latest-news',
  layout: 'grid',
  columns: 2,
  initialArticles: undefined
});

const { formatRelativeTime } = useFormatters();

// Filter categories if interactive filters are enabled
const activeCategoryFilter = ref<string>(props.category || 'all');

const filterOptions = [
  { label: 'All Hoops', value: 'all' },
  { label: 'PBA', value: 'pba-news' },
  { label: 'MPBL', value: 'mpbl-news' },
  { label: 'Gilas Pilipinas', value: 'gilas-pilipinas' },
  { label: 'Collegiate (UAAP/NCAA)', value: 'uaap-basketball' }
];

// Async data fetching from /api/articles
const fetchKey = computed(() => 
  `latest-news-comp-${props.limit}-${props.topic}-${activeCategoryFilter.value}-${props.excludeId}`
);

const { data, pending, error, refresh } = await useAsyncData(
  fetchKey.value,
  async () => {
    // If parent passed initialArticles and no filter was applied, use those on initial mount
    if (props.initialArticles && activeCategoryFilter.value === (props.category || 'all')) {
      return { articles: props.initialArticles, total: props.initialArticles.length };
    }

    const queryParams: Record<string, any> = {
      limit: props.limit + (props.excludeId ? 2 : 0) // fetch extra to ensure we have enough after excluding
    };

    if (activeCategoryFilter.value && activeCategoryFilter.value !== 'all') {
      queryParams.category = activeCategoryFilter.value;
    } else if (props.category) {
      queryParams.category = props.category;
    }

    if (props.topic) {
      queryParams.topic = props.topic;
    }

    const res = await $fetch<{ articles: Article[]; total: number }>('/api/articles', {
      query: queryParams
    });

    return res;
  },
  {
    watch: [activeCategoryFilter, () => props.limit, () => props.category, () => props.topic]
  }
);

// Filtered articles excluding excludeId and respecting the limit
const displayArticles = computed<Article[]>(() => {
  const list = data.value?.articles || props.initialArticles || [];
  let filtered = list;
  if (props.excludeId) {
    filtered = filtered.filter(a => a.id !== props.excludeId);
  }
  return filtered.slice(0, props.limit);
});

// Calculate estimated read time from body or excerpt
function getEstimatedReadTime(article: Article): string {
  const text = article.body || article.excerpt || '';
  const wordCount = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

// Fallback image helper
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/img/articles/pba-governors-cup-2026.webp';
}

function handleFilterChange(filterValue: string) {
  activeCategoryFilter.value = filterValue;
}
</script>

<template>
  <section class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] ring-1 ring-cyan-500/20">
    <!-- Header with Title, Action and Optional League Filters -->
    <div class="border-b border-slate-800 pb-4 mb-5">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
            <span class="w-2.5 h-2.5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] rounded-full inline-block"></span>
            {{ title }}
          </h2>
          <p v-if="subtitle" class="text-xs text-slate-400 mt-0.5">
            {{ subtitle }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Refresh button -->
          <button 
            type="button" 
            @click="() => refresh()" 
            class="text-xs text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1 shadow-xs"
            title="Refresh latest basketball news"
            :disabled="pending"
          >
            <RotateCw class="w-3.5 h-3.5 text-orange-400" :class="{ 'animate-spin': pending }" />
            <span class="sr-only sm:not-sr-only text-[11px] font-medium">Refresh</span>
          </button>

          <!-- View all stories link -->
          <NuxtLink 
            v-if="showViewAll" 
            :to="viewAllLink" 
            class="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 group"
          >
            <span>All Stories</span>
            <ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>
      </div>

      <!-- Optional quick category filter tabs -->
      <div v-if="showFilters" class="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          v-for="filter in filterOptions"
          :key="filter.value"
          type="button"
          @click="handleFilterChange(filter.value)"
          class="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border"
          :class="activeCategoryFilter === filter.value 
            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
            : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-cyan-400/50 hover:text-white'"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div 
      v-if="pending && displayArticles.length === 0" 
      class="grid gap-6 animate-pulse"
      :class="{
        'grid-cols-1': columns === 1 || layout === 'list',
        'grid-cols-1 sm:grid-cols-2': columns === 2 && layout !== 'list',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3 && layout !== 'list'
      }"
    >
      <div 
        v-for="n in limit" 
        :key="n" 
        class="flex flex-col space-y-3"
      >
        <div class="aspect-video bg-slate-800 rounded-xl w-full"></div>
        <div class="h-4 bg-slate-800 rounded w-1/3"></div>
        <div class="h-5 bg-slate-800 rounded w-4/5"></div>
        <div class="h-4 bg-slate-850 rounded w-full"></div>
        <div class="h-4 bg-slate-850 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 text-center bg-slate-900/90 rounded-2xl border border-red-500/40 my-4 shadow-lg text-slate-300">
      <AlertCircle class="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p class="text-sm font-bold text-white">Unable to load the latest basketball stories right now</p>
      <p class="text-xs text-slate-400 mt-1">Please check your connection or try again.</p>
      <button 
        type="button" 
        @click="() => refresh()" 
        class="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold rounded-lg hover:from-orange-500 hover:to-amber-500 transition-all shadow-[0_0_12px_rgba(249,115,22,0.4)]"
      >
        <RotateCw class="w-3.5 h-3.5" />
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayArticles.length === 0" class="p-8 text-center bg-slate-900/80 rounded-2xl border border-slate-800">
      <Newspaper class="w-8 h-8 text-slate-500 mx-auto mb-2" />
      <p class="text-sm font-bold text-white">No articles found in this category</p>
      <p class="text-xs text-slate-400 mt-1">Try selecting "All Hoops" or check back shortly for updates.</p>
      <button 
        v-if="activeCategoryFilter !== 'all'"
        type="button" 
        @click="activeCategoryFilter = 'all'" 
        class="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
      >
        View All Articles
      </button>
    </div>

    <!-- Articles Feed: GRID Layout -->
    <div 
      v-else-if="layout === 'grid'" 
      class="grid gap-6"
      :class="{
        'grid-cols-1': columns === 1,
        'grid-cols-1 sm:grid-cols-2': columns === 2,
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3
      }"
    >
      <article 
        v-for="article in displayArticles" 
        :key="article.id"
        class="group flex flex-col justify-between space-y-3 transition-colors"
      >
        <div>
          <!-- Card Thumbnail -->
          <NuxtLink 
            :to="`/news/${article.slug}`" 
            class="block overflow-hidden rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 relative aspect-video shadow-sm"
          >
            <img 
              :src="article.featuredImageUrl" 
              :alt="article.imageAlt || article.title"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="handleImageError"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            <!-- Breaking Badge Overlay (if breaking) -->
            <div 
              v-if="article.isBreaking" 
              class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1"
            >
              <Flame class="w-3 h-3 animate-pulse" />
              Breaking
            </div>
          </NuxtLink>

          <!-- Metadata Kicker -->
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-3 mb-1.5 flex-wrap">
            <NuxtLink 
              :to="`/${article.primaryCategoryId}`" 
              class="font-black text-orange-400 hover:text-orange-300 tracking-wider uppercase text-[11px] drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]"
            >
              {{ article.category?.name || 'Hoops' }}
            </NuxtLink>
            <span class="text-slate-600" aria-hidden="true">·</span>
            <time :datetime="article.publishedAt" class="text-slate-400 text-[11px] flex items-center gap-1">
              <Clock class="w-3 h-3 text-slate-500" />
              {{ formatRelativeTime(article.publishedAt) }}
            </time>
            <span class="text-slate-600" aria-hidden="true">·</span>
            <span class="text-slate-400 text-[11px]">{{ getEstimatedReadTime(article) }}</span>
          </div>

          <!-- Headline -->
          <h3 class="font-bold text-base md:text-lg text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
            <NuxtLink :to="`/news/${article.slug}`" class="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500">
              {{ article.title }}
            </NuxtLink>
          </h3>

          <!-- Excerpt -->
          <p 
            v-if="showExcerpt && article.excerpt" 
            class="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed"
          >
            {{ article.excerpt }}
          </p>
        </div>

        <!-- Footer Byline & Read Link -->
        <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-2">
          <div v-if="article.author" class="flex items-center gap-1.5 truncate mr-2">
            <span class="text-slate-500">By</span>
            <NuxtLink 
              :to="`/authors/${article.author.slug}`" 
              class="font-medium text-slate-200 hover:text-orange-400 hover:underline truncate transition-colors"
            >
              {{ article.author.name }}
            </NuxtLink>
          </div>
          <NuxtLink 
            :to="`/news/${article.slug}`"
            class="text-[11px] font-bold text-orange-400 hover:text-amber-300 shrink-0 inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
          >
            Read <ArrowRight class="w-3 h-3" />
          </NuxtLink>
        </div>
      </article>
    </div>

    <!-- Articles Feed: LIST / HORIZONTAL Layout -->
    <div 
      v-else-if="layout === 'list'" 
      class="divide-y divide-slate-800/80"
    >
      <article 
        v-for="article in displayArticles" 
        :key="article.id"
        class="group py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start transition-colors"
      >
        <!-- Horizontal Thumbnail -->
        <NuxtLink 
          :to="`/news/${article.slug}`" 
          class="block overflow-hidden rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 relative aspect-video w-full sm:w-48 lg:w-56"
        >
          <img 
            :src="article.featuredImageUrl" 
            :alt="article.imageAlt || article.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="handleImageError"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </NuxtLink>

        <!-- Horizontal Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 flex-wrap">
            <NuxtLink 
              :to="`/${article.primaryCategoryId}`" 
              class="font-black text-orange-400 hover:text-orange-300 tracking-wider uppercase text-[11px]"
            >
              {{ article.category?.name || 'Hoops' }}
            </NuxtLink>
            <span class="text-slate-600" aria-hidden="true">·</span>
            <time :datetime="article.publishedAt" class="text-slate-400 text-[11px]">
              {{ formatRelativeTime(article.publishedAt) }}
            </time>
          </div>

          <h3 class="font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
            <NuxtLink :to="`/news/${article.slug}`">
              {{ article.title }}
            </NuxtLink>
          </h3>

          <p 
            v-if="showExcerpt && article.excerpt" 
            class="mt-1.5 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed"
          >
            {{ article.excerpt }}
          </p>

          <div v-if="article.author" class="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span>By</span>
            <NuxtLink 
              :to="`/authors/${article.author.slug}`" 
              class="font-medium text-slate-200 hover:text-orange-400 hover:underline"
            >
              {{ article.author.name }}
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <!-- Articles Feed: COMPACT Layout -->
    <div 
      v-else-if="layout === 'compact'" 
      class="divide-y divide-slate-800/80"
    >
      <article 
        v-for="article in displayArticles" 
        :key="article.id"
        class="group py-3 first:pt-0 last:pb-0 flex items-center gap-3 transition-colors"
      >
        <NuxtLink 
          :to="`/news/${article.slug}`" 
          class="block overflow-hidden rounded-lg bg-slate-800 border border-slate-700/60 shrink-0 relative w-20 h-14"
        >
          <img 
            :src="article.featuredImageUrl" 
            :alt="article.imageAlt || article.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="handleImageError"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </NuxtLink>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
            <span class="font-black text-orange-400 uppercase">{{ article.category?.name || 'Hoops' }}</span>
            <span class="text-slate-600">·</span>
            <span>{{ formatRelativeTime(article.publishedAt) }}</span>
          </div>
          <h4 class="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
            <NuxtLink :to="`/news/${article.slug}`">
              {{ article.title }}
            </NuxtLink>
          </h4>
        </div>
      </article>
    </div>
  </section>
</template>
