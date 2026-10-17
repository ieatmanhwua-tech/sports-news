<script setup lang="ts">
import { PROMO_URL, buildDualModeHref, type PredictionBlogArticle, type HighlightReportArticle } from '~/shared/seo-routing';
import { handleImageErrorToCrest, handleBannerImageError } from '~/shared/image-resolver';

defineProps<{
  predictionBlogs: PredictionBlogArticle[];
  highlightReports: HighlightReportArticle[];
}>();

const emit = defineEmits<{
  (e: 'select-tab', tabId: string): void;
  (e: 'open-prediction', slug: string): void;
  (e: 'open-report', slug: string): void;
}>();
</script>

<template>
  <section v-if="predictionBlogs.length > 0 || highlightReports.length > 0" class="pt-6 border-t border-slate-800 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h2 class="text-lg sm:text-xl font-black text-white tracking-tight">
          Automated NBA &amp; PBA Pre-Game Predictions &amp; Post-Game Final Recaps
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">
          Strictly verified NBA and PBA pre-game Tale of the Tape predictions and post-game Q1–Q4 box score recaps.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <a
          :href="buildDualModeHref('tab', 'predictions', '/local-sports')"
          @click.prevent="emit('select-tab', 'predictions')"
          class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
        >
          All Predictions &amp; Picks
        </a>
        <a
          :href="buildDualModeHref('tab', 'highlights', '/local-sports')"
          @click.prevent="emit('select-tab', 'highlights')"
          class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
        >
          All Final Recaps
        </a>
      </div>
    </div>

    <!-- Auto-Generated Pre-Game Prediction Articles (Strictly NBA & PBA Upcoming) -->
    <div v-if="predictionBlogs.length > 0" class="space-y-3">
      <div class="text-xs font-black uppercase tracking-wider text-amber-400">
        NBA &amp; PBA Pre-Game Prediction Blogs (Today + Next 7 Days PHT)
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article
          v-for="pred in predictionBlogs.slice(0, 6)"
          :key="`feed-pred-${pred.slug}`"
          class="bg-slate-900/75 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between group"
        >
          <div>
            <div class="relative min-h-[190px] sm:aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex flex-col justify-between">
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

              <div class="relative z-10 p-3 flex flex-col justify-between gap-2 flex-1">
                <div class="flex items-center justify-between gap-2 text-[10px] font-bold">
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
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, pred.awayTeam)"
                      class="w-7 h-7 object-contain rounded bg-white p-0.5 shadow shrink-0"
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
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, pred.homeTeam)"
                      class="w-7 h-7 object-contain rounded bg-white p-0.5 shadow shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <h3 class="text-base font-extrabold text-white leading-snug">
                <a
                  :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
                  @click.prevent="emit('open-prediction', pred.slug)"
                  class="hover:text-amber-400 transition-colors"
                >
                  {{ pred.headline }}
                </a>
              </h3>

              <table class="w-full text-left text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded-lg">
                <tbody class="divide-y divide-slate-800/80">
                  <tr>
                    <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Tip-Off Time (PHT)</th>
                    <td class="py-1.5 px-2.5 text-right font-bold text-slate-100">{{ pred.taleOfTheTape.tipOffTimePht }}</td>
                  </tr>
                  <tr>
                    <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Spread</th>
                    <td class="py-1.5 px-2.5 text-right font-bold text-amber-400">{{ pred.taleOfTheTape.spread }}</td>
                  </tr>
                  <tr>
                    <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Over/Under Total</th>
                    <td class="py-1.5 px-2.5 text-right font-bold text-cyan-300">{{ pred.taleOfTheTape.overUnder }}</td>
                  </tr>
                  <tr>
                    <th class="py-1.5 px-2.5 font-sans font-semibold text-slate-400">Projected Win Probability %</th>
                    <td class="py-1.5 px-2.5 text-right font-bold text-emerald-400">{{ pred.taleOfTheTape.winProbability }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <p v-for="(para, idx) in pred.paragraphs" :key="idx">{{ para }}</p>
              </div>
            </div>
          </div>

          <div class="px-4 pb-3.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
            <a
              :href="buildDualModeHref('prediction', pred.slug, '/local-sports')"
              @click.prevent="emit('open-prediction', pred.slug)"
              class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Read Full Prediction &rarr;
            </a>
            <div class="flex items-center gap-1.5">
              <a
                :href="PROMO_URL"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="px-2.5 py-1 rounded text-[11px] font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950"
              >
                Bet Now
              </a>
              <a
                :href="PROMO_URL"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="px-2.5 py-1 rounded text-[11px] font-black uppercase bg-red-600 hover:bg-red-500 text-white"
              >
                Play Now
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Auto-Generated Post-Game Highlight Reports (Strictly NBA & PBA Final Matches) -->
    <div v-if="highlightReports.length > 0" class="space-y-3 pt-4">
      <div class="text-xs font-black uppercase tracking-wider text-emerald-400">
        NBA &amp; PBA Post-Game Highlight &amp; Short Recap Blogs (Last 48 Hours)
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article
          v-for="rep in highlightReports.slice(0, 6)"
          :key="`feed-rep-${rep.slug}`"
          class="bg-slate-900/75 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between group"
        >
          <div>
            <div class="relative min-h-[190px] sm:aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex flex-col justify-between">
              <img
                :src="rep.bannerUrl"
                :alt="`${rep.awayTeam} vs ${rep.homeTeam} ${rep.league} Game Highlights & Short Recap`"
                width="800"
                height="450"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="handleBannerImageError($event, rep.awayTeam, rep.homeTeam, rep.league)"
                class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-slate-950/75"></div>

              <div class="relative z-10 p-3 flex flex-col justify-between gap-2 flex-1">
                <div class="flex items-center justify-between gap-2 text-[10px] font-bold">
                  <span class="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black uppercase shadow truncate">{{ rep.badge }}</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/85 border border-amber-400/40 text-amber-300 font-black shadow shrink-0">
                    <img src="/img/TipOffPh_logo.webp" alt="TipOff Ph" width="12" height="12" class="w-3 h-3 object-contain" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                    <span>TipOff Ph</span>
                  </span>
                </div>

                <div class="flex items-end justify-between gap-1.5 pt-6">
                  <div class="flex items-center gap-1.5 bg-slate-950/85 border border-slate-800/90 rounded-lg px-2 py-1 max-w-[40%]">
                    <img
                      :src="rep.awayLogo"
                      :alt="`${rep.awayTeam} Official Logo`"
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, rep.awayTeam)"
                      class="w-7 h-7 object-contain rounded bg-white p-0.5 shadow shrink-0"
                    />
                    <span class="text-[11px] font-bold text-white leading-tight truncate">{{ rep.awayTeam }}</span>
                  </div>

                  <div class="text-center px-2 py-1 rounded-lg bg-slate-950/90 border border-emerald-400/35 shrink-0">
                    <div class="text-[9px] font-black text-emerald-400 uppercase">FINAL</div>
                    <div class="text-xs font-mono font-black text-white whitespace-nowrap">{{ rep.awayScore }} – {{ rep.homeScore }}</div>
                  </div>

                  <div class="flex items-center justify-end gap-1.5 bg-slate-950/85 border border-slate-800/90 rounded-lg px-2 py-1 max-w-[40%] text-right">
                    <span class="text-[11px] font-bold text-white leading-tight truncate">{{ rep.homeTeam }}</span>
                    <img
                      :src="rep.homeLogo"
                      :alt="`${rep.homeTeam} Official Logo`"
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="handleImageErrorToCrest($event, rep.homeTeam)"
                      class="w-7 h-7 object-contain rounded bg-white p-0.5 shadow shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <h3 class="text-base font-extrabold text-white leading-snug">
                <a
                  :href="buildDualModeHref('report', rep.slug, '/local-sports')"
                  @click.prevent="emit('open-report', rep.slug)"
                  class="hover:text-amber-400 transition-colors"
                >
                  {{ rep.headline }}
                </a>
              </h3>

              <div class="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <p v-for="(para, idx) in rep.paragraphs" :key="idx">{{ para }}</p>
              </div>

              <ul class="space-y-1 text-xs text-slate-300 list-disc list-inside bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
                <li v-for="(pt, idx) in rep.topPlayerHighlights" :key="idx">{{ pt }}</li>
              </ul>

              <table class="w-full text-left text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded-lg">
                <thead>
                  <tr class="border-b border-slate-800 text-slate-400">
                    <th class="py-1 px-2 font-sans font-bold text-slate-300">Team</th>
                    <th v-for="q in rep.quarters" :key="q.label" class="py-1 px-1.5 text-center">{{ q.label }}</th>
                    <th class="py-1 px-2 text-right font-bold text-amber-400">FINAL</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/70">
                  <tr>
                    <td class="py-1 px-2 font-sans font-bold text-white">{{ rep.awayTeam }}</td>
                    <td v-for="q in rep.quarters" :key="`a-${q.label}`" class="py-1 px-1.5 text-center text-slate-300">{{ q.away }}</td>
                    <td class="py-1 px-2 text-right font-extrabold text-amber-400">{{ rep.awayScore }}</td>
                  </tr>
                  <tr>
                    <td class="py-1 px-2 font-sans font-bold text-white">{{ rep.homeTeam }}</td>
                    <td v-for="q in rep.quarters" :key="`h-${q.label}`" class="py-1 px-1.5 text-center text-slate-300">{{ q.home }}</td>
                    <td class="py-1 px-2 text-right font-extrabold text-amber-400">{{ rep.homeScore }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="px-4 pb-3.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
            <a
              :href="buildDualModeHref('report', rep.slug, '/local-sports')"
              @click.prevent="emit('open-report', rep.slug)"
              class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Open Final Recap &rarr;
            </a>
            <div class="flex items-center gap-1.5">
              <a
                :href="PROMO_URL"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="px-2.5 py-1 rounded text-[11px] font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950"
              >
                Bet Now
              </a>
              <a
                :href="PROMO_URL"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="px-2.5 py-1 rounded text-[11px] font-black uppercase bg-red-600 hover:bg-red-500 text-white"
              >
                Play Now
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
