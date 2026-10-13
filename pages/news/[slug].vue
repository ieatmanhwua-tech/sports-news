<script setup lang="ts">
import type { Article } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';
import ShareButtons from '~/components/ShareButtons.vue';
import ArticleCard from '~/components/ArticleCard.vue';
import AdUnit from '~/components/AdUnit.vue';
import { ChevronRight, Calendar, User, ExternalLink, ShieldCheck, Clock } from 'lucide-vue-next';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const { formatManilaTime, formatManilaDate } = useFormatters();
const config = useRuntimeConfig();

// Fetch article server-side
const { data, error } = await useAsyncData(`article-${slug.value}`, async () => {
  return await $fetch<{
    article?: Article;
    related?: Article[];
    redirect?: boolean;
    statusCode?: number;
    targetUrl?: string;
  }>(`/api/articles/${slug.value}`);
});

// Handle permanent redirect if slug moved
if (data.value?.redirect && data.value?.targetUrl) {
  await navigateTo(data.value.targetUrl, { redirectCode: 301, external: false });
}

if (error.value || !data.value?.article) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article Not Found',
    fatal: true
  });
}

const article = computed(() => data.value!.article!);
const related = computed(() => data.value?.related || []);

// Dynamic URL Resolution
const siteUrl = computed(() => (config.public.siteUrl || '').replace(/\/$/, ''));
const canonicalUrl = computed(() => siteUrl.value ? `${siteUrl.value}/news/${article.value.slug}` : `/news/${article.value.slug}`);

// Content Type Kicker
const typeBadge = computed(() => {
  switch (article.value.contentType) {
    case 'rumor': return { label: 'Attributed Rumor', desc: 'Sourced from league insiders and subject to team/league confirmation' };
    case 'editorial': return { label: 'Editorial / Opinion', desc: 'Represents the analytical viewpoints of the columnist' };
    case 'interview': return { label: 'Player Interview', desc: 'Direct 1-on-1 on-record conversation' };
    default: return { label: 'Reported News', desc: 'Fact-checked sports reporting' };
  }
});

// JSON-LD Schema.org NewsArticle
const jsonLd = computed(() => {
  return {
    '@context': 'https://schema.org',
    '@type': article.value.contentType === 'editorial' ? 'OpinionNewsArticle' : 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl.value
    },
    'headline': article.value.title,
    'description': article.value.excerpt,
    'image': [article.value.featuredImageUrl],
    'datePublished': article.value.publishedAt,
    'dateModified': article.value.updatedAt || article.value.publishedAt,
    'author': {
      '@type': 'Person',
      'name': article.value.author?.name || 'TipOffPh Staff',
      'url': siteUrl.value ? `${siteUrl.value}/authors/${article.value.author?.slug}` : undefined
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'TipOffPh',
      'logo': {
        '@type': 'ImageObject',
        'url': siteUrl.value ? `${siteUrl.value}/logo.png` : undefined
      }
    }
  };
});

