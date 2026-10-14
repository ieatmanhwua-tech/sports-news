<script setup lang="ts">
import NbaOddsBoard from '~/components/NbaOddsBoard.vue';
import { Flame, Trophy, ExternalLink, Calendar, ArrowLeft } from 'lucide-vue-next';

const config = useRuntimeConfig();
const siteUrl = computed(() => (config.public.siteUrl || 'https://tipoffph.com').replace(/\/$/, ''));
const canonicalUrl = computed(() => `${siteUrl.value}/nba-odds`);

const nbaOddsSchema = computed(() => {
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
          'name': 'NBA Live Odds & Point Spreads',
          'item': canonicalUrl.value
        }
      ]
    }
  ];
});

useHead({
  title: 'NBA Live Odds, Spreads & Game Scores | TipOffPh',
  meta: [
    { 
      name: 'description', 
      content: 'Live NBA odds, consensus point spreads, over/under totals, and head-to-head betting lines for upcoming basketball games on TipOffPh.' 
    },
    { property: 'og:title', content: 'NBA Live Odds & Matchup Lines | TipOffPh' },
    { property: 'og:description', content: 'Real-time odds pulled directly from NBA Sports API with consensus sportsbooks and tip-off schedules.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` },
    { property: 'og:site_name', content: 'TipOffPh' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'NBA Live Odds, Spreads & Game Scores | TipOffPh' },
    { name: 'twitter:description', content: 'Live NBA odds, consensus point spreads, over/under totals, and head-to-head betting lines on TipOffPh.' },
    { name: 'twitter:image', content: `${siteUrl.value}/img/TipOffPh_logo.png` }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ],
  script: [
    {
      type: 'application/ld+json' as any,
      innerHTML: JSON.stringify(nbaOddsSchema.value)
    }
  ]
});
</script>

<template>
  <div class="max-w-5xl mx-auto py-3 space-y-6">
    <!-- Breadcrumb / Back link -->
    <div class="flex items-center justify-between text-xs">
      <NuxtLink to="/scores-and-schedules" class="inline-flex items-center gap-1.5 font-bold text-slate-300 hover:text-amber-400 transition-colors">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Back to All Scores &amp; Schedules</span>
      </NuxtLink>

      <span class="text-slate-400 font-mono text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
        Source: nba-sports-api.ieatmanhwua.workers.dev
      </span>
    </div>

    <!-- Main Live Board -->
    <NbaOddsBoard 
      :limit="50"
      :show-search="true"
      title="NBA Live Odds &amp; Upcoming Scores"
      subtitle="Complete real-time odds, consensus spreads, totals, and head-to-head market prices for all upcoming NBA games."
    />

    <!-- Context & Editorial Guide (Dark Glassmorphic) -->
    <div class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-4 text-xs text-slate-300 leading-relaxed ring-1 ring-cyan-500/20">
      <h3 class="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5 drop-shadow-sm">
        <Trophy class="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        <span>About TipOffPh NBA Odds Coverage</span>
      </h3>
      <p>
        TipOffPh tracks upcoming basketball matchups with verified market consensus lines across major sportsbooks including DraftKings, FanDuel, BetMGM, Caesars, and Bovada. 
        All tip-off times are automatically synced to Philippine Standard Time (PHT, Asia/Manila) to help fans and content creators stay informed ahead of primetime broadcasts.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
          <div class="font-bold text-white mb-1">Point Spread (Handicap)</div>
          <p class="text-[11px] text-slate-400">The estimated margin of victory. Negative numbers indicate the favorite; positive indicate the underdog.</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
          <div class="font-bold text-white mb-1">Moneyline (H2H)</div>
          <p class="text-[11px] text-slate-400">Straight-up winner odds represented in decimal format alongside American odds (+/-) for convenient comparisons.</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
          <div class="font-bold text-white mb-1">Totals (Over / Under)</div>
          <p class="text-[11px] text-slate-400">The combined projected score of both teams by the final buzzer, including potential overtime periods.</p>
        </div>
      </div>
    </div>
  </div>
</template>
