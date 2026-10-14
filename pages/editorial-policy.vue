<script setup lang="ts">
import { ShieldCheck, BookOpen, AlertCircle } from 'lucide-vue-next';

useHead({
  title: 'Editorial Policy & Verification Standards | TipOffPh',
  meta: [
    { name: 'description', content: 'TipOffPh journalistic standards, rumor attribution criteria, fact-checking workflows, and conflicts of interest guidelines.' }
  ]
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 space-y-6">
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div class="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-sm">
        <ShieldCheck class="w-4 h-4 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        <span>Journalistic Integrity</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
        TipOffPh Editorial Policy
      </h1>
      <p class="mt-2 text-sm text-slate-300">
        Our principles of truthfulness, news verification, and transparent attribution in Philippine sports journalism.
      </p>
    </header>

    <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base ring-1 ring-cyan-500/20">
      <section class="space-y-2">
        <h2 class="text-lg font-black text-white drop-shadow-sm">1. Verification and Sourcing</h2>
        <p>
          TipOffPh insists on direct verification for all factual claims, injury reports, game results, and roster decisions. Official announcements from the PBA, MPBL, SBP, UAAP, NCAA, or FIBA are cross-referenced with on-the-record or trusted background sources before publishing.
        </p>
      </section>

      <section class="space-y-2 pt-4 border-t border-slate-800">
        <h2 class="text-lg font-black text-white drop-shadow-sm">2. Clear Distinction of Content Types</h2>
        <p>
          To avoid misleading readers, every piece of content published on TipOffPh carries an explicit content-type classification:
        </p>
        <ul class="list-disc pl-5 space-y-1 text-slate-300 text-sm">
          <li><strong class="text-white">Reported News:</strong> Verified, fact-checked reporting with confirmed sources.</li>
          <li><strong class="text-white">Attributed Rumors:</strong> Trade discussions and contract talks sourced from league insiders, clearly labeled with appropriate disclaimers that paperwork is not yet final.</li>
          <li><strong class="text-white">Editorial / Opinion:</strong> Subjective analysis, tactical columns, and debate essays representing the writer's perspective.</li>
          <li><strong class="text-white">Interviews:</strong> Direct, verbatim or recorded Q&amp;A sessions with athletes and coaches.</li>
        </ul>
      </section>

      <section class="space-y-2 pt-4 border-t border-slate-800">
        <h2 class="text-lg font-black text-white drop-shadow-sm">3. Independence from Commercial Interests</h2>
        <p>
          Our reporters do not accept gifts, financial inducements, or editorial direction from basketball franchises, player agencies, or commercial sponsors that compromise independent reporting. Sponsored content, when present, is prominently designated as such.
        </p>
      </section>
    </div>
  </div>
</template>
