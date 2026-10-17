<script setup lang="ts">
import { PROMO_URL, buildDualModeHref, type PredictionBlogArticle } from '~/shared/seo-routing';
import { handleImageErrorToCrest, handleBannerImageError } from '~/shared/image-resolver';

defineProps<{
  predictionBlogs: PredictionBlogArticle[];
}>();

const emit = defineEmits<{
  (e: 'open-prediction', slug: string): void;
}>();
</script>

<template>
  <div class="p-4 sm:p-6 space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
      <div>
        <h2 class="text-base sm:text-lg font-black text-white">
          NBA &amp; PBA Pre-Game Predictions, Odds &amp; Picks (Today + Next 7 Days PHT)
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">
          Strictly verified NBA and PBA pre-game predictions, Tale of the Tape betting odds, spreads, Over/Under totals, and projected win probabilities.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <article
        v-for="pred in predictionBlogs"
        :key="pred.slug"
        class="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
      >
        <div>
          <div class="relative min-h-[195px] sm:aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex flex-col justify-between">
            <img
              :src="pred.bannerUrl"
              :alt="`${pred.awayTeam} vs ${pred.homeTeam} ${pred.league} Prediction Odds & Picks`"
              width="800"
              height="450"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="handleBannerImageError($event, pred.awayTeam, pred.homeTeam, pred.league)"
              class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-slate-950/75"></div>

            <div class="relative z-10 p-3 sm:p-3.5 flex flex-col justify-between gap-2 flex-1">
              <div class="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-bold">
                <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase shadow truncate">{{ pred.badge }}</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/85 border border-amber-400/40 text-amber-300 font-black shadow shrink-0">
                  <img src="/img/TipOffPh_logo.webp" alt="TipOff Ph" width="12" height="12" class="w-3 h-3 object-contain" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                  <span>TipOff Ph</span>
                </span>
              </div>

              <div class="flex items-end justify-between gap-1.5 pt-6">
                <div class="flex items-center gap-1.5 bg-slate-950/85 border border-slate-800/90 rounded-lg px-2 py-1 max-w-[41%]">
                  <img
                    :src="pred.awayLogo"
                    :alt="`${pred.awayTeam} Official Logo`"
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="handleImageErrorToCrest($event, pred.awayTeam)"
                    class="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white p-0.5 shadow shrink-0"
                  />
                  <span class="text-[11px] font-bold text-white leading-tight truncate">{{ pred.awayTeam }}</span>
                </div>

                <div class="text-center px-2 py-1 rounded-lg bg-slate-950/90 border border-amber-400/35 shrink-0">
                  <div class="text-[9px] font-black text-amber-400 uppercase">VS</div>
                  <div class="text-[10px] font-mono font-bold text-slate-200 whitespace-nowrap">{{ pred.matchDatePHT }}</div>
                </div>

                <div class="flex items-center justify-end gap-1.5 bg-slate-950/85 border border-slate-800/90 rounded-lg px-2 py-1 max-w-[41%] text-right">
                  <span class="text-[11px] font-bold text-white leading-tight truncate">{{ pred.homeTeam }}</span>
                  <img
                    :src="pred.homeLogo"
                    :alt="`${pred.homeTeam} Official Logo`"
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="handleImageErrorToCrest($event, pred.homeTeam)"
                    class="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white p-0.5 shadow shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 sm:p-5 space-y-3.5">
            <h3 class="text-base sm:text-lg font-black text-white leading-snug">
              <a
                :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
                @click.prevent="emit('open-prediction', pred.slug)"
                class="hover:text-amber-400 transition-colors"
              >
                {{ pred.headline }}
              </a>
            </h3>

            <div class="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl p-3">
              <table class="w-full text-left text-xs font-mono tabular-nums">
                <tbody class="divide-y divide-slate-800/80">
                  <tr>
                    <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Tip-Off Time (PHT)</th>
                    <td class="py-1.5 text-right font-bold text-slate-100">{{ pred.taleOfTheTape.tipOffTimePht }}</td>
                  </tr>
                  <tr>
                    <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Spread</th>
                    <td class="py-1.5 text-right font-bold text-amber-400">{{ pred.taleOfTheTape.spread }}</td>
                  </tr>
                  <tr>
                    <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Over/Under Total</th>
                    <td class="py-1.5 text-right font-bold text-cyan-300">{{ pred.taleOfTheTape.overUnder }}</td>
                  </tr>
                  <tr>
                    <th class="py-1.5 pr-3 font-sans font-semibold text-slate-400">Projected Win Probability %</th>
                    <td class="py-1.5 text-right font-bold text-emerald-400">{{ pred.taleOfTheTape.winProbability }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p v-for="(para, idx) in pred.paragraphs" :key="idx">{{ para }}</p>
            </div>
          </div>
        </div>

        <div class="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
          <a
            :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
            @click.prevent="emit('open-prediction', pred.slug)"
            class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
          >
            Open Full Prediction &rarr;
          </a>
          <div class="flex items-center gap-1.5 shrink-0">
            <a
              :href="PROMO_URL"
              target="_blank"
              rel="nofollow sponsored noopener"
              class="px-3 py-1 rounded text-[11px] font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors whitespace-nowrap"
            >
              Bet Now
            </a>
            <a
              :href="PROMO_URL"
              target="_blank"
              rel="nofollow sponsored noopener"
              class="px-3 py-1 rounded text-[11px] font-black uppercase bg-red-600 hover:bg-red-500 text-white transition-colors whitespace-nowrap"
            >
              Play Now
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
