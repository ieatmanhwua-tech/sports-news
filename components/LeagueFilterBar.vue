<script setup lang="ts">
import { computed } from 'vue';
import { Trophy } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  // If modelValue is provided, operates as an interactive filter (emitting update:modelValue).
  // If modelValue is null/undefined, operates as navigation links to /pba-news, /mpbl-news, etc.
  modelValue?: string;
  mode?: 'navigate' | 'filter';
}>(), {
  modelValue: 'all',
  mode: 'navigate'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const route = useRoute();

interface LeagueItem {
  id: string;
  name: string;
  fullName: string;
  path: string;
  logoUrl?: string;
  tag: string;
}

const leagues: LeagueItem[] = [
  {
    id: 'pba',
    name: 'PBA',
    fullName: 'Philippine Basketball Association',
    path: '/pba',
    logoUrl: '/img/pba.png',
    tag: 'PRO'
  },
  {
    id: 'mpbl',
    name: 'MPBL',
    fullName: 'Maharlika Pilipinas Basketball League',
    path: '/mpbl',
    logoUrl: '/img/mpbl.png',
    tag: 'REGIONAL'
  },
  {
    id: 'uaap',
    name: 'UAAP',
    fullName: 'University Athletic Association of the Philippines',
    path: '/uaap',
    logoUrl: '/img/uaap.webp',
    tag: 'COLLEGE'
  },
  {
    id: 'ncaa',
    name: 'NCAA',
    fullName: 'NCAA Philippines Basketball',
    path: '/ncaa',
    logoUrl: '/img/ncaa.png',
    tag: 'COLLEGE'
  },
  {
    id: 'gilas',
    name: 'Gilas Pilipinas',
    fullName: 'National Team & FIBA Qualifiers',
    path: '/gilas',
    logoUrl: '/img/gilas-pilipinas.png',
    tag: 'NATIONAL'
  },
  {
    id: 'psl',
    name: 'PSL',
    fullName: 'Pilipinas Super League',
    path: '/psl',
    logoUrl: '/img/PSL_Logo.png',
    tag: 'REGIONAL'
  },
  {
    id: 'd-league',
    name: 'PBA D-League',
    fullName: 'PBA Developmental League',
    path: '/d-league',
    logoUrl: '/img/PBA_D-League_logo.png',
    tag: 'LOCAL'
  },
  {
    id: 'vismin',
    name: 'VisMin Cup',
    fullName: 'Pilipinas VisMin Super Cup',
    path: '/vismin',
    logoUrl: '/img/vismin-cup.png',
    tag: 'REGIONAL'
  },
  {
    id: 'nbl',
    name: 'NBL',
    fullName: 'National Basketball League Pilipinas',
    path: '/nbl',
    logoUrl: '/img/nbl.jpg',
    tag: 'REGIONAL'
  },
  {
    id: 'easl',
    name: 'EASL',
    fullName: 'East Asia Super League',
    path: '/easl',
    logoUrl: '/img/easl-logo.svg',
    tag: 'SUPER LEAGUE'
  },
  {
    id: 'nba',
    name: 'NBA',
    fullName: 'National Basketball Association',
    path: '/nba',
    logoUrl: '/img/nba-logo.webp',
    tag: 'GLOBAL'
  },
  {
    id: 'fiba',
    name: 'FIBA',
    fullName: 'FIBA Tournaments & Qualifiers',
    path: '/fiba',
    logoUrl: '/img/FIBA.webp',
    tag: 'GLOBAL'
  }
];

function isLeagueActive(league: LeagueItem): boolean {
  if (props.mode === 'filter') {
    return props.modelValue === league.id;
  }
  return route.path === league.path || route.params.category === league.id;
}

function selectLeague(league: LeagueItem) {
  if (props.mode === 'filter') {
    emit('update:modelValue', league.id);
    emit('change', league.id);
  }
}
</script>

<template>
  <nav 
    class="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5 shadow-sm my-4 overflow-hidden flex items-center relative" 
    aria-label="Browse by League"
  >
    <!-- Left Static Fixed Label: LEAGUES (Do not remove) -->
    <div class="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800 pl-2 sm:pl-3 pr-3 sm:pr-4 border-r border-slate-200 shrink-0 z-20 bg-white">
      <Trophy class="w-4 h-4 text-[#E67E22] shrink-0" />
      <span>Leagues</span>
    </div>

    <!-- Infinite Marquee Viewport from Right to Left -->
    <div class="relative flex-1 overflow-hidden marquee-mask">
      <div class="marquee-track flex items-center gap-6 sm:gap-8 hover:pause">
        <!-- Track 1 (Original set) -->
        <div class="flex items-center gap-6 sm:gap-8 shrink-0 py-1">
          <template v-for="league in leagues" :key="'t1-' + league.id">
            <!-- Filter Mode Button -->
            <button
              v-if="mode === 'filter'"
              type="button"
              @click="selectLeague(league)"
              :title="league.fullName"
              class="group relative flex items-center justify-center px-2.5 py-1 rounded-md transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              :class="isLeagueActive(league)
                ? 'bg-amber-50 ring-2 ring-amber-500 shadow-sm' 
                : 'hover:bg-slate-100/80'"
            >
              <img 
                v-if="league.logoUrl" 
                :src="league.logoUrl" 
                :alt="league.name + ' Logo'"
                class="h-7 sm:h-8 max-w-[65px] sm:max-w-[85px] object-contain transition-transform duration-300 group-hover:scale-110"
                loading="eager"
              />
              <span 
                v-else 
                class="text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-800 group-hover:bg-slate-200"
              >
                {{ league.name }}
              </span>
            </button>

            <!-- Navigation Mode Link -->
            <NuxtLink
              v-else
              :to="league.path"
              :title="league.fullName"
              class="group relative flex items-center justify-center px-2.5 py-1 rounded-md transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              :class="isLeagueActive(league) 
                ? 'bg-amber-50 ring-2 ring-amber-500 shadow-sm' 
                : 'hover:bg-slate-100/80'"
            >
              <img 
                v-if="league.logoUrl" 
                :src="league.logoUrl" 
                :alt="league.name + ' Logo'"
                class="h-7 sm:h-8 max-w-[65px] sm:max-w-[85px] object-contain transition-transform duration-300 group-hover:scale-110"
                loading="eager"
              />
              <span 
                v-else 
                class="text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-800 group-hover:bg-slate-200"
              >
                {{ league.name }}
              </span>
            </NuxtLink>
          </template>
        </div>

        <!-- Track 2 (Duplicate set for seamless infinite loop) -->
        <div class="flex items-center gap-6 sm:gap-8 shrink-0 py-1" aria-hidden="true">
          <template v-for="league in leagues" :key="'t2-' + league.id">
            <!-- Filter Mode Button -->
            <button
              v-if="mode === 'filter'"
              type="button"
              tabindex="-1"
              @click="selectLeague(league)"
              :title="league.fullName"
              class="group relative flex items-center justify-center px-2.5 py-1 rounded-md transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              :class="isLeagueActive(league)
                ? 'bg-amber-50 ring-2 ring-amber-500 shadow-sm' 
                : 'hover:bg-slate-100/80'"
            >
              <img 
                v-if="league.logoUrl" 
                :src="league.logoUrl" 
                :alt="league.name + ' Logo'"
                class="h-7 sm:h-8 max-w-[65px] sm:max-w-[85px] object-contain transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <span 
                v-else 
                class="text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-800 group-hover:bg-slate-200"
              >
                {{ league.name }}
              </span>
            </button>

            <!-- Navigation Mode Link -->
            <NuxtLink
              v-else
              :to="league.path"
              tabindex="-1"
              :title="league.fullName"
              class="group relative flex items-center justify-center px-2.5 py-1 rounded-md transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              :class="isLeagueActive(league) 
                ? 'bg-amber-50 ring-2 ring-amber-500 shadow-sm' 
                : 'hover:bg-slate-100/80'"
            >
              <img 
                v-if="league.logoUrl" 
                :src="league.logoUrl" 
                :alt="league.name + ' Logo'"
                class="h-7 sm:h-8 max-w-[65px] sm:max-w-[85px] object-contain transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <span 
                v-else 
                class="text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-800 group-hover:bg-slate-200"
              >
                {{ league.name }}
              </span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Infinite continuous marquee from right to left */
@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 38s linear infinite;
}

/* Pause marquee seamlessly on hover so users can easily click logos */
.hover\:pause:hover {
  animation-play-state: paused;
}

/* Soft gradient edge fade on the right and left boundary */
.marquee-mask {
  mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
}
</style>
