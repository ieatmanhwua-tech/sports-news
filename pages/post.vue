<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/admin/post', { redirectCode: 302 });
    }
  ]
});

// Immediate client-side fallback redirect
if (import.meta.client) {
  navigateTo('/admin/post');
}
</script>

<template>
  <div class="min-h-[50vh] flex items-center justify-center">
    <div class="text-xs text-slate-500 font-medium">
      Redirecting to TipOffPh Editorial Desk...
    </div>
  </div>
</template>
