<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  NBA_PRESEASON_PREDICTIONS_TOMORROW,
  NBA_PRESEASON_PREDICTIONS_FIVE_GAME_SLATE,
  type NbaPredictionBlogItem
} from '~/shared/nba-predictions';
import {
  Flame,
  Calendar,
  MapPin,
  Tv,
  TrendingUp,
  Trophy,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Target,
  Activity
} from 'lucide-vue-next';
import AdUnit from '~/components/AdUnit.vue';

const props = withDefaults(defineProps<{
  compactHeader?: boolean;
}>(), {
  compactHeader: false
});

const activeSlate = ref<'tomorrow' | 'five-game'>('tomorrow');
const expandedBlogIds = ref<Record<string, boolean>>({});

const activePredictions = computed<NbaPredictionBlogItem[]>(() => {
  return activeSlate.value === 'tomorrow'
    ? NBA_PRESEASON_PREDICTIONS_TOMORROW
    : NBA_PRESEASON_PREDICTIONS_FIVE_GAME_SLATE;
});

function toggleBlogExpand(id: string) {
  expandedBlogIds.value[id] = !expandedBlogIds.value[id];
}

function isExpanded(id: string): boolean {
  // Default to expanded so all short prediction blogs are immediately visible
  return expandedBlogIds.value[id] !== false;
}

