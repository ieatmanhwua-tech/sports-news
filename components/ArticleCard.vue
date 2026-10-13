<script setup lang="ts">
import type { Article } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';

const props = withDefaults(defineProps<{
  article: Article;
  layout?: 'horizontal' | 'vertical' | 'compact';
  showExcerpt?: boolean;
}>(), {
  layout: 'vertical',
  showExcerpt: true
});

const { formatRelativeTime } = useFormatters();

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
      class="block overflow-hidden rounded bg-slate-200 shrink-0 relative aspect-video"
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
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </NuxtLink>

    <!-- Card Content -->
    <div class="flex-1 min-w-0">
      <!-- Unboxed Metadata Kicker (Anti-Slop Zero-Pill discipline) -->
      <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 flex-wrap">
        <NuxtLink 
          :to="`/${article.primaryCategoryId}`" 
          class="font-bold text-[#D35400] hover:text-amber-700 tracking-wider uppercase text-[11px]"
        >
          {{ article.category?.name || 'Hoops' }}
        </NuxtLink>
        <template v-if="contentTypeLabel">
          <span class="text-slate-400" aria-hidden="true">·</span>
          <span class="font-medium text-slate-700 italic text-[11px]">{{ contentTypeLabel }}</span>
        </template>
        <span class="text-slate-400" aria-hidden="true">·</span>
        <time :datetime="article.publishedAt" class="text-slate-500 text-[11px]">
          {{ formatRelativeTime(article.publishedAt) }}
        </time>
      </div>

      <!-- Article Title -->
      <h3 
        class="font-bold text-slate-900 group-hover:text-[#D35400] transition-colors leading-snug line-clamp-2"
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
        class="mt-1.5 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed"
      >
        {{ article.excerpt }}
      </p>

      <!-- Byline -->
      <div v-if="layout !== 'compact' && article.author" class="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
        <span>By</span>
        <NuxtLink 
          :to="`/authors/${article.author.slug}`" 
          class="font-medium text-slate-800 hover:text-[#D35400] hover:underline"
        >
          {{ article.author.name }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
