<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import kadarioRectangleImg from '~/assets/img/kadario-live-score-mobile.png';
import kadarioBannerImg from '~/assets/img/kadario-live-score.png';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const props = withDefaults(defineProps<{
  format?: 'banner' | 'rectangle' | 'leaderboard';
  imageUrl?: string;
  imageAlt?: string;
  linkUrl?: string;
  intervalMs?: number;
}>(), {
  format: 'rectangle',
  imageAlt: 'Advertisement',
  linkUrl: 'https://tipoff.bybetcasino.ph/c6Yv/',
  intervalMs: 5000
});

interface AdSlide {
  src: string;
  alt: string;
  href: string;
  bannerId?: string;
  bannerSize?: string;
  brand?: 'kadario' | 'bybet';
}

const activeSlideIdx = ref(0);
let rotationTimer: ReturnType<typeof setInterval> | null = null;

const KADARIO_URL = 'https://kadario.com/';
const BYBET_URL = 'https://tipoff.bybetcasino.ph/c6Yv/';

function resolveHrefForImage(src: string, fallbackUrl?: string): string {
  if (
    src.includes('exclusive-vip-rewards.webp') ||
    src.includes('nba-back-to-back-boost.webp')
  ) {
    return BYBET_URL;
  }
  if (!fallbackUrl || fallbackUrl === '#') {
    return BYBET_URL;
  }
  return fallbackUrl;
}

function resolveBannerId(src: string): string | undefined {
  if (src.includes('exclusive-vip-rewards.webp')) return 'exclusive-vip-rewards.webp';
  if (src.includes('nba-back-to-back-boost.webp')) return 'nba-back-to-back-boost.webp';
  return undefined;
}

const adSlides = computed<AdSlide[]>(() => {
  if (props.format === 'rectangle') {
    const primaryCustom = props.imageUrl && !props.imageUrl.includes('kadario-live-score-mobile');
    if (primaryCustom) {
      const customSrc = props.imageUrl!;
      return [
        {
          src: customSrc,
          alt: props.imageAlt !== 'Advertisement' ? props.imageAlt : 'NBA Back-to-Back Boost — ByBet PH',
          href: resolveHrefForImage(customSrc, props.linkUrl),
          bannerId: resolveBannerId(customSrc),
          bannerSize: '300x250',
          brand: 'bybet'
        },
        {
          src: kadarioRectangleImg,
          alt: 'Kadario Live Scores — Basketball & Football (300x250)',
          href: KADARIO_URL,
          bannerId: 'kadario-live-score-mobile.png',
          bannerSize: '300x250',
          brand: 'kadario'
        }
      ];
    }
    return [
      {
        src: kadarioRectangleImg,
        alt: 'Kadario Live Scores — Basketball & Football (300x250)',
        href: KADARIO_URL,
        bannerId: 'kadario-live-score-mobile.png',
        bannerSize: '300x250',
        brand: 'kadario'
      },
      {
        src: '/img/nba-back-to-back-boost.webp',
        alt: 'NBA Back-to-Back Boost — ByBet PH',
        href: BYBET_URL,
        bannerId: 'nba-back-to-back-boost.webp',
        bannerSize: '300x250',
        brand: 'bybet'
      }
    ];
  }

  if (props.format === 'leaderboard') {
    const primaryCustom = props.imageUrl && !props.imageUrl.includes('kadario-live-score');
    const primarySrc = primaryCustom ? props.imageUrl! : '/img/exclusive-vip-rewards.webp';
    return [
      {
        src: primarySrc,
        alt: props.imageAlt !== 'Advertisement' ? props.imageAlt : 'Exclusive VIP Sports Rebate — ByBet PH',
        href: resolveHrefForImage(primarySrc, props.linkUrl),
        bannerId: resolveBannerId(primarySrc),
        bannerSize: '728x90',
        brand: 'bybet'
      },
      {
        src: kadarioBannerImg,
        alt: 'Kadario Live Scores — Basketball & Football Banner',
        href: KADARIO_URL,
        bannerId: 'kadario-live-score.png',
        bannerSize: '320x50',
        brand: 'kadario'
      }
    ];
  }

  // format === 'banner' (320x50 / in-post horizontal banner)
  const secondaryBanner =
    props.imageUrl && !props.imageUrl.includes('kadario-live-score')
      ? props.imageUrl
      : '/img/exclusive-vip-rewards.webp';

  return [
    {
      src: kadarioBannerImg,
      alt: 'Kadario Live Scores — Basketball & Football (320x50 Banner)',
      href: KADARIO_URL,
      bannerId: 'kadario-live-score.png',
      bannerSize: '320x50',
      brand: 'kadario'
    },
    {
      src: secondaryBanner,
      alt: props.imageAlt !== 'Advertisement' ? props.imageAlt : 'Exclusive VIP Sports Rebate — ByBet PH',
      href: resolveHrefForImage(secondaryBanner, props.linkUrl),
      bannerId: resolveBannerId(secondaryBanner),
      bannerSize: '320x50',
      brand: 'bybet'
    }
  ];
});

