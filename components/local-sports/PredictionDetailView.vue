<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { PROMO_URL, buildDualModeHref, type PredictionBlogArticle } from '~/shared/seo-routing';
import { handleImageErrorToCrest, handleBannerImageError } from '~/shared/image-resolver';
import AdUnit from '~/components/AdUnit.vue';

defineProps<{
  prediction: PredictionBlogArticle;
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
          :src="prediction.bannerUrl"
          :alt="`${prediction.awayTeam} vs ${prediction.homeTeam} ${prediction.league} Prediction Odds & Picks`"
          width="1280"
          height="720"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          @error="handleBannerImageError($event, prediction.awayTeam, prediction.homeTeam, prediction.league)"
          class="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-slate-950/75"></div>

        <div class="relative z-10 p-3 sm:p-5 flex flex-col justify-between gap-3 flex-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="px-2.5 py-1 rounded bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow">
                {{ prediction.badge }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/85 border border-amber-400/40 text-[10px] sm:text-xs font-black text-amber-300 shadow">
                <img src="/img/TipOffPh_logo.webp" alt="TipOff Ph" width="14" height="14" class="w-3.5 h-3.5 object-contain" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                <span>TipOff Ph</span>
              </span>
              <a
                :href="buildDualModeHref('tab', 'predictions', '/local-sports')"
                @click.prevent="emit('close')"
                class="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>All Predictions</span>
              </a>
            </div>
          </div>

          <div class="flex items-end justify-between gap-2 pt-6">
            <div class="flex items-center gap-2 sm:gap-2.5 bg-slate-950/85 border border-slate-800/90 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-xs max-w-[42%]">
              <img
                :src="prediction.awayLogo"
                :alt="`${prediction.awayTeam} Official Logo`"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleImageErrorToCrest($event, prediction.awayTeam)"
                class="w-9 h-9 sm:w-12 sm:h-12 object-contain rounded-lg bg-white p-1 shadow shrink-0"
              />
              <div class="min-w-0">
                <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Away</div>
                <div class="text-xs sm:text-sm font-black text-white leading-tight truncate">{{ prediction.awayTeam }}</div>
              </div>
            </div>

            <div class="flex flex-col items-center justify-center text-center px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-400/40 shrink-0">
              <span class="text-[10px] font-black uppercase tracking-widest text-amber-400">VS · {{ prediction.league }}</span>
              <span class="text-[11px] sm:text-xs font-mono font-bold text-white whitespace-nowrap">{{ prediction.matchDatePHT }}</span>
            </div>

            <div class="flex items-center justify-end gap-2 sm:gap-2.5 bg-slate-950/85 border border-slate-800/90 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-xs max-w-[42%] text-right">
              <div class="min-w-0">
                <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Home</div>
                <div class="text-xs sm:text-sm font-black text-white leading-tight truncate">{{ prediction.homeTeam }}</div>
              </div>
              <img
                :src="prediction.homeLogo"
                :alt="`${prediction.homeTeam} Official Logo`"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleImageErrorToCrest($event, prediction.homeTeam)"
                class="w-9 h-9 sm:w-12 sm:h-12 object-contain rounded-lg bg-white p-1 shadow shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="p-3.5 sm:p-7 space-y-4 sm:space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
            {{ prediction.badge }}
          </span>
          <span
            v-if="prediction.newsFormat"
            class="px-2.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold"
          >
            {{ prediction.newsFormat }} ({{ prediction.optimalWordCount || '1,200 – 2,500+ words' }})
          </span>
          <span class="text-xs text-slate-400 font-medium">{{ prediction.venue }}</span>
        </div>

        <h3 class="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
          {{ prediction.headline }}
        </h3>

        <!-- 5 Ws Rapid Top Stories Indexing Box (300-500w Breaking News Format Rule) -->
        <div v-if="prediction.fiveWs" class="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
              Breaking News / Quick Update • The 5 Ws (Top Stories Rapid Indexing)
            </span>
            <span class="text-[10px] font-mono text-slate-400">300 – 500 Words Core Lead</span>
          </div>
          <ul class="space-y-1.5 text-xs sm:text-sm text-slate-200">
            <li><strong class="text-amber-300">WHO:</strong> {{ prediction.fiveWs.who }}</li>
            <li><strong class="text-amber-300">WHAT:</strong> {{ prediction.fiveWs.what }}</li>
            <li><strong class="text-amber-300">WHEN:</strong> {{ prediction.fiveWs.when }}</li>
            <li><strong class="text-amber-300">WHERE:</strong> {{ prediction.fiveWs.where }}</li>
            <li><strong class="text-amber-300">WHY:</strong> {{ prediction.fiveWs.why }}</li>
          </ul>
        </div>

        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            Betting Tale of the Tape
          </div>
          <table class="w-full text-left text-xs sm:text-sm font-mono tabular-nums">
            <tbody class="divide-y divide-slate-800/80">
              <tr>
                <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Tip-Off Time (PHT)</th>
                <td class="py-2 text-right font-bold text-slate-100">{{ prediction.taleOfTheTape.tipOffTimePht }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Spread</th>
                <td class="py-2 text-right font-bold text-amber-400">{{ prediction.taleOfTheTape.spread }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Over/Under Total</th>
                <td class="py-2 text-right font-bold text-cyan-300">{{ prediction.taleOfTheTape.overUnder }}</td>
              </tr>
              <tr>
                <th class="py-2 pr-2 font-sans font-semibold text-slate-400">Projected Win Probability %</th>
                <td class="py-2 text-right font-bold text-emerald-400">{{ prediction.taleOfTheTape.winProbability }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p v-for="(para, idx) in prediction.paragraphs" :key="idx">
            {{ para }}
          </p>
        </div>

        <!-- Mid-post 300x250 Rotating Ad Unit -->
        <AdUnit format="rectangle" />

        <!-- E-E-A-T Investigative Features & Analysis Sections (1,200 - 2,500+ Words Rule) -->
        <div v-if="prediction.eeatSections?.length" class="space-y-4 pt-3 border-t border-slate-800/90">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-black uppercase tracking-wider text-cyan-400">
              Investigative Features &amp; Analysis • E-E-A-T Deep Matchup Breakdown
            </span>
            <span class="text-[10px] font-mono text-slate-400">Evergreen &amp; Long-Tail SEO Strategy</span>
          </div>
          <div
            v-for="(sec, sIdx) in prediction.eeatSections"
            :key="sIdx"
            class="bg-slate-950/75 border border-slate-800/90 rounded-xl p-3.5 sm:p-4 space-y-2"
          >
            <h4 class="text-xs sm:text-sm font-black text-white tracking-tight">
              {{ sec.heading }}
            </h4>
            <p
              v-for="(p, pIdx) in sec.paragraphs"
              :key="pIdx"
              class="text-xs sm:text-sm text-slate-300 leading-relaxed"
            >
              {{ p }}
            </p>
          </div>
        </div>

        <!-- Post Footer Rotating Banner (320x50 / Horizontal) -->
        <AdUnit format="banner" />

        <div class="mt-4 sm:mt-6 p-3.5 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="text-xs sm:text-base font-extrabold text-white leading-snug">
              Lock in live {{ prediction.league }} odds for {{ prediction.awayTeam }} vs {{ prediction.homeTeam }}
            </p>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Official {{ prediction.league }} spreads, totals, and live in-play markets in PHT.
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
