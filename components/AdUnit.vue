<script setup lang="ts">
withDefaults(defineProps<{
  format?: 'banner' | 'rectangle' | 'leaderboard';
  imageUrl?: string;
  imageAlt?: string;
  linkUrl?: string;
}>(), {
  format: 'rectangle',
  imageAlt: 'Advertisement',
  linkUrl: '#'
});
</script>

<template>
  <div class="my-5 flex flex-col items-center select-none w-full">
    <!-- Subtle, clean FTC/advertising compliance label -->
    <span class="text-[10px] tracking-widest uppercase font-semibold text-slate-400 mb-1.5 px-2">
      ADVERTISEMENT
    </span>

    <!-- Render Actual Ad Image if provided -->
    <a 
      v-if="imageUrl"
      :href="linkUrl"
      class="block overflow-hidden rounded-md shadow-sm border border-slate-200 hover:opacity-95 transition-opacity"
      :class="{
        'w-full max-w-[728px]': format === 'leaderboard',
        'w-full max-w-[300px] h-[250px]': format === 'rectangle',
        'w-full max-w-[320px] h-[50px]': format === 'banner'
      }"
    >
      <img 
        :src="imageUrl" 
        :alt="imageAlt"
        class="w-full block"
        :class="format === 'leaderboard' ? 'h-auto' : 'h-full object-cover'"
        loading="lazy"
      />
    </a>

    <!-- Fallback Placeholder if no image provided -->
    <div 
      v-else
      class="border border-dashed border-slate-300 bg-slate-50/80 rounded flex flex-col items-center justify-center text-slate-400 p-2"
      :class="{
        'w-full max-w-[728px] h-[90px]': format === 'leaderboard',
        'w-full max-w-[300px] h-[250px]': format === 'rectangle',
        'w-full max-w-[320px] h-[50px]': format === 'banner'
      }"
    >
      <span class="text-xs text-slate-400 font-mono">
        {{ format === 'leaderboard' ? '728 × 90 Leaderboard' : format === 'rectangle' ? '300 × 250 Medium Rectangle' : '320 × 50 Mobile Banner' }}
      </span>
    </div>
  </div>
</template>
