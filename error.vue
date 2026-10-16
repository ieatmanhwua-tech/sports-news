<script setup lang="ts">
defineProps<{
  error?: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
  };
}>();

const handleClearError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6 font-sans">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
      <div class="text-5xl font-black text-amber-400 font-mono mb-3">
        {{ error?.statusCode || 404 }}
      </div>
      <h1 class="text-xl font-bold text-white mb-2">
        {{ error?.statusMessage || 'Page Not Found' }}
      </h1>
      <p class="text-sm text-slate-400 mb-6">
        {{ error?.message || 'The basketball page you are looking for is unavailable or has moved.' }}
      </p>
      <button
        type="button"
        @click="handleClearError"
        class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm transition-all cursor-pointer"
      >
        Back to TipOffPh Home
      </button>
    </div>
  </div>
</template>
