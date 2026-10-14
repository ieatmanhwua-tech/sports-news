<script setup lang="ts">
import TheHeader from '~/components/TheHeader.vue';
import TheFooter from '~/components/TheFooter.vue';
import BottomNavBar from '~/components/BottomNavBar.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#07090e] text-slate-100 antialiased selection:bg-orange-500/30 selection:text-orange-200 relative overflow-x-hidden">
    <!-- Atmospheric Stadium Background Overlays (Dynamic sports arena aesthetic) -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <!-- 1. Deep Arena Gradient Base -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#080c16] via-[#090d18] to-[#05070c]" />

      <!-- 2. Stadium Floodlight Blooms (Top Left Athletic Orange, Top Right Neon Cyan, Center Indigo Flare) -->
      <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-orange-600/15 blur-[140px]" />
      <div class="absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full bg-cyan-500/15 blur-[150px]" />
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-blue-700/10 blur-[160px]" />
      <div class="absolute bottom-20 right-10 w-[550px] h-[550px] rounded-full bg-amber-500/10 blur-[130px]" />

      <!-- 3. Dynamic Orange & Blue Energy Streaks (Captures 'Live' Energy) -->
      <div class="absolute top-12 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div class="absolute top-14 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent blur-xs" />
      <div class="absolute -top-20 left-1/3 w-[500px] h-40 bg-gradient-to-b from-orange-500/10 to-transparent blur-2xl" />

      <!-- 4. Subtle Athletic Textures: Faint Basketball Court Lines & Net Mesh Grid Overlay -->
      <svg class="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="courtGrid" width="240" height="240" patternUnits="userSpaceOnUse">
            <path d="M 240 0 L 0 0 0 240" fill="none" stroke="#ffffff" stroke-width="1.5" />
            <circle cx="120" cy="120" r="45" fill="none" stroke="#f97316" stroke-width="1.5" />
            <path d="M 0 60 Q 60 120 0 180" fill="none" stroke="#06b6d4" stroke-width="1" />
            <path d="M 240 60 Q 180 120 240 180" fill="none" stroke="#06b6d4" stroke-width="1" />
          </pattern>
          <pattern id="meshNet" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="#38bdf8" opacity="0.3" />
            <path d="M 0 12 L 12 0 L 24 12 L 12 24 Z" fill="none" stroke="#ffffff" stroke-width="0.35" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#meshNet)" />
        <rect width="100%" height="100%" fill="url(#courtGrid)" />
      </svg>

      <!-- 5. Halftone Dot Grid Matrix in Deep Indigo -->
      <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-45" />

      <!-- 6. Arena Crowd Horizon / Low Vignette -->
      <div class="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
    </div>

    <!-- Site Header -->
    <TheHeader class="relative z-40" />

    <!-- Main Content Reading Surface (pb-20 on mobile to clear bottom nav) -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 relative z-10">
      <slot />
    </main>

    <!-- Site Footer -->
    <TheFooter class="relative z-10 pb-16 lg:pb-0" />

    <!-- Thumb-Accessible Mobile Bottom Navigation Bar -->
    <BottomNavBar />
  </div>
</template>
