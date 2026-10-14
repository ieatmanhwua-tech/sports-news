<script setup lang="ts">
import type { Article, Author } from '~/shared/types';
import ArticleCard from '~/components/ArticleCard.vue';
import { Mail, Twitter, Newspaper } from 'lucide-vue-next';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));

const { data, error } = await useAsyncData(`author-${slug.value}`, async () => {
  return await $fetch<{
    author: Author;
    articles: Article[];
    total: number;
  }>(`/api/authors/${slug.value}`);
});

if (error.value || !data.value?.author) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Author Not Found',
    fatal: true
  });
}

const author = computed(() => data.value!.author);
const articles = computed(() => data.value?.articles || []);

useHead({
  title: `${author.value.name} - Author Profile | TipOffPh`,
  meta: [
    { name: 'description', content: author.value.bio },
    { property: 'og:title', content: `${author.value.name} - Author Profile | TipOffPh` },
    { property: 'og:description', content: author.value.bio }
  ]
});
</script>

<template>
  <div class="max-w-5xl mx-auto py-2 space-y-6">
    <!-- Author Bio Card (Dark Glassmorphic) -->
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row items-start sm:items-center gap-6 ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />
      <img 
        :src="author.avatarUrl" 
        :alt="author.name" 
        class="w-24 h-24 rounded-full object-cover border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] shrink-0"
      />

      <div class="space-y-2 relative z-10">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase tracking-wider text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
            {{ author.role }}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
          {{ author.name }}
        </h1>

        <p class="text-sm text-slate-300 leading-relaxed max-w-2xl">
          {{ author.bio }}
        </p>

        <div class="pt-2 flex items-center gap-4 text-xs text-slate-400">
          <span v-if="author.twitterHandle" class="flex items-center gap-1 text-cyan-300 font-bold">
            <Twitter class="w-3.5 h-3.5 text-cyan-400" />
            {{ author.twitterHandle }}
          </span>
          <span class="flex items-center gap-1">
            <Mail class="w-3.5 h-3.5 text-slate-400" />
            {{ author.email }}
          </span>
        </div>
      </div>
    </header>

    <!-- Articles by Author -->
    <section>
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
        <h2 class="text-base font-black text-white flex items-center gap-2 drop-shadow-sm">
          <Newspaper class="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
          <span>Stories by {{ author.name }} ({{ data?.total || 0 }})</span>
        </h2>
      </div>

      <div v-if="articles.length > 0" class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] divide-y divide-slate-800/80 ring-1 ring-cyan-500/20">
        <ArticleCard 
          v-for="art in articles" 
          :key="art.id" 
          :article="art" 
          layout="horizontal"
          class="py-5 first:pt-0 last:pb-0"
        />
      </div>

      <div v-else class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-8 text-center text-slate-400 text-sm shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        No published articles found for this author.
      </div>
    </section>
  </div>
</template>
