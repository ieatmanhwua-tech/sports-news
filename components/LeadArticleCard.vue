<script setup lang="ts">
import type { Article } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';

defineProps<{
  article: Article;
}>();

const { formatManilaDate } = useFormatters();
</script>

<template>
  <article class="group bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 hover:border-orange-500/50 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_25px_rgba(249,115,22,0.25)] transition-all ring-1 ring-cyan-500/20">
    <!-- Featured Lead Image -->
    <NuxtLink :to="`/news/${article.slug}`" class="block aspect-video w-full overflow-hidden bg-slate-950 relative">
      <img 
        :src="article.featuredImageUrl" 
        :alt="article.imageAlt || article.title"
        loading="eager"
        referrerpolicy="no-referrer"
        @error="(e) => ((e.target as HTMLImageElement).src = '/img/articles/pba-governors-cup-2026.webp')"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0c1222] via-transparent to-transparent pointer-events-none"></div>
    </NuxtLink>

    <!-- Content and Byline -->
    <div class="p-5 sm:p-7">
      <!-- Unboxed Kicker -->
      <div class="flex items-center gap-2 text-xs font-semibold mb-2.5">
        <NuxtLink 
          :to="`/${article.primaryCategoryId}`" 
          class="font-black text-orange-400 hover:text-orange-300 tracking-wider uppercase text-xs drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
        >
          {{ article.category?.name || 'Featured Story' }}
        </NuxtLink>
        <span class="text-slate-600" aria-hidden="true">·</span>
        <span class="text-slate-400 text-xs">{{ formatManilaDate(article.publishedAt) }}</span>
      </div>

      <!-- Headline -->
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-amber-300 transition-colors leading-tight mb-3 drop-shadow-sm">
        <NuxtLink :to="`/news/${article.slug}`" class="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500">
          {{ article.title }}
        </NuxtLink>
      </h2>

      <!-- Excerpt -->
      <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
        {{ article.excerpt }}
      </p>

      <!-- Byline & Read Full Report link -->
      <div class="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div v-if="article.author" class="flex items-center gap-2">
          <img 
            v-if="article.author.avatarUrl" 
            :src="article.author.avatarUrl" 
            :alt="article.author.name" 
            class="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700"
          />
          <span>By 
            <NuxtLink :to="`/authors/${article.author.slug}`" class="font-bold text-slate-200 hover:text-orange-400 transition-colors">
              {{ article.author.name }}
            </NuxtLink>
          </span>
          <span class="text-slate-500">({{ article.author.role }})</span>
        </div>

        <NuxtLink 
          :to="`/news/${article.slug}`" 
          class="font-bold text-orange-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
        >
          Read Full Report &rarr;
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