useHead({
  title: article.value.seoTitle || article.value.title,
  meta: [
    { name: 'description', content: article.value.seoDescription || article.value.excerpt },
    { property: 'og:title', content: article.value.seoTitle || article.value.title },
    { property: 'og:description', content: article.value.seoDescription || article.value.excerpt },
    { property: 'og:image', content: article.value.featuredImageUrl },
    { property: 'og:type', content: 'article' },
    { property: 'article:published_time', content: article.value.publishedAt },
    { property: 'article:modified_time', content: article.value.updatedAt || article.value.publishedAt },
    { property: 'article:section', content: article.value.category?.name || 'Basketball' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: article.value.title },
    { name: 'twitter:description', content: article.value.excerpt },
    { name: 'twitter:image', content: article.value.featuredImageUrl }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd.value) }
  ]
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-2">
    <!-- Breadcrumbs Navigation -->
    <nav class="flex items-center text-xs text-slate-500 mb-4 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-slate-900 transition-colors">Home</NuxtLink>
      <ChevronRight class="w-3.5 h-3.5 mx-1 text-slate-400 shrink-0" />
      <NuxtLink 
        v-if="article.category" 
        :to="`/${article.primaryCategoryId}`" 
        class="hover:text-slate-900 transition-colors"
      >
        {{ article.category.name }}
      </NuxtLink>
      <ChevronRight class="w-3.5 h-3.5 mx-1 text-slate-400 shrink-0" />
      <span class="text-slate-700 truncate max-w-[280px] sm:max-w-md">{{ article.title }}</span>
    </nav>

    <!-- Header Section -->
    <header class="mb-6 space-y-3">
      <!-- Unboxed Content Type & Category Kicker -->
      <div class="flex items-center gap-2 text-xs font-semibold">
        <NuxtLink 
          :to="`/${article.primaryCategoryId}`" 
          class="text-[#D35400] hover:underline uppercase tracking-wider font-bold"
        >
          {{ article.category?.name || 'Basketball' }}
        </NuxtLink>
        <span class="text-slate-300" aria-hidden="true">·</span>
        <span 
          class="text-xs font-semibold px-2 py-0.5 rounded border"
          :class="{
            'bg-amber-50 text-amber-800 border-amber-200': article.contentType === 'rumor',
            'bg-indigo-50 text-indigo-800 border-indigo-200': article.contentType === 'editorial',
            'bg-emerald-50 text-emerald-800 border-emerald-200': article.contentType === 'interview',
            'bg-slate-100 text-slate-700 border-slate-200': article.contentType === 'news'
          }"
        >
          {{ typeBadge.label }}
        </span>
      </div>

      <!-- Single H1 Title -->
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
        {{ article.title }}
      </h1>

      <!-- Subheadline / Excerpt -->
      <p class="text-base sm:text-lg text-slate-700 leading-relaxed font-serif italic border-l-2 border-[#E67E22] pl-3 py-1">
        {{ article.excerpt }}
      </p>

      <!-- Byline & Timestamps Row -->
      <div class="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div class="flex items-center gap-2.5">
          <img 
            v-if="article.author?.avatarUrl" 
            :src="article.author.avatarUrl" 
            :alt="article.author.name" 
            class="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div>
            <div class="flex items-center gap-1.5 font-bold text-slate-900">
              <NuxtLink :to="`/authors/${article.author?.slug}`" class="hover:text-[#D35400] hover:underline">
                {{ article.author?.name || 'Staff Writer' }}
              </NuxtLink>
              <span v-if="article.author?.role" class="font-normal text-slate-500">
                ({{ article.author.role }})
              </span>
            </div>
            <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Published {{ formatManilaTime(article.publishedAt) }}</span>
              <span v-if="article.updatedAt" class="text-slate-400">·</span>
              <span v-if="article.updatedAt" class="font-medium text-slate-700">
                Updated {{ formatManilaTime(article.updatedAt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Social Share Controls -->
        <ShareButtons 
          :title="article.title" 
          :url="canonicalUrl" 
          class="shrink-0"
        />
      </div>
    </header>

    <!-- Lead Featured Image with Alt and Credit -->
    <figure class="mb-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
      <img 
        :src="article.featuredImageUrl" 
        :alt="article.imageAlt || article.title"
        loading="eager"
        class="w-full max-h-[500px] object-cover"
      />
      <figcaption class="p-2.5 bg-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
        <span>{{ article.imageAlt }}</span>
        <span class="text-slate-500 italic">Photo: {{ article.imageCredit }}</span>
      </figcaption>
    </figure>

    <!-- Reading Column (Optimized 680-740px comfortable line length) -->
    <div class="max-w-[720px] mx-auto">
      <!-- Article Body -->
      <div class="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base sm:text-lg space-y-5">
        <template v-for="(paragraph, pIdx) in article.body.split('\n\n')" :key="pIdx">
          <!-- Render markdown-like subheadings -->
          <h2 v-if="paragraph.startsWith('### ')" class="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-2">
            {{ paragraph.replace('### ', '') }}
          </h2>
          <h3 v-else-if="paragraph.startsWith('## ')" class="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2">
            {{ paragraph.replace('## ', '') }}
          </h3>
          <blockquote v-else-if="paragraph.startsWith('> ')" class="border-l-4 border-[#E67E22] pl-4 italic text-slate-700 my-4 bg-amber-50/50 py-2">
            {{ paragraph.replace('> ', '') }}
          </blockquote>
          <p v-else class="leading-relaxed">
            {{ paragraph }}
          </p>
        </template>
      </div>

      <!-- Source Attribution Reference -->
      <div v-if="article.sourceName || article.sourceUrl" class="mt-8 p-3.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
        <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
          <ShieldCheck class="w-4 h-4 text-emerald-600" />
          Reporting Transparency &amp; Sourcing
        </div>
        <p>
          Information in this story was reported by TipOffPh editorial staff and verified against
          <span class="font-semibold text-slate-800">{{ article.sourceName || 'official league announcements' }}</span>.
          <a 
            v-if="article.sourceUrl" 
            :href="article.sourceUrl" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-[#D35400] underline inline-flex items-center gap-0.5 ml-1"
          >
            Original Reference <ExternalLink class="w-3 h-3" />
          </a>
        </p>
      </div>

      <!-- Mid-article Ad Slot -->
      <div class="my-8">
        <AdUnit format="banner" />
      </div>

      <!-- Bottom Share & Correction Callout -->
      <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <ShareButtons :title="article.title" :url="canonicalUrl" />
        <NuxtLink to="/corrections-policy" class="text-xs text-slate-500 hover:text-slate-800 underline">
          Found an error? View our Corrections Policy
        </NuxtLink>
      </div>

      <!-- Related Stories Grid -->
      <section v-if="related.length > 0" class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <span class="w-2 h-2 bg-[#E67E22] rounded-full"></span>
          Related Stories in {{ article.category?.name || 'Basketball' }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <ArticleCard 
            v-for="rel in related" 
            :key="rel.id" 
            :article="rel"
            layout="vertical"
            :show-excerpt="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>
