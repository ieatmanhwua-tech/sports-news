<script setup lang="ts">
import LocalSportsHub from '~/components/LocalSportsHub.vue';
import { PRE_RENDERED_INITIAL_MATCHES } from '~/shared/seo-routing';
</script>

<template>
  <div class="max-w-5xl mx-auto py-1 sm:py-2 space-y-3 sm:space-y-4">
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-lg sm:text-2xl font-black tracking-tight text-white leading-snug">
          NBA &amp; PBA Live Today: Scores, Streams &amp; Schedule
        </h1>
        <p class="text-xs text-[#cbd5e1] mt-0.5 leading-relaxed">
          Real-time scores, match schedules in PHT, and live video broadcasts. Select any match below to watch its stream or view its box score report.
        </p>
      </div>
    </div>

    <LocalSportsHub :max-items="60" :initial-matches="PRE_RENDERED_INITIAL_MATCHES" />
  </div>
</template>
