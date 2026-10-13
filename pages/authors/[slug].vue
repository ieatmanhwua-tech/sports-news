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
  <div class="max-w-5xl mx-auto py-2">
    <!-- Author Bio Card -->
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <img 
        :src="author.avatarUrl" 
        :alt="author.name" 
        class="w-24 h-24 rounded-full object-cover border-2 border-[#E67E22] shrink-0"
      />

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-[#D35400] bg-orange-50 px-2 py-0.5 rounded">
            {{ author.role }}
          </span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {{ author.name }}
        </h1>

        <p class="text-sm text-slate-600 leading-relaxed max-w-2xl">
          {{ author.bio }}
        </p>

        <div class="pt-2 flex items-center gap-4 text-xs text-slate-500">
          <span v-if="author.twitterHandle" class="flex items-center gap-1 text-slate-700 font-semibold">
            <Twitter class="w-3.5 h-3.5 text-sky-500" />
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
      <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <Newspaper class="w-4 h-4 text-[#E67E22]" />
          Stories by {{ author.name }} ({{ data?.total || 0 }})
        </h2>
      </div>

      <div v-if="articles.length > 0" class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm divide-y divide-slate-100">
        <ArticleCard 
          v-for="art in articles" 
          :key="art.id" 
          :article="art"
          layout="horizontal"
          class="py-5 first:pt-0 last:pb-0"
        />
      </div>

      <div v-else class="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 text-sm">
        No published articles found for this author.
      </div>
    </section>
  </div>
</template>
