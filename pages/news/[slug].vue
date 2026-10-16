<script setup lang="ts">
import type { Article } from '~/shared/types';
import { useFormatters } from '~/composables/useFormatters';
import { getSvgBlogArticleCover } from '~/shared/image-resolver';
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
const siteUrl = computed(() => (config.public.siteUrl || 'https://tipoff.bybetcasino.ph').replace(/\/$/, ''));
const canonicalUrl = computed(() => `${siteUrl.value}/news/${article.value.slug}`.toLowerCase());

// Content Type Kicker
const typeBadge = computed(() => {
  switch (article.value.contentType) {
    case 'rumor': return { label: 'Attributed Rumor', desc: 'Sourced from league insiders and subject to team/league confirmation' };
    case 'editorial': return { label: 'Editorial / Opinion', desc: 'Represents the analytical viewpoints of the columnist' };
    case 'interview': return { label: 'Player Interview', desc: 'Direct 1-on-1 on-record conversation' };
    default: return { label: 'Reported News', desc: 'Fact-checked sports reporting' };
  }
});

// JSON-LD Schema.org NewsArticle + BreadcrumbList + Organization
const jsonLd = computed(() => {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'TipOff Bybet PH',
      'url': `${siteUrl.value}/`,
      'logo': `${siteUrl.value}/img/TipOffPh_logo.png`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': `${siteUrl.value}/`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': article.value.category?.name || 'News & Highlights',
          'item': `${siteUrl.value}/${article.value.primaryCategoryId || 'news-highlights/'}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': article.value.title,
          'item': canonicalUrl.value
        }
      ]
    },
    {
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
        'name': article.value.author?.name || 'TipOff PH Staff',
        'url': `${siteUrl.value}/authors/${article.value.author?.slug || 'staff'}`
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'TipOff Bybet PH',
        'logo': {
          '@type': 'ImageObject',
          'url': `${siteUrl.value}/img/TipOffPh_logo.png`
        }
      }
    }
  ];
});

useHead({
  title: article.value.seoTitle || article.value.title,
  meta: [
    { name: 'description', content: article.value.seoDescription || article.value.excerpt },
    { property: 'og:title', content: article.value.seoTitle || article.value.title },
    { property: 'og:description', content: article.value.seoDescription || article.value.excerpt },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:site_name', content: 'TipOff Bybet PH' },
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

function onHeroImgError(e: Event) {
  const img = e.target as HTMLImageElement | null;
  if (!img) return;
  const parts = String(article.value?.title || '').split(/\s+vs\.?\s+|\s+Defeat\s+|\s+Outduels\s+|\s+Edge\s+/i);
  const away = (parts[0] || article.value?.category?.name || 'TipOff PH').replace(/^LIVE BLOG:\s*/i, '').slice(0, 22).trim();
  const home = (parts[1] || 'Official Coverage').split(/[:(—]/)[0]?.slice(0, 22).trim() || 'Basketball';
  img.src = getSvgBlogArticleCover({
    awayTeam: away,
    homeTeam: home,
    league: article.value?.category?.name || 'BASKETBALL'
  });
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-2 space-y-6">
    <!-- Breadcrumbs Navigation -->
    <nav class="flex items-center text-xs text-slate-400 mb-2 overflow-x-auto whitespace-nowrap scrollbar-none touch-pan-x bg-slate-900/60 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800/80" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-amber-300 transition-colors">Home</NuxtLink>
      <ChevronRight class="w-3.5 h-3.5 mx-1 text-slate-600 shrink-0" />
      <NuxtLink 
        v-if="article.category" 
        :to="`/${article.primaryCategoryId}`" 
        class="hover:text-amber-300 transition-colors"
      >
        {{ article.category.name }}
      </NuxtLink>
      <ChevronRight class="w-3.5 h-3.5 mx-1 text-slate-600 shrink-0" />
      <span class="text-slate-200 truncate max-w-[220px] sm:max-w-md">{{ article.title }}</span>
    </nav>

    <!-- Main Glassmorphic Article Container -->
    <article class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-7 md:p-10 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <!-- Ambient light flare -->
      <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />

      <!-- Header Section -->
      <header class="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
        <!-- Content Type & Category Kicker -->
        <div class="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <NuxtLink 
            :to="`/${article.primaryCategoryId}`" 
            class="text-orange-400 hover:text-orange-300 uppercase tracking-wider font-black drop-shadow-sm"
          >
            {{ article.category?.name || 'Basketball' }}
          </NuxtLink>
          <span class="text-slate-600" aria-hidden="true">·</span>
          <span 
            class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs"
            :class="{
              'bg-amber-500/20 text-amber-300 border-amber-500/40': article.contentType === 'rumor',
              'bg-indigo-500/20 text-indigo-300 border-indigo-500/40': article.contentType === 'editorial',
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': article.contentType === 'interview',
              'bg-slate-800 text-slate-300 border-slate-700': article.contentType === 'news'
            }"
          >
            {{ typeBadge.label }}
          </span>
        </div>

        <!-- Single H1 Title -->
        <h1 class="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
          {{ article.title }}
        </h1>

        <!-- Subheadline / Excerpt -->
        <p class="text-sm sm:text-lg text-slate-300 leading-relaxed font-serif italic border-l-2 border-orange-500 pl-3 sm:pl-4 py-1 bg-orange-500/5 rounded-r-lg">
          {{ article.excerpt }}
        </p>

        <!-- Byline & Timestamps Row -->
        <div class="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div class="flex items-center gap-3">
            <img 
              v-if="article.author?.avatarUrl" 
              :src="article.author.avatarUrl" 
              :alt="article.author.name" 
              class="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div>
              <div class="flex items-center gap-1.5 font-bold text-slate-200">
                <NuxtLink :to="`/authors/${article.author?.slug}`" class="hover:text-orange-400 hover:underline">
                  {{ article.author?.name || 'Staff Writer' }}
                </NuxtLink>
                <span v-if="article.author?.role" class="font-normal text-slate-400">
                  ({{ article.author.role }})
                </span>
              </div>
              <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Published {{ formatManilaTime(article.publishedAt) }}</span>
                <span v-if="article.updatedAt" class="text-slate-600">·</span>
                <span v-if="article.updatedAt" class="font-bold text-amber-300">
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
      <figure class="mb-8 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg">
        <img 
          :src="article.featuredImageUrl" 
          :alt="article.imageAlt || article.title" 
          loading="eager"
          referrerpolicy="no-referrer"
          @error="onHeroImgError"
          class="w-full max-h-[500px] object-cover"
        />
        <figcaption class="p-3 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
          <span>{{ article.imageAlt }}</span>
          <span class="text-slate-500 italic">Photo: {{ article.imageCredit }}</span>
        </figcaption>
      </figure>

      <!-- Reading Column (Optimized 680-740px comfortable line length) -->
      <div class="max-w-[720px] mx-auto">
        <!-- Article Body -->
        <div class="prose prose-invert prose-slate max-w-none text-slate-200 leading-relaxed text-base sm:text-lg space-y-5">
          <template v-for="(paragraph, pIdx) in article.body.split('\n\n')" :key="pIdx">
            <!-- Render markdown-like subheadings -->
            <h2 v-if="paragraph.startsWith('### ')" class="text-xl sm:text-2xl font-black text-white mt-8 mb-3 tracking-tight border-b border-slate-800 pb-2">
              {{ paragraph.replace('### ', '') }}
            </h2>
            <h3 v-else-if="paragraph.startsWith('## ')" class="text-lg sm:text-xl font-bold text-white mt-6 mb-2">
              {{ paragraph.replace('## ', '') }}
            </h3>
            <blockquote v-else-if="paragraph.startsWith('> ')" class="border-l-4 border-orange-500 pl-4 italic text-slate-200 my-5 bg-orange-500/10 py-3 rounded-r-lg">
              {{ paragraph.replace('> ', '') }}
            </blockquote>
            <p v-else class="leading-relaxed text-slate-200">
              {{ paragraph }}
            </p>
          </template>
        </div>

        <!-- Source Attribution Reference -->
        <div v-if="article.sourceName || article.sourceUrl" class="mt-8 p-4 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-300">
          <div class="flex items-center gap-1.5 font-bold text-white mb-1">
            <ShieldCheck class="w-4 h-4 text-emerald-400" />
            Reporting Transparency &amp; Sourcing
          </div>
          <p>
            Information in this story was reported by TipOffPh editorial staff and verified against
            <span class="font-bold text-amber-300">{{ article.sourceName || 'official league announcements' }}</span>.
            <a 
              v-if="article.sourceUrl" 
              :href="article.sourceUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-orange-400 hover:text-orange-300 underline inline-flex items-center gap-0.5 ml-1 font-bold"
            >
              Original Reference <ExternalLink class="w-3 h-3" />
            </a>
          </p>
        </div>

        <!-- Mid-article Ad Slot -->
        <div class="my-8">
          <AdUnit format="banner" />
        </div>

        <!-- Post-Game Report / Article Promo Callout Box -->
        <div class="my-8 p-5 rounded-xl bg-gradient-to-r from-slate-950 via-[#17132a] to-slate-950 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <p class="text-sm sm:text-base font-extrabold text-white">
              Ready for the next tip-off? Get the best live basketball odds
            </p>
            <p class="text-xs text-slate-400 mt-0.5">
              Live NBA, PBA, MPBL &amp; collegiate spreads and in-play markets on Bybet PH.
            </p>
          </div>
          <div class="flex items-center gap-2.5 shrink-0">
            <a
              href="https://tipoff.bybetcasino.ph/c6Yv/"
              target="_blank"
              rel="nofollow sponsored noopener"
              title="Bet on Live Games — Play at Bybet"
              class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 transition-all shadow-md whitespace-nowrap"
            >
              Bet Now
            </a>
          </div>
        </div>

        <!-- Bottom Share & Correction Callout -->
        <div class="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <ShareButtons :title="article.title" :url="canonicalUrl" />
          <NuxtLink to="/corrections-policy" class="text-xs text-slate-400 hover:text-slate-200 underline">
            Found an error? View our Corrections Policy
          </NuxtLink>
        </div>

        <!-- Related Stories Grid -->
        <section v-if="related.length > 0" class="mt-12 pt-8 border-t border-slate-800">
          <h3 class="text-lg font-black text-white mb-6 flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]"></span>
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
    </article>
  </div>
</template>
