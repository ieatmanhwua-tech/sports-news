<script setup lang="ts">
import type { Article } from '~/shared/types';
import { Flame, ChevronRight } from 'lucide-vue-next';

defineProps<{
  article: Article | null;
}>();
</script>

<template>
  <div v-if="article" class="bg-amber-600 text-white shadow-sm border-b border-amber-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs sm:text-sm">
      <div class="flex items-center space-x-2 overflow-hidden">
        <span class="inline-flex items-center gap-1 bg-slate-950/40 text-amber-200 uppercase font-black tracking-wider text-[11px] px-2 py-0.5 rounded">
          <Flame class="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          Breaking
        </span>
        <NuxtLink 
          :to="`/news/${article.slug}`"
          class="font-semibold hover:underline truncate text-white"
        >
          {{ article.title }}
        </NuxtLink>
      </div>

      <NuxtLink 
        :to="`/news/${article.slug}`" 
        class="hidden sm:inline-flex items-center gap-0.5 text-xs font-bold text-amber-100 hover:text-white shrink-0 ml-4"
      >
        Read Report
        <ChevronRight class="w-3.5 h-3.5" />
      </NuxtLink>
    </div>
  </div>
</template>
