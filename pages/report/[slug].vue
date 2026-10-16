<script setup lang="ts">
import LocalSportsHub from '~/components/LocalSportsHub.vue';

const route = useRoute();
const reportSlug = computed(() => String(route.params.slug || '').toLowerCase().replace(/\/+$/, ''));
</script>

<template>
  <div class="max-w-5xl mx-auto py-2 space-y-4">
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">
          Basketball Highlights &amp; Official Box Score Report
        </h1>
        <p class="text-xs text-slate-400 mt-0.5">
          Post-game basketball highlights, quarter-by-quarter box scores, and live streams on TipOff PH.
        </p>
      </div>
    </div>

    <LocalSportsHub initial-league="highlights" :initial-report-slug="reportSlug" :max-items="60" />
  </div>
</template>
