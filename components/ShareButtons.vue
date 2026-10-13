<script setup lang="ts">
import { ref } from 'vue';
import { Share2, Check, Copy } from 'lucide-vue-next';

const props = defineProps<{
  title: string;
  url: string;
}>();

const copied = ref(false);

function copyLink() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(props.url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

function shareTwitter() {
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

function shareFacebook() {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <div class="flex items-center gap-2 text-xs">
    <span class="text-slate-500 font-medium mr-1 flex items-center gap-1">
      <Share2 class="w-3.5 h-3.5 text-slate-400" />
      Share:
    </span>

    <button 
      type="button" 
      @click="shareTwitter" 
      class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition-colors"
      aria-label="Share on X"
    >
      X / Twitter
    </button>

    <button 
      type="button" 
      @click="shareFacebook" 
      class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition-colors"
      aria-label="Share on Facebook"
    >
      Facebook
    </button>

    <button 
      type="button" 
      @click="copyLink" 
      class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition-colors flex items-center gap-1"
      aria-label="Copy link"
    >
      <Check v-if="copied" class="w-3 h-3 text-emerald-600" />
      <Copy v-else class="w-3 h-3 text-slate-500" />
      <span>{{ copied ? 'Copied!' : 'Copy Link' }}</span>
    </button>
  </div>
</template>
