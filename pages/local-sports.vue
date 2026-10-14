<script setup lang="ts">
import LocalSportsHub from '~/components/LocalSportsHub.vue';
import { Tv, Flame, Trophy, ExternalLink, Calendar, ArrowLeft } from 'lucide-vue-next';

const config = useRuntimeConfig();
const siteUrl = computed(() => (config.public.siteUrl || 'https://tipoffph.com').replace(/\/$/, ''));
const canonicalUrl = computed(() => `${siteUrl.value}/local-sports`);

// Schema.org Structured Data for Local Sports Live Hub (Breadcrumbs, SportsEvent with Live Broadcasts)
const localSportsSchema = computed(() => {
  return [
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
          'name': 'Local Philippine Sports & Live Streams Hub',
          'item': canonicalUrl.value
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      'name': "PBA Governors' Cup & MPBL Philippine Live Hoops",
      'description': "Live sports scores, digital video transmissions, courtside odds, and schedules for PBA Governors' Cup and MPBL on TipOffPh.",
      'startDate': new Date().toISOString(),
      'location': {
        '@type': 'Place',
        'name': 'Smart Araneta Coliseum / Mall of Asia Arena',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Metro Manila',
          'addressCountry': 'PH'
        }
      },
      'eventStatus': 'https://schema.org/EventMovedOnline',
      'broadcastOfEvent': {
        '@type': 'BroadcastEvent',
        'isLiveBroadcast': true,
        'video': {
          '@type': 'VideoObject',
          'name': 'TipOffPh Live Basketball Transmission Relay',
          'description': "Live courtside stream transmission and verified broadcast relay for PBA Governors' Cup and Philippine sports.",
          'embedUrl': `${siteUrl.value}/embed/live`,
          'thumbnailUrl': `${siteUrl.value}/img/TipOffPh_logo.png`,
          'uploadDate': new Date().toISOString()
        }
      }
    }
  ];
});

useHead({
  title: 'Philippine Basketball & Local Sports Live Hub | PBA, MPBL & Streams | TipOffPh',
  meta: [
    {
      name: 'description',
      content: 'Live scores, real-time match results, video transmissions, and betting lines for PBA Governors\' Cup, MPBL, UAAP, and Philippine sports on TipOffPh.'
    },
    { property: 'og:title', content: 'Philippine Basketball & Local Sports Live Hub | PBA, MPBL & Streams | TipOffPh' },
    { property: 'og:description', content: 'Live scores, real-time match results, video transmissions, and betting lines for PBA Governors\' Cup, MPBL, UAAP, and Philippine sports on TipOffPh.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` },
    { property: 'og:site_name', content: 'TipOffPh' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Philippine Basketball & Local Sports Live Hub | PBA, MPBL & Streams | TipOffPh' },
    { name: 'twitter:description', content: 'Live scores, real-time match results, video transmissions, and betting lines for PBA Governors\' Cup and MPBL.' },
    { name: 'twitter:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify(localSportsSchema.value)
    }
  ]
});
</script>

<template>
  <div class="py-2 space-y-6">
    <!-- Breadcrumbs & Navigation -->
    <div class="flex items-center justify-between">
      <NuxtLink
        to="/scores-and-schedules"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md ring-1 ring-cyan-500/20"
      >
        <ArrowLeft class="w-3.5 h-3.5 text-cyan-400" />
        Back to Scores &amp; Schedules
      </NuxtLink>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/nba-odds"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3.5 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <Trophy class="w-3.5 h-3.5 text-amber-400" />
          NBA Odds &amp; Lines
        </NuxtLink>
      </div>
    </div>

    <!-- Hero Header (Dark Glassmorphic Stadium Flare) -->
    <div class="bg-gradient-to-br from-[#120a16]/95 via-[#160c1c]/90 to-[#0d0918]/95 backdrop-blur-xl text-white rounded-2xl p-6 sm:p-8 border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.2),0_10px_35px_rgba(0,0,0,0.7)] relative overflow-hidden ring-1 ring-red-400/20">
      <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-red-600/15 blur-[80px] pointer-events-none" />
      <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-orange-600/15 blur-[80px] pointer-events-none" />
      <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-red-600/30 text-red-300 border border-red-500/40 uppercase tracking-wider mb-3 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
          <Flame class="w-3.5 h-3.5 text-amber-400" />
          Real-Time Philippine &amp; NBA Live Transmission
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 drop-shadow-sm">
          Philippine Sports &amp; NBA Live Center
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          Watch official live video transmissions for NBA marquee games, PBA Governors' Cup games, MPBL matches, UAAP collegiate fixtures, and real-time betting lines with anti-ban sandboxed player protection.
        </p>
      </div>

      <div class="absolute -right-8 -bottom-12 opacity-10 pointer-events-none">
        <Tv class="w-64 h-64 text-white" />
      </div>
    </div>

    <!-- Main Interactive Local Sports Hub -->
    <LocalSportsHub />

    <!-- Explanatory / Context Information (Glassmorphic Cards) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
      <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/80 shadow-md text-slate-300 ring-1 ring-red-500/20">
        <div class="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500/40 text-red-300 flex items-center justify-center font-black mb-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
          1
        </div>
        <h3 class="font-bold text-sm text-white mb-1.5">PBA Governors' Cup Live</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Real-time live scores from San Miguel Beermen, TNT Tropang Giga, Barangay Ginebra, Magnolia Hotshots, and more with live clocks and quarter scores.
        </p>
      </div>

      <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/80 shadow-md text-slate-300 ring-1 ring-amber-500/20">
        <div class="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black mb-3 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
          2
        </div>
        <h3 class="font-bold text-sm text-white mb-1.5">MPBL &amp; Collegiate Grassroots</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          In-depth fixtures covering the Maharlika Pilipinas Basketball League as well as UAAP and NCAA collegiate rivalry matchups.
        </p>
      </div>

      <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/80 shadow-md text-slate-300 ring-1 ring-emerald-500/20">
        <div class="w-8 h-8 rounded-xl bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black mb-3 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          3
        </div>
        <h3 class="font-bold text-sm text-white mb-1.5">Live Streams &amp; Signals</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Direct access to video transmission relays and algorithmic match signals with confidence percentages and picks.
        </p>
      </div>
    </div>
  </div>
</template>
