<script setup lang="ts">
import { RefreshCw, CheckCircle2 } from 'lucide-vue-next';

useHead({
  title: 'Corrections Policy | TipOffPh',
  meta: [
    { name: 'description', content: 'Our commitment to prompt, transparent factual corrections in TipOffPh Philippine basketball reporting.' }
  ]
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 space-y-6">
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#D35400]">
        <RefreshCw class="w-4 h-4" />
        <span>Accountability</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        TipOffPh Corrections Policy
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        Transparency is fundamental to our relationship with basketball fans in the Philippines.
      </p>
    </header>

    <div class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
      <section class="space-y-2">
        <h2 class="text-lg font-bold text-slate-900">1. Substantive Corrections</h2>
        <p>
          When a substantive factual error (such as a misspelled player name, erroneous score, incorrect trade detail, or inaccurate date) is identified, we correct the article text immediately.
        </p>
        <p>
          A prominent note is appended to the bottom of the article stating the date, time, and exact nature of the correction, along with an updated <code class="font-mono text-xs">dateModified</code> timestamp in the schema and article header.
        </p>
      </section>

      <section class="space-y-2 pt-4 border-t border-slate-100">
        <h2 class="text-lg font-bold text-slate-900">2. Submitting a Correction Request</h2>
        <p>
          If you believe a published report contains factual errors, please alert our editors immediately at <a href="mailto:editorial@tipoffph.com" class="text-[#D35400] underline font-semibold">editorial@tipoffph.com</a> or via our <NuxtLink to="/contact" class="text-[#D35400] underline font-semibold">Contact Page</NuxtLink>. Please cite verifiable source links or documentation.
        </p>
      </section>
    </div>
  </div>
</template>
