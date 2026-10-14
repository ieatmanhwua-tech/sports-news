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
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div class="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-sm">
        <RefreshCw class="w-4 h-4 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        <span>Accountability</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
        TipOffPh Corrections Policy
      </h1>
      <p class="mt-2 text-sm text-slate-300">
        Transparency is fundamental to our relationship with basketball fans in the Philippines.
      </p>
    </header>

    <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base ring-1 ring-cyan-500/20">
      <section class="space-y-2">
        <h2 class="text-lg font-black text-white drop-shadow-sm">1. Substantive Corrections</h2>
        <p>
          When a substantive factual error (such as a misspelled player name, erroneous score, incorrect trade detail, or inaccurate date) is identified, we correct the article text immediately.
        </p>
        <p>
          A prominent note is appended to the bottom of the article stating the date, time, and exact nature of the correction, along with an updated <code class="font-mono text-xs bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded border border-slate-700">dateModified</code> timestamp in the schema and article header.
        </p>
      </section>

      <section class="space-y-2 pt-4 border-t border-slate-800">
        <h2 class="text-lg font-black text-white drop-shadow-sm">2. Submitting a Correction Request</h2>
        <p>
          If you believe a published report contains factual errors, please alert our editors immediately at <a href="mailto:editorial@tipoffph.com" class="text-orange-400 underline font-bold">editorial@tipoffph.com</a> or via our <NuxtLink to="/contact" class="text-orange-400 underline font-bold">Contact Page</NuxtLink>. Please cite verifiable source links or documentation.
        </p>
      </section>
    </div>
  </div>
</template>
