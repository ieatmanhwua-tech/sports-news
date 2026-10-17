<script setup lang="ts">
const route = useRoute();

interface NavItem {
  name: string;
  label: string;
  ariaLabel: string;
  path: string;
  isLive?: boolean;
}

const navItems: NavItem[] = [
  { name: 'home', label: 'Home', ariaLabel: 'Home — NBA and PBA Live Hub', path: '/' },
  { name: 'live', label: 'Live', ariaLabel: 'Watch Live NBA and PBA Streams', path: '/local-sports', isLive: true },
  { name: 'scores', label: 'Scores', ariaLabel: 'Basketball Live Scores and Box Scores', path: '/scores-and-schedules' },
  { name: 'schedules', label: 'Schedules', ariaLabel: 'Upcoming Basketball Schedules in PHT', path: '/scores-and-schedules?status=upcoming' },
  { name: 'news', label: 'News', ariaLabel: 'Latest Philippine Basketball News', path: '/latest-news' }
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
    class="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#0a0f1d]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.7)] px-2 py-1 transition-all"
    aria-label="Mobile Navigation"
  >
    <!-- Top Glowing Accent Line -->
    <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none" />

    <div class="max-w-md mx-auto grid grid-cols-5 items-center">
      <NuxtLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        :aria-label="item.ariaLabel"
        class="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 px-1 rounded-xl transition-all relative group"
        :class="isActive(item) 
          ? 'text-orange-400 font-bold' 
          : 'text-[#cbd5e1] hover:text-white font-medium'"
      >
        <!-- Active Background Pill Highlight -->
        <span 
          v-if="isActive(item)" 
          class="absolute inset-0 bg-gradient-to-b from-orange-500/15 to-transparent rounded-xl pointer-events-none border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
        />

        <!-- Icon with explicit width & height -->
        <div class="relative mb-0.5">
          <svg
            v-if="item.name === 'home'"
            class="w-5 h-5"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <svg
            v-else-if="item.name === 'live'"
            class="w-5 h-5"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
          </svg>
          <svg
            v-else-if="item.name === 'scores'"
            class="w-5 h-5"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
          <svg
            v-else-if="item.name === 'schedules'"
            class="w-5 h-5"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
          </svg>

          <!-- Live Indicator Dot -->
          <span 
            v-if="item.isLive" 
            class="absolute -top-1 -right-1 flex h-2 w-2"
          >
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </div>

        <!-- Label -->
        <span class="text-[11px] tracking-tight leading-none">
          {{ item.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