function scrollToCard(id: string) {
  if (typeof document !== 'undefined') {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
</script>

<template>
  <section class="space-y-8" aria-label="NBA Preseason Fight Tomorrow - 5 Prediction Content Designs">
    <!-- Top Editorial Command Banner -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1326] via-[#0f1b33] to-[#171129] border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.65)] p-5 sm:p-7 lg:p-8">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="space-y-3 max-w-3xl">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              <Flame class="w-3.5 h-3.5 fill-slate-950" />
              {{ activeSlate === 'tomorrow' ? 'Oct 15, 2026 PHT Slate' : 'Oct 14, 2026 PHT Slate' }}
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles class="w-3.5 h-3.5 text-amber-400" />
              5 Matchup Blogs &amp; Final Recaps
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck class="w-3.5 h-3.5" />
              Real Team Action Photos
            </span>
          </div>

          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            NBA Matchup Blog &amp; Box Score Recaps ({{ activeSlate === 'tomorrow' ? 'Oct 15, 2026 PHT' : 'Oct 14, 2026 PHT' }} Showcase)
          </h2>
          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            Verified matchup blog breakdowns and official box score recaps for the {{ activeSlate === 'tomorrow' ? 'October 15, 2026 PHT' : 'October 14, 2026 PHT' }} NBA 5-game slate. Each of the 5 content designs features authentic in-game photography for both teams, official NBA team logos, star player head-to-head metrics, Vegas spreads, and final scores.
          </p>
        </div>

        <!-- Slate Selector & Quick Stats -->
        <div class="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 bg-slate-950/75 border border-slate-800/90 rounded-xl p-3.5">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between gap-4">
            <span>Select Match Slate</span>
            <span class="text-amber-400 font-black">5 Blogs / Slate</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              @click="activeSlate = 'tomorrow'"
              class="px-3.5 py-2 rounded-lg text-left transition-all border text-xs font-bold flex items-center justify-between gap-3"
              :class="activeSlate === 'tomorrow'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-lg'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'"
            >
              <div>
                <div class="font-black">Oct 15 PHT • 5 NBA Match Blogs</div>
                <div class="text-[10px] opacity-80">CHA@BOS • PHX@SAS • NOP@DAL • CHI@MIL • DEN@LAC</div>
              </div>
              <span class="px-2 py-0.5 rounded bg-black/20 text-[10px] font-black">OCT 15</span>
            </button>

            <button
              type="button"
              @click="activeSlate = 'five-game'"
              class="px-3.5 py-2 rounded-lg text-left transition-all border text-xs font-bold flex items-center justify-between gap-3"
              :class="activeSlate === 'five-game'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-lg'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'"
            >
              <div>
                <div class="font-black">Oct 14 PHT • 5-Game Showcase</div>
                <div class="text-[10px] opacity-80">GSW@LAL • IND@OKC • NYK@TOR • CLE@ORL • POR@SAC</div>
              </div>
              <span class="px-2 py-0.5 rounded bg-black/20 text-[10px] font-black">OCT 14</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Jump Navigation Bar for the 5 Prediction Content Designs -->
      <div class="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
          Jump to Prediction Design:
        </span>
        <button
          v-for="item in activePredictions"
          :key="item.id"
          type="button"
          @click="scrollToCard(item.id)"
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-xs font-bold text-slate-200 hover:text-amber-300 transition-all cursor-pointer"
        >
          <span class="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[10px] font-black">
            0{{ item.designNumber }}
          </span>
          <img :src="item.awayTeam.logoUrl" :alt="item.awayTeam.abbr" class="w-4 h-4 object-contain" />
          <span>{{ item.awayTeam.abbr }}</span>
          <span class="text-slate-500">@</span>
          <img :src="item.homeTeam.logoUrl" :alt="item.homeTeam.abbr" class="w-4 h-4 object-contain" />
          <span>{{ item.homeTeam.abbr }}</span>
        </button>
      </div>
    </div>

    <!-- 5 PREDICTION CONTENT DESIGNS SHOWCASE -->
    <div class="space-y-10">
      <article
        v-for="pred in activePredictions"
        :key="pred.id"
        :id="pred.id"
        class="scroll-mt-28 rounded-2xl overflow-hidden bg-[#0c1322] border transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        :class="[
          pred.designNumber === 1 ? 'border-amber-500/45 ring-1 ring-amber-500/20' :
          pred.designNumber === 2 ? 'border-cyan-500/40 ring-1 ring-cyan-500/15' :
          pred.designNumber === 3 ? 'border-indigo-500/40 ring-1 ring-indigo-500/15' :
          pred.designNumber === 4 ? 'border-emerald-500/40 ring-1 ring-emerald-500/15' :
          'border-rose-500/40 ring-1 ring-rose-500/15'
        ]"
      >
        <!-- Top Design Strip Header -->
        <div
          class="px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
          :class="[
            pred.designNumber === 1 ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border-amber-500/30' :
            pred.designNumber === 2 ? 'bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-500/10 border-cyan-500/30' :
            pred.designNumber === 3 ? 'bg-gradient-to-r from-indigo-500/20 via-slate-900 to-indigo-500/10 border-indigo-500/30' :
            pred.designNumber === 4 ? 'bg-gradient-to-r from-emerald-500/20 via-slate-900 to-emerald-500/10 border-emerald-500/30' :
            'bg-gradient-to-r from-rose-500/20 via-slate-900 to-rose-500/10 border-rose-500/30'
          ]"
        >
          <div class="flex flex-wrap items-center gap-2.5">
            <span
              class="px-2.5 py-1 rounded font-black uppercase tracking-wider text-[11px]"
              :class="[
                pred.designNumber === 1 ? 'bg-amber-400 text-slate-950' :
                pred.designNumber === 2 ? 'bg-cyan-400 text-slate-950' :
                pred.designNumber === 3 ? 'bg-indigo-400 text-slate-950' :
                pred.designNumber === 4 ? 'bg-emerald-400 text-slate-950' :
                'bg-rose-400 text-slate-950'
              ]"
            >
              {{ pred.designStyleLabel }}
            </span>
            <span class="font-bold text-slate-200 uppercase tracking-wide">
              {{ pred.matchupBadge }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-slate-300 font-medium">
            <span class="inline-flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-amber-400" />
              {{ pred.tipOffPht }}
            </span>
            <span class="text-slate-600 hidden sm:inline">|</span>
            <span class="inline-flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-cyan-400" />
              {{ pred.venue }}
            </span>
            <span class="text-slate-600 hidden md:inline">|</span>
            <span class="hidden md:inline-flex items-center gap-1.5 text-slate-400">
              <Tv class="w-3.5 h-3.5 text-emerald-400" />
              {{ pred.broadcast }}
            </span>
          </div>
        </div>

        <!-- FEATURED IMAGE SECTION: Dual Real Team Action Photos + Split Featured Showcase -->
        <div class="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-800/90 bg-slate-950">
          <!-- Left Team Real Action Featured Image -->
          <div class="lg:col-span-4 relative group overflow-hidden min-h-[240px] sm:min-h-[270px] border-b lg:border-b-0 lg:border-r border-slate-800/80">
            <img
              :src="pred.awayTeam.realTeamImageUrl"
              :alt="`${pred.awayTeam.name} real NBA preseason game action photo`"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent"></div>

            <!-- Away Team Real Photo Badge -->
            <div class="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-lg px-2.5 py-1.5 shadow-lg">
              <img :src="pred.awayTeam.logoUrl" :alt="pred.awayTeam.name" class="w-6 h-6 object-contain" />
              <div>
                <div class="text-[10px] font-black uppercase tracking-wider text-amber-400">Away Team • Real Game Photo</div>
                <div class="text-xs font-extrabold text-white leading-tight">{{ pred.awayTeam.name }}</div>
              </div>
            </div>

            <!-- Away Star Player Cutout & Caption -->
            <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <div class="space-y-0.5 max-w-[70%]">
                <span class="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-slate-200">
                  {{ pred.awayTeam.preseasonRecord }}
                </span>
                <p class="text-xs font-bold text-white leading-snug drop-shadow">
                  {{ pred.awayTeam.starPlayer.name }} ({{ pred.awayTeam.starPlayer.position }})
                </p>
                <p class="text-[11px] text-amber-300 font-semibold">
                  {{ pred.awayTeam.starPlayer.preseasonAvg }}
                </p>
              </div>
              <img
                :src="pred.awayTeam.starPlayer.headshotUrl"
                :alt="pred.awayTeam.starPlayer.name"
                class="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] bg-slate-900/70 rounded-xl border border-slate-700/70 p-1 shrink-0"
                loading="lazy"
              />
            </div>
          </div>

          <!-- Center Matchup Composite Featured Image & Score Projection Overlay -->
          <div class="lg:col-span-4 relative group overflow-hidden min-h-[240px] sm:min-h-[270px] border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between">
            <img
              :src="pred.featuredImageUrl"
              :alt="`${pred.awayTeam.name} vs ${pred.homeTeam.name} composite featured image`"
              class="absolute inset-0 w-full h-full object-cover object-center opacity-55 group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/65 to-slate-950/95"></div>

            <!-- Top Center Matchup Pill -->
            <div class="relative z-10 p-3.5 flex items-center justify-between">
              <span class="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                Featured Matchup Card #{{ pred.designNumber }}
              </span>
              <span class="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-bold">
                {{ pred.spreadLine }} • {{ pred.overUnderLine }}
              </span>
            </div>

            <!-- Center Projected Scoreboard -->
            <div class="relative z-10 px-4 py-2 my-auto">
              <div class="text-center text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">
                TipOffPh Projected Preseason Final
              </div>
              <div class="flex items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-inner">
                <div class="flex items-center gap-2.5">
                  <img :src="pred.awayTeam.logoUrl" :alt="pred.awayTeam.abbr" class="w-10 h-10 object-contain" />
                  <div>
                    <div class="text-xs font-bold text-slate-300">{{ pred.awayTeam.abbr }}</div>
                    <div
                      class="text-2xl font-black tabular-nums"
                      :class="pred.predictedWinnerAbbr === pred.awayTeam.abbr ? 'text-amber-400' : 'text-white'"
                    >
                      {{ pred.predictedScore.away }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-center">
                  <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    VS
                  </span>
                  <span class="text-[10px] text-emerald-400 font-bold mt-1">
                    {{ pred.confidencePct }}% Conf.
                  </span>
                </div>

                <div class="flex items-center gap-2.5 text-right">
                  <div>
                    <div class="text-xs font-bold text-slate-300">{{ pred.homeTeam.abbr }}</div>
                    <div
                      class="text-2xl font-black tabular-nums"
                      :class="pred.predictedWinnerAbbr === pred.homeTeam.abbr ? 'text-amber-400' : 'text-white'"
                    >
                      {{ pred.predictedScore.home }}
                    </div>
                  </div>
                  <img :src="pred.homeTeam.logoUrl" :alt="pred.homeTeam.abbr" class="w-10 h-10 object-contain" />
                </div>
              </div>
            </div>

            <!-- Win Probability Bar -->
            <div class="relative z-10 p-3.5 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-cyan-300">{{ pred.awayTeam.abbr }} {{ pred.winProbability.away }}% Win Prob</span>
                <span class="text-amber-300">{{ pred.homeTeam.abbr }} {{ pred.winProbability.home }}% Win Prob</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  class="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  :style="{ width: `${pred.winProbability.away}%` }"
                ></div>
                <div
                  class="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  :style="{ width: `${pred.winProbability.home}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Right Team Real Action Featured Image -->
          <div class="lg:col-span-4 relative group overflow-hidden min-h-[240px] sm:min-h-[270px]">
            <img
              :src="pred.homeTeam.realTeamImageUrl"
              :alt="`${pred.homeTeam.name} real NBA preseason game action photo`"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent"></div>

            <!-- Home Team Real Photo Badge -->
            <div class="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-lg px-2.5 py-1.5 shadow-lg">
              <div class="text-right">
                <div class="text-[10px] font-black uppercase tracking-wider text-emerald-400">Home Team • Real Game Photo</div>
                <div class="text-xs font-extrabold text-white leading-tight">{{ pred.homeTeam.name }}</div>
              </div>
              <img :src="pred.homeTeam.logoUrl" :alt="pred.homeTeam.name" class="w-6 h-6 object-contain" />
            </div>

            <!-- Home Star Player Cutout & Caption -->
            <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <img
                :src="pred.homeTeam.starPlayer.headshotUrl"
                :alt="pred.homeTeam.starPlayer.name"
                class="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] bg-slate-900/70 rounded-xl border border-slate-700/70 p-1 shrink-0"
                loading="lazy"
              />
              <div class="space-y-0.5 text-right max-w-[70%]">
                <span class="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-slate-200">
                  {{ pred.homeTeam.preseasonRecord }}
                </span>
                <p class="text-xs font-bold text-white leading-snug drop-shadow">
                  {{ pred.homeTeam.starPlayer.name }} ({{ pred.homeTeam.starPlayer.position }})
                </p>
                <p class="text-[11px] text-emerald-300 font-semibold">
                  {{ pred.homeTeam.starPlayer.preseasonAvg }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- SHORT PREDICTION BLOG CONTENT BODY -->
        <div class="p-5 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left 8 Cols: Short Prediction Blog Narrative -->
          <div class="lg:col-span-8 space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                Short Prediction Blog #0{{ pred.designNumber }}
              </span>
              <span class="text-xs text-slate-400">
                By <strong class="text-slate-200">Rafael Dizon</strong> • Tactical Analyst &amp; NBA Desk
              </span>
            </div>

            <h3 class="text-xl sm:text-2xl font-black text-white leading-snug">
              <NuxtLink :to="`/news/${pred.articleSlug}`" class="hover:text-amber-400 transition-colors">
                {{ pred.blogTitle }}
              </NuxtLink>
            </h3>

            <p class="text-sm sm:text-base font-semibold text-amber-200/90 leading-relaxed bg-amber-500/10 border-l-4 border-amber-400 pl-3.5 py-2 rounded-r-lg">
              {{ pred.shortBlogLead }}
            </p>

            <div v-if="isExpanded(pred.id)" class="space-y-3 text-slate-300 text-sm sm:text-[15px] leading-relaxed">
              <p v-for="(para, pIdx) in pred.shortBlogParagraphs" :key="pIdx">
                {{ para }}
              </p>
            </div>

            <!-- Rotating Post Ad Banner -->
            <AdUnit format="banner" />

            <!-- Action Footer -->
            <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
              <button
                type="button"
                @click="toggleBlogExpand(pred.id)"
                class="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {{ isExpanded(pred.id) ? 'Collapse Short Blog ▲' : 'Expand Short Blog ▼' }}
              </button>

              <NuxtLink
                :to="`/news/${pred.articleSlug}`"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Read Full Prediction Post
                <ArrowUpRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>

          <!-- Right 4 Cols: Tactical Keys & Expert Pick Box -->
          <div class="lg:col-span-4 space-y-4 bg-slate-900/75 border border-slate-800 rounded-xl p-4 sm:p-5">
            <!-- Official Verdict Box -->
            <div class="p-3.5 rounded-lg bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-500/15 border border-amber-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Trophy class="w-3.5 h-3.5" />
                  Expert Pick Verdict
                </span>
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  {{ pred.confidencePct }}% CONFIDENCE
                </span>
              </div>
              <div class="text-base sm:text-lg font-black text-white">
                {{ pred.expertPick }}
              </div>
              <div class="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Moneyline Odds:</span>
                <span class="font-mono font-bold text-amber-300">{{ pred.moneyline }}</span>
              </div>
            </div>

            <!-- 3 Tactical Keys -->
            <div class="space-y-2.5">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Target class="w-3.5 h-3.5 text-cyan-400" />
                3 Key Matchup Factors
              </h4>
              <ul class="space-y-2">
                <li
                  v-for="(keyItem, kIdx) in pred.tacticalKeys"
                  :key="kIdx"
                  class="flex items-start gap-2 text-xs text-slate-300 leading-relaxed"
                >
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{{ keyItem }}</span>
                </li>
              </ul>
            </div>

            <!-- Team Photo Verification Footnote -->
            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span class="inline-flex items-center gap-1">
                <Activity class="w-3.5 h-3.5 text-amber-400" />
                Featured Team Photos:
              </span>
              <span class="font-bold text-slate-200">
                {{ pred.awayTeam.abbr }} &amp; {{ pred.homeTeam.abbr }} Official Action
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
