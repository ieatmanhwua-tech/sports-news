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
  linkUrl: '#',
  intervalMs: 5000
});

interface AdSlide {
  src: string;
  alt: string;
  href: string;
  bannerId?: string;
  bannerSize?: string;
}

const activeSlideIdx = ref(0);
let rotationTimer: ReturnType<typeof setInterval> | null = null;

const KADARIO_URL = 'https://kadario.com/';

const adSlides = computed<AdSlide[]>(() => {
  const defaultHref = props.linkUrl || '#';

  if (props.format === 'rectangle') {
    const primaryCustom = props.imageUrl && !props.imageUrl.includes('kadario-live-score-mobile');
    if (primaryCustom) {
      return [
        {
          src: props.imageUrl!,
          alt: props.imageAlt !== 'Advertisement' ? props.imageAlt : 'NBA Back-to-Back Boost — ByBet PH',
          href: defaultHref
        },
        {
          src: kadarioRectangleImg,
          alt: 'Kadario Live Scores — Basketball & Football (300x250)',
          href: KADARIO_URL,
          bannerId: 'kadario-live-score-mobile.png',
          bannerSize: '300x250'
        }
      ];
    }
    return [
      {
        src: kadarioRectangleImg,
        alt: 'Kadario Live Scores — Basketball & Football (300x250)',
        href: KADARIO_URL,
        bannerId: 'kadario-live-score-mobile.png',
        bannerSize: '300x250'
      },
      {
        src: '/img/nba-back-to-back-boost.webp',
        alt: 'NBA Back-to-Back Boost — ByBet PH',
        href: defaultHref
      }
    ];
  }

  if (props.format === 'leaderboard') {
    const primaryCustom = props.imageUrl && !props.imageUrl.includes('kadario-live-score');
    return [
      {
        src: primaryCustom ? props.imageUrl! : '/img/exclusive-vip-rewards.webp',
        alt: props.imageAlt !== 'Advertisement' ? props.imageAlt : 'Exclusive VIP Sports Rebate — ByBet PH',
        href: defaultHref
      },
      {
        src: kadarioBannerImg,
        alt: 'Kadario Live Scores — Basketball & Football Banner',
        href: KADARIO_URL,
        bannerId: 'kadario-live-score.png',
        bannerSize: '320x50'
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
      bannerSize: '320x50'
    },
    {
      src: secondaryBanner,
      alt: props.imageAlt !== 'Advertisement' ? props.imageAlt : 'Exclusive VIP Sports Rebate — ByBet PH',
      href: defaultHref
    }
  ];
});

const currentSlide = computed<AdSlide>(() => {
  const list = adSlides.value;
  return list[activeSlideIdx.value % list.length] || list[0]!;
});

function trackKadarioEvent(action: 'impression' | 'click', slide: AdSlide | undefined) {
  if (!slide?.bannerId || typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', action === 'click' ? 'kadario_banner_click' : 'kadario_banner_impression', {
    event_category: 'advertisement',
    event_label: slide.bannerId,
    banner_name: slide.bannerId,
    banner_size: slide.bannerSize || props.format,
    ad_format: props.format,
    destination_url: slide.href,
    link_url: slide.href,
    link_domain: 'kadario.com',
    outbound: true,
    transport_type: 'beacon'
  });
}

function handleAdClick(slide: AdSlide) {
  trackKadarioEvent('click', slide);
}

watch(
  () => currentSlide.value,
  (slide) => {
    trackKadarioEvent('impression', slide);
  }
);

onMounted(() => {
  trackKadarioEvent('impression', currentSlide.value);
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

