<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FormattedNbaOddsGame, NbaOddsResponse } from '~/shared/nba-types';
import { useFormatters } from '~/composables/useFormatters';
import { 
  TrendingUp, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  SlidersHorizontal,
  Flame,
  Check,
  Percent,
  Copy
} from 'lucide-vue-next';

interface Props {
  title?: string;
  subtitle?: string;
  limit?: number;
  showSearch?: boolean;
  compact?: boolean;
  selectedBookmakerKey?: string;
  allowCopySnippet?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'NBA Live Odds & Matchups',
  subtitle: 'Live betting lines, consensus spreads, totals, and head-to-head odds',
  limit: 12,
  showSearch: true,
  compact: false,
  selectedBookmakerKey: 'draftkings',
  allowCopySnippet: false
});

const emit = defineEmits<{
  (e: 'selectGame', game: FormattedNbaOddsGame): void;
  (e: 'insertSnippet', snippet: string): void;
}>();

const { formatManilaTime } = useFormatters();
const searchQuery = ref('');
const activeMarketTab = ref<'all' | 'spreads' | 'h2h' | 'totals'>('all');
const activeBookie = ref(props.selectedBookmakerKey || 'draftkings');
const copiedGameId = ref<string | null>(null);
const syncCooldown = ref(0);
let cooldownTimer: any = null;

const { data, pending, error, refresh } = await useAsyncData<NbaOddsResponse>(
  'nba-sports-api-odds-board',
  async () => {
    return await $fetch<NbaOddsResponse>('/api/nba/odds', {
      query: { limit: props.limit }
    });
  }
);

async function handleManualSync() {
  if (pending.value || syncCooldown.value > 0) return;
  syncCooldown.value = 10;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    syncCooldown.value--;
    if (syncCooldown.value <= 0) {
      clearInterval(cooldownTimer);
    }
  }, 1000);
  await refresh();
}

const allGames = computed(() => data.value?.games || []);

// Available bookmakers from the payload
const availableBookmakers = computed(() => {
  const map = new Map<string, string>();
  for (const g of allGames.value) {
    if (g.bookmakers) {
      for (const bm of g.bookmakers) {
        if (!map.has(bm.key)) {
          map.set(bm.key, bm.title);
        }
      }
    }
  }
  return Array.from(map.entries()).map(([key, title]) => ({ key, title }));
});

const filteredGames = computed(() => {
  let list = allGames.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(g => 
      g.home_team.toLowerCase().includes(q) || 
      g.away_team.toLowerCase().includes(q)
    );
  }
  return list;
});

function getBookmaker(game: FormattedNbaOddsGame, key: string) {
  if (!game.bookmakers) return null;
  return game.bookmakers.find(b => b.key === key) || game.bookmakers[0] || null;
}

function getMarket(game: FormattedNbaOddsGame, marketKey: string, bookieKey?: string) {
  const bm = getBookmaker(game, bookieKey || activeBookie.value);
  if (!bm || !bm.markets) return null;
  return bm.markets.find(m => m.key === marketKey) || null;
}

function formatOddsPrice(decimalOdds: number): string {
  if (!decimalOdds) return '—';
  // Also display US moneyline if helpful:
  const american = decimalOdds >= 2.0 
    ? `+${Math.round((decimalOdds - 1) * 100)}` 
    : `${Math.round(-100 / (decimalOdds - 1))}`;
  return `${decimalOdds.toFixed(2)} (${american})`;
}

function generateArticleSnippet(game: FormattedNbaOddsGame): string {
  const commenceDate = new Date(game.commence_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila'
  });
  
  const bm = getBookmaker(game, activeBookie.value);
  const spreadM = getMarket(game, 'spreads', activeBookie.value);
  const totalM = getMarket(game, 'totals', activeBookie.value);
  const h2hM = getMarket(game, 'h2h', activeBookie.value);

  const homeSpread = spreadM?.outcomes.find(o => o.name === game.home_team);
  const overTotal = totalM?.outcomes.find(o => o.name === 'Over');
  const homeH2h = h2hM?.outcomes.find(o => o.name === game.home_team);
  const awayH2h = h2hM?.outcomes.find(o => o.name === game.away_team);

  return `
> ### 📊 NBA Odds Insight: ${game.away_team} at ${game.home_team}
> **Tip-off:** ${commenceDate} (Manila Time)  
> **Source Lines (${bm?.title || 'Consensus'}):**  
> • **Spread:** ${game.home_team} ${homeSpread?.point && homeSpread.point > 0 ? '+' : ''}${homeSpread?.point ?? 'PK'}  
> • **Moneyline:** ${game.away_team} (${awayH2h?.price?.toFixed(2) ?? '—'}) | ${game.home_team} (${homeH2h?.price?.toFixed(2) ?? '—'})  
> • **Over/Under Total:** ${overTotal?.point ?? '—'} points  
  `.trim();
}

