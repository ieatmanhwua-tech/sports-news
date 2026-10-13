<script setup lang="ts">
import type { Article } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';

defineProps<{
  article: Article;
}>();

const { formatManilaDate } = useFormatters();
</script>

<template>
  <article class="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <!-- Featured Lead Image -->
    <NuxtLink :to="`/news/${article.slug}`" class="block aspect-video w-full overflow-hidden bg-slate-900 relative">
      <img 
        :src="article.featuredImageUrl" 
        :alt="article.imageAlt || article.title"
        loading="eager"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
    </NuxtLink>

    <!-- Content and Byline -->
    <div class="p-5 sm:p-7 bg-white">
      <!-- Unboxed Kicker -->
      <div class="flex items-center gap-2 text-xs font-semibold mb-2.5">
        <NuxtLink 
          :to="`/${article.primaryCategoryId}`" 
          class="font-bold text-[#D35400] hover:text-amber-700 tracking-wider uppercase text-xs"
        >
          {{ article.category?.name || 'Featured Story' }}
        </NuxtLink>
        <span class="text-slate-300" aria-hidden="true">·</span>
        <span class="text-slate-500 text-xs">{{ formatManilaDate(article.publishedAt) }}</span>
      </div>

      <!-- Headline -->
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 group-hover:text-[#D35400] transition-colors leading-tight mb-3">
        <NuxtLink :to="`/news/${article.slug}`" class="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500">
          {{ article.title }}
        </NuxtLink>
      </h2>

      <!-- Excerpt -->
      <p class="text-sm sm:text-base text-slate-700 leading-relaxed">
        {{ article.excerpt }}
      </p>

      <!-- Byline & Read Full Report link -->
      <div class="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
        <div v-if="article.author" class="flex items-center gap-2">
          <img 
            v-if="article.author.avatarUrl" 
            :src="article.author.avatarUrl" 
            :alt="article.author.name" 
            class="w-6 h-6 rounded-full object-cover shrink-0"
          />
          <span>By 
            <NuxtLink :to="`/authors/${article.author.slug}`" class="font-bold text-slate-900 hover:text-[#D35400]">
              {{ article.author.name }}
            </NuxtLink>
          </span>
          <span class="text-slate-400">({{ article.author.role }})</span>
        </div>

        <NuxtLink 
          :to="`/news/${article.slug}`" 
          class="font-bold text-[#D35400] hover:text-amber-700 inline-flex items-center gap-1"
        >
          Read Full Report &rarr;
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