const currentSlide = computed<AdSlide>(() => {
  const list = adSlides.value;
  return list[activeSlideIdx.value % list.length] || list[0]!;
});

function trackAdEvent(action: 'impression' | 'click', slide: AdSlide | undefined) {
  if (!slide?.bannerId || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  const eventPrefix = slide.brand === 'bybet' ? 'bybet_banner' : 'kadario_banner';
  const linkDomain = slide.brand === 'bybet' ? 'tipoff.bybetcasino.ph' : 'kadario.com';
  window.gtag('event', `${eventPrefix}_${action}`, {
    event_category: 'advertisement',
    event_label: slide.bannerId,
    banner_name: slide.bannerId,
    banner_size: slide.bannerSize || props.format,
    ad_format: props.format,
    destination_url: slide.href,
    link_url: slide.href,
    link_domain: linkDomain,
    outbound: true,
    transport_type: 'beacon'
  });
}

function handleAdClick(slide: AdSlide) {
  trackAdEvent('click', slide);
}

watch(
  () => currentSlide.value,
  (slide) => {
    trackAdEvent('impression', slide);
  }
);

onMounted(() => {
  trackAdEvent('impression', currentSlide.value);
  if (adSlides.value.length > 1) {
    rotationTimer = setInterval(() => {
      activeSlideIdx.value = (activeSlideIdx.value + 1) % adSlides.value.length;
    }, props.intervalMs);
  }
});

onUnmounted(() => {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
});
</script>

<template>
  <div class="my-5 flex flex-col items-center select-none w-full">
    <!-- Subtle, clean FTC/advertising compliance label + rotation indicator -->
    <div class="flex items-center justify-center gap-2 mb-1.5 px-2">
      <span class="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
        ADVERTISEMENT
      </span>
      <div v-if="adSlides.length > 1" class="flex items-center gap-1" aria-label="Ad banner rotation indicator">
        <button
          v-for="(slide, idx) in adSlides"
          :key="slide.src"
          type="button"
          @click="activeSlideIdx = idx"
          class="w-1.5 h-1.5 rounded-full transition-all cursor-pointer"
          :class="activeSlideIdx === idx ? 'bg-amber-400 w-3' : 'bg-slate-600 hover:bg-slate-400'"
          :aria-label="`Show banner ${idx + 1}`"
        />
      </div>
    </div>

    <!-- Render Rotating Ad Image -->
    <a 
      v-if="currentSlide"
      :href="currentSlide.href"
      :target="currentSlide.href.startsWith('http') ? '_blank' : undefined"
      :rel="currentSlide.href.startsWith('http') ? 'noopener noreferrer' : undefined"
      @click="handleAdClick(currentSlide)"
      class="relative block overflow-hidden rounded-xl shadow-md border border-slate-700/80 bg-slate-950 hover:opacity-95 transition-all"
      :class="{
        'w-full max-w-[728px]': format === 'leaderboard',
        'w-full max-w-[300px] h-[250px]': format === 'rectangle',
        'w-full max-w-[320px] sm:max-w-[640px] min-h-[50px]': format === 'banner'
      }"
    >
      <img 
        :key="currentSlide.src"
        :src="currentSlide.src" 
        :alt="currentSlide.alt"
        class="w-full block transition-opacity duration-500"
        :class="format === 'rectangle' ? 'h-full object-cover' : 'h-auto object-contain'"
        loading="lazy"
      />
    </a>
  </div>
</template>