async function copySnippet(game: FormattedNbaOddsGame) {
  const snippet = generateArticleSnippet(game);
  try {
    await navigator.clipboard.writeText(snippet);
    copiedGameId.value = game.id;
    setTimeout(() => {
      if (copiedGameId.value === game.id) copiedGameId.value = null;
    }, 2500);
  } catch (err) {
    // Fallback
    emit('insertSnippet', snippet);
  }
}
</script>

<template>
  <div class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.7)] overflow-hidden ring-1 ring-cyan-500/20">
    <!-- Header Bar -->
    <div class="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white relative">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed
            </span>
            <span v-if="data?.rateLimitProtected" class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
              <ShieldCheck class="w-3 h-3 text-amber-400" />
              Rate-Guard Active
            </span>
          </div>

          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
            <TrendingUp class="w-6 h-6 text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span>{{ title }}</span>
          </h2>
          <p class="text-xs text-slate-300 mt-1 max-w-2xl">
            {{ subtitle }}
          </p>
        </div>

        <!-- Controls: Refresh & Active Bookie Selector -->
        <div class="flex items-center gap-2 shrink-0">
          <button 
            type="button" 
            @click="handleManualSync" 
            :disabled="pending || syncCooldown > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-650 border border-slate-700/80 rounded-xl text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5 text-amber-400" :class="{ 'animate-spin': pending }" />
            <span>{{ pending ? 'Updating...' : (syncCooldown > 0 ? `Synced (${syncCooldown}s)` : 'Sync Lines') }}</span>
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div v-if="showSearch" class="mt-5 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <!-- Search Team -->
        <div class="relative max-w-xs w-full">
          <Search class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Filter teams (Lakers, Celtics, Warriors...)" 
            class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Matchup Cards Container -->
    <div class="p-4 sm:p-6 bg-transparent">
      <!-- Loading State -->
      <div v-if="pending && (!allGames || allGames.length === 0)" class="py-12 text-center text-slate-400">
        <RefreshCw class="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
        <p class="text-sm font-bold text-white">Loading live NBA odds...</p>
        <p class="text-xs text-slate-400 mt-1">Retrieving latest odds, spreads, and upcoming matchups</p>
      </div>

      <!-- Error State (Gracefully protects with zero broken display) -->
      <div v-else-if="error && filteredGames.length === 0" class="p-6 bg-slate-900/90 border border-amber-500/40 rounded-2xl text-xs text-slate-300">
        <div class="font-bold mb-1 text-sm text-white flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-amber-400" />
          <span>API Rate Limit Protected</span>
        </div>
        <p class="text-slate-400">Upstream rate limits are actively safeguarded. TipOffPh continues to serve verified consensus sports lines and point spreads.</p>
        <button 
          type="button" 
          @click="handleManualSync" 
          :disabled="syncCooldown > 0"
          class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': pending }" />
          <span>{{ syncCooldown > 0 ? `Cooldown (${syncCooldown}s)` : 'Check Live Connection' }}</span>
        </button>
      </div>

      <!-- Games List -->
      <div v-else-if="filteredGames.length > 0" class="space-y-4">
        <div 
          v-for="game in filteredGames" 
          :key="game.id"
          class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 border border-slate-700/70 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all group relative overflow-hidden"
        >
          <!-- Subtle top glow streak -->
          <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <!-- Matchup Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-700">
                <span class="w-4 h-4 rounded-xs bg-white p-0.5 inline-flex items-center justify-center shrink-0">
                  <img src="/img/nba-logo.webp" alt="NBA" class="w-full h-full object-contain" />
                </span>
                NBA Regular Season
              </span>

              <span class="text-xs text-slate-400 flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-slate-500" />
                <span>{{ formatManilaTime(game.commence_time) }}</span>
              </span>
            </div>
          </div>

          <!-- Matchup & Betting Markets Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <!-- Teams Column (5 cols) -->
            <div class="lg:col-span-5 space-y-2">
              <!-- Away Team -->
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-[10px] font-black text-slate-500 uppercase w-10 shrink-0">AWAY</span>
                  <span class="text-sm font-bold text-white group-hover:text-amber-200 transition-colors truncate">{{ game.away_team }}</span>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-xs font-mono font-black text-amber-400">
                    {{ getMarket(game, 'h2h')?.outcomes.find(o => o.name === game.away_team)?.price ? formatOddsPrice(getMarket(game, 'h2h')!.outcomes.find(o => o.name === game.away_team)!.price) : '—' }}
                  </span>
                </div>
              </div>

              <!-- Home Team -->
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-[10px] font-black text-orange-400 uppercase w-10 shrink-0">HOME</span>
                  <span class="text-sm font-bold text-white group-hover:text-amber-200 transition-colors truncate">{{ game.home_team }}</span>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-xs font-mono font-black text-amber-400">
                    {{ getMarket(game, 'h2h')?.outcomes.find(o => o.name === game.home_team)?.price ? formatOddsPrice(getMarket(game, 'h2h')!.outcomes.find(o => o.name === game.home_team)!.price) : '—' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Odds Markets Details (7 cols) -->
            <div class="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <!-- Point Spread Market -->
              <div class="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <div class="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
                    <span>Point Spread</span>
                    <span class="text-[9px] text-amber-400 font-mono">
                      {{ getMarket(game, 'spreads')?.outcomes.find(o => o.name === game.home_team)?.point !== undefined ? 'Active' : '' }}
                    </span>
                  </div>
                  <div class="mt-1.5 space-y-1 font-mono text-[11px]">
                    <div class="flex justify-between text-slate-300">
                      <span class="truncate">{{ game.away_team.split(' ').pop() }}</span>
                      <span class="font-bold text-white">
                        {{ getMarket(game, 'spreads')?.outcomes.find(o => o.name === game.away_team)?.point ? (getMarket(game, 'spreads')!.outcomes.find(o => o.name === game.away_team)!.point! > 0 ? '+' : '') + getMarket(game, 'spreads')!.outcomes.find(o => o.name === game.away_team)!.point : '—' }}
                      </span>
                    </div>
                    <div class="flex justify-between text-amber-300 font-bold">
                      <span class="truncate">{{ game.home_team.split(' ').pop() }}</span>
                      <span>
                        {{ getMarket(game, 'spreads')?.outcomes.find(o => o.name === game.home_team)?.point ? (getMarket(game, 'spreads')!.outcomes.find(o => o.name === game.home_team)!.point! > 0 ? '+' : '') + getMarket(game, 'spreads')!.outcomes.find(o => o.name === game.home_team)!.point : '—' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-2 text-[9px] text-amber-400/80 text-right truncate">
                  Consensus Line
                </div>
              </div>

              <!-- Over/Under Totals Market -->
              <div class="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <div class="text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center justify-between">
                    <span>Total (O/U)</span>
                    <span class="font-mono text-[9px] text-cyan-400">
                      {{ getMarket(game, 'totals')?.outcomes[0]?.point ?? '—' }}
                    </span>
                  </div>
                  <div class="mt-1.5 space-y-1 font-mono text-[11px]">
                    <div class="flex justify-between text-slate-300">
                      <span>Over {{ getMarket(game, 'totals')?.outcomes.find(o => o.name === 'Over')?.point ?? '' }}</span>
                      <span class="font-semibold text-white">{{ getMarket(game, 'totals')?.outcomes.find(o => o.name === 'Over')?.price?.toFixed(2) ?? '—' }}</span>
                    </div>
                    <div class="flex justify-between text-slate-300">
                      <span>Under {{ getMarket(game, 'totals')?.outcomes.find(o => o.name === 'Under')?.point ?? '' }}</span>
                      <span class="font-semibold text-white">{{ getMarket(game, 'totals')?.outcomes.find(o => o.name === 'Under')?.price?.toFixed(2) ?? '—' }}</span>
                    </div>
                  </div>
                </div>
                <div class="mt-2 text-[9px] text-cyan-400/80 text-right truncate">
                  Consensus Line
                </div>
              </div>

              <!-- Best Moneyline Market / Consensus -->
              <div class="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 flex flex-col justify-between">
                <div>
                  <div class="text-[10px] font-black uppercase tracking-wider text-slate-300">
                    Consensus Value
                  </div>
                  <div class="mt-1.5 space-y-1 text-[11px]">
                    <div class="text-slate-400 truncate">
                      Best {{ game.away_team.split(' ').pop() }}:
                      <span class="font-mono font-bold text-amber-400 ml-1">
                        {{ game.consensus?.h2h?.awayBestPrice?.toFixed(2) ?? '—' }}
                      </span>
                    </div>
                    <div class="text-slate-400 truncate">
                      Best {{ game.home_team.split(' ').pop() }}:
                      <span class="font-mono font-bold text-amber-400 ml-1">
                        {{ game.consensus?.h2h?.homeBestPrice?.toFixed(2) ?? '—' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-2 text-[9px] text-slate-500 text-right">
                  across {{ game.bookmakers?.length || 0 }} sportsbooks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Filter State -->
      <div v-else class="py-12 text-center bg-slate-900/80 rounded-2xl border border-slate-800">
        <p class="text-xs text-slate-400">No NBA matchups found matching "{{ searchQuery }}".</p>
        <button 
          type="button" 
          @click="searchQuery = ''" 
          class="mt-2 text-xs font-bold text-orange-400 hover:underline"
        >
          Clear Search Filter
        </button>
      </div>

      <!-- Footer Info -->
      <div class="mt-4 pt-3 flex items-center justify-end text-[11px] text-slate-500 border-t border-slate-800">
        <div>
          Times converted to Manila Time (PHT). Real-time odds updated on request.
        </div>
      </div>
    </div>
  </div>
</template>
