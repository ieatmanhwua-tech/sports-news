<script setup lang="ts">
const config = useRuntimeConfig();

useHead({
  htmlAttrs: {
    lang: 'en-PH'
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | TipOffPh` : 'TipOffPh - Philippine Basketball News & Updates';
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Independent Philippine basketball news publication covering PBA, MPBL, UAAP, NCAA, Gilas Pilipinas, PSL, scores, and grassroots hoops.' },
    { property: 'og:site_name', content: 'TipOffPh' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  link: [
    { rel: 'alternate', type: 'application/rss+xml', title: 'TipOffPh RSS Feed', href: '/rss.xml' }
  ]
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
