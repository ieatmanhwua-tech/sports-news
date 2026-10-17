<script setup lang="ts">
import LocalSportsHub from '~/components/LocalSportsHub.vue';
import { PRE_RENDERED_INITIAL_MATCHES } from '~/shared/seo-routing';

const route = useRoute();
const predictionSlug = computed(() => String(route.params.slug || '').toLowerCase().replace(/\/+$/, ''));
</script>

<template>
  <div class="max-w-5xl mx-auto py-2 space-y-4">
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">
          Basketball Prediction, Betting Tale of the Tape &amp; Picks Today
        </h1>
        <p class="text-xs text-[#cbd5e1] mt-0.5">
          Pre-game basketball predictions, win probabilities, spreads, and over/under totals on TipOff PH.
        </p>
      </div>
    </div>

    <LocalSportsHub initial-league="predictions" :initial-prediction-slug="predictionSlug" :max-items="60" :initial-matches="PRE_RENDERED_INITIAL_MATCHES" />
  </div>
</template>
