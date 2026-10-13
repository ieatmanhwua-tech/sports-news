<script setup lang="ts">
import TheHeader from '~/components/TheHeader.vue';
import TheFooter from '~/components/TheFooter.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-amber-200 selection:text-amber-900">
    <!-- Site Header -->
    <TheHeader />

    <!-- Main Content Reading Surface -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>

    <!-- Site Footer -->
    <TheFooter />
  </div>
</template>
