<script setup lang="ts">
import type { Article } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';
import { getSvgBlogArticleCover } from '~/shared/image-resolver';

const props = withDefaults(defineProps<{
  article: Article;
  layout?: 'horizontal' | 'vertical' | 'compact';
  showExcerpt?: boolean;
}>(), {
  layout: 'vertical',
  showExcerpt: true
});

const { formatRelativeTime } = useFormatters();

function onArticleImgError(e: Event) {
  const img = e.target as HTMLImageElement | null;
  if (!img) return;
  const parts = String(props.article.title || '').split(/\s+vs\.?\s+|\s+Defeat\s+|\s+Outduels\s+|\s+Edge\s+/i);
  const away = (parts[0] || props.article.category?.name || 'TipOff PH').replace(/^LIVE BLOG:\s*/i, '').slice(0, 22).trim();
  const home = (parts[1] || 'Official Coverage').split(/[:(—]/)[0]?.slice(0, 22).trim() || 'Basketball';
  img.src = getSvgBlogArticleCover({
    awayTeam: away,
    homeTeam: home,
    league: props.article.category?.name || 'BASKETBALL'
  });
}

// Map content types to subtle editorial kicker text
const contentTypeLabel = computed(() => {
  switch (props.article.contentType) {
    case 'rumor': return 'Attributed Rumor';
    case 'editorial': return 'Editorial / Opinion';
    case 'interview': return '1-on-1 Interview';
    default: return '';
  }
});
</script>

<template>
  <article 
    class="group flex transition-colors"
    :class="{
      'flex-col space-y-3': layout === 'vertical',
      'flex-col sm:flex-row gap-4 items-start': layout === 'horizontal',
      'flex-row gap-3 items-center': layout === 'compact'
    }"
  >
    <!-- Card Thumbnail -->
    <NuxtLink 
      :to="`/news/${article.slug}`" 
      class="block overflow-hidden rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 relative aspect-video shadow-sm"
      :class="{
        'w-full': layout === 'vertical',
        'w-full sm:w-48 lg:w-56': layout === 'horizontal',
        'w-24 h-18': layout === 'compact'
      }"
    >
      <img 
        :src="article.featuredImageUrl" 
        :alt="article.imageAlt || article.title"
        loading="lazy"
        referrerpolicy="no-referrer"
        @error="onArticleImgError"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </NuxtLink>

    <!-- Card Content -->
    <div class="flex-1 min-w-0">
      <!-- Unboxed Metadata Kicker (Anti-Slop Zero-Pill discipline) -->
      <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 flex-wrap">
        <NuxtLink 
          :to="`/${article.primaryCategoryId}`" 
          class="font-black text-orange-400 hover:text-orange-300 tracking-wider uppercase text-[11px] drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]"
        >
          {{ article.category?.name || 'Hoops' }}
        </NuxtLink>
        <template v-if="contentTypeLabel">
          <span class="text-slate-500" aria-hidden="true">·</span>
          <span class="font-medium text-slate-300 italic text-[11px]">{{ contentTypeLabel }}</span>
        </template>
        <span class="text-slate-500" aria-hidden="true">·</span>
        <time :datetime="article.publishedAt" class="text-slate-400 text-[11px]">
          {{ formatRelativeTime(article.publishedAt) }}
        </time>
      </div>

      <!-- Article Title -->
      <h3 
        class="font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2"
        :class="{
          'text-base md:text-lg': layout === 'vertical' || layout === 'horizontal',
          'text-sm': layout === 'compact'
        }"
      >
        <NuxtLink :to="`/news/${article.slug}`" class="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500">
          {{ article.title }}
        </NuxtLink>
      </h3>

      <!-- Excerpt (optional) -->
      <p 
        v-if="showExcerpt && layout !== 'compact' && article.excerpt" 
        class="mt-1.5 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed"
      >
        {{ article.excerpt }}
      </p>

      <!-- Byline -->
      <div v-if="layout !== 'compact' && article.author" class="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
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
</template>
