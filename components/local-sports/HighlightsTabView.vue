<script setup lang="ts">
import { PROMO_URL, buildDualModeHref, type HighlightReportArticle } from '~/shared/seo-routing';
import { handleImageErrorToCrest, handleBannerImageError } from '~/shared/image-resolver';

defineProps<{
  highlightReports: HighlightReportArticle[];
  blogSubFilter: 'all' | 'nba' | 'pba';
}>();

const emit = defineEmits<{
  (e: 'update:blogSubFilter', val: 'all' | 'nba' | 'pba'): void;
  (e: 'open-report', slug: string): void;
}>();
</script>

<template>
  <div class="p-4 sm:p-6 space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
      <div>
        <h2 class="text-base sm:text-lg font-black text-white">
          NBA &amp; PBA Post-Game Highlight &amp; Short Recap Blogs (Last 48 Hours)
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">
          Text-only post-game short recaps, Top Player Highlights, and Quarter-by-Quarter (Q1–Q4 + FINAL) box score tables for completed NBA &amp; PBA games.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="sub in [
            { id: 'all', label: 'All Final Recaps' },
            { id: 'nba', label: 'NBA Final Recaps' },
            { id: 'pba', label: 'PBA Final Recaps' }
          ]"
          :key="sub.id"
          type="button"
          @click="emit('update:blogSubFilter', sub.id as 'all' | 'nba' | 'pba')"
          class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
          :class="blogSubFilter === sub.id
            ? 'bg-amber-400 text-slate-950 font-black'
            : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'"
        >
          {{ sub.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <article
        v-for="rep in highlightReports"
        :key="rep.slug"
        class="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
      >
        <div>
          <div class="relative min-h-[195px] sm:aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800 flex flex-col justify-between">
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

            <div class="relative z-10 p-3 sm:p-3.5 flex flex-col justify-between gap-2 flex-1">
              <div class="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-bold">
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
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="handleImageErrorToCrest($event, rep.awayTeam)"
                    class="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white p-0.5 shadow shrink-0"
                  />
                  <span class="text-[11px] font-bold text-white leading-tight truncate">{{ rep.awayTeam }}</span>
                </div>

                <div class="text-center px-2 py-1 rounded-lg bg-slate-950/90 border border-emerald-400/35 shrink-0">
                  <div class="text-[9px] font-black text-emerald-400 uppercase">FINAL</div>
                  <div class="text-xs sm:text-sm font-mono font-black text-white whitespace-nowrap">{{ rep.awayScore }} – {{ rep.homeScore }}</div>
                </div>

                <div class="flex items-center justify-end gap-1.5 bg-slate-950/85 border border-slate-800/90 rounded-lg px-2 py-1 max-w-[40%] text-right">
                  <span class="text-[11px] font-bold text-white leading-tight truncate">{{ rep.homeTeam }}</span>
                  <img
                    :src="rep.homeLogo"
                    :alt="`${rep.homeTeam} Official Logo`"
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                    referrerpolicy="no-referrer"
                    @error="handleImageErrorToCrest($event, rep.homeTeam)"
                    class="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded bg-white p-0.5 shadow shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 sm:p-5 space-y-3.5">
            <h3 class="text-base sm:text-lg font-black text-white leading-snug">
              <a
                :href="buildDualModeHref('report', rep.slug, '/local-sports')"
                @click.prevent="emit('open-report', rep.slug)"
                class="hover:text-amber-400 transition-colors"
              >
                {{ rep.headline }}
              </a>
            </h3>

            <div class="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p v-for="(para, idx) in rep.paragraphs" :key="idx">{{ para }}</p>
            </div>

            <div class="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Top Player Highlights ({{ rep.league }})
              </div>
              <ul class="space-y-1 text-xs text-slate-300 list-disc list-inside">
                <li v-for="(pt, idx) in rep.topPlayerHighlights" :key="idx">{{ pt }}</li>
              </ul>
            </div>

            <div class="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl p-3">
              <table class="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr class="border-b border-slate-800 text-slate-400">
                    <th class="py-1.5 pr-3 font-sans font-bold text-slate-300">Team</th>
                    <th v-for="q in rep.quarters" :key="q.label" class="py-1.5 px-1.5 text-center">{{ q.label }}</th>
                    <th class="py-1.5 pl-2 text-right font-bold text-amber-400">FINAL</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/70">
                  <tr>
                    <td class="py-1.5 pr-3 font-sans font-bold text-white">{{ rep.awayTeam }}</td>
                    <td v-for="q in rep.quarters" :key="`a-${q.label}`" class="py-1.5 px-1.5 text-center text-slate-300">{{ q.away }}</td>
                    <td class="py-1.5 pl-2 text-right font-extrabold text-amber-400">{{ rep.awayScore }}</td>
                  </tr>
                  <tr>
                    <td class="py-1.5 pr-3 font-sans font-bold text-white">{{ rep.homeTeam }}</td>
                    <td v-for="q in rep.quarters" :key="`h-${q.label}`" class="py-1.5 px-1.5 text-center text-slate-300">{{ q.home }}</td>
                    <td class="py-1.5 pl-2 text-right font-extrabold text-amber-400">{{ rep.homeScore }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-slate-950/60">
          <a
            :href="buildDualModeHref('report', rep.slug, '/local-sports')"
            @click.prevent="emit('open-report', rep.slug)"
            class="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
          >
            View Full Recap &rarr;
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
