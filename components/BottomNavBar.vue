<script setup lang="ts">
import { Home, Tv, Trophy, Calendar, Newspaper } from 'lucide-vue-next';

const route = useRoute();

interface NavItem {
  name: string;
  label: string;
  path: string;
  icon: any;
  badge?: string;
  isLive?: boolean;
}

const navItems: NavItem[] = [
  { name: 'home', label: 'Home', path: '/', icon: Home },
  { name: 'live', label: 'Live', path: '/local-sports', icon: Tv, isLive: true },
  { name: 'scores', label: 'Scores', path: '/scores-and-schedules', icon: Trophy },
  { name: 'schedules', label: 'Schedules', path: '/scores-and-schedules?status=upcoming', icon: Calendar },
  { name: 'news', label: 'News', path: '/latest-news', icon: Newspaper }
];

function isActive(item: NavItem): boolean {
  if (item.name === 'home') {
    return route.path === '/';
  }
  if (item.name === 'schedules') {
    return route.path === '/scores-and-schedules' && route.query.status === 'upcoming';
  }
  if (item.name === 'scores') {
    return route.path === '/scores-and-schedules' && route.query.status !== 'upcoming';
  }
  return route.path.startsWith(item.path);
}
</script>

<template>
  <!-- Fixed Thumb-Accessible Mobile Bottom Navigation Bar (lg:hidden) -->
  <nav 
    class="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#0a0f1d]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.7)] px-2 py-1.5 transition-all"
    aria-label="Mobile Navigation"
  >
    <!-- Top Glowing Accent Line -->
    <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none" />

    <div class="max-w-md mx-auto grid grid-cols-5 items-center">
      <NuxtLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative group"
        :class="isActive(item) 
          ? 'text-orange-400 font-bold' 
          : 'text-slate-400 hover:text-slate-200 font-medium'"
      >
        <!-- Active Background Pill Highlight -->
        <span 
          v-if="isActive(item)" 
          class="absolute inset-0 bg-gradient-to-b from-orange-500/15 to-transparent rounded-xl pointer-events-none border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
        />

        <!-- Icon with optional live pulse dot -->
        <div class="relative mb-0.5">
          <component 
            :is="item.icon" 
            class="w-5 h-5 transition-transform duration-200 group-active:scale-90"
            :class="isActive(item) ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-slate-400'"
          />
          <!-- Live Indicator Dot -->
          <span 
            v-if="item.isLive" 
            class="absolute -top-1 -right-1 flex h-2 w-2"
          >
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
          </span>
        </div>

        <!-- Label -->
        <span class="text-[10px] tracking-tight leading-none">
          {{ item.label }}
        </span>

        <!-- Active Dot under Label -->
        <span 
          v-if="isActive(item)" 
          class="w-1 h-1 rounded-full bg-orange-400 mt-0.5 shadow-[0_0_4px_#f97316]"
        />
      </NuxtLink>
    </div>
  </nav>
</template>
