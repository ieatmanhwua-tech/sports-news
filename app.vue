<script setup lang="ts">
// 1. Built-In /c6Yv/ Redirect Handler (Client-Side Fallback) at the very top of the script on page load
if (typeof window !== 'undefined') {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '');
  if (
    normalizedPath === '/c6Yv' ||
    normalizedPath.toLowerCase() === '/c6yv' ||
    window.location.search.includes('go=c6Yv')
  ) {
    window.location.replace('https://bybet.com/p/c6Yv');
  }
}

const route = useRoute();

if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => {
      const normalizedPath = window.location.pathname.replace(/\/+$/, '');
      if (
        normalizedPath === '/c6Yv' ||
        normalizedPath.toLowerCase() === '/c6yv' ||
        window.location.search.includes('go=c6Yv')
      ) {
        window.location.replace('https://bybet.com/p/c6Yv');
      }
    },
    { immediate: true }
  );
}

useHead({
  htmlAttrs: {
    lang: 'en-PH'
  },
  titleTemplate: (titleChunk) => {
    if (!titleChunk) return 'NBA Live Today: Scores, Streams & Schedule | TipOff PH';
    return titleChunk.includes('TipOff') ? titleChunk : `${titleChunk} | TipOff PH`;
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'google-site-verification', content: 'LJKRQV9a1yzDsMsgiVruS6CzH8zNhSRjVzF8Jxm3bPU' },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'googlebot', content: 'index, follow' },
    {
      name: 'description',
      content: 'Watch NBA live today with real-time PBA, MPBL, UAAP, and NCAA basketball scores, PHT game schedules, and post-game box score recaps on TipOff PH.'
    },
    { property: 'og:site_name', content: 'TipOff Bybet PH' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'en_PH' },
    { property: 'og:image', content: 'https://tipoff.bybetcasino.ph/img/TipOffPh_logo.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'theme-color', content: '#0f172a' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/img/TipOffPh_logo.png' },
    { rel: 'apple-touch-icon', href: '/img/TipOffPh_logo.png' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'TipOff PH RSS Feed', href: 'https://tipoff.bybetcasino.ph/rss.xml' }
  ]
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
