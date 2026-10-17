<script setup lang="ts">
import { NAVIGATION_GROUPS } from '~/shared/categories';
const tipoffLogo = '/img/TipOffPh_logo.webp';
const tipoffLogoSrcset = '/img/TipOffPh_logo-360w.webp 360w, /img/TipOffPh_logo.webp 540w, /img/TipOffPh_logo-720w.webp 720w';

interface SocialChannel {
  id: string;
  name: string;
  handle: string;
  href: string;
  ariaLabel: string;
}

const OFFICIAL_SOCIAL_LINKS: SocialChannel[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    handle: '@TipOffPH',
    href: 'https://www.facebook.com/TipOffPH',
    ariaLabel: 'Follow TipOff PH on Facebook'
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    handle: '@TipOffPH',
    href: 'https://x.com/TipOffPH',
    ariaLabel: 'Follow TipOff PH on X (formerly Twitter)'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: 'TipOff PH TV',
    href: 'https://www.youtube.com/@TipOffPH',
    ariaLabel: 'Subscribe to TipOff PH on YouTube'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@tipoffph',
    href: 'https://www.instagram.com/tipoffph',
    ariaLabel: 'Follow TipOff PH on Instagram'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@tipoffph',
    href: 'https://www.tiktok.com/@tipoffph',
    ariaLabel: 'Follow TipOff PH on TikTok'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    handle: 't.me/TipOffPH',
    href: 'https://t.me/TipOffPH',
    ariaLabel: 'Join the TipOff PH Telegram Community'
  }
];
</script>

