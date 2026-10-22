<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { PROMO_URL, buildDualModeHref, type HighlightReportArticle } from '~/shared/seo-routing';
import { handleImageErrorToCrest, handleBannerImageError } from '~/shared/image-resolver';

defineProps<{
  report: HighlightReportArticle;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="p-2.5 sm:p-6 bg-slate-950/60 border-b border-slate-800">
    <article class="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
      <div class="relative min-h-[220px] sm:aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex flex-col justify-between">
        <img
          :src="report.bannerUrl"
          :alt="`${report.awayTeam} vs ${report.homeTeam} ${report.league} Game Highlights & Short Recap`"
          width="1280"
          height="720"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          @error="handleBannerImageError($event, report.awayTeam, report.homeTeam, report.league)"
          class="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-slate-950/75"></div>

        <div class="relative z-10 p-3.5 sm:p-5 flex flex-col justify-between gap-3 flex-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="px-2.5 py-1 rounded bg-emerald-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow">
                {{ report.badge }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/85 border border-amber-400/40 text-[10px] sm:text-xs font-black text-amber-300 shadow">
                <img src="/img/TipOffPh_logo.webp" alt="TipOff Ph" width="14" height="14" class="w-3.5 h-3.5 object-contain" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                <span>TipOff Ph</span>
              </span>
              <a
                :href="buildDualModeHref('tab', 'highlights', '/local-sports')"
                @click.prevent="emit('close')"
                class="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>All Final Recaps</span>
              </a>
            </div>
          </div>

          <div class="flex items-end justify-between gap-2 pt-6">
            <div class="flex items-center gap-2 sm:gap-2.5 bg-slate-950/85 border border-slate-800/90 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-xs max-w-[40%]">
              <img
                :src="report.awayLogo"
                :alt="`${report.awayTeam} Official Logo`"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleImageErrorToCrest($event, report.awayTeam)"
                class="w-9 h-9 sm:w-12 sm:h-12 object-contain rounded-lg bg-white p-1 shadow shrink-0"
              />
              <div class="min-w-0">
                <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Away</div>
                <div class="text-xs sm:text-sm font-black text-white leading-tight truncate">{{ report.awayTeam }}</div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center text-center px-3 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-400/40 shrink-0">
              <span class="text-[10px] font-black uppercase tracking-widest text-emerald-400">FINAL</span>
              <span class="text-sm sm:text-xl font-mono font-black text-white whitespace-nowrap">
                {{ report.awayScore }} – {{ report.homeScore }}
              </span>
            </div>

            <div class="flex items-center justify-end gap-2 sm:gap-2.5 bg-slate-950/85 border border-slate-800/90 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-xs max-w-[40%] text-right">
              <div class="min-w-0">
                <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Home</div>
                <div class="text-xs sm:text-sm font-black text-white leading-tight truncate">{{ report.homeTeam }}</div>
              </div>
              <img
                :src="report.homeLogo"
                :alt="`${report.homeTeam} Official Logo`"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleImageErrorToCrest($event, report.homeTeam)"
                class="w-9 h-9 sm:w-12 sm:h-12 object-contain rounded-lg bg-white p-1 shadow shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="p-3.5 sm:p-7 space-y-4 sm:space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-0.5 rounded bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider">
            {{ report.badge }}
          </span>
          <span
            v-if="report.newsFormat"
            class="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold"
          >
            {{ report.newsFormat }} ({{ report.optimalWordCount || '600 – 900 words' }})
          </span>
          <span class="text-xs text-slate-400 font-medium">{{ report.venue }} · {{ report.manilaTime }}</span>
        </div>

        <h3 class="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
          {{ report.headline }}
        </h3>

        <div class="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <p v-for="(para, idx) in report.paragraphs" :key="idx">
            {{ para }}
          </p>
        </div>

        <div class="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-2.5">
          <h4 class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
            Top Player Highlights ({{ report.league }})
          </h4>
          <ul class="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
            <li v-for="(pt, idx) in report.topPlayerHighlights" :key="idx">{{ pt }}</li>
          </ul>
        </div>

        <div class="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quarter-by-Quarter Box Score Table
          </div>
          <table class="w-full text-left text-xs sm:text-sm font-mono tabular-nums">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="py-2 pr-2 font-sans font-bold text-slate-300">Team</th>
                <th v-for="q in report.quarters" :key="q.label" class="py-2 px-1.5 sm:px-2 text-center">{{ q.label }}</th>
                <th class="py-2 pl-2 text-right font-bold text-amber-400">FINAL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/70">
              <tr>
                <td class="py-2 pr-2 font-sans font-bold text-white truncate max-w-[120px] sm:max-w-none">{{ report.awayTeam }}</td>
                <td v-for="q in report.quarters" :key="`a-${q.label}`" class="py-2 px-1.5 sm:px-2 text-center text-slate-300">{{ q.away }}</td>
                <td class="py-2 pl-2 text-right font-extrabold text-amber-400">{{ report.awayScore }}</td>
              </tr>
              <tr>
                <td class="py-2 pr-2 font-sans font-bold text-white truncate max-w-[120px] sm:max-w-none">{{ report.homeTeam }}</td>
                <td v-for="q in report.quarters" :key="`h-${q.label}`" class="py-2 px-1.5 sm:px-2 text-center text-slate-300">{{ q.home }}</td>
                <td class="py-2 pl-2 text-right font-extrabold text-amber-400">{{ report.homeScore }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Post-Game Locker Room Quotes (Standard Game Recaps & Reports 600-900 Words Rule) -->
        <div v-if="report.playerQuotes?.length" class="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">
              Post-Game Locker Room Quotes &amp; Reactions
            </h4>
            <span class="text-[10px] font-mono text-slate-400">Standard Game Recap (600–900 Words)</span>
          </div>
          <div
            v-for="(q, qIdx) in report.playerQuotes"
            :key="qIdx"
            class="border-l-2 border-emerald-400 pl-3 py-1 space-y-1 bg-emerald-500/5 rounded-r-lg"
          >
            <p class="text-xs sm:text-sm italic text-slate-200 leading-relaxed">{{ q.quote }}</p>
            <div class="text-[11px] font-bold text-emerald-300">
              — {{ q.speaker }} <span class="font-normal text-slate-400">({{ q.role }})</span>
            </div>
          </div>
        </div>

        <!-- Statistical Context & Secondary Keywords without Fluff -->
        <div v-if="report.statisticalContextParagraphs?.length" class="bg-slate-950/75 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-2.5">
          <h4 class="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
            Statistical Context &amp; Matchup Telemetry
          </h4>
          <p
            v-for="(sp, spIdx) in report.statisticalContextParagraphs"
            :key="spIdx"
            class="text-xs sm:text-sm text-slate-300 leading-relaxed"
          >
            {{ sp }}
          </p>
        </div>

        <div class="mt-4 sm:mt-6 p-3.5 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="text-xs sm:text-base font-extrabold text-white leading-snug">
              Ready for the next {{ report.league }} tip-off? Get live basketball odds now
            </p>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Live NBA &amp; PBA spreads, totals, and in-play markets updated every possession.
            </p>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              :href="PROMO_URL"
              target="_blank"
              rel="nofollow sponsored noopener"
              class="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors whitespace-nowrap"
            >
              Bet Now
            </a>
            <a
              :href="PROMO_URL"
              target="_blank"
              rel="nofollow sponsored noopener"
              class="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition-colors whitespace-nowrap"
            >
              Play Now
            </a>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
