<script setup lang="ts">
import { ref } from 'vue';
import { NAVIGATION_GROUPS } from '~/shared/categories';
import tipoffLogo from '~/assets/img/TipOffPh_logo.png';
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Flame, 
  Calendar,
  Sparkles,
  PenSquare,
  TrendingUp,
  Tv
} from 'lucide-vue-next';

const isMobileMenuOpen = ref(false);
const isMoreDropdownOpen = ref(false);
const searchQuery = ref('');
const router = useRouter();

function handleSearch() {
  if (searchQuery.value.trim().length > 0) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    isMobileMenuOpen.value = false;
  }
}

const primaryNav = [
  { name: 'Home', path: '/' },
  { name: 'Latest News', path: '/latest-news' },
  { name: 'PBA', path: '/pba-news' },
  { name: 'MPBL', path: '/mpbl-news' },
  { name: 'UAAP', path: '/uaap-basketball' },
  { name: 'NCAA', path: '/ncaa-philippines' },
  { name: 'Gilas Pilipinas', path: '/gilas-pilipinas' },
  { name: 'PSL', path: '/psl-news' }
];
</script>

<template>
  <header class="sticky top-0 z-50 bg-[#0a0f1d]/90 backdrop-blur-xl text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.7)] border-b border-cyan-500/20">
    <!-- Top Utility Bar (Scores link, date, timezone, search toggle) with stadium gradient accent (Hidden on mobile for sleek clutter-free viewport) -->
    <div class="hidden sm:block border-b border-slate-800/80 text-xs text-slate-400 bg-gradient-to-r from-orange-500/5 via-slate-950/60 to-cyan-500/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center text-slate-300">
            <span class="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            Philippine Basketball Coverage
          </span>
          <span class="hidden md:inline-block text-slate-600" aria-hidden="true">|</span>
          <span class="hidden md:inline-block text-slate-400">Manila Time (PHT)</span>
        </div>

        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- PH Live Sports & Streams with live-event red pulse -->
          <NuxtLink 
            to="/local-sports" 
            class="relative group hover:text-white transition-all flex items-center gap-1.5 font-bold text-white bg-gradient-to-r from-red-600/40 via-red-500/30 to-orange-500/30 hover:from-red-600/70 hover:to-orange-500/60 px-2.5 py-0.5 rounded-full text-[11px] border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.45)] ring-1 ring-red-400/30"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
            </span>
            <Tv class="w-3.5 h-3.5 text-red-300 group-hover:scale-110 transition-transform" />
            <span class="tracking-wide">PH Live Sports &amp; Streams</span>
          </NuxtLink>
          <span class="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>
          <NuxtLink to="/scores-and-schedules" class="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium text-slate-300">
            <Calendar class="w-3.5 h-3.5 text-[#E67E22]" />
            Scores &amp; Schedules
          </NuxtLink>
          <span class="text-slate-600" aria-hidden="true">|</span>
          <NuxtLink to="/nba-odds" class="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-300 font-medium">
            <TrendingUp class="w-3.5 h-3.5 text-amber-400" />
            NBA Odds
          </NuxtLink>
          <span class="text-slate-600 hidden md:inline" aria-hidden="true">|</span>
          <NuxtLink to="/rumors-and-trades" class="hover:text-amber-400 transition-colors hidden md:flex items-center gap-1 text-slate-300">
            <Flame class="w-3.5 h-3.5 text-amber-500" />
            Trade Rumors
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar (Compact height on mobile, roomy on desktop) -->
    <div class="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between min-h-[3.25rem] sm:min-h-[4.5rem] md:min-h-[5.5rem] py-1.5 sm:py-2">
        <!-- Brand Wordmark -->
        <div class="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <NuxtLink to="/" class="group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded py-0.5 shrink-0">
            <img 
              :src="tipoffLogo" 
              alt="TipOffPh - The Philippine Basketball Court" 
              class="h-9 sm:h-13 md:h-16 lg:h-[4.75rem] w-auto max-w-[125px] sm:max-w-[220px] md:max-w-[340px] object-contain transition-transform group-hover:scale-[1.02] drop-shadow-sm"
              width="2172"
              height="724"
            />
            <span class="sr-only">TipOffPh - The Philippine Basketball Court</span>
          </NuxtLink>

          <!-- Desktop Primary Nav -->
          <nav class="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            <NuxtLink 
              v-for="item in primaryNav" 
              :key="item.path" 
              :to="item.path"
              class="px-2.5 py-1.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
              active-class="text-amber-400 bg-slate-800/90 font-bold"
            >
              {{ item.name }}
            </NuxtLink>

            <!-- 'More' Dropdown with grouped secondary categories -->
            <div class="relative" @mouseleave="isMoreDropdownOpen = false">
              <button 
                type="button"
                @click="isMoreDropdownOpen = !isMoreDropdownOpen"
                @mouseenter="isMoreDropdownOpen = true"
                class="px-2.5 py-1.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-500"
                :aria-expanded="isMoreDropdownOpen"
              >
                More Topics
                <ChevronDown class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isMoreDropdownOpen }" />
              </button>

              <!-- Mega Dropdown Menu -->
              <div 
                v-if="isMoreDropdownOpen"
                class="absolute left-0 mt-1 w-[720px] -translate-x-1/3 bg-[#1a202c] border border-slate-700 rounded-lg shadow-2xl p-6 grid grid-cols-3 gap-6 z-50 text-slate-300 animate-in fade-in zoom-in-95 duration-150"
              >
                <div v-for="group in NAVIGATION_GROUPS.slice(0, 3)" :key="group.title" class="space-y-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-[#E67E22] border-b border-slate-700 pb-1.5">
                    {{ group.title }}
                  </h4>
                  <ul class="space-y-1 text-xs">
                    <li v-for="item in group.items" :key="item.slug">
                      <NuxtLink 
                        :to="`/${item.slug}`"
                        @click="isMoreDropdownOpen = false"
                        class="block py-1 px-1.5 rounded hover:bg-slate-700/60 hover:text-amber-400 transition-colors"
                      >
                        {{ item.name }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>

                <!-- Bottom Row of the Mega Menu -->
                <div class="col-span-3 pt-4 border-t border-slate-700/80 grid grid-cols-2 gap-6">
                  <div v-for="group in NAVIGATION_GROUPS.slice(3, 5)" :key="group.title" class="space-y-2">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-slate-700 pb-1">
                      {{ group.title }}
                    </h4>
                    <ul class="grid grid-cols-2 gap-1 text-xs">
                      <li v-for="item in group.items" :key="item.slug">
                        <NuxtLink 
                          :to="`/${item.slug}`"
                          @click="isMoreDropdownOpen = false"
                          class="block py-1 px-1.5 rounded hover:bg-slate-700/60 hover:text-amber-400 transition-colors truncate"
                        >
                          {{ item.name }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <!-- Search Bar and Mobile Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Mobile 'PH Live Sports & Streams' Pill with Red Pulsing Dot -->
          <NuxtLink
            to="/local-sports"
            class="lg:hidden relative inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black text-white bg-gradient-to-r from-red-600/80 to-orange-600/70 border border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.45)] ring-1 ring-red-400/40 shrink-0"
            title="Philippine Live Sports & Streams"
          >
            <span class="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
            </span>
            <span class="hidden sm:inline">PH Live Sports &amp; Streams</span>
            <span class="sm:hidden tracking-tight">PH Live</span>
          </NuxtLink>

          <!-- Desktop Inline Search -->
          <form @submit.prevent="handleSearch" class="hidden sm:flex items-center relative">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search PBA, UAAP, players..."
              class="w-44 lg:w-56 bg-slate-900 border border-slate-700 text-xs text-white rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] placeholder:text-slate-500 transition-all"
            />
            <button type="submit" class="absolute right-2 text-slate-400 hover:text-amber-400" aria-label="Submit search">
              <Search class="w-3.5 h-3.5" />
            </button>
          </form>

          <!-- Mobile Search Toggle Button -->
          <button 
            type="button" 
            @click="isMobileMenuOpen = true"
            class="sm:hidden p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Open search"
          >
            <Search class="w-4 h-4 text-slate-300" />
          </button>

          <!-- Mobile Hamburger Menu Button -->
          <button 
            type="button" 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Toggle navigation menu"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-4 h-4" />
            <X v-else class="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer Navigation -->
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-[#18202c] border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
      <!-- Mobile Search Form -->
      <form @submit.prevent="handleSearch" class="relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search PBA, MPBL, players..."
          class="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-md pl-3 pr-10 py-2 focus:outline-none focus:border-[#E67E22]"
        />
        <button type="submit" class="absolute right-3 top-2.5 text-slate-400">
          <Search class="w-4 h-4" />
        </button>
      </form>

      <!-- Primary Mobile Nav Links -->
      <div class="grid grid-cols-2 gap-2 border-b border-slate-700 pb-4">
        <NuxtLink 
          v-for="item in primaryNav" 
          :key="item.path" 
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded transition-colors"
          active-class="text-amber-400 bg-slate-800 font-bold"
        >
          {{ item.name }}
        </NuxtLink>
      </div>

      <!-- Grouped Secondary Topics in Mobile Accordion -->
      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div v-for="group in NAVIGATION_GROUPS" :key="group.title">
          <div class="text-xs font-bold uppercase text-[#E67E22] tracking-wider mb-1.5">
            {{ group.title }}
          </div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <NuxtLink 
              v-for="item in group.items" 
              :key="item.slug" 
              :to="`/${item.slug}`"
              @click="isMobileMenuOpen = false"
              class="py-1 px-2 text-slate-300 hover:text-white rounded hover:bg-slate-800 truncate"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