<template>
  <footer
    aria-label="TipOff PH Site Footer and Community Channels"
    class="bg-[#050811] text-slate-200 text-xs border-t-2 border-amber-400/40 shadow-[0_-10px_40px_rgba(0,0,0,0.85)] mt-16 relative"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- High-Contrast Community Engagement & Social Media Banner -->
      <div class="mb-10 pb-8 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="space-y-1.5 max-w-xl">
          <p class="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Join the TipOff PH Basketball Community
          </p>
          <h2 class="text-base sm:text-lg font-extrabold text-white tracking-tight">
            Connect with Filipino Hoops Fans Across Official TipOff PH Channels
          </h2>
          <p class="text-xs text-slate-200 leading-relaxed">
            Get real-time PBA, MPBL, UAAP, NCAA, Gilas Pilipinas, and NBA live score alerts, court-side video highlights, and post-game box score breakdowns.
          </p>
        </div>

        <!-- Official Social Media Icons with High-Contrast Styling & Proper Aria-Labels -->
        <nav aria-label="TipOff PH Official Social Media Links" class="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <a
            v-for="social in OFFICIAL_SOCIAL_LINKS"
            :key="social.id"
            :href="social.href"
            :aria-label="social.ariaLabel"
            :title="`${social.name} (${social.handle})`"
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex items-center gap-2.5 min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-900 text-white border border-slate-600 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050811] transition-all shadow-md"
          >
            <!-- Facebook Official SVG -->
            <svg
              v-if="social.id === 'facebook'"
              aria-hidden="true"
              class="w-5 h-5 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>

            <!-- X (Twitter) Official SVG -->
            <svg
              v-else-if="social.id === 'x'"
              aria-hidden="true"
              class="w-4 h-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>

            <!-- YouTube Official SVG -->
            <svg
              v-else-if="social.id === 'youtube'"
              aria-hidden="true"
              class="w-5 h-5 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>

            <!-- Instagram Official SVG -->
            <svg
              v-else-if="social.id === 'instagram'"
              aria-hidden="true"
              class="w-5 h-5 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>

            <!-- TikTok Official SVG -->
            <svg
              v-else-if="social.id === 'tiktok'"
              aria-hidden="true"
              class="w-4 h-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>

            <!-- Telegram Official SVG -->
            <svg
              v-else-if="social.id === 'telegram'"
              aria-hidden="true"
              class="w-5 h-5 shrink-0 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>

            <span class="font-bold text-xs tracking-tight">{{ social.name }}</span>
          </a>
        </nav>
      </div>

      <!-- Top Category Directory Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        <div v-for="group in NAVIGATION_GROUPS" :key="group.title" class="space-y-3">
          <h3 class="font-extrabold uppercase tracking-wider text-xs border-b border-slate-700 pb-2 text-amber-400">
            {{ group.title }}
          </h3>
          <ul class="space-y-2">
            <li v-for="item in group.items" :key="item.slug">
              <NuxtLink
                :to="`/${item.slug}`"
                class="text-slate-200 hover:text-amber-300 font-medium transition-colors block py-0.5 truncate focus-visible:outline-none focus-visible:underline"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Mid Section: Brand Description & Policies -->
      <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="max-w-md space-y-2.5">
          <NuxtLink
            to="/"
            aria-label="TipOff PH Home - The Philippine Basketball Court"
            class="inline-block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            <img
              :src="tipoffLogo"
              :srcset="tipoffLogoSrcset"
              sizes="(max-width: 640px) 220px, 320px"
              alt="TipOff PH - The Philippine Basketball Court"
              class="h-14 sm:h-16 md:h-20 w-auto max-w-[260px] sm:max-w-[320px] md:max-w-[380px] object-contain brightness-100 group-hover:brightness-110 transition-all drop-shadow-sm"
              width="540"
              height="180"
              loading="lazy"
              decoding="async"
            />
          </NuxtLink>
          <p class="text-xs text-slate-200 leading-relaxed">
            Independent Philippine basketball news, live streams, analysis, scores, and editorial reporting. Covering the Philippine Basketball Association (PBA), MPBL, UAAP, NCAA, Gilas Pilipinas, and NBA broadcasts in Philippine Standard Time (PHT).
          </p>
        </div>

        <!-- Institutional & Publishing Links -->
        <nav aria-label="TipOff PH Institutional and Editorial Links" class="flex flex-wrap gap-x-6 gap-y-2.5 text-xs font-semibold text-slate-100">
          <NuxtLink to="/local-sports" class="text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline">Live Hub &amp; Streams</NuxtLink>
          <NuxtLink to="/about-us" class="hover:text-amber-300 transition-colors">About Us</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-amber-300 transition-colors">Contact Us</NuxtLink>
          <NuxtLink to="/write-for-us" class="hover:text-amber-300 transition-colors">Write For Us</NuxtLink>
          <NuxtLink to="/editorial-policy" class="hover:text-amber-300 transition-colors">Editorial Policy</NuxtLink>
          <NuxtLink to="/corrections-policy" class="hover:text-amber-300 transition-colors">Corrections</NuxtLink>
          <NuxtLink to="/privacy-policy" class="hover:text-amber-300 transition-colors">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-amber-300 transition-colors">Terms of Use</NuxtLink>
          <NuxtLink to="/rss.xml" class="text-amber-400 hover:text-amber-300 font-bold" target="_blank" aria-label="Subscribe to TipOff PH RSS Feed">RSS Feed</NuxtLink>
          <NuxtLink to="/admin" class="text-slate-300 hover:text-white transition-colors">Editorial Desk</NuxtLink>
        </nav>
      </div>

      <!-- Bottom Copyright & Timezone Notice -->
      <div class="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
        <div>
          &copy; 2026 TipOff PH. All rights reserved. Philippine Standard Time (Asia/Manila, UTC+8).
        </div>
        <div class="flex items-center gap-3 text-slate-200 font-medium">
          <span>PBA</span>
          <span aria-hidden="true">·</span>
          <span>MPBL</span>
          <span aria-hidden="true">·</span>
          <span>UAAP &amp; NCAA</span>
          <span aria-hidden="true">·</span>
          <span>Gilas Pilipinas</span>
          <span aria-hidden="true">·</span>
          <span>NBA Live PH</span>
        </div>
      </div>
    </div>
  </footer>
</template>

