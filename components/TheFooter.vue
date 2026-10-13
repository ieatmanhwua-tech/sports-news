<script setup lang="ts">
import { NAVIGATION_GROUPS } from '~/shared/categories';
</script>

<template>
  <footer class="bg-[#10141a] text-slate-400 text-xs border-t border-slate-800 mt-16">
    <!-- Top Category Directory Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        <div v-for="group in NAVIGATION_GROUPS" :key="group.title" class="space-y-3">
          <h4 class="font-bold text-slate-200 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5 text-[#E67E22]">
            {{ group.title }}
          </h4>
          <ul class="space-y-1.5">
            <li v-for="item in group.items" :key="item.slug">
              <NuxtLink 
                :to="`/${item.slug}`"
                class="hover:text-amber-400 transition-colors block py-0.5 truncate"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Mid Section: Brand Description & Policies -->
      <div class="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="max-w-md space-y-2">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded bg-[#E67E22] flex items-center justify-center font-black text-slate-950 text-xs">TP</span>
            <span class="text-base font-black tracking-tight text-white">
              TipOff<span class="text-[#E67E22]">Ph</span>
            </span>
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            Independent Philippine basketball news, analysis, scores, and editorial reporting. Covering the Philippine Basketball Association (PBA), MPBL, UAAP, NCAA, Gilas Pilipinas, and grassroots basketball across the nation.
          </p>
        </div>

        <!-- Institutional & Publishing Links -->
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
          <NuxtLink to="/about-us" class="hover:text-white">About Us</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-white">Contact Us</NuxtLink>
          <NuxtLink to="/write-for-us" class="hover:text-white">Write For Us</NuxtLink>
          <NuxtLink to="/editorial-policy" class="hover:text-white">Editorial Policy</NuxtLink>
          <NuxtLink to="/corrections-policy" class="hover:text-white">Corrections</NuxtLink>
          <NuxtLink to="/privacy-policy" class="hover:text-white">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-white">Terms of Use</NuxtLink>
          <NuxtLink to="/rss.xml" class="hover:text-amber-400 text-amber-500 font-semibold" target="_blank">RSS Feed</NuxtLink>
          <NuxtLink to="/admin" class="hover:text-slate-200 text-slate-500">Editorial Desk</NuxtLink>
        </div>
      </div>

      <!-- Bottom Copyright & Timezone Notice -->
      <div class="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <div>
          &copy; {{ new Date().getFullYear() }} TipOffPh. All rights reserved. Timezone: Asia/Manila (PHT).
        </div>
        <div class="mt-2 sm:mt-0 flex items-center gap-3">
          <span>Targeting Hostinger Managed Node.js (Node 22)</span>
          <span>·</span>
          <span>SSR Enabled</span>
        </div>
      </div>
    </div>
  </footer>
</template>
